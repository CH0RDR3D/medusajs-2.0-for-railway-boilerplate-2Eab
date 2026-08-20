import { getProductsListWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { SessionShuffledProductGrid, ProductGridWithoutShuffle } from "@modules/store/components/session-shuffled-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  category,
  tag,
  query,
  productsIds,
  countryCode,
  shuffle = true,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  category?: string
  tag?: string
  query?: string
  productsIds?: string[]
  countryCode: string
  shuffle?: boolean
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 100,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await getProductsListWithSort({
    page: 1,
    queryParams,
    sortBy,
    tag,
    category,
    q: query,
    countryCode,
  })

  const totalPages = Math.ceil(Math.min(count, products.length) / PRODUCT_LIMIT)

  return (
    <>
      {shuffle ? (
        <SessionShuffledProductGrid
          products={products}
          region={region}
          page={page}
          totalPages={totalPages}
          storageKey={[collectionId || "all", categoryId || "all", tag || "all", category || "all", sortBy || "created_at"].join(":")}
        />
      ) : (
        <ProductGridWithoutShuffle
          products={products}
          region={region}
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
