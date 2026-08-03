import { HttpTypes } from "@medusajs/types"

/**
 * Generates a simple hash for a string key
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Daily curation function that deterministically shuffles and selects products
 * based on the current calendar date (YYYY-MM-DD), refreshing every 24 hours.
 */
export function getDailyCuratedProducts(
  products: HttpTypes.StoreProduct[],
  count: number = 8,
  seedKey: string = "editors-pick"
): HttpTypes.StoreProduct[] {
  if (!products || !products.length) return []

  const todayStr = new Date().toISOString().slice(0, 10)

  // Map each product to a daily score based on its ID + today's date + seed key
  const scored = products.map((product) => {
    const hash = hashString(`${todayStr}-${seedKey}-${product.id}`)
    return { product, score: hash }
  })

  // Sort by daily hash score to curate products for today
  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, count).map((item) => item.product)
}

/**
 * Filter and curate Today's Deals (discounted items or high value deals rotated daily)
 */
export function getDailyDealsProducts(
  products: HttpTypes.StoreProduct[],
  count: number = 8
): HttpTypes.StoreProduct[] {
  if (!products || !products.length) return []

  // Prefer discounted items first
  const discounted = products.filter((p) => {
    const calc = (p as any).variants?.[0]?.calculated_price?.calculated_amount ?? 0
    const orig = (p as any).variants?.[0]?.calculated_price?.original_amount ?? 0
    return orig > calc
  })

  const candidatePool = discounted.length >= count ? discounted : products
  return getDailyCuratedProducts(candidatePool, count, "daily-deals")
}
