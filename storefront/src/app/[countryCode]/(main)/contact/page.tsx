import { Metadata } from "next"
import ContactView from "@modules/contact/components/ContactView"
import { getCustomerServiceData } from "@lib/data/customer-service"

export const metadata: Metadata = {
  title: "Contact Customer Support | SYA Store Lusaka",
  description:
    "Get in touch with SYA Store. Contact our customer support team, visit our Makeni showroom, call our hotline, or send us an inquiry.",
}

/**
 * Dedicated Contact Customer Support Page
 */
export default async function ContactPage() {
  const data = await getCustomerServiceData()

  return <ContactView data={data} />
}
