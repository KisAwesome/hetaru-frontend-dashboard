
import { Metadata } from "next";
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

export const metadata: Metadata = {
  title: 'Settings - Hetaru',
  description: 'Settings and preferences for your Hetaru account.',
};

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="w-full py-4 px-6 md:px-8">
      <div className="space-y-8 pb-12">
        <div className="-mx-6 md:-mx-8 px-6 md:px-8 border-b border-border pb-2">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>
      
        <div className="max-w-6xl">
          <div className="flex flex-col lg:flex-row lg:space-x-12 lg:space-y-0 space-y-8">
            <aside className="lg:w-64 shrink-0">
              <SidebarNav items={sidebarNavItems} />
            </aside>
            <div className="flex-1">
               {children}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}