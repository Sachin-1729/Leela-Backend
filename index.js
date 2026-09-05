const express = require("express");
const cors = require("cors");

require("dotenv").config();
require("./cron/reminderCron");

const sequelize = require("./config/db");
const startServer = require("./startup/startServer");
const leadRoutes = require("./routes/leadRoutes");
const usersRoutes = require("./routes/usersRoutes");
const staffRoutes = require("./routes/staffRoute");
const eventRoutes = require("./routes/eventRoutes");
const categoryRoutes = require("./routes/categoryRoute")
const taskRoutes = require("./routes/tasksRoute")
const eventTemplateRoutes = require("./routes/eventTemplateRoutes")
const webhookRoute = require("./routes/webhookRoute")

// Initialize models + associations
require("./models/index");

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
app.use("/event" , eventRoutes);
app.use("/category" , categoryRoutes);
app.use("/task" , taskRoutes);
app.use("/template" , eventTemplateRoutes);
app.use("/webhook" , webhookRoute);


startServer(app, sequelize, PORT);