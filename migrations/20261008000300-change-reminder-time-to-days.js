"use strict";

// Reminder offsets change from HH:mm to DD:HH:mm so they can exceed 24 hours.
const TABLES = ["tasktemplate", "tasks"];

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      for (const table of TABLES) {
        await queryInterface.removeConstraint(table, `${table}_time_format_check`, {
          transaction,
        });

        await queryInterface.changeColumn(
          table,
          "time",
          {
            type: Sequelize.STRING(8),
            allowNull: true,
          },
          { transaction }
        );

        // Existing HH:mm offsets become 00:HH:mm
        await queryInterface.sequelize.query(
          `UPDATE "${table}"
           SET "time" = '00:' || "time"
           WHERE "time" ~ '^[0-9]{2}:[0-9]{2}$'`,
          { transaction }
        );

        await queryInterface.sequelize.query(
          `ALTER TABLE "${table}"
           ADD CONSTRAINT "${table}_time_format_check"
           CHECK ("time" ~ '^[0-9]{2}:([01][0-9]|2[0-3]):[0-5][0-9]$')`,
          { transaction }
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      for (const table of TABLES) {
        // Offsets of a day or more cannot be represented as HH:mm
        const [rows] = await queryInterface.sequelize.query(
          `SELECT COUNT(*)::int AS count FROM "${table}"
           WHERE "time" IS NOT NULL AND "time" NOT LIKE '00:%'`,
          { transaction }
        );

        if (rows[0].count > 0) {
          throw new Error(
            `Cannot revert: ${rows[0].count} row(s) in "${table}" have a reminder offset of 1 day or more`
          );
        }

        await queryInterface.removeConstraint(table, `${table}_time_format_check`, {
          transaction,
        });

        await queryInterface.sequelize.query(
          `UPDATE "${table}"
           SET "time" = SUBSTRING("time" FROM 4)
           WHERE "time" IS NOT NULL`,
          { transaction }
        );

        await queryInterface.changeColumn(
          table,
          "time",
          {
            type: Sequelize.STRING(5),
            allowNull: true,
          },
          { transaction }
        );

        await queryInterface.sequelize.query(
          `ALTER TABLE "${table}"
           ADD CONSTRAINT "${table}_time_format_check"
           CHECK ("time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')`,
          { transaction }
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
