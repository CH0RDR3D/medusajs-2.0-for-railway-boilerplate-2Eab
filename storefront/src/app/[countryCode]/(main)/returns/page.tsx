import { Metadata } from "next"
import ReturnsView from "@modules/returns/components/ReturnsView"
import { getCustomerServiceData } from "@lib/data/customer-service"

export const metadata: Metadata = {
  title: "Returns & Exchanges Policy | 7-Day Return Window | SYA Store",
  description:
    "Review SYA Store's 7-day return window, eligibility requirements, exchange and store credit policy, and how to request approval.",
}

/**
 * Dedicated Returns & Exchanges Policy Page
 */
export default async function ReturnsPage() {
  const data = await getCustomerServiceData()

  return <ReturnsView data={data} />
}
