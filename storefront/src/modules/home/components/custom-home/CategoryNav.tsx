"use client"

import React from "react"
import Link from "next/link"
import { HttpTypes } from "@medusajs/types"

interface CategoryNavProps {
  categories: HttpTypes.StoreProductCategory[]
  onMenuClick: () => void
}

export default function CategoryNav({ categories, onMenuClick }: CategoryNavProps) {
  return (
    <nav className="sticky top-0 z-40 w-full bg-[#0f0f0f] border-b border-white/10 text-white overflow-x-auto">
      <div className="flex items-center max-w-7xl mx-auto px-4 h-12 gap-1 whitespace-nowrap">
        {/* Hamburger menu button — opens the collapsible sidebar */}
        <button
          onClick={onMenuClick}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10 rounded-md transition mr-2 flex-shrink-0"
          aria-label="Open categories menu"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>Browse</span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/20 flex-shrink-0 mr-2" />

        {/* Category links */}
        {categories.slice(0, 8).map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.handle}`}
            className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition flex-shrink-0"
          >
            {category.name}
          </Link>
        ))}

        {/* Spacer pushes "Deals" to the right edge if space permits */}
        <div className="flex-1" />

        {/* Highlighted Deals link with amber accent */}
        <Link
          href="/store"
          className="flex-shrink-0 px-4 py-1.5 text-sm font-semibold text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 rounded-md transition"
        >
          🔥 Deals
        </Link>
      </div>
    </nav>
  )
}
