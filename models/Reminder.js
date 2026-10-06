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

    // The real task this reminder is for
    taskid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "tasks",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    // The template task whose time/name produced the schedule
    tasktemplateid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "tasktemplate",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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

  Reminder.belongsTo(models.Task, {
    foreignKey: "taskid",
    as: "task",
  });

  Reminder.belongsTo(models.TaskTemplate, {
    foreignKey: "tasktemplateid",
    as: "taskTemplate",
  });

  Reminder.hasMany(models.ReminderLog, {
  foreignKey: "reminderid",
  as: "logs",
});
};

module.exports = Reminder;