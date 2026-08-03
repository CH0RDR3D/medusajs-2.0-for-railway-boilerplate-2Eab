import { redirect } from "next/navigation"

type Props = {
  params: Promise<{
    countryCode: string
  }>
}

export default async function TodaysDealsPage(props: Props) {
  const params = await props.params
  redirect(`/${params.countryCode}/deals`)
}
