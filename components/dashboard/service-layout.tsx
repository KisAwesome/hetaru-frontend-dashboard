'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ServicePageLayoutProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  actions?: React.ReactNode // Optional: for things like "History" buttons in the top right
}

export function ServicePageLayout({ title, icon, children, actions }: ServicePageLayoutProps) {
  const router = useRouter()
  useEffect(() => {
    document.title = `${title} - Hetaru`; // Updates the browser tab
  }, [title]);

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto">
      {/* --- STANDARD HEADER --- */}
      <div className="flex items-center justify-between gap-4 border-b border-border p-4 md:px-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/dashboard/services')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Catalog</span>
          </Button>
          
          <div className="h-15 w-px bg-border" /> {/* Separator */}

          <h1 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
            {icon && <span className="text-primary">{icon}</span>}
            {title}
          </h1>
        </div>

        {actions && <div>{actions}</div>}
      </div>

      {/* --- SERVICE CONTENT (Scrollable Area) --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 min-h-0">
        {children}
      </div>
    </div>
  )
}