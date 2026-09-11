import React from "react"
import Image from "next/image"

export default function Logo() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 font-black tracking-tight select-none flex-shrink-0">
      <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
        <Image
          src="/logo/syastorelogo.png"
          alt="SYA Store logo"
          fill
          sizes="(max-width: 640px) 32px, 40px"
          className="object-contain"
          priority
        />
      </div>

      <span className="bg-gradient-to-r from-[#fd9706] to-[#066cfd] bg-clip-text text-transparent uppercase font-bold tracking-wider text-sm sm:text-base md:text-lg whitespace-nowrap">
        SYA Store
      </span>
    </div>
  )
}

