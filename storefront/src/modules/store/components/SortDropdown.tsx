"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { SortOptions } from "./refinement-list/sort-products"

export default function SortDropdown({ sortBy }: { sortBy: SortOptions }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const query = createQueryString("sortBy", e.target.value)
    router.push(`${pathname}?${query}`)
  }

  return (
    <div className="flex items-center gap-2 select-none">
      <label htmlFor="sort-select" className="text-xs font-semibold text-[var(--text-secondary)]">
        Sort:
      </label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={handleChange}
        className="
          px-3 py-1.5 text-xs rounded-xl border border-black/10 dark:border-white/10
          text-[var(--text-primary)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-amber-500
          cursor-pointer transition duration-150
        "
        aria-label="Sort products by"
      >
        <option value="created_at">Latest Arrivals</option>
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
      </select>
    </div>
  )
}
