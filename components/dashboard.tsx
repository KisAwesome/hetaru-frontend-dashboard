"use client"

import { useMemo, useState } from "react"
import { TrendingDown, AlertCircle } from "lucide-react"

import { useAuth } from "@/components/firebase-auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { PricingSection, type Product } from "@/components/PricingSection"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

import { CheckoutForm } from "@/components/CheckoutForm"
import { TransactionHistory } from "@/components/TransactionHistory"
import { CreditsChart } from "./credits-chart"

export function Dashboard({ products }: { products: Product[] }) {
  const { user, profile, profileLoading } = useAuth()

  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedPriceId, setSelectedPriceId] = useState<string>("")

  const [showPricing, setShowPricing] = useState(false)



  const credits = useMemo(() => profile?.walletBalance ?? 0, [profile?.walletBalance])

  const handleSelectProduct = (priceId: string) => {
    setSelectedPriceId(priceId)
    setShowCheckout(true)
    setShowPricing(false) // ✅ close modal

  }

  return (
    <div className="space-y-6">
      {/* Credit Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profileLoading ? "..." : credits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Current balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3" /> Coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Services Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Credit Usage Trend</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <CreditsChart />
            </CardContent>
          </Card>
        </div>

<div className="space-y-4">
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-primary" />
        Top Up Wallet
      </CardTitle>
      <CardDescription>Add credits instantly</CardDescription>
    </CardHeader>

    <CardContent className="space-y-3">
      {/* ✅ Open modal instead of cramming cards */}
      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogTrigger asChild>
          <Button className="w-full">Choose a package</Button>
        </DialogTrigger>

    <DialogContent className="w-full sm:max-w-[900px] max-h-[85vh] overflow-auto p-8 border-none shadow-2xl bg-background/95 backdrop-blur-xl">
  <DialogHeader className="mb-6 text-center">
    <DialogTitle className="text-2xl font-bold">Top up your wallet</DialogTitle>
    <DialogDescription className="text-base">
      Select a credit pack to continue using our API services.
    </DialogDescription>
  </DialogHeader>

  <PricingSection products={products} onSelect={handleSelectProduct} />
</DialogContent>
      </Dialog>

      {/* Checkout can also be a modal; but keeping it here is okay */}
      {showCheckout && selectedPriceId && (
        <div className="rounded-xl border border-border bg-card/40 p-3">
          <CheckoutForm
            priceId={selectedPriceId}
            onClose={() => setShowCheckout(false)}
          />
        </div>
      )}

      <Button variant="outline" className="w-full" size="sm">
        API Documentation
      </Button>
    </CardContent>
  </Card>
</div>


      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your last API calls and their costs</CardDescription>
        </CardHeader>
        <CardContent className="p-0">{user ? <TransactionHistory user={user} /> : null}</CardContent>
      </Card>
    </div>
  )
}
