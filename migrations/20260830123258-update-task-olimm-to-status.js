"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "tasks",
      "olimm",
      "status"
    );

    await queryInterface.changeColumn("tasks", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("tasks", "status", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.renameColumn(
      "tasks",
      "status",
      "olimm"
    );
  },
};