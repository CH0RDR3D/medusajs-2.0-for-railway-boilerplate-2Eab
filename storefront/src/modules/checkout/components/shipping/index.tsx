"use client"

import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import Radio from "@modules/common/components/radio"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { setDeliveryDetails, setShippingMethod } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import LocationMap from "../location-map"

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
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingMode, setIsSavingMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationConfirmed, setLocationConfirmed] = useState(false)
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"
  const isPickup = Boolean((cart.metadata as any)?.is_pickup)
  const hasShippingMethod = (cart.shipping_methods?.length ?? 0) > 0
  const deliveryStepCompleted = isPickup || hasShippingMethod

  const selectedShippingMethod = availableShippingMethods?.find(
    // To do: remove the previously selected shipping method instead of using the last one
    (method) => method.id === cart.shipping_methods?.at(-1)?.shipping_option_id
  )

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const set = async (id: string) => {
    setIsLoading(true)
    const res = await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
    if (res && "error" in res && res.error) {
      setError(res.error)
    }
    setIsLoading(false)
  }

  const setDeliveryMode = async (mode: "delivery" | "pickup") => {
    setDeliveryMethod(mode)

    if (typeof window !== "undefined") {
      sessionStorage.setItem("store_pickup_selected", String(mode === "pickup"))
      sessionStorage.setItem("checkout_location_confirmed", String(mode === "pickup"))
    }

    if (mode === "pickup") {
      setLocationConfirmed(true)
      setIsSavingMode(true)

      const detailsRes = await setDeliveryDetails({
        isPickup: true,
      })
      if (detailsRes && "error" in detailsRes && detailsRes.error) {
        setError(detailsRes.error)
        setIsSavingMode(false)
        return
      }

      // Automatically assign the first available shipping method (prioritizing free/pickup options)
      if (availableShippingMethods && availableShippingMethods.length > 0) {
        const pickupOption = availableShippingMethods.find(
          (o) =>
            o.name?.toLowerCase().includes("pickup") ||
            o.name?.toLowerCase().includes("pick up") ||
            o.amount === 0
        ) || availableShippingMethods[0]

        const setRes = await setShippingMethod({ cartId: cart.id, shippingMethodId: pickupOption.id })
        if (setRes && "error" in setRes && setRes.error) {
          setError(setRes.error)
        }
      }

      setIsSavingMode(false)
      return
    }

    const hasConfirmedLocation =
      typeof window !== "undefined" &&
      sessionStorage.getItem("checkout_location_confirmed") === "true"
    setLocationConfirmed(hasConfirmedLocation)
  }

  const onResolveLocation = async (
    location: { lat: number; lng: number },
    address: {
      address_1: string
      city: string
      province: string
      postalCode: string
      countryCode: string
    }
  ) => {
    setDeliveryLocation(location)

    if (typeof window !== "undefined") {
      sessionStorage.setItem("checkout_location_confirmed", "true")
      sessionStorage.setItem("checkout_location_lat", String(location.lat))
      sessionStorage.setItem("checkout_location_lng", String(location.lng))
    }

    setLocationConfirmed(true)
    setIsSavingMode(true)

    const res = await setDeliveryDetails({
      isPickup: false,
      location,
      address: {
        address_1: address.address_1,
        city: address.city,
        province: address.province,
        postal_code: address.postalCode,
        country_code: address.countryCode,
      },
    })
    if (res && "error" in res && res.error) {
      setError(res.error)
    }

    setIsSavingMode(false)
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  useEffect(() => {
    if (typeof window === "undefined") {
      setLocationConfirmed(Boolean(cart?.shipping_address?.address_1))
      return
    }

    const isPickup = sessionStorage.getItem("store_pickup_selected") === "true"
    setDeliveryMethod(isPickup ? "pickup" : "delivery")

    const savedLat = Number(sessionStorage.getItem("checkout_location_lat") || "")
    const savedLng = Number(sessionStorage.getItem("checkout_location_lng") || "")
    if (Number.isFinite(savedLat) && Number.isFinite(savedLng)) {
      setDeliveryLocation({ lat: savedLat, lng: savedLng })
    }

    if (isPickup) {
      setLocationConfirmed(true)
      return
    }

    const hasConfirmedLocation =
      sessionStorage.getItem("checkout_location_confirmed") === "true"

    // Delivery should only unlock once map confirmation is completed.
    setLocationConfirmed(hasConfirmedLocation)
  }, [cart?.shipping_address?.address_1])

  return (
    <div className="bg-[var(--surface-card)]">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !deliveryStepCompleted,
            }
          )}
        >
          Delivery
          {!isOpen && deliveryStepCompleted && (
            <CheckCircleSolid />
          )}
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Text>
              <button
                onClick={handleEdit}
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="edit-delivery-button"
              >
                Edit
              </button>
            </Text>
          )}
      </div>
      {isOpen ? (
        <div data-testid="delivery-options-container">
          <div className="pb-6">
            <Text className="txt-medium-plus text-ui-fg-base mb-3">Delivery Method</Text>
            <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMode("delivery")}
                className="flex items-center gap-x-3 rounded-rounded border border-ui-border-base p-3 text-left"
                data-testid="delivery-method-option-delivery"
              >
                <Radio checked={deliveryMethod === "delivery"} />
                <span className="text-small-regular">Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode("pickup")}
                className="flex items-center gap-x-3 rounded-rounded border border-ui-border-base p-3 text-left"
                data-testid="delivery-method-option-pickup"
              >
                <Radio checked={deliveryMethod === "pickup"} />
                <span className="text-small-regular">Pick Up</span>
              </button>
            </div>
          </div>

          {deliveryMethod === "delivery" ? (
            <LocationMap
              apiKey={mapsKey}
              location={deliveryLocation}
              onResolveLocation={onResolveLocation}
            />
          ) : (
            <Text className="txt-medium text-ui-fg-subtle mb-6">
              Pickup selected. We will use store location details for this order.
            </Text>
          )}

          {deliveryMethod === "delivery" && (
            <div className="pb-8">
              <RadioGroup value={selectedShippingMethod?.id} onChange={set}>
                {availableShippingMethods?.map((option) => {
                  return (
                    <RadioGroup.Option
                      key={option.id}
                      value={option.id}
                      data-testid="delivery-option-radio"
                      className={clx(
                        "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
                        {
                          "border-ui-border-interactive":
                            option.id === selectedShippingMethod?.id,
                        }
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <Radio checked={option.id === selectedShippingMethod?.id} />
                        <span className="text-base-regular">{option.name}</span>
                      </div>
                      {/* Show price only during active delivery step to defer pricing */}
                      {isOpen && (
                        <span className="justify-self-end text-ui-fg-base">
                          {convertToLocale({
                            amount: option.amount!,
                            currency_code: cart?.currency_code,
                          })}
                        </span>
                      )}
                    </RadioGroup.Option>
                  )
                })}
              </RadioGroup>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading || isSavingMode}
            disabled={!locationConfirmed || (deliveryMethod === "delivery" && !hasShippingMethod)}
            data-testid="submit-delivery-option-button"
          >
            Continue to payment
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && isPickup && (
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Method
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  Store Pickup
                </Text>
              </div>
            )}
            {cart && !isPickup && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Method
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {selectedShippingMethod?.name}
                  {/* Show price in summary only after delivery step is complete */}
                  {deliveryStepCompleted && (
                    <>
                      {" "}
                      {convertToLocale({
                        amount: selectedShippingMethod?.amount!,
                        currency_code: cart?.currency_code,
                      })}
                    </>
                  )}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
