import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getDailyDealsProducts } from "@lib/util/curated-products"
import DealsTemplate from "@modules/deals/templates/DealsTemplate"

export const revalidate = 0

export const metadata: Metadata = {
  title: "Today's Deals - Daily Discounts & Offers",
  description: "Exclusive daily deals and promotional prices, updated every 24 hours.",
}

type Params = {
  params: Promise<{
    countryCode: string
  }>
}

export default async function DealsPage(props: Params) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  if (!region) {
    return notFound()
  }

  // Fetch candidate products (up to 100 products)
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit: 100 },
  })

  // Curate today's deals using the Date function seed
  const dealsProducts = getDailyDealsProducts(products, 12)
  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <DealsTemplate
      dealsProducts={dealsProducts}
      allProducts={products}
      region={region}
      todayDate={todayDate}
    />
  )
}
