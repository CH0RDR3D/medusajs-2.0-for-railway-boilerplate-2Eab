import { Heading, Text } from "@medusajs/ui"
import Link from "next/link"
import { Suspense } from "react"

import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductFacets, getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { ProductCard } from "@modules/home/components/custom-home/Product-Grid"

type SearchResultsTemplateProps = {
  query: string
  ids: string[]
  sortBy?: SortOptions
  page?: string
  tag?: string
  category?: string
  countryCode: string
}

const SearchResultsTemplate = ({
  query,
  ids,
  sortBy,
  page,
  tag,
  category,
  countryCode,
}: SearchResultsTemplateProps) => {
  const pageNumber = page ? parseInt(page) : 1
  const facetsPromise = getProductFacets({ countryCode, ids })

  return (
    <>
      <div className="flex justify-between border-b w-full py-6 px-8 small:px-14 items-center">
        <div className="flex flex-col items-start">
          <Text className="text-ui-fg-muted">Search Results for:</Text>
          <Heading>
            {decodeURI(query)} ({ids.length})
          </Heading>
        </div>
        <LocalizedClientLink
          href="/store"
          className="txt-medium text-ui-fg-subtle hover:text-ui-fg-base"
        >
          Clear
        </LocalizedClientLink>
      </div>
      <div className="flex flex-col small:flex-row small:items-start p-6">
        {ids.length > 0 ? (
          <>
            {/* @ts-ignore async server value */}
            <SearchRefinements
              sortBy={sortBy || "created_at"}
              activeTag={tag}
              activeCategory={category}
              facetsPromise={facetsPromise}
            />
            <div className="content-container">
              <PaginatedProducts
                productsIds={ids}
                sortBy={sortBy}
                tag={tag}
                category={category}
                page={pageNumber}
                countryCode={countryCode}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col w-full px-8 small:px-14">
            <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border border-black/10 dark:border-white/10 text-[var(--text-muted)] mb-10">
              <Text className="text-sm font-medium">
                No products found matching "{decodeURI(query)}". Try another search or explore our popular products below.
              </Text>
            </div>
            <div className="space-y-6">
              <Heading level="h2" className="text-lg md:text-xl font-bold text-[var(--text-primary)]">
                You might also like
              </Heading>
              <Suspense fallback={<div className="h-48 w-full bg-[var(--bg-card)] rounded-2xl animate-pulse" />}>
                {/* @ts-ignore async server value */}
                <FallbackProducts countryCode={countryCode} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

async function SearchRefinements({
  sortBy,
  activeTag,
  activeCategory,
  facetsPromise,
}: {
  sortBy: SortOptions
  activeTag?: string
  activeCategory?: string
  facetsPromise: ReturnType<typeof getProductFacets>
}) {
  const facets = await facetsPromise

  return (
    <RefinementList
      sortBy={sortBy}
      search
      activeTag={activeTag}
      activeCategory={activeCategory}
      tags={facets.tags}
      categories={facets.categories}
    />
  )
}

async function FallbackProducts({ countryCode }: { countryCode: string }) {
  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  // Fetch first 4 products dynamically as fallback
  const { response: { products } } = await getProductsList({
    countryCode,
    queryParams: { limit: 4 },
  })

  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          region={region}
          accentColor="amber"
        />
      ))}
    </div>
  )
}

export default SearchResultsTemplate
