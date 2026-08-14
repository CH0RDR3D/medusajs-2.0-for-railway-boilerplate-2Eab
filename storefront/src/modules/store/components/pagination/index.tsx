"use client"

import { clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  'data-testid': dataTestid
}: {
  page: number
  totalPages: number
  'data-testid'?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Helper function to generate an array of numbers within a range
  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index)

  // Function to handle page changes
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // Function to render a page button
  const renderPageButton = (
    p: number,
    label: string | number,
    isCurrent: boolean
  ) => (
    <button
      key={p}
      className={clx(
        "w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-full transition duration-150 cursor-pointer disabled:cursor-default",
        {
          "bg-amber-500 text-white shadow-sm font-bold": isCurrent,
          "text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-primary)]": !isCurrent,
        }
      )}
      disabled={isCurrent}
      onClick={() => handlePageChange(p)}
    >
      {label}
    </button>
  )

  // Function to render ellipsis
  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className="w-8 h-8 flex items-center justify-center text-xs text-[var(--text-muted)] font-medium cursor-default"
    >
      ...
    </span>
  )

  // Function to render page buttons based on the current page and total pages
  const renderPageButtons = () => {
    const buttons = []

    if (totalPages <= 7) {
      // Show all pages
      buttons.push(
        ...arrayRange(1, totalPages).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
    } else {
      // Handle different cases for displaying pages and ellipses
      if (page <= 4) {
        // Show 1, 2, 3, 4, 5, ..., lastpage
        buttons.push(
          ...arrayRange(1, 5).map((p) => renderPageButton(p, p, p === page))
        )
        buttons.push(renderEllipsis("ellipsis1"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      } else if (page >= totalPages - 3) {
        // Show 1, ..., lastpage - 4, lastpage - 3, lastpage - 2, lastpage - 1, lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis2"))
        buttons.push(
          ...arrayRange(totalPages - 4, totalPages).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
      } else {
        // Show 1, ..., page - 1, page, page + 1, ..., lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis3"))
        buttons.push(
          ...arrayRange(page - 1, page + 1).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
        buttons.push(renderEllipsis("ellipsis4"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      }
    }

    return buttons
  }

  // Render the component
  return (
    <div className="flex flex-col items-center gap-4 w-full mt-12 select-none">
      {/* Indicator */}
      <span className="text-xs font-semibold text-[var(--text-muted)]">
        Page {page} of {totalPages}
      </span>

      <div className="flex gap-2 items-center" data-testid={dataTestid}>
        {/* Previous Page Button */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="
            flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-black/10 dark:border-white/10
            text-[var(--text-secondary)] bg-[var(--bg-card)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40
            disabled:hover:bg-transparent transition duration-150 cursor-pointer disabled:cursor-default
          "
          aria-label="Go to previous page"
        >
          <svg className="w-3.5 h-3.5 animate-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>

        {/* Page Buttons (numbers) */}
        <div className="flex gap-2 items-center mx-1">
          {renderPageButtons()}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="
            flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-black/10 dark:border-white/10
            text-[var(--text-secondary)] bg-[var(--bg-card)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40
            disabled:hover:bg-transparent transition duration-150 cursor-pointer disabled:cursor-default
          "
          aria-label="Go to next page"
        >
          Next
          <svg className="w-3.5 h-3.5 animate-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
