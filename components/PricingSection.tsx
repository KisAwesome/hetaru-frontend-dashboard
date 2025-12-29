"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils" // Assuming you have a util, otherwise remove 'cn' and use template literals

export type Product = {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  metadata: { credits?: string }
}

export function PricingSection({
  products,
  onSelect,
}: {
  products: Product[]
  onSelect: (priceId: string) => void
}) {
  if (!products?.length) {
    return <p className="text-sm text-muted-foreground text-center py-10">No packages available right now.</p>
  }

  // Determine Best Value (highest credits)
  const bestValueId = [...products].sort(
    (a, b) => Number(b.metadata?.credits ?? 0) - Number(a.metadata?.credits ?? 0)
  )[0]?.id

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((p) => {
        const creditsNum = Number(p.metadata?.credits ?? 0)
        const creditsLabel = creditsNum ? creditsNum.toLocaleString() : "—"
        const isBest = p.id === bestValueId

        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={cn(
              "group relative flex flex-col justify-between rounded-xl border p-6 text-left transition-all duration-200",
              "hover:shadow-xl hover:-translate-y-1 bg-card",
              isBest 
                ? "border-primary ring-1 ring-primary/20 shadow-md z-10 scale-[1.02] md:scale-110" 
                : "border-border hover:border-primary/50"
            )}
          >
            {/* Best Value Badge */}
            {isBest && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm">
                Best Value
              </div>
            )}

            {/* Header Section */}
            <div className="space-y-2 text-center w-full">
              <h3 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                {p.name}
              </h3>
              
              {/* The Hero Number */}
              <div className="flex items-center justify-center gap-1 text-foreground">
                <span className="text-4xl font-extrabold tracking-tight">
                  {creditsLabel}
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Credits</p>
            </div>

            {/* Divider */}
            <div className="my-6 h-px w-full bg-border/50" />

            {/* Price & Action */}
            <div className="space-y-4 w-full text-center">
              <div className="text-2xl font-bold">
                ${p.amount.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                   {p.currency}
                </span>
              </div>

              {/* Fake List to make it look fuller (Optional, remove if unwanted) */}
              <div className="space-y-2 text-xs text-muted-foreground flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" /> 
                  <span>Instant delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" /> 
                  <span>Never expires</span>
                </div>
              </div>

              <div 
                className={cn(
                  "w-full rounded-lg py-2.5 text-sm font-semibold transition-colors",
                  isBest 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                Select Package
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}