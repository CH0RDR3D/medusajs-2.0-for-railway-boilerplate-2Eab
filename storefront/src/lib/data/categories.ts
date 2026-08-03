import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, unknown>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
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

  const next = {
    ...(await getCacheOptions("categories")),
  }

  const response = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
    `/store/product-categories`,
    {
      query: {
        fields:
          "*category_children, *products, *parent_category, *parent_category.parent_category",
        handle,
      },
      next,
      cache: "force-cache",
    }
  )

  let category = response.product_categories[0]

  if (!category && fallbackHandle && fallbackHandle !== handle) {
    const fallbackResponse = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          handle: fallbackHandle,
        },
        next,
        cache: "force-cache",
      }
    )

    category = fallbackResponse.product_categories[0]
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
