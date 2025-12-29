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

import { doc, onSnapshot } from "firebase/firestore"
import { auth, googleProvider, db } from "@/lib/firebase"
import { api } from "@/lib/api"

export type UserProfile = {
  displayName?: string
  walletBalance?: number
  // add more fields you keep in users/{uid} if needed
}

type AuthCtx = {
  user: User | null
  loading: boolean
  error: string | null

  // ✅ Firestore user doc (single onSnapshot for the whole app)
  profile: UserProfile | null
  profileLoading: boolean

  // Auth actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>

  // Email verification UX
  emailVerificationSent: boolean
  verificationEmail: string
  resendVerificationEmail: () => Promise<void>
  dismissEmailVerification: () => void

  // Useful to re-check verified state
  refreshUser: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

function friendlyFirebaseError(err: any) {
  const code = err?.code || ""
  if (code === "auth/unauthorized-domain") return "Domain not authorized"
  if (code === "auth/popup-closed-by-user") return "Popup closed"
  if (code === "auth/cancelled-popup-request") return "Popup cancelled"
  if (code === "auth/wrong-password") return "Wrong password"
  if (code === "auth/user-not-found") return "User not found"
  if (code === "auth/email-already-in-use") return "Email already in use"
  return err?.message || "Authentication error"
}

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")

  // ✅ single Firestore listener state
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // 1) Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      setError(null)

      // If they become verified, exit verify screen automatically
      if (u?.emailVerified) setEmailVerificationSent(false)
    })

    return () => unsub()
  }, [])

  // 2) ✅ Single onSnapshot(users/{uid}) for the whole app
  useEffect(() => {
    // no user => clear profile
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
      setError(friendlyFirebaseError(err))
      throw err
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
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

      // Your existing flow: create user doc/wallet etc
      // ✅ pass displayName so backend stores it in users/{uid}
      await api.post("/api/register", { displayName: trimmedName || null })
    } catch (err: any) {
      setError(friendlyFirebaseError(err))
      throw err
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const result = await signInWithPopup(auth, googleProvider)
      const details = getAdditionalUserInfo(result)

      if (details?.isNewUser) {
        // ✅ send displayName so backend stores it in users/{uid}
        await api.post("/api/register", {
          displayName: result.user.displayName || null,
        })
      }
    } catch (err: any) {
      setError(friendlyFirebaseError(err))
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
      setError(friendlyFirebaseError(err))
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
      setError(friendlyFirebaseError(err))
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
