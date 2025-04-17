const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Article = sequelize.define("Article", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ref: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  code_barre: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  libelle: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  categorie: {
    type: DataTypes.INTEGER, // Changed to INTEGER to reference Category.id
    allowNull: true,
    references: {
      model: "Categories", // References the Category table
      key: "id",
    },
  },
  stock: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  cout: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
  },
  prix: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
  },
  active: {
    type: DataTypes.TINYINT(1),
    allowNull: true,
    defaultValue: 1,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Article;