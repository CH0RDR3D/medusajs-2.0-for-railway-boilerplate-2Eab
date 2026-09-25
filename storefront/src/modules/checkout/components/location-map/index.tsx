"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button, Text } from "@medusajs/ui"
import { LUSAKA_DEFAULT_ORIGIN } from "@lib/util/delivery-estimate"

type Location = {
  lat: number
  lng: number
}

type ResolvedAddress = {
  address_1: string
  city: string
  province: string
  postalCode: string
  countryCode: string
}

type WarehouseInfo = {
  lat: number
  lng: number
  name?: string
  address?: string
}

type LocationMapProps = {
  apiKey?: string
  location: Location | null
  warehouseLocation?: WarehouseInfo
  onResolveLocation: (
    location: Location,
    address: ResolvedAddress,
    deviceLocation: Location | null
  ) => void
  onLocationChange?: (location: Location) => void
  onError?: (message: string | null) => void
}

declare global {
  interface Window {
    google: any
    __googleMapsCheckoutScriptLoaded?: boolean
    gm_authFailure?: () => void
  }
}

const GOOGLE_MAPS_SCRIPT_ID = "checkout-google-maps-script"

const loadGoogleMaps = (apiKey: string): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in browser"))
  }

  if (window.google?.maps) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps script")), {
        once: true,
      })
      return
    }

    const script = document.createElement("script")
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Google Maps script"))
    document.head.appendChild(script)
  })
}

