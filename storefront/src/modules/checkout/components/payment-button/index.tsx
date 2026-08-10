"use client"

import { HttpTypes } from "@medusajs/types"
import LencoButton from "../LencoButton"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ cart }) => {
  return <LencoButton cart={cart} />
}

export default PaymentButton
