export function getFriendlyErrorMessage(errorCode: string): string {
  const errorMap: Record<string, string> = {
    // Authentication errors
    "auth/invalid-credential": "Incorrect email or password. Please try again.",
    "auth/user-not-found": "No account found with this email. Please sign up first.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists. Please sign in instead.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters including letters and numbers.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed": "Email/password authentication is not enabled. Please contact support.",
    "auth/too-many-requests": "Too many failed login attempts. Please try again later.",
    "auth/account-exists-with-different-credential": "This email is associated with another login method.",
    "auth/invalid-password": "Password must be at least 6 characters long.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/unauthorized-domain":
      "Domain not authorized. Add your domain to Firebase Console > Authentication > Settings > Authorized domains.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/internal-error": "An internal error occurred. Please try again.",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    "auth/cancelled-popup-request": "Sign-in popup was cancelled. Please try again.",
    "auth/third-party-auth-disabled": "Third-party authentication is disabled. Please contact support.",
  }

  return errorMap[errorCode] || "Authentication failed. Please try again."
}

export function extractErrorCode(error: any): string {
  if (!error) return "auth/internal-error"
  if (typeof error === "string") return error
  if (error.code) return error.code
  if (error.message && error.message.includes("auth/")) {
    const match = error.message.match(/$$auth\/[a-z-]+$$/)
    if (match) return match[0].slice(1, -1)
  }
  return "auth/internal-error"
}
