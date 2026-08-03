"use client"

import React from "react"
import { useMedusaAuth } from "@lib/hooks/use-medusa-auth"
import GoogleAuthButton from "@modules/account/components/google-auth-button"

export default function GoogleAutoSignIn() {
  const { status, session, signOut, isLoading } = useMedusaAuth()

  if (status === "loading" || isLoading) {
    return (
      <div className="w-full p-3 text-center text-xs text-[var(--text-muted)] animate-pulse">
        Checking Google authentication status...
      </div>
    )
  }

  if (status === "authenticated" && session?.user) {
    return (
      <div className="w-full p-4 rounded-xl border border-amber-400/30 bg-amber-400/10 mb-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 w-full">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User Avatar"}
              className="w-10 h-10 rounded-full border border-amber-400"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-sm">
              {session.user.name?.[0] || "G"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">
              Google Authenticated
            </p>
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {session.user.name || session.user.email}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">{session.user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full pt-2 border-t border-amber-400/20">
          <button
            disabled
            className="flex-1 py-2 bg-amber-400/50 text-black/60 text-xs font-bold rounded-lg cursor-not-allowed"
          >
            Auto Sign-In Active ✓
          </button>
          <button
            onClick={signOut}
            className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-red-400 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mb-6">
      <GoogleAuthButton label="Continue with Google" />
    </div>
  )
}
