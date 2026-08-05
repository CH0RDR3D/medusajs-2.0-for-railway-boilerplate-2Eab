import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"
import LocationMap from "../location-map"

const ShippingAddress = ({
  customer,
  cart,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = useCallback((
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code":
          address?.country_code?.toUpperCase() ||
          cart?.region?.countries?.[0]?.iso_2?.toUpperCase() ||
          "",
        "shipping_address.phone": address?.phone || "",
        "location.lat": prevState["location.lat"] || "",
        "location.lng": prevState["location.lng"] || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }, [cart?.region?.countries])

  useEffect(() => {
    const defaultCountry = cart?.region?.countries?.[0]?.iso_2?.toUpperCase() || ""

    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }

    if (!cart?.shipping_address) {
      setFormData((prevState) => ({
        ...prevState,
        "shipping_address.country_code":
          prevState["shipping_address.country_code"] || defaultCountry,
      }))
    }

    if (typeof window !== "undefined") {
      const isPickup = sessionStorage.getItem("store_pickup_selected") === "true"
      if (isPickup) {
        const now = {
          lat: -15.3875,
          lng: 28.3228,
        }

        setFormData((prevState) => ({
          ...prevState,
          "shipping_address.address_1": "Store Pickup",
          "shipping_address.city": prevState["shipping_address.city"] || "Lusaka",
          "shipping_address.postal_code":
            prevState["shipping_address.postal_code"] || "10101",
          "location.lat": String(now.lat),
          "location.lng": String(now.lng),
        }))
        sessionStorage.setItem("checkout_location_confirmed", "true")
      }
    }
  }, [cart, customer?.email, setFormAddress])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const onResolveLocation = (
    location: { lat: number; lng: number },
    address: {
      address_1: string
      city: string
      province: string
      postalCode: string
      countryCode: string
    }
  ) => {
    setFormData((prevState) => ({
      ...prevState,
      "shipping_address.address_1": address.address_1,
      "shipping_address.city": address.city,
      "shipping_address.province": address.province,
      "shipping_address.postal_code": address.postalCode,
      "shipping_address.country_code": address.countryCode.toLowerCase(),
      "location.lat": String(location.lat),
      "location.lng": String(location.lng),
    }))

    if (typeof window !== "undefined") {
      sessionStorage.setItem("checkout_location_confirmed", "true")
      sessionStorage.setItem("checkout_location_lat", String(location.lat))
      sessionStorage.setItem("checkout_location_lng", String(location.lng))
    }
  }

  const currentLocation =
    formData["location.lat"] && formData["location.lng"]
      ? {
          lat: Number(formData["location.lat"]),
          lng: Number(formData["location.lng"]),
        }
      : null

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Input
          label="Phone"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          required
          data-testid="shipping-phone-input"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          data-testid="shipping-email-input"
        />
      </div>

      <LocationMap
        apiKey={mapsKey}
        location={currentLocation}
        onResolveLocation={onResolveLocation}
      />

      <input
        type="hidden"
        name="shipping_address.address_1"
        value={formData["shipping_address.address_1"] || ""}
      />
      <input
        type="hidden"
        name="shipping_address.city"
        value={formData["shipping_address.city"] || ""}
      />
      <input
        type="hidden"
        name="shipping_address.postal_code"
        value={formData["shipping_address.postal_code"] || ""}
      />
      <input
        type="hidden"
        name="shipping_address.country_code"
        value={(formData["shipping_address.country_code"] || "").toLowerCase()}
      />
      <input
        type="hidden"
        name="shipping_address.province"
        value={formData["shipping_address.province"] || ""}
      />
      <input type="hidden" name="location.lat" value={formData["location.lat"] || ""} />
      <input type="hidden" name="location.lng" value={formData["location.lng"] || ""} />

      <input type="hidden" name="same_as_billing" value="on" data-testid="billing-address-checkbox" />
    </>
  )
}

export default ShippingAddress
