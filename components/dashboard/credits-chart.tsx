"use client"

import { useMemo } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useAuth } from "@/components/firebase-auth-provider"

export function CreditsChart() {
  const { profile } = useAuth()
  
  // 1. Transform Data: Convert the "dailyHistory" map into an array for the chart
  const data = useMemo(() => {
    // If profile hasn't loaded yet, or usage is missing, default to empty
    const history = profile?.usage?.dailyHistory ?? {}
    const days = []
    
    // Generate the last 7 days (including today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      
      const dateKey = d.toISOString().split('T')[0] // Format: "YYYY-MM-DD"
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }) // Format: "Mon", "Tue"
      
      days.push({
        name: dayLabel,
        date: dateKey,
        // Get value from profile history, default to 0 if no spending that day
        total: history[dateKey] ?? 0 
      })
    }
    return days
  }, [profile?.usage?.dailyHistory])

  // 2. Loading State (Optional: Render a skeleton or just empty chart)
  if (!profile) return <div className="h-[350px] w-full animate-pulse bg-muted/20 rounded-lg" />

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        {/* X Axis: Mon, Tue, Wed */}
        <XAxis 
          dataKey="name" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        
        {/* Y Axis: Numbers */}
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        
        {/* Tooltip: Shows details on hover */}
        <Tooltip 
            cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
            contentStyle={{ 
                borderRadius: '8px', 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--popover-foreground))'
            }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
        />
        
        {/* The Bars */}
        <Bar 
          dataKey="total" 
          fill="currentColor" 
          radius={[4, 4, 0, 0]} 
          className="fill-primary" 
        />
      </BarChart>
    </ResponsiveContainer>
  )
}