const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");

// GET settings (fetch the first record)
router.get("/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // If no settings exist, create a default record
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings", error: error.message });
  }
});

// POST settings (update or create)
router.post("/settings", async (req, res) => {
  const {
    store_name,
    article_price_toggle,
    cart_discount_toggle,
    stock_negative_toggle,
    payment_restaurant_card_toggle,
    payment_gift_card_toggle,
    payment_restaurant_discount,
    payment_gift_card_discount,
    stock_default,
    unit_default,
  } = req.body;

  try {
    let settings = await Settings.findOne();
    if (settings) {
      // Update existing settings
      await settings.update({
        store_name,
        article_price_toggle,
        cart_discount_toggle,
        stock_negative_toggle,
        payment_restaurant_card_toggle,
        payment_gift_card_toggle,
        payment_restaurant_discount,
        payment_gift_card_discount,
        stock_default,
        unit_default,
      });
    } else {
      // Create new settings
      settings = await Settings.create({
        store_name,
        article_price_toggle,
        cart_discount_toggle,
        stock_negative_toggle,
        payment_restaurant_card_toggle,
        payment_gift_card_toggle,
        payment_restaurant_discount,
        payment_gift_card_discount,
        stock_default,
        unit_default,
      });
    }
    res.status(200).json({ message: "Settings saved successfully", settings });
  } catch (error) {
    res.status(500).json({ message: "Failed to save settings", error: error.message });
  }
});

module.exports = router;