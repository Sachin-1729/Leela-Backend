"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("events", "start", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.addColumn("events", "end", {
      type: Sequelize.TIME,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("events", "start");
    await queryInterface.removeColumn("events", "end");
  },
};