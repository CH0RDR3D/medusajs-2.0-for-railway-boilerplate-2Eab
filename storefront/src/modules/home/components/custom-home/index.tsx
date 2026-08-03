"use client"

import React, { useState } from "react"
import Hero from "../hero"
import ProductGrid from "./Product-Grid"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

interface HomeLayoutProps {
  categories: HttpTypes.StoreProductCategory[]
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function CustomHomeLayout({ categories, products, region }: HomeLayoutProps) {
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

  const featuredProducts = products.filter((p) => {
    const calc = p.variants?.[0]?.calculated_price?.calculated_amount ?? 0
    const orig = p.variants?.[0]?.calculated_price?.original_amount ?? 0
    return orig <= calc
  })

  // First 4 categories for spotlight cards
  const spotlightCategories = categories.slice(0, 4)

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--bg-base)" }}>
      {/* Hero rotating banner */}
      <Hero />

      {/* ── Homepage Search & Sort Bar ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 md:-mt-14 relative z-30 mb-8">
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
            className="w-full md:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-sm font-bold rounded-xl transition shadow-md hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>Search & Sort</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>

      {/* ── Category Spotlight Cards ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {spotlightCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="group flex flex-col rounded-2xl overflow-hidden border border-black/8 dark:border-white/8 hover:border-amber-400/30 transition-all duration-300"
              style={{ background: "var(--bg-card)" }}
            >
              {/* Category thumbnail from first product */}
              <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                {cat.products?.[0]?.thumbnail ? (
                  <Image
                    src={cat.products[0].thumbnail}
                    alt={cat.name}
                    fill
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--bg-surface)" }}>
                    <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition line-clamp-1">
                  {cat.name}
                </span>
                <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Promo Banner Strip ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
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

      {/* ── Product Grids ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mt-10 space-y-8">
        {/* Deals section — emerald accent */}
        <ProductGrid
          products={dealsProducts.length ? dealsProducts : products}
          region={region}
          title="Today's Deals"
          subtitle="Handpicked discounts — updated daily"
          accentColor="emerald"
          viewAllHref={`/${countryCode}/deals`}
        />

        {/* Featured products — amber accent */}
        <ProductGrid
          products={featuredProducts.length ? featuredProducts : products}
          region={region}
          title="Editor's Picks"
          subtitle="Curated favourites from our collection"
          accentColor="amber"
          viewAllHref={`/${countryCode}/editors-pick`}
        />

        {/* All products / new arrivals — violet accent */}
        {products.length > 4 && (
          <ProductGrid
            products={products.slice(4)}
            region={region}
            title="New Arrivals"
            subtitle="Just landed in the store"
            accentColor="violet"
            viewAllHref={`/${countryCode}/store`}
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
