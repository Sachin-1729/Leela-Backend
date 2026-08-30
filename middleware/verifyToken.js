const jwt = require("jsonwebtoken");
const Users = require("../models/Users");

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await Users.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {
    console.error("Token verification error:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

module.exports ={
    verifyToken
}