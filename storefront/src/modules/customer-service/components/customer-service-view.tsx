"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import type { CustomerServiceData } from "@lib/data/customer-service"
import {
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Headphones,
  Plus,
  Minus,
  ArrowRight,
  ShoppingCart,
  CheckCircle2,
  PackageSearch,
  Home,
  RotateCcw,
  Wallet,
  Search,
  PackageCheck,
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
      className={`pointer-events-none absolute rounded-full bg-amber-500/20 blur-[120px] ${className}`}
      aria-hidden
    />
  )
}

export default function CustomerServiceView({ data }: { data: CustomerServiceData }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1")

  const { contactInfo, faqs, returnsPolicy, deliveryPolicy } = data

  // Dynamic theme colors - can be configured via props or config
  const theme = {
    primary: "amber",
    primaryLight: "amber-300",
    primaryDark: "amber-400",
    borderAccent: "amber-500",
  }

  const filteredFaqs = faqs.filter((f: FAQ) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    )
  })

  const features = [
    {
      icon: ShoppingBag,
      title: "Curated Products",
      body: "Every product is chosen for quality, design and lasting value.",
    },
    {
      icon: Truck,
      title: "Reliable Delivery",
      body: "Fast nationwide shipping through trusted logistics partners.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Shopping",
      body: "Protected payments and transparent order tracking, every time.",
    },
    {
      icon: Headphones,
      title: "Customer Care",
      body: "Real people helping real customers, whenever you need us.",
    },
  ]

  const stats = [
    { value: "500+", label: "Products" },
    { value: "24 hrs", label: "Response Time" },
    { value: "Nationwide", label: "Delivery" },
    { value: "100%", label: "Secure Checkout" },
  ]

  const timeline = [
    { icon: ShoppingCart, label: "Place Order" },
    { icon: CheckCircle2, label: "Confirmation" },
    { icon: PackageSearch, label: "Packing" },
    { icon: Truck, label: "Dispatch" },
    { icon: Home, label: "Delivery" },
  ]

  const promiseCards = [
    { icon: RotateCcw, title: "7 Day Returns" },
    { icon: Wallet, title: "Refund Support" },
    { icon: Search, title: "Product Inspection" },
    { icon: PackageCheck, title: "Secure Packaging" },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-28 md:py-36">
        <Glow className="-top-40 right-0 h-[500px] w-[500px]" />
        <Glow className="top-1/2 -left-40 h-[400px] w-[400px] opacity-60" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative mx-auto max-w-4xl"
        >
          <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-amber-400">
            SYA Customer Service
          </span>
          <h1 className="mt-8 text-6xl font-black leading-[1.05] tracking-tight md:text-8xl">
            Built around trust.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-400 md:text-xl">
            SYA Store brings together quality products, dependable service and a shopping
            experience designed around people, not transactions.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button className="rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-amber-300">
              Browse Collections
            </button>
            <button className="rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/5">
              Talk to Us
            </button>
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
        className="border-y border-white/10 bg-white/[0.02] px-6 py-14"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="text-center md:border-r md:border-white/10 md:last:border-r-0"
            >
              <div className="text-4xl font-black tracking-tight text-white md:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 text-xs uppercase tracking-widest text-neutral-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ABOUT */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-28 lg:grid-cols-2 lg:gap-20"
      >
        <div>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            More than an online store.
          </h2>
          <p className="mt-8 text-base leading-8 text-neutral-400 md:text-lg">
            SYA Store exists to simplify modern shopping. Instead of endless searching across
            different stores, we bring together trusted products, carefully selected
            suppliers and dependable customer service under one destination.
          </p>
          <p className="mt-6 text-base leading-8 text-neutral-400 md:text-lg">
            We believe every order should inspire confidence, from checkout to delivery.
          </p>
        </div>
        <div className="aspect-square rounded-[32px] bg-gradient-to-br from-neutral-800 to-neutral-900" />
      </motion.section>

      {/* FEATURES */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        className="mx-auto max-w-6xl px-6 py-16"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-9 transition hover:border-white/20 hover:from-white/[0.06]"
            >
              <f.icon className="h-6 w-6 text-amber-400" strokeWidth={1.5} />
              <h3 className="mt-6 text-xl font-bold tracking-tight">{f.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-400">{f.body}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* CONTACT */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        className="mx-auto max-w-6xl px-6 py-28"
      >
        <div className="mb-14 max-w-2xl">
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Talk to our team.
          </h2>
          <p className="mt-5 text-base leading-7 text-neutral-400 md:text-lg">
            Need assistance? We're based in {contactInfo.city} and happy to help.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-9">
            <Phone className="h-6 w-6 text-amber-400" strokeWidth={1.5} />
            <h3 className="mt-6 text-sm uppercase tracking-widest text-neutral-500">Call</h3>
            <p className="mt-2 text-lg font-semibold">{contactInfo.phone}</p>
            <p className="mt-1 text-sm text-neutral-500">{contactInfo.businessHours}</p>
          </div>
          <a
            href={`mailto:${contactInfo.email}`}
            className="rounded-[32px] border border-white/10 bg-white/[0.03] p-9 transition hover:border-white/20"
          >
            <Mail className="h-6 w-6 text-amber-400" strokeWidth={1.5} />
            <h3 className="mt-6 text-sm uppercase tracking-widest text-neutral-500">Email</h3>
            <p className="mt-2 text-lg font-semibold">{contactInfo.email}</p>
            <p className="mt-1 text-sm text-neutral-500">Replies within 24 hours</p>
          </a>
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-9">
            <MapPin className="h-6 w-6 text-amber-400" strokeWidth={1.5} />
            <h3 className="mt-6 text-sm uppercase tracking-widest text-neutral-500">Visit</h3>
            <p className="mt-2 text-lg font-semibold">{contactInfo.address}</p>
            <p className="mt-1 text-sm text-neutral-500">
              {contactInfo.city}, {contactInfo.country}
            </p>
          </div>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        className="mx-auto max-w-4xl px-6 py-28"
      >
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Frequently asked.
          </h2>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-amber-400/50 focus:outline-none md:w-72"
          />
        </div>

        {filteredFaqs.length > 0 ? (
          <div className="divide-y divide-white/10 border-t border-white/10">
            {filteredFaqs.map((faq: FAQ) => {
              const isOpen = openFaq === faq.id
              return (
                <div key={faq.id}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-6 py-7 text-left"
                  >
                    <span className="text-lg font-semibold tracking-tight md:text-xl">
                      {faq.question}
                    </span>
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/15 text-amber-400">
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="pb-8 text-base leading-7 text-neutral-400 md:text-lg">
                      {faq.answer}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[32px] border border-white/10 bg-white/[0.02] py-16 text-center text-neutral-500">
            No matching questions found for "{searchQuery}".
          </div>
        )}
      </motion.section>

      {/* DELIVERY TIMELINE */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        className="border-t border-white/10 bg-white/[0.02] px-6 py-28"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            {deliveryPolicy.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-400 md:text-lg">
            {deliveryPolicy.subtitle}
          </p>

          <div className="mt-16 flex flex-col items-start gap-0 md:flex-row md:items-center md:justify-between">
            {timeline.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-4 py-4 md:flex-col md:gap-3 md:py-0 md:text-center">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.03]">
                    <step.icon className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">{step.label}</span>
                </div>
                {i < timeline.length - 1 && (
                  <div className="ml-7 h-8 w-px bg-white/15 md:ml-0 md:h-px md:w-full md:flex-1" />
                )}
              </React.Fragment>
            ))}
          </div>

          {deliveryPolicy.content?.length > 0 && (
            <div className="mt-16 max-w-3xl space-y-4 border-t border-white/10 pt-10 text-sm leading-7 text-neutral-400">
              {deliveryPolicy.content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* OUR PROMISE */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        className="mx-auto max-w-6xl px-6 py-28"
      >
        <h2 className="text-4xl font-black tracking-tight md:text-5xl">Our promise.</h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-neutral-400 md:text-lg">
          If something isn't right, we'll make it right.
        </p>

        <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
          {promiseCards.map((c, i) => (
            <div
              key={i}
              className="rounded-[32px] border border-white/10 bg-white/[0.03] p-7 text-center"
            >
              <c.icon className="mx-auto h-6 w-6 text-amber-400" strokeWidth={1.5} />
              <p className="mt-5 text-sm font-semibold tracking-tight">{c.title}</p>
            </div>
          ))}
        </div>

        {returnsPolicy.content?.length > 0 && (
          <div className="mt-14 max-w-3xl space-y-4 border-t border-white/10 pt-10 text-sm leading-7 text-neutral-400">
            {returnsPolicy.content.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
      </motion.section>

      {/* FINAL CTA */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
        className="relative overflow-hidden border-t border-white/10 px-6 py-32 text-center"
      >
        <Glow className="left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-70" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">
            Thank you for choosing Metro.
          </h2>
          <p className="mt-6 text-base leading-7 text-neutral-400 md:text-lg">
            Every order is an opportunity to earn your trust. That's a responsibility we
            take seriously.
          </p>
          <button className="mt-10 inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-4 text-sm font-semibold text-black transition hover:bg-amber-300">
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.section>
    </div>
  )
}
