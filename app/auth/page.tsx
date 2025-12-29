"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/firebase-auth-provider"
import AuthForm from "@/components/auth-form"
import { Loader2 } from "lucide-react"

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  // 1. If Auth is still loading, show Spinner
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 2. If User is logged in, show Spinner (Wait for redirect)
  // This PREVENTS the login form from showing up
  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    )
  }

  // 3. Only show Form if NO user is found
  return <AuthForm />
}