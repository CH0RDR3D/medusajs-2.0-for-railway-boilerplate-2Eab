import { HttpTypes } from "@medusajs/types"

const getMedusaBackendUrl = () =>
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const getPublishableApiKey = () =>
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const fetchCategories = async <T,>(query: Record<string, unknown>, next: Record<string, unknown>) => {
  const url = new URL(`${getMedusaBackendUrl()}/store/product-categories`)

  Object.entries(query).forEach(([key, value]) => {
    if (value == null || value === "") {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && item !== "") {
          url.searchParams.append(key, String(item))
        }
      })
      return
    }

    url.searchParams.set(key, String(value))
  })

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getPublishableApiKey()
      ? {
          "x-publishable-api-key": getPublishableApiKey(),
        }
      : undefined,
    next,
    cache: "force-cache",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`)
  }

  return (await response.json()) as T
}

export const listCategories = async (query?: Record<string, unknown>) => {
  const limit = query?.limit || 100

  const { product_categories } = await fetchCategories<{
    product_categories: HttpTypes.StoreProductCategory[]
  }>(
    {
      fields:
        "*category_children, *products, *parent_category, *parent_category.parent_category",
      limit,
      ...query,
    },
    { revalidate: 3600, tags: ["categories"] }
  )

  return product_categories
}

export const getCategoriesList = async (offset = 0, limit = 100) => {
  const product_categories = await listCategories({ offset, limit })

  return {
    product_categories,
    count: product_categories.length,
  }
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`
  const fallbackHandle = categoryHandle[categoryHandle.length - 1]

  const response = await fetchCategories<HttpTypes.StoreProductCategoryListResponse>(
    {
      fields:
        "*category_children, *products, *parent_category, *parent_category.parent_category",
      handle,
    },
    { revalidate: 3600, tags: ["categories"] }
  )

  let category = response.product_categories[0]

  if (!category && fallbackHandle && fallbackHandle !== handle) {
    const fallbackResponse = await fetchCategories<HttpTypes.StoreProductCategoryListResponse>(
      {
        fields:
          "*category_children, *products, *parent_category, *parent_category.parent_category",
        handle: fallbackHandle,
      },
      { revalidate: 3600, tags: ["categories"] }
    )

    category = fallbackResponse.product_categories[0]
  }

  // Resilient fallback lookup if handle has alternate slug formatting (e.g. healthandbeauty vs health-and-beauty)
  if (!category) {
    try {
      const allCategories = await listCategories()
      const cleanStr = (s?: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, "") || ""
      const cleanTarget = cleanStr(fallbackHandle || handle)

      if (cleanTarget) {
        const found = allCategories.find((c) => {
          const cleanH = cleanStr(c.handle)
          const cleanN = cleanStr(c.name)
          return (
            cleanH === cleanTarget ||
            cleanN === cleanTarget ||
            (cleanTarget.length > 3 && cleanH.includes(cleanTarget)) ||
            (cleanTarget.length > 3 && cleanTarget.includes(cleanH))
          )
        })

        if (found) {
          category = found
        }
      }
    } catch {
      // Fallback lookup error ignored
    }
  }

  if (!category) {
    return {
      product_categories: [],
    }
  }

  const product_categories: HttpTypes.StoreProductCategory[] = []
  let current: HttpTypes.StoreProductCategory | null | undefined = category

  while (current) {
    product_categories.unshift(current)
    current = current.parent_category ?? null
  }

  return {
    product_categories,
  }
}
