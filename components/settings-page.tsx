"use client"

import { useEffect, useMemo, useState } from "react"
import { Edit2, Check, X } from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "./firebase-auth-provider"
import { db } from "@/lib/firebase"

export function SettingsPage() {
  const { user, profile } = useAuth()

  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState("")
  const [saving, setSaving] = useState(false)

  const isGoogleUser = user?.providerData?.[0]?.providerId === "google.com"

  // ✅ show name from Firestore profile (fallbacks)
  const displayName = useMemo(() => {
    return (
      profile?.displayName?.trim() ||
      user?.displayName?.trim() ||
      user?.email?.split("@")[0] ||
      (isGoogleUser ? "Google User" : "User")
    )
  }, [profile?.displayName, user?.displayName, user?.email, isGoogleUser])

  const handleStartEdit = () => {
    setTempName(profile?.displayName?.trim() || user?.displayName?.trim() || "")
    setIsEditingName(true)
  }

  const handleCancelEdit = () => {
    setTempName("")
    setIsEditingName(false)
  }

  // ✅ save new displayName to Firestore users/{uid} (and optionally Auth profile)
  const handleSaveName = async () => {
    if (!user?.uid) return
    const next = tempName.trim()
    if (!next) return

    try {
      setSaving(true)

      // 1) Save to Firestore (this updates sidebar/dashboard instantly via your single onSnapshot)
      await updateDoc(doc(db, "users", user.uid), { displayName: next })

      // 2) Optional: keep Firebase Auth displayName in sync too (nice for Google / other surfaces)
      if (user) {
        await updateProfile(user, { displayName: next })
      }

      setIsEditingName(false)
      setTempName("")
    } catch (e) {
      console.error("Failed to update displayName:", e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account profile information</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Avatar and Name */}
          <div className="flex items-start gap-6">
            <div className="relative">
              {isGoogleUser && user?.photoURL ? (
                <img
                  src={user.photoURL || "/placeholder.svg"}
                  alt={displayName}
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border-2 border-border">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {isGoogleUser && (
                <div className="absolute bottom-0 right-0 bg-green-500 px-2 py-1 rounded-full text-xs font-medium text-white border-2 border-background">
                  Google
                </div>
              )}
            </div>

            {/* Name Section */}
            <div className="flex-1">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Display Name</label>

                  {isEditingName ? (
                    <div className="flex gap-2">
                      <Input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Enter your name"
                        className="flex-1"
                        disabled={saving}
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={saving || !tempName.trim()}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={saving}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-2xl font-bold">{displayName}</p>
                      <Button size="sm" variant="outline" onClick={handleStartEdit}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground mt-2">
                    {isGoogleUser ? "Connected via Google Account" : "Stored in your profile"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and authentication method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="mt-1 text-foreground">{user?.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Authentication Method</label>
            <p className="mt-1 text-foreground">{isGoogleUser ? "Google OAuth" : "Email & Password"}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">User ID</label>
            <p className="mt-1 text-xs font-mono text-muted-foreground break-all">{user?.uid}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Account Created</label>
            <p className="mt-1 text-foreground">
              {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-yellow-700 dark:text-yellow-400">Security Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            {isGoogleUser
              ? "Your account is secured with Google OAuth. Your password is managed by Google."
              : "To change your password, use the password reset feature in the authentication provider."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
