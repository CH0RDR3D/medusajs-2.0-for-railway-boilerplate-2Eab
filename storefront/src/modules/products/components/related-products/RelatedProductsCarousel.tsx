"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"

interface RelatedProductsCarouselProps {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function RelatedProductsCarousel({
  products,
  region,
}: RelatedProductsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const pausedRef = useRef(false)
  const [canScroll, setCanScroll] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  // Only duplicate items for seamless loop if content exceeds container width
  const items = canScroll ? [...products, ...products] : products

  const SPEED = 0.5 // px per frame

  const tick = useCallback(() => {
    const el = trackRef.current
    if (!el || pausedRef.current) {
      animRef.current = requestAnimationFrame(tick)
      return
    }
    el.scrollLeft += SPEED
    // When we've scrolled past the first copy, reset silently
    const half = el.scrollWidth / 2
    if (el.scrollLeft >= half) {
      el.scrollLeft -= half
    }
    animRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const check = () => setCanScroll(el.scrollWidth > el.clientWidth + 4)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [products])

  useEffect(() => {
    if (!canScroll) return
    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [canScroll, tick])

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" })
  }

  // Touch swipe manual control
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
      {/* Arrow left (show only if scrolling is possible) */}
      {canScroll && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-4 w-8 h-8 rounded-full
            bg-[var(--bg-card)] border border-black/10 dark:border-white/10 shadow-md
            flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]
            opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 cursor-pointer"
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
        className="flex gap-4 overflow-x-scroll scroll-smooth no-scrollbar"
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}
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
              href={`/products/${product.handle}`}
              scroll={true}
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

      {/* Arrow right (show only if scrolling is possible) */}
      {canScroll && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-4 w-8 h-8 rounded-full
            bg-[var(--bg-card)] border border-black/10 dark:border-white/10 shadow-md
            flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]
            opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 cursor-pointer"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
