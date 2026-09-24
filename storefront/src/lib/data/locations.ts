"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import { StoreLocation, DEFAULT_WAREHOUSE_LOCATION } from "@lib/util/delivery-estimate"

export type { StoreLocation }

export async function getStoreLocations(): Promise<{
  locations: StoreLocation[]
  default_location: StoreLocation
}> {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch<{
      locations?: StoreLocation[]
      default_location?: StoreLocation
    }>("/store/locations", {
      method: "GET",
      headers,
      cache: "no-store",
    })

    if (response?.locations && response.locations.length > 0) {
      return {
        locations: response.locations,
        default_location: response.default_location || response.locations[0],
      }
    }
  } catch (error) {
    // Fallback gracefully on any backend or network issue
    console.warn("Failed to fetch store locations from backend, using default Lusaka warehouse origin", error)
  }

  return {
    locations: [DEFAULT_WAREHOUSE_LOCATION],
    default_location: DEFAULT_WAREHOUSE_LOCATION,
  }
}
