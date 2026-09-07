import { Metadata } from "next"
import CustomerCareView from "@modules/customer-care/components/CustomerCareView"
import { getCustomerServiceData } from "@lib/data/customer-service"

export const metadata: Metadata = {
  title: "Returns & Exchanges | SYA Store",
  description:
    "Learn about our 14-day return policy, warranty coverage, defective item replacement process, and submit a return inquiry.",
}

export default async function ReturnsPage() {
  const data = await getCustomerServiceData()

  return <CustomerCareView data={data} initialCategory="Returns & Warranty" />
}
