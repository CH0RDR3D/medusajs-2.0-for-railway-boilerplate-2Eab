"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export default function ShuffleSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Only run on All Products (store), categories, and collections pages
    const isTargetPage =
      pathname.includes("/store") ||
      pathname.includes("/categories/") ||
      pathname.includes("/collections/")

    if (!isTargetPage) {
      return
    }

    const currentSeed = searchParams.get("seed")

    if (!currentSeed) {
      const storedSeed = localStorage.getItem("sya_shuffle_seed")
      const storedTime = localStorage.getItem("sya_shuffle_timestamp")
      const now = Date.now()

      let seedToUse = storedSeed
      const ONE_DAY = 24 * 60 * 60 * 1000

      if (!storedSeed || !storedTime || now - parseInt(storedTime) > ONE_DAY) {
        // Generate a random float between -1.0 and 1.0 for PostgreSQL setseed()
        seedToUse = (Math.random() * 2 - 1).toFixed(4)
        localStorage.setItem("sya_shuffle_seed", seedToUse)
        localStorage.setItem("sya_shuffle_timestamp", now.toString())
      }

      // Update URL search parameters
      const params = new URLSearchParams(searchParams)
      params.set("seed", seedToUse!)
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, [pathname, searchParams, router])

  return <>{children}</>
}
