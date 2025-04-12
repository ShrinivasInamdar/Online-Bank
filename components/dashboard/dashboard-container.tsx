import type React from "react"
interface DashboardContainerProps {
  children: React.ReactNode
}

export default function DashboardContainer({ children }: DashboardContainerProps) {
  return <div className="w-full max-w-7xl mx-auto">{children}</div>
}
