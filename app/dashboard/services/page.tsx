import { ServiceCatalog } from "@/components/dashboard/service-catalog"
import { Metadata } from "next"

// define the shape of data coming from your Fastify backend
export interface ServiceBackend {
  id: string
  name: string
  description: string
  cost: number         // Backend says 'cost', Frontend used 'creditCost'
  category?: string
  icon?: string
  status: string
  endpoint: string
  isServiceOfDay?: boolean
  // Add defaults for missing fields if backend doesn't send them yet
  popularity?: number 
}

export const metadata: Metadata = {
  title: 'Service Catalog - Hetaru',
  description: 'Browse our suite of AI-powered tools and services.',
}

async function getCatalog() {
  try {
    // 1. Fetch from your Fastify Backend
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/services/catalog`, {
      // 2. CACHING STRATEGY
      // 'force-cache': caches forever until you rebuild
      // 'revalidate: 3600': caches for 1 hour (Good for "Service of the Day")
      next: { revalidate: 3600 } 
    });

    if (!res.ok) throw new Error("Failed to fetch catalog");

    const data = await res.json();
    return data; // { services: [], count: 0, serviceOfDayId: "..." }

  } catch (err) {
    console.error("Catalog fetch error:", err);
    return { services: [], serviceOfDayId: null };
  }
}

export default async function ServicesPage() {
  const data = await getCatalog();

  return (
    <div className="w-full py-4 px-6 md:px-8">
      {/* Pass the server-fetched data down to the client component */}
      <ServiceCatalog 
        initialServices={data.services} 
        serviceOfDayId={data.serviceOfDayId} 
      />
    </div>
  )
}