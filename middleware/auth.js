const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  try {
    // Verify the token using the JWT_SECRET
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    if (!process.env.JWT_SECRET) {
      console.warn("JWT_SECRET is not set in environment variables. Using default secret.");
    }
    
    const decoded = jwt.verify(token, secret);
    
    // Attach the decoded token to req.user
    req.user = decoded;
    
    // Proceed to the next middleware/route
    next();
  } catch (error) {
    // Handle expired token specifically
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired", error: "jwt expired" });
    }
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
};

module.exports = authMiddleware;