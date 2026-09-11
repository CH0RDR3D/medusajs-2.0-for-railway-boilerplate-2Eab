"use client"

import React, { useState } from "react"
import { useMedusaAuth } from "@lib/hooks/use-medusa-auth"
import { HttpTypes } from "@medusajs/types"
import {
  Sparkles,
  Zap,
  MapPin,
  Truck,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  X,
} from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface CheckoutMotivationalBannerProps {
  customer: HttpTypes.StoreCustomer | null
}

export default function CheckoutMotivationalBanner({
  customer,
}: CheckoutMotivationalBannerProps) {
  const { session, status, signInWithGoogle, isLoading } = useMedusaAuth()
  const [dismissed, setDismissed] = useState(false)

  const customerFullName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ")
  const accountName =
    customerFullName || session?.user?.name || customer?.email || session?.user?.email
  const activeEmail = customer?.email || session?.user?.email

  // If user is authenticated: Show sleek Verified Member Status
  if (customer || (status === "authenticated" && session?.user)) {
    return (
      <div
        className="mb-6 p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        data-testid="checkout-authenticated-badge"
      >
        <div className="flex items-center gap-3.5">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={accountName || "User"}
              className="w-10 h-10 rounded-full border-2 border-amber-500 object-cover shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-black flex items-center justify-center font-bold text-sm shadow-sm">
              {accountName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Member Account</span>
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {accountName}
            </p>
            {activeEmail && (
              <p className="text-xs text-[var(--text-secondary)]">{activeEmail}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <LocalizedClientLink
            href="/account/addresses"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition"
          >
            Saved Addresses
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account"
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1 transition"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  // If dismissed by guest user
  if (dismissed) {
    return (
      <div className="mb-4 flex items-center justify-between px-3 py-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-xs text-[var(--text-muted)]">
        <span>Checking out as Guest.</span>
        <button
          type="button"
          onClick={() => setDismissed(false)}
          className="text-amber-500 font-semibold hover:underline"
        >
          Show member perks
        </button>
      </div>
    )
  }

  // High-converting motivational banner for guest shoppers
  return (
    <div
      className="mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-[var(--surface-card)] p-5 relative shadow-sm"
      data-testid="checkout-guest-motivational-banner"
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-3.5 right-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
        title="Dismiss notice"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Member Benefits Notice</span>
          </div>

          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Create an Account or Sign In for an Effortless Checkout
          </h3>

          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-3">
            Join thousands of SYA Store shoppers and unlock instant member perks:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>1-Click lightning checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Save Google Maps delivery locations</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Real-time SMS & WhatsApp dispatch tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Verified orders & warranty protection</span>
            </div>
          </div>
        </div>

        {/* Action Buttons & Google Sign-In */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 sm:self-start lg:self-center w-full lg:w-48">
          <LocalizedClientLink
            href="/account"
            className="w-full py-2 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Free Account</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/account"
            className="w-full py-2 px-3.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </LocalizedClientLink>

          <button
            type="button"
            onClick={() => signInWithGoogle()}
            disabled={isLoading}
            className="w-full py-2 px-3.5 rounded-lg border border-ui-border-base bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google 1-Click</span>
          </button>
        </div>
      </div>
    </div>
  )
}
