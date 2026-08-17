"use server"

import { HttpTypes } from "@medusajs/types"

type CollectionListQuery = Record<string, string | number>

const getMedusaBackendUrl = () =>
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const getPublishableApiKey = () =>
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const fetchCollections = async <T,>(
  path: string,
  query: Record<string, string | number>,
  next: Record<string, unknown>
) => {
  const url = new URL(`${getMedusaBackendUrl()}${path}`)

  Object.entries(query).forEach(([key, value]) => {
    if (value == null || value === "") {
      return
    }

    url.searchParams.set(key, String(value))
  })

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getPublishableApiKey()
      ? {
          "x-publishable-api-key": getPublishableApiKey(),
        }
      : undefined,
    next,
    cache: "force-cache",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch collections: ${response.status}`)
  }

  return (await response.json()) as T
}

export const retrieveCollection = async (id: string) => {
  const { collection } = await fetchCollections<{
    collection: HttpTypes.StoreCollection
  }>(`/store/collections/${id}`, {}, { revalidate: 3600, tags: ["collections"] })

  return collection
}

export const listCollections = async (
  queryParams: CollectionListQuery = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const query = {
    limit: queryParams.limit ?? 100,
    offset: queryParams.offset ?? 0,
    ...queryParams,
  }

  const { collections, count } = await fetchCollections<{
    collections: HttpTypes.StoreCollection[]
    count: number
  }>("/store/collections", query, { revalidate: 3600, tags: ["collections"] })

  return { collections, count }
}

export const getCollectionsList = async (
  offset = 0,
  limit = 100
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  return listCollections({ offset, limit })
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection | null> => {
  const { collections } = await fetchCollections<HttpTypes.StoreCollectionListResponse>(
    "/store/collections",
    { handle, fields: "*products" },
    { revalidate: 3600, tags: ["collections"] }
  )

  return collections[0] || null
}

export const searchCollectionProductIds = async (query: string) => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return []

  const { collections } = await listCollections({
    limit: 100,
    fields: "*products",
  })

  return collections
    .filter(
      (collection) =>
        collection.title?.toLowerCase().includes(normalizedQuery) ||
        collection.handle?.toLowerCase().includes(normalizedQuery)
    )
    .flatMap((collection) => collection.products?.map((product) => product.id) ?? [])
}
