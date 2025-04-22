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



router.get("/articles", authMiddleware, async (req, res) => {
  try {
    const articles = await Article.findAll({
      where: { active: 1 },
      include: [
        {
          model: Category,
          attributes: ["designation"],
          as: "category", // use alias if defined in association
        },
      ],
    });

    const articlesWithDetails = articles.map((article) => {
      const imagePath = article.image
        ? `${req.protocol}://${req.get("host")}/uploads/${article.image}`
        : null;

      return {
        ...article.toJSON(),
        imagePath,
        designation: article.category?.designation || null, // Add designation directly
      };
    });

    res.json(articlesWithDetails);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: error.message });
  }
});


// Get all active articles + categories with their images
router.get("/articles-with-categories", authMiddleware, async (req, res) => {
  try {
    const articles = await Article.findAll({ where: { active: 1 } });
    const categories = await Category.findAll();

    // Filter out articles with stock === 0
    const filteredArticles = articles.filter(article => article.stock > 0);

    // Add image paths to filtered articles
    const articlesWithImage = filteredArticles.map(article => {
      const imagePath = article.image ? `${req.protocol}://${req.get("host")}/uploads/${article.image}` : null;
      return { ...article.toJSON(), imagePath };
    });

    res.json({ articles: articlesWithImage, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post("/articles", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const {
      ref,
      code_barre,
      libelle,
      stock,
      cout,
      prix,
      active,
      categorie, // You're sending this as the category name like "Red Bull"
    } = req.body;

    let category = null;

    // Find category by its 'designation'
    if (categorie) {
      category = await Category.findOne({
        where: {
          designation: categorie.trim(), // make sure to trim it
        },
      });

      if (!category) {
        return res.status(400).json({ error: "Category designation does not exist" });
      }
    }

    // Create the article
    const article = await Article.create({
      ref: String(ref),
      code_barre: code_barre || null,
      libelle: String(libelle),
      categorie: category ? category.id : null, // Store category ID
      stock: stock ? String(stock) : null,
      cout: parseFloat(cout) || 0,
      prix: parseFloat(prix) || 0,
      active: active === "true" || active === true,
      image: req.file ? req.file.filename : null,
    });

    const imagePath = article.image
      ? `${req.protocol}://${req.get("host")}/uploads/${article.image}`
      : null;

    res.status(201).json({ ...article.toJSON(), imagePath });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(400).json({ error: error.message });
  }
});



// Update an article (with image upload)
router.put("/articles/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });

    // Extract form data and ensure correct types
    const ref = req.body.ref ? String(req.body.ref) : article.ref;
    const codeBarre = req.body.code_barre || article.code_barre;
    const libelle = req.body.libelle ? String(req.body.libelle) : article.libelle;
    const stock = req.body.stock ? String(req.body.stock) : article.stock;
    const cout = req.body.cout ? parseFloat(req.body.cout) : article.cout;
    const prix = req.body.prix ? parseFloat(req.body.prix) : article.prix;
    const active = req.body.active === "true" || req.body.active === true ? true : false;
    const image = req.file ? req.file.filename : article.image;

    let categorie = article.categorie;

    // Check if new designation is provided, fetch its ID
    if (req.body.categorie) {
      const category = await Category.findOne({ where: { designation: req.body.categorie } });
      if (!category) return res.status(400).json({ error: "Designation does not exist" });
      categorie = category.id;
    }

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
