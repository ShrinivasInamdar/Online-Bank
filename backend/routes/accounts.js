const express = require("express")
const { getAccounts, getAccount, getAccountSummary } = require("../controllers/accountController")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Apply auth middleware to all routes
router.use(protect)

router.get("/", getAccounts)
router.get("/summary", getAccountSummary)
router.get("/:id", getAccount)

module.exports = router
