const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ReminderLog = sequelize.define(
  "ReminderLog",
  {
    reminderid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "reminders",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    taskid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    staffid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },

    sentat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "reminderlogs",
    timestamps: true,
  }
);

ReminderLog.associate = (models) => {
  ReminderLog.belongsTo(models.Reminder, {
    foreignKey: "reminderid",
    as: "reminder",
  });
};

module.exports = ReminderLog;