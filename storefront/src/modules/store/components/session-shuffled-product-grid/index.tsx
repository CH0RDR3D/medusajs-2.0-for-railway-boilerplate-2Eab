"use client"

import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@modules/home/components/custom-home/Product-Grid"
import { Pagination } from "@modules/store/components/pagination"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SESSION_TTL = 24 * 60 * 60 * 1000

type StoredOrder = { createdAt: number; ids: string[] }

const shuffle = <T,>(items: T[]) => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const targetIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[targetIndex]] = [shuffled[targetIndex], shuffled[index]]
  }
  return shuffled
}

export function SessionShuffledProductGrid({
  products,
  region,
  page,
  totalPages,
  storageKey,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  page: number
  totalPages: number
  storageKey: string
}) {
  const [orderedProducts, setOrderedProducts] = useState(products)
  const pageSize = 12
  const pageProducts = orderedProducts.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    const key = `sya-product-order:${storageKey}`
    const productsById = new Map(products.map((product) => [product.id, product]))
    let stored: StoredOrder | null = null

    try {
      stored = JSON.parse(sessionStorage.getItem(key) || "null")
    } catch {
      sessionStorage.removeItem(key)
    }

    const validOrder = stored && Date.now() - stored.createdAt < SESSION_TTL
      ? stored.ids.filter((id) => productsById.has(id))
      : []
    const missingIds = products
      .map((product) => product.id)
      .filter((id) => !validOrder.includes(id))
    const ids = validOrder.length === products.length
      ? validOrder
      : [...validOrder, ...shuffle(missingIds)]

    const nextOrder = ids
      .map((id) => productsById.get(id))
      .filter(Boolean) as HttpTypes.StoreProduct[]

    sessionStorage.setItem(key, JSON.stringify({ createdAt: stored?.createdAt || Date.now(), ids }))
    setOrderedProducts(nextOrder)
  }, [products, storageKey])

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {pageProducts.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} region={region} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination data-testid="product-pagination" page={page} totalPages={totalPages} />
      )}
      <div className="mt-12 flex justify-center w-full">
        <LocalizedClientLink
          href="/store"
          className="inline-flex items-center justify-center gap-x-2 px-6 py-2.5 border border-amber-500 text-amber-500 rounded-lg text-sm font-semibold hover:bg-amber-500 hover:text-black transition-colors duration-200"
        >
          Shop More
        </LocalizedClientLink>
      </div>
    </>
  )
}

export function ProductGridWithoutShuffle({
  products,
  region,
  page,
  totalPages,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  page: number
  totalPages: number
}) {
  const pageSize = 12
  const pageProducts = products.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {pageProducts.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} region={region} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination data-testid="product-pagination" page={page} totalPages={totalPages} />
      )}
      <div className="mt-12 flex justify-center w-full">
        <LocalizedClientLink
          href="/store"
          className="inline-flex items-center justify-center gap-x-2 px-6 py-2.5 border border-amber-500 text-amber-500 rounded-lg text-sm font-semibold hover:bg-amber-500 hover:text-black transition-colors duration-200"
        >
          Shop More
        </LocalizedClientLink>
      </div>
    </>
  )
}