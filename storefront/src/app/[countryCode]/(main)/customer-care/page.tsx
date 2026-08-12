import { Metadata } from "next"
import CustomerCareView from "@modules/customer-care/components/CustomerCareView"
import { getCustomerServiceData } from "@lib/data/customer-service"

export const metadata: Metadata = {
  title: "Customer Care | Support, FAQs & Contact Us",
  description: "Customer Care support hub. View FAQs, contact us directly via our form, and learn about returns and delivery policies.",
}

export default async function CustomerCarePage() {
  const data = await getCustomerServiceData()

  return <CustomerCareView data={data} />
}
