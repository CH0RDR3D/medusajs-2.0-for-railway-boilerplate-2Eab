import { Metadata } from "next"
import { listCategories } from "@lib/data/categories"
import { getProductsList, getDailyCuratedProductIds, getProductsById } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import CustomHomeLayout from "@modules/home/components/custom-home"
import { shuffle } from "lodash"

export const revalidate = 0


export const metadata: Metadata = {
  title: "SYA Store - Lusaka's Premier Online Shopping Destination",
  description:
    "SYA Store is your one-stop online shop for a wide range of products, from electronics to fashion. Enjoy fast delivery and excellent customer service. Lusaka's Premier Online Shopping Destination. Shop now and experience the convenience of online shopping with SYA Store.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  // Fetch categories and products from Medusa backend
  const categories = await listCategories()
  const { response: { products } } = await getProductsList({
    countryCode,
    queryParams: { limit: 100 },
  })

  // Dynamically fetch today's trending "Editor's Pick" products
  const editorsPickIds = await getDailyCuratedProductIds({
    countryCode,
    kind: "editors-pick",
    count: 12,
  })
  const editorsPickProducts = await getProductsById({
    ids: editorsPickIds,
    regionId: region.id,
  })

  const shuffledProducts = shuffle(products || []).slice(0, 12)

  return (
    <CustomHomeLayout
      categories={categories || []}
      products={shuffledProducts}
      editorsPickProducts={editorsPickProducts}
      region={region}
    />
  )
}
