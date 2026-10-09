const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GuestInvitation = sequelize.define(
  "GuestInvitation",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    broadcastId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "broadcast_id",
    },

    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "event_id",
    },

    guestName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "guest_name",
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // pending | success | failed
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },

    msgid: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "sent_at",
    },
  },
  {
    tableName: "guest_invitations",
    timestamps: true,
  }
);

GuestInvitation.associate = (models) => {
  GuestInvitation.belongsTo(models.GuestBroadcast, {
    foreignKey: "broadcastId",
    as: "broadcast",
  });

  GuestInvitation.belongsTo(models.Event, {
    foreignKey: "eventId",
    as: "event",
  });
};

module.exports = GuestInvitation;
