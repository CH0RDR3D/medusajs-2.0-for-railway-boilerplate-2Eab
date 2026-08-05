import React from "react"
import Image from "next/image"

export default function Logo() {
  return (
    <div className="flex items-center gap-2 font-black tracking-tight text-xl select-none">
      <Image
  src="/logo/syastorelogo.png"
  alt="SYA Store logo"
  width={46}
  height={46}
/>

  <span className="bg-gradient-to-r from-[#fd9706] to-[#066cfd] bg-clip-text text-transparent uppercase font-bold tracking-wider text-base md:text-lg ">
        SYA Store
      </span>
    </div>
  )
}
