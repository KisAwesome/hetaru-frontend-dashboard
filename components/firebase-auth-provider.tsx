"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { User } from "firebase/auth"
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  sendPasswordResetEmail,
  getAdditionalUserInfo,
} from "firebase/auth"

import { doc, onSnapshot, Timestamp } from "firebase/firestore"
import { auth, googleProvider, db } from "@/lib/firebase"
import { api } from "@/lib/api"

export type UserUsageStats = {
  currentMonth: string         
  monthSpent: number           
  monthRequestCount: number    
  totalSpent: number           
  totalServices: number        
  uniqueServicesCount: number  
  uniqueServiceIds: string[]   
}

export type UserProfile = {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  walletBalance: number
  usage?: UserUsageStats
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  stripePriceId?: string | null
  subscriptionStatus?: "active" | "inactive" | "past_due" | "canceled" | "incomplete"
  subscriptionTier?: "free" | "starter" | "pro"
  nextBillingDate?: Timestamp | null
  createdAt?: Timestamp
  lastActive?: Timestamp
}

type AuthCtx = {
  user: User | null
  loading: boolean
  error: string | null
  profile: UserProfile | null
  profileLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  emailVerificationSent: boolean
  verificationEmail: string
  resendVerificationEmail: () => Promise<void>
  dismissEmailVerification: () => void
  refreshUser: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // 1) Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      setError(null)

      // If verified, auto-dismiss the verification screen
      if (u?.emailVerified) setEmailVerificationSent(false)
    })

    return () => unsub()
  }, [])

  // 2) Firestore Profile Listener
  useEffect(() => {
    if (!user?.uid) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    setProfileLoading(true)
    const ref = doc(db, "users", user.uid)

    const unsub = onSnapshot(
      ref,
      (snap) => {
        setProfile(snap.exists() ? (snap.data() as UserProfile) : null)
        setProfileLoading(false)
      },
      (err) => {
        console.error("Profile snapshot error:", err)
        setProfile(null)
        setProfileLoading(false)
      }
    )

    return () => unsub()
  }, [user?.uid])

  const refreshUser = async () => {
    if (!auth.currentUser) return
    await auth.currentUser.reload()
    setUser(auth.currentUser)
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      // ✅ No custom message function, just raw error
      setError(err.message)
      throw err
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null)
      const trimmedName = displayName?.trim()
      const cred = await createUserWithEmailAndPassword(auth, email, password)

      if (trimmedName) {
        await updateProfile(cred.user, { displayName: trimmedName })
      }


      await sendEmailVerification(cred.user)
      
      setEmailVerificationSent(true)
      setVerificationEmail(email)

      await api.post("/api/register", { displayName: trimmedName || null })
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const result = await signInWithPopup(auth, googleProvider)
      const details = getAdditionalUserInfo(result)

      if (details?.isNewUser) {
        await api.post("/api/register", {
          displayName: result.user.displayName || null,
        })
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      await sendPasswordResetEmail(auth, email)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const resendVerificationEmail = async () => {
    try {
      setError(null)
      if (!auth.currentUser) throw new Error("No user to verify")
      
      
      await sendEmailVerification(auth.currentUser)
      setEmailVerificationSent(true)
      setVerificationEmail(auth.currentUser.email || verificationEmail)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const dismissEmailVerification = () => setEmailVerificationSent(false)

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      error,
      profile,
      profileLoading,
      signIn,
      signUp,
      signInWithGoogle,
      logout,
      resetPassword,
      emailVerificationSent,
      verificationEmail,
      resendVerificationEmail,
      dismissEmailVerification,
      refreshUser,
    }),
    [user, loading, error, profile, profileLoading, emailVerificationSent, verificationEmail]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useAuth must be used inside <FirebaseAuthProvider>")
  return ctx
}