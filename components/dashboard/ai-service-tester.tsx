"use client"

import { useState } from "react"
import { useAuth } from "@/components/firebase-auth-provider"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface AIServiceTesterProps {
  userId: string
  serviceName: string
  creditCost: number
  serviceId: string
  onServiceUsed?: () => void
}

export function AIServiceTester({ 
  serviceName, 
  creditCost, 
  serviceId,
  onServiceUsed 
}: AIServiceTesterProps) {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const handleTestService = async () => {
    setLoading(true)
    setLastResult(null)

    try {
      if (!user) {
        setLastResult({ error: "You must be logged in." })
        setLoading(false)
        return
      }

      // Check local balance before sending (optimistic check)
      if ((profile?.walletBalance || 0) < creditCost) {
        setLastResult({ error: "Insufficient credits. Please top up your wallet." })
        setLoading(false)
        return
      }

      // 1. CALL YOUR DYNAMIC ENDPOINT
      // Matches the structure: /api/services/{serviceId}/simulate
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/services/demo-service/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          actionType: "Generate Report", // Or pass dynamic input if needed
          prompt: "Test execution from Service Lab" // Default prompt
        })
      });

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute service")
      }

      // 2. SUCCESS
      setLastResult(data)
      console.log("Transaction Receipt:", data)
      
      // 3. REFRESH BALANCE
      // The Firestore listener in useAuth handles the balance update automatically.
      // We just notify the parent component to update "Recents" list.
      if (onServiceUsed) onServiceUsed()

    } catch (err: any) {
      console.error(err)
      setLastResult({ error: err.message || "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
         🛠 Service Lab <span className="text-xs font-normal text-muted-foreground">({serviceName})</span>
      </h3>
      
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* THE TEST BUTTON */}
        <button
          onClick={handleTestService}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium text-primary-foreground transition-all w-full sm:w-auto ${
            loading 
              ? "bg-muted cursor-not-allowed text-muted-foreground" 
              : "bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Run Service (-${creditCost} Credits)`
          )}
        </button>

        {/* RESULT DISPLAY */}
        <div className="flex-1 w-full bg-muted/30 rounded-lg p-3 font-mono text-xs text-muted-foreground border border-border overflow-hidden min-h-[42px] flex items-center">
            {lastResult ? (
                lastResult.error ? (
                    <span className="text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> 
                        {lastResult.error}
                    </span>
                ) : (
                    <span className="text-green-600 dark:text-green-400">
                        ✅ Success! <br/>
                        Receipt ID: {lastResult.receiptId || "N/A"} <br/>
                        {lastResult.result ? `Result: ${JSON.stringify(lastResult.result).slice(0, 50)}...` : "Transaction Completed"}
                    </span>
                )
            ) : (
                <span className="opacity-50">Results will appear here...</span>
            )}
        </div>
      </div>
    </div>
  )
}