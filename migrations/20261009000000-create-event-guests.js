"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("event_guests", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "events",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("event_guests", ["event_id", "phone"], {
      unique: true,
      name: "event_guests_event_id_phone_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("event_guests");
  },
};
