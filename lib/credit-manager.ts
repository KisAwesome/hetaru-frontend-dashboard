// In-memory credit store (replace with database in production)
interface UserCredits {
  [userId: string]: {
    balance: number
    transactions: any[]
  }
}

const creditStore: UserCredits = {
  'user@example.com': { balance: 5000, transactions: [] },
}

export function getUserCredits(userId: string): number {
  if (!creditStore[userId]) {
    creditStore[userId] = { balance: 1000, transactions: [] }
  }
  return creditStore[userId].balance
}

export function deductCredits(
  userId: string,
  creditCost: number,
  transaction: any
): { success: boolean; remainingCredits: number } {
  if (!creditStore[userId]) {
    creditStore[userId] = { balance: 1000, transactions: [] }
  }

  const userCredits = creditStore[userId]

  if (userCredits.balance < creditCost) {
    return { success: false, remainingCredits: userCredits.balance }
  }

  userCredits.balance -= creditCost
  userCredits.transactions.push(transaction)

  return { success: true, remainingCredits: userCredits.balance }
}

export function getTransactionHistory(userId: string): any[] {
  if (!creditStore[userId]) {
    return []
  }
  return creditStore[userId].transactions.slice(-10)
}
