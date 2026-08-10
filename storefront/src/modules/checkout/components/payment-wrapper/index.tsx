"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"

type WrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const Wrapper: React.FC<WrapperProps> = ({ cart, children }) => {
  return <div>{children}</div>
}

export default Wrapper
