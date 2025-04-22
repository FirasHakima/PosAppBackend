require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const stockEntryRoutes = require("./routes/stockEntryRoutes");
const stockExitRoutes = require("./routes/stockExitRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

// Sequelize Config & Models
const sequelize = require("./config/db");

const User = require("./models/User");
const Role = require("./models/role");
const Article = require("./models/Articles");
const Category = require("./models/Category");
const StockEntry = require("./models/StockEntry");
const StockExit = require("./models/StockExit");
const Settings = require("./models/Settings");

const Session = require("./models/Session");
const Transaction = require("./models/Transaction");
const Prestation = require("./models/Prestation");
const Facture = require("./models/Facture");

// Setup Associations
const setupAssociations = require("./associations");
setupAssociations();

// Initialize Express App
const app = express();

// Middleware
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust this if you have different front-end URL
    credentials: true,
  })
);

// Route Setup
app.use("/api/auth", authRoutes);
app.use("/api/", articleRoutes);
app.use("/api/stock-entries", stockEntryRoutes);
app.use("/api/stock-exits", stockExitRoutes);
app.use("/api/", settingsRoutes);
app.use("/api", sessionRoutes);

// Database Connection
const connectAndSyncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Temporarily disable FK checks for drop (if required)
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });

    // Sync all models (you can consider removing { force: true } if not required)
    await sequelize.sync({ force: false });

    // Re-enable FK checks after sync
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });

    console.log("✅ Database synced successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    console.error("Detailed error:", err.message); // Log detailed error
    process.exit(1); // Exit if unable to connect
  }
};

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    message: "Something went wrong on the server",
    error: err.message,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectAndSyncDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
