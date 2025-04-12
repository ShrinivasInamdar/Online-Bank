"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, Clock, AlertTriangle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Notification } from "@/lib/types"

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "1",
    title: "Login Alert",
    message: "New login detected from Chrome on Windows",
    date: "2024-04-11T10:30:00",
    read: false,
    type: "security",
  },
  {
    id: "2",
    userId: "1",
    title: "Transfer Complete",
    message: "Your transfer of $350.00 to Savings Account has been completed",
    date: "2024-04-10T15:45:00",
    read: true,
    type: "transaction",
  },
  {
    id: "3",
    userId: "1",
    title: "Low Balance Alert",
    message: "Your Checking Account balance is below $1,000",
    date: "2024-04-09T09:15:00",
    read: false,
    type: "alert",
  },
  {
    id: "4",
    userId: "1",
    title: "Statement Available",
    message: "Your March 2024 statement is now available",
    date: "2024-04-01T08:00:00",
    read: true,
    type: "info",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications)
      setLoading(false)
    }, 500)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "security":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "transaction":
        return <Check className="h-5 w-5 text-emerald-500" />
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-rose-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with important alerts and information about your accounts.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>View all your recent notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notifications to display.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-4 rounded-lg border p-4 transition-colors ${
                      !notification.read ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{notification.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatDate(notification.date)}</span>
                          {!notification.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                        Mark as read
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>View your unread notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.filter((n) => !n.read).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Check className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              ) : (
                notifications
                  .filter((n) => !n.read)
                  .map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-4 rounded-lg border p-4 bg-muted/50">
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{notification.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatDate(notification.date)}</span>
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                        Mark as read
                      </Button>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Notifications</CardTitle>
              <CardDescription>View security-related notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.filter((n) => n.type === "security").length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No security notifications to display.</p>
                </div>
              ) : (
                notifications
                  .filter((n) => n.type === "security")
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 rounded-lg border p-4 transition-colors ${
                        !notification.read ? "bg-muted/50" : ""
                      }`}
                    >
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{notification.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatDate(notification.date)}</span>
                            {!notification.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          Mark as read
                        </Button>
                      )}
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Notifications</CardTitle>
              <CardDescription>View transaction-related notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.filter((n) => n.type === "transaction").length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transaction notifications to display.</p>
                </div>
              ) : (
                notifications
                  .filter((n) => n.type === "transaction")
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 rounded-lg border p-4 transition-colors ${
                        !notification.read ? "bg-muted/50" : ""
                      }`}
                    >
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{notification.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatDate(notification.date)}</span>
                            {!notification.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          Mark as read
                        </Button>
                      )}
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
