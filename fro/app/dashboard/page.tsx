"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, CreditCard, FileText } from "lucide-react"
import Link from "next/link"
import AuthCheck from "@/components/auth-check"
import DashboardLayout from "@/components/dashboard-layout"

interface Transaction {
  type: string
  amount: number
  time: string
  desc: string
}

interface UserInfo {
  name: string
  email: string
  phno: string
  balance: number
}

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        // Get user info from localStorage
        const storedUserInfo = localStorage.getItem("userInfo")
        if (storedUserInfo) {
          setUserInfo(JSON.parse(storedUserInfo))
        }

        // Fetch recent transactions
        const transactionsResponse = await fetch("https://ooseproject.onrender.com/transactions/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json()
          // Get only the   {
          // const transactionsData = await transactionsResponse.json(); // Removed redeclaration
          // Get only the most recent 5 transactions
          setRecentTransactions(transactionsData.slice(0, 5))
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <AuthCheck>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {userInfo?.name || "User"}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <CreditCard className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userInfo ? formatCurrency(userInfo.balance) : "Loading..."}</div>
                <p className="text-xs text-gray-500 mt-1">Available funds</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Quick Transfer</CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-3">Send money quickly and securely</p>
                <Button asChild className="w-full">
                  <Link href="/dashboard/transfer">Transfer Funds</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-3">View your transaction history</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/transactions">View All</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 text-center">Loading transactions...</div>
                ) : recentTransactions.length > 0 ? (
                  <div className="divide-y">
                    {recentTransactions.map((transaction, index) => (
                      <div key={index} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{transaction.desc}</p>
                          <p className="text-sm text-gray-500">{formatDate(transaction.time)}</p>
                        </div>
                        <div
                          className={`font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "credit" ? "+" : "-"} {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">No recent transactions</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthCheck>
  )
}
