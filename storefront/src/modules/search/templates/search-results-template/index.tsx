import { Heading, Text } from "@medusajs/ui"
import Link from "next/link"

import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductFacets } from "@lib/data/products"

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
          <Text className="ml-8 small:ml-14 mt-3">No results.</Text>
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

export default SearchResultsTemplate
