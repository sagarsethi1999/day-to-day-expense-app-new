// models/user.js
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('user', {
    // Define your user model fields here
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true // Using email as primary key
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = User;


  