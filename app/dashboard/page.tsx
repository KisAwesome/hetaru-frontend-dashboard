import AppClient from "@/components/app-client"
import type { Product } from "@/components/PricingSection"

// Put your backend URL in .env.local as BACKEND_URL="http://localhost:8080" or your Cloud Run URL
async function getProducts(): Promise<Product[]> {
  const res = await fetch(`http://localhost:8080/api/payment/products`, {
    // ✅ cache + revalidate (ISR). Change 300 to whatever you want.
    next: { revalidate: 3600 },
  })

  if (!res.ok) return []
  return res.json()
}

export default async function Page() {
  const products = await getProducts()
  return <AppClient products={products.products} />
}
