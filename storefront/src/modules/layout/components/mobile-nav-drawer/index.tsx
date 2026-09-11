"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { useMedusaAuth } from "@lib/hooks/use-medusa-auth"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ThemeToggle from "../theme-toggle"
import CountrySelect from "../country-select"
import { useToggleState } from "@medusajs/ui"
import Logo from "../logo"
import {
  Menu,
  X,
  Search,
  Home,
  ShoppingBag,
  Flame,
  Star,
  User,
  LogIn,
  UserPlus,
  HelpCircle,
  Package,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react"

interface MobileNavDrawerProps {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
  customer: HttpTypes.StoreCustomer | null
  regions: HttpTypes.StoreRegion[] | null
}

export default function MobileNavDrawer({
  categories = [],
  collections = [],
  customer,
  regions,
}: MobileNavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const { session, signOut, signInWithGoogle } = useMedusaAuth()
  const countrySelectToggle = useToggleState()

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const topCategories = categories.filter((c) => !c.parent_category)
  const customerName =
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    session?.user?.name ||
    customer?.email ||
    session?.user?.email

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsOpen(false)
    window.location.href = `/store?q=${encodeURIComponent(searchQuery.trim())}`
  }

  return (
    <div className="flex small:hidden items-center">
      {/* ── Hamburger Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-11 h-11 -ml-2 rounded-lg text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
        aria-label="Open mobile navigation menu"
        aria-expanded={isOpen}
        data-testid="mobile-menu-trigger"
      >
        <Menu className="w-5 h-5 text-amber-500" />
      </button>

      {/* ── Backdrop Overlay ── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* ── Slide-in Drawer Panel ── */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[85vw] max-w-[340px] bg-[var(--surface-card)] border-r border-[var(--surface-border)] shadow-2xl z-50 flex flex-col justify-between transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        data-testid="mobile-nav-drawer"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--surface-border)] bg-[var(--nav-bg)]">
          <LocalizedClientLink href="/" onClick={() => setIsOpen(false)}>
            <Logo />
          </LocalizedClientLink>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
            aria-label="Close navigation menu"
            data-testid="close-mobile-menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* User Account Card */}
          <div className="p-3.5 rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)]">
            {customer || session?.user ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={customerName || "User"}
                      className="w-10 h-10 rounded-full border border-amber-500 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-sm">
                      {customerName?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">
                      Verified Member
                    </p>
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {customerName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {customer?.email || session?.user?.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--surface-border)]">
                  <LocalizedClientLink
                    href="/account"
                    onClick={() => setIsOpen(false)}
                    className="py-1.5 px-2 text-center text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition"
                  >
                    My Account
                  </LocalizedClientLink>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      signOut()
                    }}
                    className="py-1.5 px-2 text-center text-xs font-medium rounded-lg text-rose-500 hover:bg-rose-500/10 flex items-center justify-center gap-1 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Welcome to SYA Store</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Sign in for 1-click checkout, saved Google Maps delivery locations, and order tracking.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <LocalizedClientLink
                    href="/account"
                    onClick={() => setIsOpen(false)}
                    className="py-2 px-3 text-center text-xs font-bold rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition flex items-center justify-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/account"
                    onClick={() => setIsOpen(false)}
                    className="py-2 px-3 text-center text-xs font-semibold rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] transition flex items-center justify-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Join</span>
                  </LocalizedClientLink>
                </div>
              </div>
            )}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, parts..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--surface-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
            />
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5 pointer-events-none" />
          </form>

          {/* Core Navigation Links */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 mb-1.5">
              Explore
            </p>

            <LocalizedClientLink
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <Home className="w-4 h-4 text-amber-500" />
              <span>Home</span>
            </LocalizedClientLink>

            <LocalizedClientLink
              href="/store"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <span>All Products</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold">
                Store
              </span>
            </LocalizedClientLink>

            <LocalizedClientLink
              href="/deals"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 transition"
            >
              <div className="flex items-center gap-3">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Today&apos;s Hot Deals</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold uppercase animate-pulse">
                Hot
              </span>
            </LocalizedClientLink>

            <LocalizedClientLink
              href="/editors-pick"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <Star className="w-4 h-4 text-amber-500" />
              <span>Editor&apos;s Pick</span>
            </LocalizedClientLink>
          </div>

          {/* Categories Accordion */}
          {topCategories.length > 0 && (
            <div className="border-t border-[var(--surface-border)] pt-3">
              <button
                type="button"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between px-2 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                <span>Shop By Category</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isCategoriesOpen ? "rotate-180 text-amber-500" : ""
                  }`}
                />
              </button>

              {isCategoriesOpen && (
                <div className="mt-1 space-y-1 pl-2 animate-in fade-in slide-in-from-top-1">
                  {topCategories.map((category) => (
                    <LocalizedClientLink
                      key={category.id}
                      href={`/categories/${category.handle}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/5 transition"
                    >
                      <span>{category.name}</span>
                      <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
                    </LocalizedClientLink>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Collections Accordion */}
          {collections.length > 0 && (
            <div className="border-t border-[var(--surface-border)] pt-3">
              <button
                type="button"
                onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
                className="w-full flex items-center justify-between px-2 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                <span>Collections</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isCollectionsOpen ? "rotate-180 text-amber-500" : ""
                  }`}
                />
              </button>

              {isCollectionsOpen && (
                <div className="mt-1 space-y-1 pl-2 animate-in fade-in slide-in-from-top-1">
                  {collections.map((collection) => (
                    <LocalizedClientLink
                      key={collection.id}
                      href={`/collections/${collection.handle}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/5 transition"
                    >
                      <span>{collection.title}</span>
                      <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
                    </LocalizedClientLink>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Support & Care Links */}
          <div className="border-t border-[var(--surface-border)] pt-3 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 mb-1.5">
              Customer Support
            </p>
            <LocalizedClientLink
              href="/customer-care"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Customer Care Hub</span>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/returns"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <Package className="w-4 h-4 text-amber-500" />
              <span>Returns & Order Tracking</span>
            </LocalizedClientLink>
          </div>
        </div>

        {/* Drawer Footer: Theme Toggle, Country Select & Copyright */}
        <div className="p-4 border-t border-[var(--surface-border)] bg-[var(--nav-bg)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Appearance
            </span>
            <ThemeToggle />
          </div>

          {regions && regions.length > 0 && (
            <div className="pt-2 border-t border-[var(--surface-border)]">
              <CountrySelect
                toggleState={countrySelectToggle}
                regions={regions}
              />
            </div>
          )}

          <p className="text-[10px] text-[var(--text-muted)] text-center pt-1">
            © {new Date().getFullYear()} SYA Store Lusaka. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
