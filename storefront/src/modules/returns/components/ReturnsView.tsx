"use client"

import React, { useState } from "react"
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  Send,
  ArrowRight,
  Sparkles,
  Clock,
  AlertCircle,
} from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { CustomerServiceData } from "@lib/data/customer-service"

interface ReturnsViewProps {
  data: CustomerServiceData
}

export default function ReturnsView({ data }: ReturnsViewProps) {
  const { contactInfo, returnsPolicy } = data

  const [orderNumber, setOrderNumber] = useState("")
  const [returnReason, setReturnReason] = useState("Defective or Damaged")
  const [inquirySent, setInquirySent] = useState(false)

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInquirySent(true)
  }

  const steps = [
    {
      num: "01",
      title: "Initiate Request",
      desc: "Submit your order number and reason online, call our support desk, or WhatsApp us within 14 days of delivery.",
      icon: RotateCcw,
    },
    {
      num: "02",
      title: "Package Securely",
      desc: "Keep items in original condition with manufacturer packaging, manuals, accessories, and warranty cards intact.",
      icon: Package,
    },
    {
      num: "03",
      title: "Handover or Drop-off",
      desc: "Hand over to our Lusaka courier during pickup, or drop off free of charge at our Makeni Road showroom counter.",
      icon: Truck,
    },
    {
      num: "04",
      title: "Fast Refund / Exchange",
      desc: "Once inspected, your refund is credited via Mobile Money (Airtel, MTN, Zamtel) or card within 3-5 business days.",
      icon: CreditCard,
    },
  ]

  const warrantyTiers = [
    {
      category: "Solar Equipment & Inverters",
      period: "1 to 5 Years Warranty",
      coverage: "Tier-1 solar panels, hybrid inverters, and lithium battery cells against manufacturing defects.",
    },
    {
      category: "Vehicles & Auto Garage Work",
      period: "Service & Pre-Sale Guarantee",
      coverage: "Comprehensive mechanical inspection, certified diagnostic repairs, and verified pre-sale condition.",
    },
    {
      category: "Household & Electrical Hardware",
      period: "12-Month Quality Assurance",
      coverage: "Small appliances, tools, and fixtures covered for repair or replacement against factory faults.",
    },
  ]

  return (
    <main className="min-h-screen bg-[var(--bg-base)] py-8 sm:py-12 transition-colors duration-200">
      <div className="content-container max-w-6xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        
        {/* ── HERO BANNER ── */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-[var(--bg-card)] shadow-sm">
          <div className="relative z-10 grid gap-8 px-6 py-10 sm:px-12 sm:py-14 lg:grid-cols-[1.3fr_0.7fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">
                <ShieldCheck className="h-3.5 w-3.5" /> Dependable Customer Assurance
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
                14-Day Returns & <br />
                <span className="text-amber-500">Exchanges Policy</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] max-w-2xl">
                We stand behind every product we sell. If you receive an item that is defective, damaged in transit, or not as described, we ensure a smooth return or exchange experience.
              </p>
              
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#return-form"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400 shadow-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Start Return Inquiry</span>
                </a>
                <LocalizedClientLink
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition"
                >
                  <Phone className="h-4 w-4 text-amber-500" />
                  <span>Contact Support</span>
                </LocalizedClientLink>
              </div>
            </div>

            {/* Policy Quick Highlights */}
            <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Key Policy Terms
              </div>
              {returnsPolicy.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4-STEP RETURN PROCESS ── */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Simple 4-Step Process</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              How Returns & Exchanges Work
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.num}
                  className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-amber-500">{step.num}</span>
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── WARRANTY TIERS & ELIGIBILITY TABLE ── */}
        <section className="grid gap-8 lg:grid-cols-2 items-start">
          
          {/* Warranty Coverage */}
          <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Long-Term Protection</span>
              <h3 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                Warranty Coverage Breakdown
              </h3>
            </div>

            <div className="space-y-4">
              {warrantyTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-base)] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{tier.category}</h4>
                    <span className="text-xs font-semibold text-amber-500">{tier.period}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{tier.coverage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Eligible vs Ineligible Guidelines */}
          <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Guidelines</span>
              <h3 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                What Can Be Returned
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-[var(--text-primary)]">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Eligible:</strong> Items with manufacturing defects or physical transit damage reported within 14 days.</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-[var(--text-primary)]">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Eligible:</strong> Unopened merchandise with intact original manufacturer seals, labels, and packaging.</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-[var(--text-primary)]">
                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span><strong>Ineligible:</strong> Consumable chemicals, customized/tailored vehicle parts, and clearance final-sale items.</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-[var(--text-primary)]">
                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span><strong>Ineligible:</strong> Products damaged due to improper customer electrical wiring, drops, or unauthorized tampering.</span>
              </div>
            </div>
          </div>

        </section>

        {/* ── INTERACTIVE RETURN INQUIRY FORM ── */}
        <section
          id="return-form"
          className="rounded-3xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 sm:p-10 shadow-sm"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Self-Service Inquiry</span>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">
                Start a Return or Exchange Request
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Enter your order details below to register your return with our Lusaka support desk.
              </p>
            </div>

            {inquirySent ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Return Request Registered</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  Your return inquiry for order <strong>#{orderNumber || "10024"}</strong> ({returnReason}) has been logged. Our dispatch team will reach out via phone/SMS to arrange pickup or showroom drop-off.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setInquirySent(false)
                    setOrderNumber("")
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                      Order ID / Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="e.g. #10024 or ord_01J..."
                      className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                      Reason for Return *
                    </label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Defective or Damaged">Defective or Damaged in Transit</option>
                      <option value="Incorrect Item Received">Incorrect Item Received</option>
                      <option value="Exchange for Different Model">Exchange for Different Model</option>
                      <option value="Unsatisfied with Performance">Unsatisfied with Performance</option>
                      <option value="Other">Other Warranty Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                    Your Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+260 97X XXX XXX"
                    className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-black transition hover:bg-amber-400 focus-visible:outline-none shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Return Request</span>
                </button>
              </form>
            )}
          </div>
        </section>

      </div>
    </main>
  )
}
