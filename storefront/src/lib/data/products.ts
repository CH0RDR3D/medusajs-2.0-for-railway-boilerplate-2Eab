import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getRegion } from "./regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { sortProducts } from "@lib/util/sort-products"

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const productTags = (product: HttpTypes.StoreProduct): string[] => {
  const tags = (product as any).tags?.map((t: any) => t?.value || t?.name) || []
  const virtual = [
    (product as any).collection?.title,
    (product as any).type?.value,
  ].filter(Boolean)

  return [...new Set([...tags, ...virtual].filter(Boolean).map((t: string) => slugify(t)))]
}

const productCategories = (product: HttpTypes.StoreProduct): string[] => {
  const categories = (product as any).categories?.map((c: any) => c?.name || c?.handle) || []
  const virtual = [(product as any).type?.value].filter(Boolean)

  return [...new Set([...categories, ...virtual].filter(Boolean).map((c: string) => slugify(c)))]
}

export const getProductFacets = cache(async function ({
  countryCode,
  ids,
}: {
  countryCode: string
  ids?: string[]
}) {
  const {
    response: { products },
  } = await getProductsList({
    pageParam: 1,
    queryParams: {
      limit: 100,
      ...(ids?.length ? { id: ids } : {}),
    },
    countryCode,
  })

  const tagSet = new Set<string>()
  const categorySet = new Set<string>()

  products.forEach((product) => {
    productTags(product).forEach((tag) => tagSet.add(tag))
    productCategories(product).forEach((category) => categorySet.add(category))
  })

  return {
    tags: [...tagSet].sort(),
    categories: [...categorySet].sort(),
  }
})

export const getProductsById = cache(async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields: "*variants.calculated_price,+variants.inventory_quantity",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products)
})

export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
) {
  return sdk.store.product
    .list(
      {
        handle,
        region_id: regionId,
        fields: "*variants.calculated_price,+variants.inventory_quantity",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products[0])
})

export const getProductsList = cache(async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12
  const validPageParam = Math.max(pageParam, 1);
  const offset = (validPageParam - 1) * limit
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }
  return sdk.store.product
    .list(
      {
        limit,
        offset,
        region_id: region.id,
        fields: "*variants.calculated_price,*tags,*categories,*collection,*type",
        ...queryParams,
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
})

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const getProductsListWithSort = cache(async function ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  tag,
  category,
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  tag?: string
  category?: string
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await getProductsList({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const filteredProducts = sortedProducts.filter((product) => {
    const tagMatch = tag ? productTags(product).includes(slugify(tag)) : true
    const categoryMatch = category
      ? productCategories(product).includes(slugify(category))
      : true

    return tagMatch && categoryMatch
  })

  const pageParam = (page - 1) * limit

  const filteredCount = filteredProducts.length
  const nextPage = filteredCount > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = filteredProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
})

const dailyHash = (input: string) => {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export const getDailyCuratedProductIds = cache(async function ({
  countryCode,
  kind,
}: {
  countryCode: string
  kind: "editors-pick" | "todays-deals"
}) {
  const {
    response: { products },
  } = await getProductsList({
    pageParam: 1,
    queryParams: {
      limit: 100,
    },
    countryCode,
  })

  const dayKey = Math.floor(Date.now() / (1000 * 60 * 60 * 24))

  const dealCandidates =
    kind === "todays-deals"
      ? products.filter((product) =>
          (product.variants || []).some((variant: any) => {
            const calculated = variant?.calculated_price?.calculated_amount
            const original = variant?.calculated_price?.original_amount
            return Number.isFinite(calculated) && Number.isFinite(original) && calculated < original
          })
        )
      : products

  const ranked = dealCandidates
    .map((product) => {
      const trendScore = dailyHash(`${dayKey}-${product.id}`)
      return {
        id: product.id,
        score: trendScore,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)

  return ranked.map((entry) => entry.id).filter((id): id is string => Boolean(id))
})
