const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Role = sequelize.define("Role", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {
      discount: false,
      modifyPrice: false,
      closeSession: false,
      viewTransactions: false,
      searchTransactions: false,
      modifyTransactions: false,
      deleteTransactions: false,
      reportsModule: false,
      articlesModule: false,
      stockModule: false,
      settingsModule: false,
      userSettings: false,
      caisseModule: false,
    },
  },
});

module.exports = Role;