"use client"

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"

interface CollectionsPreviewProps {
  collections?: HttpTypes.StoreCollection[]
  products?: HttpTypes.StoreProduct[]
  region?: HttpTypes.StoreRegion
  countryCode?: string
}

interface CollectionItemDisplay {
  id: string
  title: string
  handle: string
  description?: string
  badgeText: string
  accentColor: "amber" | "emerald" | "cyan" | "violet"
  products: HttpTypes.StoreProduct[]
}

const AUTOSLIDE_INTERVAL_MS = 6500 // 6.5 seconds per collection
const MANUAL_PAUSE_MS = 10000 // 10s pause after user manually picks a tab

const COLLECTIONS_CSS = `
@keyframes cp-pulse-slow {
  0%, 100% { opacity: 0.12; transform: scale(1); }
  50%      { opacity: 0.22; transform: scale(1.08); }
}
@keyframes cp-shine {
  from { transform: translateX(-120%) skewX(-20deg); }
  to   { transform: translateX(250%) skewX(-20deg); }
}
@keyframes cp-fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.cp-pulse-1 { animation: cp-pulse-slow 8s ease-in-out infinite; }
.cp-pulse-2 { animation: cp-pulse-slow 10s ease-in-out infinite 2s; }
.cp-card:hover .cp-shine { animation: cp-shine 0.85s ease; }
.cp-fade-in { animation: cp-fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@media (prefers-reduced-motion: reduce) {
  .cp-pulse-1, .cp-pulse-2, .cp-fade-in { animation: none; }
  .cp-card:hover .cp-shine { animation: none; }
}
`

