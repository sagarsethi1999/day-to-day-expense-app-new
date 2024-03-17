// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');
const sequelize = require('../util/database');
const AWS = require('aws-sdk');
const DownloadedFile = require('../models/downloadedFile');
require('dotenv').config();




function uploadToS3(data, filename) {

  const BUCKET_NAME = 'expensetrackingappbysagar';
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
  });


  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: 'public-read'
  }

  return new Promise((resolve, reject) => {

    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log('something went wrong!!!', err);
        reject(err);
      }
      else {
        console.log('success', s3response);
        resolve(s3response.Location);
      }


    })
  })
}

router.get('/download', verifyToken, async (req, res) => {
  console.log("Hello")
  const userId = req.user.id;
  console.log(userId);
  try {
    // Assuming you have a Sequelize model for expenses
    const expenses = await Expense.findAll({
      where: {
        userId: userId // Filter expenses by user ID
      }
    });
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expense${userId}/${new Date()}.txt`;
    const fileURL = await uploadToS3(stringifiedExpenses, filename);
    await DownloadedFile.create({
      userId: userId,
      fileURL: fileURL
    });
    res.status(200).json({ fileURL, success: true });
    // res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/downloaded-files', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Fetch downloaded files for the user
    const downloadedFiles = await DownloadedFile.findAll({
      where: { userId: userId },
      attributes: ['fileURL', 'createdAt'] // Include only fileURL and createdAt fields
    });
    res.json(downloadedFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Middleware to verify JWT token
// const verifyToken = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) return res.status(401).send('Unauthorized');

//   jwt.verify(token, 'secret_key', (err, user) => {
//       if (err) return res.status(403).send('Forbidden');
//       req.user = user;
//       next();
//   });
// };



// Route to handle adding an expense
router.post('/', verifyToken, async (req, res) => {
  const { ExpenseAmount, Description, Category } = req.body;
  const userID = req.user.id; // Extract userID from token

  const transaction = await sequelize.transaction();
  try {
    // Start a transaction


    // Create new expense with userID
    const newExpense = await Expense.create(
      { ExpenseAmount, Description, Category, userID },
      { transaction }
    );
    console.log('Expense added:', newExpense);

    // Find the user by userID
    const user = await User.findByPk(userID, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // Increment the totalExpense of the user by the new expense amount
    user.totalExpense += parseInt(ExpenseAmount);
    // Save only the 'totalExpense' field of the user
    await user.save({ fields: ['totalExpense'], transaction });

    // Commit the transaction
    await transaction.commit();

    // Send success response
    res.status(200).json({ message: 'Expense added successfully', newExpense });
  } catch (error) {
    console.error('Error:', error);
    // Rollback the transaction if an error occurs
    await transaction.rollback();
    res.status(500).json({ message: 'Internal server error' });
  }
});






// // Route to handle retrieving all expenses
// router.get('/', verifyToken, async (req, res) => {
//   const userId = req.user.id; // Extract the user ID from the verified token payload
//   try {
//     // Assuming you have a Sequelize model for expenses
//     const expenses = await Expense.findAll({
//       where: {
//         userId: userId // Filter expenses by user ID
//       }
//     });
//     res.json(expenses);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 10; 

  try {
    const offset = (page - 1) * limit;
    const expenses = await Expense.findAndCountAll({
      where: {
        userId: userId
      },
      limit: limit,
      offset: offset
    });

    const totalPages = Math.ceil(expenses.count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.json({
      expenses: expenses.rows,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




router.delete('/:id', verifyToken, async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  const t = await sequelize.transaction();

  try {
    // Find the expense to be deleted
    const deletedExpense = await Expense.findByPk(expenseId, { transaction: t });
    if (!deletedExpense) {
      await t.rollback();
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Calculate the amount to subtract from the user's totalExpense
    const amountToDelete = deletedExpense.ExpenseAmount;

    // Delete the expense
    await Expense.destroy({
      where: {
        id: expenseId,
        userId: userId
      },
      transaction: t
    });

    // Update the user's totalExpense by subtracting the deleted amount
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found' });
    }
    user.totalExpense -= amountToDelete;
    await user.save({ fields: ['totalExpense'], transaction: t });

    await t.commit();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    await t.rollback();
    res.status(500).send('Internal Server Error');
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  const t = await sequelize.transaction();

  try {
    // Find the expense to be updated
    const expenseToUpdate = await Expense.findByPk(expenseId, { transaction: t });
    if (!expenseToUpdate) {
      await t.rollback();
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Calculate the difference between the old and new expense amounts
    const oldAmount = expenseToUpdate.ExpenseAmount;
    const newAmount = req.body.ExpenseAmount;
    const amountDifference = newAmount - oldAmount;

    // Update the expense
    const updatedExpense = await Expense.update(req.body, {
      where: {
        id: expenseId,
        userId: userId
      },
      transaction: t
    });

    // Update the user's totalExpense by adding the difference
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found' });
    }
    user.totalExpense += amountDifference;
    await user.save({ fields: ['totalExpense'], transaction: t });

    await t.commit();
    res.json({ updatedExpense });
  } catch (error) {
    console.error('Error updating expense:', error);
    await t.rollback();
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
