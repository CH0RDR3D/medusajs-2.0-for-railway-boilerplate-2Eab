import React from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Categories | SYA Store",
  description: "Browse our products by category.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function CategoriesPage(props: Props) {
  // Validate params to fix potential 500 error
  let params
  try {
    params = await props.params
  } catch (e) {
    return notFound()
  }

  const { countryCode } = params
  if (!countryCode) {
    return notFound()
  }

  const region = await getRegion(countryCode)
  if (!region) {
    return notFound()
  }

  // Fetch categories dynamically from backend
  const categories = await listCategories()
  if (!categories || categories.length === 0) {
    return notFound()
  }

  return (
    <div className="min-h-screen py-10" style={{ background: "var(--bg-base)" }}>
      <div className="content-container">
        
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">
            Explore Collections
          </p>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Shop by Category
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-lg">
            Browse our wide selection of products organized by category.
          </p>
        </div>

        {/* Categories Grid (matching homepage category spotlight cards layout) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="group flex flex-col rounded-2xl overflow-hidden border border-black/8 dark:border-white/8 hover:border-amber-400/30 transition-all duration-300 shadow-sm"
              style={{ background: "var(--bg-card)" }}
            >
              {/* Category thumbnail from first product */}
              <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                {cat.products?.[0]?.thumbnail ? (
                  <Image
                    src={cat.products[0].thumbnail}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title & Arrow */}
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-amber-500 transition line-clamp-1">
                  {cat.name}
                </span>
                <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </LocalizedClientLink>
          ))}
        </div>

        {/* Back to store */}
        <div className="mt-14 text-center">
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border text-sm font-semibold transition hover:border-amber-400/40 text-[var(--text-primary)]"
            style={{ borderColor: "var(--nav-border)" }}
          >
            Browse All Products →
          </LocalizedClientLink>
        </div>

      </div>
    </div>
  )
}
