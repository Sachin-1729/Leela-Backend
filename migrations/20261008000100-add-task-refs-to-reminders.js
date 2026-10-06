"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // The real task this reminder is for
      await queryInterface.addColumn(
        "reminders",
        "taskid",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "tasks",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        { transaction }
      );

      // The template task whose time/name produced the schedule
      await queryInterface.addColumn(
        "reminders",
        "tasktemplateid",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "tasktemplate",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
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
      await queryInterface.removeColumn("reminders", "tasktemplateid", {
        transaction,
      });
      await queryInterface.removeColumn("reminders", "taskid", { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
