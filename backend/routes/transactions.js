const express = require("express")
const {
  getTransactions,
  getRecentTransactions,
  getPendingTransactions,
  transferMoney,
} = require("../controllers/transactionController")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Apply auth middleware to all routes
router.use(protect)

router.get("/", getTransactions)
router.get("/recent", getRecentTransactions)
router.get("/pending", getPendingTransactions)
router.post("/transfer", transferMoney)

module.exports = router
