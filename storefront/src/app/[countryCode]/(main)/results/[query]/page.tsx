import { Metadata } from "next"

import SearchResultsTemplate from "@modules/search/templates/search-results-template"

import { search } from "@modules/search/actions"
import { searchCollectionProductIds } from "@lib/data/collections"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const metadata: Metadata = {
  title: "Search",
  description: "Explore all of our products.",
}

type Params = {
  params: Promise<{ query: string; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    tag?: string
    category?: string
  }>
}

export default async function SearchResults({ params, searchParams }: Params) {
  const [{ query, countryCode }, { sortBy, page, tag, category }] = await Promise.all([
    params,
    searchParams,
  ])

  const [hits, collectionProductIds] = await Promise.all([
    search(query),
    searchCollectionProductIds(query).catch(() => []),
  ])

  const ids = [...hits.map((h) => h.objectID || h.id), ...collectionProductIds]
    .filter((id): id is string => {
      return typeof id === "string"
    })
    .filter((id, index, allIds) => allIds.indexOf(id) === index)

  return (
    <SearchResultsTemplate
      query={query}
      ids={ids}
      sortBy={sortBy}
      page={page}
      tag={tag}
      category={category}
      countryCode={countryCode}
    />
  )
}
