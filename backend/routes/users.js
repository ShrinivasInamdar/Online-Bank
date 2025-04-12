const express = require("express")
const { updateProfile, updatePassword, updateNotificationPreferences } = require("../controllers/userController")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Apply auth middleware to all routes
router.use(protect)

router.put("/profile", updateProfile)
router.put("/password", updatePassword)
router.put("/preferences", updateNotificationPreferences)

module.exports = router
