const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Article = require('./Articles');
const User = require('./User');

const StockEntry = sequelize.define('StockEntry', {
  numero: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  utilisateur: { type: DataTypes.STRING, allowNull: false },
  coutTotal: { type: DataTypes.FLOAT, allowNull: false },
  montantTotal: { type: DataTypes.FLOAT, allowNull: false },
  quantite: { type: DataTypes.FLOAT, allowNull: false }, // Reverted to quantite
});

StockEntry.belongsTo(Article, { foreignKey: 'articleId', as: 'Article' });
StockEntry.belongsTo(User, { foreignKey: 'userId' });

module.exports = StockEntry;