import Image from "next/image"
import Link from "next/link"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface AllCollectionsTemplateProps {
  collections: HttpTypes.StoreCollection[]
}

export default function AllCollectionsTemplate({
  collections,
}: AllCollectionsTemplateProps) {
  return (
    <div className="min-h-screen py-10" style={{ background: "var(--bg-base)" }}>
      <div className="content-container">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">
            Curated selections
          </p>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Shop by Collection
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-lg">
            Browse our curated product collections, each hand-picked for quality and style.
          </p>
        </div>

        {/* Collection grid */}
        {collections.length === 0 ? (
          <div className="text-center py-24 text-[var(--text-muted)]">
            No collections available yet.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {collections.map((col) => {
              // Use first product thumbnail as banner
              const banner = (col.products as any)?.[0]?.thumbnail as string | undefined
              return (
                <li key={col.id}>
                  <LocalizedClientLink
                    href={`/collections/${col.handle}`}
                    className="group flex flex-col rounded-2xl overflow-hidden border border-black/8 dark:border-white/8
                      hover:border-amber-400/40 hover:ring-1 hover:ring-amber-400/30
                      transition-all duration-300 shadow-sm"
                    style={{ background: "var(--bg-card)" }}
                  >
                    {/* Banner image */}
                    <div
                      className="relative w-full aspect-[16/9] overflow-hidden"
                      style={{ background: "var(--bg-surface)" }}
                    >
                      {banner ? (
                        <Image
                          src={banner}
                          alt={col.title}
                          fill
                          loading="lazy"
                          className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Footer row */}
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition">
                          {col.title}
                        </h2>
                        {(col.products as any)?.length > 0 && (
                          <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
                            {(col.products as any).length} products
                          </span>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </LocalizedClientLink>
                </li>
              )
            })}
          </ul>
        )}

        {/* Back to store */}
        <div className="mt-14 text-center">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border text-sm font-semibold transition hover:border-amber-400/40"
            style={{ borderColor: "var(--nav-border)", color: "var(--text-primary)" }}
          >
            Browse All Products →
          </Link>
        </div>
      </div>
    </div>
  )
}
