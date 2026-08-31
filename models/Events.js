const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Event = sequelize.define(
  "Event",
  {
    eventName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    ownerName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "owner_name",
    },

    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "whatsapp_number",
    },
  },
  {
    tableName: "events",
    timestamps: true,
  }
);

// One Event has many Categories
Event.associate = (models) => {
  Event.hasMany(models.Category, {
    foreignKey: "eventId",
    as: "categories",
  });
};



module.exports = Event;