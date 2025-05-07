"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import AuthCheck from "@/components/auth-check"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { createNotification } from "@/utils/notifications"

interface Transaction {
  type: string
  amount: number
  time: string
  desc: string
}

export default function TransactionsPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await fetch("https://ooseproject.onrender.com/transactions/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setTransactions(data)
          setFilteredTransactions(data)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch transactions.",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Network error. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [toast])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTransactions(transactions)
    } else {
      const filtered = transactions.filter(
        (transaction) =>
          transaction.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.amount.toString().includes(searchTerm) ||
          new Date(transaction.time).toLocaleDateString().includes(searchTerm),
      )
      setFilteredTransactions(filtered)
    }
  }, [searchTerm, transactions])

  const handleDownloadCSV = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      toast({
        title: "Preparing Download",
        description: "Your statement is being prepared for download...",
        variant: "default",
      })

      const response = await fetch("https://ooseproject.onrender.com/transactions/download", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob()

        // Create a link element and trigger download
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "statement.csv"
        document.body.appendChild(a)
        a.click()

        // Clean up
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Download Complete",
          description: "Your transaction statement has been downloaded.",
          variant: "success",
        })

        // Create a notification
        createNotification("Statement Downloaded", "Your transaction statement has been successfully downloaded.")
      } else {
        toast({
          title: "Download Failed",
          description: "Failed to download transaction statement.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again later.",
        variant: "destructive",
      })
    }
  }

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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AuthCheck>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
              <p className="text-gray-500 mt-1">View and download your transaction history</p>
            </div>
            <Button onClick={handleDownloadCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your complete transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading transactions...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Description</th>
                        <th className="text-left py-3 px-4">Date & Time</th>
                        <th className="text-right py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{transaction.desc}</td>
                          <td className="py-3 px-4">{formatDate(transaction.time)}</td>
                          <td
                            className={`py-3 px-4 text-right ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="py-3 px-4 capitalize">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs ${
                                transaction.type === "credit"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthCheck>
  )
}
