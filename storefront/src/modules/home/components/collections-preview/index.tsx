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
const MAX_VISIBLE_SLOTS = 6

const COLLECTIONS_CSS = `
@keyframes cp-pulse-slow {
  0%, 100% { opacity: 0.12; transform: scale3d(1, 1, 1); }
  50%      { opacity: 0.22; transform: scale3d(1.08, 1.08, 1); }
}
@keyframes cp-shine {
  from { transform: translateX(-120%) skewX(-20deg); }
  to   { transform: translateX(250%) skewX(-20deg); }
}
@keyframes cp-fade-in {
  from { opacity: 0; transform: translate3d(0, 10px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
.cp-pulse-1 { animation: cp-pulse-slow 8s ease-in-out infinite; will-change: transform, opacity; }
.cp-pulse-2 { animation: cp-pulse-slow 10s ease-in-out infinite 2s; will-change: transform, opacity; }
.cp-card:hover .cp-shine { animation: cp-shine 0.85s ease; }
.cp-fade-in { animation: cp-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.cp-touch-scroll {
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
}
.cp-touch-scroll > * {
  scroll-snap-align: start;
}
@media (prefers-reduced-motion: reduce) {
  .cp-pulse-1, .cp-pulse-2, .cp-fade-in { animation: none; }
  .cp-card:hover .cp-shine { animation: none; }
}
`

/* ------------------------------------------------------------------ */
/* Dynamic Product Card Slot with Staggered Product & Image Swapping  */
/* ------------------------------------------------------------------ */
interface DynamicProductCardSlotProps {
  productsPool: HttpTypes.StoreProduct[]
  slotIndex: number
  collectionTitle: string
  region?: HttpTypes.StoreRegion
  countryCode: string
}

