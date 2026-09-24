/**
 * Yango Delivery Fee Engine & Google Distance Matrix with Haversine Fallback
 * Zambia / Lusaka Parameters:
 * - Base Fare: 30 ZMW (first 2 km)
 * - 8 ZMW / km beyond 2 km
 * - Minimum Fare: 35 ZMW
 * - Maximum Delivery Radius: 45 km
 * - Road Factor for Haversine: 1.35x
 */

export interface Coordinates {
  lat: number
  lng: number
}

export interface YangoBreakdown {
  base_fare: number
  base_distance_km: number
  distance_km: number
  extra_km: number
  per_km_rate: number
  extra_cost: number
  min_fare: number
  calculated_fare: number
  final_cost: number
  is_out_of_range: boolean
  max_radius_km: number
}

export interface DeliveryEstimateResult {
  distance_km: number
  duration_text: string
  duration_minutes: number
  yango_cost: number
  breakdown: YangoBreakdown
  is_out_of_range: boolean
  out_of_range_message?: string
  source: "google_matrix" | "haversine_fallback"
}

export const YANGO_RATES = {
  BASE_FARE: 30, // 30 ZMW covers initial 2 km
  BASE_DISTANCE_KM: 2, // First 2 km
  PER_KM_RATE: 8, // 8 ZMW per km beyond 2 km
  MIN_FARE: 35, // 35 ZMW minimum fare
  MAX_RADIUS_KM: 45, // 45 km delivery cutoff
  ROAD_FACTOR: 1.35, // Haversine straight-line to road distance multiplier
  AVG_CITY_SPEED_KMH: 26, // Lusaka average urban driving speed
}

export type StoreLocation = {
  id: string
  name: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  province: string
  postal_code: string
  country_code: string
  lat: number
  lng: number
  metadata?: Record<string, any>
}

export const DEFAULT_WAREHOUSE_LOCATION: StoreLocation = {
  id: "default_lusaka_warehouse",
  name: "Lusaka Central Warehouse",
  company: "SYA General Dealers LTD",
  address_1: "430B Lamasat Complex 2, Makeni-Bonaventure, Linda Road",
  address_2: "Plot No. F/687/A/1/A/8 Makeni Road, Lusaka, Zambia",
  city: "Lusaka",
  province: "Lusaka",
  postal_code: "10101",
  country_code: "zm",
  lat: -15.3875,
  lng: 28.3228,
}

export const LUSAKA_DEFAULT_ORIGIN: Coordinates = {
  lat: DEFAULT_WAREHOUSE_LOCATION.lat,
  lng: DEFAULT_WAREHOUSE_LOCATION.lng,
}

/**
 * Calculates Haversine Great-Circle distance adjusted by road curvature factor (1.35x).
 */
