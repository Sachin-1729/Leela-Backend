const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EventTemplate = sequelize.define(
  "EventTemplate",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "eventtemplate",
    timestamps: true,
  }
);

EventTemplate.associate = (models) => {
  EventTemplate.hasMany(models.CategoryTemplate, {
    foreignKey: "eventTemplateId",
    as: "categories",
  });
};

module.exports = EventTemplate;