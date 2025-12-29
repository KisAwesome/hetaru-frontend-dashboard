"use client"

import { db } from "./firebase"
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from "firebase/firestore"
import type { CreditTransaction } from "./types"

export async function getUserCredits(userId: string): Promise<number> {
  try {
    const userDocRef = doc(db, "users", userId)
    const userSnapshot = await getDoc(userDocRef)

    if (userSnapshot.exists()) {
      return userSnapshot.data().credits || 0
    } else {
      await setDoc(userDocRef, {
        credits: 1000,
        transactions: [],
        favorites: [],
        recentServices: [],
        createdAt: new Date().toISOString(),
      })
      return 1000
    }
  } catch (error) {
    console.error("[v0] Error getting user credits:", error)
    throw error
  }
}

export async function deductCredits(
  userId: string,
  creditCost: number,
  transaction: Omit<CreditTransaction, "id">,
): Promise<{ success: boolean; remainingCredits: number }> {
  try {
    const userDocRef = doc(db, "users", userId)
    const userSnapshot = await getDoc(userDocRef)

    if (!userSnapshot.exists()) {
      console.error("[v0] User document not found:", userId)
      return { success: false, remainingCredits: 0 }
    }

    const currentCredits = userSnapshot.data().credits || 0

    if (currentCredits < creditCost) {
      console.log("[v0] Insufficient credits:", { currentCredits, creditCost })
      return { success: false, remainingCredits: currentCredits }
    }

    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }

    await updateDoc(userDocRef, {
      credits: increment(-creditCost),
      transactions: arrayUnion(newTransaction),
    })

    return { success: true, remainingCredits: currentCredits - creditCost }
  } catch (error) {
    console.error("[v0] Error deducting credits:", error)
    throw error
  }
}

export async function addCredits(userId: string, creditAmount: number, reason = "Purchase"): Promise<number> {
  try {
    const userDocRef = doc(db, "users", userId)

    const transaction = {
      id: Date.now().toString(),
      userId,
      serviceId: "credit-purchase",
      serviceName: "Credit Purchase",
      creditCost: -creditAmount,
      creditsRemaining: 0,
      timestamp: new Date().toISOString(),
      status: "completed" as const,
      reason,
    }

    await updateDoc(userDocRef, {
      credits: increment(creditAmount),
      transactions: arrayUnion(transaction),
    })

    const updatedSnapshot = await getDoc(userDocRef)
    return updatedSnapshot.data().credits || 0
  } catch (error) {
    console.error("[v0] Error adding credits:", error)
    throw error
  }
}

export async function getTransactionHistory(userId: string, limitCount = 10): Promise<CreditTransaction[]> {
  try {
    const userDocRef = doc(db, "users", userId)
    const userSnapshot = await getDoc(userDocRef)

    if (userSnapshot.exists()) {
      const transactions = userSnapshot.data().transactions || []
      return transactions.slice(-limitCount).reverse()
    }
    return []
  } catch (error) {
    console.error("[v0] Error getting transaction history:", error)
    throw error
  }
}

export async function saveFavoriteService(userId: string, serviceId: string): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userId)
    const userSnapshot = await getDoc(userDocRef)

    if (userSnapshot.exists()) {
      const favorites = userSnapshot.data().favorites || []
      if (!favorites.includes(serviceId)) {
        await updateDoc(userDocRef, {
          favorites: arrayUnion(serviceId),
        })
      }
    }
  } catch (error) {
    console.error("[v0] Error saving favorite:", error)
    throw error
  }
}

export async function removeFavoriteService(userId: string, serviceId: string): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userId)
    const userSnapshot = await getDoc(userDocRef)

    if (userSnapshot.exists()) {
      const favorites = userSnapshot.data().favorites || []
      const updated = favorites.filter((id: string) => id !== serviceId)
      await updateDoc(userDocRef, {
        favorites: updated,
      })
    }
  } catch (error) {
    console.error("[v0] Error removing favorite:", error)
    throw error
  }
}

export async function getFavoriteServices(userId: string): Promise<string[]> {
  try {
    const userDocRef = doc(db, "users", userId)
    const userSnapshot = await getDoc(userDocRef)

    if (userSnapshot.exists()) {
      return userSnapshot.data().favorites || []
    }
    return []
  } catch (error) {
    console.error("[v0] Error getting favorites:", error)
    throw error
  }
}

export async function saveRecentService(userId: string, serviceId: string): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userId)
    const userSnapshot = await getDoc(userDocRef)

    if (userSnapshot.exists()) {
      let recentServices = userSnapshot.data().recentServices || []
      recentServices = recentServices.filter((id: string) => id !== serviceId)
      recentServices.unshift(serviceId)
      recentServices = recentServices.slice(0, 5)

      await updateDoc(userDocRef, {
        recentServices,
      })
    }
  } catch (error) {
    console.error("[v0] Error saving recent service:", error)
    throw error
  }
}

export async function getRecentServices(userId: string): Promise<string[]> {
  try {
    const userDocRef = doc(db, "users", userId)
    const userSnapshot = await getDoc(userDocRef)

    if (userSnapshot.exists()) {
      return userSnapshot.data().recentServices || []
    }
    return []
  } catch (error) {
    console.error("[v0] Error getting recent services:", error)
    throw error
  }
}

export async function updateUserProfile(
  userId: string,
  profileData: {
    displayName?: string
    photoURL?: string
    phone?: string
  },
): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userId)

    await updateDoc(userDocRef, {
      ...profileData,
      updatedAt: new Date().toISOString(),
    })
    console.log("[v0] User profile updated:", userId)
  } catch (error) {
    console.error("[v0] Error updating user profile:", error)
    throw error
  }
}

export async function getUserProfile(userId: string): Promise<any> {
  try {
    const userDocRef = doc(db, "users", userId)
    const userSnapshot = await getDoc(userDocRef)

    if (userSnapshot.exists()) {
      return userSnapshot.data()
    }
    return null
  } catch (error) {
    console.error("[v0] Error getting user profile:", error)
    throw error
  }
}
