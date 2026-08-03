"use client"

/**
 * NavSearch
 * Lightweight search bar that navigates to /store?q=<query> on submit.
 * No API call on keystroke — keeps the nav server-component-friendly.
 */

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function NavSearch() {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || process.env.NEXT_PUBLIC_DEFAULT_REGION || "zm"
  const [query, setQuery] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/${countryCode}/store?q=${encodeURIComponent(q)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full relative"
      role="search"
    >
      {/* Search icon */}
      <span className="absolute left-3 pointer-events-none text-[var(--text-muted)]">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z"
          />
        </svg>
      </span>

      <input
        type="search"
        aria-label="Search products"
        placeholder="Search products…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="
          w-full pl-8 pr-3 py-1.5 text-xs rounded-lg
          bg-black/5 dark:bg-white/8
          border border-black/8 dark:border-white/10
          text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
          focus:outline-none focus:ring-1 focus:ring-amber-400/50
          transition-all duration-200
        "
      />
    </form>
  )
}
