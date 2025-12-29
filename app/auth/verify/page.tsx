"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { applyActionCode } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oobCode = searchParams.get("oobCode")

  // ✅ Fix: Use a ref to track if we already tried verifying
  const hasTriedVerifying = useRef(false)
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    if (!oobCode) {
      setStatus("error")
      return
    }

    // 🛑 STOP: If we already ran this, don't run it again
    if (hasTriedVerifying.current) return
    hasTriedVerifying.current = true

    // Attempt to verify the code
    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus("success")
        // Refresh the user token so the app knows they are verified immediately
        auth.currentUser?.reload()
      })
      .catch((error) => {
        console.error("Verification Error:", error)
        // Only show error if it's NOT a "code already used" error (which is fine)
        if (error.code === 'auth/invalid-action-code') {
           setStatus("error")
        } else {
           // If it failed for another reason, it might actually be fine
           setStatus("error")
        }
      })
  }, [oobCode])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center">
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          
          {status === "loading" && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">You're all set!</h3>
                <p className="text-muted-foreground mt-1">Thank you for verifying your email.</p>
              </div>
              <Button onClick={() => router.push("/dashboard")} className="w-full mt-2 shadow-lg shadow-primary/20">
                Continue to Dashboard
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
              <div className="rounded-full bg-destructive/10 p-3">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
               <div className="text-center">
                <h3 className="text-xl font-bold">Verification Failed</h3>
                <p className="text-muted-foreground mt-1 max-w-[280px]">
                  This link is invalid or has expired. You might have already verified your email.
                </p>
              </div>
              <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full mt-2">
                Back to Dashboard
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}