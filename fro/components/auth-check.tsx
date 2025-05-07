"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      try {
        // Verify token by making a request to the account endpoint
        const response = await fetch("https://ooseproject.onrender.com/account", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          // Token is invalid or expired
          localStorage.removeItem("token")
          localStorage.removeItem("userInfo")
          toast({
            title: "Session Expired",
            description: "Please log in again.",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        // Update user info
        const userData = await response.json()
        localStorage.setItem("userInfo", JSON.stringify(userData))
        setIsLoading(false)
      } catch (error) {
        toast({
          title: "Network Error",
          description: "Could not verify authentication. Please try again.",
          variant: "destructive",
        })
        router.push("/login")
      }
    }

    checkAuth()
  }, [router, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
