"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button, Text } from "@medusajs/ui"

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

type LocationMapProps = {
  apiKey?: string
  location: Location | null
  onResolveLocation: (
    location: Location,
    address: ResolvedAddress,
    deviceLocation: Location | null
  ) => void
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Google Maps script"))
    document.head.appendChild(script)
  })
}

const LocationMap = ({ apiKey, location, onResolveLocation, onError }: LocationMapProps) => {
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceLocation, setDeviceLocation] = useState<Location | null>(null)
  const deviceLocationRef = useRef<Location | null>(null)
  const locationRef = useRef<Location | null>(location)
  locationRef.current = location

  const fallbackCenter = useMemo(() => ({ lat: -15.3875, lng: 28.3228 }), [])

  useEffect(() => {
    onError?.(error)
  }, [error, onError])

  // Reverse geocodes coordinates to structured address and notifies parent
  const reverseGeocode = useCallback(
    (coords: Location, deviceLocOverride?: Location | null) => {
      const geocoder = geocoderRef.current
      const currentDeviceLoc =
        deviceLocOverride !== undefined ? deviceLocOverride : deviceLocationRef.current

      if (!geocoder) {
        // If geocoder is not initialized yet, supply coordinate fallback
        onResolveLocation(
          coords,
          {
            address_1: "Pinned delivery location",
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
          onResolveLocation(
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
          // Graceful fallback for remote coordinates or reverse-geocoding edge cases
          setError(null)
          onResolveLocation(
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
    [onResolveLocation]
  )

  // Promisified browser geolocation helper
  const getDeviceLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
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
          timeout: 10000,
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

      if (mapRef.current && markerRef.current && window.google?.maps) {
        const latLng = new window.google.maps.LatLng(coords.lat, coords.lng)
        markerRef.current.setPosition(latLng)
        mapRef.current.panTo(latLng)
        mapRef.current.setZoom(16)
      }

      reverseGeocode(coords, coords)
    } catch (err: any) {
      setError("Unable to access your current location. Please check browser permissions or drag the pin.")
    } finally {
      setLoading(false)
    }
  }, [getDeviceLocation, reverseGeocode])

  // Initialize Google Map, auto-request geolocation on mount, pin marker, and resolve address
  useEffect(() => {
    if (!apiKey) {
      setError("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing")
      return
    }

    let disposed = false

    window.gm_authFailure = () => {
      if (!disposed) {
        setError(
          "Google Maps couldn't authenticate (invalid or restricted API key). Enter your address manually below."
        )
      }
    }

    const initializeMap = async () => {
      try {
        setLoading(true)

        // Request geolocation and load Google Maps in parallel
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
          // Prioritize already saved delivery coordinates if returning to step
          initialCenter = locationRef.current
        } else if (deviceResult.status === "fulfilled" && deviceResult.value) {
          // Auto-detected device location
          initialCenter = deviceResult.value
          initialDeviceLoc = deviceResult.value
          setDeviceLocation(deviceResult.value)
          deviceLocationRef.current = deviceResult.value
        }

        // Initialize Map
        const map = new window.google.maps.Map(mapElementRef.current, {
          center: initialCenter,
          zoom: 15,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          gestureHandling: "greedy",
        })
        mapRef.current = map

        // Initialize Geocoder
        const geocoder = new window.google.maps.Geocoder()
        geocoderRef.current = geocoder

        // Initialize Draggable Marker
        const marker = new window.google.maps.Marker({
          position: initialCenter,
          map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        })
        markerRef.current = marker

        // Listen for drag end to update userSelectedLocation and re-run Geocoder
        marker.addListener("dragend", (event: any) => {
          const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          }
          reverseGeocode(coords)
        })

        // Adjust map container rendering
        window.google.maps.event.trigger(map, "resize")
        map.setCenter(initialCenter)

        // Resolve address on mount
        reverseGeocode(initialCenter, initialDeviceLoc)
      } catch (err: any) {
        if (!disposed) {
          setError(err?.message || "Failed to initialize Google Maps")
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
    }
  }, [apiKey, fallbackCenter, getDeviceLocation, reverseGeocode])

  // Sync external location changes (e.g. from parent/saved state)
  useEffect(() => {
    if (!location || !mapRef.current || !markerRef.current || !window.google?.maps) {
      return
    }

    const latLng = new window.google.maps.LatLng(location.lat, location.lng)
    markerRef.current.setPosition(latLng)
    mapRef.current.panTo(latLng)
  }, [location])

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Text className="txt-small text-ui-fg-subtle">Delivery location</Text>
        <Button
          type="button"
          size="small"
          variant="secondary"
          onClick={useMyLocation}
          isLoading={loading}
          data-testid="use-my-location-button"
        >
          Use my location
        </Button>
      </div>
      <div
        ref={mapElementRef}
        className="h-[280px] w-full overflow-hidden rounded-xl border border-[var(--surface-border)] small:h-[360px]"
        data-testid="checkout-map"
      />
      {error && (
        <Text className="text-small-regular text-rose-500" data-testid="checkout-map-error">
          {error}
        </Text>
      )}
    </div>
  )
}

export default LocationMap

