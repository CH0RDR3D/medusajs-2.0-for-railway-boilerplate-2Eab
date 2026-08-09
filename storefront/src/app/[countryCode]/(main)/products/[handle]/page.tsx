import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

const getMedusaBackendUrl = () =>
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const getPublishableApiKey = () =>
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const fetchProductByHandle = async (
  handle: string,
  regionId: string
): Promise<HttpTypes.StoreProduct | null> => {
  const url = new URL(`${getMedusaBackendUrl()}/store/products`)
  url.searchParams.set("handle", handle)
  url.searchParams.set("region_id", regionId)
  url.searchParams.set("limit", "1")
  url.searchParams.set(
    "fields",
    "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,*variants.prices,*collection,*categories,*images"
  )

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getPublishableApiKey()
        ? {
            "x-publishable-api-key": getPublishableApiKey(),
          }
        : undefined,
      cache: "force-cache",
      next: { revalidate: 300, tags: ["products"] },
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as {
      products?: HttpTypes.StoreProduct[]
    }

    return data.products?.[0] ?? null
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const product = await fetchProductByHandle(handle, region.id)

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | SYA Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | SYA Store`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { countryCode, handle } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await fetchProductByHandle(handle, region.id)
  if (!pricedProduct) {
    notFound()
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={countryCode}
    />
  )
}
