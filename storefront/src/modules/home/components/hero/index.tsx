"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import hero1 from "../../../../assets/images/hero/hero1.webp"
import hero2 from "../../../../assets/images/hero/hero2.webp"
import hero3 from "../../../../assets/images/hero/hero3.webp"
import hero4 from "../../../../assets/images/hero/hero4.webp"

const slides = [
  {
    id: 1,
    title: "Signature Collection",
    subtitle: "Timeless pieces. Curated with purpose.",
    image: hero1,
    cta: "Discover Now",
    link: "/store",
    tag: "New Season",
  },
  {
    id: 2,
    title: "Swift Checkout",
    subtitle: "From cart to door — effortlessly fast.",
    image: hero2,
    cta: "Start Shopping",
    link: "/store",
    tag: "Featured",
  },
  {
    id: 3,
    title: "Crafted for Moments",
    subtitle: "Products built for experiences that matter.",
    image: hero3,
    cta: "Explore Range",
    link: "/store",
    tag: "Top Picks",
  },
  {
    id: 4,
    title: "Bold. Original.",
    subtitle: "Push boundaries with every purchase.",
    image: hero4,
    cta: "Shop Now",
    link: "/store",
    tag: "Trending",
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(next, 5500)
    return () => clearInterval(interval)
  }, [isPaused, next])

  return (
    <section
      className="relative w-full h-[600px] md:h-[720px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
          style={{ transitionProperty: "opacity, transform" }}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />

          {/* Deep gradient overlay — switches based on theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent dark:from-black/80 dark:via-black/50 dark:to-transparent" />

          {/* Text content — left-aligned, staggered layout */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 max-w-3xl">
            {/* Floating tag badge */}
            <span className="inline-block self-start px-3 py-1 bg-amber-400/90 text-black text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              {slide.tag}
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight drop-shadow-lg">
              {slide.title}
            </h1>

            <p className="mt-4 text-base md:text-xl text-[var(--text-secondary)] max-w-md leading-relaxed">
              {slide.subtitle}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link
                href={slide.link}
                className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm uppercase tracking-wider rounded-lg shadow-xl transition-all duration-200 hover:shadow-amber-400/40 hover:scale-105"
              >
                {slide.cta}
              </Link>
              <Link
                href="/store"
                className="px-6 py-3 border border-[var(--nav-border)] text-[var(--text-primary)] text-sm font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition backdrop-blur-sm"
              >
                View All
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Left / Right controls */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/60 dark:bg-black/30 dark:hover:bg-black/60 text-[var(--text-primary)] border border-black/10 dark:border-white/20 backdrop-blur-sm transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/60 dark:bg-black/30 dark:hover:bg-black/60 text-[var(--text-primary)] border border-black/10 dark:border-white/20 backdrop-blur-sm transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? "w-8 h-2 bg-amber-400" : "w-2 h-2 bg-black/20 hover:bg-black/40 dark:bg-white/40 dark:hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Bottom fade — bleeds into section below; uses CSS variable for theme compat */}
      <div
        className="absolute bottom-0 left-0 w-full h-40 pointer-events-none"
        style={{ background: "linear-gradient(to top, var(--bg-base), transparent)" }}
      />
    </section>
  )
}
