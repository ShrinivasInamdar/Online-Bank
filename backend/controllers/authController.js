const User = require("../models/User")
const jwt = require("jsonwebtoken")
const Notification = require("../models/Notification")

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {

    expiresIn: process.env.JWT_EXPIRE,

  })
}

// Register user
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    })

    // Create welcome notification
    await Notification.create({
      userId: user._id,
      title: "Welcome to SecureBank",
      message: "Thank you for creating an account with SecureBank. We're excited to have you on board!",
      type: "info",
    })

    // Generate token
    const token = generateToken(user._id)

    // Set cookie
    const cookieOptions = 

      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",

    }

    // Remove password from response
    user.password = undefined

    res.status(201).cookie("token", token, cookieOptions).json({
      success: true,
      token,
      user,
    })
  } catch (error) {
    next(error)
  }
}

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      })
    }

    // Check if user exists
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Update last login
    user.lastLogin = Date.now()
    await user.save()

    // Create login notification
    await Notification.create({
      userId: user._id,
      title: "New Login Detected",
      message: `A new login to your account was detected on ${new Date().toLocaleString()}`,
      type: "security",
    })

    // Generate token
    const token = generateToken(user._id)

    // Set cookie
    const cookieOptions = {

      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",

    }

    // Remove password from response
    user.password = undefined

    res.status(200).cookie("token", token, cookieOptions).json({
      success: true,
      token,
      user,
    })
  } catch (error) {
    next(error)
  }
}

// Logout user
exports.logout = (req, res, next) => {
  res
    .cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User logged out successfully",
    })
}

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    next(error)
  }
}
