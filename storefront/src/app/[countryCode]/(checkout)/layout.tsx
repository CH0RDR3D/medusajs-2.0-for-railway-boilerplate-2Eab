import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import CheckoutErrorBoundary from "@modules/checkout/components/checkout-error-boundary"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-[var(--app-bg)] relative small:min-h-screen">
      <div className="h-16 border-b border-[var(--surface-border)] bg-[var(--surface)] backdrop-blur">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base ">
              Back to shopping cart
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase"
            data-testid="store-link"
          >
            SYA Store
          </LocalizedClientLink>
          <div className="flex-1 basis-0 flex justify-end" />
        </nav>
      </div>
      <CheckoutErrorBoundary
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-red-800 mb-2">
                Checkout Error
              </h2>
              <p className="text-red-700 mb-4">
                An unexpected error occurred. Please try refreshing the page or returning to your cart.
              </p>
              <LocalizedClientLink
                href="/cart"
                className="text-blue-600 hover:underline"
              >
                Return to Cart
              </LocalizedClientLink>
            </div>
          </div>
        }
      >
        <div className="relative" data-testid="checkout-container">{children}</div>
      </CheckoutErrorBoundary>
      <div className="py-4 w-full flex items-center justify-center">
        <MedusaCTA />
      </div>
    </div>
  )
}
