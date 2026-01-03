"use client"

import { useState } from "react"
import { Mail, Send, CheckCircle2, Loader2 } from "lucide-react" // Switched Icon
import { sendEmailVerification, User } from "firebase/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function EmailVerificationAlert({ user }: { user: User }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleResend = async () => {
    try {
      setLoading(true)
      await sendEmailVerification(user)
      setSent(true)
      toast({
        title: "Email Sent",
        description: "Check your inbox (and spam) for the verification link.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Too many requests",
        description: "Please wait a few minutes before trying again.",
      })
    } finally {
      setLoading(false)
    }
  }

  // State 1: Success (Green is always good)
  if (sent) {
    return (
      <Alert className="border-green-500/50 text-green-600 dark:text-green-400 bg-green-500/10">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Verification Link Sent!</AlertTitle>
        <AlertDescription>
          Please check your inbox. Once verified, refresh this page.
        </AlertDescription>
      </Alert>
    )
  }

  // State 2: Warning (Warm Amber instead of Evil Red)
  return (
    <Alert className="border-amber-500/50 text-amber-700 dark:text-amber-400 bg-amber-500/10">
      <Mail className="h-4 w-4" />
      <AlertTitle>Verify your email</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
        <span className="text-amber-600/90 dark:text-amber-400/90">
          You need to verify your email address to unlock payments and AI tools.
        </span>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleResend} 
          disabled={loading}
          className="border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 hover:text-amber-800 dark:hover:text-amber-300 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Resend Link
              <Send className="w-3 h-3 ml-2" />
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  )
}