"use client"

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"

interface CategoryCarouselProps {
  categories?: HttpTypes.StoreProductCategory[]
  products?: HttpTypes.StoreProduct[]
  countryCode?: string
}

/* ------------------------------------------------------------------ */
/* Tuning knobs                                                        */
/* ------------------------------------------------------------------ */
const GAP = 16 // px, matches `gap-4` on track
const AUTO_SPEED = 22 // px per second while auto-scrolling
const MANUAL_PAUSE_MS = 1600 // pause after arrow click
const TOUCH_PAUSE_MS = 2500 // pause after finger lifts

interface CategoryProductPreview {
  id: string
  title: string
  thumbnail: string
  price?: string
  handle?: string
}

// Category fallback icon generator based on category name
const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase()
  if (
    lower.includes("health") ||
    lower.includes("beauty") ||
    lower.includes("skin") ||
    lower.includes("care") ||
    lower.includes("wellness")
  ) {
    return (
      <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    )
  }
  if (
    lower.includes("shirt") ||
    lower.includes("apparel") ||
    lower.includes("cloth") ||
    lower.includes("fashion") ||
    lower.includes("pant") ||
    lower.includes("sweat")
  ) {
    return (
      <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    )
  }
  if (
    lower.includes("electronic") ||
    lower.includes("tech") ||
    lower.includes("hardware") ||
    lower.includes("gadget") ||
    lower.includes("solar")
  ) {
    return (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  }
  if (lower.includes("vehicle") || lower.includes("auto") || lower.includes("car")) {
    return (
      <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 17a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4zM3 9l2.5-4.5A2 2 0 017.25 3.5h9.5a2 2 0 011.75 1L21 9v6a1 1 0 01-1 1h-1a2 2 0 01-4 0H9a2 2 0 01-4 0H4a1 1 0 01-1-1V9z"
        />
      </svg>
    )
  }
  return (
    <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  )
}

// Scoped styles (keyframes + edge fade)
const CAROUSEL_CSS = `
@keyframes cc-rise {
  from { opacity: 0; transform: translateY(22px) scale(.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes cc-float {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50%      { transform: translateY(-7px) rotate(4deg); }
}
@keyframes cc-shine {
  from { transform: translateX(-130%) skewX(-20deg); }
  to   { transform: translateX(260%) skewX(-20deg); }
}
@keyframes cc-glow {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: .10; }
  50%      { transform: translate(-24px, 18px) scale(1.15); opacity: .16; }
}
@keyframes cc-badge {
  0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,.55); }
  50%      { box-shadow: 0 0 0 6px rgba(251,191,36,0); }
}
.cc-rise  { animation: cc-rise .65s cubic-bezier(.2,.8,.2,1) backwards; }
.cc-float { animation: cc-float 3.6s ease-in-out infinite; }
.cc-glow  { animation: cc-glow 9s ease-in-out infinite; }
.cc-badge { animation: cc-badge 2.4s ease-out infinite; }
.cc-card:hover .cc-shine { animation: cc-shine .9s ease; }
.cc-fade {
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 36px, #000 calc(100% - 36px), transparent 100%);
          mask-image: linear-gradient(to right, transparent 0, #000 36px, #000 calc(100% - 36px), transparent 100%);
}
.cc-track::-webkit-scrollbar { display: none; }
@media (prefers-reduced-motion: reduce) {
  .cc-rise, .cc-float, .cc-glow, .cc-badge { animation: none; }
  .cc-card:hover .cc-shine { animation: none; }
}
`

/* ------------------------------------------------------------------ */
/* Dynamic Category Card with Staggered Product Image Swapping        */
/* ------------------------------------------------------------------ */
interface DynamicCategoryCardProps {
  cat: HttpTypes.StoreProductCategory
  matchingPreviews: CategoryProductPreview[]
  totalCount: number
  copyIndex: number
  cardIndex: number
  countryCode?: string
}

