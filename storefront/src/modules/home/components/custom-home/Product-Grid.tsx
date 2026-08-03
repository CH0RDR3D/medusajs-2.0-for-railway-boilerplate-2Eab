"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"

interface ProductGridProps {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  title: string
  subtitle?: string
  accentColor?: "amber" | "violet" | "emerald"
  viewAllHref?: string
}

const ACCENT = {
  amber: {
    badge: "bg-amber-400/20 text-amber-400 border-amber-400/20",
    link: "text-amber-400 group-hover:text-amber-300",
    ring: "ring-amber-400/40",
  },
  violet: {
    badge: "bg-violet-400/20 text-violet-300 border-violet-400/20",
    link: "text-violet-300 group-hover:text-violet-200",
    ring: "ring-violet-400/40",
  },
  emerald: {
    badge: "bg-emerald-400/20 text-emerald-300 border-emerald-400/20",
    link: "text-emerald-300 group-hover:text-emerald-200",
    ring: "ring-emerald-400/40",
  },
}

export default function ProductGrid({
  products,
  region,
  title,
  subtitle,
  accentColor = "amber",
  viewAllHref = "/store",
}: ProductGridProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const accent = ACCENT[accentColor]

  return (
    <div
      className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10"
      style={{ background: "var(--bg-card)" }}
    >
      {/* Section header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">{title}</h2>
          {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
        </div>
        <Link
          href={viewAllHref}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${accent.badge} transition hover:opacity-80`}
        >
          View all →
        </Link>
      </div>

      {/* Thin accent bar */}
      <div className="mx-6 h-px mb-5 bg-black/10 dark:bg-white/10" />

      {/* Product card grid */}
      <div className="px-6 pb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product) => {
          const price = product.variants?.[0]?.calculated_price?.calculated_amount ?? 0
          const originalPrice = product.variants?.[0]?.calculated_price?.original_amount ?? 0
          const discountPct =
            originalPrice > price
              ? Math.round(((originalPrice - price) / originalPrice) * 100)
              : null
          const isHovered = hovered === product.id

          return (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                isHovered ? `ring-1 ${accent.ring} border-transparent bg-black/5 dark:bg-white/5` : "border-black/5 dark:border-white/5 bg-transparent"
              }`}
              onMouseEnter={() => setHovered(product.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Image zone */}
              <div className="relative w-full aspect-square overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    className={`object-contain p-4 transition-transform duration-500 ${
                      isHovered ? "scale-110" : "scale-100"
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Discount badge */}
                {discountPct && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/90 text-white text-xs font-bold rounded-full">
                    -{discountPct}%
                  </span>
                )}
              </div>

              {/* Info zone */}
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-xs md:text-sm text-[var(--text-secondary)] font-medium line-clamp-2 group-hover:text-[var(--text-primary)] transition leading-snug">
                  {product.title}
                </h3>

                <div className="mt-auto pt-3 flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {convertToLocale({
                        amount: price,
                        currency_code: region.currency_code,
                      })}
                    </span>
                    {discountPct && (
                      <span className="text-xs text-[var(--text-muted)] line-through">
                        {convertToLocale({
                          amount: originalPrice,
                          currency_code: region.currency_code,
                        })}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-semibold transition ${accent.link}`}>Shop →</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
