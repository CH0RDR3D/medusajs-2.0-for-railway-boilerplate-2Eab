"use client"

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@modules/home/components/custom-home/Product-Grid"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface DealsTemplateProps {
  dealsProducts: HttpTypes.StoreProduct[]
  allProducts: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  todayDate: string
}


export default function DealsTemplate({
  dealsProducts,
  allProducts,
  region,
  todayDate,
}: DealsTemplateProps) {
  const [trendingProducts, setTrendingProducts] = useState<HttpTypes.StoreProduct[]>([])

  useEffect(() => {
    try {
      const storedClicks = localStorage.getItem("shadystore-product-clicks")
      const clicks = storedClicks ? JSON.parse(storedClicks) : {}

      // Sort all candidate products by clicks
      const sorted = [...allProducts]
        .filter((p) => clicks[p.id!] > 0) // Only show items that have been clicked
        .sort((a, b) => (clicks[b.id!] || 0) - (clicks[a.id!] || 0))

      if (sorted.length > 0) {
        setTrendingProducts(sorted.slice(0, 8))
      } else {
        // Fallback: show standard products (not discounted)
        const standard = allProducts.filter((p) => {
          const calc = p.variants?.[0]?.calculated_price?.calculated_amount ?? 0
          const orig = p.variants?.[0]?.calculated_price?.original_amount ?? 0
          return orig <= calc
        })
        setTrendingProducts(standard.slice(0, 8))
      }
    } catch (e) {
      console.error("Failed to load product clicks", e)
      // Fallback
      setTrendingProducts(allProducts.slice(0, 8))
    }
  }, [allProducts])

  return (
    <div className="min-h-screen py-10" style={{ background: "var(--bg-base)" }}>
      <div className="content-container space-y-12">

        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Refreshes Daily — {todayDate}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-3">
            Today&apos;s Best Deals
          </h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)]">
            Handpicked special prices and discounts available today. Check back every 24 hours for fresh daily offers.
          </p>
        </div>

        {/* Section 1: Today's Deals (emerald accent) */}
        <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 p-6 space-y-6" style={{ background: "var(--bg-card)" }}>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">Today&apos;s Handpicked Deals</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Top price-cuts and promotions for today</p>
          </div>
          <div className="h-px bg-black/10 dark:bg-white/10" />

          {dealsProducts.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-10">No deals active today. Check back later!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dealsProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  region={region}
                  accentColor="emerald"
                />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Trending / Most Clicked Products (violet accent) */}
        {trendingProducts.length > 0 && (
          <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 p-6 space-y-6" style={{ background: "var(--bg-card)" }}>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">Trending Now</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Most viewed and clicked products in the store</p>
            </div>
            <div className="h-px bg-black/10 dark:bg-white/10" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trendingProducts.map((product) => (
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

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <LocalizedClientLink
            href="/store"
            className="inline-block px-8 py-3 rounded-full border text-sm font-semibold transition hover:border-amber-400 text-[var(--text-primary)]"
            style={{ borderColor: "var(--nav-border)" }}
          >
            Browse All Products →
          </LocalizedClientLink>
        </div>

      </div>
    </div>
  )
}
