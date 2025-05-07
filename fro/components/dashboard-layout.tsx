"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Shield, Home, User, ArrowRightLeft, FileText, Users, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import NotificationCenter from "@/components/notification-center"

interface UserInfo {
  name: string
  email: string
  phno: string
  balance: number
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Get user info from localStorage
    const storedUserInfo = localStorage.getItem("userInfo")
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo)
      setUserInfo(parsedUserInfo)
      setIsAdmin(parsedUserInfo.name === "Admin")
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userInfo")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default",
    })
    router.push("/login")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    if (isMobile) {
      setIsMenuOpen(false)
    }
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/account", label: "Account", icon: User },
    { href: "/dashboard/transfer", label: "Transfer", icon: ArrowRightLeft },
    { href: "/dashboard/transactions", label: "Transactions", icon: FileText },
  ]

  // Add admin-only nav item
  if (isAdmin) {
    navItems.push({ href: "/dashboard/admin", label: "Admin Panel", icon: Users })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-blue-600">SecureBank</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`${
          isMobile
            ? isMenuOpen
              ? "fixed inset-0 z-50 bg-white w-64 transform translate-x-0 transition-transform duration-200 ease-in-out"
              : "fixed inset-0 z-50 bg-white w-64 transform -translate-x-full transition-transform duration-200 ease-in-out"
            : "w-64 bg-white border-r"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-blue-600">SecureBank</span>
            </div>
            <NotificationCenter />
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 mt-8"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>

      {/* Overlay for mobile menu */}
      {isMobile && isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMenu}></div>}
    </div>
  )
}
