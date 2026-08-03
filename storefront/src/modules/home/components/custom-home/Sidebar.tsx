"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { HttpTypes } from "@medusajs/types"

interface SidebarProps {
  categories: HttpTypes.StoreProductCategory[]
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ categories, isOpen, onClose }: SidebarProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Categories menu"
        className={`fixed top-0 left-0 h-full w-80 max-w-[90vw] z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "linear-gradient(180deg, #141414 0%, #1a1a1a 100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">Hi there 👋</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Quick links */}
          <div className="mb-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3 px-1">Quick Links</p>
            <div className="space-y-1">
              {[
                { label: "All Products", href: "/store", icon: "🛍️" },
                { label: "New Arrivals", href: "/store?sort=created_at", icon: "✨" },
                { label: "Top Deals", href: "/store", icon: "🔥" },
              ].map(({ label, href, icon }) => (
                <Link
                  key={href + label}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-200 hover:text-white hover:bg-white/8 text-sm transition"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-5" />

          {/* Category tree */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3 px-1">Categories</p>
            <div className="space-y-1">
              {categories.map((cat) => {
                const hasChildren = (cat.category_children?.length ?? 0) > 0
                const isExpanded = expandedId === cat.id

                return (
                  <div key={cat.id}>
                    <div
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition cursor-pointer ${
                        isExpanded
                          ? "bg-amber-400/10 text-amber-300"
                          : "text-gray-300 hover:text-white hover:bg-white/8"
                      }`}
                      onClick={() => {
                        if (hasChildren) {
                          setExpandedId(isExpanded ? null : cat.id)
                        }
                      }}
                    >
                      {hasChildren ? (
                        <span className="font-medium">{cat.name}</span>
                      ) : (
                        <Link href={`/categories/${cat.handle}`} onClick={onClose} className="w-full">
                          {cat.name}
                        </Link>
                      )}

                      {hasChildren && (
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-90 text-amber-400" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>

                    {/* Sub-categories */}
                    {hasChildren && isExpanded && (
                      <div className="ml-4 mt-1 space-y-0.5 border-l border-amber-400/20 pl-3">
                        {cat.category_children?.map((child) => (
                          <Link
                            key={child.id}
                            href={`/categories/${child.handle}`}
                            onClick={onClose}
                            className="block py-2 px-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <Link
            href="/account"
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-amber-400 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Account Settings
          </Link>
        </div>
      </div>
    </>
  )
}
