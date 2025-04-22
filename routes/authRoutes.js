const express = require("express");
const authMiddleware = require("../middleware/auth");
const authController = require("../controllers/authController");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Authentication Routes
router.post("/register", authController.registerUser); // Register a new user
router.post("/login", authController.loginUser); // Login a user
router.get("/users", authMiddleware, authController.getUsers); // Get all users
router.put("/users/:id", authMiddleware, authController.updateUserPermissions); // Update user permissions
router.delete("/users/:id", authMiddleware, authController.deleteUser); // Delete a user
router.post("/roles/permissions", authMiddleware, authController.updateRolePermissions); // Update role permissions
router.post("/validate-pin", authMiddleware, authController.validatePin); // Update role permissions

// Refresh token route
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await authController.User.findByPk(decoded.id, { include: authController.Role });
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.Role.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token", error: error.message });
  }
});

module.exports = router;