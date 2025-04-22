const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Session = sequelize.define("Session", {
  fondsDeCaisse: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
});

module.exports = Session;
