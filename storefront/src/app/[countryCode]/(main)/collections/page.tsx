import { Metadata } from "next"
import { listCollections } from "@lib/data/collections"
import AllCollectionsTemplate from "@modules/collections/templates/all-collections"

export const metadata: Metadata = {
  title: "Collections | SYA Store",
  description: "Browse our curated product collections.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function CollectionsIndexPage(props: Props) {
  const params = await props.params
  const { collections } = await listCollections({ fields: "*products" })

  return <AllCollectionsTemplate collections={collections ?? []} />
}
