"use client"

import { useState, useActionState } from "react"
import { Mail, CheckCircle2, RefreshCw } from "lucide-react"

import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup, resendVerificationEmail } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const initialState = null

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, initialState)
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  const handleResend = async (email: string) => {
    setResending(true)
    setResendStatus(null)
    const res = await resendVerificationEmail(email)
    setResending(false)
    if (res.success) {
      setResendStatus("A new verification email has been sent!")
    } else {
      setResendStatus(res.error || "Failed to resend. Please try again.")
    }
  }

  if (message?.state === "verification_required") {
    return (
      <div
        className="max-w-md w-full flex flex-col items-center text-center p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-sm"
        data-testid="register-verification-card"
      >
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          Verify Your Email Address
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          We&apos;ve sent a verification link to{" "}
          <strong className="text-[var(--text-primary)]">{message.email}</strong>.
          Please click the link in your email to activate your SYA Store account and prevent unauthorized registrations.
        </p>

        {resendStatus && (
          <div className="mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{resendStatus}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <button
            type="button"
            onClick={() => handleResend(message.email)}
            disabled={resending}
            className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            <span>{resending ? "Resending..." : "Resend Link"}</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="flex-1 py-2.5 px-4 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  const errorMessage = message?.state === "error" ? message.error : null

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Become a SYA Store Member
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Create your SYA Store Member profile, and get access to an enhanced
        shopping experience.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={errorMessage} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          By creating an account, you agree to SYA Store&apos;s{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Join
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register

