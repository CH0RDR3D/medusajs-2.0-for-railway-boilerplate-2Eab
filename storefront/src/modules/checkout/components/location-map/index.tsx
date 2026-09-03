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
  // Coordinates the geocoder couldn't process yet (e.g. device geolocation resolved before the
  // Maps script finished loading) — retried automatically once the map/geocoder is ready.
  const pendingCoordsRef = useRef<Location | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The raw device GPS fix, kept separate from the (possibly dragged) delivery point.
  const [deviceLocation, setDeviceLocation] = useState<Location | null>(null)
  const deviceLocationRef = useRef<Location | null>(null)

  useEffect(() => {
    onError?.(error)
  }, [error, onError])

  const fallbackCenter = useMemo(() => ({ lat: -15.3875, lng: 28.3228 }), [])

  // Pins the marker/pans the map immediately, independent of reverse-geocode completing.
  const placeMarkerAt = useCallback((coords: Location) => {
    if (!mapRef.current || !markerRef.current || !window.google?.maps) {
      pendingCoordsRef.current = coords
      return
    }
    const latLng = new window.google.maps.LatLng(coords.lat, coords.lng)
    markerRef.current.setPosition(latLng)
    mapRef.current.panTo(latLng)
  }, [])

  const reverseGeocode = useCallback((coords: Location, isRetry = false) => {
    const geocoder = geocoderRef.current
    if (!geocoder) {
      // Map/geocoder hasn't finished initializing yet — retry automatically once it is.
      pendingCoordsRef.current = coords
      return
    }

    geocoder.geocode({ location: coords }, (results: any[], status: string) => {
      if (status !== "OK" || !results?.length) {
        // Reverse geocoding can transiently return ZERO_RESULTS/OVER_QUERY_LIMIT — retry once.
        if (!isRetry) {
          setTimeout(() => reverseGeocode(coords, true), 600)
          return
        }

        // Still no address data for this exact pin (common for remote/undeveloped points) —
        // don't block checkout on it. Use the pin's coordinates with placeholder address
        // fields; the user can still drag the marker to a location with better address data.
        setError(
          "Couldn't find a street address for this exact pin. You can drag the marker to adjust it, or continue — we'll use the pinned location."
        )
        onResolveLocation(coords, {
          address_1: "Pinned location",
          city: "",
          province: "",
          postalCode: "",
          countryCode: "",
        }, deviceLocationRef.current)
        return
      }

      const top = results[0]
      const getComponent = (type: string) => {
        return top.address_components?.find((c: any) => c.types?.includes(type))?.long_name || ""
      }

      const getComponentShort = (type: string) => {
        return top.address_components?.find((c: any) => c.types?.includes(type))?.short_name || ""
      }

      const streetNumber = getComponent("street_number")
      const route = getComponent("route")
      const addressLine1 = [streetNumber, route].filter(Boolean).join(" ") || top.formatted_address || ""

      setError(null)
      onResolveLocation(coords, {
        address_1: addressLine1,
        city: getComponent("locality") || getComponent("postal_town") || getComponent("administrative_area_level_2"),
        province: getComponent("administrative_area_level_1"),
        postalCode: getComponent("postal_code"),
        countryCode: getComponentShort("country").toLowerCase(),
      }, deviceLocationRef.current)
    })
  }, [onResolveLocation])

  useEffect(() => {
    if (!apiKey) {
      setError("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing")
      return
    }

    let disposed = false

    // Google calls this global instead of throwing, which otherwise leaves
    // users stuck behind its own "can't load Google Maps" overlay with no way forward.
    window.gm_authFailure = () => {
      if (!disposed) {
        setError(
          "Google Maps couldn't authenticate (invalid or restricted API key). Use 'Use my location' or enter your address manually below."
        )
      }
    }

    const initializeMap = async () => {
      try {
        await loadGoogleMaps(apiKey)

        if (disposed || !mapElementRef.current || !window.google?.maps) {
          return
        }

        mapRef.current = new window.google.maps.Map(mapElementRef.current, {
          center: location ?? fallbackCenter,
          zoom: 15,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          gestureHandling: "greedy",
        })

        geocoderRef.current = new window.google.maps.Geocoder()

        markerRef.current = new window.google.maps.Marker({
          map: mapRef.current,
          draggable: true,
          position: location ?? fallbackCenter,
        })

        markerRef.current.addListener("dragend", (event: any) => {
          const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          }
          reverseGeocode(coords)
        })

        // Device geolocation may have resolved before the map/geocoder finished loading — retry it now.
        if (pendingCoordsRef.current) {
          const coords = pendingCoordsRef.current
          pendingCoordsRef.current = null
          placeMarkerAt(coords)
          reverseGeocode(coords)
        }
      } catch (err: any) {
        setError(err?.message || "Failed to initialize Google Maps")
      }
    }

    initializeMap()

    return () => {
      disposed = true
    }
  }, [apiKey, fallbackCenter, location, reverseGeocode])

  useEffect(() => {
    if (!location || !mapRef.current || !markerRef.current || !window.google?.maps) {
      return
    }

    const latLng = new window.google.maps.LatLng(location.lat, location.lng)
    markerRef.current.setPosition(latLng)
    mapRef.current.panTo(latLng)
  }, [location])

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser")
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        deviceLocationRef.current = coords
        setDeviceLocation(coords)
        // Pin the marker to the device fix immediately; reverse-geocoding the address happens in parallel.
        placeMarkerAt(coords)
        reverseGeocode(coords)
        setLoading(false)
      },
      () => {
        setError("Unable to access your current location")
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [reverseGeocode, placeMarkerAt])

  useEffect(() => {
    if (!location) {
      useMyLocation()
    }
  }, [location, useMyLocation])

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