function DynamicProductCardSlot({
  productsPool,
  slotIndex,
  collectionTitle,
  region,
  countryCode,
}: DynamicProductCardSlotProps) {
  const [activeProductIdx, setActiveProductIdx] = useState(0)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [isSlotHovered, setIsSlotHovered] = useState(false)

  const numProducts = productsPool.length
  const currentProduct = productsPool[activeProductIdx % Math.max(1, numProducts)] || productsPool[0]

  // Extract all available preview images for the current active product
  const productImages = useMemo(() => {
    if (!currentProduct) return []
    const imgs: string[] = []
    if (currentProduct.thumbnail) imgs.push(currentProduct.thumbnail)
    if (currentProduct.images && currentProduct.images.length > 0) {
      currentProduct.images.forEach((img) => {
        if (img.url && !imgs.includes(img.url)) imgs.push(img.url)
      })
    }
    return imgs
  }, [currentProduct])

  // Staggered auto-swap timer per card slot
  useEffect(() => {
    if (numProducts <= 1 && productImages.length <= 1) return
    if (isSlotHovered) return

    // Offset interval per slot (e.g. 3.4s, 4.2s, 3.8s, 4.5s)
    const staggerOffset = (slotIndex * 750) % 2200
    const intervalTime = 3400 + staggerOffset

    const timer = setInterval(() => {
      if (numProducts > 1) {
        setActiveProductIdx((prev) => (prev + 1) % numProducts)
        setActiveImageIdx(0)
      } else if (productImages.length > 1) {
        setActiveImageIdx((prev) => (prev + 1) % productImages.length)
      }
    }, intervalTime)

    return () => clearInterval(timer)
  }, [numProducts, productImages.length, isSlotHovered, slotIndex])

  if (!currentProduct) return null

  // Format pricing
  const calcAmount = currentProduct.variants?.[0]?.calculated_price?.calculated_amount
  const origAmount = currentProduct.variants?.[0]?.calculated_price?.original_amount
  const currCode =
    currentProduct.variants?.[0]?.calculated_price?.currency_code ||
    region?.currency_code ||
    "zmw"

  const formattedPrice =
    calcAmount != null
      ? convertToLocale({ amount: calcAmount, currency_code: currCode })
      : null

  const formattedOrigPrice =
    origAmount != null && origAmount > (calcAmount ?? 0)
      ? convertToLocale({ amount: origAmount, currency_code: currCode })
      : null

  const percentDiscount =
    calcAmount != null && origAmount != null && origAmount > calcAmount
      ? Math.round(((origAmount - calcAmount) / origAmount) * 100)
      : null

  const currentThumbnail =
    productImages[activeImageIdx % Math.max(1, productImages.length)] ||
    currentProduct.thumbnail ||
    currentProduct.images?.[0]?.url

  const categoryTitle =
    currentProduct.categories?.[0]?.name || collectionTitle

  const totalCycleSteps = numProducts > 1 ? numProducts : productImages.length
  const currentStep = numProducts > 1 ? activeProductIdx : activeImageIdx

  return (
    <Link
      href={`/${countryCode}/products/${currentProduct.handle}`}
      onMouseEnter={() => setIsSlotHovered(true)}
      onMouseLeave={() => setIsSlotHovered(false)}
      style={{ animationDelay: `${slotIndex * 60}ms` }}
      aria-label={`View product: ${currentProduct.title}`}
      className="cp-card group relative flex flex-col justify-between rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 hover:border-amber-400/60 bg-[var(--bg-surface)] p-3 shadow-sm hover:shadow-[0_12px_28px_-8px_rgba(251,191,36,0.35)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 w-[170px] sm:w-auto flex-shrink-0 sm:flex-shrink select-none"
    >
      {/* Image Container with Smooth Cross-fading */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[var(--bg-card)] flex items-center justify-center p-2 mb-2.5">
        {currentThumbnail ? (
          <div className="relative w-full h-full">
            <Image
              key={`${currentProduct.id}-${currentThumbnail}`}
              src={currentThumbnail}
              alt={currentProduct.title}
              fill
              sizes="(max-width: 640px) 170px, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-1.5 group-hover:scale-110 transition-transform duration-500 ease-out"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-500/70 text-center p-2">
            {currentProduct.title}
          </div>
        )}

        {/* Shine sweep effect on card hover */}
        <span
          aria-hidden="true"
          className="cp-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[120%]"
        />

        {/* Multi-product cycling dot indicators */}
        {totalCycleSteps > 1 && (
          <div
            className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-black/55 dark:bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10"
            aria-hidden="true"
          >
            {Array.from({ length: Math.min(totalCycleSteps, 4) }).map((_, dotIdx) => {
              const isDotActive = dotIdx === currentStep % Math.min(totalCycleSteps, 4)
              return (
                <span
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${isDotActive
                    ? "w-3 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                    : "w-1.5 bg-white/40"
                    }`}
                />
              )
            })}
          </div>
        )}

        {/* Discount Badge */}
        {percentDiscount && (
          <span className="absolute bottom-2 left-2 z-20 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-red-500 text-white shadow-sm">
            -{percentDiscount}%
          </span>
        )}

        {/* Category Label */}
        <span className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/60 dark:bg-black/75 text-white/90 backdrop-blur-xs line-clamp-1 max-w-[80px]">
          {categoryTitle}
        </span>
      </div>

      {/* Product Details (Switches dynamically alongside product) */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {currentProduct.title}
          </h4>
        </div>

        {/* Price and Action Bar */}
        <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1">
          <div className="flex flex-col min-w-0">
            {formattedOrigPrice && (
              <span className="text-[10px] text-[var(--text-muted)] line-through truncate">
                {formattedOrigPrice}
              </span>
            )}
            <span className="text-xs sm:text-sm font-black text-amber-500 dark:text-amber-400 truncate">
              {formattedPrice || "View Options"}
            </span>
          </div>

          {/* Micro Action Button */}
          <div
            aria-hidden="true"
            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 group-hover:bg-amber-400 group-hover:text-black text-[var(--text-muted)] transition-all duration-300 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Main CollectionsPreview Component                                   */
/* ------------------------------------------------------------------ */
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
        const colProducts = products.filter(
          (p) =>
            p.collection_id === col.id ||
            p.collection?.handle === col.handle ||
            col.products?.some((cp) => cp.id === p.id)
        )

        const finalProducts =
          colProducts.length > 0
            ? colProducts
            : products.slice(idx * 4, idx * 4 + 8)

        if (finalProducts.length > 0) {
          list.push({
            id: col.id,
            title: col.title,
            handle: col.handle,
            description:
              (col as any).metadata?.description ||
              `Discover exclusive handpicked pieces in our ${col.title} collection, ready for same-day delivery across Lusaka.`,
            badgeText:
              idx === 0
                ? "Featured Drop"
                : idx === 1
                  ? "Trending Hub"
                  : "Curated Collection",
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
        description:
          "The most wanted lifestyle, electronics, and daily essentials trending in Lusaka today.",
        badgeText: "Most Popular",
        accentColor: "amber",
        products: products.slice(0, 10),
      })

      if (products.length > 4) {
        list.push({
          id: "smart-arrivals",
          title: "New Season Arrivals",
          handle: "new-arrivals",
          description:
            "Fresh arrivals and newly listed products curated for your daily lifestyle.",
          badgeText: "Just Landed",
          accentColor: "cyan",
          products: products.slice(4, 14),
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
          description:
            "Unbeatable discounts and promotional prices with instant checkout.",
          badgeText: "Special Offers",
          accentColor: "emerald",
          products: dealItems.slice(0, 10),
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
  const containerRef = useRef<HTMLElement>(null)
  const tabListRef = useRef<HTMLDivElement>(null)

  const numCollections = displayCollections.length
  const activeCollection =
    displayCollections[activeIdx % Math.max(1, numCollections)] ||
    displayCollections[0]

  // Partition collection products into slot pools
  const slotPools = useMemo(() => {
    if (!activeCollection || activeCollection.products.length === 0) return []

    const numSlots = Math.min(MAX_VISIBLE_SLOTS, Math.max(1, activeCollection.products.length))
    const pools: HttpTypes.StoreProduct[][] = Array.from({ length: numSlots }, () => [])

    activeCollection.products.forEach((prod, pIdx) => {
      const slotIndex = pIdx % numSlots
      pools[slotIndex].push(prod)
    })

    return pools
  }, [activeCollection])

  // Manual tab selection
  const handleSelectCollection = useCallback((idx: number) => {
    setActiveIdx(idx)
    setProgress(0)
    setManualPauseUntil(Date.now() + MANUAL_PAUSE_MS)
  }, [])

  // Keyboard navigation for accessible tablist (WCAG 2.1)
  const handleTabKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % numCollections
      handleSelectCollection(nextIndex)
      const tabs = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      tabs?.[nextIndex]?.focus()
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      const prevIndex = (currentIndex - 1 + numCollections) % numCollections
      handleSelectCollection(prevIndex)
      const tabs = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      tabs?.[prevIndex]?.focus()
    }
  }

  // Auto-slide tick engine
  useEffect(() => {
    if (numCollections <= 1) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsPausedByUser(true)
      return
    }

    const intervalStep = 50
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

  return (
    <section
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="max-w-7xl mx-auto px-3 sm:px-4 my-6 md:my-10 relative z-20"
      aria-label="Featured Collections Showcase"
      aria-roledescription="carousel"
    >
      <style>{COLLECTIONS_CSS}</style>

      <div
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 border border-black/10 dark:border-white/10 shadow-xl relative overflow-hidden"
        style={{ background: "var(--bg-card)" }}
      >
        {/* Ambient Decorative Background Glows */}
        <div
          aria-hidden="true"
          className="cp-pulse-1 absolute -top-32 -right-32 w-72 md:w-96 h-72 md:h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
        />
        <div
          aria-hidden="true"
          className="cp-pulse-2 absolute -bottom-36 -left-36 w-72 md:w-96 h-72 md:h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
        />

        {/* ── Section Header & Interactive Collection Switcher Tabs ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <span className="relative flex w-2 h-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-amber-400" />
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400">
                Curated Selections
              </p>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Featured Collections
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Live rotating product previews • Auto-cycles or tap to explore
            </p>
          </div>

          {/* Accessible Tab List & Play/Pause Controls */}
          <div
            ref={tabListRef}
            role="tablist"
            aria-label="Select collection"
            className="flex items-center gap-2 pb-2 overflow-x-auto scrollbar-none max-w-full -mx-1 px-1 touch-pan-x"
          >
            {displayCollections.map((col, idx) => {
              const isActive = idx === activeIdx
              return (
                <button
                  key={col.id}
                  id={`tab-${col.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${col.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  onClick={() => handleSelectCollection(idx)}
                  className={`relative overflow-hidden min-h-[44px] px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${isActive
                    ? "bg-amber-400 text-black shadow-md shadow-amber-400/25 scale-[1.03]"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10"
                    }`}
                >
                  {/* Active progress bar indicator */}
                  {isActive && !isPausedByUser && !isHovered && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-[3px] bg-black/40 transition-all duration-75 origin-left"
                      style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
                    />
                  )}

                  <span className="relative z-10">{col.title}</span>
                  <span
                    className={`relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${isActive
                      ? "bg-black/15 text-black"
                      : "bg-black/10 dark:bg-white/10 text-[var(--text-muted)]"
                      }`}
                  >
                    {col.products.length}
                  </span>
                </button>
              )
            })}

            {/* Play/Pause Auto-slide Toggle Button removed */}
            {/* 
<button
  type="button"
  onClick={() => setIsPausedByUser((prev) => !prev)}
  aria-label={isPausedByUser ? "Resume collections auto-slide" : "Pause collections auto-slide"}
  title={isPausedByUser ? "Resume auto-slide" : "Pause auto-slide"}
  aria-pressed={!isPausedByUser}
  className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center border border-black/15 dark:border-white/15 bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-amber-400 hover:text-amber-400 transition cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
>
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
</button>
*/}

          </div>
        </div>

        {/* ── Split Interactive Hero Layout with Accessible TabPanel ── */}
        <div
          id={`panel-${activeCollection.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeCollection.id}`}
          aria-live="polite"
          key={activeCollection.id}
          className="cp-fade-in grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 relative z-10 items-stretch"
        >
          {/* Left: Featured Collection Banner Card */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl p-5 sm:p-7 md:p-8 relative overflow-hidden border border-amber-400/30 shadow-lg bg-gradient-to-br from-black/95 via-[#1a1306] to-black text-white group">
            {/* Ambient inner glow orb */}
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 w-48 sm:w-56 h-48 sm:h-56 rounded-full opacity-35 pointer-events-none group-hover:scale-125 transition-transform duration-700"
              style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
            />

            {/* Collection Metadata */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3 sm:mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                <span>{activeCollection.badgeText}</span>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                {activeCollection.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 mt-2 sm:mt-3 leading-relaxed line-clamp-2 sm:line-clamp-3">
                {activeCollection.description}
              </p>

              {/* Highlights badge list */}
              <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 text-white/90 backdrop-blur-xs flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{activeCollection.products.length} Products</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 text-white/90 backdrop-blur-xs flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Instant Yango Delivery</span>
                </span>
              </div>
            </div>

            {/* Mini Product Snapshot Strip with Accessible Touch Targets */}
            <div className="relative z-10 my-4 sm:my-6 pt-3 sm:pt-4 border-t border-white/10">
              <p className="text-[11px] font-semibold text-gray-400 mb-2.5">Collection Snapshot:</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
                {activeCollection.products.slice(0, 5).map((item) => {
                  const thumb = item.thumbnail || item.images?.[0]?.url
                  return (
                    <Link
                      key={item.id}
                      href={`/${countryCode}/products/${item.handle}`}
                      aria-label={`View product: ${item.title}`}
                      className="relative min-w-[48px] min-h-[48px] w-12 h-12 rounded-xl bg-white/10 border border-white/15 overflow-hidden flex-shrink-0 hover:scale-110 hover:border-amber-400 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
            <div className="relative z-10 pt-1">
              <Link
                href={`/${countryCode}/collections/${activeCollection.handle}`}
                className="w-full min-h-[48px] py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-amber-400/20 hover:scale-[1.02] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>View Full Collection</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Dynamic Product Card Slots (Staggered Swapping Engine) */}
          <div className="lg:col-span-7 flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 cp-touch-scroll -mx-2 px-2 sm:mx-0 sm:px-0">
            {slotPools.map((pool, sIdx) => (
              <DynamicProductCardSlot
                key={`slot-${activeCollection.id}-${sIdx}`}
                productsPool={pool}
                slotIndex={sIdx}
                collectionTitle={activeCollection.title}
                region={region}
                countryCode={countryCode}
              />
            ))}
          </div>
        </div>
      </div>
    </section >
  )
}
