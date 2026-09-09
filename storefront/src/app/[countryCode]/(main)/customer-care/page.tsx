import { Metadata } from "next"
import CustomerCareView from "@modules/customer-care/components/CustomerCareView"
import { getCustomerServiceData } from "@lib/data/customer-service"

export const metadata: Metadata = {
  title: "FAQs & Delivery Tracking | Support Hub | SYA Store",
  description:
    "Search frequently asked questions, learn about Lusaka 24h express delivery, store pickup at Makeni, and payment methods.",
}

export default async function CustomerCarePage() {
  const data = await getCustomerServiceData()

  return <CustomerCareView data={data} />
}
