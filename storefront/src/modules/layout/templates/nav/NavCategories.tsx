"use client"

/**
 * NavCategories (inline variant)
 * Renders category pill links for the single nav row.
 * The Sidebar drawer is now triggered directly from SideMenu's hamburger.
 * This component is hidden on mobile (handled by the parent nav).
 */

import React from "react"
import Link from "next/link"
import { HttpTypes } from "@medusajs/types"

interface NavCategoriesProps {
  categories: HttpTypes.StoreProductCategory[]
}

export default function NavCategories({ categories }: NavCategoriesProps) {
  return (
    <div className="flex items-center gap-0.5">
      {categories.slice(0, 6).map((cat) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.handle}`}
          className="
            px-3 py-1 text-xs font-medium rounded-md
            text-[var(--text-secondary)] hover:text-[var(--text-primary)]
            hover:bg-black/5 dark:hover:bg-white/8
            transition-all duration-150 flex-shrink-0 whitespace-nowrap
          "
        >
          {cat.name}
        </Link>
      ))}

      {/* Separator */}
      {categories.length > 0 && (
        <div className="w-px h-4 mx-1 bg-black/10 dark:bg-white/10 flex-shrink-0" />
      )}

      {/* Deals highlight link */}
      <Link
        href="/store"
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
