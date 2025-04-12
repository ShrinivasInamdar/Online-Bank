"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, DollarSign, Clock, Filter, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { accountAPI, transactionAPI } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import AccountCard from "@/components/dashboard/account-card"
import TransactionList from "@/components/dashboard/transaction-list"
import { useToast } from "@/components/ui/use-toast"
import FilterDialog from "@/components/dashboard/filter-dialog"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({
    totalBalance: 0,
    income: { amount: 0, change: 0 },
    expenses: { amount: 0, change: 0 },
    pending: { amount: 0, count: 0 },
  })
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch account data
        const accountsResponse = await accountAPI.getAccounts()
        setAccounts(accountsResponse.data)

        // Fetch account summary
        const summaryResponse = await accountAPI.getAccountSummary()
        setSummary(summaryResponse.data)

        // Fetch recent transactions
        const transactionsResponse = await transactionAPI.getRecentTransactions(5)
        setTransactions(transactionsResponse.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const handleNewTransfer = () => {
    router.push("/dashboard/transfers")
  }

  const handleAccountClick = (accountId) => {
    router.push(`/dashboard/accounts?id=${accountId}`)
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}! Here&apos;s an overview of your accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" onClick={handleNewTransfer}>
            <DollarSign className="mr-2 h-4 w-4" />
            New Transfer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalBalance)}</div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.income.amount)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.income.change >= 0 ? "+" : ""}
              {summary.income.change.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.expenses.amount)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.expenses.change >= 0 ? "+" : ""}
              {summary.expenses.change.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.pending.amount)}</div>
            <p className="text-xs text-muted-foreground">{summary.pending.count} pending transactions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div key={account._id} onClick={() => handleAccountClick(account._id)} className="cursor-pointer">
                <AccountCard account={account} />
              </div>
            ))}
            <Card className="flex h-full flex-col items-center justify-center p-6 border-dashed">
              <Button
                variant="outline"
                size="lg"
                className="h-20 w-20 rounded-full"
                onClick={() => router.push("/dashboard/accounts/new")}
              >
                <Plus className="h-6 w-6" />
              </Button>
              <p className="mt-4 text-center font-medium">Add New Account</p>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/transactions")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FilterDialog open={filterOpen} onOpenChange={setFilterOpen} accounts={accounts} />
    </div>
  )
}
