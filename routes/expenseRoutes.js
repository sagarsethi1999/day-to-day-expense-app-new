// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');



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

  try {
      // Create new expense with userID
      const newExpense = await Expense.create({ ExpenseAmount, Description, Category, userID });
      console.log('Expense added:', newExpense);

      // Send success response
      res.status(200).json({ message: 'Expense added successfully', newExpense });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});





// Route to handle retrieving all expenses
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract the user ID from the verified token payload
  try {
      // Assuming you have a Sequelize model for expenses
      const expenses = await Expense.findAll({
          where: {
              userId: userId // Filter expenses by user ID
          }
      });
      res.json(expenses);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});




router.delete('/:id', verifyToken, async (req, res) => {
    const expenseId = req.params.id;
    const userId = req.user.id;
  try {
    await Expense.destroy({
      where: {
        id: expenseId,
        userId: userId
      }
    });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});




router.put('/:id', verifyToken, async (req, res) => {
    const expenseId = req.params.id;
    const userId = req.user.id;
    try {
      const updatedExpense = await Expense.update(req.body, {
        where: {
          id: expenseId,
          userId: userId
        }
      });
      res.json({ updatedExpense });
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
