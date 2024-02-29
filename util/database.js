const Sequelize = require ('sequelize');


const sequelize = new Sequelize('day-to-day-expense', 'root','sagarhero143',
{dialect: 'mysql',
host: 'localhost'
});
module.exports = sequelize;