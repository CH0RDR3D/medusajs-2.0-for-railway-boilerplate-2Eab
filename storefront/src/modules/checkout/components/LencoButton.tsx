"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"
import { placeOrder } from "../../../lib/data/cart"
import Spinner from "../../common/icons/spinner"

declare global {
  interface Window {
    LencoPay?: any
  }
}

// The Lenco sandbox inline script URL — verified live and returns valid JS.
// It exposes window.LencoPay = { getPaid: fn } synchronously when executed.
const LENCO_SCRIPT_SRC = "https://pay.sandbox.lenco.co/js/v1/inline.js"
const LENCO_SCRIPT_ID = "lenco-inline-script"

/**
 * The Lenco SDK keeps an internal singleton (n.instance) that is never cleared
 * between calls unless the widget is cleanly closed. If getPaid() is called a
 * second time while n.instance is still set, the SDK silently ignores the call.
 *
 * resetLencoPay() forces a fresh instance by:
 *  1. Removing the existing script tag so the module re-executes on next load.
 *  2. Deleting window.LencoPay so our polling logic re-initialises the ref.
 */
function resetLencoPay() {
  const existing = document.getElementById(LENCO_SCRIPT_ID)
  if (existing) existing.remove()
  // Also clear any matching src-based script (injected by Next.js <Script>)
  const byUrl = document.querySelector(`script[src="${LENCO_SCRIPT_SRC}"]`)
  if (byUrl) byUrl.remove()
  // @ts-ignore — intentionally clearing the singleton
  window.LencoPay = undefined
  console.log("[Lenco] Payment widget singleton reset.")
}

