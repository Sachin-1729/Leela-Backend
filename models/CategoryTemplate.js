const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CategoryTemplate = sequelize.define(
  "CategoryTemplate",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    eventTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "categorytemplate",
    timestamps: true,
  }
);

CategoryTemplate.associate = (models) => {
  CategoryTemplate.belongsTo(models.EventTemplate, {
    foreignKey: "eventTemplateId",
    as: "eventTemplate",
  });

  CategoryTemplate.hasMany(models.TaskTemplate, {
    foreignKey: "categoryTemplateId",
    as: "tasks",
  });
};

module.exports = CategoryTemplate;