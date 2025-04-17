require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const stockEntryRoutes = require("./routes/stockEntryRoutes");
const stockExitRoutes = require("./routes/stockExitRoutes");
const settingsRoutes = require("./routes/settingsRoutes"); // Add this

// Import Sequelize and Models
const sequelize = require("./config/db");
const User = require("./models/User");
const Role = require("./models/role");
const Article = require("./models/Articles");
const Category = require("./models/Category");
const StockEntry = require("./models/StockEntry");
const StockExit = require("./models/StockExit");
const Settings = require("./models/Settings"); // Add this

// Import Associations
const setupAssociations = require("./associations");

// Initialize Express App
const app = express();

// Middleware Setup
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Routes Setup
app.use("/api/auth", authRoutes);
app.use("/api", articleRoutes);
app.use("/api/stock-entries", stockEntryRoutes);
app.use("/api/stock-exits", stockExitRoutes);
app.use("/api", settingsRoutes); // Add this

// Setup Associations
setupAssociations();

// Database Connection and Sync
const connectAndSyncDB = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully ✅");

    // Sync models with the database
    await sequelize.sync({ force: false }); // Set to `true` only during development to drop and recreate tables
    console.log("Database synced successfully ✅");
  } catch (err) {
    console.error("Database error:", err.message);
    process.exit(1); // Exit the process if the database connection fails
  }
};

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server", error: err.message });
});

// Handle Unmatched Routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the Server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectAndSyncDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} 🚀`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

// Run the server
startServer();