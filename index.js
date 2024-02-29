// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./models/user");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sync database
const sequelize = require("./util/database");
sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => console.error('Unable to sync database:', err));

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
