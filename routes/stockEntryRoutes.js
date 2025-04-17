const express = require("express");
const authMiddleware = require("../middleware/auth");
const StockEntry = require("../models/StockEntry");
const Article = require("../models/Articles");

const router = express.Router();

// Get all stock entries
router.get("/", authMiddleware, async (req, res) => {
  try {
    const stockEntries = await StockEntry.findAll({
      include: [{ model: Article, as: "Article" }],
    });
    res.status(200).json(stockEntries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stock entries", error: error.message });
  }
});

// Create a new stock entry
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);
    const { articleId, quantite, date, numero, utilisateur, coutTotal, montantTotal } = req.body;
    const userId = req.user.sub || req.user.id; // Extract userId from the token

    // Validate input
    if (!articleId || !quantite || !date || !numero || !utilisateur || !coutTotal || !montantTotal || !userId) {
      return res.status(400).json({ message: "Article ID, quantite, date, numero, utilisateur, coutTotal, montantTotal, and userId are required" });
    }

    // Check if the article exists
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Create the stock entry
    const stockEntry = await StockEntry.create({
      articleId,
      quantite: parseFloat(quantite),
      date: new Date(date),
      numero,
      utilisateur,
      coutTotal: parseFloat(coutTotal),
      montantTotal: parseFloat(montantTotal),
      userId,
    });

    // Update the article's stock
    const newStock = article.stock + parseFloat(quantite);
    await article.update({ stock: newStock });

    res.status(201).json({ message: "Stock entry created successfully", stockEntry });
  } catch (error) {
    res.status(500).json({ message: "Error creating stock entry", error: error.message });
  }
});

// Delete a stock entry
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const stockEntry = await StockEntry.findByPk(req.params.id);
    if (!stockEntry) {
      return res.status(404).json({ message: "Stock entry not found" });
    }

    // Update the article's stock
    const article = await Article.findByPk(stockEntry.articleId);
    if (article) {
      const newStock = article.stock - stockEntry.quantite;
      await article.update({ stock: newStock });
    }

    await stockEntry.destroy();
    res.status(200).json({ message: "Stock entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting stock entry", error: error.message });
  }
});

module.exports = router;