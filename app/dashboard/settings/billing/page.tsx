import { Metadata } from "next"
import { BillingClient } from "./billing-client"
import type { Product } from "@/components/PricingSection"


export const metadata: Metadata = {
  title: 'Billing & Plans - Hetaru',
}
async function getProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const res = await fetch(`${baseUrl}/api/payment/products`, {
      next: { revalidate: 3600 },
    })
    
    if (!res.ok) return []
    const data = await res.json()
    return data.products || data || []
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return []
  }
}

// ✅ This MUST be the default export
export default async function BillingPage() {
  const products = await getProducts()
  return <BillingClient products={products} />
}