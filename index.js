const express = require("express");
const cors = require("cors");

require("dotenv").config();

const sequelize = require("./config/db");
const startServer = require("./startup/startServer");
const leadRoutes = require("./routes/leadRoutes");
const usersRoutes = require("./routes/usersRoutes");
const staffRoutes = require("./routes/staffRoute");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/lead", leadRoutes);
app.use("/users" , usersRoutes);
app.use("/staff" , staffRoutes);


startServer(app, sequelize, PORT);