"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("staffs", {
      fields: ["whatsappNumber"],
      type: "unique",
      name: "staffs_whatsapp_number_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "staffs",
      "staffs_whatsapp_number_unique"
    );
  },
};