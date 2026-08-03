import React from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategoryByHandle } from "@lib/data/categories"
import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { ProductCard } from "@modules/home/components/custom-home/Product-Grid"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { product_categories } = await getCategoryByHandle(params.category)

  if (!product_categories?.length) {
    notFound()
  }

  const category = product_categories[product_categories.length - 1]

  return {
    title: `${category.name} | Medusa Store`,
    description: category.description || `${category.name} category`,
  }
}

export default async function CategoryPage(props: Props) {
  const params = await props.params

  const countryCode = params.countryCode
  const { product_categories } = await getCategoryByHandle(params.category)

  if (!product_categories?.length) {
    notFound()
  }

  const category = product_categories[product_categories.length - 1]
  const parents = product_categories.slice(0, product_categories.length - 1)

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Fetch products by category_id (limit 12) as requested
  const { response: { products } } = await getProductsList({
    countryCode,
    queryParams: {
      limit: 12,
      category_id: [category.id],
    },
  })

  return (
    <div className="min-h-screen py-10" style={{ background: "var(--bg-base)" }}>
      <div className="content-container">
        
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-[var(--text-secondary)]">
          <LocalizedClientLink href="/categories" className="hover:text-amber-500 transition">
            Categories
          </LocalizedClientLink>
          <span>/</span>
          {parents.map((parent) => (
            <React.Fragment key={parent.id}>
              <LocalizedClientLink
                href={`/categories/${parent.handle}`}
                className="hover:text-amber-500 transition"
              >
                {parent.name}
              </LocalizedClientLink>
              <span>/</span>
            </React.Fragment>
          ))}
          <span className="text-[var(--text-primary)] font-medium">{category.name}</span>
        </div>

        {/* Premium Styled Banner (matching homepage linear gradient aesthetic) */}
        <div
          className="relative w-full rounded-2xl overflow-hidden mb-10 py-12 px-8 md:px-12 border border-violet-500/20"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          }}
        >
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-3 py-1 bg-violet-400/90 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
              Category
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {category.name}
            </h1>
            <p className="mt-3 text-sm md:text-base text-gray-300 leading-relaxed">
              {category.description || "Explore our premium selection in this category."}
            </p>
          </div>
          {/* Decorative glow orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", transform: "translateY(40%)" }} />
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-card)] rounded-2xl border border-black/10 dark:border-white/10 text-[var(--text-muted)]">
            No products found in this category.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">
                Products in {category.name}
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
                  accentColor="violet"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
