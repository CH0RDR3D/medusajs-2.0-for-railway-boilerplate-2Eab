"use client"

import React, { useRef, useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@modules/home/components/custom-home/Product-Grid"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface EditorsPickCarouselProps {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default function EditorsPickCarousel({
  products,
  region,
  countryCode,
}: EditorsPickCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 5)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    updateScrollState()
    el.addEventListener("scroll", updateScrollState)
    window.addEventListener("resize", updateScrollState)

    // Monitor resize events of the track container
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)

    return () => {
      el.removeEventListener("scroll", updateScrollState)
      window.removeEventListener("resize", updateScrollState)
      ro.disconnect()
    }
  }, [products])

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" })
  }

  // Touch handlers for mobile swipe navigation
  const touchStartX = useRef(0)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      scroll(diff > 0 ? "right" : "left")
    }
  }

  if (!products || !products.length) return null

  return (
    <div
      className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10"
      style={{ background: "var(--bg-card)" }}
    >
      {/* Section header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">Editor's Picks</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Curated favourites from our collection — updated daily
          </p>
        </div>
        <LocalizedClientLink
          href="/editors-pick"
          className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-amber-400/20 text-amber-400 border-amber-400/20 transition hover:opacity-80"
        >
          View all →
        </LocalizedClientLink>
      </div>

      {/* Thin accent bar */}
      <div className="mx-6 h-px mb-5 bg-black/10 dark:bg-white/10" />

      {/* Carousel Wrapper */}
      <div className="relative px-6 pb-6 group/carousel">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
              bg-[var(--bg-card)] border border-black/10 dark:border-white/10 shadow-md
              flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]
              focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition duration-150"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Scrollable track */}
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-[180px] md:w-[240px] flex-shrink-0">
              <ProductCard product={product} region={region} showShopNow={false} />
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
              bg-[var(--bg-card)] border border-black/10 dark:border-white/10 shadow-md
              flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]
              focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition duration-150"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
