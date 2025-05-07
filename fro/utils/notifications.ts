export function createNotification(title: string, message: string) {
  const notification = {
    id: Date.now().toString(),
    title,
    message,
    time: new Date(),
    read: false,
  }

  // Dispatch custom event
  const event = new CustomEvent("newNotification", { detail: notification })
  window.dispatchEvent(event)

  // Also store in localStorage
  const storedNotifications = localStorage.getItem("notifications")
  const notifications = storedNotifications ? JSON.parse(storedNotifications) : []
  notifications.unshift(notification)
  localStorage.setItem("notifications", JSON.stringify(notifications))

  return notification
}
