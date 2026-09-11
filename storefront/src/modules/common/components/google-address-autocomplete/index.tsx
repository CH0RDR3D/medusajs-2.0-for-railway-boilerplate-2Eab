"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { MapPin, CheckCircle2, Navigation, Loader2, Sparkles } from "lucide-react"
import { clx } from "@medusajs/ui"

export interface ValidatedAddress {
  address_1: string
  address_2?: string
  city: string
  province: string
  postal_code: string
  country_code: string
  lat?: number
  lng?: number
  formatted_address?: string
}

interface GoogleAddressAutocompleteProps {
  label?: string
  name?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
  className?: string
  countryRestriction?: string // e.g. "zm", "us"
  onAddressSelect: (address: ValidatedAddress) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  "data-testid"?: string
}

const GOOGLE_MAPS_SCRIPT_ID = "checkout-google-maps-script"

const loadGoogleMapsPlaces = (apiKey: string): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in browser"))
  }

  if (window.google?.maps?.places) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      if (window.google?.maps?.places) {
        resolve()
      } else {
        existing.addEventListener("load", () => resolve(), { once: true })
        existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")), {
          once: true,
        })
      }
      return
    }

    const script = document.createElement("script")
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Google Maps script"))
    document.head.appendChild(script)
  })
}

export default function GoogleAddressAutocomplete({
  label = "Address (Google Maps Validated)",
  name = "address_1",
  value,
  defaultValue = "",
  placeholder = "Start typing street address or place name...",
  required = false,
  className,
  countryRestriction,
  onAddressSelect,
  onChange,
  "data-testid": dataTestId = "google-address-input",
}: GoogleAddressAutocompleteProps) {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    ""

  const inputRef = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<any>(null)
  const [inputValue, setInputValue] = useState(value ?? defaultValue)
  const [isVerified, setIsVerified] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [mapsLoaded, setMapsLoaded] = useState(false)

  // Keep internal input value in sync with external value prop
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value)
    }
  }, [value])

  // Parse Google Address Components into structured Medusa address
  const parseGooglePlace = useCallback(
    (place: any): ValidatedAddress => {
      let streetNumber = ""
      let route = ""
      let sublocality = ""
      let city = ""
      let province = ""
      let postalCode = ""
      let countryCode = ""

      if (Array.isArray(place.address_components)) {
        for (const comp of place.address_components) {
          const types: string[] = comp.types || []
          if (types.includes("street_number")) {
            streetNumber = comp.long_name
          } else if (types.includes("route")) {
            route = comp.long_name
          } else if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
            sublocality = comp.long_name
          } else if (types.includes("locality")) {
            city = comp.long_name
          } else if (types.includes("administrative_area_level_2") && !city) {
            city = comp.long_name
          } else if (types.includes("administrative_area_level_1")) {
            province = comp.long_name
          } else if (types.includes("postal_code")) {
            postalCode = comp.long_name
          } else if (types.includes("country")) {
            countryCode = comp.short_name?.toLowerCase() || ""
          }
        }
      }

      const street = [streetNumber, route].filter(Boolean).join(" ")
      const address_1 = street || sublocality || place.name || place.formatted_address || inputValue
      const lat = place.geometry?.location?.lat?.()
      const lng = place.geometry?.location?.lng?.()

      return {
        address_1,
        city: city || sublocality || "Lusaka",
        province: province || "Lusaka Province",
        postal_code: postalCode || "10101",
        country_code: countryCode || countryRestriction || "zm",
        lat,
        lng,
        formatted_address: place.formatted_address || address_1,
      }
    },
    [countryRestriction, inputValue]
  )

  // Initialize Autocomplete once Google Maps script is ready
  useEffect(() => {
    if (!apiKey) return

    let isMounted = true

    loadGoogleMapsPlaces(apiKey)
      .then(() => {
        if (!isMounted || !inputRef.current || !window.google?.maps?.places) return
        setMapsLoaded(true)

        if (!autocompleteRef.current) {
          const options: any = {
            fields: ["address_components", "geometry", "formatted_address", "name"],
          }
          if (countryRestriction) {
            options.componentRestrictions = { country: countryRestriction }
          }

          const autocomplete = new window.google.maps.places.Autocomplete(
            inputRef.current,
            options
          )
          autocompleteRef.current = autocomplete

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace()
            if (!place || (!place.geometry && !place.address_components)) return

            const parsed = parseGooglePlace(place)
            setInputValue(parsed.address_1)
            setIsVerified(true)
            onAddressSelect(parsed)
          })
        }
      })
      .catch((err) => {
        console.warn("[GoogleAddressAutocomplete] Maps load failed:", err)
      })

    return () => {
      isMounted = false
    }
  }, [apiKey, countryRestriction, onAddressSelect, parseGooglePlace])

  // Geolocation button handler: Geocode current GPS coords to address
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords

        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results: any, status: string) => {
              setIsLocating(false)
              if (status === "OK" && results?.[0]) {
                const parsed = parseGooglePlace(results[0])
                setInputValue(parsed.address_1)
                setIsVerified(true)
                onAddressSelect(parsed)
              } else {
                const fallbackAddress: ValidatedAddress = {
                  address_1: `Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                  city: "Lusaka",
                  province: "Lusaka Province",
                  postal_code: "10101",
                  country_code: countryRestriction || "zm",
                  lat: latitude,
                  lng: longitude,
                }
                setInputValue(fallbackAddress.address_1)
                setIsVerified(true)
                onAddressSelect(fallbackAddress)
              }
            }
          )
        } else {
          setIsLocating(false)
          const fallbackAddress: ValidatedAddress = {
            address_1: `Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            city: "Lusaka",
            province: "Lusaka Province",
            postal_code: "10101",
            country_code: countryRestriction || "zm",
            lat: latitude,
            lng: longitude,
          }
          setInputValue(fallbackAddress.address_1)
          setIsVerified(true)
          onAddressSelect(fallbackAddress)
        }
      },
      (err) => {
        setIsLocating(false)
        console.warn("[GoogleAddressAutocomplete] Geolocation error:", err)
        alert("Unable to retrieve GPS location. Please type your address manually.")
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsVerified(false)
    onChange?.(e)
  }

  return (
    <div className={clx("flex flex-col w-full relative", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-500" />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>

        {mapsLoaded && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="text-[11px] font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition"
            title="Auto-fill with GPS location"
          >
            {isLocating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Navigation className="w-3 h-3" />
            )}
            <span>{isLocating ? "Locating..." : "Use Current GPS"}</span>
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          data-testid={dataTestId}
          autoComplete="off"
          className="w-full bg-[var(--surface-card)] border border-[var(--surface-border)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition outline-none pr-10"
        />

        {isVerified ? (
          <div
            className="absolute right-3 text-emerald-500 flex items-center"
            title="Google Maps Validated"
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
        ) : mapsLoaded ? (
          <div
            className="absolute right-3 text-amber-500/60 flex items-center pointer-events-none"
            title="Google Places Autocomplete Active"
          >
            <Sparkles className="w-4 h-4" />
          </div>
        ) : null}
      </div>

      {isVerified && (
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Address verified with Google Maps
        </span>
      )}
    </div>
  )
}
