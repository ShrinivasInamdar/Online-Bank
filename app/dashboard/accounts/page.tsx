"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Download, Filter } from "lucide-react"
import { getAccounts, getAccountTransactions } from "@/lib/account-service"
import type { Account, Transaction } from "@/lib/types"
import AccountDetails from "@/components/dashboard/account-details"
import TransactionList from "@/components/dashboard/transaction-list"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

export default function AccountsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountId = searchParams.get("id")

  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountsData = await getAccounts()
        setAccounts(accountsData)

        // If accountId is provided in URL, select that account
        if (accountId) {
          const account = accountsData.find((acc) => acc.id === accountId)
          if (account) {
            setSelectedAccount(account)
            fetchTransactions(accountId)
            return
          }
        }

        // Otherwise select the first account
        if (accountsData.length > 0) {
          setSelectedAccount(accountsData[0])
          fetchTransactions(accountsData[0].id)
        }
      } catch (error) {
        console.error("Error fetching accounts:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchTransactions = async (id: string) => {
      try {
        const transactionsData = await getAccountTransactions(id)
        setTransactions(transactionsData)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      }
    }

    fetchAccounts()
  }, [accountId])

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account)
    router.push(`/dashboard/accounts?id=${account.id}`, { scroll: false })
    getAccountTransactions(account.id).then(setTransactions)
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
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your bank accounts and view transaction history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Accounts</CardTitle>
              <CardDescription>Select an account to view details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted ${
                    selectedAccount?.id === account.id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleAccountSelect(account)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {account.accountNumber.slice(-4).padStart(account.accountNumber.length, "*")}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedAccount ? (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Account Details</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="statements">Statements</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <AccountDetails account={selectedAccount} />
              </TabsContent>
              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>View and filter your transaction history for this account.</CardDescription>
                    </div>
                    <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="mr-2 h-4 w-4" />
                          Filter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Filter Transactions</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="type">Transaction Type</Label>
                            <Select>
                              <SelectTrigger id="type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="deposit">Deposits</SelectItem>
                                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                                <SelectItem value="transfer">Transfers</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label>From Date</Label>
                              <DatePicker />
                            </div>
                            <div className="grid gap-2">
                              <Label>To Date</Label>
                              <DatePicker />
                            </div>
                          </div>
                          <Button onClick={() => setFilterOpen(false)}>Apply Filters</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <TransactionList transactions={transactions} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="statements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Statements</CardTitle>
                    <CardDescription>Download your monthly account statements.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { month: "March 2024", url: "#" },
                        { month: "February 2024", url: "#" },
                        { month: "January 2024", url: "#" },
                      ].map((statement) => (
                        <div key={statement.month} className="flex items-center justify-between rounded-lg border p-3">
                          <div>{statement.month}</div>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Select an account to view details.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
