"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import AuthCheck from "@/components/auth-check"
import DashboardLayout from "@/components/dashboard-layout"
import { useRouter } from "next/navigation"

interface UserAccount {
  id: string
  name: string
  email: string
  balance: number
  status: string
}

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<UserAccount[]>([])
  const [addFundsData, setAddFundsData] = useState({
    email: "",
    amount: "",
  })

  useEffect(() => {
    // Check if user is admin
    const userInfoStr = localStorage.getItem("userInfo")
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      if (userInfo.name === "Admin") {
        setIsAdmin(true)
        fetchAccounts()
      } else {
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the admin panel.",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    }
    setIsLoading(false)
  }, [router, toast])

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("https://ooseproject.onrender.com/admin/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch accounts.",
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

  const handleAddFundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddFundsData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Validate amount
      const amount = Number.parseFloat(addFundsData.amount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount greater than 0.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const response = await fetch("https://ooseproject.onrender.com/admin/add-funds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: addFundsData.email,
          amount: amount,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Funds Added",
          description: data.msg || `Added ₹${amount} to ${addFundsData.email}'s account.`,
          variant: "default",
        })

        // Reset form
        setAddFundsData({
          email: "",
          amount: "",
        })

        // Refresh accounts list
        fetchAccounts()
      } else {
        toast({
          title: "Failed to Add Funds",
          description: data.msg || "An error occurred while adding funds.",
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <AuthCheck>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </AuthCheck>
    )
  }

  if (!isAdmin) {
    return (
      <AuthCheck>
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2">You do not have permission to access the admin panel.</p>
          </div>
        </DashboardLayout>
      </AuthCheck>
    )
  }

  return (
    <AuthCheck>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-gray-500 mt-1">Manage user accounts and add funds</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Funds</CardTitle>
                <CardDescription>Add funds to a user's account</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddFunds}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">User Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="user@example.com"
                      value={addFundsData.email}
                      onChange={handleAddFundsChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      value={addFundsData.amount}
                      onChange={handleAddFundsChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Add Funds"}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Accounts</CardTitle>
              <CardDescription>View all user accounts in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-right py-3 px-4">Balance</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.length > 0 ? (
                      accounts.map((account) => (
                        <tr key={account.id} className="border-b">
                          <td className="py-3 px-4">{account.name}</td>
                          <td className="py-3 px-4">{account.email}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(account.balance)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs ${
                                account.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {account.status || "active"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500">
                          No accounts found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthCheck>
  )
}
