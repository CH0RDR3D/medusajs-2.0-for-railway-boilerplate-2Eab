"use client"

import React from "react"
import { useMedusaAuth } from "@lib/hooks/use-medusa-auth"
import GoogleAuthButton from "@modules/account/components/google-auth-button"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

/**
 * GoogleAutoSignIn Component
 * Handles Google OAuth auto-detection, auto-fetching profile name/avatar,
 * prompting to link if detected, and providing a clean manual fallback.
 */
export default function GoogleAutoSignIn() {
  const { status, session, signOut, signInWithGoogle, isLoading } = useMedusaAuth()

  // 1. Loading State
  if (status === "loading" || isLoading) {
    return (
      <div className="w-full p-3.5 rounded-xl border border-[var(--surface-border)] bg-[var(--bg-card)] mb-6 flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)] animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        <span>Detecting Google authentication status...</span>
      </div>
    )
  }

  // 2. Google Account Detected & Authenticated
  if (status === "authenticated" && session?.user) {
    const medusaToken = (session.user as any)?.medusaToken
    const displayName = session.user.name || session.user.email || "Google User"

    // If Google account is active in NextAuth but Medusa token is still syncing / unlinked
    if (!medusaToken) {
      return (
        <div className="w-full p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-black">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">
                Google Account Detected
              </p>
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                {displayName}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">{session.user.email}</p>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Click below to complete linking your Google account with SYA Store.
          </p>
          <div className="flex items-center gap-2 pt-2 border-t border-amber-500/20">
            <button
              onClick={() => signInWithGoogle()}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition shadow-sm"
            >
              Link &amp; Sign In as {session.user.name?.split(" ")[0] || "User"}
            </button>
            <button
              onClick={() => signOut()}
              className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-red-400 transition"
            >
              Switch Account
            </button>
          </div>
        </div>
      )
    }

    // Fully linked Google session
    return (
      <div className="w-full p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 mb-6 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-3 w-full">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={displayName}
              className="w-10 h-10 rounded-full border border-amber-500 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Google Account Active</span>
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)] truncate">
              {displayName}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">{session.user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full pt-2 border-t border-amber-500/20">
          <span className="flex-1 py-1.5 px-3 bg-amber-500/20 text-amber-500 text-xs font-bold rounded-lg text-center">
            Signed in as {displayName}
          </span>
          <button
            onClick={() => signOut()}
            className="px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-red-400 transition rounded-lg hover:bg-[var(--bg-base)]"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  // 3. Fallback: Standard Google Sign-In Button with prompt
  return (
    <div className="w-full mb-6">
      <GoogleAuthButton label="Continue with Google" />
    </div>
  )
}
