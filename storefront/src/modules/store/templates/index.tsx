import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getProductFacets } from "@lib/data/products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  tag,
  category,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  tag?: string
  category?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const facetsPromise = getProductFacets({ countryCode })

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <Suspense fallback={null}>
        {/* @ts-ignore async server value */}
        <StoreRefinements
          sortBy={sort}
          tag={tag}
          category={category}
          facetsPromise={facetsPromise}
        />
      </Suspense>
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title">All products</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            tag={tag}
            category={category}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

async function StoreRefinements({
  sortBy,
  tag,
  category,
  facetsPromise,
}: {
  sortBy: SortOptions
  tag?: string
  category?: string
  facetsPromise: ReturnType<typeof getProductFacets>
}) {
  const facets = await facetsPromise

  return (
    <RefinementList
      sortBy={sortBy}
      activeTag={tag}
      activeCategory={category}
      tags={facets.tags}
      categories={facets.categories}
    />
  )
}

export default StoreTemplate
