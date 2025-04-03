export interface Account {
  id: string;
  userId: string;
  balance: number;
  accountNumber: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  description: string;
  createdAt: string;
}

const ACCOUNTS_KEY = 'mock_accounts';
const TRANSACTIONS_KEY = 'mock_transactions';

export const getAccount = (userId: string): Account | null => {
  const accounts: Account[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  return accounts.find(a => a.userId === userId) || null;
};

export const createAccount = (userId: string): Account => {
  const accounts: Account[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  const newAccount: Account = {
    id: crypto.randomUUID(),
    userId,
    balance: 1000, // Starting balance
    accountNumber: Math.random().toString().slice(2, 11),
    createdAt: new Date().toISOString()
  };
  accounts.push(newAccount);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return newAccount;
};

export const getTransactions = (userId: string): Transaction[] => {
  const transactions: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  return transactions
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createTransaction = (
  userId: string,
  accountId: string,
  amount: number,
  type: Transaction['type'],
  description: string
): Transaction => {
  const transactions: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  const accounts: Account[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  
  const account = accounts.find(a => a.id === accountId);
  if (!account) throw new Error('Account not found');

  if (type === 'withdrawal' && account.balance < amount) {
    throw new Error('Insufficient funds');
  }

  account.balance += type === 'deposit' ? amount : -amount;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

  const newTransaction: Transaction = {
    id: crypto.randomUUID(),
    userId,
    accountId,
    amount,
    type,
    description,
    createdAt: new Date().toISOString()
  };

  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return newTransaction;
};