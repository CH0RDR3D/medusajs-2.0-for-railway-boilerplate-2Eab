import React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | S.Y.A General Dealers",
  description:
    "Learn more about S.Y.A General Dealers, Lusaka's trusted hub for new and used vehicles, home essentials, solar equipment, and professional automotive services.",
}

export default async function AboutPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  return (
    <div className="min-h-screen py-12" style={{ background: "var(--bg-base)" }}>
      <div className="content-container max-w-4xl mx-auto px-4 md:px-6">
        
        {/* Hero Section */}
        <div
          className="relative w-full rounded-3xl overflow-hidden mb-12 py-16 px-8 md:px-16 border border-amber-500/20 shadow-xl"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          }}
        >
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
              Company Profile
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
              S.Y.A General Dealers
            </h1>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mb-6" />
            <p className="text-sm md:text-lg text-gray-300 leading-relaxed font-medium">
              Your trusted hub for premium vehicles, home essentials, advanced solar solutions, and professional automotive services in Zambia.
            </p>
          </div>
          {/* Decorative design orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #f59e0b, transparent)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", transform: "translate(-30%, 30%)" }} />
        </div>

        {/* Introduction / commitment Section */}
        <section className="mb-16 bg-[var(--bg-card)] rounded-2xl p-8 border border-black/5 dark:border-white/5 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4">
            Introduction
          </h2>
          <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed mb-6">
            At S.Y.A General Dealers, we are driven by a commitment to quality, diversity, and customer satisfaction. Established with a vision to bring convenience and excellence to our community, we have grown into a trusted hub for vehicles, home essentials, and automotive services.
          </p>
          <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
            Our dynamic showroom is home to an extensive range of vehicles—both new and used—sourced locally and internationally to cater to a variety of tastes and budgets. Beyond vehicles, our store is a treasure trove of home essentials designed to meet your household needs with quality and affordability.
          </p>
        </section>

        {/* What We Excel At / About Us Section */}
        <section className="mb-16">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">
            About Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-sm hover:border-amber-500/25 transition">
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Premier Showroom
              </h3>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
                We offer a wide selection of new and used vehicles, locally sourced and imported, helping customers find their perfect ride with reliable options.
              </p>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-sm hover:border-amber-500/25 transition">
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Home Essentials & Solar
              </h3>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
                From stylish furniture and durable kitchenware to advanced solar panels, hybrid inverters, and lithium batteries, we offer products that enhance everyday living.
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-16">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">
            Our Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-3 block">🚗</span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Showroom</h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Showcasing new and used vehicles sourced locally and internationally, providing reliable options to suit diverse preferences and budgets.
                </p>
              </div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-3 block">🛋️</span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Household Products</h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Providing a variety of household products including furniture, kitchenware, solar equipment, carpets, home appliances, baby essentials, and toys.
                </p>
              </div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-3 block">🧼</span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Car Wash</h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Professional vehicle cleaning services to keep your car looking spotless and well-maintained.
                </p>
              </div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-3 block">🔧</span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Auto Garage</h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Expert automotive repair and maintenance services to ensure your vehicle performs at its best.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">
            Our Core Values
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start p-5 bg-[var(--bg-card)] rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center text-sm">1</span>
              <div>
                <h3 className="text-sm md:text-base font-bold text-[var(--text-primary)] mb-1">Innovative Spirit</h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
                  We are dedicated to constantly evolving and finding better ways to serve our customers, staying ahead in the industry through innovation and exploration of new opportunities.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-5 bg-[var(--bg-card)] rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center text-sm">2</span>
              <div>
                <h3 className="text-sm md:text-base font-bold text-[var(--text-primary)] mb-1">Ethical Business Practices</h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Guided by core values of transparency, professionalism, honesty, and ethics, we are committed to fostering trust and upholding the highest standards in every aspect of our business.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-5 bg-[var(--bg-card)] rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center text-sm">3</span>
              <div>
                <h3 className="text-sm md:text-base font-bold text-[var(--text-primary)] mb-1">Exceptional Work & Customer Satisfaction</h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
                  We are committed to delivering professional, efficient, and certified services that exceed expectations, establishing ourselves as a trusted provider and building a loyal customer base.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="bg-neutral-900 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden border border-white/5">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm relative z-10">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <h4 className="font-semibold text-gray-300">Physical Address</h4>
                  <p className="text-gray-400 mt-1">Plot No. F/687/A/1/A/8,<br />Makeni Road, Lusaka, Zambia</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📞</span>
                <div>
                  <h4 className="font-semibold text-gray-300">Phone Numbers</h4>
                  <p className="text-gray-400 mt-1">+260-978-883-420<br />+260-966-666-608</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">✉️</span>
                <div>
                  <h4 className="font-semibold text-gray-300">Email Address</h4>
                  <p className="text-gray-400 mt-1">
                    <a href="mailto:syageneraldealers@outlook.com" className="hover:text-amber-400 transition">
                      syageneraldealers@outlook.com
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🌐</span>
                <div>
                  <h4 className="font-semibold text-gray-300">Official Website</h4>
                  <p className="text-gray-400 mt-1">
                    <a href="https://syaonlinetrading.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">
                      syaonlinetrading.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Background glowing gradient */}
          <div className="absolute right-0 bottom-0 w-48 h-48 rounded-full bg-amber-500 opacity-10 blur-3xl pointer-events-none" />
        </section>

      </div>
    </div>
  )
}
