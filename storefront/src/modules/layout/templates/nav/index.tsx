import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ThemeToggle from "@modules/common/components/theme-toggle"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import NavCategories from "./NavCategories"
import NavSearch from "./NavSearch"
import Logo from "@modules/layout/components/logo"

/**
 * Single-row frosted-glass navigation bar.
 *
 * Layout (desktop, left→right):
 *   [SideMenu] | [Logo] | [Search] | [Categories] | [Deals] | [Account] [Theme] [Cart]
 *
 * On mobile:
 *   [SideMenu] | [Logo]                            | [Theme] [Cart]
 *   — categories & search collapse into the SideMenu drawer
 */
export default async function Nav() {
  const [regions, categories, collectionResult] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listCategories().catch(() => []),
    listCollections({ limit: 6 }).catch(() => ({ collections: [], count: 0 })),
  ])

  const collections = collectionResult.collections ?? []

  return (
    /* Sticky wrapper — sits at viewport top, above everything */
    <div className="sticky top-0 inset-x-0 z-50">
      <header
        className="
          relative w-full h-14
          border-b
          backdrop-blur-md
        "
        style={{
          background: "var(--nav-bg)",
          borderColor: "var(--nav-border)",
        }}
      >
        <nav className="content-container flex items-center gap-x-3 w-full h-full">

          {/* ── Left: hamburger / side-menu (always visible) ── 
          <div className="flex items-center h-full flex-shrink-0">
            <SideMenu
              regions={regions}
            />
          </div>
*/}
          {/* ── Logo ── */}
          {/* ── Logo ── */}
          <LocalizedClientLink
            href="/"
            className="flex-shrink-0 transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-md"
            data-testid="nav-store-link"
          >
            <Logo />
          </LocalizedClientLink>

          {/* ── Search bar (desktop) ── */}
          <div className="hidden small:flex flex-1 max-w-sm">
            <NavSearch />
          </div>

          {/* Spacer — pushes categories + right cluster apart */}
          <div className="flex-1" />

          {/* ── Category links (desktop only) ── */}
          <div className="hidden small:flex items-center">
            <NavCategories categories={categories} collections={collections} />
          </div>

          {/* ── Right cluster: Account, Customer Care, Theme toggle, Cart ── */}
          <div className="flex items-center gap-x-4 flex-shrink-0 h-full">
            {/* Account — desktop only */}
            <div className="hidden small:flex items-center">
              <LocalizedClientLink
                href="/account"
                className="
                  flex items-center gap-1 text-xs font-medium
                  text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                  transition-colors duration-200
                  focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-md px-1.5 py-1
                "
                data-testid="nav-account-link"
              >
                {/* Person icon */}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                Account
              </LocalizedClientLink>
            </div>

            {/* Customer Care — desktop only */}
            <div className="hidden small:flex items-center">
              <LocalizedClientLink
                href="/customer-care"
                className="
                  flex items-center gap-1 text-xs font-medium
                  text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                  transition-colors duration-200
                  focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-md px-1.5 py-1
                "
              >
                {/* Support/chat icon */}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
                Customer Care
              </LocalizedClientLink>
            </div>

            {/* Theme toggle — always visible */}
            <ThemeToggle />

            {/* Cart — always visible */}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="
                    flex items-center gap-1 text-xs font-medium
                    text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                    transition-colors duration-200
                    focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-md px-1.5 py-1
                  "
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  {/* Cart icon */}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
