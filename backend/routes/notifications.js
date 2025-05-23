const express = require("express")
const { getNotifications, markAsRead, markAllAsRead } = require("../controllers/notificationController")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Apply auth middleware to all routes
router.use(protect)

router.get("/", getNotifications)
router.put("/:id/read", markAsRead)
router.put("/read-all", markAllAsRead)

module.exports = router
