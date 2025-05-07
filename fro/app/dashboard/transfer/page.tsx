"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import AuthCheck from "@/components/auth-check"
import DashboardLayout from "@/components/dashboard-layout"
import QRCode from "@/components/qr-code"
import QRScanner from "@/components/qr-scanner"
// Add import for createNotification
import { createNotification } from "@/utils/notifications"

export default function TransferPage() {
  const { toast } = useToast()
  const [transferData, setTransferData] = useState({
    to_email: "",
    amount: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTransferData((prev) => ({ ...prev, [name]: value }))
  }

  // Update the handleQRScan function to provide more detailed toast notifications
  const handleQRScan = (email: string) => {
    setTransferData((prev) => ({ ...prev, to_email: email }))
    toast({
      title: "QR Code Scanned Successfully",
      description: `Recipient email detected: ${email}. Please enter the amount to transfer.`,
      variant: "default",
    })
  }

  // Update the handleTransfer function to add more detailed toast notifications
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Validate amount
      const amount = Number.parseFloat(transferData.amount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount greater than 0.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      toast({
        title: "Processing Transfer",
        description: "Please wait while we process your transfer...",
        variant: "default",
      })

      const response = await fetch("https://ooseproject.onrender.com/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to_email: transferData.to_email,
          amount: amount,
        }),
      })

      const data = await response.json()

      // Update the handleTransfer function to create a notification on successful transfer
      if (response.ok) {
        toast({
          title: "Transfer Successful",
          description: `Successfully transferred ₹${amount} to ${transferData.to_email}.`,
          variant: "success",
        })

        // Create a notification
        createNotification("Transfer Successful", `You have transferred ₹${amount} to ${transferData.to_email}.`)

        // Update user balance in localStorage
        const userInfoStr = localStorage.getItem("userInfo")
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr)
          userInfo.balance -= amount
          localStorage.setItem("userInfo", JSON.stringify(userInfo))
        }

        // Reset form
        setTransferData({
          to_email: "",
          amount: "",
        })
      } else {
        toast({
          title: "Transfer Failed",
          description: data.msg || "An error occurred during the transfer.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCheck>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transfer Funds</h1>
            <p className="text-gray-500 mt-1">Send money to other users securely</p>
          </div>

          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="standard">Standard Transfer</TabsTrigger>
              <TabsTrigger value="qr">QR Transfer</TabsTrigger>
            </TabsList>
            <TabsContent value="standard">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>Standard Transfer</CardTitle>
                  <CardDescription>Transfer funds to another user using their email</CardDescription>
                </CardHeader>
                <form onSubmit={handleTransfer}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="to_email">Recipient Email</Label>
                      <Input
                        id="to_email"
                        name="to_email"
                        type="email"
                        placeholder="recipient@example.com"
                        value={transferData.to_email}
                        onChange={handleChange}
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
                        value={transferData.amount}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Processing..." : "Transfer Funds"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="qr">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Scan QR Code</CardTitle>
                    <CardDescription>Scan a QR code to transfer funds</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <QRScanner onScan={handleQRScan} />
                    <p className="text-sm text-gray-500 mt-4">
                      Don&apos;t have a QR? Ask your agent or recipient to generate one and scan it here.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <form onSubmit={handleTransfer} className="w-full space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="qr_to_email">Recipient Email</Label>
                        <Input
                          id="qr_to_email"
                          name="to_email"
                          type="email"
                          placeholder="Scan QR code to populate"
                          value={transferData.to_email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qr_amount">Amount (₹)</Label>
                        <Input
                          id="qr_amount"
                          name="amount"
                          type="number"
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          value={transferData.amount}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Processing..." : "Transfer Funds"}
                      </Button>
                    </form>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your QR Code</CardTitle>
                    <CardDescription>Share this QR code to receive funds</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center">
                    <QRCode />
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Others can scan this QR code to send you money. The QR contains your email address.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button variant="outline" id="download-qr">
                      Download QR Code
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthCheck>
  )
}
