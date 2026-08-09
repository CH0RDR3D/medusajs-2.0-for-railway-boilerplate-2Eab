"use server"

import { HttpTypes } from "@medusajs/types"

const getMedusaBackendUrl = () =>
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const getPublishableApiKey = () =>
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const fetchRegions = async <T,>(path: string, revalidate = 3600) => {
  const response = await fetch(`${getMedusaBackendUrl()}${path}`, {
    method: "GET",
    headers: getPublishableApiKey()
      ? {
          "x-publishable-api-key": getPublishableApiKey(),
        }
      : undefined,
    cache: "force-cache",
    next: { revalidate, tags: ["regions"] },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch regions: ${response.status}`)
  }

  return (await response.json()) as T
}

export const listRegions = async () => {
  try {
    const { regions } = await fetchRegions<{ regions: HttpTypes.StoreRegion[] }>(
      "/store/regions"
    )

    return regions ?? []
  } catch {
    return []
  }
}

export const retrieveRegion = async (id: string) => {
  try {
    const { region } = await fetchRegions<{ region: HttpTypes.StoreRegion }>(
      `/store/regions/${id}`,
      3600
    )

    return region ?? null
  } catch {
    return null
  }
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
