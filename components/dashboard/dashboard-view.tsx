"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/firebase-auth-provider"
import { Dashboard } from "@/components/dashboard" 
import type { Product } from "@/components/PricingSection"

export function DashboardView({ products }: { products: Product[] }) {
  const { profile } = useAuth()
  const [greeting, setGreeting] = useState("Welcome back")

  useEffect(() => {
    const name = profile?.displayName?.split(" ")[0] || "My friend"
    const hour = new Date().getHours()

    let message = ""
    if (hour >= 5 && hour < 9) message = `Early morning grinding, ${name}`
    else if (hour >= 9 && hour < 12) message = `Good morning, ${name}. Ready to build?`
    else if (hour >= 12 && hour < 17) message = `Good afternoon, ${name}`
    else if (hour >= 17 && hour < 19) message = `It's golden hour time, ${name}`
    else if (hour >= 19 && hour < 23) message = `Good evening, ${name}`
    else message = `Late night ${name}`
    
    setGreeting(message)
  }, [profile?.displayName])

  // ✅ UPDATED LAYOUT: Matches Service Catalog exactly
  return (
    <div className="w-full py-4 px-6 md:px-8">
      <div className="space-y-8 pb-12">
        
        {/* HEADER SECTION */}
        {/* Negative margins (-mx) pull border to edges, Padding (px) realigns text */}
        <div className="-mx-6 md:-mx-8 px-6 md:px-8 border-b border-border pb-2">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
            <p className="text-muted-foreground mt-2">
              Manage your credits and usage.
            </p>
          </div>
        </div>

        {/* CONTENT SECTION */}
        {/* Constrained to max-w-6xl to match the catalog grid width */}
        <div className="max-w-6xl">
          <Dashboard products={products} />
        </div>
      </div>
    </div>
  )
}