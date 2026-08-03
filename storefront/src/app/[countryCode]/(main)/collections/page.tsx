import { Metadata } from "next"
import { listCollections } from "@lib/data/collections"
import AllCollectionsTemplate from "@modules/collections/templates/all-collections"

export const metadata: Metadata = {
  title: "Collections | SYA Store",
  description: "Browse our curated product collections.",
}

export default async function CollectionsIndexPage() {
  const { collections } = await listCollections({ fields: "*products" })

  return <AllCollectionsTemplate collections={collections ?? []} />
}
