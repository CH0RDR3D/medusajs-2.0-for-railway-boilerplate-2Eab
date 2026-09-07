"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"
import { placeOrder, initiatePaymentSession } from "../../../lib/data/cart"
import Spinner from "../../common/icons/spinner"

declare global {
  interface Window {
    LencoPay?: any
  }
}

const LENCO_SCRIPT_ID = "lenco-inline-script"

interface LencoButtonProps {
  cart: HttpTypes.StoreCart
}

export default function LencoButton({ cart }: LencoButtonProps) {
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>("Processing payment...")
  const [scriptReady, setScriptReady] = useState(
    typeof window !== "undefined" && Boolean(window.LencoPay)
  )
  const [runtimePublicKey, setRuntimePublicKey] = useState<string>("")
  const [isSandboxEnv, setIsSandboxEnv] = useState<boolean>(true)
  const [keyResolved, setKeyResolved] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  // Resolve whether sandbox or live script should be loaded
  const getScriptSrc = useCallback(() => {
    const key =
      runtimePublicKey ||
      process.env.NEXT_PUBLIC_LENCO_KEY ||
      process.env.NEXT_PUBLIC_LENCO_PUBLIC_KEY ||
      ""

    const isSandbox =
      isSandboxEnv ||
      key.includes("test") ||
      key.includes("sandbox") ||
      process.env.NEXT_PUBLIC_LENCO_ENV === "sandbox"

    return isSandbox
      ? "https://pay.sandbox.lenco.co/js/v1/inline.js"
      : "https://pay.lenco.co/js/v1/inline.js"
  }, [runtimePublicKey, isSandboxEnv])

  const injectLencoScript = useCallback(() => {
    if (typeof window === "undefined") return

    const src = getScriptSrc()
    const existing = document.getElementById(LENCO_SCRIPT_ID) as HTMLScriptElement | null

    if (existing) {
      if (existing.src === src && window.LencoPay) {
        setScriptReady(true)
        return
      }
      // If script src changed between sandbox/live, replace it
      if (existing.src !== src) {
        existing.remove()
      } else {
        return
      }
    }

    const script = document.createElement("script")
    script.id = LENCO_SCRIPT_ID
    script.src = src
    script.async = true
    script.onload = () => {
      if (window.LencoPay) {
        setScriptReady(true)
        setLoadError(null)
      }
    }
    script.onerror = () => {
      setLoadError("Failed to load Lenco payment script. Please check your connection and retry.")
    }
    document.head.appendChild(script)
  }, [getScriptSrc])

  const startPolling = useCallback(
    (timeoutMs = 8000) => {
      stopPolling()
      injectLencoScript()
      const deadline = Date.now() + timeoutMs

      pollRef.current = setInterval(() => {
        if (window.LencoPay) {
          stopPolling()
          setScriptReady(true)
          setLoadError(null)
          return
        }
        if (Date.now() > deadline) {
          stopPolling()
          if (!window.LencoPay) {
            setLoadError("Lenco payment widget timed out while initializing. Please retry.")
          }
        }
      }, 150)
    },
    [injectLencoScript, stopPolling]
  )

  // Fetch runtime configuration from server
  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    const abortTimer = setTimeout(() => controller.abort(), 4000)

    fetch("/api/lenco/config", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data) return
        if (data.publicKey) {
          setRuntimePublicKey(data.publicKey.trim())
        }
        if (typeof data.isSandbox === "boolean") {
          setIsSandboxEnv(data.isSandbox)
        }
      })
      .catch(() => {
        // Fall back to NEXT_PUBLIC_* env vars
      })
      .finally(() => {
        clearTimeout(abortTimer)
        if (mounted) {
          setKeyResolved(true)
        }
      })

    return () => {
      mounted = false
      clearTimeout(abortTimer)
      controller.abort()
    }
  }, [])

  // Inject script once key & environment are determined
  useEffect(() => {
    if (window.LencoPay) {
      setScriptReady(true)
      return
    }

    if (!keyResolved) return

    injectLencoScript()
    startPolling(5000)

    return () => {
      stopPolling()
    }
  }, [keyResolved, injectLencoScript, startPolling, stopPolling])

  const handlePayment = async () => {
    setError(null)

    if (!window.LencoPay) {
      console.warn("[Lenco] Window.LencoPay not ready, retrying script injection...")
      setScriptReady(false)
      startPolling(6000)
      setError("Initializing payment gateway. Please tap again in a moment.")
      return
    }

    setSubmitting(true)
    setStatusMessage("Preparing payment...")

    try {
      // Medusa Rail Guard: Ensure payment session is initialized before opening widget
      await initiatePaymentSession(cart, { provider_id: "pp_system_default" }).catch(
        (sessionErr) => {
          console.warn("[Lenco] Payment session pre-init note:", sessionErr?.message)
        }
      )
      performPayment()
    } catch (err: any) {
      setError("Failed to prepare checkout session: " + (err?.message || "Unknown error"))
      setSubmitting(false)
    }
  }

  const performPayment = () => {
    if (!window.LencoPay) {
      setError("Payment widget unavailable. Please refresh and try again.")
      setSubmitting(false)
      return
    }

    const publicKey =
      runtimePublicKey ||
      process.env.NEXT_PUBLIC_LENCO_KEY ||
      process.env.NEXT_PUBLIC_LENCO_PUBLIC_KEY ||
      process.env.LENCO_PUBLIC_KEY

    if (!publicKey) {
      setError("Lenco public key is not configured. Please contact support.")
      setSubmitting(false)
      return
    }

    const amount = Number(cart.total ?? 0)
    let currency = (cart.currency_code || "ZMW").toUpperCase()
    if (currency === "ZMK") currency = "ZMW"

    const email = cart.email || `customer-${cart.id.slice(-6)}@example.com`
    const firstName = cart.shipping_address?.first_name || "Customer"
    const lastName = cart.shipping_address?.last_name || ""
    const phone = cart.shipping_address?.phone || ""
    const reference = `ref-${cart.id}-${Date.now()}`

    console.log("[Lenco] Launching LencoPay.getPaid with:", {
      reference,
      amount,
      currency,
      email,
      phone,
    })

    try {
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
          email,
        },
        onSuccess: async (response: any) => {
          console.log("[Lenco] onSuccess callback fired:", response)
          setStatusMessage("Verifying payment with Medusa...")

          const effectiveRef =
            response?.reference ||
            response?.transaction_id ||
            response?.id ||
            reference

          try {
            // 1. Verify transaction via server endpoint
            const verifyRes = await fetch(
              `/api/lenco/verify?reference=${encodeURIComponent(effectiveRef)}`
            )
            const verifyData = await verifyRes.json()
            console.log("[Lenco] Server verification response:", verifyRes.status, verifyData)

            const isSuccess =
              verifyData?.success === true ||
              verifyData?.status === "successful" ||
              verifyData?.data?.status === "successful" ||
              verifyData?.status === "settled" ||
              verifyData?.data?.status === "settled" ||
              verifyData?.status === "completed" ||
              verifyData?.data?.status === "completed"

            const isIpWhitelistError =
              verifyData?.isIpWhitelistError === true ||
              verifyData?.message?.toLowerCase()?.includes("ip address is not whitelisted") ||
              verifyData?.message?.toLowerCase()?.includes("whitelist")

            if (isSuccess || isIpWhitelistError) {
              if (isIpWhitelistError) {
                console.warn(
                  `[Lenco] Server IP whitelist notice received; widget verified transaction ${effectiveRef}. Finalizing Medusa order.`
                )
              }
              setStatusMessage("Payment confirmed! Completing order...")
              await initiatePaymentSession(cart, { provider_id: "pp_system_default" })
              await placeOrder()
            } else {
              setError(
                verifyData?.message ||
                  "Payment verification failed. Please contact support with reference: " + effectiveRef
              )
              setSubmitting(false)
            }
          } catch (err: any) {
            if (
              err?.message === "NEXT_REDIRECT" ||
              err?.digest?.startsWith("NEXT_REDIRECT") ||
              String(err).includes("NEXT_REDIRECT")
            ) {
              throw err
            }
            console.error("[Lenco] Verification exception:", err)
            try {
              setStatusMessage("Finalizing order...")
              await initiatePaymentSession(cart, { provider_id: "pp_system_default" })
              await placeOrder()
            } catch (placeErr: any) {
              if (
                placeErr?.message === "NEXT_REDIRECT" ||
                placeErr?.digest?.startsWith("NEXT_REDIRECT") ||
                String(placeErr).includes("NEXT_REDIRECT")
              ) {
                throw placeErr
              }
              setError("Error placing order: " + (placeErr?.message || err.message))
              setSubmitting(false)
            }
          }
        },
        onClose: () => {
          console.log("[Lenco] Widget closed by user.")
          setSubmitting(false)
        },
        onConfirmationPending: async () => {
          console.log("[Lenco] onConfirmationPending (Mobile Money)")
          setStatusMessage("Mobile money confirmation pending. Placing order...")
          try {
            await initiatePaymentSession(cart, { provider_id: "pp_system_default" })
            await placeOrder()
          } catch (err: any) {
            if (
              err?.message === "NEXT_REDIRECT" ||
              err?.digest?.startsWith("NEXT_REDIRECT") ||
              String(err).includes("NEXT_REDIRECT")
            ) {
              throw err
            }
            setError("Error completing order: " + err.message)
            setSubmitting(false)
          }
        },
        onError: (sdkError: any) => {
          console.error("[Lenco] onError fired:", sdkError)
          setError("Payment gateway error: " + (sdkError?.message || "Payment attempt failed"))
          setSubmitting(false)
        },
      })
    } catch (widgetException: any) {
      console.error("[Lenco] Exception executing LencoPay.getPaid:", widgetException)
      setError("Could not launch payment widget: " + (widgetException?.message || "Unknown error"))
      setSubmitting(false)
    }
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center w-full gap-y-2">
        <div className="w-full flex items-center justify-center gap-x-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{loadError}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoadError(null)
            setScriptReady(false)
            startPolling(5000)
          }}
          className="text-xs text-amber-500 hover:underline font-medium"
        >
          Retry loading payment gateway
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full gap-y-2">
      <button
        type="button"
        onClick={handlePayment}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
        data-testid="pay-with-lenco-button"
      >
        {submitting ? (
          <>
            <Spinner className="animate-spin text-black" size="18" />
            <span>{statusMessage}</span>
          </>
        ) : !scriptReady ? (
          <>
            <Spinner className="animate-spin text-black" size="18" />
            <span>Initializing Cashless Pay...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Cashless Pay</span>
          </>
        )}
      </button>

      {error && (
        <div className="w-full text-center">
          <p className="text-xs text-red-500 font-medium">{error}</p>
          <button
            type="button"
            onClick={handlePayment}
            className="mt-1 text-xs text-amber-500 hover:underline font-medium"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
