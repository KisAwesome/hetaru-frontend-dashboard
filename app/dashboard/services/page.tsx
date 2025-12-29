import { ServiceCatalog } from "@/components/dashboard/service-catalog"

export default function ServicesPage() {
  return (
    // ✅ REMOVED 'container' and 'max-w-6xl'
    // Now the wrapper is full width, allowing the border to touch the sidebar.
    <div className="w-full py-4 px-6 md:px-8">
      <ServiceCatalog />
    </div>
  )
}