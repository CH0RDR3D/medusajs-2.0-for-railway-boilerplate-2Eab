import { Metadata } from "next"

import { getDailyCuratedProductIds } from "@lib/data/products"
import PaginatedProducts from "@modules/store/templates/paginated-products"

export const metadata: Metadata = {
  title: "Editor's Pick",
  description: "Daily curated products refreshed every 24 hours.",
}

type Props = {
  params: Promise<{
    countryCode: string
  }>
}

export default async function EditorsPickPage({ params }: Props) {
  const { countryCode } = await params
  const ids = await getDailyCuratedProductIds({
    countryCode,
    kind: "editors-pick",
  })

  return (
    <div className="content-container py-8" data-testid="editors-pick-page">
      <h1 className="text-2xl-semi mb-6">Editor&apos;s Pick</h1>
      <p className="txt-small text-ui-fg-subtle mb-8">
        Curated using daily product trend scoring and refreshed every 24 hours.
      </p>
      <PaginatedProducts
        page={1}
        productsIds={ids}
        sortBy="created_at"
        countryCode={countryCode}
      />
    </div>
  )
}
