"use server"

import { HttpTypes } from "@medusajs/types"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const getStoreHeaders = () => {
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  return publishableKey
    ? { "x-publishable-api-key": publishableKey }
    : undefined
}

export const listRegions = async () => {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/regions`, {
    method: "GET",
    headers: getStoreHeaders(),
    next: { revalidate: 3600, tags: ["regions"] },
    cache: "force-cache",
  })

  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as { regions?: HttpTypes.StoreRegion[] }

  return data.regions ?? []
}

export const retrieveRegion = async (id: string) => {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/regions/${id}`, {
    method: "GET",
    headers: getStoreHeaders(),
    next: { revalidate: 3600, tags: ["regions", `regions-${id}`] },
    cache: "force-cache",
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as { region?: HttpTypes.StoreRegion }

  return data.region ?? null
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  if (regionMap.has(countryCode)) {
    return regionMap.get(countryCode)
  }

  const regions = await listRegions()

  if (!regions) {
    return null
  }

  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      regionMap.set(c?.iso_2 ?? "", region)
    })
  })

  const defaultCode = process.env.NEXT_PUBLIC_DEFAULT_REGION || "zm"

  const region = countryCode
    ? regionMap.get(countryCode) || regionMap.get(defaultCode) || regions[0]
    : regionMap.get(defaultCode) || regions[0]

  return region
}
