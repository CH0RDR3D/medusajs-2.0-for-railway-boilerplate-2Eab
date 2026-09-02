import { listCartShippingMethods } from "@lib/data/fulfillment"
import { safeListShippingMethods } from "@lib/data/checkout-safety"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Shipping from "@modules/checkout/components/shipping"
import CheckoutAccountBadge from "@modules/checkout/components/checkout-account-badge"
import CheckoutErrorBoundary from "@modules/checkout/components/checkout-error-boundary"

/**
 * CheckoutForm Component
 * Renders the account status banner, address form with autofill,
 * shipping methods, and Lenco payment flow.
 * All subcomponents wrapped in error boundaries for graceful degradation.
 */
export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await safeListShippingMethods(
    () => listCartShippingMethods(cart.id)
  )

  return (
    <div>
      {/* Account & Google authentication status badge */}
      <CheckoutErrorBoundary fallback={null}>
        <CheckoutAccountBadge customer={customer} />
      </CheckoutErrorBoundary>

      <div className="w-full grid grid-cols-1 gap-y-8">
        <CheckoutErrorBoundary
          fallback={
            <div className="border border-red-200 bg-red-50 p-4 rounded-lg text-red-700 text-sm">
              Unable to load address fields. Please refresh the page.
            </div>
          }
        >
          <div>
            <Addresses cart={cart} customer={customer} />
          </div>
        </CheckoutErrorBoundary>

        <CheckoutErrorBoundary
          fallback={
            <div className="border border-red-200 bg-red-50 p-4 rounded-lg text-red-700 text-sm">
              Unable to load shipping options. Please refresh the page.
            </div>
          }
        >
          <div>
            <Shipping cart={cart} availableShippingMethods={shippingMethods} />
          </div>
        </CheckoutErrorBoundary>

        <CheckoutErrorBoundary
          fallback={
            <div className="border border-red-200 bg-red-50 p-4 rounded-lg text-red-700 text-sm">
              Unable to load payment options. Please refresh the page.
            </div>
          }
        >
          <div>
            <Payment cart={cart} availablePaymentMethods={[]} />
          </div>
        </CheckoutErrorBoundary>
      </div>
    </div>
  )
}
