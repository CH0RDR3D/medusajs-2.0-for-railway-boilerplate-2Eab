"use client"

import React, { useState } from "react"
import { CustomerServiceData } from "@lib/data/customer-service"

export default function CustomerServiceView({ data }: { data: CustomerServiceData }) {
  const [activeTab, setActiveTab] = useState<"all" | "contact" | "faqs" | "returns" | "delivery">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1")

  const { contactInfo, faqs, returnsPolicy, deliveryPolicy } = data

  const filteredFaqs = faqs.filter((f) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen py-10" style={{ background: "var(--bg-base)" }}>
      <div className="content-container">
        {/* Page Header */}
        <div className="max-w-3xl mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">
            Help & Support
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Customer Service Hub
          </h1>
          <p className="text-sm md:text-base text-[var(--text-muted)]">
            Find answers to frequently asked questions, contact our support team, and read our store policies.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-3 border-b border-[var(--nav-border)]">
          {[
            { id: "all", label: "Overview" },
            { id: "contact", label: "Contact Info" },
            { id: "faqs", label: "FAQs" },
            { id: "returns", label: "Returns & Refunds" },
            { id: "delivery", label: "Delivery Policy" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                activeTab === tab.id
                  ? "bg-amber-400 text-black shadow-md"
                  : "bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--nav-border)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SECTION 1: Contact Info */}
        {(activeTab === "all" || activeTab === "contact") && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-500 flex items-center justify-center font-bold text-lg">
                📞
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Contact Information</h2>
                <p className="text-xs text-[var(--text-muted)]">Get in touch directly with our support team in Lusaka</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Phone / WhatsApp */}
              <div
                className="p-5 rounded-2xl border border-[var(--nav-border)] shadow-sm"
                style={{ background: "var(--bg-card)" }}
              >
                <div className="text-2xl mb-3">📱</div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1">Call or WhatsApp</h3>
                <p className="text-sm font-semibold text-amber-500 mb-2">{contactInfo.phone}</p>
                <p className="text-xs text-[var(--text-muted)]">{contactInfo.businessHours}</p>
              </div>

              {/* Email Support */}
              <div
                className="p-5 rounded-2xl border border-[var(--nav-border)] shadow-sm"
                style={{ background: "var(--bg-card)" }}
              >
                <div className="text-2xl mb-3">✉️</div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1">Email Support</h3>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-sm font-semibold text-amber-500 hover:underline mb-2 block"
                >
                  {contactInfo.email}
                </a>
                <p className="text-xs text-[var(--text-muted)]">We aim to respond to all inquiries within 24 hours.</p>
              </div>

              {/* Physical Location */}
              <div
                className="p-5 rounded-2xl border border-[var(--nav-border)] shadow-sm"
                style={{ background: "var(--bg-card)" }}
              >
                <div className="text-2xl mb-3">📍</div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1">Store Pickup & Address</h3>
                <p className="text-xs font-medium text-[var(--text-primary)] mb-1">{contactInfo.address}</p>
                <p className="text-xs text-[var(--text-muted)]">{contactInfo.city}, {contactInfo.country}</p>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: FAQs */}
        {(activeTab === "all" || activeTab === "faqs") && (
          <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-500 flex items-center justify-center font-bold text-lg">
                  ❓
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Frequently Asked Questions</h2>
                  <p className="text-xs text-[var(--text-muted)]">Answers to popular questions about orders, shipping, and payments</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--nav-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>
            </div>

            {filteredFaqs.length > 0 ? (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaq === faq.id
                  return (
                    <div
                      key={faq.id}
                      className="rounded-2xl border border-[var(--nav-border)] overflow-hidden transition"
                      style={{ background: "var(--bg-card)" }}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                        className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-[var(--bg-surface)] transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-500 font-semibold">
                            {faq.category}
                          </span>
                          <span className="text-sm font-bold text-[var(--text-primary)]">{faq.question}</span>
                        </div>
                        <span className="text-amber-500 text-lg font-bold flex-shrink-0">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-[var(--text-muted)] border-t border-[var(--nav-border)]/50 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[var(--bg-surface)] text-[var(--text-muted)] text-sm">
                No matching questions found for "{searchQuery}".
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: Returns & Refunds */}
        {(activeTab === "all" || activeTab === "returns") && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-500 flex items-center justify-center font-bold text-lg">
                🔄
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{returnsPolicy.title}</h2>
                <p className="text-xs text-[var(--text-muted)]">{returnsPolicy.subtitle}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--nav-border)]" style={{ background: "var(--bg-card)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {returnsPolicy.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-[var(--text-primary)]">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] border-t border-[var(--nav-border)] pt-4 leading-relaxed">
                {returnsPolicy.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: Delivery Policy */}
        {(activeTab === "all" || activeTab === "delivery") && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-500 flex items-center justify-center font-bold text-lg">
                🚚
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{deliveryPolicy.title}</h2>
                <p className="text-xs text-[var(--text-muted)]">{deliveryPolicy.subtitle}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--nav-border)]" style={{ background: "var(--bg-card)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {deliveryPolicy.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-[var(--text-primary)]">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] border-t border-[var(--nav-border)] pt-4 leading-relaxed">
                {deliveryPolicy.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
