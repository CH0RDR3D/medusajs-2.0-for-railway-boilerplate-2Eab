import { Metadata } from "next"
import ReturnsView from "@modules/returns/components/ReturnsView"
import { getCustomerServiceData } from "@lib/data/customer-service"

export const metadata: Metadata = {
  title: "Returns & Exchanges Policy | 14-Day Guarantee | SYA Store",
  description:
    "Learn about our 14-day return policy, warranty coverage, defective item replacement process, and submit a return inquiry.",
}

/**
 * Dedicated Returns & Exchanges Policy Page
 */
export default async function ReturnsPage() {
  const data = await getCustomerServiceData()

  return <ReturnsView data={data} />
}
