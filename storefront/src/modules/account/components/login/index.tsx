"use client"

import { useActionState } from "react"

import { useMedusaAuth } from "@lib/hooks/use-medusa-auth"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import GoogleAutoSignIn from "../google-auto-signin"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { login } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const initialState = null

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, initialState)
  const { isLoading, signInWithGoogle } = useMedusaAuth()

  const errorMessage =
    message?.state === "error"
      ? message.error
      : message?.state === "verification_required"
        ? `Check ${message.email} for your verification link, then sign in again.`
        : null

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <GoogleAutoSignIn />
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Or sign in with email and password below.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={errorMessage} data-testid="login-error-message" />
        <div className="mt-6 grid grid-cols-1 gap-3 small:grid-cols-2">
          <SubmitButton data-testid="sign-in-button" className="w-full">
            Sign in
          </SubmitButton>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-rounded border border-ui-border-base bg-ui-bg-base px-4 py-3 text-sm font-medium text-ui-fg-base transition hover:bg-ui-bg-subtle disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="google-sign-in-button"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.9 2.4 2.8 6.6 2.8 11.9s4.1 9.5 9.2 9.5c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1.1-.1-1.5H12Z"
              />
              <path
                fill="#34A853"
                d="M2.8 7.4l3.2 2.3c.9-2.7 3.2-4.6 6-4.6 1.8 0 3.1.8 3.8 1.4l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 8.1 2.4 4.8 4.6 2.8 7.4Z"
              />
              <path
                fill="#FBBC05"
                d="M12 21.4c2.5 0 4.7-.8 6.2-2.3l-2.9-2.4c-.8.6-1.9 1.1-3.3 1.1-3.9 0-5.1-2.6-5.4-3.8l-3.2 2.5c2 3.9 5.3 4.9 8.6 4.9Z"
              />
              <path
                fill="#4285F4"
                d="M2.8 16.5l3.2-2.5c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L2.8 7.4C2 8.9 1.6 10.4 1.6 12s.4 3.1 1.2 4.5Z"
              />
            </svg>
            {isLoading ? "Connecting..." : "Google"}
          </button>
        </div>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default Login
