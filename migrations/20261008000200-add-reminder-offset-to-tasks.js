"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Reminder offset from the event start, HH:mm
      await queryInterface.addColumn(
        "tasks",
        "time",
        {
          type: Sequelize.STRING(5),
          allowNull: true,
        },
        { transaction }
      );

      // Whether the reminder is "before" or "after" the event start
      await queryInterface.addColumn(
        "tasks",
        "name",
        {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE "tasks"
         ADD CONSTRAINT "tasks_time_format_check"
         CHECK ("time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE "tasks"
         ADD CONSTRAINT "tasks_name_check"
         CHECK ("name" IN ('before', 'after'))`,
        { transaction }
      );

      // Existing rows have neither; new rows must set both or neither
      await queryInterface.sequelize.query(
        `ALTER TABLE "tasks"
         ADD CONSTRAINT "tasks_time_name_pair_check"
         CHECK (("time" IS NULL) = ("name" IS NULL))`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeConstraint(
        "tasks",
        "tasks_time_name_pair_check",
        { transaction }
      );
      await queryInterface.removeConstraint(
        "tasks",
        "tasks_name_check",
        { transaction }
      );
      await queryInterface.removeConstraint(
        "tasks",
        "tasks_time_format_check",
        { transaction }
      );
      await queryInterface.removeColumn("tasks", "name", { transaction });
      await queryInterface.removeColumn("tasks", "time", { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
