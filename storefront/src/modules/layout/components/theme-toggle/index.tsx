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
      <div className="w-8 h-8 rounded-full bg-[var(--surface-card)] border border-[var(--surface-border)] opacity-0" />
    )
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface-card)] border border-[var(--surface-border)] hover:opacity-80 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-500" />
      ) : (
        <Moon className="w-4 h-4 text-violet-600" />
      )}
    </button>
  )
}
