const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Event = sequelize.define("Event", {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  ownerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  whatsappNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "events",
  timestamps: true,
});

module.exports = Event;