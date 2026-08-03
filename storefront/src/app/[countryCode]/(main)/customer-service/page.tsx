import { Metadata } from "next"
import CustomerServiceView from "@modules/customer-service/components/customer-service-view"
import { getCustomerServiceData } from "@lib/data/customer-service"

export const metadata: Metadata = {
  title: "Customer Service | Contact Info, FAQs, Returns & Delivery",
  description: "Customer service hub for NewStore. Find contact info, FAQs, return policies, and delivery information.",
}

export default async function CustomerServicePage() {
  const data = await getCustomerServiceData()

  return <CustomerServiceView data={data} />
}
