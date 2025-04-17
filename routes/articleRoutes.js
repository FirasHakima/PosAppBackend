const express = require("express");
const path = require("path");
const multer = require("multer");
const authMiddleware = require("../middleware/auth");
const Article = require("../models/Articles");
const Category = require("../models/Category");

const router = express.Router();

// === Multer setup for image upload ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where images will be saved
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Serve static files from 'uploads' folder
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// === Articles Routes ===

// Get all active articles with their images
router.get("/articles", authMiddleware, async (req, res) => {
  try {
    const articles = await Article.findAll({ where: { active: 1 } });
    
    // Map over the articles and add the image path
    const articlesWithImage = articles.map(article => {
      const imagePath = article.image ? `${req.protocol}://${req.get("host")}/uploads/${article.image}` : null;
      return { ...article.toJSON(), imagePath };
    });

    res.json(articlesWithImage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active articles + categories with their images
router.get("/articles-with-categories", authMiddleware, async (req, res) => {
  try {
    const articles = await Article.findAll({ where: { active: 1 } });
    const categories = await Category.findAll();

    // Add image paths to articles
    const articlesWithImage = articles.map(article => {
      const imagePath = article.image ? `${req.protocol}://${req.get("host")}/uploads/${article.image}` : null;
      return { ...article.toJSON(), imagePath };
    });

    res.json({ articles: articlesWithImage, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new article (with image upload)
router.post("/articles", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    // Ensure proper type conversion for ref, libelle, and stock
    const articleData = {
      ref: String(req.body.ref), // Force ref to be a string
      code_barre: req.body.code_barre || null,
      libelle: String(req.body.libelle), // Force libelle to be a string
      categorie: req.body.categorie || null,
      stock: req.body.stock ? String(req.body.stock) : null, // Ensure stock is a string (if it's empty, make it null)
      cout: parseFloat(req.body.cout) || 0,
      prix: parseFloat(req.body.prix) || 0,
      active: req.body.active === "true" || req.body.active === true,
      image: req.file ? req.file.filename : null,
    };

    const article = await Article.create(articleData);

    // If the image is uploaded, create an accessible image path URL
    const imagePath = article.image
      ? `${req.protocol}://${req.get("host")}/uploads/${article.image}`
      : null;

    res.status(201).json({ ...article.toJSON(), imagePath });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Update an article (with image upload)
router.put("/articles/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });

    // Extract form data and ensure correct data types
    const ref = req.body.ref ? String(req.body.ref) : article.ref; // Ensure string type
    const codeBarre = req.body.code_barre || article.code_barre;
    const libelle = req.body.libelle ? String(req.body.libelle) : article.libelle; // Ensure string type
    const categorie = req.body.categorie || article.categorie;
    const stock = req.body.stock ? String(req.body.stock) : article.stock; // Ensure string type
    const cout = req.body.cout ? parseFloat(req.body.cout) : article.cout;
    const prix = req.body.prix ? parseFloat(req.body.prix) : article.prix;
    const active = req.body.active === "true" || article.active;

    // If a new image was uploaded, use the new image filename
    const image = req.file ? req.file.filename : article.image;

    // Prepare the updated article data
    const updatedData = {
      ref,
      code_barre: codeBarre,
      libelle,
      categorie,
      stock,
      cout,
      prix,
      active,
      image,
    };

    // Update the article in the database
    await article.update(updatedData);

    const imagePath = image ? `${req.protocol}://${req.get("host")}/uploads/${image}` : null;

    res.json({ ...article.toJSON(), imagePath });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Delete an article
router.delete("/articles/:id", authMiddleware, async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    await article.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// === Categories Routes ===

// Get all categories
router.get("/categories", authMiddleware, async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new category
router.post("/categories", authMiddleware, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a category
router.delete("/categories/:id", authMiddleware, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    await category.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
