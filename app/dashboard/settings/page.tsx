"use client"

import { useMemo, useState, useEffect } from "react"
import { Edit2, Check, X, Loader2, Moon, Sun } from "lucide-react"
import { doc, setDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import { useAuth } from "@/components/firebase-auth-provider"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ModeToggle } from "@/components/mode-toggle" // ✅ Import the toggle

export default function SettingsProfilePage() {
  const { user, profile, refreshUser } = useAuth()
  const { toast } = useToast()

  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState("")
  const [saving, setSaving] = useState(false)

  // Local state for instant UI feedback
  const [localDisplayName, setLocalDisplayName] = useState("")

  useEffect(() => {
      setLocalDisplayName(profile?.displayName || "Hetaru user")
  }, [profile, user])

  const isGoogleUser = user?.providerData?.[0]?.providerId === "google.com"

  const creationDate = useMemo(() => {
    if (!user?.metadata?.creationTime) return "Unknown"
    return new Date(user.metadata.creationTime).toLocaleDateString()
  }, [user])

  const handleStartEdit = () => {
    setTempName(localDisplayName || "")
    setIsEditingName(true)
  }

  const handleSaveName = async () => {
    if (!user?.uid) return
    const next = tempName.trim()
    if (!next) return

    try {
      setSaving(true)
      setLocalDisplayName(next)
      setIsEditingName(false)

      await setDoc(doc(db, "users", user.uid), { displayName: next }, { merge: true })

      if (user) {
        await updateProfile(user, { displayName: next })
        await refreshUser() 
      }

      toast({ title: "Profile updated", description: "Your display name has been changed." })
    } catch (e) {
      console.error(e)
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile." })
      setLocalDisplayName(profile?.displayName || user?.displayName || "")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />

      {/* 1. Display Name Card */}
      <Card>
        <CardHeader>
          <CardTitle>Display Name</CardTitle>
          <CardDescription>
            Please enter your full name, or a display name you are comfortable with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative h-20 w-20 shrink-0">
               {user?.photoURL ? (
                 <img 
                   src={user.photoURL} 
                   alt="Avatar" 
                   className="h-full w-full rounded-full object-cover border-2 border-border" 
                 />
               ) : (
                 <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                   <span className="text-2xl font-bold text-primary">
                     {localDisplayName.charAt(0).toUpperCase()}
                   </span>
                 </div>
               )}
               
               {isGoogleUser && (
                  <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5 border shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                      <path fill="#EA4335" d="M12 4.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.05 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
               )}
            </div>

            <div className="flex-1 max-w-md">
               {isEditingName ? (
                 <div className="flex gap-2">
                   <Input 
                     value={tempName} 
                     onChange={(e) => setTempName(e.target.value)} 
                     disabled={saving}
                     placeholder="Enter display name"
                     className="bg-background"
                   />
                   <Button size="icon" onClick={handleSaveName} disabled={saving}>
                     {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                   </Button>
                   <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                     <X className="h-4 w-4" />
                   </Button>
                 </div>
               ) : (
                 <div className="flex justify-between items-center border rounded-lg p-4 bg-secondary/10">
                   <span className="font-semibold text-lg">{localDisplayName || "User"}</span>
                   <Button variant="ghost" size="sm" onClick={handleStartEdit}>
                     <Edit2 className="h-4 w-4 mr-2" />
                     Edit
                   </Button>
                 </div>
               )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ 2. NEW: Appearance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how Hetaru looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4 bg-background">
            <div className="space-y-0.5">
              <label className="text-base font-medium">Interface Theme</label>
              <p className="text-sm text-muted-foreground">
                Select a theme for the dashboard (Light, Dark, or System).
              </p>
            </div>
            {/* The toggle component you created earlier */}
            <ModeToggle />
          </div>
        </CardContent>
      </Card>

      {/* 3. Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and authentication method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-1">
             <label className="text-sm font-medium leading-none text-muted-foreground">Email</label>
             <p className="text-base font-medium">{user?.email}</p>
          </div>

          <div className="grid gap-1">
             <label className="text-sm font-medium leading-none text-muted-foreground">Authentication Method</label>
             <p className="text-base font-medium flex items-center gap-2">
               {isGoogleUser ? "Google OAuth" : "Email & Password"}
             </p>
          </div>

          <div className="grid gap-1">
             <label className="text-sm font-medium leading-none text-muted-foreground">User ID</label>
             <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold w-fit">
               {user?.uid}
             </code>
          </div>

          <div className="grid gap-1">
             <label className="text-sm font-medium leading-none text-muted-foreground">Account Created</label>
             <p className="text-base font-medium">{creationDate}</p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Security Notice */}
      <Card className="border-amber-500/20 bg-amber-500/10 dark:bg-amber-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-600 dark:text-amber-500 text-base">Security Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-600/90 dark:text-amber-500/90">
            {isGoogleUser
              ? "Your account is secured with Google OAuth. Your password is managed by Google."
              : "To change your password, please use the reset password link on the login page."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}