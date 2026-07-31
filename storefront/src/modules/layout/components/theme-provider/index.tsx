"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light")

  // Initialize theme from localStorage on client side mount
  React.useEffect(() => {
    const saved = localStorage.getItem("shadystore-theme") as Theme | null
    if (saved) {
      setThemeState(saved)
    }
  }, [])

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("shadystore-theme", newTheme)
  }, [])

  React.useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const updateTheme = () => {
      const systemTheme = mediaQuery.matches ? "dark" : "light"
      const activeTheme = theme === "system" ? systemTheme : theme

      root.classList.remove("light", "dark")
      root.classList.add(activeTheme)
      root.setAttribute("data-mode", activeTheme)
      setResolvedTheme(activeTheme)
    }

    updateTheme()

    if (theme === "system") {
      mediaQuery.addEventListener("change", updateTheme)
      return () => mediaQuery.removeEventListener("change", updateTheme)
    }
  }, [theme])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, setTheme, resolvedTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
