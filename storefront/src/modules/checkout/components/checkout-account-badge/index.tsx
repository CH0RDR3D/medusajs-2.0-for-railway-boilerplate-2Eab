"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"
import CheckoutMotivationalBanner from "../checkout-motivational-banner"

interface CheckoutAccountBadgeProps {
  customer: HttpTypes.StoreCustomer | null
}

/**
 * CheckoutAccountBadge Component
 * Shows motivational sign-in/account creation notices for guests,
 * or verified member status for authenticated customers.
 */
export default function CheckoutAccountBadge({
  customer,
}: CheckoutAccountBadgeProps) {
  return <CheckoutMotivationalBanner customer={customer} />
}

