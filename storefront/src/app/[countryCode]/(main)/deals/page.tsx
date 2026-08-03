import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getDailyDealsProducts } from "@lib/util/curated-products"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const revalidate = 0

export const metadata: Metadata = {
  title: "Today's Deals - Daily Discounts & Offers",
  description: "Exclusive daily deals and promotional prices, updated every 24 hours.",
}

type Params = {
  params: Promise<{
    countryCode: string
  }>
}

export default async function DealsPage(props: Params) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  if (!region) return null

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit: 100 },
  })

  const dealsProducts = getDailyDealsProducts(products, 12)
  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div
      className="min-h-screen py-10"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="content-container">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Refreshes Daily — {todayDate}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-3">
            Today's Best Deals
          </h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)]">
            Handpicked special prices and discounts available today. Check back every 24 hours for fresh daily offers.
          </p>
        </div>

        {/* Product Grid */}
        <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-4 md:gap-6">
          {dealsProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <LocalizedClientLink
            href="/store"
            className="inline-block px-8 py-3 rounded-full border text-sm font-semibold transition hover:border-emerald-400 text-[var(--text-primary)]"
            style={{ borderColor: "var(--nav-border)" }}
          >
            Browse All Products →
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