export default function LencoButton({ cart }: { cart: HttpTypes.StoreCart }) {
  const [submitting, setSubmitting] = useState(false)
  const [scriptReady, setScriptReady] = useState(
    // Check synchronously on first render — handles hot-reload / already-loaded case
    typeof window !== "undefined" && !!window.LencoPay
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const injectLencoScript = useCallback(() => {
    const existing =
      document.getElementById(LENCO_SCRIPT_ID) ||
      document.querySelector(`script[src="${LENCO_SCRIPT_SRC}"]`)

    if (existing) {
      return
    }

    const script = document.createElement("script")
    script.id = LENCO_SCRIPT_ID
    script.src = LENCO_SCRIPT_SRC
    script.async = true
    script.onload = () => {
      if (window.LencoPay) {
        setScriptReady(true)
      }
    }
    script.onerror = () => {
      setLoadError(
        "Failed to load Lenco payment script. Check your network connection and try refreshing."
      )
    }
    document.head.appendChild(script)
  }, [])

  const startPolling = useCallback((timeoutMs = 8000) => {
    stopPolling()
    injectLencoScript()
    const deadline = Date.now() + timeoutMs

    pollRef.current = setInterval(() => {
      if (window.LencoPay) {
        stopPolling()
        setScriptReady(true)
        return
      }
      if (Date.now() > deadline) {
        stopPolling()
        setLoadError(
          "Lenco payment widget failed to initialize. Please refresh the page and try again."
        )
      }
    }, 150)
  }, [injectLencoScript, stopPolling])

  useEffect(() => {
    // Already ready — nothing to do
    if (window.LencoPay) {
      console.log("[Lenco] window.LencoPay already present — skipping script injection.")
      setScriptReady(true)
      return
    }

    // Check if script tag already exists in DOM (injected by checkout/page.tsx <Script>)
    const existing =
      document.getElementById(LENCO_SCRIPT_ID) ||
      document.querySelector(`script[src="${LENCO_SCRIPT_SRC}"]`)

    if (existing) {
      // Script tag exists — start polling for window.LencoPay to appear
      console.log("[Lenco] Script tag already in DOM — polling for window.LencoPay...")
      startPolling(8000)
      return
    }

    // Script not yet in DOM — inject it ourselves
    console.log("[Lenco] Injecting inline script:", LENCO_SCRIPT_SRC)
    injectLencoScript()
    startPolling(3000)

    return () => {
      stopPolling()
    }
  }, [injectLencoScript, startPolling, stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const handlePayment = () => {
    if (!window.LencoPay) {
      console.error("[Lenco] handlePayment called but window.LencoPay is not ready.")
      setError("Initializing payment widget. Please tap again in a moment.")
      setScriptReady(false)
      setLoadError(null)
      startPolling(8000)
      return
    }

    setSubmitting(true)
    setError(null)

    const amount = (cart.total || 0) / 100
    const currency = (cart.currency_code || "ZMW").toUpperCase()
    const email = cart.email || `guest-${cart.id}@example.com`
    const firstName = cart.shipping_address?.first_name || ""
    const lastName = cart.shipping_address?.last_name || ""
    const phone = cart.shipping_address?.phone || ""
    const publicKey =
      process.env.NEXT_PUBLIC_LENCO_KEY || process.env.NEXT_PUBLIC_LENCO_PUBLIC_KEY

    if (!publicKey) {
      console.error("[Lenco] NEXT_PUBLIC_LENCO_KEY is not set.")
      setError("Lenco public key is not configured. Contact support.")
      setSubmitting(false)
      return
    }

    const reference = `ref-${cart.id}-${Date.now()}`
    console.log("[Lenco] Calling getPaid with:", { reference, amount, currency, email })

    window.LencoPay.getPaid({
      key: publicKey,
      reference,
      email,
      amount,
      currency,
      channels: ["card", "mobile-money"],
      customer: {
        firstName,
        lastName,
        phone,
      },
      onSuccess: async (response: any) => {
        console.log("[Lenco] onSuccess fired. Response:", response)
        try {
          const verifyRes = await fetch(
            `/api/lenco/verify?reference=${response.reference}`
          )
          const verifyData = await verifyRes.json()
          console.log("[Lenco] Verify result:", verifyRes.status, verifyData)

          const isSuccess =
            verifyRes.ok &&
            (verifyData.status === "successful" ||
              verifyData.data?.status === "successful" ||
              verifyData.status === "settled" ||
              verifyData.data?.status === "settled")

          if (isSuccess) {
            console.log("[Lenco] Payment verified successfully — placing order.")
            // Reset singleton before navigating away so future visits start fresh
            resetLencoPay()
            await placeOrder()
          } else {
            console.error("[Lenco] Verification did not return a successful status.", verifyData)
            setError(
              "Payment verification failed. Please try again or contact support."
            )
            setSubmitting(false)
            // Reset so user can retry
            resetLencoPay()
            setScriptReady(false)
            startPolling(5000)
          }
        } catch (err: any) {
          console.error("[Lenco] Error during verification fetch:", err)
          setError("Error verifying payment: " + err.message)
          setSubmitting(false)
          resetLencoPay()
          setScriptReady(false)
          startPolling(5000)
        }
      },
      onClose: () => {
        console.log("[Lenco] Widget closed by user.")
        setSubmitting(false)
        // IMPORTANT: Reset the singleton so the next click opens a fresh widget.
        // Without this, getPaid() is silently ignored on the second call because
        // the SDK's internal n.instance guard blocks re-entry.
        resetLencoPay()
        setScriptReady(false)
        startPolling(5000)
      },
      onConfirmationPending: () => {
        console.log("[Lenco] onConfirmationPending — placing order optimistically for mobile money.")
        // Mobile money payments may be pending — place order optimistically,
        // the webhook will update the status server-side
        placeOrder().catch((err: any) => {
          console.error("[Lenco] placeOrder failed after confirmation pending:", err)
          setError(err.message)
          setSubmitting(false)
        })
      },
    })
  }

  // Show load error if script failed entirely
  if (loadError) {
    return (
      <div className="flex flex-col items-center w-full gap-y-2">
        <div className="w-full flex items-center justify-center gap-x-2 px-6 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {loadError}
        </div>
        <button
          onClick={() => {
            setLoadError(null)
            setScriptReady(false)
            resetLencoPay()
            startPolling(5000)
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          Retry loading
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={handlePayment}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Spinner className="animate-spin" size="18" />
            Processing payment...
          </>
        ) : !scriptReady ? (
          <>
            <Spinner className="animate-spin" size="18" />
            Initializing payment...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Cashless Pay
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}
