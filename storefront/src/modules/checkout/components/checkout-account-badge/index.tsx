"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"
import { useMedusaAuth } from "@lib/hooks/use-medusa-auth"
import { User, CheckCircle2, LogIn, ArrowRight } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface CheckoutAccountBadgeProps {
  customer: HttpTypes.StoreCustomer | null
}

/**
 * CheckoutAccountBadge Component
 * Shows the active account name on the checkout page,
 * automatically detects Google sessions, and provides 1-click sign-in or guest checkout options.
 */
export default function CheckoutAccountBadge({ customer }: CheckoutAccountBadgeProps) {
  const { session, status, signInWithGoogle, isLoading } = useMedusaAuth()

  const customerFullName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ")
  const accountName = customerFullName || session?.user?.name || customer?.email || session?.user?.email
  const activeEmail = customer?.email || session?.user?.email

  // 1. Authenticated User (Medusa Customer or Google Session)
  if (customer || (status === "authenticated" && session?.user)) {
    return (
      <div className="mb-6 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={accountName || "User"}
              className="w-9 h-9 rounded-full border border-amber-500 object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs">
              {accountName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Signed In Account</span>
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {accountName}
            </p>
            {activeEmail && (
              <p className="text-xs text-[var(--text-secondary)]">{activeEmail}</p>
            )}
          </div>
        </div>

        <LocalizedClientLink
          href="/account"
          className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1 self-end sm:self-center"
        >
          <span>Account Dashboard</span>
          <ArrowRight className="w-3 h-3" />
        </LocalizedClientLink>
      </div>
    )
  }

  // 2. Google Account Detected in Browser Session (but not yet linked to active checkout)
  if (status === "authenticated" && session?.user && !customer) {
    return (
      <div className="mb-6 p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs">
            {session.user.name?.charAt(0).toUpperCase() || "G"}
          </div>
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              Google Account Detected
            </p>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {session.user.name || session.user.email}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Sign in for faster address autofill</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signInWithGoogle()}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-1.5 self-end sm:self-center shadow-sm"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In as {session.user.name?.split(" ")[0] || "User"}</span>
        </button>
      </div>
    )
  }

  // 3. Guest Checkout (Unauthenticated)
  return (
    <div className="mb-6 p-3.5 rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        <User className="w-4 h-4 text-[var(--text-muted)]" />
        <span>Checking out as Guest. Have an account?</span>
      </div>
      <LocalizedClientLink
        href="/account"
        className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
      >
        <span>Sign in with Email or Google</span>
        <ArrowRight className="w-3 h-3" />
      </LocalizedClientLink>
    </div>
  )
}
