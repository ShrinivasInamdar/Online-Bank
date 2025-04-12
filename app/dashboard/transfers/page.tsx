"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { getAccounts, transferFunds } from "@/lib/account-service"
import type { Account } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

const transferFormSchema = z.object({
  fromAccount: z.string({
    required_error: "Please select the source account.",
  }),
  toAccount: z.string({
    required_error: "Please select the destination account.",
  }),
  amount: z.coerce
    .number({
      required_error: "Please enter an amount.",
      invalid_type_error: "Please enter a valid amount.",
    })
    .positive({
      message: "Amount must be greater than 0.",
    }),
  description: z.string().optional(),
})

export default function TransfersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromAccountId = searchParams.get("from")

  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof transferFormSchema>>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      description: "",
    },
  })

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountsData = await getAccounts()
        setAccounts(accountsData)

        // If fromAccountId is provided in URL, set it as the default
        if (fromAccountId) {
          form.setValue("fromAccount", fromAccountId)
        }
      } catch (error) {
        console.error("Error fetching accounts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [fromAccountId, form])

  async function onSubmit(values: z.infer<typeof transferFormSchema>) {
    setIsSubmitting(true)
    try {
      // In a real app, this would call an API to process the transfer
      await transferFunds({
        fromAccountId: values.fromAccount,
        toAccountId: values.toAccount,
        amount: values.amount,
        description: values.description,
      })

      toast({
        title: "Transfer successful",
        description: `${formatCurrency(values.amount)} has been transferred successfully.`,
      })

      form.reset()

      // Redirect to dashboard after successful transfer
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transfer failed",
        description: "There was an error processing your transfer. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>
        <p className="text-muted-foreground">Transfer money between your accounts or to other recipients.</p>
      </div>

      <Tabs defaultValue="between-accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="between-accounts">Between My Accounts</TabsTrigger>
          <TabsTrigger value="to-others">To Other Recipients</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Transfers</TabsTrigger>
        </TabsList>
        <TabsContent value="between-accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Between Accounts</CardTitle>
              <CardDescription>Move money between your own accounts instantly.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fromAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Account</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select source account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name} ({formatCurrency(account.balance)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="toAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To Account</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-muted-foreground">$</span>
                            </div>
                            <Input placeholder="0.00" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Add a note about this transfer" className="resize-none" {...field} />
                        </FormControl>
                        <FormDescription>This will appear in your transaction history.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Transfer Funds"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="to-others" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer to Other Recipients</CardTitle>
              <CardDescription>Send money to friends, family, or businesses.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">External transfers feature coming soon.</div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Transfers</CardTitle>
              <CardDescription>Set up recurring or future-dated transfers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">Scheduled transfers feature coming soon.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
