const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Reminder = sequelize.define(
  "Reminder",
  {
    eventid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "events",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    schedule: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "reminders",
    timestamps: true,
  }
);

Reminder.associate = (models) => {
  Reminder.belongsTo(models.Event, {
    foreignKey: "eventid",
    as: "event",
  });

  Reminder.hasMany(models.ReminderLog, {
  foreignKey: "reminderid",
  as: "logs",
});
};

module.exports = Reminder;