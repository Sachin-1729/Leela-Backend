const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EventGuest = sequelize.define(
  "EventGuest",
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

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "event_guests",
    timestamps: true,
  }
);

EventGuest.associate = (models) => {
  EventGuest.belongsTo(models.Event, {
    foreignKey: "eventId",
    as: "event",
  });
};

module.exports = EventGuest;
