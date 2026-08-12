"use client"

/**
 * NavCategories (inline variant)
 * Renders collection pill links and a categories dropdown for the single nav row.
 * The Sidebar drawer is now triggered directly from SideMenu's hamburger.
 * This component is hidden on mobile (handled by the parent nav).
 */

import React from "react"
import Link from "next/link"
import { HttpTypes } from "@medusajs/types"

interface NavCategoriesProps {
  collections?: HttpTypes.StoreCollection[]
  categories?: HttpTypes.StoreProductCategory[]
}

export default function NavCategories({
  collections = [],
  categories = [],
}: NavCategoriesProps) {
  const topCategories = categories
    .filter((category) => !category.parent_category)
    .slice(0, 10)

  return (
    <div className="flex items-center gap-0.5">
      {collections.slice(0, 6).map((collection) => (
        <Link
          key={collection.id}
          href={`/collections/${collection.handle}`}
          className="
            px-3 py-1 text-xs font-medium rounded-md
            text-[var(--text-secondary)] hover:text-[var(--text-primary)]
            hover:bg-black/5 dark:hover:bg-white/8
            transition-all duration-150 flex-shrink-0 whitespace-nowrap
          "
        >
          {collection.title}
        </Link>
      ))}

      {/* Separator */}
      {collections.length > 0 && (
        <div className="w-px h-4 mx-1 bg-black/10 dark:bg-white/10 flex-shrink-0" />
      )}

      {/* Categories dropdown */}
      <div className="relative group flex-shrink-0">
        <button
          type="button"
          className="
            inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md
            text-[var(--text-secondary)] hover:text-[var(--text-primary)]
            hover:bg-black/5 dark:hover:bg-white/8 transition-all duration-150
          "
          aria-haspopup="menu"
          aria-label="Browse categories"
        >
          Categories
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m6 9 6 6 6-6"
            />
          </svg>
        </button>

        <div
          className="
            absolute right-0 top-full mt-2 w-56 rounded-xl border border-black/10 dark:border-white/10
            bg-[var(--bg-card)] shadow-lg backdrop-blur-md p-2
            invisible opacity-0 pointer-events-none
            group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto
            group-focus-within:visible group-focus-within:opacity-100 group-focus-within:pointer-events-auto
            transition-all duration-150
          "
          role="menu"
        >
          {topCategories.length > 0 ? (
            topCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.handle}`}
                className="
                  flex items-center rounded-lg px-2.5 py-2 text-xs
                  text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                  hover:bg-black/5 dark:hover:bg-white/8
                "
                role="menuitem"
              >
                {category.name}
              </Link>
            ))
          ) : (
            <p className="px-2.5 py-2 text-xs text-[var(--text-muted)]">
              No categories available
            </p>
          )}
        </div>
      </div>

      {/* Deals highlight link */}
      <Link
        href="/deals"
        className="
          flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-md
          text-amber-500 hover:text-amber-400
          hover:bg-amber-400/10
          transition-all duration-150 whitespace-nowrap
        "
      >
        🔥 Deals
      </Link>
    </div>
  )
}
