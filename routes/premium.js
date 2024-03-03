const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Expense = require('../models/expense');
const verifyToken = require('../middleware/auth');


const sequelize = require('../util/database');

router.get('/premium', verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        // Fetch user from database based on user ID in request
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Send user's premium status as response
        return res.status(200).json({ isPremium: user.premiumUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/premium/leaderboard', verifyToken, async (req, res) => {
    
    try {
        
        const userId = req.user.id;

        // Check if the user is a premium user
        const user = await User.findByPk(userId);
        if (!user || !user.premiumUser) {
            return res.status(403).json({ error: 'Unauthorized' });
        }



        const leaderboardData = await User.findAll({
            attributes: [
                'id',
                'name',
                [sequelize.fn('SUM', sequelize.col('expenses.expenseAmount')), 'totalExpense']
            ],
            include: [{
                model: Expense,
                as: 'expenses',
                attributes: []
            }],
            group: ['user.id'],
            order: [['totalExpense', 'DESC']]
        });
        console.log(leaderboardData)
        res.json(leaderboardData); // Send the leaderboard data as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' }); // Send error response if any error occurs
    }
});


module.exports = router;
