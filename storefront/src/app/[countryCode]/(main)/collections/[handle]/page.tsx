import React, { Suspense } from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionByHandle } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductSidebar from "@modules/store/components/ProductSidebar"
import PaginatedProducts from "@modules/store/templates/paginated-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return {
    title: `${collection.title} | SYA Store`,
    description: `${collection.title} collection`,
  }
}

export default async function CollectionPage(props: Props) {
  const params = await props.params
  const { page } = await props.searchParams
  const { handle, countryCode } = params

  const collection = await getCollectionByHandle(handle)
  if (!collection) {
    notFound()
  }

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Dynamic themed styles mapper for collection pages
  const getCollectionTheme = (handleName: string) => {
    const h = handleName.toLowerCase()
    if (h.includes("summer")) {
      return {
        gradient: "linear-gradient(135deg, #1e1100 0%, #3a1e05 50%, #1e1100 100%)", // Warm sunset
        border: "border-amber-500/30",
        accentText: "text-amber-400",
        badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/20",
        glow: "radial-gradient(circle, rgba(251,191,36,0.15), transparent)",
      }
    } else if (h.includes("winter") || h.includes("cool")) {
      return {
        gradient: "linear-gradient(135deg, #09132c 0%, #0d2a5c 50%, #09132c 100%)", // Arctic blue
        border: "border-blue-500/30",
        accentText: "text-blue-400",
        badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/20",
        glow: "radial-gradient(circle, rgba(59,130,246,0.15), transparent)",
      }
    } else if (h.includes("deals") || h.includes("sale") || h.includes("discount")) {
      return {
        gradient: "linear-gradient(135deg, #1f0808 0%, #450a0a 50%, #1f0808 100%)", // Crimson red
        border: "border-red-500/30",
        accentText: "text-red-400",
        badgeBg: "bg-red-500/20 text-red-300 border-red-500/20",
        glow: "radial-gradient(circle, rgba(239,68,68,0.15), transparent)",
      }
    } else if (h.includes("new") || h.includes("latest") || h.includes("featured")) {
      return {
        gradient: "linear-gradient(135deg, #130a2a 0%, #2e1065 50%, #130a2a 100%)", // Deep violet
        border: "border-violet-500/30",
        accentText: "text-violet-400",
        badgeBg: "bg-violet-500/20 text-violet-300 border-violet-500/20",
        glow: "radial-gradient(circle, rgba(139,92,246,0.15), transparent)",
      }
    } else {
      // Default premium theme
      return {
        gradient: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)", // Dark gray
        border: "border-gray-500/30",
        accentText: "text-gray-300",
        badgeBg: "bg-gray-500/20 text-gray-300 border-gray-500/20",
        glow: "radial-gradient(circle, rgba(156,163,175,0.1), transparent)",
      }
    }
  }

  const theme = getCollectionTheme(handle)

  return (
    <div className="min-h-screen py-10" style={{ background: "var(--bg-base)" }}>
      <div className="content-container">
        
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-[var(--text-secondary)]">
          <LocalizedClientLink href="/collections" className="hover:text-amber-500 transition">
            Collections
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-medium">{collection.title}</span>
        </div>

        {/* Premium Styled Banner (matching homepage linear gradient aesthetic with themed background) */}
        <div
          className={`relative w-full rounded-2xl overflow-hidden mb-10 py-12 px-8 md:px-12 border ${theme.border}`}
          style={{
            background: theme.gradient,
          }}
        >
          <div className="relative z-10 max-w-xl">
            <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 ${theme.badgeBg}`}>
              Collection
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {collection.title}
            </h1>
            <p className="mt-3 text-sm md:text-base text-gray-300 leading-relaxed font-medium">
              {(collection as any).description || `Explore our curated ${collection.title} collection, filled with products handpicked for quality and style.`}
            </p>
          </div>
          {/* Decorative glow orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none" style={{ background: theme.glow, transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: theme.glow, transform: "translateY(40%)" }} />
        </div>

        {/* Sidebar + Products Grid Layout */}
        <div className="flex flex-col small:flex-row gap-8 small:gap-10 items-start">
          <Suspense fallback={<div className="w-full small:w-[260px] h-96 bg-[var(--bg-card)] rounded-2xl animate-pulse" />}>
            {/* @ts-ignore async server value */}
            <ProductSidebar
              countryCode={countryCode}
              activeCollectionId={collection.id}
            />
          </Suspense>

          <div className="w-full">
            <div className="space-y-6">
              <div className="border-b border-black/5 pb-4 dark:border-white/5">
                <h2 className="text-lg font-bold text-[var(--text-primary)] md:text-xl">
                  Products in {collection.title}
                </h2>
              </div>
              <PaginatedProducts
                page={Math.max(1, Number(page) || 1)}
                collectionId={collection.id}
                countryCode={countryCode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
