'use client'

import { useState } from 'react'
import { CreditCard, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BuyCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  onPurchase: (amount: number) => void
  currentCredits: number
}

const CREDIT_PACKAGES = [
  { id: 'starter', name: 'Starter', credits: 1000, price: 9.99, popular: false },
  { id: 'professional', name: 'Professional', credits: 5000, price: 39.99, popular: true },
  { id: 'enterprise', name: 'Enterprise', credits: 25000, price: 149.99, popular: false },
  { id: 'mega', name: 'Mega Bundle', credits: 100000, price: 499.99, popular: false },
]

export function BuyCreditsModal({ isOpen, onClose, onPurchase, currentCredits }: BuyCreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1].id)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const selectedPkg = CREDIT_PACKAGES.find((p) => p.id === selectedPackage)!
  const creditPerDollar = (selectedPkg.credits / selectedPkg.price).toFixed(2)

  const handlePurchase = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onPurchase(selectedPkg.credits)
    setIsProcessing(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Buy Credits
            </CardTitle>
            <CardDescription>Purchase credits to use our AI services</CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
          >
            ✕
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Balance */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <p className="text-3xl font-bold text-primary">{currentCredits.toLocaleString()} credits</p>
          </div>

          {/* Credit Packages */}
          <div>
            <h3 className="font-medium mb-4">Select Package</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative p-4 rounded-lg border-2 transition ${
                    selectedPackage === pkg.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 right-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                      POPULAR
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-medium text-lg">{pkg.name}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-2xl font-bold text-primary">${pkg.price}</p>
                      <p className="text-sm text-muted-foreground">USD</p>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{pkg.credits.toLocaleString()} credits</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        <span>{creditPerDollar} credits per $1</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Purchase Summary */}
          {selectedPkg && (
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">{selectedPkg.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-medium text-primary">{selectedPkg.credits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">${selectedPkg.price}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-sm font-medium">New Balance</span>
                <span className="text-lg font-bold text-primary">
                  {(currentCredits + selectedPkg.credits).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm">
            <p className="text-blue-700 dark:text-blue-300">
              <span className="font-medium">Note:</span> This is a demo. In production, this would redirect to a secure payment gateway (Stripe, etc).
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : `Purchase for $${selectedPkg.price}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
