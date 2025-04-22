const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Prestation = sequelize.define("Prestation", {
  typePrestation: {
    type: DataTypes.ENUM("Retrait", "Planification de commande"),
    allowNull: false,
  },
  jourRetrait: {
    type: DataTypes.STRING, // Format: "jj/mm/aaaa"
    allowNull: true,
  },
  heure: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  minute: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  nomClient: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numeroTelephone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  paiements: {
    type: DataTypes.JSON,
    allowNull: true,
  }
});

module.exports = Prestation;
