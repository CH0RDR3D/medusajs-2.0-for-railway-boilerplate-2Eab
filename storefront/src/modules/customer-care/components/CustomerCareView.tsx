"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { CustomerServiceData, FAQItem } from "@lib/data/customer-service"
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Package,
  RotateCcw,
  CreditCard,
  Truck,
  Wrench,
  Sun,
  Search,
  ExternalLink,
  Clock,
} from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

// Quick Topic Card Definitions for Amazon-style issue navigation
const QUICK_TOPICS = [
  {
    id: "orders",
    title: "Your Orders & Tracking",
    description: "Track deliveries, review past purchases, or cancel items",
    icon: Package,
    action: "Track Orders",
    href: "/account/orders",
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    description: "Return defective items within 14 days or request replacement",
    icon: RotateCcw,
    action: "View Policy",
    targetCategory: "Returns & Warranty",
  },
  {
    id: "payments",
    title: "Payments & Lenco",
    description: "Mobile Money (Airtel, MTN, Zamtel) and card transaction help",
    icon: CreditCard,
    action: "Payment FAQs",
    targetCategory: "Payments & Lenco",
  },
  {
    id: "delivery",
    title: "Delivery & Store Pickup",
    description: "Lusaka 24h express shipping and Makeni showroom pickup",
    icon: Truck,
    action: "Delivery Info",
    targetCategory: "Orders & Delivery",
  },
  {
    id: "garage",
    title: "Auto Garage & Vehicles",
    description: "Book showroom test drives, vehicle diagnostics, or car wash",
    icon: Wrench,
    action: "Garage Info",
    targetCategory: "Vehicles & Auto Garage",
  },
  {
    id: "solar",
    title: "Solar Power Systems",
    description: "Residential & commercial solar power sizing and installation",
    icon: Sun,
    action: "Solar Support",
    targetCategory: "Solar & Hardware",
  },
]

