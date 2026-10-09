const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CommunityRequest = sequelize.define(
  "CommunityRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    community: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "community_requests",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  }
);

module.exports = CommunityRequest;
