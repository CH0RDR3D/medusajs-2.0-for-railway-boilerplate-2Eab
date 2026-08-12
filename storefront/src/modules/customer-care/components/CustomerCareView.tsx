"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { CustomerServiceData } from "@lib/data/customer-service"
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
} from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

function Glow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full bg-amber-500/10 blur-[120px] ${className}`}
      aria-hidden
    />
  )
}

export default function CustomerCareView({ data }: { data: CustomerServiceData }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1")

  // Form states
  const [formValues, setFormValues] = useState({ name: "", email: "", subject: "", message: "" })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { contactInfo, faqs } = data

  const filteredFaqs = faqs.filter((f: FAQ) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    )
  })

  // Form validation
  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {}
    if (!formValues.name.trim()) tempErrors.name = "Full name is required."
    
    if (!formValues.email.trim()) {
      tempErrors.email = "Email address is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      tempErrors.email = "Please enter a valid email address."
    }

    if (!formValues.subject.trim()) tempErrors.subject = "Subject is required."
    
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

    // Simulate API request
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
      setFormValues({ name: "", email: "", subject: "", message: "" })
      setErrors({})
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-20 relative overflow-hidden select-none">
      <Glow className="-top-40 right-0 h-[500px] w-[500px]" />
      <Glow className="top-1/2 -left-40 h-[400px] w-[400px] opacity-60" />

      {/* HERO SECTION */}
      <section className="relative px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative max-w-3xl"
        >
          <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold mb-6">
            Customer Care Support
          </span>
          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
            We are here to help.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-neutral-400 md:text-lg">
            Got questions about your order, delivery policies, or returns? Browse our frequently asked questions below or write to us directly.
          </p>
        </motion.div>
      </section>

      {/* FAQs SECTION */}
      <section className="px-6 max-w-6xl mx-auto mb-20">
        <div className="bg-[var(--bg-card)] border border-white/10 rounded-[32px] p-6 md:p-10 shadow-xl relative z-10">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Frequently asked.</h2>
              <p className="text-xs text-neutral-500 mt-1">Quick answers to common questions</p>
            </div>
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                aria-label="Search frequently asked questions"
              />
            </div>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filteredFaqs.map((faq: FAQ) => {
                const isOpen = openFaq === faq.id
                return (
                  <div key={faq.id} className="py-1">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-lg px-2"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base font-semibold tracking-tight md:text-lg hover:text-amber-400 transition duration-150">
                        {faq.question}
                      </span>
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/15 text-amber-400">
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
                          <p className="pb-6 px-2 text-sm leading-relaxed text-neutral-400 md:text-base">
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
            <div className="rounded-[24px] border border-white/5 bg-white/[0.01] py-16 text-center text-neutral-500">
              No matching questions found for "{searchQuery}".
            </div>
          )}
        </div>
      </section>

      {/* CONTACT & SUPPORT GRID */}
      <section className="px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Support Direct Contacts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight">Direct Support</h2>
            <p className="text-sm text-neutral-400 mt-2">
              Feel free to reach out to our team via standard communication channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Phone */}
            <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-6 flex items-start gap-4">
              <div className="p-3 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/20">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Call Us</h3>
                <p className="mt-1 text-sm font-semibold">{contactInfo.phone}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{contactInfo.businessHours}</p>
              </div>
            </div>

            {/* Email */}
            <a
              href={`mailto:${contactInfo.email}`}
              className="rounded-[24px] border border-white/10 bg-white/[0.02] p-6 flex items-start gap-4 hover:border-amber-400/30 hover:bg-white/[0.04] transition duration-150 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              <div className="p-3 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/20">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Email Us</h3>
                <p className="mt-1 text-sm font-semibold break-all">{contactInfo.email}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Replies within 24 hours</p>
              </div>
            </a>

            {/* Location */}
            <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-6 flex items-start gap-4 sm:col-span-2 lg:col-span-1">
              <div className="p-3 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/20">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Visit Store</h3>
                <p className="mt-1 text-sm font-semibold">{contactInfo.address}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {contactInfo.city}, {contactInfo.country}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Container */}
        <div className="lg:col-span-7 bg-[var(--bg-card)] border border-white/10 rounded-[32px] p-6 md:p-10 shadow-xl">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight">Send a Message</h2>
            <p className="text-xs text-neutral-500 mt-1">We typically reply within a few hours</p>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
              >
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-neutral-400">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      value={formValues.name}
                      onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                      className={`w-full rounded-xl border bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition duration-150 ${
                        errors.name ? "border-red-500" : "border-white/10"
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-neutral-400">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={formValues.email}
                      onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                      className={`w-full rounded-xl border bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition duration-150 ${
                        errors.email ? "border-red-500" : "border-white/10"
                      }`}
                      placeholder="johndoe@example.com"
                    />
                    {errors.email && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subject" className="text-xs font-semibold text-neutral-400">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="subject"
                      value={formValues.subject}
                      onChange={(e) => setFormValues({ ...formValues, subject: e.target.value })}
                      className={`w-full rounded-xl border bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition duration-150 ${
                        errors.subject ? "border-red-500" : "border-white/10"
                      }`}
                      placeholder="Order Inquiry / Return Request"
                    />
                    {errors.subject && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  {errors.subject && <p className="text-xs text-red-500 mt-0.5">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-xs font-semibold text-neutral-400">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      rows={5}
                      value={formValues.message}
                      onChange={(e) => setFormValues({ ...formValues, message: e.target.value })}
                      className={`w-full rounded-xl border bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition duration-150 resize-none ${
                        errors.message ? "border-red-500" : "border-white/10"
                      }`}
                      placeholder="Write details of your message here..."
                    />
                    {errors.message && (
                      <span className="absolute right-3 top-4 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  {errors.message && <p className="text-xs text-red-500 mt-0.5">{errors.message}</p>}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-amber-500/50 text-black text-sm font-bold py-3.5 transition duration-150 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="text-center py-10"
              >
                <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full mb-6">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Message Sent!</h3>
                <p className="text-sm text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
                  Thank you for reaching out. We have received your query and our Customer Care team will respond back to you at your email address shortly.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-2.5 rounded-full border border-white/10 hover:bg-white/5 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </section>
    </div>
  )
}
