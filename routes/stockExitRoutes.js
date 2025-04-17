const express = require("express");
const authMiddleware = require("../middleware/auth");
const StockExit = require("../models/StockExit");
const Article = require("../models/Articles");

const router = express.Router();

// Get all stock exits
router.get("/", authMiddleware, async (req, res) => {
  try {
    const stockExits = await StockExit.findAll({
      include: [{ model: Article, as: "Article" }],
    });
    res.status(200).json(stockExits);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stock exits", error: error.message });
  }
});

// Create a new stock exit
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

    // Check if there is enough stock
    const newStock = article.stock - parseFloat(quantite);
    if (newStock < 0) {
      return res.status(400).json({ message: "Insufficient stock for this article" });
    }

    // Create the stock exit
    const stockExit = await StockExit.create({
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
    await article.update({ stock: newStock });

    res.status(201).json({ message: "Stock exit created successfully", stockExit });
  } catch (error) {
    res.status(500).json({ message: "Error creating stock exit", error: error.message });
  }
});

// Delete a stock exit
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const stockExit = await StockExit.findByPk(req.params.id);
    if (!stockExit) {
      return res.status(404).json({ message: "Stock exit not found" });
    }

    // Update the article's stock
    const article = await Article.findByPk(stockExit.articleId);
    if (article) {
      const newStock = article.stock + stockExit.quantite;
      await article.update({ stock: newStock });
    }

    await stockExit.destroy();
    res.status(200).json({ message: "Stock exit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting stock exit", error: error.message });
  }
});

module.exports = router;