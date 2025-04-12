"use client"

import type React from "react"

import { CreditCard } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface AccountCardProps {
  account: any
}

export default function AccountCard({ account }: AccountCardProps) {
  const router = useRouter()

  const getCardGradient = (type: string) => {
    switch (type.toLowerCase()) {
      case "checking":
        return "from-blue-500 to-blue-700"
      case "savings":
        return "from-emerald-500 to-emerald-700"
      case "credit":
        return "from-purple-500 to-purple-700"
      case "investment":
        return "from-amber-500 to-amber-700"
      default:
        return "from-gray-500 to-gray-700"
    }
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/dashboard/accounts?id=${account._id}`)
  }

  const handleTransfer = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/dashboard/transfers?from=${account._id}`)
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className={`bg-gradient-to-r ${getCardGradient(account.type)} p-6 text-white`}>
        <div className="flex justify-between items-center mb-4">
          <div className="font-medium">{account.name}</div>
          <CreditCard className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="text-sm opacity-90">Available Balance</div>
          <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
        </div>
        <div className="mt-4 text-sm">
          {account.accountNumber.slice(-4).padStart(account.accountNumber.length, "*")}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Account Type</div>
            <div className="font-medium">{account.type}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Interest Rate</div>
            <div className="font-medium">{account.interestRate}%</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="outline" size="sm" onClick={handleViewDetails}>
          View Details
        </Button>
        <Button size="sm" onClick={handleTransfer}>
          Transfer
        </Button>
      </CardFooter>
    </Card>
  )
}
