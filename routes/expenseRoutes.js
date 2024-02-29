// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');

// Route to handle adding an expense
router.post('/', async (req, res) => {
    const { ExpenceAmount, Description, Catagory } = req.body;

    try {
        // Create new expense
        const newExpense = await Expense.create({ ExpenceAmount, Description, Catagory });
        console.log('Expense added:', newExpense);

        // Send success response
        res.status(200).json({ message: 'Expense added successfully', newExpense });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to handle retrieving all expenses
router.get('/', async (req, res) => {
    try {
        // Retrieve all expenses
        const expenses = await Expense.findAll();
        console.log('All expenses:', expenses);

        // Send success response
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id', async (req, res) => {
    const expenseId = req.params.id;
  try {
    await Expense.destroy({
      where: {
        id: expenseId,
      },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

router.put('/:id', async (req, res) => {
    const expenseId = req.params.id;
    try {
      const updatedExpense = await Expense.update(req.body, {
        where: {
          id: expenseId,
        }
      });
      res.json({ updatedExpense });
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
