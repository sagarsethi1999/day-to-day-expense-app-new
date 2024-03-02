const express = require('express');
const router = express.Router();
const User = require('../models/user');
const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
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

module.exports = router;
