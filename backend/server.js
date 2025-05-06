
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const authRoutes = require("./routes/auth")
const accountRoutes = require("./routes/accounts")
const transactionRoutes = require("./routes/transactions")
const notificationRoutes = require("./routes/notifications")
const userRoutes = require("./routes/users")

// Load environment variables

dotenv.config()


// Create Express app
const app = express()

// Middleware
app.use(
  cors({

    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

// Connect to MongoDB

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/accounts", accountRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/users", userRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "An error occurred on the server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Start server
