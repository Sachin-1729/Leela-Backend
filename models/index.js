const Event = require("./Events");
const Category = require("./Category");
const Task = require("./Tasks");
const Staff = require("./Staff");

const EventTemplate = require("./EventTemplate");
const CategoryTemplate = require("./CategoryTemplate");
const TaskTemplate = require("./TaskTemplate");

const db = {
  Event,
  Category,
  Task,
  Staff,

  EventTemplate,
  CategoryTemplate,
  TaskTemplate,
};

// Initialize associations
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === "function") {
    db[modelName].associate(db);
  }
});

db.sequelize = Event.sequelize;
db.Sequelize = require("sequelize");

module.exports = db;