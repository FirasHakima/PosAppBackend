const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Settings = sequelize.define(
  "Settings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    store_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    article_price_toggle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    cart_discount_toggle: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    stock_negative_toggle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    payment_restaurant_card_toggle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    payment_gift_card_toggle: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    payment_restaurant_discount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    payment_gift_card_discount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    stock_default: {
      type: DataTypes.STRING,
      defaultValue: "Désactivé",
    },
    unit_default: {
      type: DataTypes.STRING,
      defaultValue: "Pièce",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Settings;