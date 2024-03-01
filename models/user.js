// models/user.js
const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('user', {
    // Define your user model fields here
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        
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

User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};


module.exports = User;


  