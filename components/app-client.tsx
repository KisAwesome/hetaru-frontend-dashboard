"use client"

import { useState, useEffect } from "react"
import { Heart, Zap, Sparkles, LogOut, Settings, BarChart3, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dashboard } from "@/components/dashboard"
import { ServiceCatalog } from "@/components/service-catalog"
import { SettingsPage } from "@/components/settings-page"
import { useAuth } from "@/components/firebase-auth-provider"
import AuthForm from "@/components/auth-form" // Declare the AuthForm variable
import type { Product } from "@/components/PricingSection"
import { UserNav } from "./user-nav"


export default function AppClient({ products }: { products: Product[] }) {
  const { user, loading, logout, profile, profileLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
    const [greeting, setGreeting] = useState("")

  // ✅ Calculate the greeting based on local time
  useEffect(() => {
    const name = profile?.displayName?.trim() || "friend"
    const hour = new Date().getHours()

    let message = ""
    if (hour >= 5 && hour < 9) {
      message = `Early morning grinding, ${name}`
    } else if (hour >= 9 && hour < 12) {
      message = `Good morning, ${name}. Ready to build?`
    } else if (hour >= 12 && hour < 17) {
      message = `Good afternoon, ${name}`
    } else if (hour >= 17 && hour < 19) {
      message = `It's golden hour time, ${name}` // 🌅 Golden Hour
    } else if (hour >= 19 && hour < 23) {
      message = `Good evening, ${name}`
    } else {
      message = `Late night ${name}` // 🌙 Late night (11pm - 5am)
    }
    
    setGreeting(message)
  }, [profile?.displayName]) // Re-run if profile loads

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const displayName = profile?.displayName?.trim()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Hetaru</h1>
              <p className="text-xs text-muted-foreground">AI Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <a
            href="/landing"
            className="w-full text-left px-4 py-3 rounded-lg transition text-muted-foreground hover:bg-secondary flex items-center"
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Landing Page
          </a>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === "dashboard" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
          >
            <Zap className="inline w-5 h-5 mr-3" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === "services" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
          >
            <Heart className="inline w-5 h-5 mr-3" />
            AI Services
          </button>
         
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === "settings" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
          >
            <Settings className="inline w-5 h-5 mr-3" />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-border">
          <UserNav />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {activeTab === "dashboard" && greeting}
                {activeTab === "services" && "AI Services Catalog"}
                {activeTab === "settings" && "Settings"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "dashboard" && "Manage your credits and usage"}
                {activeTab === "services" && "Browse and use AI microservices"}
                {activeTab === "settings" && "Manage your account and preferences"}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === "dashboard" && <Dashboard products={products} />}
          {activeTab === "services" && <ServiceCatalog />}
          {activeTab === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  )
}
