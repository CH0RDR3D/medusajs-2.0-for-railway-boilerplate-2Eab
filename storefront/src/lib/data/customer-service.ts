export interface FAQItem {
  id: string
  category: "Products & Shopping" | "Orders & Delivery" | "Payments & Lenco" | "Returns & Warranty" | "Solar & Hardware" | "General & Account"
  question: string
  answer: string
}

export interface ContactInfo {
  email: string
  phone: string
  phoneSecondary: string
  whatsapp: string
  address: string
  city: string
  country: string
  businessHours: string
}

export interface PolicySection {
  title: string
  subtitle: string
  highlights: string[]
  content: string[]
}

export interface CustomerServiceData {
  contactInfo: ContactInfo
  faqs: FAQItem[]
  returnsPolicy: PolicySection
  deliveryPolicy: PolicySection
}

export const customerServiceData: CustomerServiceData = {
  contactInfo: {
    email: "info@syatore.com",
    phone: "+260976666611",
    phoneSecondary: "",
    whatsapp: "+260976666611",
    address: "Plot No. F/687/A/1/A/8, Makeni Road",
    city: "Lusaka",
    country: "Zambia",
    businessHours: "Monday - Friday: 08:00 - 17:00 CAT",
  },
  faqs: [
    {
      id: "faq-10",
      category: "Products & Shopping",
      question: "How can I find a product or check whether it is available?",
      answer: "Browse the SYA Store catalog by category or search by product name. Product details and available options are shown on each listing. Contact Customer Care if you need help before placing an order.",
    },
    {
      id: "faq-1",
      category: "Orders & Delivery",
      question: "Where does SYA Store deliver, and when will my order arrive?",
      answer: "Delivery is available within Zambia, with a focus on Lusaka. Your estimated delivery time is provided at checkout. We will notify you promptly if an unforeseen delay affects your order.",
    },
    {
      id: "faq-2",
      category: "Orders & Delivery",
      question: "Can I collect my items directly from your Makeni showroom?",
      answer: "Where available, select Store Pickup at checkout. We will contact you when your order is ready for collection at our Makeni Road location.",
    },
    {
      id: "faq-3",
      category: "Payments & Lenco",
      question: "What payment options are available at checkout?",
      answer: "We accept online payments through Lenco and cash. Payment must be made in full before your order is delivered. Available options will be confirmed when you place your order.",
    },
    {
      id: "faq-4",
      category: "Payments & Lenco",
      question: "Is paying online with Lenco secure?",
      answer: "Lenco processes online payments. Follow the secure payment steps shown at checkout and contact Customer Care if you need help with a transaction.",
    },
    {
      id: "faq-5",
      category: "Returns & Warranty",
      question: "What is the return policy for SYA Store items?",
      answer: "You may request a return within 7 days of delivery. Items must be unused, in their original packaging, and accompanied by proof of purchase. Approved returns are eligible for an exchange or store credit only; cash refunds are not provided. Clearance items, consumables, and solar batteries may be excluded.",
    },
    {
      id: "faq-6",
      category: "Returns & Warranty",
      question: "Do solar power equipment and appliances carry a warranty?",
      answer: "Yes, all solar panels, inverters, batteries, and appliances come with manufacturer warranties ranging from 12 months up to 5 years depending on the brand and model.",
    },
    {
      id: "faq-7",
      category: "General & Account",
      question: "How do I raise a concern about my order or shopping experience?",
      answer: "Contact SYA Customer Care by phone, WhatsApp, or email with your order number and details of the issue. Complaints are handled in line with applicable Zambian consumer protection requirements.",
    },
    {
      id: "faq-8",
      category: "Solar & Hardware",
      question: "Do you offer solar installation and site inspection?",
      answer: "Yes, our certified technicians provide residential and commercial solar assessments, customized power sizing, inverter configuration, and full turnkey installation.",
    },
    {
      id: "faq-9",
      category: "General & Account",
      question: "How do I update my profile, address, or track my orders?",
      answer: "Sign in to your SYA Account using email or Google One-Tap. Under 'Account', you can view recent orders, manage saved delivery addresses, and update your details.",
    },
  ],
  returnsPolicy: {
    title: "Returns & Refunds Policy",
    subtitle: "Clear, product-focused support for eligible returns within 7 days",
    highlights: [
      "Request a return within 7 days of delivery",
      "Items must be unused and in original packaging",
      "Proof of purchase is required; approval is needed before return",
      "Exchanges or store credit only; no cash refunds",
      "Clearance items, consumables, and solar batteries may be excluded",
    ],
    content: [
      "You may request a return within 7 days of delivery. Returned products must be unused, in their original packaging, and accompanied by proof of purchase.",
      "Some products may be excluded from returns, including clearance items, consumables, and solar batteries. Contact Customer Care to confirm eligibility before sending an item back.",
      "Approved returns are resolved by exchange or store credit only. SYA Store does not provide cash refunds under this policy.",
      "Returns must be approved before items are sent back. Start a request by phone or WhatsApp at +260976666611, or email info@syatore.com.",
    ],
  },
  deliveryPolicy: {
    title: "Delivery Policy",
    subtitle: "Reliable shipping across Lusaka and all provinces in Zambia",
    highlights: [
      "Delivery available within Zambia, with a focus on Lusaka",
      "Estimated delivery time is provided at checkout",
      "Pickup availability is shown during checkout",
      "Customers are responsible for providing a correct address and being available to receive orders",
    ],
    content: [
      "SYA Store and its delivery carriers share responsibility for handling orders safely. Delivery fees and estimated timelines are shown during checkout.",
      "We will notify customers promptly about delays caused by circumstances such as traffic, weather, or courier issues.",
      "Customers are responsible for providing an accurate delivery address and collecting or receiving their order. Additional responsibility may apply where delivery fails because of incorrect details or failure to collect.",
      "Where Store Pickup is available, we will contact you when your order is ready at our Makeni Road location.",
    ],
  },
}

export async function getCustomerServiceData() {
  return customerServiceData
}

