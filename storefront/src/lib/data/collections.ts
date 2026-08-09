"use server"

import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

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
  const next = {
    ...(await getCacheOptions("collections")),
  }

  const { collection } = await fetchCollections<{
    collection: HttpTypes.StoreCollection
  }>(`/store/collections/${id}`, {}, next)

  return collection
}

export const listCollections = async (
  queryParams: CollectionListQuery = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  const query = {
    limit: queryParams.limit ?? 100,
    offset: queryParams.offset ?? 0,
    ...queryParams,
  }

  const { collections, count } = await fetchCollections<{
    collections: HttpTypes.StoreCollection[]
    count: number
  }>("/store/collections", query, next)

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
  const next = {
    ...(await getCacheOptions("collections")),
  }

  const { collections } = await fetchCollections<HttpTypes.StoreCollectionListResponse>(
    "/store/collections",
    { handle, fields: "*products" },
    next
  )

  return collections[0] || null
}
