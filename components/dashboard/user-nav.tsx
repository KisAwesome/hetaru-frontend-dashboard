"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreditCard, LogOut, Settings, User as UserIcon } from "lucide-react"
import { useAuth } from "@/components/firebase-auth-provider"
import { useRouter } from "next/navigation"

export function UserNav() {
  // ✅ Get 'profile' so we see the Firestore updates instantly
  const { user, profile, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  // ✅ Priority: Firestore Profile -> Auth User -> Fallback
  const displayName = profile?.displayName || "Hetaru user"
  const email = user.email || ""
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-14 w-full justify-start gap-3 rounded-xl px-2 hover:bg-secondary/50">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user.photoURL || ""} alt={displayName} />
            <AvatarFallback className="font-bold bg-primary/10 text-primary">
               {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-start text-sm overflow-hidden">
            <span className="font-semibold text-foreground truncate w-full text-left">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full text-left">
              {email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 mb-2" align="start" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings/billing")}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()} className="text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}