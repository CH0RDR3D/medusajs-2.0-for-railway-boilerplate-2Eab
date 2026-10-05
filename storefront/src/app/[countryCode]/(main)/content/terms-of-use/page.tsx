import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Terms of Use | SYA Store",
  description:
    "Read the terms for shopping with SYA Store, operated by SYA General Dealers Ltd. in Zambia.",
}

const terms = [
  {
    title: "1. Legal entity and jurisdiction",
    paragraphs: [
      "SYA Store is operated by SYA General Dealers Ltd. These Terms of Use apply when you access or shop on the SYA Store website. By using the website or placing an order, you agree to these terms.",
      "These terms are governed by applicable Zambian law. Depending on the circumstances, disputes may be addressed through the Zambian courts or through mediation or arbitration where appropriate.",
    ],
  },
  {
    title: "2. Accounts and customer conduct",
    paragraphs: [
      "Provide accurate, current information when creating an account, placing an order, and entering delivery details. Keep your account credentials secure and tell us if you believe your account has been used without permission.",
      "Fraud, misuse of the website or its services, and resale of products without SYA Store's consent are prohibited.",
    ],
  },
  {
    title: "3. Product listings and orders",
    paragraphs: [
      "We work to keep product descriptions, images, availability, and prices accurate. Listings may contain errors or become unavailable, and website access may occasionally be interrupted. We may contact you if an issue affects an order.",
    ],
  },
  {
    title: "4. Payments",
    paragraphs: [
      "Accepted payment methods are Lenco online payments and cash where arranged with SYA Store. Orders must be paid in full before delivery. Any payment instructions or options presented for an order should be followed to complete the purchase.",
    ],
  },
  {
    title: "5. Delivery",
    paragraphs: [
      "Delivery is available within Zambia, with a focus on Lusaka. Estimated delivery times are communicated at checkout. We will notify you promptly about delays caused by circumstances such as traffic, weather, or courier issues.",
      "Please provide a correct delivery address and make arrangements to receive or collect your order. Incorrect address details or failure to collect may affect delivery responsibility.",
    ],
  },
  {
    title: "6. Returns and exchanges",
    paragraphs: [
      "Return requests must be made within 7 days of delivery. Products must be unused, in their original packaging, and accompanied by proof of purchase. Clearance items, consumables, and solar batteries may be excluded.",
      "Returns must be approved before an item is sent back. Approved returns are resolved by exchange or store credit only; cash refunds are not provided under this policy. Read the full details on our Returns & Exchanges page.",
    ],
  },
  {
    title: "7. Liability and service availability",
    paragraphs: [
      "SYA Store takes reasonable care to provide accurate listings and a reliable website but does not guarantee uninterrupted service or that all listings will be free of errors. To the extent permitted by applicable law, SYA Store is not liable for indirect damages beyond the value of the product purchased.",
    ],
  },
  {
    title: "8. Questions and complaints",
    paragraphs: [
      "Contact SYA Customer Care by phone or WhatsApp at +260976666611, or by email at info@syatore.com. Customer complaints are handled in line with applicable requirements, including the Zambian Consumer Protection Act.",
    ],
  },
]

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] py-10 sm:py-14">
      <article className="content-container mx-auto max-w-4xl px-4 sm:px-6">
        <header className="border-b border-[var(--surface-border)] pb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500">
            SYA General Dealers Ltd.
          </p>
          <h1 className="mt-3 text-3xl font-black text-[var(--text-primary)] sm:text-4xl">
            Terms of Use
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
            Terms for using SYA Store and placing shopping orders in Zambia.
          </p>
        </header>

        <div className="divide-y divide-[var(--surface-border)]">
          {terms.map((section) => (
            <section key={section.title} className="py-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-sm leading-7 text-[var(--text-secondary)]"
                >
                  {paragraph}
                </p>
              ))}
              {section.title.startsWith("6.") && (
                <LocalizedClientLink
                  href="/returns"
                  className="mt-3 inline-block text-sm font-semibold text-amber-500 hover:underline"
                >
                  View Returns & Exchanges Policy
                </LocalizedClientLink>
              )}
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}