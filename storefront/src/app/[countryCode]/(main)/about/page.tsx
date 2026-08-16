import { Metadata } from "next"
import {
  Car,
  CircleGauge,
  HeartHandshake,
  House,
  Lightbulb,
  MapPin,
  Phone,
  ShieldCheck,
  Sun,
  Wrench,
  Truck,
  Sparkles,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "About Us | Who We Are | SYA Store Lusaka",
  description:
    "Discover SYA Store: Zambia's multi-sector destination for quality vehicles, auto garage services, solar equipment, and household essentials in Makeni, Lusaka.",
}

// Guiding Principles inspired by Amazon's leadership philosophy tailored to SYA
const values = [
  {
    title: "Customer Obsession",
    text: "We start with customer needs and work backwards. Every product cataloged and service performed is measured by the value and reliability it delivers to everyday lives.",
    icon: HeartHandshake,
  },
  {
    title: "Uncompromising Integrity & Ethics",
    text: "We build long-term trust through honest automotive diagnostics, transparent pricing, genuine solar equipment, and clear warranty terms.",
    icon: ShieldCheck,
  },
  {
    title: "Practical Innovation",
    text: "We continually adapt our offerings to solve real challenges — from reliable hybrid solar power systems to modern, fast digital checkout via Lenco.",
    icon: Lightbulb,
  },
  {
    title: "Quality & Accountability",
    text: "We stand behind everything we sell with direct customer care, verified suppliers, and professional after-sales garage support.",
    icon: Award,
  },
]

// 5 Core Divisions / What We Do
const services = [
  {
    title: "Vehicle Showroom",
    text: "Explore dependable passenger vehicles, work trucks, and commercial utility models with end-to-end guidance from inspection to handover.",
    icon: Car,
    badge: "Verified Quality",
  },
  {
    title: "Auto Garage & Diagnostics",
    text: "Access certified mechanics for computer diagnostics, routine servicing, brake/suspension maintenance, and precision repairs at our Makeni garage.",
    icon: Wrench,
    badge: "Certified Techs",
  },
  {
    title: "Renewable Solar Energy",
    text: "Empower homes and businesses with Tier-1 solar panels, hybrid inverters, deep-cycle lithium batteries, and professional turnkey installation.",
    icon: Sun,
    badge: "Clean Power",
  },
  {
    title: "Household & Hardware",
    text: "Browse curated home essentials, appliances, tools, and durable fixtures chosen for long-lasting value and everyday convenience.",
    icon: House,
    badge: "Everyday Living",
  },
  {
    title: "Professional Car Wash & Detailing",
    text: "Keep your vehicle pristine with thorough exterior foaming, undercarriage cleaning, interior vacuuming, and protective wax detailing.",
    icon: CircleGauge,
    badge: "Care & Polish",
  },
  {
    title: "Express Logistics & Makeni Pickup",
    text: "Enjoy swift 24h delivery across Lusaka, secure provincial shipping, or zero-fee collection straight from our Makeni Road warehouse.",
    icon: Truck,
    badge: "Fast Delivery",
  },
]

