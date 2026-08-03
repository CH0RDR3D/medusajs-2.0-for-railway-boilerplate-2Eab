import React from "react"
import Image from "next/image"

export default function Logo() {
  return (
    <div className="flex items-center gap-2 font-black tracking-tight text-xl select-none">
      <Image
  src="/logo/syastorelogo.png"
  alt="SYA Store logo yatu"
  width={100}
  height={100}
/>
     
      <span className="bg-gradient-to-r from-[#fd9706] to-[#066cfd] bg-clip-text text-transparent uppercase font-extrabold tracking-wider text-base md:text-lg ">
        



      
      </span>
    </div>
  )
}
