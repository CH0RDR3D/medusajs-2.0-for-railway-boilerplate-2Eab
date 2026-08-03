"use client"

/**
 * theme-context.tsx
 *
 * Re-exports the ThemeContext primitives so any module can import
 * `useTheme` from a stable, single-responsibility path:
 *
 *   import { useTheme } from "@lib/context/theme-context"
 *
 * The actual provider logic lives in ThemeProvider (theme-provider/index.tsx).
 * We pull the context value from there rather than duplicating state.
 */

export { useTheme } from "@modules/common/components/theme-provider"
