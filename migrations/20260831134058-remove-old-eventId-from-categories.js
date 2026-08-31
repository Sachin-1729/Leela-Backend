"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("categories", "eventId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("categories", "eventId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};