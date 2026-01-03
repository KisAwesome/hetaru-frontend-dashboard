"use client"

import { useEffect, useMemo, useState } from "react"
import { TrendingUp, AlertCircle, Zap, Activity } from "lucide-react"

import { useAuth } from "@/components/firebase-auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import dynamic from "next/dynamic" 
import { type Product } from "@/components/PricingSection"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

// ✅ NEW IMPORTS: For verification logic
import { useToast } from "@/hooks/use-toast"
import { EmailVerificationAlert } from "@/components/email-verification-alert"

import { CreditsChart } from "./credits-chart"
import { PricingSkeleton } from "./dashboard/skeletons/PricingSection"


const PricingSection = dynamic(() => import("@/components/PricingSection").then(mod => mod.PricingSection), {
  loading: () => <PricingSkeleton></PricingSkeleton>
})

const CheckoutForm = dynamic(() => import("@/components/CheckoutForm").then(mod => mod.CheckoutForm), {
  loading: () => <div className="p-4 animate-pulse">Loading secure checkout...</div>
})

const TransactionHistory = dynamic(() => import("@/components/TransactionHistory").then(mod => mod.TransactionHistory), {
  loading: () => <div className="h-40 w-full animate-pulse bg-muted/20" />
})

export function Dashboard({ products }: { products: Product[] }) {
  const { user, profile, profileLoading } = useAuth()
  const { toast } = useToast() // ✅ Hook for notifications

  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedPriceId, setSelectedPriceId] = useState<string>("")
  const [showPricing, setShowPricing] = useState(false)

  // 1. Safe Data Extraction
  const credits = useMemo(() => profile?.walletBalance ?? 0, [profile?.walletBalance])
  
  const monthSpent = profile?.usage?.monthSpent ?? 0
  const uniqueCount = profile?.usage?.uniqueServicesCount ?? 0
  const totalServices = 100 
  
  const serviceProgress = Math.min((uniqueCount / totalServices) * 100, 100)
  const handleSelectProduct = (priceId: string) => {
    // ✅ GATE: Check if email is verified
    if (user && !user.emailVerified) {
    toast({
      className: "bg-card border-l-4 border-l-primary border-y-border border-r-border shadow-2xl py-4",        
        title: "Verification Required",
        description: "Please verify your email address to purchase credits.",
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setShowPricing(false) // Close the pricing dialog
      return
    }

    // Normal Flow
    setSelectedPriceId(priceId)
    setShowCheckout(true) 
    setShowPricing(false) 
  }

  return (
    <div className="space-y-6">
      
      {/* ✅ NEW: Verification Alert at the top */}
      {/* This only shows if user is logged in but NOT verified */}
      {user && !user.emailVerified && (
        <EmailVerificationAlert user={user} />
      )}

      {/* 3 Metric Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        
        {/* Card 1: Available Credits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Available Credits
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {profileLoading ? "..." : credits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current balance</p>
          </CardContent>
        </Card>

        {/* Card 2: This Month's Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              This Month Usage
              <Activity className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {profileLoading ? "..." : monthSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
               <TrendingUp className="w-3 h-3 text-green-500" />
               Credits spent this cycle
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Unique Services Used */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Services Explored
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {uniqueCount} / {totalServices}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {profileLoading ? "..." : `${Math.round(serviceProgress)}%`}
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out" 
                style={{ width: `${serviceProgress}%` }} 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Try {totalServices - uniqueCount} more tools to reach 100%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Credit Usage Trend</CardTitle>
              <CardDescription>Last 7 days activity</CardDescription>
            </CardHeader>
            <CardContent>
              <CreditsChart />
            </CardContent>
          </Card>
        </div>

        {/* Actions Section */}
        <div className="space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Top Up Wallet
              </CardTitle>
              <CardDescription>Running low? Add credits instantly.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 flex-1 flex flex-col justify-end">
              
              {/* Pricing Dialog (Trigger) */}
              <Dialog open={showPricing} onOpenChange={setShowPricing}>
                <DialogTrigger asChild>
                  <Button className="w-full shadow-lg shadow-primary/20">
                    Get More Credits
                  </Button>
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

              <Button variant="outline" className="w-full" size="sm">
                View API Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your last API calls and their costs</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {user ? <TransactionHistory user={user} /> : null}
        </CardContent>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Secure Checkout</DialogTitle>
            <DialogDescription>
              Complete your purchase securely.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPriceId && (
            <CheckoutForm
              priceId={selectedPriceId}
              onClose={() => setShowCheckout(false)}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}