import { Metadata } from "next"
import { Car, CircleGauge, HeartHandshake, House, Lightbulb, MapPin, Phone, ShieldCheck, Sun, Wrench } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "About SYA Store",
  description: "Learn about SYA Store, our services, values, and Lusaka contact details.",
}

const values = [
  { title: "Innovation", text: "We keep improving the products, services, and shopping experience we offer.", icon: Lightbulb },
  { title: "Ethics", text: "We build trust through honest advice, dependable products, and accountable service.", icon: ShieldCheck },
  { title: "Customer focus", text: "Every recommendation starts with what will serve our customers best.", icon: HeartHandshake },
]

const services = [
  { title: "Vehicle showroom", text: "Explore dependable vehicles with practical guidance from selection through handover.", icon: Car },
  { title: "Household products", text: "Find essential home products chosen for everyday comfort, durability, and value.", icon: House },
  { title: "Solar equipment", text: "Choose solar solutions that support reliable power for homes and businesses.", icon: Sun },
  { title: "Car wash", text: "Keep your vehicle looking its best with convenient, careful exterior and interior cleaning.", icon: CircleGauge },
  { title: "Auto garage", text: "Access trusted inspections, maintenance, diagnostics, and repairs to keep you moving safely.", icon: Wrench },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] py-8 small:py-12">
      <div className="content-container space-y-12 small:space-y-16">
        <section className="overflow-hidden rounded-lg border border-amber-400/30 bg-[var(--bg-card)]">
          <div className="grid gap-8 px-6 py-10 small:grid-cols-[1.4fr_0.6fr] small:px-10 small:py-14">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-500">Lusaka, Zambia</p>
              <h1 className="max-w-2xl text-3xl font-bold leading-tight text-[var(--text-primary)] small:text-5xl">SYA Store</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                We bring quality products and practical services together with a commitment to diversity, dependable value, and customer satisfaction.
              </p>
              <LocalizedClientLink href="/store" className="mt-7 inline-flex rounded-md bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
                Explore the store
              </LocalizedClientLink>
            </div>
            <div className="flex min-h-44 items-end border-l-0 border-amber-400/25 pl-0 small:min-h-0 small:border-l small:pl-8">
              <p className="text-lg font-semibold leading-8 text-[var(--text-primary)]">Vehicles, home essentials, solar equipment, and expert auto care under one roof.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 small:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500">About us</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">Made for everyday life and the road ahead.</h2>
          </div>
          <p className="text-base leading-7 text-[var(--text-secondary)]">SYA Store serves households, drivers, and businesses with a thoughtful mix of vehicles, home essentials, solar equipment, and auto services. Our team helps customers make confident choices with products and support designed around real needs.</p>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Our values</p>
          <div className="mt-5 grid gap-4 small:grid-cols-3">
            {values.map(({ title, text, icon: Icon }) => (
              <article key={title} className="border-t-2 border-amber-400 bg-[var(--bg-card)] p-5">
                <Icon className="h-6 w-6 text-amber-500" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-bold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Services</p>
          <div className="mt-5 grid gap-px overflow-hidden border border-black/10 bg-black/10 small:grid-cols-2 dark:border-white/10 dark:bg-white/10">
            {services.map(({ title, text, icon: Icon }) => (
              <article key={title} className="bg-[var(--bg-card)] p-5">
                <Icon className="h-6 w-6 text-amber-500" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 border-y border-black/10 py-8 small:grid-cols-3 dark:border-white/10">
          <div className="flex gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" /><address className="not-italic text-sm leading-6 text-[var(--text-secondary)]">Plot No. F/687/A/1/A/8,<br />Makeni Road, Lusaka, Zambia</address></div>
          <div className="flex gap-3"><Phone className="mt-1 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" /><p className="text-sm leading-6 text-[var(--text-secondary)]"><a className="hover:text-amber-500" href="tel:+260978883420">+260-978-883-420</a><br /><a className="hover:text-amber-500" href="tel:+260966666608">+260-966-666-608</a></p></div>
          <div className="text-sm leading-6 text-[var(--text-secondary)]"><a className="hover:text-amber-500" href="mailto:info@syastore.com">info@syastore.com</a><br /><a className="hover:text-amber-500" href="https://syastore.com">syastore.com</a></div>
        </section>
      </div>
    </main>
  )
}