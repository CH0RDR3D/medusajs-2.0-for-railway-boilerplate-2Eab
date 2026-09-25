import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  CreateFulfillmentResult,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
  ValidateFulfillmentDataContext,
} from "@medusajs/framework/types"

export type YangoEngineOptions = {
  base_fare?: number
  base_distance_km?: number
  per_km_rate?: number
  min_fare?: number
  max_radius_km?: number
  road_factor?: number
  api_key?: string
  warehouse_lat?: number
  warehouse_lng?: number
}

export type Coordinates = {
  lat: number
  lng: number
}

export function calculateHaversineDistance(
  origin: Coordinates,
  destination: Coordinates,
  roadFactor: number = 1.35
): number {
  if (
    !Number.isFinite(origin.lat) ||
    !Number.isFinite(origin.lng) ||
    !Number.isFinite(destination.lat) ||
    !Number.isFinite(destination.lng)
  ) {
    return 3.5
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
  const roadDistance = straightLineDistance * roadFactor

  return Number(roadDistance.toFixed(1))
}

export async function fetchGoogleDistanceMatrix(
  origin: Coordinates,
  destination: Coordinates,
  apiKey: string
): Promise<{ distance_km: number; duration_text?: string } | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=driving&units=metric&key=${apiKey}`

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) {
      return null
    }

    const data = (await res.json()) as any
    if (data?.status === "OK" && data?.rows?.[0]?.elements?.[0]?.status === "OK") {
      const element = data.rows[0].elements[0]
      const meters = element.distance?.value || 0
      const distanceKm = Number((meters / 1000).toFixed(1))
      return {
        distance_km: distanceKm,
        duration_text: element.duration?.text,
      }
    }
    return null
  } catch {
    return null
  }
}

export class YangoEngineService extends AbstractFulfillmentProviderService {
  static identifier = "yango-engine"

  protected options_: YangoEngineOptions
  protected logger_: any

  constructor(container: any, options: YangoEngineOptions = {}) {
    super()
    this.logger_ = container?.logger || console
    this.options_ = options
  }

  protected getBaseFare(): number {
    return (
      (process.env.YANGO_BASE_FARE ? Number(process.env.YANGO_BASE_FARE) : undefined) ??
      this.options_.base_fare ??
      30
    )
  }

  protected getBaseDistanceKm(): number {
    return (
      (process.env.YANGO_BASE_DISTANCE_KM
        ? Number(process.env.YANGO_BASE_DISTANCE_KM)
        : undefined) ??
      this.options_.base_distance_km ??
      2
    )
  }

  protected getPerKmRate(): number {
    return (
      (process.env.YANGO_PER_KM_RATE
        ? Number(process.env.YANGO_PER_KM_RATE)
        : undefined) ??
      this.options_.per_km_rate ??
      8
    )
  }

  protected getMinFare(): number {
    return (
      (process.env.YANGO_MIN_FARE ? Number(process.env.YANGO_MIN_FARE) : undefined) ??
      this.options_.min_fare ??
      35
    )
  }

  protected getMaxRadiusKm(): number {
    return (
      (process.env.YANGO_MAX_RADIUS_KM
        ? Number(process.env.YANGO_MAX_RADIUS_KM)
        : undefined) ??
      this.options_.max_radius_km ??
      45
    )
  }

  protected getRoadFactor(): number {
    return (
      (process.env.YANGO_ROAD_FACTOR
        ? Number(process.env.YANGO_ROAD_FACTOR)
        : undefined) ??
      this.options_.road_factor ??
      1.35
    )
  }

  protected getApiKey(): string | undefined {
    return (
      this.options_.api_key ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_DISTANCE_MATRIX_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    )
  }

  protected getWarehouseOrigin(): Coordinates {
    const lat =
      (process.env.WAREHOUSE_LAT ? Number(process.env.WAREHOUSE_LAT) : undefined) ??
      this.options_.warehouse_lat ??
      -15.488449898458102
    const lng =
      (process.env.WAREHOUSE_LNG ? Number(process.env.WAREHOUSE_LNG) : undefined) ??
      this.options_.warehouse_lng ??
      28.251956946590706
    return { lat, lng }
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      {
        id: "yango-express",
        name: "Yango Express Delivery",
      },
      {
        id: "store-pickup",
        name: "Store Pickup",
      },
      {
        id: "yango-express-return",
        is_return: true,
        name: "Yango Return Delivery",
      },
    ]
  }

  async validateFulfillmentData(
    _optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    _context: ValidateFulfillmentDataContext
  ): Promise<any> {
    return data
  }

  async validateOption(_data: Record<string, unknown>): Promise<boolean> {
    return true
  }

  async canCalculate(_data: any): Promise<boolean> {
    return true
  }

  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"],
    data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    const isPickup =
      optionData?.id === "store-pickup" ||
      data?.is_pickup === true ||
      (data as any)?.type === "pickup"

    if (isPickup) {
      return {
        calculated_amount: 0,
        is_calculated_price_tax_inclusive: true,
      }
    }

    const minFare = this.getMinFare()

    if (typeof (data as any)?.yango_cost === "number" && (data as any).yango_cost > 0) {
      const finalCost = Math.max(minFare, (data as any).yango_cost)
      return {
        calculated_amount: finalCost,
        is_calculated_price_tax_inclusive: true,
      }
    }

    // Resolve origin coordinates
    let origin: Coordinates = this.getWarehouseOrigin()
    if (context?.from_location?.address) {
      const fromAddr = context.from_location.address as any
      if (
        typeof fromAddr.metadata?.lat === "number" &&
        typeof fromAddr.metadata?.lng === "number"
      ) {
        origin = {
          lat: fromAddr.metadata.lat,
          lng: fromAddr.metadata.lng,
        }
      }
    }

    // Resolve destination coordinates
    let destination: Coordinates | null = null

    if (
      typeof (data as any)?.lat === "number" &&
      typeof (data as any)?.lng === "number"
    ) {
      destination = {
        lat: (data as any).lat,
        lng: (data as any).lng,
      }
    } else if (
      (data as any)?.location &&
      typeof (data as any).location.lat === "number" &&
      typeof (data as any).location.lng === "number"
    ) {
      destination = {
        lat: (data as any).location.lat,
        lng: (data as any).location.lng,
      }
    } else if (
      typeof (context as any)?.shipping_address?.metadata?.lat === "number" &&
      typeof (context as any)?.shipping_address?.metadata?.lng === "number"
    ) {
      destination = {
        lat: (context as any).shipping_address.metadata.lat,
        lng: (context as any).shipping_address.metadata.lng,
      }
    } else if (
      typeof (context as any)?.cart?.metadata?.lat === "number" &&
      typeof (context as any)?.cart?.metadata?.lng === "number"
    ) {
      destination = {
        lat: Number((context as any).cart.metadata.lat),
        lng: Number((context as any).cart.metadata.lng),
      }
    }

    let distanceKm: number = 3.5 // Default Lusaka urban distance fallback

    if (typeof (data as any)?.distance_km === "number" && (data as any).distance_km > 0) {
      distanceKm = Number((data as any).distance_km.toFixed(1))
    } else if (destination) {
      const apiKey = this.getApiKey()
      if (apiKey) {
        const matrixResult = await fetchGoogleDistanceMatrix(origin, destination, apiKey)
        if (matrixResult && matrixResult.distance_km > 0) {
          distanceKm = matrixResult.distance_km
        } else {
          // Haversine fallback with road factor
          distanceKm = calculateHaversineDistance(origin, destination, this.getRoadFactor())
        }
      } else {
        // Haversine fallback with road factor
        distanceKm = calculateHaversineDistance(origin, destination, this.getRoadFactor())
      }
    }

    // Fee calculation logic
    const baseFare = this.getBaseFare()
    const baseDist = this.getBaseDistanceKm()
    const perKmRate = this.getPerKmRate()
    const maxRadius = this.getMaxRadiusKm()

    const extraKm = Math.max(0, Number((distanceKm - baseDist).toFixed(2)))
    const extraCost = Math.round(extraKm * perKmRate)
    const calculatedFare = baseFare + extraCost
    const finalCost = Math.max(minFare, calculatedFare)

    if (distanceKm > maxRadius) {
      this.logger_.warn?.(
        `[YangoEngine] Delivery destination (${distanceKm} km) exceeds maximum radius (${maxRadius} km).`
      )
    }

    return {
      calculated_amount: finalCost,
      is_calculated_price_tax_inclusive: true,
    }
  }

  async createFulfillment(
    data: Record<string, unknown>,
    _items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    _order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {
    return {
      data: {
        ...(((fulfillment as any)?.data as object) || {}),
        ...data,
        provider: "yango-engine",
        status: "ready_for_dispatch",
      },
      labels: [],
    }
  }

  async cancelFulfillment(_data: Record<string, unknown>): Promise<any> {
    return { status: "canceled" }
  }

  async createReturnFulfillment(
    fulfillment: Record<string, unknown>
  ): Promise<CreateFulfillmentResult> {
    return {
      data: {
        ...(((fulfillment as any)?.data as object) || {}),
        provider: "yango-engine",
        type: "return",
      },
      labels: [],
    }
  }
}

export default YangoEngineService
