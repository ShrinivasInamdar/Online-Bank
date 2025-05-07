"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  title: string
  message: string
  time: Date
  read: boolean
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load notifications from localStorage
    const storedNotifications = localStorage.getItem("notifications")
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications)
      setNotifications(parsedNotifications)

      // Count unread notifications
      const unread = parsedNotifications.filter((n: Notification) => !n.read).length
      setUnreadCount(unread)
    }
  }, [])

  useEffect(() => {
    // Listen for custom notification events
    const handleNewNotification = (event: CustomEvent) => {
      const newNotification = event.detail

      setNotifications((prev) => {
        const updated = [newNotification, ...prev]
        // Store in localStorage
        localStorage.setItem("notifications", JSON.stringify(updated))
        return updated
      })

      setUnreadCount((prev) => prev + 1)
    }

    window.addEventListener("newNotification" as any, handleNewNotification as EventListener)

    return () => {
      window.removeEventListener("newNotification" as any, handleNewNotification as EventListener)
    }
  }, [])

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }))

    setNotifications(updatedNotifications)
    setUnreadCount(0)

    // Update localStorage
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-4 ${notification.read ? "bg-white" : "bg-blue-50"}`}>
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{notification.title}</h4>
                    <span className="text-xs text-gray-500">{formatTime(notification.time)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
