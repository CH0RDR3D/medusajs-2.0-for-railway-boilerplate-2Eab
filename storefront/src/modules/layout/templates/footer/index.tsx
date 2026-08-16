import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import Logo from "@modules/layout/components/logo"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

/**
 * Redesigned, compact footer for SYA Store.
 * Organized into uncluttered columns for Brand, Essential Links, Categories, and Contact.
 */
export default async function Footer() {
  const { collections } = await getCollectionsList(0, 4)
  const { product_categories } = await getCategoriesList(0, 4)

  return (
    <footer className="border-t border-[var(--surface-border)] bg-[var(--bg-card)] w-full text-[var(--text-primary)] transition-colors duration-200">
      <div className="content-container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 py-12">
          
          {/* Brand & Address Column */}
          <div className="lg:col-span-4 space-y-4">
            <LocalizedClientLink
              href="/"
              className="inline-block transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-md"
            >
              <Logo />
            </LocalizedClientLink>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)] max-w-sm">
              Zambia&apos;s multi-sector destination for dependable vehicles, certified automotive care, renewable solar energy, and household essentials.
            </p>
            <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)] pt-1">
              <MapPin className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span>Plot No. F/687/A/1/A/8, Makeni Road, Lusaka, Zambia</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Quick Links
            </span>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <LocalizedClientLink
                  href="/about"
                  className="hover:text-amber-500 transition duration-150"
                >
                  About SYA
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/customer-care"
                  className="hover:text-amber-500 transition duration-150"
                >
                  Customer Care &amp; FAQs
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="hover:text-amber-500 transition duration-150"
                >
                  Store Catalog
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/account"
                  className="hover:text-amber-500 transition duration-150"
                >
                  Account &amp; Orders
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Categories & Collections Column */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Featured Categories
            </span>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              {product_categories && product_categories.length > 0 ? (
                product_categories.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/categories/${c.handle}`}
                      className="hover:text-amber-500 transition duration-150"
                    >
                      {c.name}
                    </LocalizedClientLink>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <LocalizedClientLink href="/store" className="hover:text-amber-500">
                      Vehicles &amp; Auto Care
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink href="/store" className="hover:text-amber-500">
                      Solar Power Systems
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink href="/store" className="hover:text-amber-500">
                      Household Goods
                    </LocalizedClientLink>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Customer Support
            </span>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <a href="tel:+260978883420" className="hover:text-amber-500 transition">
                  +260-978-883-420
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <a href="mailto:info@syastore.com" className="hover:text-amber-500 transition">
                  info@syastore.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] pt-1">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Mon - Sat: 08:00 - 18:00 CAT</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[var(--surface-border)] py-6 text-xs text-[var(--text-muted)] gap-3">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} SYA Store Lusaka. All rights reserved.
          </Text>
          <div className="flex items-center gap-6">
            <LocalizedClientLink href="/about" className="hover:text-[var(--text-primary)] transition">
              About
            </LocalizedClientLink>
            <LocalizedClientLink href="/customer-care" className="hover:text-[var(--text-primary)] transition">
              Customer Care
            </LocalizedClientLink>
            <MedusaCTA />
          </div>
        </div>
      </div>
    </footer>
  )
}
