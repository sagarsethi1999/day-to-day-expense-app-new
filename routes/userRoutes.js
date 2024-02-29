// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Route to handle user sign-up
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(409).send('Email address is already in use');
        }

        // Create new user
        const newUser = await User.create({ name, email, password });
        console.log('User signed up:', newUser);

        // Send success response
        res.status(200).send('User signed up successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
