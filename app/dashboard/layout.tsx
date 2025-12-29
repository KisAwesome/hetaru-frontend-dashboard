"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useAuth } from "@/components/firebase-auth-provider"
import { Loader2 } from "lucide-react"
import { CSPostHogProvider } from "@/components/providers/posthog-provider" // ✅ Import the provider

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    // ✅ Wrap in PostHog Provider
    // The provider handles identify() internally whenever the user object changes
    <CSPostHogProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <aside className="hidden w-64 md:flex flex-col z-20 h-full">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
          {children}
        </main>
      </div>
    </CSPostHogProvider>
  )
}