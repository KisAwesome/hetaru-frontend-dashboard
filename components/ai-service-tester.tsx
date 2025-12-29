'use client'

import { useState } from 'react'
import { Loader2, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GeminiResponse } from '@/lib/types'

interface AIServiceTesterProps {
  userId: string
  serviceName: string
  creditCost: number
  serviceId: string
  onServiceUsed?: () => void
}

export function AIServiceTester({
  userId,
  serviceName,
  creditCost,
  serviceId,
  onServiceUsed,
}: AIServiceTesterProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<GeminiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResponse(null)
    setLoading(true)

    console.log('[v0] Submitting prompt:', prompt)

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userId,
          serviceId,
          serviceName,
          creditCost,
        }),
      })

      console.log('[v0] Response status:', res.status)

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to generate response')
        return
      }

      console.log('[v0] Response received:', data)
      if (onServiceUsed) {
        onServiceUsed()
      }

      setResponse(data)
      setPrompt('')
    } catch (err) {
      console.log('[v0] Error:', err)
      setError('Failed to connect to API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{serviceName}</CardTitle>
          <CardDescription>
            Try this service - each call costs {creditCost} credits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Enter prompt</label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="What would you like to ask?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !prompt.trim()}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {response && (
            <div className="space-y-3">
              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <p className="text-sm font-medium mb-2">Response:</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{response.text}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 bg-primary/10 rounded border border-primary/20">
                  <p className="text-xs text-muted-foreground">Credits Spent</p>
                  <p className="font-bold text-primary">{creditCost}</p>
                </div>
                <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="font-bold text-green-500">{response.creditsRemaining}</p>
                </div>
                <div className="p-2 bg-accent/10 rounded border border-accent/20">
                  <p className="text-xs text-muted-foreground">Output Tokens</p>
                  <p className="font-bold text-accent">{response.usage?.outputTokens}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
