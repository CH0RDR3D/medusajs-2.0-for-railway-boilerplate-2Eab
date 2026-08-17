"use client"

/**
 * useMedusaAuth
 *
 * Centralised client-side auth hook.
 * - Wraps NextAuth useSession / signIn / signOut
 * - After Google sign-in completes, syncs the Medusa JWT into a server-side
 *   cookie via loginWithMedusaToken() then redirects to /account
 * - Exposes isLoading, signInWithGoogle, signOut, session, status
 */

import { useSession, signIn, signOut as nextAuthSignOut } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { loginWithMedusaToken } from "@lib/data/customer"

export function useMedusaAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  // Prevent the sync effect from firing more than once per session
  const synced = useRef(false)

  /** Trigger Google OAuth popup/redirect */
  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      const callbackUrl = typeof window !== "undefined" ? window.location.href : "/account"
      await signIn("google", { callbackUrl })
    } catch (err) {
      console.error("[useMedusaAuth] Google sign-in error:", err)
      setIsLoading(false)
    }
  }

  /** Sign out of both NextAuth and clear Medusa cookie */
  const signOut = async () => {
    setIsLoading(true)
    try {
      if (typeof window !== "undefined") {
        const userKey =
          session?.user?.email || (session?.user as { id?: string })?.id
        if (userKey) {
          window.sessionStorage.removeItem(`medusa-auth-synced:${userKey}`)
        }
      }
      await nextAuthSignOut({ callbackUrl: "/account" })
    } catch (err) {
      console.error("[useMedusaAuth] Sign-out error:", err)
      setIsLoading(false)
    }
  }

  /**
   * After a successful Google sign-in the medusaToken is embedded in the
   * session by the NextAuth jwt/session callbacks (route.ts). We detect it
   * here and persist it to a server cookie, then redirect.
   */
  useEffect(() => {
    const medusaToken = (session?.user as any)?.medusaToken as string | undefined

    if (status !== "authenticated" || !medusaToken) {
      synced.current = false
      return
    }

    const userKey =
      session?.user?.email || (session?.user as { id?: string })?.id
    const syncKey = userKey ? `medusa-auth-synced:${userKey}` : null
    const alreadySynced =
      typeof window !== "undefined" &&
      syncKey !== null &&
      window.sessionStorage.getItem(syncKey) === "true"

    if (syncKey && !alreadySynced && !synced.current) {
      synced.current = true
      setIsLoading(true)
      loginWithMedusaToken(medusaToken)
        .then(() => {
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(syncKey, "true")
            const path = window.location.pathname
            if (path.includes("/login") || path.includes("/register")) {
              router.replace("/account")
            } else {
              router.refresh()
            }
          }
        })
        .catch((err) => {
          console.error("[useMedusaAuth] loginWithMedusaToken failed:", err)
          setIsLoading(false)
          synced.current = false
        })
    }
  }, [router, status, session])

  return {
    session,
    status,
    isLoading: isLoading || status === "loading",
    signInWithGoogle,
    signOut,
  }
}
