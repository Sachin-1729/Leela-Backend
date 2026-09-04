"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("reminders", "message");
    await queryInterface.removeColumn("reminders", "sendto");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("reminders", "message", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.addColumn("reminders", "sendto", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};