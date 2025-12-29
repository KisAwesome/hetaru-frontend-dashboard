'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { day: 'Mon', credits: 250 },
  { day: 'Tue', credits: 300 },
  { day: 'Wed', credits: 200 },
  { day: 'Thu', credits: 450 },
  { day: 'Fri', credits: 350 },
  { day: 'Sat', credits: 200 },
  { day: 'Sun', credits: 400 },
]

export function CreditsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
        <YAxis stroke="var(--color-muted-foreground)" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
          }}
          cursor={{ fill: 'rgba(85, 100, 255, 0.1)' }}
        />
        <Bar dataKey="credits" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
