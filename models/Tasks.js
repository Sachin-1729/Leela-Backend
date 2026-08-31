const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
        },
  },
  {
    tableName: "tasks",
    timestamps: true,
  }
);

Task.associate = (models) => {
  Task.belongsTo(models.Category, {
    foreignKey: "categoryId",
    as: "category",
  });

  Task.belongsTo(models.Staff, {
    foreignKey: "staffId",
    as: "staff",
  });
};

module.exports = Task;