const LocationMap = ({
  apiKey,
  location,
  warehouseLocation,
  onResolveLocation,
  onLocationChange,
  onError,
}: LocationMapProps) => {
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const warehouseMarkerRef = useRef<any>(null)
  const routeLineRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setDeviceLocation] = useState<Location | null>(null)
  const deviceLocationRef = useRef<Location | null>(null)
  const locationRef = useRef<Location | null>(location)
  locationRef.current = location

  // Stable callback refs to prevent effect re-triggering
  const onResolveLocationRef = useRef(onResolveLocation)
  onResolveLocationRef.current = onResolveLocation

  const onLocationChangeRef = useRef(onLocationChange)
  onLocationChangeRef.current = onLocationChange

  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  // Track last resolved coords to avoid duplicate geocode/Distance Matrix calls
  const lastResolvedCoordsRef = useRef<Location | null>(null)
  const dragDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Cache warehouse coordinates to prevent refresh loops
  const cachedWarehouse = useMemo<WarehouseInfo>(() => {
    return {
      lat: warehouseLocation?.lat ?? LUSAKA_DEFAULT_ORIGIN.lat,
      lng: warehouseLocation?.lng ?? LUSAKA_DEFAULT_ORIGIN.lng,
      name: warehouseLocation?.name || "Lusaka Central Warehouse",
      address: warehouseLocation?.address || "Cairo Road, Lusaka",
    }
  }, [
    warehouseLocation?.lat,
    warehouseLocation?.lng,
    warehouseLocation?.name,
    warehouseLocation?.address,
  ])

  const cachedWarehouseRef = useRef(cachedWarehouse)
  cachedWarehouseRef.current = cachedWarehouse

  const fallbackCenter = useMemo(
    () => ({ lat: -15.488449898458102, lng: 28.251956946590706 }),
    []
  )

  useEffect(() => {
    onErrorRef.current?.(error)
  }, [error])

  // Reverse geocode with deduplication
  const reverseGeocode = useCallback(
    (coords: Location, deviceLocOverride?: Location | null, force = false) => {
      // Avoid duplicate geocodes for virtually identical coordinates
      if (!force && lastResolvedCoordsRef.current) {
        const prev = lastResolvedCoordsRef.current
        const diffLat = Math.abs(prev.lat - coords.lat)
        const diffLng = Math.abs(prev.lng - coords.lng)
        if (diffLat < 0.0001 && diffLng < 0.0001) {
          return
        }
      }

      lastResolvedCoordsRef.current = coords

      const geocoder = geocoderRef.current
      const currentDeviceLoc =
        deviceLocOverride !== undefined ? deviceLocOverride : deviceLocationRef.current

      onLocationChangeRef.current?.(coords)

      if (!geocoder) {
        onResolveLocationRef.current(
          coords,
          {
            address_1: `Delivery Pin (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
            city: "Lusaka",
            province: "Lusaka",
            postalCode: "10101",
            countryCode: "zm",
          },
          currentDeviceLoc
        )
        return
      }

      geocoder.geocode({ location: coords }, (results: any[], status: string) => {
        if (status === "OK" && results && results.length > 0) {
          const top = results[0]
          const getComponent = (type: string) =>
            top.address_components?.find((c: any) => c.types?.includes(type))?.long_name || ""
          const getComponentShort = (type: string) =>
            top.address_components?.find((c: any) => c.types?.includes(type))?.short_name || ""

          const streetNumber = getComponent("street_number")
          const route = getComponent("route")
          const streetAddress = [streetNumber, route].filter(Boolean).join(" ")
          const addressLine1 = streetAddress || top.formatted_address || "Pinned delivery location"

          const city =
            getComponent("locality") ||
            getComponent("postal_town") ||
            getComponent("sublocality") ||
            getComponent("administrative_area_level_2") ||
            "Lusaka"

          const province = getComponent("administrative_area_level_1") || "Lusaka"
          const postalCode = getComponent("postal_code") || "10101"
          const countryCode = (getComponentShort("country") || "zm").toLowerCase()

          setError(null)
          onResolveLocationRef.current(
            coords,
            {
              address_1: addressLine1,
              city,
              province,
              postalCode,
              countryCode,
            },
            currentDeviceLoc
          )
        } else {
          setError(null)
          onResolveLocationRef.current(
            coords,
            {
              address_1: `Delivery Pin (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
              city: "Lusaka",
              province: "Lusaka",
              postalCode: "10101",
              countryCode: "zm",
            },
            currentDeviceLoc
          )
        }
      })
    },
    []
  )

  // Promisified browser geolocation helper
  const getDeviceLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        reject(new Error("Geolocation not supported by browser"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (err) => {
          reject(err)
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        }
      )
    })
  }, [])

  // Manual trigger to re-center on device GPS location
  const useMyLocation = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const coords = await getDeviceLocation()
      setDeviceLocation(coords)
      deviceLocationRef.current = coords

      const wh = cachedWarehouseRef.current

      if (mapRef.current && userMarkerRef.current && window.google?.maps) {
        const latLng = new window.google.maps.LatLng(coords.lat, coords.lng)
        userMarkerRef.current.setPosition(latLng)

        // Update route line
        if (routeLineRef.current) {
          routeLineRef.current.setPath([
            { lat: wh.lat, lng: wh.lng },
            coords,
          ])
        }

        // Adjust bounds
        const bounds = new window.google.maps.LatLngBounds()
        bounds.extend(new window.google.maps.LatLng(wh.lat, wh.lng))
        bounds.extend(latLng)
        mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
      }

      reverseGeocode(coords, coords, true)
    } catch (err: any) {
      setError("Unable to access your current GPS location. You can drag the delivery pin to your location.")
    } finally {
      setLoading(false)
    }
  }, [getDeviceLocation, reverseGeocode])

  // Initialize Google Map - runs strictly once per apiKey/container lifecycle
  useEffect(() => {
    if (!apiKey) {
      setError(null)
      return
    }

    let disposed = false

    window.gm_authFailure = () => {
      if (!disposed) {
        setError(
          "Google Maps API key unverified or rate limit exceeded. Dynamic delivery fare computed using road distance fallback."
        )
      }
    }

    const initializeMap = async () => {
      try {
        setLoading(true)

        const [deviceResult] = await Promise.allSettled([
          getDeviceLocation(),
          loadGoogleMaps(apiKey),
        ])

        if (disposed || !mapElementRef.current || !window.google?.maps) {
          return
        }

        let initialCenter: Location = fallbackCenter
        let initialDeviceLoc: Location | null = null

        if (locationRef.current) {
          initialCenter = locationRef.current
        } else if (deviceResult.status === "fulfilled" && deviceResult.value) {
          initialCenter = deviceResult.value
          initialDeviceLoc = deviceResult.value
          setDeviceLocation(deviceResult.value)
          deviceLocationRef.current = deviceResult.value
        }

        const wh = cachedWarehouseRef.current
        const warehouseCoords = {
          lat: wh.lat,
          lng: wh.lng,
        }

        // Initialize Map
        const map = new window.google.maps.Map(mapElementRef.current, {
          center: initialCenter,
          zoom: 13,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          gestureHandling: "greedy",
        })
        mapRef.current = map

        // Initialize Geocoder
        const geocoder = new window.google.maps.Geocoder()
        geocoderRef.current = geocoder

        // 1. Warehouse Origin Marker
        const warehouseMarker = new window.google.maps.Marker({
          position: warehouseCoords,
          map,
          title: wh.name || "Main Warehouse Origin",
          icon: {
            path: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
            fillColor: "#4f46e5",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 20),
          },
        })
        warehouseMarkerRef.current = warehouseMarker

        const warehouseInfoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding: 4px; font-family: sans-serif;">
            <strong style="color: #4f46e5;">🏬 ${wh.name || "Lusaka Central Hub"}</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">Dispatch Origin</p>
          </div>`,
        })

        warehouseMarker.addListener("click", () => {
          warehouseInfoWindow.open(map, warehouseMarker)
        })

        // 2. User Delivery Marker (Draggable)
        const userMarker = new window.google.maps.Marker({
          position: initialCenter,
          map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          title: "Drag to your exact delivery location",
          icon: {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fillColor: "#e11d48",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 1.6,
            anchor: new window.google.maps.Point(12, 22),
          },
        })
        userMarkerRef.current = userMarker

        // 3. Polyline Route Line
        const routeLine = new window.google.maps.Polyline({
          path: [warehouseCoords, initialCenter],
          geodesic: true,
          strokeColor: "#3b82f6",
          strokeOpacity: 0.75,
          strokeWeight: 3.5,
          map,
        })
        routeLineRef.current = routeLine

        // Debounced pin drag event listener - updates line immediately, debounces estimate
        userMarker.addListener("drag", (event: any) => {
          const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          }
          if (routeLineRef.current) {
            routeLineRef.current.setPath([
              { lat: cachedWarehouseRef.current.lat, lng: cachedWarehouseRef.current.lng },
              coords,
            ])
          }

          if (dragDebounceTimerRef.current) {
            clearTimeout(dragDebounceTimerRef.current)
          }

          dragDebounceTimerRef.current = setTimeout(() => {
            onLocationChangeRef.current?.(coords)
          }, 150)
        })

        // Drag end listener - triggers final geocoding and state persistence
        userMarker.addListener("dragend", (event: any) => {
          if (dragDebounceTimerRef.current) {
            clearTimeout(dragDebounceTimerRef.current)
          }
          const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          }
          if (routeLineRef.current) {
            routeLineRef.current.setPath([
              { lat: cachedWarehouseRef.current.lat, lng: cachedWarehouseRef.current.lng },
              coords,
            ])
          }
          reverseGeocode(coords, null, true)
        })

        // Initial bounds fitting
        const bounds = new window.google.maps.LatLngBounds()
        bounds.extend(new window.google.maps.LatLng(warehouseCoords.lat, warehouseCoords.lng))
        bounds.extend(new window.google.maps.LatLng(initialCenter.lat, initialCenter.lng))
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 })

        // Initial address resolution
        reverseGeocode(initialCenter, initialDeviceLoc, true)
      } catch (err: any) {
        if (!disposed) {
          setError("Google Maps preview unavailable. Our fallback distance engine is active.")
        }
      } finally {
        if (!disposed) {
          setLoading(false)
        }
      }
    }

    initializeMap()

    return () => {
      disposed = true
      if (dragDebounceTimerRef.current) {
        clearTimeout(dragDebounceTimerRef.current)
      }
    }
  }, [apiKey, fallbackCenter, getDeviceLocation, reverseGeocode])

  // Sync external location changes safely without recreating map
  useEffect(() => {
    if (!location || !mapRef.current || !userMarkerRef.current || !window.google?.maps) {
      return
    }

    const currentPos = userMarkerRef.current.getPosition()
    if (currentPos) {
      const diffLat = Math.abs(currentPos.lat() - location.lat)
      const diffLng = Math.abs(currentPos.lng() - location.lng)
      if (diffLat < 0.0001 && diffLng < 0.0001) {
        return // Already positioned
      }
    }

    const latLng = new window.google.maps.LatLng(location.lat, location.lng)
    userMarkerRef.current.setPosition(latLng)

    if (routeLineRef.current) {
      routeLineRef.current.setPath([
        { lat: cachedWarehouse.lat, lng: cachedWarehouse.lng },
        location,
      ])
    }
  }, [location, cachedWarehouse.lat, cachedWarehouse.lng])

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <Text className="txt-small font-medium text-ui-fg-base">
            Pinpoint your delivery location
          </Text>
        </div>
        <Button
          type="button"
          size="small"
          variant="secondary"
          onClick={useMyLocation}
          isLoading={loading}
          className="text-xs"
          data-testid="use-my-location-button"
        >
          📍 Use my GPS location
        </Button>
      </div>

      {apiKey ? (
        <div
          ref={mapElementRef}
          className="h-[280px] w-full overflow-hidden rounded-xl border border-[var(--surface-border)] shadow-inner small:h-[340px]"
          data-testid="checkout-map"
        />
      ) : (
        <div className="rounded-xl border border-dashed border-ui-border-base bg-ui-bg-subtle p-6 text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <Text className="txt-medium-plus text-ui-fg-base">Interactive Map Active</Text>
          <Text className="txt-small text-ui-fg-subtle mt-1">
            Distance and dynamic Yango delivery fees are computed live from our {cachedWarehouse.name || "Lusaka Central Warehouse"}.
          </Text>
        </div>
      )}

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ui-fg-subtle bg-ui-bg-subtle/60 rounded-lg p-2.5 border border-ui-border-base">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
          <span>Warehouse Origin ({cachedWarehouse.name || "Lusaka Central"})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span>Your Delivery Pin (Drag to adjust)</span>
        </div>
      </div>

      {error && (
        <Text className="text-small-regular text-amber-600" data-testid="checkout-map-error">
          ℹ️ {error}
        </Text>
      )}
    </div>
  )
}

export default LocationMap
