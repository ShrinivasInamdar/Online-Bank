import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { Account, Transaction, getAccount, getTransactions, createAccount } from '../lib/mockData';

export default function Dashboard() {
  const { user } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAccountData();
      fetchTransactions();
    }
  }, [user]);

  const fetchAccountData = async () => {
    try {
      let userAccount = getAccount(user!.id);
      if (!userAccount) {
        userAccount = createAccount(user!.id);
      }
      setAccount(userAccount);
    } catch (error) {
      toast.error('Failed to fetch account data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const userTransactions = getTransactions(user!.id);
      setTransactions(userTransactions);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Account Overview</h2>
          <CreditCard className="h-6 w-6 text-blue-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              ${account?.balance.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Account Number</p>
            <p className="text-lg font-medium text-gray-900">
              {account?.accountNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center space-x-3">
          <ArrowUpRight className="h-5 w-5 text-green-600" />
          <span className="font-medium">Send Money</span>
        </button>
        <button className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center space-x-3">
          <ArrowDownLeft className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Request Money</span>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
          <History className="h-6 w-6 text-blue-600" />
        </div>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {transaction.type === 'deposit' ? (
                  <ArrowDownLeft className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className={`font-medium ${
                transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}