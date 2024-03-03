// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./models/user");
const Expense = require('./models/expense');
const Order = require('./models/orders');

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

User.hasMany(Order);
Order.belongsTo(User);

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);

const expenseRoutes = require("./routes/expenseRoutes");
app.use("/user/expense", expenseRoutes);

const purchase = require("./routes/purchase");
app.use("/purchase/premiummembership", purchase);

const premium = require("./routes/premium");
app.use("/", premium);

const password = require("./routes/password");
app.use("/password", password);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
