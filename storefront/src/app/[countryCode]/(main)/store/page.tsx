import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: {
    q?: string
    sortBy?: SortOptions
    page?: string
    tag?: string
    category?: string
  }
  params: {
    countryCode: string
  }
}

export default async function StorePage({ searchParams, params }: Params) {
  const { q, sortBy, page, tag, category } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      query={q}
      page={page}
      tag={tag}
      category={category}
      countryCode={params.countryCode}
    />
  )
}
