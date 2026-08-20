"use client"

import * as React from "react"
import { Sun, Moon } from "@medusajs/icons"
import { useTheme } from "../theme-provider"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch by waiting for mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-11 h-11 rounded-full bg-[var(--surface-card)] border border-[var(--surface-border)] opacity-0" />
    )
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      // 44px min tap target for touch accessibility, aria-pressed reflects state
      className="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--surface-card)] border border-[var(--surface-border)] hover:opacity-80 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-all duration-200"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={theme === "dark"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-500" />
      ) : (
        <Moon className="w-4 h-4 text-violet-600" />
      )}
    </button>
  )
}
