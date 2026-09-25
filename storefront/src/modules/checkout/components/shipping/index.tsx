"use client"

import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import Radio from "@modules/common/components/radio"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { setDeliveryDetails, setShippingMethod } from "@lib/data/cart"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { getStoreLocations } from "@lib/data/locations"
import {
  calculateDeliveryEstimate,
  computeYangoFee,
  estimateDrivingDuration,
  DeliveryEstimateResult,
  StoreLocation,
  DEFAULT_WAREHOUSE_LOCATION,
  LUSAKA_DEFAULT_ORIGIN,
  YANGO_RATES,
} from "@lib/util/delivery-estimate"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import LocationMap from "../location-map"
import Input from "@modules/common/components/input"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery")
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [warehouse, setWarehouse] = useState<StoreLocation>(DEFAULT_WAREHOUSE_LOCATION)
  const [estimate, setEstimate] = useState<DeliveryEstimateResult | null>(null)
  const [pickupDistanceInfo, setPickupDistanceInfo] = useState<{ distance_km: number; duration_text: string } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingMode, setIsSavingMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationConfirmed, setLocationConfirmed] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [manualAddress, setManualAddress] = useState({
    address_1: "",
    city: "",
    province: "",
    postal_code: "",
  })

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"
  const isPickupInMeta = Boolean((cart.metadata as any)?.is_pickup)
  const hasShippingMethod = (cart.shipping_methods?.length ?? 0) > 0
  const deliveryStepCompleted = isPickupInMeta || hasShippingMethod

  // Load warehouse locations on mount
  useEffect(() => {
    getStoreLocations().then((res) => {
      if (res.default_location) {
        setWarehouse(res.default_location)
      }
    })
  }, [])

  // Memoized warehouse object for location map stability
  const memoizedWarehouseLocation = useMemo(
    () => ({
      lat: warehouse.lat,
      lng: warehouse.lng,
      name: warehouse.name,
      address: warehouse.address_1,
    }),
    [warehouse.lat, warehouse.lng, warehouse.name, warehouse.address_1]
  )

  // Check if option is pickup
  const isPickupOption = useCallback((o: HttpTypes.StoreCartShippingOption) => {
    const typeCode = (o as any).type?.code?.toLowerCase()
    if (typeCode) {
      return (
        typeCode === "pickup" ||
        typeCode === "store_pickup" ||
        typeCode === "collect" ||
        typeCode === "collection"
      )
    }
    const name = o.name?.toLowerCase() || ""
    return Boolean(
      name.includes("pickup") ||
      name.includes("pick up") ||
      name.includes("pick-up") ||
      name.includes("store") ||
      name.includes("collect") ||
      name.includes("collection") ||
      o.amount === 0
    )
  }, [])

  // Filter options based on mode
  const modeShippingMethods = availableShippingMethods?.filter((o) =>
    deliveryMethod === "pickup" ? isPickupOption(o) : !isPickupOption(o)
  )

  const selectedShippingMethod = modeShippingMethods?.find(
    (method) => method.id === cart.shipping_methods?.at(-1)?.shipping_option_id
  ) || (deliveryMethod === "pickup" ? cart.shipping_methods?.at(-1) : undefined)

  // Real-time delivery estimate calculation with coordinate deduplication
  const lastEstimateCoordsRef = useRef<{ lat: number; lng: number } | null>(null)

  const updateDeliveryEstimate = useCallback(
    async (coords: { lat: number; lng: number }, force = false) => {
      if (!force && lastEstimateCoordsRef.current) {
        const prev = lastEstimateCoordsRef.current
        if (
          Math.abs(prev.lat - coords.lat) < 0.0001 &&
          Math.abs(prev.lng - coords.lng) < 0.0001
        ) {
          return
        }
      }
      lastEstimateCoordsRef.current = coords

      setIsCalculating(true)
      try {
        const est = await calculateDeliveryEstimate({
          origin: { lat: warehouse.lat, lng: warehouse.lng },
          destination: coords,
          apiKey: mapsKey,
        })
        setEstimate(est)

        // Also compute user-to-store distance for pickup card reference
        setPickupDistanceInfo({
          distance_km: est.distance_km,
          duration_text: est.duration_text,
        })
      } catch (err) {
        // Fallback calculation
        const fee = computeYangoFee(3.5)
        const dur = estimateDrivingDuration(3.5)
        setEstimate({
          distance_km: 3.5,
          duration_text: dur.text,
          duration_minutes: dur.minutes,
          yango_cost: fee.yango_cost,
          breakdown: fee.breakdown,
          is_out_of_range: false,
          source: "haversine_fallback",
        })
      } finally {
        setIsCalculating(false)
      }
    },
    [mapsKey, warehouse.lat, warehouse.lng]
  )

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const setMethod = async (id: string) => {
    setIsLoading(true)
    const payloadData =
      deliveryMethod === "pickup"
        ? { is_pickup: true }
        : {
            distance_km: estimate?.distance_km ?? 3.5,
            yango_cost: estimate?.yango_cost ?? 35,
            lat: deliveryLocation?.lat,
            lng: deliveryLocation?.lng,
            breakdown: estimate?.breakdown,
          }
    const res = await setShippingMethod({
      cartId: cart.id,
      shippingMethodId: id,
      data: payloadData,
    })
    if (res && "error" in res && res.error) {
      setError(res.error)
    }
    setIsLoading(false)
  }

  const setDeliveryMode = async (mode: "delivery" | "pickup") => {
    setDeliveryMethod(mode)
    setError(null)

    if (typeof window !== "undefined") {
      sessionStorage.setItem("store_pickup_selected", String(mode === "pickup"))
      sessionStorage.setItem("checkout_location_confirmed", String(mode === "pickup"))
    }

    if (mode === "pickup") {
      setLocationConfirmed(true)
      setIsSavingMode(true)

      const detailsRes = await setDeliveryDetails({
        isPickup: true,
        distance_km: 0,
        duration_text: "Ready in 1-2 hours",
        yango_cost: 0,
        breakdown: {
          base_fare: 0,
          final_cost: 0,
          is_out_of_range: false,
        },
        warehouseLocation: {
          lat: warehouse.lat,
          lng: warehouse.lng,
          name: warehouse.name,
          address_1: warehouse.address_1,
          city: warehouse.city,
        },
      })

      if (detailsRes && "error" in detailsRes && detailsRes.error) {
        setError(detailsRes.error)
        setIsSavingMode(false)
        return
      }

      // Automatically select pickup or free shipping option
      let pickupOption = availableShippingMethods?.find(isPickupOption)
      if (!pickupOption) {
        const freshOptions = await listCartShippingMethods(cart.id, true)
        pickupOption =
          freshOptions?.find(isPickupOption) ||
          freshOptions?.find((o) => o.amount === 0) ||
          freshOptions?.[0]
      }

      if (!pickupOption && availableShippingMethods && availableShippingMethods.length > 0) {
        pickupOption =
          availableShippingMethods.find((o) => o.amount === 0) ||
          availableShippingMethods[0]
      }

      if (pickupOption) {
        await setShippingMethod({
          cartId: cart.id,
          shippingMethodId: pickupOption.id,
          data: { is_pickup: true },
        })
      }

      setIsSavingMode(false)
      return
    }

    // Delivery mode
    const hasConfirmedLocation =
      typeof window !== "undefined" &&
      sessionStorage.getItem("checkout_location_confirmed") === "true"
    setLocationConfirmed(hasConfirmedLocation)

    if (deliveryLocation) {
      updateDeliveryEstimate(deliveryLocation, true)
    }
  }

  // Location resolved by map
  const onResolveLocation = useCallback(
    async (
      location: { lat: number; lng: number },
      address: {
        address_1: string
        city: string
        province: string
        postalCode: string
        countryCode: string
      },
      deviceLocation: { lat: number; lng: number } | null
    ) => {
      setDeliveryLocation(location)

      if (typeof window !== "undefined") {
        sessionStorage.setItem("checkout_location_confirmed", "true")
        sessionStorage.setItem("checkout_location_lat", String(location.lat))
        sessionStorage.setItem("checkout_location_lng", String(location.lng))
      }

      setLocationConfirmed(true)
      setIsSavingMode(true)

      // Calculate fee & distance
      const est = await calculateDeliveryEstimate({
        origin: { lat: warehouse.lat, lng: warehouse.lng },
        destination: location,
        apiKey: mapsKey,
      })
      setEstimate(est)

      // Persist delivery details & metadata in Medusa Cart
      const res = await setDeliveryDetails({
        isPickup: false,
        location,
        deviceLocation: deviceLocation ?? undefined,
        address: {
          address_1: address.address_1,
          city: address.city,
          province: address.province,
          postal_code: address.postalCode,
          country_code: address.countryCode,
        },
        distance_km: est.distance_km,
        duration_text: est.duration_text,
        yango_cost: est.yango_cost,
        breakdown: est.breakdown,
        warehouseLocation: {
          lat: warehouse.lat,
          lng: warehouse.lng,
          name: warehouse.name,
          address_1: warehouse.address_1,
          city: warehouse.city,
        },
      })

      if (res && "error" in res && res.error) {
        setError(res.error)
      }

      // Auto-assign delivery shipping method if available
      if (modeShippingMethods && modeShippingMethods.length > 0) {
        const methodId = selectedShippingMethod?.id || modeShippingMethods[0].id
        await setShippingMethod({
          cartId: cart.id,
          shippingMethodId: methodId,
          data: {
            distance_km: est.distance_km,
            yango_cost: est.yango_cost,
            lat: location.lat,
            lng: location.lng,
            breakdown: est.breakdown,
          },
        })
      }

      setIsSavingMode(false)
    },
    [cart.id, mapsKey, modeShippingMethods, selectedShippingMethod, warehouse]
  )

  // Live pin drag feedback
  const onPinDrag = useCallback(
    (coords: { lat: number; lng: number }) => {
      setDeliveryLocation(coords)
      updateDeliveryEstimate(coords)
    },
    [updateDeliveryEstimate]
  )

  const submitManualAddress = async () => {
    if (!manualAddress.address_1 || !manualAddress.city) {
      setError("Please enter at least a street address and city")
      return
    }

    const fallbackLocation = { lat: -15.488449898458102, lng: 28.251956946590706 }
    setError(null)
    await onResolveLocation(
      fallbackLocation,
      {
        address_1: manualAddress.address_1,
        city: manualAddress.city,
        province: manualAddress.province,
        postalCode: manualAddress.postal_code,
        countryCode: cart.region?.countries?.[0]?.iso_2 || "zm",
      },
      null
    )
  }

  const handleSubmit = async () => {
    if (deliveryMethod === "delivery" && estimate?.is_out_of_range) {
      setError(`Delivery point is ${estimate.distance_km} km away, exceeding maximum 45 km radius. Please switch to Store Pickup.`)
      return
    }

    if (deliveryMethod === "delivery" && modeShippingMethods && modeShippingMethods.length > 0) {
      const methodId = selectedShippingMethod?.id || modeShippingMethods[0].id
      await setShippingMethod({
        cartId: cart.id,
        shippingMethodId: methodId,
        data: {
          distance_km: estimate?.distance_km ?? 3.5,
          yango_cost: estimate?.yango_cost ?? 35,
          lat: deliveryLocation?.lat,
          lng: deliveryLocation?.lng,
          breakdown: estimate?.breakdown,
        },
      })
    }

    router.push(pathname + "?step=payment", { scroll: false })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  // Sync initial state from sessionStorage / cart metadata
  useEffect(() => {
    if (typeof window === "undefined") {
      setLocationConfirmed(Boolean(cart?.shipping_address?.address_1))
      return
    }

    const isPickup = sessionStorage.getItem("store_pickup_selected") === "true" || Boolean((cart?.metadata as any)?.is_pickup)
    setDeliveryMethod(isPickup ? "pickup" : "delivery")

    const savedLat = Number(sessionStorage.getItem("checkout_location_lat") || (cart?.metadata as any)?.lat)
    const savedLng = Number(sessionStorage.getItem("checkout_location_lng") || (cart?.metadata as any)?.lng)

    if (Number.isFinite(savedLat) && Number.isFinite(savedLng) && savedLat !== 0) {
      const coords = { lat: savedLat, lng: savedLng }
      setDeliveryLocation(coords)
      updateDeliveryEstimate(coords, true)
    } else {
      updateDeliveryEstimate(LUSAKA_DEFAULT_ORIGIN, true)
    }

    if (isPickup) {
      setLocationConfirmed(true)
      return
    }

    const hasConfirmedLocation =
      sessionStorage.getItem("checkout_location_confirmed") === "true" ||
      Boolean(cart?.shipping_address?.address_1)

    setLocationConfirmed(hasConfirmedLocation)
  }, [cart?.metadata, cart?.shipping_address?.address_1, updateDeliveryEstimate])

  const currencyCode = cart?.currency_code || "ZMW"
  const isOutOfRange = Boolean(estimate?.is_out_of_range && deliveryMethod === "delivery")

  return (
    <div className="bg-[var(--surface-card)] rounded-2xl p-4 sm:p-6 border border-[var(--surface-border)]">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline font-semibold",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !deliveryStepCompleted,
            }
          )}
        >
          Delivery & Shipping
          {!isOpen && deliveryStepCompleted && (
            <CheckCircleSolid className="text-emerald-600 inline ml-2" />
          )}
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.email && (
            <Text>
              <button
                onClick={handleEdit}
                className="text-ui-fg-interactive font-medium hover:underline text-sm"
                data-testid="edit-delivery-button"
              >
                Edit
              </button>
            </Text>
          )}
      </div>

      {isOpen ? (
        <div data-testid="delivery-options-container" className="space-y-6">
          {/* Delivery Method Selector */}
          <div>
            <Text className="txt-medium-plus text-ui-fg-base mb-3 font-medium">
              Choose Fulfillment Method
            </Text>
            <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMode("delivery")}
                className={clx(
                  "flex items-start gap-x-3 rounded-xl border p-4 text-left transition-all",
                  deliveryMethod === "delivery"
                    ? "border-ui-border-interactive bg-ui-bg-interactive/5 ring-1 ring-ui-border-interactive"
                    : "border-ui-border-base hover:border-ui-border-strong bg-ui-bg-subtle/30"
                )}
                data-testid="delivery-method-option-delivery"
              >
                <Radio checked={deliveryMethod === "delivery"} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-base-semi font-semibold text-ui-fg-base">
                      🚗 Yango Express Delivery
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      Live Fare
                    </span>
                  </div>
                  <Text className="text-xs text-ui-fg-subtle mt-1">
                    Direct doorstep delivery computed live from Lusaka Hub.
                  </Text>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMode("pickup")}
                className={clx(
                  "flex items-start gap-x-3 rounded-xl border p-4 text-left transition-all",
                  deliveryMethod === "pickup"
                    ? "border-ui-border-interactive bg-ui-bg-interactive/5 ring-1 ring-ui-border-interactive"
                    : "border-ui-border-base hover:border-ui-border-strong bg-ui-bg-subtle/30"
                )}
                data-testid="delivery-method-option-pickup"
              >
                <Radio checked={deliveryMethod === "pickup"} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-base-semi font-semibold text-ui-fg-base">
                      🏬 Store Pickup
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      FREE
                    </span>
                  </div>
                  <Text className="text-xs text-ui-fg-subtle mt-1">
                    Collect in person at our Lusaka Central Warehouse.
                  </Text>
                </div>
              </button>
            </div>
          </div>

          {/* Mode 1: DELIVERY MODE */}
          {deliveryMethod === "delivery" && (
            <div className="space-y-4">
              {/* Interactive Location Map */}
              <LocationMap
                apiKey={mapsKey}
                location={deliveryLocation}
                warehouseLocation={memoizedWarehouseLocation}
                onResolveLocation={onResolveLocation}
                onLocationChange={onPinDrag}
                onError={setMapError}
              />

              {/* Yango Live Estimation Card */}
              {estimate && (
                <div
                  className={clx(
                    "rounded-2xl border p-5 transition-all",
                    estimate.is_out_of_range
                      ? "border-amber-300 bg-amber-50/70"
                      : "border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-rose-50/30 shadow-sm"
                  )}
                  data-testid="yango-estimation-card"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-ui-border-base">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-ui-fg-base">
                            Yango Delivery Fare Engine
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            {estimate.source === "google_matrix" ? "Distance Matrix API" : "Road Distance Fallback"}
                          </span>
                        </div>
                        <Text className="text-xs text-ui-fg-subtle">
                          From: {warehouse.name || "Lusaka Central Hub"}
                        </Text>
                      </div>
                    </div>
                    {isCalculating && (
                      <span className="text-xs text-indigo-600 font-medium animate-pulse">
                        Calculating...
                      </span>
                    )}
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3 py-4 text-center">
                    <div className="bg-white/80 rounded-xl p-2.5 border border-ui-border-base">
                      <Text className="text-[11px] uppercase tracking-wider text-ui-fg-muted font-medium">
                        Distance
                      </Text>
                      <Text className="text-lg font-bold text-ui-fg-base mt-0.5">
                        {estimate.distance_km} <span className="text-xs font-normal">km</span>
                      </Text>
                    </div>

                    <div className="bg-white/80 rounded-xl p-2.5 border border-ui-border-base">
                      <Text className="text-[11px] uppercase tracking-wider text-ui-fg-muted font-medium">
                        Est. Duration
                      </Text>
                      <Text className="text-lg font-bold text-ui-fg-base mt-0.5">
                        {estimate.duration_text}
                      </Text>
                    </div>

                    <div className="bg-white/80 rounded-xl p-2.5 border border-ui-border-base">
                      <Text className="text-[11px] uppercase tracking-wider text-ui-fg-muted font-medium">
                        Estimated Fare
                      </Text>
                      <Text className="text-lg font-bold text-indigo-600 mt-0.5">
                        {convertToLocale({
                          amount: estimate.yango_cost,
                          currency_code: currencyCode,
                        })}
                      </Text>
                    </div>
                  </div>

                  {/* Out of range notice */}
                  {estimate.is_out_of_range && (
                    <div className="mt-2 rounded-xl bg-amber-100 border border-amber-300 p-3 text-amber-900 text-xs">
                      <div className="font-semibold flex items-center gap-1.5 mb-1">
                        <span>⚠️</span> Delivery Out of Range
                      </div>
                      <p>{estimate.out_of_range_message}</p>
                    </div>
                  )}

                  {/* Expandable Breakdown Toggle */}
                  <div className="pt-2 border-t border-ui-border-base flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      {showBreakdown ? "Hide Fare Breakdown ▲" : "View Rate Breakdown ▼"}
                    </button>
                    <span className="text-ui-fg-muted text-[11px]">
                      Base 30 ZMW (first 2 km) + 8 ZMW/km beyond (Min 35 ZMW)
                    </span>
                  </div>

                  {/* Detailed Breakdown Panel */}
                  {showBreakdown && (
                    <div className="mt-3 p-3 bg-white/90 rounded-xl border border-ui-border-base text-xs space-y-1.5 text-ui-fg-subtle">
                      <div className="flex justify-between">
                        <span>Base Fare (covers first {YANGO_RATES.BASE_DISTANCE_KM} km):</span>
                        <span className="font-medium text-ui-fg-base">{YANGO_RATES.BASE_FARE} ZMW</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Additional Distance ({estimate.breakdown.extra_km} km @ {YANGO_RATES.PER_KM_RATE} ZMW/km):</span>
                        <span className="font-medium text-ui-fg-base">+{estimate.breakdown.extra_cost} ZMW</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum Fare Threshold:</span>
                        <span className="font-medium text-ui-fg-base">{YANGO_RATES.MIN_FARE} ZMW</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t font-semibold text-ui-fg-base">
                        <span>Total Delivery Fee:</span>
                        <span className="text-indigo-600">{estimate.yango_cost} ZMW</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Manual address fallback if map has issues */}
              {mapError && !locationConfirmed && (
                <div
                  className="mt-4 rounded-xl border border-ui-border-base p-4 bg-ui-bg-subtle"
                  data-testid="manual-address-fallback"
                >
                  <Text className="txt-medium-plus text-ui-fg-base mb-3 font-medium">
                    Manual Delivery Address
                  </Text>
                  <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
                    <Input
                      label="Street address"
                      name="manual_address_1"
                      value={manualAddress.address_1}
                      onChange={(e) =>
                        setManualAddress((prev) => ({ ...prev, address_1: e.target.value }))
                      }
                      data-testid="manual-address-1-input"
                    />
                    <Input
                      label="City"
                      name="manual_city"
                      value={manualAddress.city}
                      onChange={(e) =>
                        setManualAddress((prev) => ({ ...prev, city: e.target.value }))
                      }
                      data-testid="manual-city-input"
                    />
                    <Input
                      label="Province / Area"
                      name="manual_province"
                      value={manualAddress.province}
                      onChange={(e) =>
                        setManualAddress((prev) => ({ ...prev, province: e.target.value }))
                      }
                      data-testid="manual-province-input"
                    />
                    <Input
                      label="Postal code"
                      name="manual_postal_code"
                      value={manualAddress.postal_code}
                      onChange={(e) =>
                        setManualAddress((prev) => ({ ...prev, postal_code: e.target.value }))
                      }
                      data-testid="manual-postal-code-input"
                    />
                  </div>
                  <Button
                    size="small"
                    variant="secondary"
                    className="mt-3"
                    onClick={submitManualAddress}
                    isLoading={isSavingMode}
                    data-testid="submit-manual-address-button"
                  >
                    Confirm this address
                  </Button>
                </div>
              )}

              {/* Shipping Options Selector */}
              {modeShippingMethods && modeShippingMethods.length > 0 && (
                <div className="pt-2">
                  <Text className="txt-small font-medium text-ui-fg-base mb-2">
                    Shipping Option
                  </Text>
                  <RadioGroup
                    value={selectedShippingMethod?.id ?? ""}
                    onChange={setMethod}
                  >
                    {modeShippingMethods.map((option) => (
                      <RadioGroup.Option
                        key={option.id}
                        value={option.id}
                        data-testid="delivery-option-radio"
                        className={clx(
                          "flex items-center justify-between text-small-regular cursor-pointer py-3.5 border rounded-xl px-5 mb-2 transition-all",
                          option.id === selectedShippingMethod?.id
                            ? "border-ui-border-interactive bg-ui-bg-interactive/5 ring-1 ring-ui-border-interactive"
                            : "border-ui-border-base hover:border-ui-border-strong"
                        )}
                      >
                        <div className="flex items-center gap-x-3">
                          <Radio checked={option.id === selectedShippingMethod?.id} />
                          <div>
                            <span className="text-sm font-medium text-ui-fg-base">
                              {option.name}
                            </span>
                            {estimate && (
                              <span className="block text-xs text-ui-fg-muted">
                                Dynamic rate: {estimate.distance_km} km (~{estimate.duration_text})
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold text-ui-fg-base text-sm">
                          {convertToLocale({
                            amount: estimate ? estimate.yango_cost : (option.amount ?? 35),
                            currency_code: currencyCode,
                          })}
                        </span>
                      </RadioGroup.Option>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: STORE PICKUP MODE */}
          {deliveryMethod === "pickup" && (
            <div
              className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-4"
              data-testid="store-pickup-card"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-ui-fg-base">
                      🏬 {warehouse.name || "Lusaka Central Warehouse"}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      FREE PICKUP
                    </span>
                  </div>
                  <Text className="text-xs text-ui-fg-subtle">
                    {warehouse.address_1}
                    {warehouse.address_2 ? `, ${warehouse.address_2}` : ""}, {warehouse.city}, {warehouse.country_code.toUpperCase()}
                  </Text>
                </div>
                <span className="text-base font-bold text-emerald-700">0.00 {currencyCode}</span>
              </div>

              {/* Distance & Driving time indicator */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <span className="text-base">📍</span>
                  <div>
                    <span className="text-ui-fg-muted text-[10px] uppercase font-semibold">
                      Distance from You
                    </span>
                    <p className="font-bold text-ui-fg-base">
                      {pickupDistanceInfo ? `${pickupDistanceInfo.distance_km} km` : "Central Lusaka"}
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <span className="text-base">⏱️</span>
                  <div>
                    <span className="text-ui-fg-muted text-[10px] uppercase font-semibold">
                      Driving Time
                    </span>
                    <p className="font-bold text-ui-fg-base">
                      {pickupDistanceInfo ? `~${pickupDistanceInfo.duration_text}` : "~15 mins"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-ui-fg-subtle bg-white/60 p-3 rounded-xl border border-emerald-100/60">
                <p className="font-medium text-ui-fg-base mb-0.5">📦 Collection Hours & Instructions:</p>
                <p>Monday – Saturday: 08:30 – 17:30. Orders are typically prepared and ready for collection within 1–2 hours.</p>
              </div>
            </div>
          )}

          <ErrorMessage error={error} data-testid="delivery-option-error-message" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-ui-border-base">
            <Button
              type="button"
              variant="secondary"
              size="large"
              className="w-full sm:w-auto"
              onClick={() => router.push(pathname + "?step=address", { scroll: false })}
              data-testid="back-to-address-button"
            >
              ← Back to Details
            </Button>
            <Button
              size="large"
              className="w-full sm:flex-1"
              onClick={handleSubmit}
              isLoading={isLoading || isSavingMode}
              disabled={
                isOutOfRange ||
                (deliveryMethod === "delivery" && !locationConfirmed)
              }
              data-testid="submit-delivery-option-button"
            >
              {isOutOfRange ? "Out of Delivery Range" : "Continue to payment →"}
            </Button>
          </div>
        </div>
      ) : (
        /* Summary view when step is closed/completed */
        <div className="text-small-regular">
          {cart && isPickupInMeta && (
            <div className="flex flex-col">
              <Text className="txt-medium-plus text-ui-fg-base mb-1 font-medium">
                Fulfillment Method
              </Text>
              <Text className="txt-medium text-ui-fg-subtle">
                🏬 Store Pickup (Free) — {warehouse.name || "Lusaka Central Warehouse"}
              </Text>
            </div>
          )}
          {cart && !isPickupInMeta && (
            <div className="flex flex-col">
              <Text className="txt-medium-plus text-ui-fg-base mb-1 font-medium">
                Fulfillment Method
              </Text>
              <Text className="txt-medium text-ui-fg-subtle">
                🚗 Yango Express Delivery
                {(cart.metadata as any)?.distance_km ? ` (${(cart.metadata as any).distance_km} km, ~${(cart.metadata as any).duration_text || "15 mins"})` : ""}
                {" — "}
                <span className="font-semibold text-ui-fg-base">
                  {convertToLocale({
                    amount: (cart.metadata as any)?.yango_cost ?? selectedShippingMethod?.amount ?? 35,
                    currency_code: currencyCode,
                  })}
                </span>
              </Text>
            </div>
          )}
        </div>
      )}
      <Divider className="mt-6" />
    </div>
  )
}

export default Shipping
