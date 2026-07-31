import { Metadata } from "next"

import { getDailyCuratedProductIds } from "@lib/data/products"
import PaginatedProducts from "@modules/store/templates/paginated-products"

export const metadata: Metadata = {
  title: "Today's Deals",
  description: "Discounted products curated daily.",
}

type Props = {
  params: {
    countryCode: string
  }
}

export default async function TodaysDealsPage({ params }: Props) {
  const ids = await getDailyCuratedProductIds({
    countryCode: params.countryCode,
    kind: "todays-deals",
  })

  return (
    <div className="content-container py-8" data-testid="todays-deals-page">
      <h1 className="text-2xl-semi mb-6">Today&apos;s Deals</h1>
      <p className="txt-small text-ui-fg-subtle mb-8">
        Deals are refreshed every 24 hours based on daily trending products.
      </p>
      <PaginatedProducts
        page={1}
        productsIds={ids}
        sortBy="price_asc"
        countryCode={params.countryCode}
      />
    </div>
  )
}
