import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Account } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"

interface AccountDetailsProps {
  account: Account
}

export default function AccountDetails({ account }: AccountDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{account.name}</CardTitle>
        <CardDescription>Account details and information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Account Number</div>
              <div className="mt-1 font-medium">{account.accountNumber}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Account Type</div>
              <div className="mt-1 font-medium">{account.type}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Current Balance</div>
              <div className="mt-1 font-medium">{formatCurrency(account.balance)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Available Balance</div>
              <div className="mt-1 font-medium">{formatCurrency(account.availableBalance || account.balance)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Interest Rate</div>
              <div className="mt-1 font-medium">{account.interestRate}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Opening Date</div>
              <div className="mt-1 font-medium">{formatDate(account.openingDate)}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Quick Actions</h3>
          <div className="grid gap-2 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              View Statements
            </Button>
            <Button variant="outline" className="justify-start">
              Transfer Money
            </Button>
            <Button variant="outline" className="justify-start">
              Set Up Alerts
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Account Features</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {account.features?.map((feature, index) => (
              <div key={index} className="flex items-start space-x-2 rounded-lg border p-3">
                <div className="h-2 w-2 mt-1.5 rounded-full bg-primary" />
                <div>{feature}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
