import type { Account, Transaction } from "./types"

// Mock accounts data
const accounts: Account[] = [
  {
    id: "1",
    userId: "1",
    name: "Checking Account",
    type: "Checking",
    accountNumber: "1234567890",
    balance: 5280.42,
    availableBalance: 5280.42,
    interestRate: 0.01,
    openingDate: "2022-01-15",
    features: ["No monthly fees", "Free online banking", "Unlimited transactions", "Debit card included"],
  },
  {
    id: "2",
    userId: "1",
    name: "Savings Account",
    type: "Savings",
    accountNumber: "0987654321",
    balance: 12750.89,
    availableBalance: 12750.89,
    interestRate: 1.25,
    openingDate: "2022-01-15",
    features: ["High interest rate", "No minimum balance", "Automatic savings program", "Quarterly statements"],
  },
  {
    id: "3",
    userId: "1",
    name: "Credit Card",
    type: "Credit",
    accountNumber: "5555666677778888",
    balance: 1250.0,
    availableBalance: 8750.0,
    interestRate: 18.99,
    openingDate: "2022-03-10",
    features: ["Cash back rewards", "No annual fee", "Fraud protection", "Travel insurance"],
  },
]

// Mock transactions data
const transactions: Transaction[] = [
  {
    id: "1",
    accountId: "1",
    type: "Deposit",
    amount: 1500.0,
    description: "Salary Deposit",
    date: "2024-04-01",
    category: "Income",
  },
  {
    id: "2",
    accountId: "1",
    type: "Withdrawal",
    amount: 85.75,
    description: "Grocery Store",
    date: "2024-04-03",
    category: "Shopping",
  },
  {
    id: "3",
    accountId: "1",
    type: "Withdrawal",
    amount: 125.5,
    description: "Electric Bill",
    date: "2024-04-05",
    category: "Utilities",
  },
  {
    id: "4",
    accountId: "2",
    type: "Deposit",
    amount: 500.0,
    description: "Savings Transfer",
    date: "2024-04-02",
    category: "Transfer",
  },
  {
    id: "5",
    accountId: "3",
    type: "Withdrawal",
    amount: 250.0,
    description: "Online Purchase",
    date: "2024-04-04",
    category: "Shopping",
  },
  {
    id: "6",
    accountId: "1",
    type: "Transfer",
    amount: 350.0,
    description: "Transfer to Savings",
    date: "2024-04-06",
    category: "Transfer",
  },
]

// In a real app, these would be API calls to a backend server

export async function getAccounts(): Promise<Account[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app, this would filter by the logged-in user's ID
  return accounts
}

export async function getAccount(accountId: string): Promise<Account | undefined> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return accounts.find((account) => account.id === accountId)
}

export async function getAccountTransactions(accountId: string): Promise<Transaction[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return transactions.filter((transaction) => transaction.accountId === accountId)
}

export async function getRecentTransactions(limit = 10): Promise<Transaction[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Sort by date (newest first) and limit
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
}

export async function transferFunds(data: {
  fromAccountId: string
  toAccountId: string
  amount: number
  description?: string
}): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // In a real app, this would update account balances and create transaction records

  // For demo purposes, just return success
  return true
}
