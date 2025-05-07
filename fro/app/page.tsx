import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, CreditCard, ArrowRightLeft, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-blue-600">SecureBank</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-12">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Banking Made Simple</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure, fast, and convenient banking at your fingertips. Manage your finances with ease.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CreditCard className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>Account Management</CardTitle>
              <CardDescription>View and manage your account details with ease</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Update your personal information, check your balance, and manage your banking preferences all in one
                place.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ArrowRightLeft className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>Easy Transfers</CardTitle>
              <CardDescription>Transfer funds quickly and securely</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Send money to anyone with just their email. Use QR codes for even faster transfers when meeting in
                person.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Track all your financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                View your complete transaction history and download statements for your records or financial planning.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto text-center text-gray-600">
          <p>© {new Date().getFullYear()} SecureBank. All rights reserved.</p>
          <p className="mt-2 text-sm">Secure, reliable banking for everyone.</p>
        </div>
      </footer>
    </div>
  )
}