function DynamicCategoryCard({
  cat,
  matchingPreviews,
  totalCount,
  copyIndex,
  cardIndex,
  countryCode,
}: DynamicCategoryCardProps) {
  const isClone = copyIndex !== 1
  const [activeIdx, setActiveIdx] = useState(0)
  const [isCardHovered, setIsCardHovered] = useState(false)

  const hasPreviews = matchingPreviews.length > 0
  const activePreview = hasPreviews ? matchingPreviews[activeIdx % matchingPreviews.length] : null

  // Stagger auto-swap per card so all cards don't cross-fade at the exact same millisecond
  useEffect(() => {
    if (matchingPreviews.length <= 1 || isCardHovered) return

    // Offset interval per card index (e.g. 3.2s, 3.8s, 4.4s, 3.5s)
    const staggerOffset = ((cardIndex * 650) % 1800)
    const intervalTime = 3200 + staggerOffset

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % matchingPreviews.length)
    }, intervalTime)

    return () => clearInterval(timer)
  }, [matchingPreviews.length, isCardHovered, cardIndex])

  const targetHref = countryCode
    ? `/${countryCode}/categories/${cat.handle}`
    : `/categories/${cat.handle}`

  return (
    <Link
      href={targetHref}
      aria-hidden={isClone || undefined}
      tabIndex={isClone ? -1 : undefined}
      draggable={false}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      style={{ animationDelay: `${Math.min(cardIndex, 8) * 70}ms` }}
      className="cc-card cc-rise group relative flex flex-col w-[180px] sm:w-[220px] md:w-[240px] flex-shrink-0 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 hover:border-amber-400/60 transition-all duration-300 shadow-sm hover:shadow-[0_14px_32px_-10px_rgba(251,191,36,0.45)] bg-[var(--bg-surface)] hover:-translate-y-1.5 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 select-none"
    >
      {/* Category Image Zone with Multi-Image Crossfade */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[var(--bg-card)] flex items-center justify-center p-3">
        {hasPreviews ? (
          <div className="relative w-full h-full">
            {matchingPreviews.slice(0, 6).map((preview, pIdx) => {
              const isActive = pIdx === activeIdx % matchingPreviews.length
              return (
                <div
                  key={preview.id || pIdx}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out flex items-center justify-center ${
                    isActive
                      ? "opacity-100 scale-100 z-10"
                      : "opacity-0 scale-95 pointer-events-none z-0"
                  }`}
                >
                  <Image
                    src={preview.thumbnail}
                    alt={isClone ? "" : preview.title || cat.name}
                    fill
                    sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, 240px"
                    className="object-contain p-2 group-hover:scale-110 group-hover:-rotate-1 transition-transform duration-500 ease-out"
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-amber-400/5 via-amber-400/10 to-transparent p-4">
            <div className="cc-float" style={{ animationDelay: `${(cardIndex % 5) * -0.7}s` }}>
              {getCategoryIcon(cat.name)}
            </div>
            <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest text-center line-clamp-1">
              {cat.name}
            </span>
          </div>
        )}

        {/* Shine sweep on hover */}
        <span
          aria-hidden="true"
          className="cc-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[130%]"
        />

        {/* Multi-product cycling dot indicators */}
        {matchingPreviews.length > 1 && (
          <div
            className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-black/50 dark:bg-black/75 backdrop-blur-xs px-2 py-1 rounded-full border border-white/10 transition-opacity duration-200"
            aria-hidden="true"
          >
            {matchingPreviews.slice(0, 4).map((_, dotIdx) => {
              const isDotActive = dotIdx === activeIdx % Math.min(matchingPreviews.length, 4)
              return (
                <span
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isDotActive ? "w-3 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "w-1.5 bg-white/40"
                  }`}
                />
              )
            })}
          </div>
        )}

        {/* Total Item count badge */}
        {totalCount > 0 && (
          <span className="cc-badge absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 dark:bg-black/80 text-white backdrop-blur-sm border border-white/10">
            {totalCount} {totalCount === 1 ? "item" : "items"}
          </span>
        )}

        {/* Active Product Mini Overlay Badge (Crossfades along with image) */}
        {activePreview && (
          <div className="absolute bottom-2 inset-x-2 z-20 px-2.5 py-1.5 rounded-xl bg-black/65 dark:bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-between gap-1.5 shadow-md group-hover:bg-black/80 transition-all duration-300">
            <span className="text-[10px] font-semibold text-white/95 truncate max-w-[100px] sm:max-w-[120px]">
              {activePreview.title}
            </span>
            {activePreview.price && (
              <span className="text-[10px] font-extrabold text-amber-400 flex-shrink-0">
                {activePreview.price}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Category Details & View Action */}
      <div className="p-3.5 flex items-center justify-between gap-2 border-t border-black/5 dark:border-white/5 bg-[var(--bg-surface)]">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition line-clamp-1">
            {cat.name}
          </h3>
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
            {cat.description || "Explore category →"}
          </p>
        </div>

        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 group-hover:bg-amber-400 group-hover:text-black group-hover:rotate-[360deg] text-amber-400 transition-all duration-500 flex-shrink-0">
          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Main CategoryCarousel Component                                    */
/* ------------------------------------------------------------------ */
export default function CategoryCarousel({
  categories: initialCategories = [],
  products = [],
  countryCode,
}: CategoryCarouselProps) {
  const [categories, setCategories] = useState<HttpTypes.StoreProductCategory[]>(initialCategories)
  const [isLoading, setIsLoading] = useState(initialCategories.length === 0)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Auto-scroll state
  const [loop, setLoop] = useState(false)
  const [paused, setPaused] = useState(false)
  const loopWidth = useRef(0)
  const flags = useRef({
    paused: false,
    hover: false,
    focus: false,
    touch: false,
    visible: true,
    manualUntil: 0,
  })

  /* ---------------------------------------------------------------- */
  /* Data loading fallback                                             */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories)
      setIsLoading(false)
      return
    }

    let isMounted = true
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
        const res = await fetch(`${baseUrl}/store/product-categories?fields=*category_children,*products&limit=50`, {
          headers: apiKey ? { "x-publishable-api-key": apiKey } : undefined,
        })
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data.product_categories) {
            setCategories(data.product_categories)
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchCategories()
    return () => {
      isMounted = false
    }
  }, [initialCategories])

  // Top-level categories first, fall back to everything if none are top-level
  const activeCategories = useMemo(() => {
    const top = categories.filter((c) => !c.parent_category)
    return top.length > 0 ? top : categories
  }, [categories])
  const n = activeCategories.length

  // Build product-to-category previews map
  const categoryPreviewsMap = useMemo(() => {
    const map = new Map<string, { previews: CategoryProductPreview[]; totalCount: number }>()

    activeCategories.forEach((cat) => {
      const matching = products.filter((p) =>
        p.categories?.some(
          (c) =>
            c.id === cat.id ||
            c.handle?.toLowerCase() === cat.handle?.toLowerCase() ||
            cat.category_children?.some((child) => child.id === c.id || child.handle === c.handle)
        )
      )

      const previews: CategoryProductPreview[] = []
      const seenThumbnails = new Set<string>()

      matching.forEach((p) => {
        const thumb = p.thumbnail || p.images?.[0]?.url
        if (thumb && !seenThumbnails.has(thumb)) {
          seenThumbnails.add(thumb)
          const calcAmount = p.variants?.[0]?.calculated_price?.calculated_amount
          const currCode = p.variants?.[0]?.calculated_price?.currency_code || "zmw"
          const priceFormatted = calcAmount
            ? convertToLocale({ amount: calcAmount, currency_code: currCode })
            : undefined

          previews.push({
            id: p.id,
            title: p.title,
            thumbnail: thumb,
            price: priceFormatted,
            handle: p.handle,
          })
        }
      })

      // If category has direct products or thumbnail attached
      if (previews.length === 0 && cat.products && cat.products.length > 0) {
        cat.products.forEach((cp) => {
          if (cp.thumbnail && !seenThumbnails.has(cp.thumbnail)) {
            seenThumbnails.add(cp.thumbnail)
            previews.push({
              id: cp.id,
              title: cp.title,
              thumbnail: cp.thumbnail,
              handle: cp.handle,
            })
          }
        })
      }

      map.set(cat.id, {
        previews,
        totalCount: matching.length > 0 ? matching.length : (cat.products?.length ?? 0),
      })
    })

    return map
  }, [activeCategories, products])

  /* ---------------------------------------------------------------- */
  /* Measure & Loop Layout                                            */
  /* ---------------------------------------------------------------- */
  const measure = useCallback(() => {
    const el = trackRef.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first || n === 0) return
    const setWidth = n * (first.offsetWidth + GAP)
    loopWidth.current = setWidth
    const shouldLoop = setWidth >= el.clientWidth + GAP
    setLoop((prev) => (prev === shouldLoop ? prev : shouldLoop))
  }, [n])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isLoading, n, measure])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.scrollLeft = loop ? loopWidth.current : 0
  }, [loop])

  /* ---------------------------------------------------------------- */
  /* Scroll listener                                                   */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    let settle: ReturnType<typeof setTimeout>

    const onScroll = () => {
      const w = loopWidth.current
      const sl = el.scrollLeft

      if (progressRef.current) {
        let frac: number
        if (loop && w > 0) {
          frac = (((sl - w) % w) + w) % w / w
        } else {
          frac = sl / Math.max(1, el.scrollWidth - el.clientWidth)
        }
        progressRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0.04, frac))})`
      }

      if (loop) {
        clearTimeout(settle)
        settle = setTimeout(() => {
          if (el.scrollLeft >= 2 * w) el.scrollLeft -= w
          else if (el.scrollLeft < w) el.scrollLeft += w
        }, 140)
      } else {
        setCanScrollLeft(sl > 10)
        setCanScrollRight(sl + el.clientWidth < el.scrollWidth - 10)
      }
    }

    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      clearTimeout(settle)
      el.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [isLoading, loop, n])

  /* ---------------------------------------------------------------- */
  /* Auto-scroll engine                                                */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    flags.current.paused = paused
  }, [paused])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      flags.current.visible = entry.isIntersecting
    })
    io.observe(el)
    return () => io.disconnect()
  }, [isLoading])

  useEffect(() => {
    const el = trackRef.current
    if (!el || !loop) return

    let raf = 0
    let last = performance.now()
    let pos = el.scrollLeft
    let factor = 0

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000
      last = now

      const f = flags.current
      const interacting = f.touch || now < f.manualUntil
      const wantsRun = !f.paused && !f.hover && !f.focus && f.visible && !interacting

      factor += ((wantsRun ? 1 : 0) - factor) * Math.min(1, dt * 5)

      if (interacting || (!wantsRun && factor < 0.02)) {
        pos = el.scrollLeft
      } else {
        const w = loopWidth.current
        pos += AUTO_SPEED * factor * dt
        if (pos >= 2 * w) pos -= w
        else if (pos < w) pos += w
        el.scrollLeft = pos
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [loop, n, isLoading])

  /* ---------------------------------------------------------------- */
  /* Manual controls                                                   */
  /* ---------------------------------------------------------------- */
  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current
    if (!el) return
    flags.current.manualUntil = performance.now() + MANUAL_PAUSE_MS
    const scrollAmount = Math.max(el.clientWidth * 0.75, 260)
    el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" })
  }

  const onTouchStart = () => {
    flags.current.touch = true
  }
  const onTouchEnd = () => {
    flags.current.touch = false
    flags.current.manualUntil = performance.now() + TOUCH_PAUSE_MS
  }

  if (!isLoading && (!activeCategories || activeCategories.length === 0)) {
    return null
  }

  const copies = loop ? [0, 1, 2] : [1]
  const arrowLeftEnabled = loop || canScrollLeft
  const arrowRightEnabled = loop || canScrollRight

  return (
    <section className="max-w-7xl mx-auto px-4 my-8 relative z-20" aria-label="Product Categories">
      <style>{CAROUSEL_CSS}</style>

      <div
        className="rounded-2xl p-6 md:p-8 border border-black/10 dark:border-white/10 shadow-sm relative overflow-hidden"
        style={{ background: "var(--bg-card)" }}
      >
        {/* Slowly drifting background glows */}
        <div
          className="cc-glow absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #fbbf24, transparent)" }}
        />
        <div
          className="cc-glow absolute -bottom-32 -left-24 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #f472b6, transparent)", animationDelay: "-4s" }}
        />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-amber-400" />
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400">
                Explore Our Offerings!
              </p>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">
              Find everything from beauty and wellness to electronics, lifestyle and kitchenware!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={countryCode ? `/${countryCode}/categories` : "/categories"}
              className="text-xs font-semibold px-4 py-2 rounded-full border border-amber-400/30 text-amber-500 dark:text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 transition duration-150 flex items-center gap-1.5 flex-shrink-0"
            >
              <span>All Categories</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Play / pause + navigation (Desktop) */}
            <div className="hidden sm:flex items-center gap-1.5">
              {loop && (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? "Play auto-scroll" : "Pause auto-scroll"}
                  aria-pressed={!paused}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-black/15 dark:border-white/15 bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-amber-400/60 hover:text-amber-400 hover:scale-105 transition cursor-pointer"
                >
                  {paused ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                    </svg>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!arrowLeftEnabled}
                aria-label="Previous categories"
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition ${
                  arrowLeftEnabled
                    ? "border-black/15 dark:border-white/15 bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-amber-400/60 hover:text-amber-400 hover:scale-105 cursor-pointer"
                    : "border-black/5 dark:border-white/5 opacity-30 cursor-not-allowed text-[var(--text-muted)]"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!arrowRightEnabled}
                aria-label="Next categories"
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition ${
                  arrowRightEnabled
                    ? "border-black/15 dark:border-white/15 bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-amber-400/60 hover:text-amber-400 hover:scale-105 cursor-pointer"
                    : "border-black/5 dark:border-white/5 opacity-30 cursor-not-allowed text-[var(--text-muted)]"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => (flags.current.hover = true)}
          onMouseLeave={() => (flags.current.hover = false)}
          onFocus={() => (flags.current.focus = true)}
          onBlur={() => (flags.current.focus = false)}
        >
          {/* Mobile floating navigation buttons */}
          {arrowLeftEnabled && !isLoading && (
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg flex items-center justify-center text-[var(--text-primary)] cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {arrowRightEnabled && !isLoading && (
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg flex items-center justify-center text-[var(--text-primary)] cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="flex gap-4 overflow-hidden py-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-[180px] sm:w-[220px] md:w-[240px] flex-shrink-0 rounded-2xl border border-black/5 dark:border-white/5 p-3 flex flex-col gap-3 animate-pulse bg-[var(--bg-surface)]"
                >
                  <div className="w-full aspect-[4/3] rounded-xl bg-black/5 dark:bg-white/5" />
                  <div className="h-4 w-3/4 bg-black/10 dark:bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-black/5 dark:bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={trackRef}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
              className="cc-track cc-fade flex gap-4 overflow-x-auto py-5 px-1 select-none"
              style={{ scrollbarWidth: "none" }}
            >
              {copies.map((copy) =>
                activeCategories.map((cat, i) => {
                  const data = categoryPreviewsMap.get(cat.id)
                  const matchingPreviews = data?.previews || []
                  const totalCount = data?.totalCount || 0

                  return (
                    <DynamicCategoryCard
                      key={`${cat.id}-${copy}`}
                      cat={cat}
                      matchingPreviews={matchingPreviews}
                      totalCount={totalCount}
                      copyIndex={copy}
                      cardIndex={i}
                      countryCode={countryCode}
                    />
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {!isLoading && (
          <div className="relative mt-2 h-[3px] rounded-full bg-black/5 dark:bg-white/10 overflow-hidden" aria-hidden="true">
            <div
              ref={progressRef}
              className="h-full origin-left rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
              style={{ transform: "scaleX(0.04)", willChange: "transform" }}
            />
          </div>
        )}
      </div>
    </section>
  )
}
