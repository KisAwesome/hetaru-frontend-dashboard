// components/providers/posthog-provider.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { useAuth } from '@/components/firebase-auth-provider'

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.uid) {
      // ✅ Link the session to the authenticated user
      posthog.identify(user.uid, {
        email: user.email,
        name: user.displayName,
      })
    } else {
      posthog.reset()
    }
  }, [user])

  return <PHProvider client={posthog}>{children}</PHProvider>
}