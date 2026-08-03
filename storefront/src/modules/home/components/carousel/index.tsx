"use client"

import { useState } from "react"
import Image from "next/image"

const items = [
  { id: 1, image: "/images/product1.jpg", title: "Summer Collection" },
  { id: 2, image: "/images/product2.jpg", title: "New Arrivals" },
  { id: 3, image: "/images/product3.jpg", title: "Best Sellers" },
]

export default function Carousel() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % items.length)
  const prev = () => setCurrent((prev) => (prev - 1 + items.length) % items.length)

  return (
    <div className="relative w-full h-[400px] mt-12 overflow-hidden">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
            index === current ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Image src={item.image} alt={item.title} fill className="object-cover" />
          <div className="absolute bottom-6 left-6 bg-black/50 text-white p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{item.title}</h2>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full"
      >
        ◀
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full"
      >
        ▶
      </button>
    </div>
  )
}
