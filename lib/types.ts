// Credit System Types
export interface CreditTransaction {
  id: string
  userId: string
  serviceId: string
  serviceName: string
  creditCost: number
  creditsRemaining: number
  timestamp: string
  status: 'completed' | 'failed' | 'pending'
}

export interface ServicePricing {
  id: string
  name: string
  creditCostPerCall: number
  category: string
  description: string
}

export interface CreditDeductionRequest {
  userId: string
  serviceId: string
  serviceName: string
  creditCost: number
}

export interface CreditDeductionResponse {
  success: boolean
  creditsRemaining: number
  transaction: CreditTransaction
  message: string
}

export interface GeminiRequest {
  prompt: string
  userId: string
  serviceId: string
  serviceName: string
  creditCost: number
}

export interface GeminiResponse {
  text: string
  creditsRemaining: number
  transaction: CreditTransaction
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}
