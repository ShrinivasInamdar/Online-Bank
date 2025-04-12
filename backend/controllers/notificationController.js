const Notification = require("../models/Notification")

// Get all notifications for a user
exports.getNotifications = async (req, res, next) => {
  try {
    // Build query
    const query = { userId: req.user.id }

    // Filter by read status
    if (req.query.read === "true") {
      query.read = true
    } else if (req.query.read === "false") {
      query.read = false
    }

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type
    }

    // Pagination
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit

    // Execute query
    const notifications = await Notification.find(query).sort({ date: -1 }).skip(startIndex).limit(limit)

    // Get total count
    const total = await Notification.countDocuments(query)

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      read: false,
    })

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: notifications,
    })
  } catch (error) {
    next(error)
  }
}

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      })
    }

    notification.read = true
    await notification.save()

    res.status(200).json({
      success: true,
      data: notification,
    })
  } catch (error) {
    next(error)
  }
}

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true })

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    next(error)
  }
}
