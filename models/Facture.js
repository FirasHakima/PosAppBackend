const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Facture = sequelize.define("Facture", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Articles",
      key: "id",
    }
  },
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Sessions",
      key: "id",
    }
  },
  total: {
    type: DataTypes.FLOAT,  // Use FLOAT or DECIMAL depending on the precision needed
    allowNull: false,
    validate: {
      min: 0,  // Ensure total is a positive number
    },
  },
});

module.exports = Facture;