export default function CollectionsPreview({
  collections = [],
  products = [],
  region,
  countryCode = "zm",
}: CollectionsPreviewProps) {
  // Build rich collection list with products mapped to each
  const displayCollections: CollectionItemDisplay[] = useMemo(() => {
    const list: CollectionItemDisplay[] = []

    const colorAccents: Array<"amber" | "emerald" | "cyan" | "violet"> = [
      "amber",
      "cyan",
      "violet",
      "emerald",
    ]

    if (collections && collections.length > 0) {
      collections.forEach((col, idx) => {
        // Find products belonging to this collection
        const colProducts = products.filter(
          (p) =>
            p.collection_id === col.id ||
            p.collection?.handle === col.handle ||
            col.products?.some((cp) => cp.id === p.id)
        )

        const finalProducts = colProducts.length > 0 ? colProducts : products.slice(idx * 4, idx * 4 + 6)

        if (finalProducts.length > 0) {
          list.push({
            id: col.id,
            title: col.title,
            handle: col.handle,
            description:
              (col as any).metadata?.description ||
              `Discover exclusive handpicked pieces in our ${col.title} collection, ready for same-day delivery across Lusaka.`,
            badgeText: idx === 0 ? "Featured Drop" : idx === 1 ? "Trending Hub" : "Curated Collection",
            accentColor: colorAccents[idx % colorAccents.length],
            products: finalProducts,
          })
        }
      })
    }

    // Fallback smart collections if none configured
    if (list.length < 2 && products.length > 0) {
      list.push({
        id: "smart-trending",
        title: "Trending Essentials",
        handle: "trending-essentials",
        description: "The most wanted lifestyle, electronics, and daily essentials trending in Lusaka today.",
        badgeText: "Most Popular",
        accentColor: "amber",
        products: products.slice(0, 6),
      })

      if (products.length > 4) {
        list.push({
          id: "smart-arrivals",
          title: "New Season Arrivals",
          handle: "new-arrivals",
          description: "Fresh arrivals and newly listed products curated for your daily lifestyle.",
          badgeText: "Just Landed",
          accentColor: "cyan",
          products: products.slice(4, 10),
        })
      }

      const dealItems = products.filter((p) => {
        const calc = p.variants?.[0]?.calculated_price?.calculated_amount ?? 0
        const orig = p.variants?.[0]?.calculated_price?.original_amount ?? 0
        return orig > calc
      })
      if (dealItems.length > 0) {
        list.push({
          id: "smart-deals",
          title: "Hot Value Deals",
          handle: "deals",
          description: "Unbeatable discounts and promotional prices with instant checkout.",
          badgeText: "Special Offers",
          accentColor: "emerald",
          products: dealItems.slice(0, 6),
        })
      }
    }

    return list
  }, [collections, products])

  const [activeIdx, setActiveIdx] = useState(0)
  const [isPausedByUser, setIsPausedByUser] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [manualPauseUntil, setManualPauseUntil] = useState(0)
  const [progress, setProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const numCollections = displayCollections.length
  const activeCollection = displayCollections[activeIdx % Math.max(1, numCollections)] || displayCollections[0]

  // Manual tab selection
  const handleSelectCollection = useCallback((idx: number) => {
    setActiveIdx(idx)
    setProgress(0)
    setManualPauseUntil(Date.now() + MANUAL_PAUSE_MS)
  }, [])

  // Auto-slide tick engine
  useEffect(() => {
    if (numCollections <= 1) return

    // Respect reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsPausedByUser(true)
      return
    }

    const intervalStep = 50 // ms per tick for smooth progress bar
    const totalTicks = AUTOSLIDE_INTERVAL_MS / intervalStep

    const timer = setInterval(() => {
      const now = Date.now()
      const isInteracting = isHovered || isPausedByUser || now < manualPauseUntil

      if (!isInteracting) {
        setProgress((prev) => {
          const next = prev + 1 / totalTicks
          if (next >= 1) {
            setActiveIdx((current) => (current + 1) % numCollections)
            return 0
          }
          return next
        })
      }
    }, intervalStep)

    return () => clearInterval(timer)
  }, [numCollections, isHovered, isPausedByUser, manualPauseUntil])

  if (!activeCollection || displayCollections.length === 0) {
    return null
  }

  // Format price helper
  const getProductDisplayPrice = (product: HttpTypes.StoreProduct) => {
    const calcAmount = product.variants?.[0]?.calculated_price?.calculated_amount
    const origAmount = product.variants?.[0]?.calculated_price?.original_amount
    const currCode =
      product.variants?.[0]?.calculated_price?.currency_code ||
      region?.currency_code ||
      "zmw"

    const formattedCalc = calcAmount != null
      ? convertToLocale({ amount: calcAmount, currency_code: currCode })
      : null

    const formattedOrig = origAmount != null && origAmount > (calcAmount ?? 0)
      ? convertToLocale({ amount: origAmount, currency_code: currCode })
      : null

    const percentDiscount =
      calcAmount != null && origAmount != null && origAmount > calcAmount
        ? Math.round(((origAmount - calcAmount) / origAmount) * 100)
        : null

    return {
      price: formattedCalc,
      originalPrice: formattedOrig,
      discount: percentDiscount,
    }
  }

  return (
    <section
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="max-w-7xl mx-auto px-4 my-10 relative z-20"
      aria-label="Collections Showcase"
    >
      <style>{COLLECTIONS_CSS}</style>

      <div
        className="rounded-3xl p-6 md:p-8 lg:p-10 border border-black/10 dark:border-white/10 shadow-xl relative overflow-hidden"
        style={{ background: "var(--bg-card)" }}
      >
        {/* Ambient Decorative Background Glows */}
        <div
          className="cp-pulse-1 absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
        />
        <div
          className="cp-pulse-2 absolute -bottom-36 -left-36 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
        />

        {/* ── Section Header & Interactive Collection Switcher Tabs ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-amber-400" />
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400">
                Curated Selections
              </p>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Featured Collections
            </h2>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">
              Auto-cycling through our freshest curated edits • Hover to pause and explore
            </p>
          </div>

          {/* Collection Tab Switcher & Play/Pause Button */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none max-w-full">
            {displayCollections.map((col, idx) => {
              const isActive = idx === activeIdx
              return (
                <button
                  key={col.id}
                  onClick={() => handleSelectCollection(idx)}
                  className={`relative overflow-hidden px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-amber-400 text-black shadow-lg shadow-amber-400/25 scale-105"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10"
                  }`}
                >
                  {/* Subtle active progress bar fill at bottom of active pill */}
                  {isActive && !isPausedByUser && !isHovered && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-[3px] bg-black/35 transition-all duration-75 origin-left"
                      style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
                    />
                  )}

                  <span className="relative z-10">{col.title}</span>
                  <span
                    className={`relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isActive ? "bg-black/15 text-black" : "bg-black/10 dark:bg-white/10 text-[var(--text-muted)]"
                    }`}
                  >
                    {col.products.length}
                  </span>
                </button>
              )
            })}

            {/* Play/Pause Auto-slide Toggle */}
            {numCollections > 1 && (
              <button
                type="button"
                onClick={() => setIsPausedByUser((prev) => !prev)}
                aria-label={isPausedByUser ? "Resume auto-slide" : "Pause auto-slide"}
                title={isPausedByUser ? "Resume auto-slide" : "Pause auto-slide"}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-black/15 dark:border-white/15 bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-amber-400 hover:text-amber-400 transition cursor-pointer flex-shrink-0"
              >
                {isPausedByUser ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Split Interactive Hero Layout with Smooth Crossfade Animation ── */}
        <div
          key={activeCollection.id}
          className="cp-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10 items-stretch"
        >
          {/* Left: Featured Collection Banner Card (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-amber-400/30 shadow-lg bg-gradient-to-br from-black/90 via-[#1f1708] to-black text-white group">
            {/* Ambient inner glow orb */}
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-35 pointer-events-none group-hover:scale-125 transition-transform duration-700"
              style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
            />

            {/* Collection Metadata */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{activeCollection.badgeText}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                {activeCollection.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed line-clamp-3">
                {activeCollection.description}
              </p>

              {/* Highlights badge list */}
              <div className="flex flex-wrap gap-2 mt-5">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 text-white/90 backdrop-blur-xs flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{activeCollection.products.length} Products Curated</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 text-white/90 backdrop-blur-xs flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Instant Yango Delivery</span>
                </span>
              </div>
            </div>

            {/* Floating Mini Product Thumbnails Strip */}
            <div className="relative z-10 my-6 pt-4 border-t border-white/10">
              <p className="text-[11px] font-semibold text-gray-400 mb-3">Collection Snapshot:</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {activeCollection.products.slice(0, 4).map((item) => {
                  const thumb = item.thumbnail || item.images?.[0]?.url
                  return (
                    <Link
                      key={item.id}
                      href={`/${countryCode}/products/${item.handle}`}
                      className="relative w-12 h-12 rounded-xl bg-white/10 border border-white/15 overflow-hidden flex-shrink-0 hover:scale-110 hover:border-amber-400 transition-all duration-200"
                    >
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={item.title}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-amber-400">
                          SYA
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Main Action Button */}
            <div className="relative z-10 pt-2">
              <Link
                href={`/${countryCode}/collections/${activeCollection.handle}`}
                className="w-full py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-amber-400/20 hover:scale-[1.02] cursor-pointer group-hover:shadow-amber-400/40"
              >
                <span>View Full Collection</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Dynamic Product Cards Grid (7 cols on lg) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeCollection.products.slice(0, 6).map((product, pIdx) => {
              const { price, originalPrice, discount } = getProductDisplayPrice(product)
              const thumbnail = product.thumbnail || product.images?.[0]?.url
              const categoryTitle = product.categories?.[0]?.name || activeCollection.title

              return (
                <Link
                  key={product.id}
                  href={`/${countryCode}/products/${product.handle}`}
                  style={{ animationDelay: `${pIdx * 50}ms` }}
                  className="cp-card group relative flex flex-col justify-between rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 hover:border-amber-400/60 bg-[var(--bg-surface)] p-3 shadow-sm hover:shadow-[0_12px_28px_-8px_rgba(251,191,36,0.35)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {/* Image Container with Badges */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[var(--bg-card)] flex items-center justify-center p-2 mb-3">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-500/70">
                        {product.title}
                      </div>
                    )}

                    {/* Shine sweep effect */}
                    <span
                      aria-hidden="true"
                      className="cp-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[120%]"
                    />

                    {/* Discount Badge */}
                    {discount && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white shadow-sm">
                        -{discount}%
                      </span>
                    )}

                    {/* Category Label */}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/60 dark:bg-black/75 text-white/90 backdrop-blur-xs line-clamp-1 max-w-[90px]">
                      {categoryTitle}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                        {product.title}
                      </h4>
                    </div>

                    {/* Price and Action Bar */}
                    <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1">
                      <div className="flex flex-col">
                        {originalPrice && (
                          <span className="text-[10px] text-[var(--text-muted)] line-through">
                            {originalPrice}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-black text-amber-500 dark:text-amber-400">
                          {price || "View Options"}
                        </span>
                      </div>

                      {/* Micro Quick-Action arrow */}
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 group-hover:bg-amber-400 group-hover:text-black text-[var(--text-muted)] transition-all duration-300 flex-shrink-0">
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
