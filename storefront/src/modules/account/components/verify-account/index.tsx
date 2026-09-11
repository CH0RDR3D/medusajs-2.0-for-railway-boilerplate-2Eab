"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@modules/common/components/ui"
import { confirmEmailVerification } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type VerificationState = "verifying" | "success" | "error"

const VerifyAccount = () => {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")
  const [state, setState] = useState<VerificationState>("verifying")
  const confirmed = useRef(false)

  useEffect(() => {
    if (confirmed.current) {
      return
    }
    confirmed.current = true

    if (!token) {
      setState("error")
      return
    }

    confirmEmailVerification(token).then(({ success }) =>
      setState(success ? "success" : "error")
    )
  }, [token])

  return (
    <div
      className="max-w-md w-full flex flex-col items-center text-center p-8 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] shadow-md gap-y-4"
      data-testid="verify-account-page"
    >
      {state === "verifying" && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Verifying Your Email...
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Please wait while we confirm your email token and activate your account.
          </p>
        </div>
      )}

      {state === "success" && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Email Verified Successfully!
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            Your SYA Store account is now fully active. You can now sign in to start shopping, manage saved addresses, and track your orders.
          </p>
          <LocalizedClientLink href="/account" className="w-full">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <span>Continue to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </LocalizedClientLink>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Verification Link Expired or Invalid
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            This verification link is no longer valid or has already been used. Please sign in or request a new verification link.
          </p>
          <LocalizedClientLink href="/account" className="w-full">
            <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
              <span>Go to Account Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}

export default VerifyAccount

