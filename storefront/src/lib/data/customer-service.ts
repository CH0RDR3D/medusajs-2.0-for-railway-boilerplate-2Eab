export interface FAQItem {
  id: string
  category: "Orders & Delivery" | "Payments & Lenco" | "Returns & Warranty" | "Vehicles & Auto Garage" | "Solar & Hardware" | "General & Account"
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
    email: "info@syastore.com",
    phone: "+260-978-883-420",
    phoneSecondary: "+260-966-666-608",
    whatsapp: "+260978883420",
    address: "Plot No. F/687/A/1/A/8, Makeni Road",
    city: "Lusaka",
    country: "Zambia",
    businessHours: "Monday - Saturday: 08:00 - 18:00 CAT | Sunday: 09:00 - 14:00 CAT",
  },
  faqs: [
    {
      id: "faq-1",
      category: "Orders & Delivery",
      question: "How long does delivery take in Lusaka and across Zambia?",
      answer: "Orders within Lusaka are fulfilled within 24 hours. For other provinces (Copperbelt, Livingstone, Ndola, Kitwe, etc.), delivery typically takes 2 to 4 business days via our secure logistics partners.",
    },
    {
      id: "faq-2",
      category: "Orders & Delivery",
      question: "Can I collect my items directly from your Makeni showroom?",
      answer: "Yes! You can choose 'Store Pickup' during checkout. Your items will be prepared and ready for collection at our Makeni Road facility with zero shipping fees.",
    },
    {
      id: "faq-3",
      category: "Payments & Lenco",
      question: "What payment options are available at checkout?",
      answer: "We accept Airtel Money, MTN Mobile Money, and Zamtel Kwacha via our integrated Lenco payment gateway, as well as Visa and Mastercard.",
    },
    {
      id: "faq-4",
      category: "Payments & Lenco",
      question: "Is paying online with Lenco secure?",
      answer: "Yes. All transactions through Lenco are encrypted with bank-grade SSL security and verified directly with your mobile network provider or card issuer.",
    },
    {
      id: "faq-5",
      category: "Returns & Warranty",
      question: "What is the return policy for SYA Store items?",
      answer: "We offer a 14-day return window for items in their original, unused condition with packaging intact. You can drop off items at our Makeni showroom or request a courier pickup.",
    },
    {
      id: "faq-6",
      category: "Returns & Warranty",
      question: "Do solar power equipment and appliances carry a warranty?",
      answer: "Yes, all solar panels, inverters, batteries, and appliances come with manufacturer warranties ranging from 12 months up to 5 years depending on the brand and model.",
    },
    {
      id: "faq-7",
      category: "Vehicles & Auto Garage",
      question: "How do I book auto repairs or a vehicle showroom viewing?",
      answer: "You can book directly by calling our service desk (+260-978-883-420), messaging us on WhatsApp, or visiting our Makeni Road garage for vehicle inspection, diagnostics, and car wash services.",
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
    subtitle: "Dependable 14-day return assurance for our valued customers",
    highlights: [
      "14 days eligibility from order delivery date",
      "Original packaging and labels required",
      "Free in-store return drop-off at Makeni showroom",
      "Mobile Money & Card refunds processed within 3-5 business days",
    ],
    content: [
      "We want you to be completely satisfied with your purchase. If a product does not meet your expectations, you may return it within 14 calendar days of delivery.",
      "Returned items must be unused, in the same condition that you received them, and in original packaging with intact seals.",
      "Non-returnable items include personalized items, consumable chemicals, and final clearance items.",
      "To initiate a return, contact our support team or bring your item and receipt to Plot No. F/687/A/1/A/8, Makeni Road, Lusaka.",
    ],
  },
  deliveryPolicy: {
    title: "Delivery Policy",
    subtitle: "Reliable shipping across Lusaka and all provinces in Zambia",
    highlights: [
      "Same-day / 24h delivery for Lusaka urban areas",
      "2 - 4 business days for nationwide provincial delivery",
      "Complimentary free store pickup at Makeni Road",
      "Real-time SMS & email dispatch notifications",
    ],
    content: [
      "We partner with dependable logistics couriers to ensure your order arrives safely and promptly.",
      "Delivery fees are calculated dynamically based on your coordinates and delivery address.",
      "Store Pick-Up: You will receive an SMS/WhatsApp alert when your order is ready for pickup at our Makeni Road facility.",
      "Always inspect package contents upon handover. If package seal appears damaged, please notify the courier driver immediately.",
    ],
  },
}

export async function getCustomerServiceData() {
  return customerServiceData
}

