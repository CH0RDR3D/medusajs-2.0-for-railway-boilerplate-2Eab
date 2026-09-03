import { Metadata } from "next"
import { notFound } from "next/navigation"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import CheckoutErrorBoundary from "@modules/checkout/components/checkout-error-boundary"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { safeRetrieveCart, safeGetCustomer } from "@lib/data/checkout-safety"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Checkout",
}

const fetchCart = async () => {
  const cart = await safeRetrieveCart(() => retrieveCart())
  if (!cart) {
    return notFound()
  }

  if (cart?.items?.length) {
    try {
      const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
      cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
    } catch (error) {
      console.warn("[Checkout] Failed to enrich line items, continuing with basic data:", error)
      // Continue with basic cart data if enrichment fails
    }
  }

  return cart
}

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>
}) {
  const cart = await fetchCart()
  const customer = await safeGetCustomer(() => getCustomer())
  const { step } = await searchParams

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-12 py-12">
      <CheckoutErrorBoundary
        fallback={
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h3 className="text-red-800 font-semibold mb-2">Checkout Error</h3>
            <p className="text-red-700 mb-4">
              Unable to load checkout form. Please try refreshing the page or contact support.
            </p>
          </div>
        }
      >
        <Wrapper cart={cart}>
          <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-4 small:p-6">
            <CheckoutForm cart={cart} customer={customer} step={step} />
          </div>
        </Wrapper>
      </CheckoutErrorBoundary>
      <CheckoutErrorBoundary
        fallback={
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-red-700 text-sm">
              Unable to load order summary. Please refresh the page.
            </p>
          </div>
        }
      >
        <CheckoutSummary cart={cart} />
      </CheckoutErrorBoundary>
    </div>
  )
}
