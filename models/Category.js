const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "event_id",
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "categories",
    timestamps: true,
  }
);

Category.associate = (models) => {
  Category.belongsTo(models.Event, {
    foreignKey: "eventId",
    as: "event",
  });
};

module.exports = Category;