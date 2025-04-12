const Transaction = require("../models/Transaction")
const Account = require("../models/Account")
const Notification = require("../models/Notification")
const mongoose = require("mongoose")

// Get all transactions for a user
exports.getTransactions = async (req, res, next) => {
  try {
    // Get all accounts for the user
    const accounts = await Account.find({ userId: req.user.id })
    const accountIds = accounts.map((account) => account._id)

    // Build query
    const query = { accountId: { $in: accountIds } }

    // Filter by account
    if (req.query.accountId) {
      query.accountId = req.query.accountId
    }

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      }
    }

    // Pagination
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit

    // Execute query
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("accountId", "name type")

    // Get total count
    const total = await Transaction.countDocuments(query)

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: transactions,
    })
  } catch (error) {
    next(error)
  }
}

// Get recent transactions
exports.getRecentTransactions = async (req, res, next) => {
  try {
    // Get all accounts for the user
    const accounts = await Account.find({ userId: req.user.id })
    const accountIds = accounts.map((account) => account._id)

    // Get limit from query or default to 10
    const limit = Number.parseInt(req.query.limit, 10) || 10

    // Get recent transactions
    const transactions = await Transaction.find({ accountId: { $in: accountIds } })
      .sort({ date: -1 })
      .limit(limit)
      .populate("accountId", "name type")

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    })
  } catch (error) {
    next(error)
  }
}

// Get pending transactions
exports.getPendingTransactions = async (req, res, next) => {
  try {
    // Get all accounts for the user
    const accounts = await Account.find({ userId: req.user.id })
    const accountIds = accounts.map((account) => account._id)

    // Get pending transactions
    const transactions = await Transaction.find({
      accountId: { $in: accountIds },
      status: "Pending",
    })
      .sort({ date: -1 })
      .populate("accountId", "name type")

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    })
  } catch (error) {
    next(error)
  }
}

// Transfer money between accounts
exports.transferMoney = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { fromAccountId, toAccountId, amount, description } = req.body

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      })
    }

    // Check if accounts exist and belong to the user
    const fromAccount = await Account.findOne({
      _id: fromAccountId,
      userId: req.user.id,
    }).session(session)

    if (!fromAccount) {
      return res.status(404).json({
        success: false,
        message: "Source account not found",
      })
    }

    const toAccount = await Account.findById(toAccountId).session(session)

    if (!toAccount) {
      return res.status(404).json({
        success: false,
        message: "Destination account not found",
      })
    }

    // Check if source account has sufficient funds
    if (fromAccount.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient funds",
      })
    }

    // Update account balances
    fromAccount.balance -= amount
    await fromAccount.save({ session })

    toAccount.balance += amount
    await toAccount.save({ session })

    // Create withdrawal transaction
    const withdrawalTransaction = await Transaction.create(
      [
        {
          accountId: fromAccountId,
          type: "Transfer",
          amount,
          description: description || `Transfer to ${toAccount.name}`,
          relatedAccountId: toAccountId,
        },
      ],
      { session },
    )

    // Create deposit transaction
    const depositTransaction = await Transaction.create(
      [
        {
          accountId: toAccountId,
          type: "Deposit",
          amount,
          description: description || `Transfer from ${fromAccount.name}`,
          relatedAccountId: fromAccountId,
        },
      ],
      { session },
    )

    // Create notification
    await Notification.create(
      [
        {
          userId: req.user.id,
          title: "Transfer Completed",
          message: `Your transfer of $${amount.toFixed(2)} from ${fromAccount.name} to ${toAccount.name} has been completed.`,
          type: "transaction",
        },
      ],
      { session },
    )

    // Commit transaction
    await session.commitTransaction()
    session.endSession()

    res.status(200).json({
      success: true,
      message: "Transfer completed successfully",
      data: {
        fromAccount: {
          id: fromAccount._id,
          name: fromAccount.name,
          newBalance: fromAccount.balance,
        },
        toAccount: {
          id: toAccount._id,
          name: toAccount.name,
          newBalance: toAccount.balance,
        },
        amount,
        transactions: [withdrawalTransaction[0], depositTransaction[0]],
      },
    })
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction()
    session.endSession()
    next(error)
  }
}
