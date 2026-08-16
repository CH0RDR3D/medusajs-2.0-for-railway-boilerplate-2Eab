import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    tag?: string
    category?: string
    seed?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage({ searchParams, params }: Params) {
  const [{ sortBy, page, tag, category, seed }, { countryCode }] = await Promise.all([
    searchParams,
    params,
  ])

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      tag={tag}
      category={category}
      countryCode={countryCode}
      seed={seed}
    />
  )
}
