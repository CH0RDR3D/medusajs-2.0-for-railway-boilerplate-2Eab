export interface FAQItem {
  id: string
  category: "General" | "Orders & Payment" | "Shipping & Delivery" | "Returns & Refunds"
  question: string
  answer: string
}

export interface ContactInfo {
  email: string
  phone: string
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
    email: "support@newstore.co.zm",
    phone: "+260 97 123 4567",
    whatsapp: "+260 97 123 4567",
    address: "Great East Road, Manda Hill Shopping Centre",
    city: "Lusaka",
    country: "Zambia",
    businessHours: "Monday - Saturday: 08:00 - 18:00 CAT | Sunday: Closed",
  },
  faqs: [
    {
      id: "faq-1",
      category: "Orders & Payment",
      question: "What payment methods are supported?",
      answer: "We support Mobile Money (MTN, Airtel, Zamtel via Lenco), major Credit/Debit cards (Visa, Mastercard), and Cash on Pick-Up at our Lusaka store location.",
    },
    {
      id: "faq-2",
      category: "Orders & Payment",
      question: "How do I track my order status?",
      answer: "Once your order is placed, you can view real-time status in your Account Dashboard under 'Orders', or use the tracking reference sent via SMS and email.",
    },
    {
      id: "faq-3",
      category: "Shipping & Delivery",
      question: "How long does delivery take within Zambia?",
      answer: "Deliveries within Lusaka are fulfilled within 24 hours. Nationwide deliveries (Ndola, Kitwe, Livingstone, etc.) take 2 to 4 business days.",
    },
    {
      id: "faq-4",
      category: "Shipping & Delivery",
      question: "Can I collect my order in person?",
      answer: "Yes! Select 'Store Pickup' during checkout. Your order will be prepared at our Manda Hill store and ready for pickup free of delivery charges.",
    },
    {
      id: "faq-5",
      category: "Returns & Refunds",
      question: "What is your return policy?",
      answer: "We accept returns within 14 days of receipt for items in original, unused condition with tags attached. Please see our Returns & Refunds policy section for details.",
    },
    {
      id: "faq-6",
      category: "Returns & Refunds",
      question: "How quickly are refunds processed?",
      answer: "Once a returned item is inspected and approved, refunds are processed back to your original payment method (Mobile Money or Card) within 3 to 5 business days.",
    },
    {
      id: "faq-7",
      category: "General",
      question: "How can I change or update my order after placing it?",
      answer: "If your order has not been dispatched yet, contact customer support immediately via WhatsApp (+260 97 123 4567) or email to modify items or address.",
    },
  ],
  returnsPolicy: {
    title: "Returns & Refunds Policy",
    subtitle: "Hassle-free 14-day returns policy for eligible purchases",
    highlights: [
      "14 days eligibility from order delivery date",
      "Original packaging and labels required",
      "Free in-store return drop-off at Lusaka store",
      "Mobile Money & Card refund support within 3-5 business days",
    ],
    content: [
      "We want you to be completely satisfied with your purchase. If a product does not meet your expectations, you may return it within 14 calendar days of delivery.",
      "Returned items must be unused, in the same condition that you received them, and in original packaging with intact seals.",
      "Non-returnable items include personalized goods, digital downloads, hygiene items, and clearance final-sale items.",
      "To initiate a return, contact our support team or bring your item and order confirmation to our store located at Great East Road, Manda Hill Shopping Centre, Lusaka.",
    ],
  },
  deliveryPolicy: {
    title: "Delivery Policy",
    subtitle: "Fast, reliable shipping across Lusaka and all provinces in Zambia",
    highlights: [
      "Same-day / 24h delivery for Lusaka urban areas",
      "2 - 4 business days for nationwide provincial delivery",
      "Complimentary free store pickup available",
      "Real-time SMS & email dispatch notifications",
    ],
    content: [
      "We partner with reliable local couriers to ensure your order arrives safely and promptly.",
      "Delivery fees are calculated dynamically based on your delivery address and selected shipping option at checkout.",
      "Store Pick-Up: You will receive an SMS alert when your order is ready for pickup at our Manda Hill store. Pickups are available Monday to Saturday, 08:00 - 18:00 CAT.",
      "Inspect package contents upon delivery. If package seal appears damaged, please notify the courier driver immediately and report to support.",
    ],
  },
}

export async function getCustomerServiceData() {
  return customerServiceData
}
