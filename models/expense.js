// models/expense.js
const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Expense = sequelize.define('expense', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    ExpenceAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    Description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Catagory: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Expense;
