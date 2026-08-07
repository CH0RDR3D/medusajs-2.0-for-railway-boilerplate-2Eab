"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

export const listRegions = async () => {
  try {
    const { regions } = await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>(
      "/store/regions",
      {
        method: "GET",
        next: { revalidate: 3600, tags: ["regions"] },
        cache: "force-cache",
      }
    )

    return regions ?? []
  } catch {
    return []
  }
}

export const retrieveRegion = async (id: string) => {
  try {
    const { region } = await sdk.client.fetch<{ region: HttpTypes.StoreRegion }>(
      `/store/regions/${id}`,
      {
        method: "GET",
        next: { revalidate: 3600, tags: ["regions", `regions-${id}`] },
        cache: "force-cache",
      }
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