export default function CustomerCareView({ data }: { data: CustomerServiceData }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1")

  // Contact Form state
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "General Inquiry",
    orderNumber: "",
    message: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { contactInfo, faqs } = data

  // Extract unique categories for category pills
  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map((f) => f.category)))
    return ["All", ...cats]
  }, [faqs])

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return faqs.filter((f: FAQItem) => {
      const matchesCategory = selectedCategory === "All" || f.category === selectedCategory
      const matchesQuery =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [faqs, searchQuery, selectedCategory])

  // Form validation handler
  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {}
    if (!formValues.name.trim()) tempErrors.name = "Full name is required."

    if (!formValues.email.trim()) {
      tempErrors.email = "Email address is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      tempErrors.email = "Please enter a valid email address."
    }

    if (!formValues.message.trim()) {
      tempErrors.message = "Message is required."
    } else if (formValues.message.trim().length < 10) {
      tempErrors.message = "Message must be at least 10 characters long."
    }

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Simulate API submission
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setIsSuccess(true)
      setFormValues({
        name: "",
        email: "",
        phone: "",
        topic: "General Inquiry",
        orderNumber: "",
        message: "",
      })
      setErrors({})
    } catch (err) {
      console.error("[CustomerCare] Submission error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTopicSelect = (topic: typeof QUICK_TOPICS[number]) => {
    if (topic.targetCategory) {
      setSelectedCategory(topic.targetCategory)
      const element = document.getElementById("faq-section")
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-24 transition-colors duration-200">
      {/* ── HERO BANNER: Amazon-inspired Help Center Header ── */}
      <section className="relative overflow-hidden border-b border-[var(--surface-border)] bg-[var(--bg-card)] py-14 md:py-20">
        <div className="content-container max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs uppercase tracking-widest text-amber-500 font-bold mb-4">
              <MessageSquare className="w-3.5 h-3.5" /> Customer Care Hub
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] leading-tight">
              Hello. What can we help you with?
            </h1>
            <p className="mt-4 text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
              Find immediate answers to frequent questions, track active orders, or get in touch with the SYA Store customer support team.
            </p>

            {/* Quick Live Search Bar */}
            <div className="mt-8 relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Search className="w-5 h-5 text-amber-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type your question or keyword (e.g. tracking, Lenco payment, Makeni pickup, solar)..."
                className="w-full pl-12 pr-4 py-3.5 text-sm rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder-[var(--text-muted)] shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                aria-label="Search help topics"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── QUICK TOPICS TILES (Amazon style) ── */}
      <section className="content-container max-w-6xl mx-auto px-4 sm:px-6 pt-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Browse Help Topics
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Select an issue category for quick guidance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_TOPICS.map((topic) => {
            const Icon = topic.icon
            if (topic.href) {
              return (
                <LocalizedClientLink
                  key={topic.id}
                  href={topic.href}
                  className="group flex flex-col justify-between p-5 rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] hover:border-amber-500/50 hover:shadow-md transition duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition duration-150">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--surface-border)] flex items-center justify-between text-xs font-semibold text-amber-500">
                    <span>{topic.action}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </LocalizedClientLink>
              )
            }

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTopicSelect(topic)}
                className="group flex flex-col justify-between p-5 rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] hover:border-amber-500/50 hover:shadow-md transition text-left duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition duration-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition duration-150">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--surface-border)] flex items-center justify-between text-xs font-semibold text-amber-500 w-full">
                  <span>{topic.action}</span>
                  <span>→</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── FAQ ACCORDION SECTION ── */}
      <section id="faq-section" className="content-container max-w-6xl mx-auto px-4 sm:px-6 pt-16">
        <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-6 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">
                Frequently Asked Questions
              </h2>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">
                Answers to common inquiries regarding shopping, logistics, solar solutions, and auto care.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-black shadow-sm"
                      : "bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--surface-border)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="divide-y divide-[var(--surface-border)]">
              {filteredFaqs.map((faq: FAQItem) => {
                const isOpen = openFaq === faq.id
                return (
                  <div key={faq.id} className="py-2">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-4 py-4 text-left focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-lg px-2"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {faq.category}
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)] hover:text-amber-500 transition duration-150">
                          {faq.question}
                        </span>
                      </div>
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[var(--surface-border)] text-amber-500">
                        {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 px-3 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-[var(--text-muted)] text-sm">
              No matching questions found for &ldquo;{searchQuery}&rdquo;. Try another keyword or message our support team below.
            </div>
          )}
        </div>
      </section>

      {/* ── DIRECT CONTACT & INTERACTIVE FORM ── */}
      <section className="content-container max-w-6xl mx-auto px-4 sm:px-6 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Direct Support Information */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                Direct Channels
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] mt-1">
                Reach out anytime
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                Our support desk in Lusaka is available to answer questions, process orders, and arrange vehicle or solar consultations.
              </p>
            </div>

            <div className="space-y-4">
              {/* Phone Hotlines */}
              <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-5 flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Call Support</h3>
                  <div className="mt-1 space-y-0.5">
                    <a href={`tel:${contactInfo.phone}`} className="block text-sm font-bold text-[var(--text-primary)] hover:text-amber-500 transition">
                      {contactInfo.phone}
                    </a>
                    {contactInfo.phoneSecondary && (
                      <a href={`tel:${contactInfo.phoneSecondary}`} className="block text-xs font-medium text-[var(--text-secondary)] hover:text-amber-500 transition">
                        {contactInfo.phoneSecondary}
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {contactInfo.businessHours}
                  </p>
                </div>
              </div>

              {/* Email Support */}
              <a
                href={`mailto:${contactInfo.email}`}
                className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-5 flex items-start gap-4 hover:border-amber-500/50 transition duration-150 group"
              >
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Email Us</h3>
                  <p className="mt-1 text-sm font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition">
                    {contactInfo.email}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">Average response time: within 4 hours</p>
                </div>
              </a>

              {/* Physical Showroom Location */}
              <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-5 flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Visit Showroom & Garage</h3>
                  <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{contactInfo.address}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {contactInfo.city}, {contactInfo.country}
                  </p>
                  <p className="text-[11px] text-amber-500 font-semibold mt-2">
                    Free Store Pickup & Garage Diagnostics Available
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7 rounded-3xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Send a Support Ticket</h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Fill out the details below and an SYA Customer Care specialist will get back to you promptly.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Name & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="name" className="text-xs font-semibold text-[var(--text-secondary)]">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formValues.name}
                        onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                        className={`w-full rounded-xl border bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                          errors.name ? "border-red-500" : "border-[var(--surface-border)]"
                        }`}
                        placeholder="e.g. Mwamba Banda"
                      />
                      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="email" className="text-xs font-semibold text-[var(--text-secondary)]">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formValues.email}
                        onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                        className={`w-full rounded-xl border bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                          errors.email ? "border-red-500" : "border-[var(--surface-border)]"
                        }`}
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Topic & Order Reference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="topic" className="text-xs font-semibold text-[var(--text-secondary)]">
                        Topic Category
                      </label>
                      <select
                        id="topic"
                        value={formValues.topic}
                        onChange={(e) => setFormValues({ ...formValues, topic: e.target.value })}
                        className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Order & Delivery Status">Order & Delivery Status</option>
                        <option value="Payment & Lenco">Payment & Lenco Question</option>
                        <option value="Returns & Warranty">Returns & Warranty</option>
                        <option value="Vehicle / Garage Service">Vehicle / Garage Service Booking</option>
                        <option value="Solar Installation Quote">Solar Installation Quote</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="orderNumber" className="text-xs font-semibold text-[var(--text-secondary)]">
                        Order Number (Optional)
                      </label>
                      <input
                        type="text"
                        id="orderNumber"
                        value={formValues.orderNumber}
                        onChange={(e) => setFormValues({ ...formValues, orderNumber: e.target.value })}
                        className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                        placeholder="e.g. #1024"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="message" className="text-xs font-semibold text-[var(--text-secondary)]">
                      Message Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formValues.message}
                      onChange={(e) => setFormValues({ ...formValues, message: e.target.value })}
                      className={`w-full rounded-xl border bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500 transition resize-none ${
                        errors.message ? "border-red-500" : "border-[var(--surface-border)]"
                      }`}
                      placeholder="Please describe how we can assist you..."
                    />
                    {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-black text-sm font-bold py-3.5 transition duration-150 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting Ticket...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4" />
                        <span>Send Ticket to Customer Care</span>
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-10"
                >
                  <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full mb-4">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Ticket Submitted Successfully!</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you for contacting SYA Customer Care. A representative will review your message and reach out to your provided email address shortly.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-6 py-2.5 rounded-full border border-[var(--surface-border)] hover:bg-[var(--bg-base)] text-xs font-semibold text-[var(--text-primary)] transition"
                  >
                    Submit another inquiry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>
    </div>
  )
}
