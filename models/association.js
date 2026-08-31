const Events = require("./Events");
const Category = require("./Category");
const Task = require("./Tasks");
const Staff = require("./Staff");

Events.hasMany(Category, {
  foreignKey: "eventId",
  as: "categories",
});

Category.belongsTo(Events, {
  foreignKey: "eventId",
  as: "event",
});

Category.hasMany(Task, {
  foreignKey: "categoryId",
  as: "tasks",
});

Task.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

Task.belongsTo(Staff, {
  foreignKey: "staffId",
  as: "staff",
});

Staff.hasMany(Task, {
  foreignKey: "staffId",
  as: "tasks",
});

module.exports = {
  Events,
  Category,
  Task,
  Staff,
};