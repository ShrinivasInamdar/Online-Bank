"use client"

import { useState } from "react"
import { Bell, Search, Sun, Moon, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth-provider"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function Header() {
  const { setTheme } = useTheme()
  const { user } = useAuth()
  const router = useRouter()
  const [unreadNotifications] = useState(3) // This would come from an API call in a real app

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b border-border bg-background px-6">
      <div className="flex flex-1 items-center gap-4">
        <form className="hidden md:block md:flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full max-w-sm bg-background pl-8 focus-visible:ring-primary"
            />
          </div>
        </form>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => router.push("/dashboard/notifications")}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge
                className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs"
                variant="destructive"
              >
                {unreadNotifications}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push("/dashboard/profile")}>
            <User className="h-4 w-4" />
            <span className="hidden md:inline-block">
              {user?.firstName} {user?.lastName}
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}
