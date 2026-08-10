"use client"

import { useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import LencoButton from "../LencoButton"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PaymentButton: React.FC<PaymentButtonProps> = ({ cart }) => {
  const readyForPayment = useMemo(() => {
    const shipping = cart.shipping_address
    const hasName = Boolean(shipping?.first_name?.trim() && shipping?.last_name?.trim())
    const hasPhone = Boolean(shipping?.phone?.trim())
    const isPickup = Boolean((cart.metadata as any)?.is_pickup)
    const hasDelivery = Boolean((cart.shipping_methods?.length ?? 0) > 0)

    const email = cart.email?.trim()
    const emailValid = !email || EMAIL_REGEX.test(email)

    if (typeof window === "undefined") {
      return hasName && hasPhone && (isPickup || hasDelivery) && emailValid
    }

    const lat = Number(sessionStorage.getItem("checkout_location_lat") || (cart.metadata as any)?.lat)
    const lng = Number(sessionStorage.getItem("checkout_location_lng") || (cart.metadata as any)?.lng)
    const hasLocation = (Number.isFinite(lat) && lat !== 0) && (Number.isFinite(lng) && lng !== 0)

    const locationReady = isPickup || hasLocation

    return hasName && hasPhone && (isPickup || hasDelivery) && locationReady && emailValid
  }, [cart])

  if (!readyForPayment) {
    return (
      <div className="flex flex-col items-center w-full">
        <button
          disabled
          className="w-full flex items-center justify-center gap-x-2 px-6 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 font-semibold rounded-lg cursor-not-allowed border border-dashed border-zinc-300 dark:border-zinc-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Pay with Lenco
        </button>
        <p className="mt-2 text-xs text-zinc-500 text-center font-medium">
          Please complete your contact info and Google Maps location to pay.
        </p>
      </div>
    )
  }

  return <LencoButton cart={cart} />
}

export default PaymentButton
