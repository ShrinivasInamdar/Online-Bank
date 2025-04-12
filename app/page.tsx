import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, CreditCard, BarChart3, Lock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6 text-primary" />
            <span>SecureBank</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#security" className="text-sm font-medium hover:underline underline-offset-4">
              Security
            </Link>
            <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Banking Made Simple, Secure, and Smart
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Experience the future of banking with our secure, intuitive, and feature-rich online banking
                    platform.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[500px] aspect-video overflow-hidden rounded-xl border bg-background shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20"></div>
                  <div className="relative p-6 flex flex-col items-center justify-center h-full text-center">
                    <CreditCard className="h-16 w-16 mb-4 text-primary" />
                    <h3 className="text-2xl font-bold">Secure Banking Dashboard</h3>
                    <p className="text-muted-foreground mt-2">
                      Manage your accounts, track transactions, and transfer funds securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Powerful Banking Features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to manage your finances in one secure place.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Account Management</h3>
                <p className="text-center text-muted-foreground">
                  View balances, update profile, and manage your accounts with ease.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Transaction History</h3>
                <p className="text-center text-muted-foreground">
                  Detailed transaction history with filters and downloadable statements.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Secure Transfers</h3>
                <p className="text-center text-muted-foreground">
                  Transfer funds between accounts securely with real-time notifications.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Bank-Grade Security</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Your security is our top priority. We employ multiple layers of protection.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex items-center space-x-4">
                  <Shield className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">End-to-End Encryption</h3>
                    <p className="text-muted-foreground">All your data is encrypted in transit and at rest.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex items-center space-x-4">
                  <Lock className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">Multi-Factor Authentication</h3>
                    <p className="text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2024 SecureBank. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="#" className="hover:underline underline-offset-4">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
