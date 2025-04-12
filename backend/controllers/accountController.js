const Account = require("../models/Account")
const Transaction = require("../models/Transaction")
const mongoose = require("mongoose")

// Get all accounts for a user
exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ userId: req.user.id })

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    })
  } catch (error) {
    next(error)
  }
}

// Get single account
exports.getAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      })
    }

    res.status(200).json({
      success: true,
      data: account,
    })
  } catch (error) {
    next(error)
  }
}

// Get account summary (total balance, income, expenses)
exports.getAccountSummary = async (req, res, next) => {
  try {
    // Get all accounts for the user
    const accounts = await Account.find({ userId: req.user.id })

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

    // Get current month's start and end dates
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get previous month's start and end dates
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get account IDs
    const accountIds = accounts.map((account) => account._id)

    // Get income for current month (deposits)
    const currentMonthIncome = await Transaction.aggregate([
      {
        $match: {
          accountId: { $in: accountIds },
          type: "Deposit",
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])

    // Get income for previous month
    const prevMonthIncome = await Transaction.aggregate([
      {
        $match: {
          accountId: { $in: accountIds },
          type: "Deposit",
          date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])

    // Get expenses for current month (withdrawals)
    const currentMonthExpenses = await Transaction.aggregate([
      {
        $match: {
          accountId: { $in: accountIds },
          type: "Withdrawal",
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])

    // Get expenses for previous month
    const prevMonthExpenses = await Transaction.aggregate([
      {
        $match: {
          accountId: { $in: accountIds },
          type: "Withdrawal",
          date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])

    // Get pending transactions
    const pendingTransactions = await Transaction.find({
      accountId: { $in: accountIds },
      status: "Pending",
    })

    // Calculate pending amount
    const pendingAmount = pendingTransactions.reduce((sum, transaction) => {
      if (transaction.type === "Deposit") {
        return sum + transaction.amount
      } else if (transaction.type === "Withdrawal" || transaction.type === "Transfer") {
        return sum - transaction.amount
      }
      return sum
    }, 0)

    // Calculate percentage changes
    const currentIncome = currentMonthIncome.length > 0 ? currentMonthIncome[0].total : 0
    const prevIncome = prevMonthIncome.length > 0 ? prevMonthIncome[0].total : 0
    const incomeChange = prevIncome === 0 ? 0 : ((currentIncome - prevIncome) / prevIncome) * 100

    const currentExpenses = currentMonthExpenses.length > 0 ? currentMonthExpenses[0].total : 0
    const prevExpenses = prevMonthExpenses.length > 0 ? prevMonthExpenses[0].total : 0
    const expensesChange = prevExpenses === 0 ? 0 : ((currentExpenses - prevExpenses) / prevExpenses) * 100

    res.status(200).json({
      success: true,
      data: {
        totalBalance,
        income: {
          amount: currentIncome,
          change: incomeChange,
        },
        expenses: {
          amount: currentExpenses,
          change: expensesChange,
        },
        pending: {
          amount: pendingAmount,
          count: pendingTransactions.length,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}
