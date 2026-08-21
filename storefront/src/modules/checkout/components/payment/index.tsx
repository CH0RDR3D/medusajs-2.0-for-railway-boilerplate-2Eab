"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import ErrorMessage from "@modules/checkout/components/error-message"
import { CheckCircleSolid } from "@medusajs/icons"
import { Heading, Text, clx, Button } from "@medusajs/ui"
import PaymentButton from "@modules/checkout/components/payment-button"
import { placeOrder } from "@lib/data/cart"

import Divider from "@modules/common/components/divider"

const Payment = ({
  cart,
  availablePaymentMethods: _availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const isPickup = Boolean((cart?.metadata as any)?.is_pickup)
  const hasShippingMethod = (cart?.shipping_methods?.length ?? 0) > 0

  const paymentReady = (isPickup || hasShippingMethod) || paidByGiftcard

  const handleEdit = () => {
    router.push(pathname + "?step=payment", {
      scroll: false,
    })
  }

  const handlePlaceOrder = async () => {
    setSubmitting(true)
    setError(null)
    await placeOrder().catch((err) => {
      setError(err?.message || "Failed to place order")
      setSubmitting(false)
    })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-[var(--surface-card)]">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Review & Payment
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && (
            <div className="rounded-rounded border border-[var(--surface-border)] p-4">
              <Text className="txt-medium-plus text-ui-fg-base">Payment provider</Text>
              <Text className="txt-medium text-ui-fg-subtle mt-1" data-testid="payment-method-summary">
                Lenco Payment
              </Text>
            </div>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          {!paidByGiftcard && (
            <div className="mt-6">
              <div className="flex items-start gap-x-1 w-full mb-6">
                <div className="w-full">
                  <Text className="txt-medium text-ui-fg-subtle mb-1">
                    By clicking the pay button, you confirm that you have
                    read, understand and accept our Terms of Use, Terms of Sale and
                    Returns Policy and acknowledge that you have read SYA
                    Store&apos;s Privacy Policy.
                  </Text>
                </div>
              </div>
              <PaymentButton cart={cart} data-testid="submit-order-button" />
            </div>
          )}

          {paidByGiftcard && (
            <Button
              size="large"
              className="mt-6 w-full"
              onClick={handlePlaceOrder}
              isLoading={submitting}
              data-testid="submit-order-button"
            >
              Place Order
            </Button>
          )}
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && !paidByGiftcard ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment method
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  Lenco Payment
                </Text>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
