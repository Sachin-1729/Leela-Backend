"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // One row per "Broadcast" click
    await queryInterface.createTable("guest_broadcasts", {
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

      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      link: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // sending | completed
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "sending",
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

    await queryInterface.addIndex("guest_broadcasts", ["event_id"]);

    // One row per guest per broadcast. Guest name/phone are copied in,
    // because re-uploading the guest list deletes the event_guests rows.
    await queryInterface.createTable("guest_invitations", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      broadcast_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "guest_broadcasts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

      guest_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      // pending | success | failed
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending",
      },

      msgid: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      error: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex("guest_invitations", ["broadcast_id"]);
    await queryInterface.addIndex("guest_invitations", ["event_id"]);
    await queryInterface.addIndex("guest_invitations", ["msgid"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("guest_invitations");
    await queryInterface.dropTable("guest_broadcasts");
  },
};
