import { ArrowDownLeft, ArrowUpRight, CreditCard } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"

interface TransactionListProps {
  transactions: any[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-rose-500" />
      case "transfer":
        return <CreditCard className="h-4 w-4 text-blue-500" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return "text-emerald-600"
      case "withdrawal":
        return "text-rose-600"
      case "transfer":
        return "text-blue-600"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No transactions found.</div>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(transaction.date), "MMM d, yyyy • h:mm a")}
                  </div>
                </div>
              </div>
              <div className={`font-medium ${getTransactionColor(transaction.type)}`}>
                {transaction.type.toLowerCase() === "deposit"
                  ? "+"
                  : transaction.type.toLowerCase() === "withdrawal"
                    ? "-"
                    : ""}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
