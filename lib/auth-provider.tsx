"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<User>
  register: (userData: any) => Promise<User>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }

    // Verify token with backend
    const verifyToken = async () => {
      if (token) {
        try {
          const { user } = await authAPI.getMe()
          setUser(user)
        } catch (error) {
          console.error("Error verifying token:", error)
          localStorage.removeItem("user")
          localStorage.removeItem("token")
          setUser(null)
        }
      }
      setLoading(false)
    }

    verifyToken()
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const { user, token } = await authAPI.login({ email, password })

      // Store user and token in localStorage
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", token)

      setUser(user)
      return user
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (userData: any): Promise<User> => {
    try {
      const { user, token } = await authAPI.register(userData)

      // Store user and token in localStorage
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", token)

      setUser(user)
      return user
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear localStorage and state
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      setUser(null)
      router.push("/login")
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
