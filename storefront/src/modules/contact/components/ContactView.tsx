"use client"

import React, { useState } from "react"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Headphones,
  ExternalLink,
} from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { CustomerServiceData } from "@lib/data/customer-service"

interface ContactViewProps {
  data: CustomerServiceData
}

export default function ContactView({ data }: ContactViewProps) {
  const { contactInfo } = data

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    department: "Order Support & Tracking",
    orderNumber: "",
    message: "",
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] py-8 sm:py-12 transition-colors duration-200">
      <div className="content-container max-w-6xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        
        {/* ── HERO BANNER ── */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-[var(--bg-card)] shadow-sm">
          <div className="relative z-10 grid gap-8 px-6 py-10 sm:px-12 sm:py-14 lg:grid-cols-[1.3fr_0.7fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">
                <Headphones className="h-3.5 w-3.5" /> Direct Customer Support
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
                We&apos;re here to help. <br />
                <span className="text-amber-500">Get in touch with our team.</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] max-w-2xl">
                Have questions about your recent order, vehicle showroom viewing, solar installation, or warranty? Our Lusaka-based team is ready to assist you.
              </p>
              
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400 shadow-sm"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call {contactInfo.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/20 transition"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Quick Operating Info Card */}
            <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-amber-500">
                <Clock className="h-4 w-4" /> Operating Hours
              </div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                Monday - Saturday: 08:00 - 18:00 CAT
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Sunday: 09:00 - 14:00 CAT (Emergency On-Call)
              </p>
              <div className="pt-3 border-t border-amber-500/15 flex items-center gap-2 text-xs text-emerald-500 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Fast response time (within 2 hours)
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT: CONTACT FORM & CHANNELS ── */}
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          
          {/* Contact Form Card */}
          <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 sm:p-10 shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Send a Message</span>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[var(--text-primary)]">
                Submit an Inquiry
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                Fill in the form below and our support specialists will get back to you promptly.
              </p>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-emerald-500 text-black">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Message Received!</h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                  Thank you, <strong>{formData.name}</strong>. Your inquiry regarding &ldquo;{formData.department}&rdquo; has been routed to our support team. We will respond to <strong>{formData.email || formData.phone}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setFormData({
                      name: "",
                      phone: "",
                      email: "",
                      department: "Order Support & Tracking",
                      orderNumber: "",
                      message: "",
                    })
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400 transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Mwamba"
                      className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+260 97X XXX XXX"
                      className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="yourname@example.com"
                      className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                      Department / Category
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Order Support & Tracking">Order Support & Tracking</option>
                      <option value="Returns & Exchanges">Returns & Exchanges</option>
                      <option value="Payments & Lenco">Payments & Lenco Mobile Money</option>
                      <option value="Solar Power Consultation">Solar Power Consultation</option>
                      <option value="Vehicle Showroom & Garage">Vehicle Showroom & Garage</option>
                      <option value="General Inquiries">General Inquiries</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                    Order Number (If applicable)
                  </label>
                  <input
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    placeholder="e.g. #10024 or ord_01J..."
                    className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe how we can assist you..."
                    className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-black transition hover:bg-amber-400 focus-visible:outline-none shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting inquiry...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Support Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Direct Support Channels & Showroom Info */}
          <div className="space-y-6">
            
            {/* Direct Phone & WhatsApp Cards */}
            <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-500" /> Direct Hotlines
              </h3>
              
              <div className="space-y-3">
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] hover:border-amber-500/40 transition"
                >
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">Primary Support</div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{contactInfo.phone}</div>
                  </div>
                  <span className="text-xs font-semibold text-amber-500">Call Now →</span>
                </a>

                <a
                  href={`tel:${contactInfo.phoneSecondary}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] hover:border-amber-500/40 transition"
                >
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">Showroom & Garage</div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{contactInfo.phoneSecondary}</div>
                  </div>
                  <span className="text-xs font-semibold text-amber-500">Call Now →</span>
                </a>
              </div>
            </div>

            {/* Showroom Physical Location */}
            <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Makeni Complex</h3>
                  <p className="text-xs text-[var(--text-muted)]">Showroom, Service Center & Store Pickup</p>
                </div>
              </div>

              <address className="not-italic text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--surface-border)] pt-3">
                <strong>{contactInfo.address}</strong><br />
                {contactInfo.city}, {contactInfo.country}
              </address>

              <div className="pt-2 flex flex-col gap-2">
                <LocalizedClientLink
                  href="/customer-care"
                  className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1"
                >
                  <span>View FAQs & Delivery Tracking</span>
                  <ArrowRight className="h-3 w-3" />
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/returns"
                  className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1"
                >
                  <span>Read 14-Day Returns Policy</span>
                  <ArrowRight className="h-3 w-3" />
                </LocalizedClientLink>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  )
}
