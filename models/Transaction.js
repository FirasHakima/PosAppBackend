const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Transaction = sequelize.define("Transaction", {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fondsDeCaisse: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  moyenPaiement: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  montant: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  articles: {
    type: DataTypes.JSON,
    allowNull: true,
  }
});

module.exports = Transaction;