// Key Performance / Trust Metrics
const stats = [
  { value: "5+", label: "Integrated Divisions", sub: "Vehicles, Solar, Auto, Home & Logistics" },
  { value: "100%", label: "Genuine Quality", sub: "Tested & inspected inventory" },
  { value: "24h", label: "Lusaka Delivery", sub: "Fast local courier fulfillment" },
  { value: "14-Day", label: "Return Guarantee", sub: "Dependable customer assurance" },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] py-8 sm:py-12 transition-colors duration-200">
      <div className="content-container max-w-6xl mx-auto px-4 sm:px-6 space-y-16 sm:space-y-24">

        {/* ── HERO BANNER (Amazon "Who We Are" inspired) ── */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-[var(--bg-card)] shadow-sm">
          <div className="relative z-10 grid gap-8 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1.3fr_0.7fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Lusaka, Zambia · Who We Are
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
                Driven by quality. <br className="hidden sm:inline" />
                <span className="text-amber-500">Dedicated to your everyday life.</span>
              </h1>
              <p className="mt-5 text-sm sm:text-base lg:text-lg leading-relaxed text-[var(--text-secondary)] max-w-2xl">
                SYA Store brings together dependable vehicles, renewable solar power, professional automotive care, and curated household goods under one roof in Lusaka. We are committed to building long-term trust through honest service, authentic products, and customer-first support.
              </p>
              
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <LocalizedClientLink
                  href="/store"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-sm"
                >
                  <span>Explore Our Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/customer-care"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <span>Contact Customer Care</span>
                </LocalizedClientLink>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="flex flex-col gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-black font-bold">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xs uppercase tracking-wider text-amber-500 font-bold">Flagship Hub</h2>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Makeni Road, Lusaka</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-amber-500/15 pt-4">
                Our multi-service complex on Makeni Road houses our automotive showroom, technical repair garage, solar staging center, and express dispatch hub.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 pt-1">
                <CheckCircle2 className="h-4 w-4" /> Open Monday through Saturday
              </div>
            </div>
          </div>
        </section>

        {/* ── IMPACT & TRUST NUMBERS ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 text-center shadow-sm"
            >
              <div className="text-3xl sm:text-4xl font-black text-amber-500">{item.value}</div>
              <div className="text-sm font-bold text-[var(--text-primary)] mt-1">{item.label}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{item.sub}</div>
            </div>
          ))}
        </section>

        {/* ── OUR STORY / WHO WE ARE ── */}
        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Our Story & Mission</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] leading-snug">
              Built to meet the real needs of Zambian drivers, homes & businesses.
            </h2>
          </div>
          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
            <p>
              Founded in Lusaka, SYA Store was created to solve a fundamental need: providing a unified, dependable source for essential transport, sustainable energy, automotive engineering, and household products.
            </p>
            <p>
              We believe that shopping for vehicles, solar backup systems, or auto repairs should not involve uncertainty. By bringing together hands-on technical expertise, direct manufacturer sourcing, and a customer-centric support team, we ensure every customer receives reliable advice and lasting value.
            </p>
            <p>
              Whether you are powering your home through solar independence, maintaining your vehicle for long-distance travel, or furnishing your household, SYA Store stands behind you at every step.
            </p>
          </div>
        </section>

        {/* ── CORE DIVISIONS / WHAT WE DO ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">What We Do</span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
                Our Core Divisions
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md">
              Comprehensive services designed to keep you powered, mobile, and comfortable.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ title, text, icon: Icon, badge }) => (
              <article
                key={title}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 hover:border-amber-500/40 hover:shadow-md transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition duration-200">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--bg-base)] text-amber-500 border border-amber-500/20">
                      {badge}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition duration-150">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── GUIDING PRINCIPLES / OUR VALUES ── */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Our Culture</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Guiding Principles
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
              The foundational values that guide our team&apos;s daily decisions and customer relationships.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ title, text, icon: Icon }) => (
              <article
                key={title}
                className="rounded-2xl border-t-4 border-t-amber-500 border-x border-b border-[var(--surface-border)] bg-[var(--bg-card)] p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <Icon className="h-6 w-6 text-amber-500" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-bold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── PHYSICAL SHOWROOM & CONTACT HUB ── */}
        <section className="rounded-3xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 sm:p-10 shadow-sm">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Visit Us</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Lusaka Showroom & Service Center
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
              Visit our Makeni complex for test drives, vehicle maintenance, solar advice, and store order collections.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 border-t border-[var(--surface-border)] pt-8">
            {/* Address */}
            <div className="flex gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 h-fit">
                <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Address</h4>
                <address className="not-italic text-sm font-semibold text-[var(--text-primary)] mt-1 leading-snug">
                  Plot No. F/687/A/1/A/8,<br />
                  Makeni Road, Lusaka, Zambia
                </address>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 h-fit">
                <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Call Support</h4>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 space-y-1">
                  <a className="block hover:text-amber-500 transition" href="tel:+260978883420">+260-978-883-420</a>
                  <a className="block hover:text-amber-500 transition text-xs text-[var(--text-secondary)]" href="tel:+260966666608">+260-966-666-608</a>
                </p>
              </div>
            </div>

            {/* Online Channels */}
            <div className="flex gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 h-fit">
                <Users className="h-5 w-5 shrink-0" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Online & Inquiries</h4>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 space-y-1">
                  <a className="block hover:text-amber-500 transition" href="mailto:info@syastore.com">info@syastore.com</a>
                  <LocalizedClientLink href="/customer-care" className="block text-xs text-amber-500 hover:underline">
                    Visit Customer Care Hub →
                  </LocalizedClientLink>
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}