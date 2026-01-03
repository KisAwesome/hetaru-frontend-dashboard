"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { sendGAEvent } from "@next/third-parties/google"

import { auth } from "@/lib/firebase"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type PageState = "loading" | "success" | "incomplete" | "error" | "unauth" | "missing"

// 1. Logic Component
function ReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [state, setState] = useState<PageState>("loading")
  const [customerEmail, setCustomerEmail] = useState<string>("")
  const [countdown, setCountdown] = useState<number>(3)

  const title = useMemo(() => {
    switch (state) {
      case "missing": return "Missing session"
      case "unauth": return "Sign in required"
      case "incomplete": return "Payment incomplete"
      case "error": return "Could not verify payment"
      case "success": return "Payment successful"
      default: return "Verifying payment"
    }
  }, [state])

  const description = useMemo(() => {
    switch (state) {
      case "missing": return "No session_id was found in the URL."
      case "unauth": return "Please sign in to confirm your purchase."
      case "incomplete": return "It looks like you didn’t finish checking out."
      case "error": return "Something went wrong while confirming your payment. Please try again."
      case "success": return customerEmail
          ? `Receipt sent to ${customerEmail}. Redirecting you to the dashboard in ${countdown}s…`
          : `Payment confirmed. Redirecting you to the dashboard in ${countdown}s…`
      default: return "This usually takes a couple seconds."
    }
  }, [state, customerEmail, countdown])

  useEffect(() => {
    if (!sessionId) {
      setState("missing")
      return
    }

    setState("loading")

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState("unauth")
        return
      }

      try {
        const data = await api.get(`/api/payment/session-status?session_id=${encodeURIComponent(sessionId)}`)
        const s = String(data?.status || "").toLowerCase()
        const email = data?.customer_email || ""

        setCustomerEmail(email)

        if (s === "complete" || s === "paid") {
          setState("success")
          sendGAEvent("event", "purchase", {
            transaction_id: sessionId,
            value: data?.amount_total ? data.amount_total / 100 : 0,
            currency: data?.currency || "USD",
            items: [{ item_id: "hetaru_credit_pack", item_name: "Credit Top-up" }]
          })
        } else if (s === "open") {
          setState("incomplete")
        } else {
          setState("error")
        }
      } catch (err) {
        console.error("Verification failed", err)
        setState("error")
      }
    })

    return () => unsubscribe()
  }, [sessionId])

  useEffect(() => {
    if (state !== "success") return
    setCountdown(3)
    const interval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [state])

  useEffect(() => {
    if (state === "success" && countdown === 0) {
      router.push("/dashboard")
    }
  }, [state, countdown, router])

  const icon = useMemo(() => {
    if (state === "loading") return <Loader2 className="h-10 w-10 animate-spin text-primary" />
    if (state === "success") return <CheckCircle2 className="h-10 w-10 text-primary" />
    return <XCircle className="h-10 w-10 text-destructive" />
  }, [state])

  const primaryAction = useMemo(() => {
    if (state === "success") {
      return (
        <Button className="w-full" onClick={() => router.push("/")}>
          Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )
    }
    if (state === "unauth") return <Button className="w-full" onClick={() => router.push("/")}>Go to login <ArrowRight className="ml-2 h-4 w-4" /></Button>
    if (state === "incomplete") return <Button className="w-full" onClick={() => router.push("/")}>Back to dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
    if (state === "error") return <Button className="w-full" onClick={() => window.location.reload()}>Try again</Button>
    if (state === "missing") return <Button className="w-full" onClick={() => router.push("/")}>Back to dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
    return <Button className="w-full" disabled>Verifying…</Button>
  }, [state, router])

  return (
    <Card className="w-full max-w-md bg-card/60 backdrop-blur border-border">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl border border-border bg-background/40 flex items-center justify-center">
          {icon}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {primaryAction}
        {state === "incomplete" && (
          <p className="text-sm text-muted-foreground text-center">
            If you were charged but don’t see credits, contact support with your session id.
          </p>
        )}
        {sessionId && (
          <p className="text-xs text-muted-foreground text-center break-all">
            Session: {sessionId}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// 2. Main Export with Suspense
export default function ReturnPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md bg-card/60 backdrop-blur border-border">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl border border-border bg-background/40 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <CardTitle className="text-2xl">Verifying payment</CardTitle>
            <CardDescription className="text-base">Please wait while we confirm your transaction...</CardDescription>
          </CardHeader>
        </Card>
      }>
        <ReturnContent />
      </Suspense>
    </div>
  )
}