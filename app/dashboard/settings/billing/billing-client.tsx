"use client"

import { useState } from "react"
import { useAuth } from "@/components/firebase-auth-provider"
import { PricingSection, type Product } from "@/components/PricingSection"
import { CheckoutForm } from "@/components/CheckoutForm" // Ensure you have this from your dashboard setup
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { CreditCard, Zap, Download, Clock, Plus, AlertCircle } from "lucide-react"

export function BillingClient({ products }: { products: Product[] }) {
  const { profile, profileLoading } = useAuth()
  
  const [showPricing, setShowPricing] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedPriceId, setSelectedPriceId] = useState<string>("")

  const credits = profile?.walletBalance ?? 0

  const handleSelectProduct = (priceId: string) => {
    setSelectedPriceId(priceId)
    setShowCheckout(true)
    setShowPricing(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Billing & Plans</h3>
        <p className="text-sm text-muted-foreground">
          Manage your credit balance, payment methods, and invoices.
        </p>
      </div>
      <Separator />

      {/* 1. Wallet Balance & Top Up */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-primary">Wallet Balance</CardTitle>
            <CardDescription>Credits available for AI services</CardDescription>
          </div>
          <Zap className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight">
              {profileLoading ? "..." : credits.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-muted-foreground">credits</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ≈ ${(credits / 100).toFixed(2)} USD value
          </p>
        </CardContent>
        <CardFooter>
          <Dialog open={showPricing} onOpenChange={setShowPricing}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto gap-2">
                <Plus className="w-4 h-4" /> Top Up Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-[900px] max-h-[85vh] overflow-auto p-8 bg-background/95 backdrop-blur-xl">
              <DialogHeader className="mb-6 text-center">
                <DialogTitle className="text-2xl font-bold">Top up your wallet</DialogTitle>
                <DialogDescription className="text-base">
                  Select a credit pack to continue using our API services.
                </DialogDescription>
              </DialogHeader>
              <PricingSection products={products} onSelect={handleSelectProduct} />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* Checkout Modal (If active) */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>Securely pay via Stripe</DialogDescription>
          </DialogHeader>
          {selectedPriceId && (
            <CheckoutForm 
              priceId={selectedPriceId} 
              onClose={() => setShowCheckout(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Payment Methods (Mocked for now) */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage cards used for auto-recharge and top-ups.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-14 items-center justify-center rounded border bg-white dark:bg-zinc-900">
                <CreditCard className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/2028</p>
              </div>
            </div>
            <Badge variant="secondary">Default</Badge>
          </div>
          
          <Button variant="outline" className="w-full sm:w-auto" disabled>
            <Plus className="w-4 h-4 mr-2" /> Add New Card
          </Button>
        </CardContent>
      </Card>

      {/* 3. Invoice History (Mocked) */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>View and download your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
             {/* Simple Table Header */}
             <div className="grid grid-cols-4 gap-4 bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
               <div className="col-span-2">Description</div>
               <div>Date</div>
               <div className="text-right">Amount</div>
             </div>
             
             {/* Mock Row 1 */}
             <div className="grid grid-cols-4 gap-4 p-3 text-sm items-center border-t">
               <div className="col-span-2 flex items-center gap-2">
                 <div className="bg-green-500/10 p-1.5 rounded-full">
                    <CheckIcon />
                 </div>
                 <span className="font-medium">Credit Pack (Pro)</span>
               </div>
               <div className="text-muted-foreground">Oct 24, 2025</div>
               <div className="text-right font-medium">$24.99</div>
             </div>

             {/* Mock Row 2 */}
             <div className="grid grid-cols-4 gap-4 p-3 text-sm items-center border-t">
               <div className="col-span-2 flex items-center gap-2">
                 <div className="bg-green-500/10 p-1.5 rounded-full">
                    <CheckIcon />
                 </div>
                 <span className="font-medium">Credit Pack (Starter)</span>
               </div>
               <div className="text-muted-foreground">Sep 12, 2025</div>
               <div className="text-right font-medium">$9.99</div>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CheckIcon() {
  return <Clock className="w-3 h-3 text-green-600" />
}