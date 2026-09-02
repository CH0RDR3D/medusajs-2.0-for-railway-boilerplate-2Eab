/**
 * Safe data fetching utilities for checkout flow
 * Provides graceful fallbacks when APIs fail or return empty data
 */

import { HttpTypes } from "@medusajs/types"

/**
 * Safe Categories Fetch
 * Returns empty array if categories cannot be loaded, preventing nav/layout crashes
 */
export async function safeListCategories(
  fetchFn: () => Promise<HttpTypes.StoreProductCategory[]>
): Promise<HttpTypes.StoreProductCategory[]> {
  try {
    const categories = await fetchFn()
    return Array.isArray(categories) ? categories : []
  } catch (error) {
    console.warn("[Checkout Safety] Failed to fetch categories, using fallback:", error)
    return []
  }
}

/**
 * Safe Shipping Methods Fetch
 * Returns empty array with safe fallback if shipping methods cannot be loaded
 */
export async function safeListShippingMethods(
  fetchFn: () => Promise<HttpTypes.StoreCartShippingOption[] | null>
): Promise<HttpTypes.StoreCartShippingOption[]> {
  try {
    const methods = await fetchFn()
    return Array.isArray(methods) ? methods : []
  } catch (error) {
    console.warn("[Checkout Safety] Failed to fetch shipping methods, using fallback:", error)
    return []
  }
}

/**
 * Safe Cart Retrieval
 * Returns null if cart cannot be loaded, triggering checkout redirect
 */
export async function safeRetrieveCart(
  fetchFn: () => Promise<HttpTypes.StoreCart | null>
): Promise<HttpTypes.StoreCart | null> {
  try {
    const cart = await fetchFn()
    if (!cart) {
      console.warn("[Checkout Safety] Cart is null, user should be redirected")
      return null
    }
    return cart
  } catch (error) {
    console.error("[Checkout Safety] Cart retrieval failed:", error)
    return null
  }
}

/**
 * Safe Customer Retrieval
 * Returns null if customer data cannot be loaded, continuing as guest
 */
export async function safeGetCustomer(
  fetchFn: () => Promise<HttpTypes.StoreCustomer | null>
): Promise<HttpTypes.StoreCustomer | null> {
  try {
    const customer = await fetchFn()
    return customer ?? null
  } catch (error) {
    console.warn("[Checkout Safety] Failed to fetch customer data, continuing as guest:", error)
    return null
  }
}

/**
 * Safe Layout Region Check
 * Returns default region if region check fails
 */
export async function safeCheckRegion(
  fetchFn: () => Promise<{ success: boolean; region?: string } | null>
): Promise<{ success: boolean; region: string }> {
  try {
    const result = await fetchFn()
    if (result?.success) {
      return {
        success: true,
        region: result.region || "default"
      }
    }
    return { success: false, region: "default" }
  } catch (error) {
    console.warn("[Checkout Safety] Region check failed, using default:", error)
    return { success: false, region: "default" }
  }
}

/**
 * Wrap a promise with timeout and fallback
 * Useful for preventing indefinite hangs
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
  fallback: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) =>
      setTimeout(() => {
        console.warn(`[Checkout Safety] Operation timed out after ${timeoutMs}ms`)
        resolve(fallback)
      }, timeoutMs)
    ),
  ])
}
