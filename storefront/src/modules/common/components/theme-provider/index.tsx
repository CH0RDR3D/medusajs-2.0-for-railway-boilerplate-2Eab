"use client"

/**
 * ThemeProvider
 * - On mount: reads localStorage("theme") or prefers-color-scheme
 * - Applies/removes <html class="dark"> and sets data-theme attribute
 * - Exposes { theme, toggle } via context so any child can call useTheme()
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"

type Theme = "light" | "dark"

interface ThemeCtx {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<Theme>("dark")

  // Apply theme class + attribute to <html> root
  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement
    if (t === "dark") {
      root.classList.add("dark")
      root.setAttribute("data-theme", "dark")
    } else {
      root.classList.remove("dark")
      root.setAttribute("data-theme", "light")
    }
  }, [])

  // Initialise from storage or system preference on first mount, and attach listener
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const applyInitialTheme = () => {
      const stored = localStorage.getItem("theme") as Theme | null
      const system: Theme = mediaQuery.matches ? "dark" : "light"
      const initial = stored ?? system
      setTheme(initial)
      applyTheme(initial)
    }

    applyInitialTheme()

    // Listener for system preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if the user hasn't explicitly set a preference
      if (!localStorage.getItem("theme")) {
        const newTheme: Theme = e.matches ? "dark" : "light"
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [applyTheme])

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark"
      localStorage.setItem("theme", next)
      applyTheme(next)
      return next
    })
  }, [applyTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
