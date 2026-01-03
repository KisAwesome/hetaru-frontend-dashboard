"use client"

import { useEffect, useMemo, useRef, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, LogIn, KeyRound, Check } from "lucide-react"

type VerifyState = "idle" | "verifying" | "input_password" | "success" | "already_verified" | "error"

function getFirebaseErrorMessage(code?: string) {
  switch (code) {
    case "auth/expired-action-code":
      return "This link has expired. Please request a new one."
    case "auth/invalid-action-code":
      return "This link is invalid or has already been used."
    case "auth/user-disabled":
      return "This account has been disabled."
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password."
    default:
      return "An error occurred. Please try again."
  }
}

function StatusBlock({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
      {icon}
      <div className="text-center">
        <h3 className="text-xl font-bold">{title}</h3>
        {description ? (
          <p className="text-muted-foreground mt-1 max-w-[320px]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const oobCode = useMemo(() => searchParams.get("oobCode"), [searchParams])
  const mode = useMemo(() => searchParams.get("mode"), [searchParams])

  const ranOnce = useRef(false)
  const [state, setState] = useState<VerifyState>("idle")
  const [errorMsg, setErrorMsg] = useState<string>("")
  
  const [resetEmail, setResetEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [inputError, setInputError] = useState("")

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false, uppercase: false, lowercase: false, number: false,
  })

  useEffect(() => {
    setPasswordCriteria({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
    })
    if (inputError) setInputError("")
  }, [newPassword])

  useEffect(() => {
    if (ranOnce.current) return
    ranOnce.current = true

    if (!oobCode) {
      setState("error")
      setErrorMsg("Missing verification code.")
      return
    }

    const processAction = async () => {
      setState("verifying")
      
      try {
        await auth.authStateReady()

        // --- MODE: VERIFY EMAIL ---
        if (mode === "verifyEmail") {
          // Check early if user is already verified
          if (auth.currentUser) {
            await auth.currentUser.reload()
            if (auth.currentUser.emailVerified) {
              setState("already_verified")
              return
            }
          }

          await applyActionCode(auth, oobCode)
          if (auth.currentUser) await auth.currentUser.reload()
          setState("success")
        } 
        
        // --- MODE: RESET PASSWORD ---
        else if (mode === "resetPassword") {
          try {
             // ✅ ADDED: Explicit nested try/catch for this specific call
            const email = await verifyPasswordResetCode(auth, oobCode)
            setResetEmail(email)
            setState("input_password")
          } catch (resetErr: any) {
             // ✅ Handle invalid code specifically for resets
             console.log("Reset code invalid:", resetErr.code)
             setState("error")
             setErrorMsg(getFirebaseErrorMessage(resetErr.code))
             return // Stop execution here
          }
        } 
        
        else {
          setState("error")
          setErrorMsg("Invalid action mode.")
        }

      } catch (err: any) {
        // Global handler for other errors
        if (mode === "verifyEmail" && auth.currentUser) {
           try {
             await auth.currentUser.reload()
             if (auth.currentUser.emailVerified) {
               setState("already_verified")
               return
             }
           } catch { /* ignore */ }
        }
        
        console.error("Verification Page Error:", err)
        setState("error")
        setErrorMsg(getFirebaseErrorMessage(err?.code))
      }
    }

    processAction()
  }, [oobCode, mode])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setInputError("")

    if (!passwordCriteria.length || !passwordCriteria.uppercase || !passwordCriteria.lowercase || !passwordCriteria.number) {
      setInputError("Password does not meet requirements.")
      return
    }

    if (!oobCode) return

    setState("verifying")
    try {
      await confirmPasswordReset(auth, oobCode, newPassword)
      setState("success")
    } catch (err: any) {
      console.error("Confirm Reset Error:", err)
      setState("input_password")
      setInputError(getFirebaseErrorMessage(err?.code)) 
    }
  }

  // --- RENDER ---
  
  if (state === "idle" || state === "verifying") {
    return (
      <CardContent className="flex flex-col items-center gap-6 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {mode === "resetPassword" ? "Verifying link..." : "Verifying your email..."}
        </p>
      </CardContent>
    )
  }

  if (state === "input_password") {
    return (
      <CardContent className="py-6">
        <form onSubmit={handlePasswordReset} className="flex flex-col gap-4 animate-in fade-in">
          <div className="text-center mb-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Reset Password</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Enter a new password for <span className="font-medium text-foreground">{resetEmail}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={`text-center ${inputError ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            
            <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground text-left">
              <div className={`flex items-center gap-1.5 ${passwordCriteria.length ? "text-green-600 font-medium" : ""}`}>
                {passwordCriteria.length ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-50" />}
                At least 8 characters
              </div>
              <div className={`flex items-center gap-1.5 ${passwordCriteria.uppercase ? "text-green-600 font-medium" : ""}`}>
                {passwordCriteria.uppercase ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-50" />}
                Uppercase letter
              </div>
              <div className={`flex items-center gap-1.5 ${passwordCriteria.lowercase ? "text-green-600 font-medium" : ""}`}>
                 {passwordCriteria.lowercase ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-50" />}
                Lowercase letter
              </div>
               <div className={`flex items-center gap-1.5 ${passwordCriteria.number ? "text-green-600 font-medium" : ""}`}>
                {passwordCriteria.number ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-50" />}
                One number
              </div>
            </div>

            {inputError && (
              <p className="text-xs font-medium text-destructive text-center animate-in fade-in">
                {inputError}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full mt-2">
            Reset Password
          </Button>
          
          <Button variant="ghost" type="button" onClick={() => router.push("/auth")} className="w-full">
            Cancel
          </Button>
        </form>
      </CardContent>
    )
  }

  if (state === "success") {
    const isReset = mode === "resetPassword"
    return (
      <CardContent className="py-6">
        <StatusBlock
          icon={
            <div className="rounded-full bg-green-500/10 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          }
          title={isReset ? "Password Reset" : "Email Verified"}
          description={
            isReset
              ? "Your password has been successfully updated. You can now log in."
              : "Your account is active and ready to use."
          }
          action={
            <Button
              onClick={() => router.push(isReset ? "/auth" : "/dashboard")}
              className="w-full mt-2 shadow-lg shadow-primary/20"
            >
              {isReset ? "Back to Login" : "Continue to Dashboard"}
            </Button>
          }
        />
      </CardContent>
    )
  }

  if (state === "already_verified") {
    return (
      <CardContent className="py-6">
        <StatusBlock
          icon={
            <div className="rounded-full bg-green-500/10 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          }
          title="Already Verified"
          description="This email has already been verified. You can log in now."
          action={
            <Button onClick={() => router.push("/auth")} className="w-full mt-2">
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
          }
        />
      </CardContent>
    )
  }

  return (
    <CardContent className="py-6">
      <StatusBlock
        icon={
          <div className="rounded-full bg-destructive/10 p-3">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
        }
        title="Link Invalid"
        description={errorMsg || "This link is invalid or expired. Please request a new one."}
        action={
          <div className="w-full mt-2 flex flex-col gap-2">
            <Button onClick={() => router.push("/auth")} variant="default" className="w-full">
              Back to Login
            </Button>
          </div>
        }
      />
    </CardContent>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <Suspense
          fallback={
            <CardContent className="flex flex-col items-center gap-2 py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          }
        >
          <VerifyContent />
        </Suspense>
      </Card>
    </div>
  )
}