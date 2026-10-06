const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const {
  REMINDER_TIME_REGEX,
  REMINDER_TYPES,
} = require("../services/reminderSchedule");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
        },

    // Reminder offset from the event start, DD:HH:mm
    time: {
      type: DataTypes.STRING(8),
      allowNull: true,
      validate: {
        is: {
          args: REMINDER_TIME_REGEX,
          msg: "Time must be in DD:HH:mm format",
        },
      },
    },

    // "before" or "after" the event start
    name: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        isIn: {
          args: [REMINDER_TYPES],
          msg: "Before/After must be either before or after",
        },
      },
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
    validate: {
      reminderConfigComplete() {
        if ((this.time == null) !== (this.name == null)) {
          throw new Error("Time and Before/After must be set together");
        }
      },
    },
  }
);

Task.associate = (models) => {
  Task.belongsTo(models.Category, {
    foreignKey: "categoryId",
    as: "category",
  });

  Task.belongsTo(models.Staff, {
    foreignKey: "staffId",
    as: "staff",
  });
};

module.exports = Task;