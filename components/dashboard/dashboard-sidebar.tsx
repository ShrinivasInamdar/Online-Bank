"use client"

import Link from "next/link"
import { LayoutDashboard, CreditCard, ArrowLeftRight, Bell, Settings, HelpCircle, User } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  currentPath: string
}

export default function DashboardSidebar({ currentPath }: DashboardSidebarProps) {
  const { user } = useAuth()

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Accounts",
      icon: CreditCard,
      href: "/dashboard/accounts",
    },
    {
      title: "Transfers",
      icon: ArrowLeftRight,
      href: "/dashboard/transfers",
    },
    {
      title: "Notifications",
      icon: Bell,
      href: "/dashboard/notifications",
    },
    {
      title: "Profile",
      icon: User,
      href: "/dashboard/profile",
    },
  ]

  const supportItems = [
    {
      title: "Help & Support",
      icon: HelpCircle,
      href: "/dashboard/support",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ]

  return (
    <aside className="fixed left-0 z-20 flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-background">
      <div className="flex flex-1 flex-col overflow-y-auto py-4">
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">Menu</h2>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = currentPath === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">Support</h2>
        </div>
        <nav className="mt-2 space-y-1 px-2">
          {supportItems.map((item) => {
            const isActive = currentPath === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto px-4">
          <div className="rounded-lg border p-3">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-semibold">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
