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
      field : "whatsapp_number"
    },
  },
  {
    tableName: "events",
    timestamps: true,
  }
);

module.exports = Event;