"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function RecoverPassword() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [step, setStep] = useState(1) // 1: Email entry, 2: New password entry

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("https://ooseproject.onrender.com/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.reset_token) {
        setResetToken(data.reset_token)
        setStep(2)
        toast({
          title: "Reset Token Generated",
          description: "Please enter your new password.",
          variant: "default",
        })
      } else {
        toast({
          title: "Recovery Failed",
          description: data.msg || "Email not found or server error.",
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("https://ooseproject.onrender.com/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resetToken}`,
        },
        body: JSON.stringify({ new_password: newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset. You can now log in with your new password.",
          variant: "default",
        })
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      } else {
        toast({
          title: "Password Reset Failed",
          description: data.msg || "An error occurred during password reset.",
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">SecureBank</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recover Password</CardTitle>
            <CardDescription>
              {step === 1 ? "Enter your email to receive a password reset token" : "Enter your new password"}
            </CardDescription>
          </CardHeader>
          {step === 1 ? (
            <form onSubmit={handleRequestReset}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Requesting Reset..." : "Request Password Reset"}
                </Button>
                <div className="text-center text-sm">
                  Remember your password?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Back to Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
