const mongoose = require("mongoose")

const AccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Account name is required"],
    trim: true,
  },
  type: {
    type: String,
    required: [true, "Account type is required"],
    enum: ["Checking", "Savings", "Credit", "Investment"],
    trim: true,
  },
  accountNumber: {
    type: String,
    required: [true, "Account number is required"],
    unique: true,
    trim: true,
  },
  balance: {
    type: Number,
    required: [true, "Balance is required"],
    default: 0,
  },
  availableBalance: {
    type: Number,
    default: function () {
      return this.balance
    },
  },
  interestRate: {
    type: Number,
    default: 0,
  },
  openingDate: {
    type: Date,
    default: Date.now,
  },
  features: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Frozen"],
    default: "Active",
  },
  currency: {
    type: String,
    default: "USD",
  },
})

// Virtual for formatted account number (last 4 digits)
AccountSchema.virtual("maskedAccountNumber").get(function () {
  const accountNum = this.accountNumber
  return accountNum.slice(-4).padStart(accountNum.length, "*")
})

module.exports = mongoose.model("Account", AccountSchema)
