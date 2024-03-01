// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./models/user");
const Expense = require('./models/expense');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sync database
const sequelize = require("./util/database");
sequelize
.sync()
// .sync({force: true})
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => console.error('Unable to sync database:', err));

// Define association
User.hasMany(Expense, { foreignKey: 'userID' });
Expense.belongsTo(User, { foreignKey: 'userID' });


// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);

const expenseRoutes = require("./routes/expenseRoutes");
app.use("/user/expense", expenseRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
