import React from "react"
import dynamic from "next/dynamic"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { safeListShippingMethods } from "@lib/data/checkout-safety"
import { HttpTypes } from "@medusajs/types"
import CheckoutAccountBadge from "@modules/checkout/components/checkout-account-badge"
import CheckoutErrorBoundary from "@modules/checkout/components/checkout-error-boundary"
// Dynamically load checkout steps for runtime efficiency and modular code-splitting
const DynamicAddresses = dynamic(
  () => import("@modules/checkout/components/addresses"),
  {
    loading: () => (
      <div className="animate-pulse space-y-4 py-6">
        <div className="h-8 bg-[var(--surface-border)] rounded w-1/3" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-[var(--surface-border)] rounded-lg" />
          <div className="h-12 bg-[var(--surface-border)] rounded-lg" />
        </div>
        <div className="h-12 bg-[var(--surface-border)] rounded-lg" />
      </div>
    ),
    ssr: true,
  }
)

const DynamicShipping = dynamic(
  () => import("@modules/checkout/components/shipping"),
  {
    loading: () => (
      <div className="animate-pulse space-y-4 py-6">
        <div className="h-8 bg-[var(--surface-border)] rounded w-1/3" />
        <div className="h-48 bg-[var(--surface-border)] rounded-xl" />
      </div>
    ),
    ssr: true,
  }
)

const DynamicPayment = dynamic(
  () => import("@modules/checkout/components/payment"),
  {
    loading: () => (
      <div className="animate-pulse space-y-4 py-6">
        <div className="h-8 bg-[var(--surface-border)] rounded w-1/3" />
        <div className="h-32 bg-[var(--surface-border)] rounded-xl" />
      </div>
    ),
    ssr: true,
  }
)

/**
 * CheckoutForm Component
 * - Dynamically loads checkout steps on demand.
 * - Single-step isolation: Displays ONLY the active step's contents; hides previous steps until revisited.
 * - Displays motivational guest sign-in notices or verified member account badge.
 */
export default async function CheckoutForm({
  cart,
  customer,
  step,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  step?: string
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await safeListShippingMethods(
    () => listCartShippingMethods(cart.id)
  )

  // Resolve current active step: address -> delivery -> payment
  const hasShippingAddress = Boolean(cart?.shipping_address?.address_1)
  const isPickup = Boolean((cart?.metadata as any)?.is_pickup)
  const hasShippingMethod = (cart?.shipping_methods?.length ?? 0) > 0
  const hasDelivery = isPickup || hasShippingMethod

  let activeStep = step || "address"
  if (!step) {
    if (!hasShippingAddress) {
      activeStep = "address"
    } else if (!hasDelivery) {
      activeStep = "delivery"
    } else {
      activeStep = "payment"
    }
  }

  return (
    <div className="w-full" data-testid="checkout-form-container">
      {/* Account status & motivational checkout notice */}
      <CheckoutErrorBoundary fallback={null}>
        <CheckoutAccountBadge customer={customer} />
      </CheckoutErrorBoundary>

      {/* Dynamic Single-Step View: Isolates the current step and hides inactive steps */}
      <div className="w-full">
        {activeStep === "address" && (
          <CheckoutErrorBoundary
            fallback={
              <div className="border border-red-200 bg-red-50 p-4 rounded-lg text-red-700 text-sm">
                Unable to load address fields. Please refresh the page.
              </div>
            }
            resetKeys={[activeStep]}
          >
            <div data-testid="checkout-step-addresses">
              <DynamicAddresses cart={cart} customer={customer} />
            </div>
          </CheckoutErrorBoundary>
        )}

        {activeStep === "delivery" && (
          <CheckoutErrorBoundary
            fallback={
              <div className="border border-red-200 bg-red-50 p-4 rounded-lg text-red-700 text-sm">
                Unable to load shipping options. Please refresh the page.
              </div>
            }
            resetKeys={[activeStep]}
          >
            <div data-testid="checkout-step-delivery">
              <DynamicShipping
                cart={cart}
                availableShippingMethods={shippingMethods}
              />
            </div>
          </CheckoutErrorBoundary>
        )}

        {activeStep === "payment" && (
          <CheckoutErrorBoundary
            fallback={
              <div className="border border-red-200 bg-red-50 p-4 rounded-lg text-red-700 text-sm">
                Unable to load payment options. Please refresh the page.
              </div>
            }
            resetKeys={[activeStep]}
          >
            <div data-testid="checkout-step-payment">
              <DynamicPayment cart={cart} availablePaymentMethods={[]} />
            </div>
          </CheckoutErrorBoundary>
        )}
      </div>
    </div>
  )
}
