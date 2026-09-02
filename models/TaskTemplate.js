const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TaskTemplate = sequelize.define(
  "TaskTemplate",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    categoryTemplateId: {
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
  },
  {
    tableName: "tasktemplate",
    timestamps: true,
  }
);

TaskTemplate.associate = (models) => {
  TaskTemplate.belongsTo(models.CategoryTemplate, {
    foreignKey: "categoryTemplateId",
    as: "categoryTemplate",
  });

  TaskTemplate.belongsTo(models.Staff, {
    foreignKey: "staffId",
    as: "staff",
  });
};

module.exports = TaskTemplate;