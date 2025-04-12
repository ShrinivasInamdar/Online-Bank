const User = require("../models/User")
const bcrypt = require("bcryptjs")

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address } = req.body

    // Build update object
    const updateData = {}
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (phone) updateData.phone = phone
    if (address) updateData.address = address

    // Update user
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true })

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// Update user password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Check if passwords are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      })
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password")

    // Check if current password matches
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    next(error)
  }
}

// Update notification preferences
exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const { emailNotifications, smsNotifications, loginAlerts, transactionAlerts } = req.body

    // Build update object
    const preferences = {}
    if (emailNotifications !== undefined) preferences.emailNotifications = emailNotifications
    if (smsNotifications !== undefined) preferences.smsNotifications = smsNotifications
    if (loginAlerts !== undefined) preferences.loginAlerts = loginAlerts
    if (transactionAlerts !== undefined) preferences.transactionAlerts = transactionAlerts

    // Update user
    const user = await User.findByIdAndUpdate(req.user.id, { preferences }, { new: true, runValidators: true })

    res.status(200).json({
      success: true,
      data: user.preferences,
    })
  } catch (error) {
    next(error)
  }
}
