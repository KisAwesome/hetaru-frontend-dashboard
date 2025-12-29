"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, BarChart3, Zap, Heart, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/dashboard/user-nav" // Make sure this path matches where you put UserNav

const navItems = [
  { href: "/dashboard", icon: Zap, label: "Dashboard" },
  { href: "/dashboard/services", icon: Heart, label: "AI Services" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full border-r border-border bg-card/50">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Hetaru</h1>
            <p className="text-xs text-muted-foreground">AI Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          // Check if link is active
          // We use startsWith for settings to keep it active when in /settings/billing
          const isActive = 
            item.href === "/dashboard" 
              ? pathname === "/dashboard" 
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full flex items-center px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border mt-auto">
        <UserNav />
      </div>
    </div>
  )
}