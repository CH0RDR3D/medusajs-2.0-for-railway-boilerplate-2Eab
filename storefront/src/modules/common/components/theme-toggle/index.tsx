"use client"

/**
 * ThemeToggle Component
 * Accessible sun / moon theme switcher with explicit ARIA labels,
 * aria-pressed states, and keyboard focus rings.
 */

import { useTheme } from "@modules/common/components/theme-provider"

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      role="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Activate light mode" : "Activate dark mode"}
      className="
        flex items-center justify-center w-8 h-8 rounded-full
        text-[var(--text-secondary)] hover:text-[var(--text-primary)]
        hover:bg-[var(--surface-card)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
        transition-all duration-200
      "
    >
      {isDark ? (
        /* Sun icon — click to go light */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          />
        </svg>
      ) : (
        /* Moon icon — click to go dark */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-slate-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
          />
        </svg>
      )}
    </button>
  )
}
