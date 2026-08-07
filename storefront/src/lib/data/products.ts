"use server"

import {
  getDailyCuratedProducts,
  getDailyDealsProducts,
} from "@lib/util/curated-products"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getRegion, retrieveRegion } from "./regions"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const buildStoreHeaders = () => {
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  return publishableKey
    ? { "x-publishable-api-key": publishableKey }
    : undefined
}

const appendQuery = (
  params: URLSearchParams,
  key: string,
  value: unknown
) => {
  if (value === undefined || value === null || value === "") {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendQuery(params, key, item))
    return
  }

  params.append(key, String(value))
}

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
  option_value_id?: string | string[]
}

/**
 * Fetch a paginated list of products from Medusa.
 *
 * IMPORTANT: min_price, max_price, and q are NOT supported by the Medusa v2
 * /store/products endpoint. They are stripped from queryParams before the
 * request is sent to the backend and must be applied client/server-side after
 * the products are returned.
 */
export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const defaultRegionCode = process.env.NEXT_PUBLIC_DEFAULT_REGION || "zm"
  const targetCountryCode = countryCode || (!regionId ? defaultRegionCode : undefined)

  if (!targetCountryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (targetCountryCode) {
    region = await getRegion(targetCountryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  // Strip params unsupported by Medusa v2 /store/products before sending
  const {
    min_price: _min,
    max_price: _max,
    q: _q,
    ...backendQueryParams
  } = (queryParams || {}) as any

  const params = new URLSearchParams()
  appendQuery(params, "limit", limit)
  appendQuery(params, "offset", offset)
  appendQuery(params, "region_id", region.id)
  appendQuery(
    params,
    "fields",
    "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,*variants.prices"
  )

  Object.entries(backendQueryParams).forEach(([key, value]) => {
    appendQuery(params, key, value)
  })

  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products?${params.toString()}`, {
    method: "GET",
    headers: buildStoreHeaders(),
    next: { revalidate: 300, tags: ["products"] },
    cache: "force-cache",
  })

  if (!response.ok) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams,
    }
  }

  const data = (await response.json()) as {
    products?: HttpTypes.StoreProduct[]
    count?: number
  }

  const products = data.products ?? []
  const count = data.count ?? 0
  const nextPage = count > offset + limit ? pageParam + 1 : null

  return {
    response: {
      products,
      count,
    },
    nextPage,
    queryParams,
  }
}

/**
 * Fetch up to 100 products, apply search + price-range filtering in-process,
 * sort, then paginate — all on the server (Next.js Server Action).
 *
 * Price comparison uses variant.calculated_price.calculated_amount (set when
 * region_id is sent to the backend) with a fallback to variant.prices matched
 * by region_id or currency_code.
 */
export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionValueIds,
  q,
  tag,
  category,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
  q?: string
  tag?: string
  category?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const optionFilters = Array.from(
    new Set((optionValueIds || []).filter(Boolean))
  )

  // Resolve the region so we can match prices by region_id / currency_code
  const region = await getRegion(countryCode)

  const {
    response: { products },
  } = await listProducts({
    pageParam: 1,
    queryParams: {
      ...queryParams,
      ...(optionFilters.length ? { option_value_id: optionFilters } : {}),
      limit: 100,
    },
    countryCode,
  })

  let filtered = products

  // ── Search filter ────────────────────────────────────────────────────────────
  const search = (q || (queryParams as any)?.q || "").trim().toLowerCase()
  if (search) {
    filtered = filtered.filter((p) => {
      return (
        p.title?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.subtitle?.toLowerCase().includes(search) ||
        p.handle?.toLowerCase().includes(search) ||
        p.collection?.title?.toLowerCase().includes(search) ||
        p.tags?.some((t) => t.value?.toLowerCase().includes(search)) ||
        p.categories?.some((c) => c.name?.toLowerCase().includes(search))
      )
    })
  }

  const normalizedTag = tag?.trim().toLowerCase()
  if (normalizedTag) {
    filtered = filtered.filter((product) =>
      product.tags?.some(
        (productTag) => productTag.value?.trim().toLowerCase() === normalizedTag
      )
    )
  }

  const normalizedCategory = category?.trim().toLowerCase()
  if (normalizedCategory) {
    filtered = filtered.filter((product) =>
      product.categories?.some((productCategory) => {
        const handle = productCategory.handle?.trim().toLowerCase()
        const name = productCategory.name?.trim().toLowerCase()

        return handle === normalizedCategory || name === normalizedCategory
      })
    )
  }

  // ── Price range filter ───────────────────────────────────────────────────────
  // min_price / max_price are expressed in the region's currency unit (e.g. ZMW).
  // The calculated_amount returned by Medusa is already in that unit when
  // region_id is included in the request.
  const rawMin = (queryParams as any)?.min_price
  const rawMax = (queryParams as any)?.max_price
  const minPrice = rawMin != null && rawMin !== "" ? Number(rawMin) : null
  const maxPrice = rawMax != null && rawMax !== "" ? Number(rawMax) : null

  if (minPrice !== null || maxPrice !== null) {
    filtered = filtered.filter((p) => {
      // Collect all numeric prices for this product's variants in the active region
      const variantPrices: number[] = (p.variants || []).flatMap((v) => {
        const calc = (v as any)?.calculated_price?.calculated_amount
        if (typeof calc === "number") return [calc]

        // Fallback: match against variant.prices by region or currency
        const prices: any[] = (v as any)?.prices ?? []
        const match = prices.find(
          (pr) =>
            pr.region_id === region?.id ||
            pr.currency_code?.toLowerCase() === region?.currency_code?.toLowerCase()
        )
        return typeof match?.amount === "number" ? [match.amount] : []
      })

      // Products with no resolvable price are included (conservative default)
      if (variantPrices.length === 0) return true

      // Compare the cheapest variant price against the requested range
      const cheapest = Math.min(...variantPrices)
      if (minPrice !== null && cheapest < minPrice) return false
      if (maxPrice !== null && cheapest > maxPrice) return false
      return true
    })
  }

  // ── Sort & paginate ──────────────────────────────────────────────────────────
  const sortedProducts = sortProducts(filtered, sortBy)

  const safePage = Math.max(page, 1)
  const offset = (safePage - 1) * limit
  const filteredCount = sortedProducts.length
  const nextPage = filteredCount > offset + limit ? safePage + 1 : null
  const paginatedProducts = sortedProducts.slice(offset, offset + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}

export const getProductsList = listProducts

export const getProductsListWithSort = listProductsWithSort

export const getProductByHandle = async (
  handle: string,
  regionId: string
): Promise<HttpTypes.StoreProduct | null> => {
  const params = new URLSearchParams()
  appendQuery(params, "handle", handle)
  appendQuery(params, "region_id", regionId)
  appendQuery(params, "limit", 1)
  appendQuery(
    params,
    "fields",
    "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,*variants.prices,*collection,*categories,*images"
  )

  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products?${params.toString()}`, {
    method: "GET",
    headers: buildStoreHeaders(),
    next: { revalidate: 300, tags: ["products"] },
    cache: "force-cache",
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as {
    products?: HttpTypes.StoreProduct[]
  }

  const products = data.products ?? []

  return products[0] ?? null
}

export const getProductsById = async ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}): Promise<HttpTypes.StoreProduct[]> => {
  if (!ids.length) {
    return []
  }

  const { response } = await listProducts({
    regionId,
    queryParams: {
      id: ids,
      limit: ids.length,
    },
  })

  const productsById = new Map(response.products.map((product) => [product.id, product]))

  return ids
    .map((id) => productsById.get(id))
    .filter(Boolean) as HttpTypes.StoreProduct[]
}

export const getProductFacets = async ({
  countryCode,
  ids,
}: {
  countryCode: string
  ids?: string[]
}) => {
  const { response } = await listProducts({
    countryCode,
    queryParams: {
      limit: ids?.length ? Math.max(ids.length, 12) : 100,
      ...(ids?.length ? { id: ids } : {}),
    },
  })

  const tags = Array.from(
    new Set(
      response.products
        .flatMap((product) => product.tags?.map((tag) => tag.value?.trim()) ?? [])
        .filter(Boolean)
    )
  ) as string[]

  const categories = Array.from(
    new Set(
      response.products
        .flatMap(
          (product) =>
            product.categories?.map((category) => category.handle?.trim()) ?? []
        )
        .filter(Boolean)
    )
  ) as string[]

  return {
    tags,
    categories,
  }
}

export const getDailyCuratedProductIds = async ({
  countryCode,
  kind,
  count = 12,
}: {
  countryCode: string
  kind: "editors-pick" | "todays-deals"
  count?: number
}) => {
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: 100,
    },
  })

  const curatedProducts =
    kind === "todays-deals"
      ? getDailyDealsProducts(products, count)
      : getDailyCuratedProducts(products, count, kind)

  return curatedProducts.map((product) => product.id).filter(Boolean) as string[]
}