export function calculateHaversineDistance(
  origin: Coordinates,
  destination: Coordinates
): number {
  if (
    !Number.isFinite(origin.lat) ||
    !Number.isFinite(origin.lng) ||
    !Number.isFinite(destination.lat) ||
    !Number.isFinite(destination.lng)
  ) {
    return 0
  }

  const R = 6371 // Earth radius in km
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180
  const dLng = ((destination.lng - origin.lng) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
    Math.cos((destination.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const straightLineDistance = R * c

  // Apply road curvature factor
  const roadDistance = straightLineDistance * YANGO_RATES.ROAD_FACTOR
  return Number(roadDistance.toFixed(1))
}

/**
 * Formats duration from minutes to human-readable string (e.g. "18 mins" or "1 hr 15 mins")
 */
export function formatDuration(totalMinutes: number): string {
  const rounded = Math.max(1, Math.round(totalMinutes))
  if (rounded < 60) {
    return `${rounded} mins`
  }
  const hours = Math.floor(rounded / 60)
  const remainingMins = rounded % 60
  return remainingMins > 0 ? `${hours} hr ${remainingMins} mins` : `${hours} hr`
}

/**
 * Estimates driving duration based on Lusaka urban traffic metrics.
 */
export function estimateDrivingDuration(distanceKm: number): {
  minutes: number
  text: string
} {
  if (distanceKm <= 0) {
    return { minutes: 5, text: "5 mins" }
  }

  // Estimated driving time + 5 min dispatch/traffic handling buffer
  const drivingMinutes = (distanceKm / YANGO_RATES.AVG_CITY_SPEED_KMH) * 60
  const totalMinutes = Math.max(5, Math.round(drivingMinutes + 5))

  return {
    minutes: totalMinutes,
    text: formatDuration(totalMinutes),
  }
}

/**
 * Computes Yango delivery fare based on Zambia Lusaka pricing rules.
 */
export function computeYangoFee(distanceKm: number): {
  yango_cost: number
  breakdown: YangoBreakdown
  is_out_of_range: boolean
  out_of_range_message?: string
} {
  const safeDistance = Math.max(0, Number(distanceKm.toFixed(1)))
  const extraKm = Math.max(
    0,
    Number((safeDistance - YANGO_RATES.BASE_DISTANCE_KM).toFixed(2))
  )
  const extraCost = Math.round(extraKm * YANGO_RATES.PER_KM_RATE)
  const calculatedFare = YANGO_RATES.BASE_FARE + extraCost
  const finalCost = Math.max(YANGO_RATES.MIN_FARE, calculatedFare)
  const isOutOfRange = safeDistance > YANGO_RATES.MAX_RADIUS_KM

  const breakdown: YangoBreakdown = {
    base_fare: YANGO_RATES.BASE_FARE,
    base_distance_km: YANGO_RATES.BASE_DISTANCE_KM,
    distance_km: safeDistance,
    extra_km: Number(extraKm.toFixed(1)),
    per_km_rate: YANGO_RATES.PER_KM_RATE,
    extra_cost: extraCost,
    min_fare: YANGO_RATES.MIN_FARE,
    calculated_fare: calculatedFare,
    final_cost: finalCost,
    is_out_of_range: isOutOfRange,
    max_radius_km: YANGO_RATES.MAX_RADIUS_KM,
  }

  return {
    yango_cost: finalCost,
    breakdown,
    is_out_of_range: isOutOfRange,
    out_of_range_message: isOutOfRange
      ? `Delivery point is ${safeDistance} km away, exceeding our ${YANGO_RATES.MAX_RADIUS_KM} km maximum delivery radius. Please choose Store Pickup.`
      : undefined,
  }
}

/**
 * Query distance and duration via Google Maps JavaScript SDK DistanceMatrixService (Client-side)
 */
function getGoogleJsDistanceMatrix(
  origin: Coordinates,
  destination: Coordinates
): Promise<{ distance_km: number; duration_text: string; duration_minutes: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.google?.maps?.DistanceMatrixService) {
      return reject(new Error("Google Maps JS DistanceMatrixService not available"))
    }

    const service = new window.google.maps.DistanceMatrixService()
    service.getDistanceMatrix(
      {
        origins: [{ lat: origin.lat, lng: origin.lng }],
        destinations: [{ lat: destination.lat, lng: destination.lng }],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response: any, status: string) => {
        if (status === "OK" && response?.rows?.[0]?.elements?.[0]?.status === "OK") {
          const element = response.rows[0].elements[0]
          const meters = element.distance?.value || 0
          const seconds = element.duration?.value || 0

          const distanceKm = Number((meters / 1000).toFixed(1))
          const durationMinutes = Math.max(1, Math.round(seconds / 60))
          const durationText = element.duration?.text || formatDuration(durationMinutes)

          resolve({
            distance_km: distanceKm,
            duration_text: durationText,
            duration_minutes: durationMinutes,
          })
        } else {
          reject(new Error(`Distance Matrix returned status: ${status}`))
        }
      }
    )
  })
}

/**
 * Query distance and duration via Google Distance Matrix REST API (Server-side)
 */
