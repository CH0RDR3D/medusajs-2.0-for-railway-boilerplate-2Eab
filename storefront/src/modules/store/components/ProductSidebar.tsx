import React from "react"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { getProductFacets } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface ProductSidebarProps {
  countryCode: string
  activeCategoryId?: string
  activeCollectionId?: string
  activeTagValue?: string
  activeCategoryHandle?: string
  activeCollectionHandle?: string
}

export default async function ProductSidebar({
  countryCode,
  activeCategoryId,
  activeCollectionId,
  activeTagValue,
  activeCategoryHandle,
  activeCollectionHandle,
}: ProductSidebarProps) {
  // Fetch categories, collections and tags in parallel on the server
  const [categories, collectionsResult, facets] = await Promise.all([
    listCategories({ limit: 100 }),
    listCollections({ limit: 100 }),
    getProductFacets({ countryCode }),
  ])

  const collections = collectionsResult.collections ?? []
  const tags = facets.tags ?? []

  // Resolve active category and collection IDs from handles if not directly provided
  let currentCategoryId = activeCategoryId
  if (!currentCategoryId && activeCategoryHandle) {
    const match = categories.find(
      (c) => c.handle?.toLowerCase() === activeCategoryHandle.toLowerCase()
    )
    if (match) currentCategoryId = match.id
  }

  let currentCollectionId = activeCollectionId
  if (!currentCollectionId && activeCollectionHandle) {
    const match = collections.find(
      (c) => c.handle?.toLowerCase() === activeCollectionHandle.toLowerCase()
    )
    if (match) currentCollectionId = match.id
  }

  // Helper to format tag labels
  const toLabel = (value: string) =>
    value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")

  return (
    <aside className="w-full small:w-[260px] flex-shrink-0 flex flex-col gap-6 small:gap-8 small:sticky small:top-20 pb-8 select-none">
      {/* Categories Section */}
      <div className="bg-[var(--bg-card)] border border-black/10 dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
          Categories
        </h3>
        {/* On mobile, display as a horizontal scroll, on desktop as vertical list */}
        <div className="flex small:flex-col gap-2 overflow-x-auto no-scrollbar -mx-2 px-2 small:mx-0 small:px-0">
          <LocalizedClientLink
            href="/store"
            className={`
              flex-shrink-0 px-3 py-2 text-xs font-medium rounded-xl transition duration-150 whitespace-nowrap
              ${!currentCategoryId && !currentCollectionId && !activeTagValue
                ? "text-amber-500 bg-amber-400/10 font-bold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
              }
              focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none
            `}
          >
            All Products
          </LocalizedClientLink>

          {categories.map((category) => {
            // Only show top-level categories in the main list, children indented if active
            if (category.parent_category) return null
            const isActive = currentCategoryId === category.id

            return (
              <React.Fragment key={category.id}>
                <LocalizedClientLink
                  href={`/categories/${category.handle}`}
                  className={`
                    flex-shrink-0 px-3 py-2 text-xs font-medium rounded-xl transition duration-150 whitespace-nowrap
                    ${isActive
                      ? "text-amber-500 bg-amber-400/10 font-bold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                    }
                    focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none
                  `}
                >
                  {category.name}
                </LocalizedClientLink>

                {/* Subcategories (visible on desktop or if parent is active) */}
                {category.category_children && category.category_children.length > 0 && (
                  <div className="hidden small:flex flex-col ml-3 pl-2 border-l border-black/5 dark:border-white/5 gap-1.5 mt-1">
                    {category.category_children.map((child) => {
                      const isChildActive = currentCategoryId === child.id
                      return (
                        <LocalizedClientLink
                          key={child.id}
                          href={`/categories/${child.handle}`}
                          className={`
                            px-2 py-1 text-[11px] font-medium rounded-lg transition duration-150
                            ${isChildActive
                              ? "text-amber-500 font-semibold"
                              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            }
                            focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none
                          `}
                        >
                          {child.name}
                        </LocalizedClientLink>
                      )
                    })}
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Collections Section */}
      {collections.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-black/10 dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
            Collections
          </h3>
          <div className="flex small:flex-col gap-2 overflow-x-auto no-scrollbar -mx-2 px-2 small:mx-0 small:px-0">
            {collections.map((collection) => {
              const isActive = currentCollectionId === collection.id
              return (
                <LocalizedClientLink
                  key={collection.id}
                  href={`/collections/${collection.handle}`}
                  className={`
                    flex-shrink-0 px-3 py-2 text-xs font-medium rounded-xl transition duration-150 whitespace-nowrap
                    ${isActive
                      ? "text-amber-500 bg-amber-400/10 font-bold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                    }
                    focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none
                  `}
                >
                  {collection.title}
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      )}

      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-black/10 dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-1 no-scrollbar small:max-h-none">
            {tags.map((tag) => {
              const isActive = activeTagValue === tag
              return (
                <LocalizedClientLink
                  key={tag}
                  href={`/store?tag=${encodeURIComponent(tag)}`}
                  className={`
                    px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-lg border transition duration-150
                    ${isActive
                      ? "border-amber-400/40 bg-amber-400/10 text-amber-500 font-bold"
                      : "border-black/5 dark:border-white/5 text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:border-black/10 dark:hover:border-white/10 hover:text-[var(--text-primary)]"
                    }
                    focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none
                  `}
                >
                  {toLabel(tag)}
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      )}
    </aside>
  )
}
