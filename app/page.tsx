import { LandingPageClient } from "@/components/landing-page"
import type { Product } from "@/components/PricingSection"

// Server Component: Fetches Live Prices
async function getProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const res = await fetch(`${baseUrl}/api/payment/products`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    
    if (!res.ok) return []
    const data = await res.json()
    // Handle { products: [...] } or just [...]
    return data.products || data || []
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return []
  }
}

export default async function LandingPage() {
  const products = await getProducts()
  
  return <LandingPageClient products={products} />
}