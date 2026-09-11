"use client"

import React, { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function MobileSearchToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const params = useParams()
  const countryCode =
    (params?.countryCode as string) ||
    process.env.NEXT_PUBLIC_DEFAULT_REGION ||
    "zm"

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      setIsOpen(false)
      router.push(`/${countryCode}/store?q=${encodeURIComponent(q)}`)
    }
  }

  return (
    <div className="flex small:hidden items-center">
      {/* Search trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
        aria-label="Toggle search input"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-4 h-4 text-amber-500" />
        ) : (
          <Search className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {/* Expandable search bar underneath navbar */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 w-full bg-[var(--surface-card)] border-b border-[var(--surface-border)] p-3 z-40 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSubmit} className="relative flex items-center w-full">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by title, category, tag..."
              className="w-full pl-9 pr-20 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--surface-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
