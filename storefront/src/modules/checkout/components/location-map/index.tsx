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
  onResolveLocation: (location: Location, address: ResolvedAddress) => void
}

declare global {
  interface Window {
    google: any
    __googleMapsCheckoutScriptLoaded?: boolean
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

const LocationMap = ({ apiKey, location, onResolveLocation }: LocationMapProps) => {
  const mapElementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fallbackCenter = useMemo(() => ({ lat: -15.3875, lng: 28.3228 }), [])

  const reverseGeocode = useCallback((coords: Location) => {
    const geocoder = geocoderRef.current
    if (!geocoder) {
      return
    }

    geocoder.geocode({ location: coords }, (results: any[], status: string) => {
      if (status !== "OK" || !results?.length) {
        setError("Unable to resolve a formatted address from this location")
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

      onResolveLocation(coords, {
        address_1: addressLine1,
        city: getComponent("locality") || getComponent("postal_town") || getComponent("administrative_area_level_2"),
        province: getComponent("administrative_area_level_1"),
        postalCode: getComponent("postal_code"),
        countryCode: getComponentShort("country").toLowerCase(),
      })
    })
  }, [onResolveLocation])

  useEffect(() => {
    if (!apiKey) {
      setError("NEXT_PUBLIC_GOOGLE_MAPS_KEY is missing")
      return
    }

    let disposed = false

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

        reverseGeocode(coords)
        setLoading(false)
      },
      () => {
        setError("Unable to access your current location")
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [reverseGeocode])

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
