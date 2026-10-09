const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GuestBroadcast = sequelize.define(
  "GuestBroadcast",
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

    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    link: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // sending | completed
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "sending",
    },
  },
  {
    tableName: "guest_broadcasts",
    timestamps: true,
  }
);

GuestBroadcast.associate = (models) => {
  GuestBroadcast.belongsTo(models.Event, {
    foreignKey: "eventId",
    as: "event",
  });

  GuestBroadcast.hasMany(models.GuestInvitation, {
    foreignKey: "broadcastId",
    as: "invitations",
    onDelete: "CASCADE",
  });
};

module.exports = GuestBroadcast;
