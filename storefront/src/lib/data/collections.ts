"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

type CollectionListQuery = Record<string, string | number>

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  const { collection } = await sdk.client.fetch<{
    collection: HttpTypes.StoreCollection
  }>(`/store/collections/${id}`, {
    next,
    cache: "force-cache",
  })

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

  const { collections, count } = await sdk.client.fetch<{
    collections: HttpTypes.StoreCollection[]
    count: number
  }>("/store/collections", {
    query,
    next,
    cache: "force-cache",
  })

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

  const { collections } = await sdk.client.fetch<HttpTypes.StoreCollectionListResponse>(
    `/store/collections`,
    {
      query: { handle, fields: "*products" },
      next,
      cache: "force-cache",
    }
  )

  return collections[0] || null
}
