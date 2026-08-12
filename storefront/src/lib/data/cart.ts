"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { getLocale } from "./locale-actions"

const getRegionCountryCodes = async (region: HttpTypes.StoreRegion) => {
  let countries = region.countries || []

  // Cart projections can omit nested region countries; fetch full region when needed.
  if (!countries.length && region.id) {
    const fullRegion = await retrieveRegion(region.id).catch(() => null)
    countries = fullRegion?.countries || []
  }

  return countries
    .map((country) => country.iso_2?.toLowerCase())
    .filter(Boolean) as string[]
}

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())
  fields ??=
    "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name"

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields,
      },
      headers,
      next,
      cache: "no-store",
    })
    .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
    .catch(() => null)
}

export async function enrichLineItems(
  items?: HttpTypes.StoreCartLineItem[] | HttpTypes.StoreOrderLineItem[] | null,
  _regionId?: string
) {
  return items ?? []
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart(undefined, "id,region_id")

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    const locale = await getLocale()
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id, locale: locale || undefined },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const freshCart = await retrieveCartFresh(cart.id)
  const existingLine = (freshCart.items || []).find(
    (item) => item.variant_id === variantId
  )

  await (existingLine?.id
    ? sdk.store.cart.updateLineItem(
        cart.id,
        existingLine.id,
        {
          quantity: existingLine.quantity + quantity,
        },
        {},
        headers
      )
    : sdk.store.cart.createLineItem(
        cart.id,
        {
          variant_id: variantId,
          quantity,
        },
        {},
        headers
      ))
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
  variantId,
  productId,
}: {
  lineId: string
  quantity: number
  variantId?: string
  productId?: string
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const freshCart = await retrieveCartFresh(cartId)
  const resolvedLineId = resolveLatestLineItemId(freshCart, {
    lineId,
    variantId,
    productId,
  })

  if (!resolvedLineId) {
    throw new Error("Line item no longer exists in the cart")
  }

  try {
    await sdk.store.cart.updateLineItem(
      cartId,
      resolvedLineId,
      { quantity },
      {},
      headers
    )

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)
  } catch (error: any) {
    const message = String(error?.message || "")

    if (message.toLowerCase().includes("was not found")) {
      const latestCart = await retrieveCartFresh(cartId)
      const retryLineId = resolveLatestLineItemId(latestCart, {
        lineId,
        variantId,
        productId,
      })

      if (!retryLineId) {
        throw new Error("Line item no longer exists in the cart")
      }

      await sdk.store.cart.updateLineItem(
        cartId,
        retryLineId,
        { quantity },
        {},
        headers
      )

      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return
    }

    medusaError(error)
  }
}

type RemoveFromCartInput = {
  lineId?: string
  variantId?: string
  productId?: string
}

