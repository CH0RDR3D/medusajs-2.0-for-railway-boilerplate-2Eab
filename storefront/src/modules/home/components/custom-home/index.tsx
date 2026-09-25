"use client"

import React, { useState } from "react"
import Hero from "../hero"
import ProductGrid from "./Product-Grid"
import EditorsPickCarousel from "../editor-picks"
import CategoryCarousel from "../category-carousel"
import CollectionsPreview from "../collections-preview"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

interface HomeLayoutProps {
  categories: HttpTypes.StoreProductCategory[]
  collections?: HttpTypes.StoreCollection[]
  products: HttpTypes.StoreProduct[]
  editorsPickProducts: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function CustomHomeLayout({
  categories,
  collections = [],
  products,
  editorsPickProducts,
  region,
}: HomeLayoutProps) {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || process.env.NEXT_PUBLIC_DEFAULT_REGION || "zm"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSort, setSelectedSort] = useState("created_at")

  const handleSearchAndSort = (e: React.FormEvent) => {
    e.preventDefault()
    const queryParams = new URLSearchParams()
    if (searchQuery.trim()) queryParams.set("q", searchQuery.trim())
    if (selectedSort) queryParams.set("sortBy", selectedSort)

    const qs = queryParams.toString()
    router.push(`/${countryCode}/store${qs ? `?${qs}` : ""}`)
  }

  // Separate deals (discounted) from standard products
  const dealsProducts = products.filter((p) => {
    const calc = p.variants?.[0]?.calculated_price?.calculated_amount ?? 0
    const orig = p.variants?.[0]?.calculated_price?.original_amount ?? 0
    return orig > calc
  })

  // Recent products / New Arrivals sorted by newest created_at timestamp
  const recentProducts = [...products].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
    return timeB - timeA
  })

  // Health & Beauty specific showcase if available
  const cleanStr = (s?: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, "") || ""
  const healthBeautyProducts = products.filter((p) =>
    p.categories?.some((c) => {
      const cleanH = cleanStr(c.handle)
      const cleanN = cleanStr(c.name)
      return (
        cleanH.includes("health") ||
        cleanH.includes("beauty") ||
        cleanN.includes("health") ||
        cleanN.includes("beauty") ||
        cleanH.includes("wellness") ||
        cleanN.includes("wellness")
      )
    })
  )

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--bg-base)" }}>
      {/* Hero rotating banner */}
      <Hero />

      {/* ── Homepage Search & Sort Bar ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 md:-mt-14 relative z-30 mb-4">
        <form
          onSubmit={handleSearchAndSort}
          className="rounded-2xl p-4 md:p-5 border border-black/10 dark:border-white/10 shadow-xl flex flex-col md:flex-row items-center gap-3"
          style={{ background: "var(--bg-card)" }}
        >
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search products by title, category, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 text-[var(--text-primary)] bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Sort Selector */}
          <div className="w-full md:w-56">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 text-[var(--text-primary)] bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer"
            >
              <option value="created_at">Latest Arrivals</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-sm font-bold rounded-xl transition shadow-md hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Search & Sort</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>

      {/* ── Featured Collections Interactive Preview ─────────────── */}
      <CollectionsPreview
        collections={collections}
        products={products}
        region={region}
        countryCode={countryCode}
      />

      {/* ── Dynamic Category Carousel ────────────────────────────── */}
      <CategoryCarousel
        categories={categories}
        products={products}
        countryCode={countryCode}
      />



      {/* ── Promo Banner Strip ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div
          className="relative w-full rounded-2xl overflow-hidden flex items-center justify-between px-8 py-6 md:py-8"
          style={{
            background: "linear-gradient(135deg, #1a1200 0%, #2a1f00 50%, #1a1200 100%)",
            border: "1px solid rgba(251,191,36,0.2)",
          }}
        >
          <div className="relative z-10 max-w-lg">
            <p className="text-amber-400 text-xs uppercase tracking-widest font-semibold mb-2">Limited Time</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Free Pickup at Our Store
            </h3>
            <p className="text-gray-300 text-sm mb-5">
              Select "Store Pickup" during checkout — no delivery fee, ready same day.
            </p>
            <Link
              href={`/${countryCode}/store`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-sm font-bold rounded-lg transition hover:scale-105 shadow-lg shadow-amber-400/20"
            >
              Shop & Pick Up
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Decorative glow orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #fbbf24, transparent)", transform: "translate(40%, -40%)" }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #fbbf24, transparent)", transform: "translateY(40%)" }} />
        </div>
      </div>

      {/* ── Product Grids & Carousels ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mt-10 space-y-8">
        {/* Deals section — emerald accent */}
        {dealsProducts.length > 0 && (
          <ProductGrid
            products={dealsProducts.slice(0, 8)}
            region={region}
            title="Today's Deals"
            subtitle="Handpicked discounts — updated daily"
            accentColor="emerald"
            viewAllHref="/deals"
          />
        )}

        {/* Editor's Picks section — horizontal carousel */}
        {editorsPickProducts.length > 0 && (
          <EditorsPickCarousel
            products={editorsPickProducts}
            region={region}
            countryCode={countryCode}
          />
        )}

        {/* Health & Beauty Spotlight (if available) — amber accent */}
        {healthBeautyProducts.length > 0 && (
          <ProductGrid
            products={healthBeautyProducts.slice(0, 8)}
            region={region}
            title="Health & Beauty"
            subtitle="Premium skincare, wellness & beauty essentials"
            accentColor="amber"
            viewAllHref="/categories/healthandbeauty"
          />
        )}

        {/* Recent products / New arrivals — violet accent */}
        {recentProducts.length > 0 && (
          <ProductGrid
            products={recentProducts.slice(0, 8)}
            region={region}
            title="New Arrivals & Recent Products"
            subtitle="Just landed in the store across all categories"
            accentColor="violet"
            viewAllHref="/new-arrivals"
          />
        )}
      </div>

      {/* ── Footer CTA ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mt-16 text-center">
        <p className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: "var(--text-muted)" }}>Ready to explore?</p>
        <Link
          href={`/${countryCode}/store`}
          className="inline-block px-10 py-3 rounded-full border text-sm font-semibold transition hover:border-amber-400/40"
          style={{
            borderColor: "var(--nav-border)",
            color: "var(--text-primary)",
          }}
        >
          Browse Full Catalogue →
        </Link>
      </div>
    </div>
  )
}
