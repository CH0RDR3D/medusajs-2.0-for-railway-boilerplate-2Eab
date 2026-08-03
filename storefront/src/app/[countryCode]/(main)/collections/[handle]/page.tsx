import React from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionByHandle } from "@lib/data/collections"
import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { ProductCard } from "@modules/home/components/custom-home/Product-Grid"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return {
    title: `${collection.title} | Medusa Store`,
    description: `${collection.title} collection`,
  }
}

export default async function CollectionPage(props: Props) {
  const params = await props.params
  const { handle, countryCode } = params

  const collection = await getCollectionByHandle(handle)
  if (!collection) {
    notFound()
  }

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Fetch up to 12 products in this collection
  const { response: { products } } = await getProductsList({
    countryCode,
    queryParams: {
      limit: 12,
      collection_id: [collection.id],
    },
  })

  return (
    <div className="min-h-screen py-10" style={{ background: "var(--bg-base)" }}>
      <div className="content-container">
        
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-[var(--text-secondary)]">
          <LocalizedClientLink href="/collections" className="hover:text-amber-500 transition">
            Collections
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-medium">{collection.title}</span>
        </div>

        {/* Premium Styled Banner (matching homepage linear gradient aesthetic) */}
        <div
          className="relative w-full rounded-2xl overflow-hidden mb-10 py-12 px-8 md:px-12 border border-amber-500/20"
          style={{
            background: "linear-gradient(135deg, #181100 0%, #291e00 50%, #181100 100%)",
          }}
        >
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-3 py-1 bg-amber-400/90 text-black text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
              Collection
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {collection.title}
            </h1>
            <p className="mt-3 text-sm md:text-base text-gray-300 leading-relaxed">
              Explore our curated {collection.title} collection, filled with products handpicked for quality and style.
            </p>
          </div>
          {/* Decorative glow orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #fbbf24, transparent)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #fbbf24, transparent)", transform: "translateY(40%)" }} />
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-card)] rounded-2xl border border-black/10 dark:border-white/10 text-[var(--text-muted)]">
            No products found in this collection.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">
                Products in {collection.title}
              </h2>
              <span className="text-xs text-[var(--text-muted)]">
                Showing {products.length} products
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  region={region}
                  accentColor="amber"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
