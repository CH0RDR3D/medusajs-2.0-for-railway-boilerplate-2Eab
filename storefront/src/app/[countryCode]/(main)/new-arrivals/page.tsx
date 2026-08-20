import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import ProductSidebar from "@modules/store/components/ProductSidebar"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import SortDropdown from "@modules/store/components/SortDropdown"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export const metadata: Metadata = {
  title: "New Arrivals | SYA Store",
  description: "Browse our latest products and new arrivals.",
}

type Params = {
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
    category?: string
    tag?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function NewArrivalsPage({ searchParams, params }: Params) {
  const { countryCode } = await params
  const { page, sortBy, category, tag } = await searchParams

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="min-h-screen py-10" style={{ background: "var(--bg-base)" }}>
      <div className="content-container">
        
        {/* Premium Styled Banner */}
        <div
          className="relative w-full rounded-2xl overflow-hidden mb-10 py-12 px-8 md:px-12 border border-violet-500/20"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1a103c 50%, #0f172a 100%)",
          }}
        >
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-3 py-1 bg-violet-400/90 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
              Just Landed
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
              New Arrivals
            </h1>
            <p className="mt-3 text-sm md:text-base text-gray-300 leading-relaxed">
              Explore the latest additions to our store, updated in real-time.
            </p>
          </div>
          {/* Decorative glow orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", transform: "translateY(40%)" }} />
        </div>

        {/* Sidebar + Products Grid Layout */}
        <div className="flex flex-col small:flex-row gap-8 small:gap-10 items-start">
          <Suspense fallback={<div className="w-full small:w-[260px] h-96 bg-[var(--bg-card)] rounded-2xl animate-pulse" />}>
            {/* @ts-ignore async server value */}
            <ProductSidebar
              countryCode={countryCode}
              activeCategoryHandle={category}
              activeTagValue={tag}
              basePath="/new-arrivals"
            />
          </Suspense>

          <div className="w-full">
            <div className="space-y-6">
              <div className="mb-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)] md:text-xl">
                  Latest Additions
                </h2>
                <SortDropdown sortBy={sort} />
              </div>
              <Suspense fallback={<SkeletonProductGrid />}>
                <PaginatedProducts
                  page={pageNumber}
                  sortBy={sort}
                  category={category}
                  tag={tag}
                  countryCode={countryCode}
                  shuffle={false}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
