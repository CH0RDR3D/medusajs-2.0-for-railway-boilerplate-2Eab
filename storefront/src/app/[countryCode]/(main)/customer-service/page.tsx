import { Metadata } from "next"
import CustomerCareView from "@modules/customer-care/components/CustomerCareView"
import { getCustomerServiceData } from "@lib/data/customer-service"

export const metadata: Metadata = {
  title: "Customer Care & Support | SYA Store",
  description: "Customer Care support hub for SYA Store. Find contact info, FAQs, return policies, and delivery information.",
}

/**
 * Legacy customer-service route preserved for backwards compatibility,
 * rendering the unified Customer Care support view.
 */
export default async function CustomerServicePage() {
  const data = await getCustomerServiceData()

  return <CustomerCareView data={data} />
}
