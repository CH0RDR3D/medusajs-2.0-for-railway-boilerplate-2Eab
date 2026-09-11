import { Suspense } from "react"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { retrieveCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ThemeToggle from "@modules/layout/components/theme-toggle"
import CartButton from "@modules/layout/components/cart-button"
import NavCategories from "./NavCategories"
import NavSearch from "./NavSearch"
import MobileSearchToggle from "./MobileSearchToggle"
import MobileNavDrawer from "@modules/layout/components/mobile-nav-drawer"
import Logo from "@modules/layout/components/logo"
import { MessageSquare, ShoppingBag } from "lucide-react"
import AccountLink from "@modules/layout/components/account-link"

/**
 * Responsive Frosted-Glass Navigation Bar for SYA Store.
 *
 * Mobile layout:
 *   [Hamburger / Drawer] [Logo] | [Spacer] | [Mobile Search] [Account] [Cart]
 *
 * Desktop layout:
 *   [Logo] | [Search Bar] | [Categories Dropdown] | [Account] [Customer Care] [Theme] [Cart]
 */
export default async function Nav() {
  const [categories, collectionResult, customer, regions] = await Promise.all([
    listCategories().catch(() => []),
    listCollections({ limit: 12 }).catch(() => ({ collections: [], count: 0 })),
    retrieveCustomer().catch(() => null),
    listRegions().catch(() => []),
  ])

  const collections = collectionResult.collections ?? []

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header
        className="
          relative w-full h-14
          border-b
          backdrop-blur-md
          transition-colors duration-200
        "
        style={{
          background: "var(--nav-bg)",
          borderColor: "var(--nav-border)",
        }}
      >
        <nav
          className="content-container flex items-center justify-between gap-x-2 sm:gap-x-3 w-full h-full"
          aria-label="Main Navigation"
        >
          {/* ── Left cluster: Mobile drawer trigger + Brand Logo ── */}
          <div className="flex items-center gap-x-1.5 sm:gap-x-3 flex-shrink-0">
            {/* Mobile Navigation Drawer with categories, collections, search & account */}
            <MobileNavDrawer
              categories={categories}
              collections={collections}
              customer={customer}
              regions={regions}
            />

            {/* Brand Logo */}
            <LocalizedClientLink
              href="/"
              className="flex-shrink-0 transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-md"
              data-testid="nav-store-link"
              aria-label="SYA Store Home"
            >
              <Logo />
            </LocalizedClientLink>
          </div>

          {/* ── Desktop Search bar ── */}
          <div className="hidden small:flex flex-1 max-w-sm mx-4">
            <NavSearch />
          </div>

          {/* Spacer */}
          <div className="hidden small:flex flex-1" />

          {/* ── Category & Collection dropdowns (Desktop) ── */}
          <div className="hidden small:flex items-center">
            <NavCategories categories={categories} collections={collections} />
          </div>

          {/* ── Right cluster ── */}
          <div className="flex items-center gap-x-1 sm:gap-x-3 flex-shrink-0 h-full">
            {/* Mobile Quick Search Toggle */}
            <MobileSearchToggle />

            {/* Account link (Both Desktop and Mobile) */}
            <div className="flex items-center">
              <AccountLink
                customerName={
                  [customer?.first_name, customer?.last_name]
                    .filter(Boolean)
                    .join(" ") || customer?.email
                }
              />
            </div>

            {/* Customer Care (Desktop only, available in mobile drawer) */}
            <div className="hidden small:flex items-center">
              <LocalizedClientLink
                href="/customer-care"
                className="
                  flex items-center gap-1.5 text-xs font-medium
                  text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                  transition-colors duration-200
                  focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-md px-2 py-1
                "
                aria-label="Customer Care and Support"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Customer Care</span>
              </LocalizedClientLink>
            </div>

            {/* Theme toggle (Desktop only, available in mobile drawer footer) */}
            <div className="hidden small:flex items-center">
              <ThemeToggle />
            </div>

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
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  <span>Cart (0)</span>
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

