const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token

    // Get token from cookies or authorization header
    if (req.cookies.token) {
      token = req.cookies.token
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) // TODO: Insert JWT_SECRET here (a strong random string for token encryption)

    // Get user from token
    req.user = await User.findById(decoded.id)

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }
}
