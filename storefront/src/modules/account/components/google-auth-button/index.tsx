"use client"

import { useMedusaAuth } from "@lib/hooks/use-medusa-auth"

type GoogleAuthButtonProps = {
  className?: string
  compact?: boolean
  label?: string
}

export default function GoogleAuthButton({
  className = "",
  compact = false,
  label = "Continue with Google",
}: GoogleAuthButtonProps) {
  const { signInWithGoogle, isLoading } = useMedusaAuth()

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={isLoading}
      aria-label={label}
      className={`w-full ${compact ? "py-2 px-3" : "py-2.5 px-4"} rounded-xl border border-[var(--nav-border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-semibold shadow-sm transition hover:bg-[var(--bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`.trim()}
    >
      <span className="flex items-center justify-center gap-3">
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-[var(--text-secondary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.005 10.05.005 12s.455 3.8 1.265 5.42l4.01-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span>{isLoading ? "Signing in..." : label}</span>
      </span>
    </button>
  )
}
