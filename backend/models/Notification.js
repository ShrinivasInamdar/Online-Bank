const mongoose = require("mongoose")

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Notification title is required"],
    trim: true,
  },
  message: {
    type: String,
    required: [true, "Notification message is required"],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ["security", "transaction", "alert", "info"],
    default: "info",
  },
  link: {
    type: String,
    trim: true,
  },
})

module.exports = mongoose.model("Notification", NotificationSchema)
