import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import ProductSidebar from "@modules/store/components/ProductSidebar"
import SortDropdown from "@modules/store/components/SortDropdown"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  tag,
  category,
  countryCode,
  seed,
}: {
  sortBy?: SortOptions
  page?: string
  tag?: string
  category?: string
  countryCode: string
  seed?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col small:flex-row gap-8 small:gap-10 items-start py-6 content-container"
      data-testid="category-container"
    >
      <Suspense fallback={<div className="w-full small:w-[260px] h-96 bg-[var(--bg-card)] rounded-2xl animate-pulse" />}>
        {/* @ts-ignore async server value */}
        <ProductSidebar
          countryCode={countryCode}
          activeCategoryHandle={category}
          activeTagValue={tag}
        />
      </Suspense>
      <div className="w-full">
        <div className="mb-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]" data-testid="store-page-title">
            All Products
          </h1>
          <SortDropdown sortBy={sort} />
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            tag={tag}
            category={category}
            countryCode={countryCode}
            seed={seed}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
