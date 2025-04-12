export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  password?: string
  phone?: string
  address?: string
}

export interface Account {
  id: string
  userId: string
  name: string
  type: string
  accountNumber: string
  balance: number
  availableBalance?: number
  interestRate: number
  openingDate: string
  features?: string[]
}

export interface Transaction {
  id: string
  accountId: string
  type: string
  amount: number
  description: string
  date: string
  category: string
  status?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  date: string
  read: boolean
  type: string
}