const retrieveCartFresh = async (cartId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cartId}`, {
      method: "GET",
      query: {
        fields:
          "id,*items,items.id,items.variant_id,items.product_id,items.quantity,*items.variant,*items.product",
      },
      headers,
      cache: "no-store",
    })
    .then(({ cart }) => cart)
}

const resolveLatestLineItemId = (
  cart: HttpTypes.StoreCart,
  input: RemoveFromCartInput
) => {
  const items = cart.items || []

  if (input.lineId && items.some((item) => item.id === input.lineId)) {
    return input.lineId
  }

  if (input.variantId) {
    const byVariant = items.find((item) => item.variant_id === input.variantId)
    if (byVariant?.id) {
      return byVariant.id
    }
  }

  if (input.productId) {
    const byProduct = items.find((item) => item.product_id === input.productId)
    if (byProduct?.id) {
      return byProduct.id
    }
  }

  return null
}

export async function removeFromCart(input: RemoveFromCartInput) {
  if (!input.lineId && !input.variantId && !input.productId) {
    throw new Error("Missing identifiers when removing line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const freshCart = await retrieveCartFresh(cartId)
  const resolvedLineId = resolveLatestLineItemId(freshCart, input)

  if (!resolvedLineId) {
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    return {
      ok: true,
      skipped: true,
      message: "Line item no longer exists in the cart.",
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.store.cart.deleteLineItem(cartId, resolvedLineId, {}, headers)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)

    return {
      ok: true,
      skipped: false,
    }
  } catch (error: any) {
    const message = String(error?.message || "")

    if (message.toLowerCase().includes("was not found")) {
      const latestCart = await retrieveCartFresh(cartId)
      const retryLineId = resolveLatestLineItemId(latestCart, input)

      if (!retryLineId) {
        const cartCacheTag = await getCacheTag("carts")
        revalidateTag(cartCacheTag)

        return {
          ok: true,
          skipped: true,
          message: "Line item was already removed.",
        }
      }

      await sdk.store.cart.deleteLineItem(cartId, retryLineId, {}, headers)

      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return {
        ok: true,
        skipped: false,
      }
    }

    medusaError(error)
  }
}

export async function deleteLineItem(lineId: string) {
  return removeFromCart({ lineId })
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}

export async function setDeliveryDetails({
  isPickup,
  location,
  address,
}: {
  isPickup: boolean
  location?: { lat: number; lng: number }
  address?: {
    address_1?: string
    city?: string
    province?: string
    postal_code?: string
    country_code?: string
  }
}) {
  const cart = await retrieveCart(undefined, "id,*region,*shipping_address,metadata")

  if (!cart?.id || !cart.region) {
    throw new Error("No existing cart found when updating delivery details")
  }

  const regionCountries = await getRegionCountryCodes(cart.region)

  const defaultRegionCountryCode = regionCountries[0] || "zm"
  const requestedCountryCode =
    address?.country_code?.toLowerCase() ||
    cart.shipping_address?.country_code?.toLowerCase() ||
    defaultRegionCountryCode

  const countryCode = regionCountries.includes(requestedCountryCode)
    ? requestedCountryCode
    : defaultRegionCountryCode

  const pickupAddress = {
    address_1: "Store Pickup",
    city: "Lusaka",
    province: "Lusaka",
    postal_code: "10101",
    country_code: defaultRegionCountryCode,
    lat: -15.3875,
    lng: 28.3228,
  }

  const resolvedLocation = isPickup
    ? { lat: pickupAddress.lat, lng: pickupAddress.lng }
    : {
        lat: location?.lat ?? Number(cart.metadata?.lat ?? 0),
        lng: location?.lng ?? Number(cart.metadata?.lng ?? 0),
      }

  const shippingAddress = {
    first_name: cart.shipping_address?.first_name || "",
    last_name: cart.shipping_address?.last_name || "",
    phone: cart.shipping_address?.phone || "",
    address_1: isPickup
      ? pickupAddress.address_1
      : address?.address_1 || cart.shipping_address?.address_1 || "Google Map Location",
    city: isPickup
      ? pickupAddress.city
      : address?.city || cart.shipping_address?.city || "Lusaka",
    province: isPickup
      ? pickupAddress.province
      : address?.province || cart.shipping_address?.province || "",
    postal_code: isPickup
      ? pickupAddress.postal_code
      : address?.postal_code || cart.shipping_address?.postal_code || "10101",
    country_code: isPickup ? pickupAddress.country_code : countryCode,
  }

  await updateCart({
    shipping_address: shippingAddress,
    billing_address: shippingAddress,
    metadata: {
      ...(cart.metadata || {}),
      is_pickup: isPickup,
      lat: resolvedLocation.lat,
      lng: resolvedLocation.lng,
    },
  } as HttpTypes.StoreUpdateCart)

  return { ok: true }
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const cart = await retrieveCart(undefined, "id,*region")
    if (!cart?.region) {
      throw new Error("Cart region is missing")
    }

    const regionCountries = await getRegionCountryCodes(cart.region)

    const email = formData.get("email") as string
    const emailWithFallback = email && email.trim() !== "" ? email : `guest-${cartId}@example.com`

    const isPickup = formData.get("is_pickup") === "true"

    const submittedCountryCode = (formData.get("shipping_address.country_code") || "")
      .toString()
      .trim()
      .toLowerCase()
    const defaultRegionCountryCode = regionCountries[0] || "zm"
    const countryCode = submittedCountryCode || defaultRegionCountryCode

    if (!regionCountries.includes(countryCode)) {
      throw new Error(
        `Country with code ${countryCode.toUpperCase()} is not within region ${cart.region.name}`
      )
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1") || (isPickup ? "Store Pickup" : "Google Map Location"),
        address_2: "",
        company: "",
        postal_code: formData.get("shipping_address.postal_code") || "10101",
        city: formData.get("shipping_address.city") || "Lusaka",
        country_code: countryCode,
        province: formData.get("shipping_address.province") || "",
        phone: formData.get("shipping_address.phone"),
      },
      email: emailWithFallback,
      metadata: {
        is_pickup: isPickup,
        lat: parseFloat((formData.get("location.lat") || formData.get("lat") || "0") as string),
        lng: parseFloat((formData.get("location.lng") || formData.get("lng") || "0") as string),
      }
    } as any

    // Always keep billing address same as shipping address
    data.billing_address = data.shipping_address

    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  const countryCode = (formData.get("shipping_address.country_code") || "zm")
    .toString()
    .toLowerCase()
  redirect(
    `/${countryCode}/checkout?step=delivery`
  )
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  return cartRes.cart
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "no-store",
  })
}