async function fetchGoogleRestDistanceMatrix(
  origin: Coordinates,
  destination: Coordinates,
  apiKey: string
): Promise<{ distance_km: number; duration_text: string; duration_minutes: number }> {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=driving&units=metric&key=${apiKey}`

  const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) {
    throw new Error(`Google Distance Matrix HTTP Error: ${res.status}`)
  }

  const data = await res.json()
  if (data?.status === "OK" && data?.rows?.[0]?.elements?.[0]?.status === "OK") {
    const element = data.rows[0].elements[0]
    const meters = element.distance?.value || 0
    const seconds = element.duration?.value || 0

    const distanceKm = Number((meters / 1000).toFixed(1))
    const durationMinutes = Math.max(1, Math.round(seconds / 60))
    const durationText = element.duration?.text || formatDuration(durationMinutes)

    return {
      distance_km: distanceKm,
      duration_text: durationText,
      duration_minutes: durationMinutes,
    }
  }

  throw new Error(`Google Distance Matrix Data Status: ${data?.status}`)
}

/**
 * Main delivery estimate orchestrator.
 * Computes road distance, driving duration, and Yango fee with zero crash guarantee.
 */
export async function calculateDeliveryEstimate({
  origin = LUSAKA_DEFAULT_ORIGIN,
  destination,
  apiKey,
}: {
  origin?: Coordinates
  destination: Coordinates
  apiKey?: string
}): Promise<DeliveryEstimateResult> {
  // If destination coordinates are missing or zero, return safe Lusaka central defaults
  if (
    !destination ||
    (!destination.lat && !destination.lng) ||
    !Number.isFinite(destination.lat) ||
    !Number.isFinite(destination.lng)
  ) {
    const fallbackDist = 3.5
    const duration = estimateDrivingDuration(fallbackDist)
    const fee = computeYangoFee(fallbackDist)

    return {
      distance_km: fallbackDist,
      duration_text: duration.text,
      duration_minutes: duration.minutes,
      yango_cost: fee.yango_cost,
      breakdown: fee.breakdown,
      is_out_of_range: fee.is_out_of_range,
      out_of_range_message: fee.out_of_range_message,
      source: "haversine_fallback",
    }
  }

  // 1. Try Google Maps JS DistanceMatrixService (Browser)
  if (typeof window !== "undefined" && window.google?.maps?.DistanceMatrixService) {
    try {
      const result = await getGoogleJsDistanceMatrix(origin, destination)
      const fee = computeYangoFee(result.distance_km)

      return {
        distance_km: result.distance_km,
        duration_text: result.duration_text,
        duration_minutes: result.duration_minutes,
        yango_cost: fee.yango_cost,
        breakdown: fee.breakdown,
        is_out_of_range: fee.is_out_of_range,
        out_of_range_message: fee.out_of_range_message,
        source: "google_matrix",
      }
    } catch (e) {
      // Fall through to server REST or Haversine fallback
    }
  }

  // 2. Try Google Distance Matrix REST API if apiKey provided
  const resolvedApiKey =
    apiKey ||
    (typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
        process.env.GOOGLE_MAPS_API_KEY))

  if (resolvedApiKey) {
    try {
      const result = await fetchGoogleRestDistanceMatrix(
        origin,
        destination,
        resolvedApiKey
      )
      const fee = computeYangoFee(result.distance_km)

      return {
        distance_km: result.distance_km,
        duration_text: result.duration_text,
        duration_minutes: result.duration_minutes,
        yango_cost: fee.yango_cost,
        breakdown: fee.breakdown,
        is_out_of_range: fee.is_out_of_range,
        out_of_range_message: fee.out_of_range_message,
        source: "google_matrix",
      }
    } catch (e) {
      // Fall through to Haversine fallback
    }
  }

  // 3. Robust Haversine Fallback (1.35x road factor)
  const distanceKm = calculateHaversineDistance(origin, destination)
  const duration = estimateDrivingDuration(distanceKm)
  const fee = computeYangoFee(distanceKm)

  return {
    distance_km: distanceKm,
    duration_text: duration.text,
    duration_minutes: duration.minutes,
    yango_cost: fee.yango_cost,
    breakdown: fee.breakdown,
    is_out_of_range: fee.is_out_of_range,
    out_of_range_message: fee.out_of_range_message,
    source: "haversine_fallback",
  }
}
