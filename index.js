// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./models/user");
const Expense = require('./models/expense');
const Order = require('./models/orders');
const ForgotPasswordRequest = require('./models/ForgotPasswordRequests');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');


const app = express();
const helmet = require('helmet');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware
app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());


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

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User, { onDelete: 'CASCADE' });

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


app.use((req, res) => {

  console.log('urlll',  req.url);
  res.sendFile(path.join(__dirname,`${req.url}`))
})

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://13.239.6.219:${PORT}`);
});
