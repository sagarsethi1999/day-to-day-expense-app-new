// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

        const saltRounds = 10; // Number of salt rounds
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = await User.create({ name, email, password: hashedPassword });
        console.log('User signed up:', newUser);

        // Send success response
        res.status(200).send('User signed up successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});




// Route to handle user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ where: { email: email } });
        if (!user) return res.status(404).send('User not found');

        // Verify password
        const validPassword = await user.validPassword(password);
        if (!validPassword) return res.status(401).send('Incorrect password');
        
        // Generate JWT token with user ID in payload
        const token = jwt.sign({ id: user.id, name: user.name }, 'secretkey');
        // res.header('authorization', token).status(200).send('Login successful');
        res.status(200).json({ token: token, message: 'Login successful' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
