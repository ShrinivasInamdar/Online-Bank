const mongoose = require("mongoose")

const TransactionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  type: {
    type: String,
    required: [true, "Transaction type is required"],
    enum: ["Deposit", "Withdrawal", "Transfer", "Payment", "Fee", "Interest"],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    trim: true,
    default: "Uncategorized",
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Cancelled"],
    default: "Completed",
  },
  reference: {
    type: String,
    trim: true,
  },
  relatedAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
})

module.exports = mongoose.model("Transaction", TransactionSchema)
