"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import SortProducts, { SortOptions } from "./sort-products"
import FilterRadioGroup from "@modules/common/components/filter-radio-group"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  activeTag?: string
  activeCategory?: string
  tags?: string[]
  categories?: string[]
  'data-testid'?: string
}

const toLabel = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const RefinementList = ({
  sortBy,
  activeTag,
  activeCategory,
  tags = [],
  categories = [],
  'data-testid': dataTestId,
}: RefinementListProps) => {
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

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  const clearFilter = (name: string) => {
    const params = new URLSearchParams(searchParams)
    params.delete(name)
    router.push(`${pathname}?${params.toString()}`)
  }

  const tagItems = [
    { value: "all", label: "All tags" },
    ...tags.map((tag) => ({ value: tag, label: toLabel(tag) })),
  ]

  const categoryItems = [
    { value: "all", label: "All categories" },
    ...categories.map((category) => ({ value: category, label: toLabel(category) })),
  ]

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} data-testid={dataTestId} />
      <FilterRadioGroup
        title="Filter by tags"
        items={tagItems}
        value={activeTag || "all"}
        handleChange={(value: string) => {
          if (value === "all") {
            clearFilter("tag")
            return
          }
          setQueryParams("tag", value)
        }}
      />
      <FilterRadioGroup
        title="Filter by categories"
        items={categoryItems}
        value={activeCategory || "all"}
        handleChange={(value: string) => {
          if (value === "all") {
            clearFilter("category")
            return
          }
          setQueryParams("category", value)
        }}
      />
    </div>
  )
}

export default RefinementList
