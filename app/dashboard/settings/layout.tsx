import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "./sidebar-nav"

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/dashboard/settings",
  },
  {
    title: "Billing & Plans",
    href: "/dashboard/settings/billing",
  },
  {
    title: "API Keys",
    href: "/dashboard/settings/api",
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator className="my-6" />
      
      {/* ✅ Layout Fix: flex-row with fixed width sidebar */}
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        
        {/* Changed lg:w-1/5 to lg:w-64 and added shrink-0 */}
        <aside className="lg:w-64 shrink-0">
          <SidebarNav items={sidebarNavItems} />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:max-w-2xl">
            {children}
        </div>
      </div>
    </div>
  )
}