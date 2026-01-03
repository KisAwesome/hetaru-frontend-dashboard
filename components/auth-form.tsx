"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2, AlertCircle, Check, ArrowLeft, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/firebase-auth-provider"

const getFriendlyErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case "auth/invalid-email": return "Please enter a valid email address."
    case "auth/user-disabled": return "This account has been disabled."
    case "auth/user-not-found": return "No account found with this email."
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Incorrect email or password."
    case "auth/email-already-in-use": return "An account with this email already exists."
    case "auth/weak-password": return "Password should be at least 6 characters."
    case "auth/too-many-requests": return "Too many attempts. Please wait a moment."
    default: return "An unexpected error occurred. Please try again."
  }
}

export default function AuthForm() {
  const router = useRouter()
  // ✅ Added resetPassword from hook
  const { signUp, signIn, signInWithGoogle, resetPassword, user, emailVerificationSent, resendVerificationEmail } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  
  // ✅ New States for Forgot Password flow
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; displayName?: string }>({})

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false, uppercase: false, lowercase: false, number: false,
  })

  useEffect(() => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    })
  }, [password])

  const validateForm = () => {
    const errors: typeof fieldErrors = {}
    let isValid = true

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      errors.email = "Email is required"
      isValid = false
    } else if (!emailRegex.test(email)) {
      errors.email = "Invalid email format"
      isValid = false
    }

    // ✅ Skip password validation if we are just resetting password
    if (!isForgotPassword) {
      if (!password) {
        errors.password = "Password is required"
        isValid = false
      } else if (isSignUp) {
        if (!passwordCriteria.length || !passwordCriteria.uppercase || !passwordCriteria.lowercase || !passwordCriteria.number) {
          errors.password = "Password does not meet requirements"
          isValid = false
        }
      }
    }

    if (isSignUp && !displayName.trim()) {
      errors.displayName = "Display Name is required"
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isForgotPassword) {
        // ✅ Handle Password Reset
        await resetPassword(email)
        setResetSent(true)
      } else if (isSignUp) {
        await signUp(email, password, displayName)
      } else {
        await signIn(email, password)
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      const code = err.code || "unknown"
      setFormError(getFriendlyErrorMessage(code))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setFormError(null)
    try {
      await signInWithGoogle()
      router.push("/dashboard")
    } catch (err: any) {
      setFormError("Could not sign in with Google.")
      setIsLoading(false)
    }
  }

  if (emailVerificationSent && !user?.emailVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-primary/20 shadow-2xl">
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>Link sent to <span className="font-medium text-foreground">{email}</span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={resendVerificationEmail} className="w-full">Resend Verification Email</Button>
            <Button variant="ghost" onClick={() => window.location.reload()} className="w-full">I've Verified (Refresh)</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* Branding (Left Side) */}
        <div className="hidden md:flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Hetaru</h1>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-balance">Unified AI Platform</h2>
            <p className="text-lg text-muted-foreground text-balance">Access 100+ AI microservices with a single credit system.</p>
          </div>
          <div className="space-y-3 pt-6">
            {["Variable pricing per service", "Real-time credit deduction", "Usage analytics & history", "Powered by Gemini API", "Backed by Firebase"].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-primary" /></div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auth Form (Right Side) */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-[400px] border-none shadow-none md:border md:shadow-xl md:bg-card/50 md:backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {isForgotPassword ? "Reset Password" : isSignUp ? "Create an account" : "Welcome back"}
              </CardTitle>
              <CardDescription>
                {resetSent 
                  ? "Check your inbox for instructions" 
                  : isForgotPassword 
                    ? "Enter your email to receive a reset link" 
                    : isSignUp 
                      ? "Enter your details to get started" 
                      : "Enter your email to sign in"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formError && (
                <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* ✅ SUCCESS VIEW: Reset Link Sent */}
              {resetSent ? (
                <div className="space-y-4 animate-in zoom-in duration-300">
                  <div className="p-6 bg-primary/5 border border-primary/10 rounded-lg flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MailCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Link Sent!</h3>
                      <p className="text-sm text-muted-foreground mt-1">Check <b>{email}</b> for instructions to reset your password.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => {setResetSent(false); setIsForgotPassword(false)}}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                  </Button>
                </div>
              ) : (
                <>
                  {!isForgotPassword && (
                    <div className="mb-6">
                      <Button variant="outline" className="w-full h-11 bg-background" onClick={handleGoogleSignIn} disabled={isLoading}>
                         <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                      </Button>
                      <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-medium">Or continue with email</span></div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {isSignUp && !isForgotPassword && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium leading-none">Display Name</label>
                          {fieldErrors.displayName && <span className="text-xs font-medium text-destructive animate-in fade-in">{fieldErrors.displayName}</span>}
                        </div>
                        <Input placeholder="Your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={isLoading} className={fieldErrors.displayName ? "border-destructive focus-visible:ring-destructive" : ""} />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium leading-none">Email</label>
                        {fieldErrors.email && <span className="text-xs font-medium text-destructive animate-in fade-in">{fieldErrors.email}</span>}
                      </div>
                      <Input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""} />
                    </div>

                    {!isForgotPassword && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium leading-none">Password</label>
                        </div>
                        <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className={fieldErrors.password ? "border-destructive focus-visible:ring-destructive" : ""} />
                        
                        {/* ✅ Forgot Password Link - Placed UNDER the input */}
                        {!isSignUp && (
                          <div className="flex justify-end pt-1">
                            <button 
                              type="button" 
                              onClick={() => { setIsForgotPassword(true); setFormError(null); }} 
                              className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                            >
                              Forgot password?
                            </button>
                          </div>
                        )}

                        {isSignUp && (
                          <div className="pt-1 grid grid-cols-2 gap-2 text-xs text-muted-foreground animate-in slide-in-from-top-2">
                            <div className={`flex items-center gap-1.5 ${passwordCriteria.length ? "text-green-600 font-medium" : ""}`}>{passwordCriteria.length ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-50" />} At least 8 characters</div>
                            <div className={`flex items-center gap-1.5 ${passwordCriteria.uppercase ? "text-green-600 font-medium" : ""}`}>{passwordCriteria.uppercase ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-50" />} Uppercase</div>
                            <div className={`flex items-center gap-1.5 ${passwordCriteria.lowercase ? "text-green-600 font-medium" : ""}`}>{passwordCriteria.lowercase ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-50" />} Lowercase</div>
                            <div className={`flex items-center gap-1.5 ${passwordCriteria.number ? "text-green-600 font-medium" : ""}`}>{passwordCriteria.number ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-50" />} One number</div>
                          </div>
                        )}
                        {!isSignUp && fieldErrors.password && <span className="text-xs font-medium text-destructive animate-in fade-in">{fieldErrors.password}</span>}
                      </div>
                    )}

                    <Button type="submit" className="w-full h-11 mt-2 shadow-lg shadow-primary/20" disabled={isLoading}>
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      {isForgotPassword ? "Send Reset Link" : isSignUp ? "Create Account" : "Sign In"}
                    </Button>
                    
                    {isForgotPassword && (
                      <Button variant="ghost" className="w-full" onClick={() => setIsForgotPassword(false)} disabled={isLoading}>
                        Cancel
                      </Button>
                    )}
                  </form>
                </>
              )}

              {!isForgotPassword && (
                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
                  <button 
                    onClick={() => { setIsSignUp(!isSignUp); setFormError(null); setFieldErrors({}); setPassword(""); setEmail(""); setDisplayName(""); }} 
                    className="ml-1 text-primary hover:text-primary/80 hover:underline font-semibold transition-colors"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}