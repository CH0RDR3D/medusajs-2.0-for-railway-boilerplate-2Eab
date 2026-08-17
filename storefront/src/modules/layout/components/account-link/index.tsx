"use client"

import { useMedusaAuth } from "@lib/hooks/use-medusa-auth"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { User } from "lucide-react"

type AccountLinkProps = { customerName?: string | null }

export default function AccountLink({ customerName }: AccountLinkProps) {
  const { session } = useMedusaAuth()
  const name = customerName || session?.user?.name || session?.user?.email

  return (
    <LocalizedClientLink
      href="/account"
      className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-md px-2 py-1"
      data-testid="nav-account-link"
      aria-label="Your Account and Orders"
    >
      <User className="w-3.5 h-3.5 text-amber-500" />
      <span>{name || "Account"}</span>
    </LocalizedClientLink>
  )
}