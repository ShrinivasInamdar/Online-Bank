"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import AuthCheck from "@/components/auth-check"
import DashboardLayout from "@/components/dashboard-layout"

interface UserInfo {
  name: string
  email: string
  phno: string
  balance: number
}

export default function AccountPage() {
  const { toast } = useToast()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phno: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get user info from localStorage
    const storedUserInfo = localStorage.getItem("userInfo")
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo)
      setUserInfo(parsedUserInfo)
      setFormData({
        name: parsedUserInfo.name,
        phno: parsedUserInfo.phno,
      })
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("https://ooseproject.onrender.com/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Update user info in localStorage
        if (userInfo) {
          const updatedUserInfo = {
            ...userInfo,
            name: formData.name,
            phno: formData.phno,
          }
          localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo))
          setUserInfo(updatedUserInfo)
        }

        toast({
          title: "Account Updated",
          description: "Your account information has been updated successfully.",
          variant: "default",
        })
      } else {
        toast({
          title: "Update Failed",
          description: data.msg || "An error occurred while updating your account.",
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

  return (
    <AuthCheck>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account</h1>
            <p className="text-gray-500 mt-1">Manage your account information</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>View and update your personal details</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={userInfo?.email || ""} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phno">Phone Number</Label>
                    <Input id="phno" name="phno" value={formData.phno} onChange={handleChange} required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Balance</CardTitle>
                <CardDescription>Your current account balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">
                  {userInfo ? formatCurrency(userInfo.balance) : "Loading..."}
                </div>
                <p className="text-sm text-gray-500">
                  To add funds to your account, please contact an administrator or use the transfer feature.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <a href="/dashboard/transfer">Transfer Funds</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthCheck>
  )
}
