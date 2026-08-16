"use client"

import React, { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import { ProductCard } from "@modules/home/components/custom-home/Product-Grid"

interface RelatedProductsCarouselProps {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default function RelatedProductsCarousel({
  products,
  region,
  countryCode,
}: RelatedProductsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const pausedRef = useRef(false)
  const [canScroll, setCanScroll] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const items = canScroll ? [...products, ...products] : products

  const SPEED = 0.5 // px per frame

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const check = () => {
      const productsWidth = products.length * 176 + Math.max(products.length - 1, 0) * 16
      setCanScroll(productsWidth > el.clientWidth + 4)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [products])

  useEffect(() => {
    if (!canScroll) return
    const tick = () => {
      const el = trackRef.current
      if (el && !pausedRef.current) {
        el.scrollLeft += SPEED
        const loopPoint = el.scrollWidth / 2
        if (el.scrollLeft >= loopPoint) el.scrollLeft -= loopPoint
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [canScroll])

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" })
  }

  // Touch swipe
  const touchStartX = useRef(0)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    pausedRef.current = true
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) scroll(diff > 0 ? "right" : "left")
    setTimeout(() => { pausedRef.current = false }, 800)
  }

  return (
    <div className="relative group/carousel">
      {/* Arrow left */}
      {canScroll && <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-2 w-8 h-8 rounded-full
          bg-[var(--bg-card)] border border-black/10 dark:border-white/10 shadow-md
          flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]
          opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100 transition-opacity duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        aria-label="Scroll left"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>}

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-scroll scroll-smooth no-scrollbar"
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}
        onFocusCapture={() => { pausedRef.current = true }}
        onBlurCapture={() => { pausedRef.current = false }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((product, idx) => {
          const price = product.variants?.[0]?.calculated_price?.calculated_amount ?? 0
          const original = product.variants?.[0]?.calculated_price?.original_amount ?? 0
          const discount = original > price
            ? Math.round(((original - price) / original) * 100)
            : null
          const key = `${product.id}-${idx}`
          const isHovered = hovered === key

          return (
            <Link
              key={key}
              href={`/${countryCode}/products/${product.handle}`}
              scroll={false}
              className="flex-shrink-0 w-44 group flex flex-col rounded-xl overflow-hidden border
                border-black/8 dark:border-white/8 hover:border-amber-400/40
                hover:ring-1 hover:ring-amber-400/30 transition-all duration-300"
              style={{ background: "var(--bg-card)" }}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Image */}
              <div
                className="relative w-full aspect-square overflow-hidden flex-shrink-0"
                style={{ background: "var(--bg-surface)" }}
              >
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    loading="lazy"
                    className={`object-contain p-3 transition-transform duration-500 ${
                      isHovered ? "scale-110" : "scale-100"
                    }`}
                    sizes="180px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {discount && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5 flex flex-col gap-1 flex-1">
                <h3 className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium line-clamp-2 leading-snug transition">
                  {product.title}
                </h3>
                <div className="mt-auto pt-2 flex items-baseline gap-1.5">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {convertToLocale({ amount: price, currency_code: region.currency_code })}
                  </span>
                  {discount && (
                    <span className="text-[10px] text-[var(--text-muted)] line-through">
                      {convertToLocale({ amount: original, currency_code: region.currency_code })}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Arrow right */}
      {canScroll && <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-2 w-8 h-8 rounded-full
          bg-[var(--bg-card)] border border-black/10 dark:border-white/10 shadow-md
          flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]
          opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100 transition-opacity duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        aria-label="Scroll right"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>}
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={() => setShowAll((visible) => !visible)}
          className="rounded-md border border-black/10 bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-white/10"
          aria-expanded={showAll}
          aria-controls="related-products-all"
        >
          {showAll ? "Show fewer products" : "View all related products"}
        </button>
      </div>
      {showAll && (
        <ul id="related-products-all" className="mt-6 grid grid-cols-2 gap-4 small:grid-cols-3 medium:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} region={region} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
