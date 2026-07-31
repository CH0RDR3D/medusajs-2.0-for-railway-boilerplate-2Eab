"use client"

import { useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"

import { placeOrder } from "@lib/data/cart"
import ErrorMessage from "../error-message"
import LencoButton from "../lenco-button"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PaymentButton: React.FC<PaymentButtonProps> = ({ cart }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const readyForPayment = useMemo(() => {
    const shipping = cart.shipping_address
    const hasName = Boolean(shipping?.first_name?.trim() && shipping?.last_name?.trim())
    const hasPhone = Boolean(shipping?.phone?.trim())
    const hasDelivery = Boolean((cart.shipping_methods?.length ?? 0) > 0)

    const email = cart.email?.trim()
    const emailValid = !email || EMAIL_REGEX.test(email)

    if (typeof window === "undefined") {
      return hasName && hasPhone && hasDelivery && emailValid
    }

    const lat = Number(sessionStorage.getItem("checkout_location_lat"))
    const lng = Number(sessionStorage.getItem("checkout_location_lng"))
    const hasLocation = Number.isFinite(lat) && Number.isFinite(lng)

    return hasName && hasPhone && hasDelivery && hasLocation && emailValid
  }, [cart])

  const handleLencoPayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    await placeOrder()
      .catch((err) => {
        setErrorMessage(err?.message || "Unable to complete Lenco payment")
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <>
      <LencoButton disabled={!readyForPayment} isLoading={submitting} onClick={handleLencoPayment} />
      <ErrorMessage error={errorMessage} data-testid="lenco-payment-error-message" />
    </>
  )
}

export default PaymentButton
