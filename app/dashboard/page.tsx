import { DashboardView } from "@/components/dashboard/dashboard-view"
import type { Product } from "@/components/PricingSection"
import { Metadata } from "next"


export const metadata: Metadata = {
  title: 'Dashboard - Hetaru',
  description: 'Manage your account at a glance.',
}
// 1. Fetch Data (Server Side)
async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch("http://localhost:8080/api/payment/products", {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    // Handle if your API returns { products: [...] } or just [...]
    return data.products || data || []
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return []
  }
}

// 2. Render Page
export default async function DashboardPage() {
  const products = await getProducts()
  
  return <DashboardView products={products} />
}