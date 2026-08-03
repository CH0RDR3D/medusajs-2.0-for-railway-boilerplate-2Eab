import { Metadata } from "next"
import { listCategories } from "@lib/data/categories"
import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import CustomHomeLayout from "@modules/home/components/custom-home"
import { shuffle } from "lodash"

export const revalidate = 0


export const metadata: Metadata = {
  title: "eStorefront - A BLVCK Inc. Ecommerce Site",
  description:
    "A Blvck Inc. Store crafted to showcase products beautifully, built for performance and customer delight.",
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
    queryParams: { limit: 12 },
  })

  // Shuffle products so the homepage looks fresh on every load
  const shuffledProducts = products ? shuffle(products) : []

  return (
    <CustomHomeLayout
      categories={categories || []}
      products={shuffledProducts}
      region={region}
    />
  )
}
