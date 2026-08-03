"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"

interface ShippingGuaranteeProps {
  guarantee: {
    fees: string
    min_timeline: number
    max_timeline: number
    guarantee_terms: string
    logistics_provider: string
    is_guaranteed: boolean
  }
  handleAddToCart: () => Promise<any>
  isAdding: boolean
  disabled: boolean
}

export default function ShippingGuarantee({
  guarantee,
  handleAddToCart,
  isAdding,
  disabled,
}: ShippingGuaranteeProps) {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || ""

  if (!guarantee || !guarantee.is_guaranteed) {
    return null
  }

  const handleStartOrder = async () => {
    if (disabled) return
    const res = await handleAddToCart()
    // Redirect to checkout once variant is added
    router.push(`/${countryCode}/checkout`)
  }

  return (
    <div className="mt-6 border border-black/10 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col gap-y-4">
      {/* Header */}
      <div className="flex items-center gap-x-3">
        <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4.5 h-4.5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            SYA Store Shipping Guarantee
          </h3>
          <span className="text-xsmall text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
            100% Protection Covered
          </span>
        </div>
      </div>

      {/* Dynamic shipping details info */}
      <div className="p-3.5 bg-white dark:bg-zinc-800/40 rounded-xl border border-black/5 dark:border-white/5 text-xs flex flex-col gap-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-zinc-500 font-medium">Delivery Fee</span>
          <span className="text-[var(--text-primary)] font-bold">{guarantee.fees}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-500 font-medium">Logistics Provider</span>
          <span className="text-[var(--text-primary)] font-bold">{guarantee.logistics_provider}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-500 font-medium">Estimated Arrival</span>
          <span className="text-[var(--text-primary)] font-bold">
            {guarantee.min_timeline}-{guarantee.max_timeline} Business Days
          </span>
        </div>
      </div>

      {/* Guarantee lists */}
      <ul className="text-xs text-[var(--text-secondary)] flex flex-col gap-y-3.5 pl-0.5">
        <li className="flex items-start gap-x-3">
          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <span className="font-bold text-[var(--text-primary)] block">Secure Payments</span>
            <span className="text-zinc-500 dark:text-zinc-400">Secure transactions via Lenco integration.</span>
          </div>
        </li>
        <li className="flex items-start gap-x-3">
          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <span className="font-bold text-[var(--text-primary)] block">On-Time delivery</span>
            <span className="text-zinc-500 dark:text-zinc-400">Guaranteed delivery before scheduled date or compensation if delayed.</span>
          </div>
        </li>
        <li className="flex items-start gap-x-3">
          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <span className="font-bold text-[var(--text-primary)] block">Money-Back Protection</span>
            <span className="text-zinc-500 dark:text-zinc-400">Full money-back protection for missing or defective orders.</span>
          </div>
        </li>
      </ul>

      {/* Action Buttons */}
      <div className="flex flex-col gap-y-2 mt-2">
        <button
          onClick={handleStartOrder}
          disabled={disabled || isAdding}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 text-center shadow-sm flex items-center justify-center gap-x-2 ${
            disabled || isAdding
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-transparent"
              : "bg-amber-400 hover:bg-amber-500 text-zinc-950 hover:shadow-md active:scale-[0.99] border border-amber-500"
          }`}
        >
          {isAdding ? (
            <span>Processing...</span>
          ) : (
            <>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Start Order</span>
            </>
          )}
        </button>

        <button
          onClick={handleAddToCart}
          disabled={disabled || isAdding}
          className={`w-full py-2 px-4 rounded-xl font-semibold text-sm transition-all duration-200 text-center border ${
            disabled || isAdding
              ? "border-zinc-250 dark:border-zinc-800 text-zinc-400 cursor-not-allowed"
              : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--text-primary)]"
          }`}
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>

        <a
          href="mailto:support@sya-store.com?subject=Inquiry%20regarding%20Shipping%20Guarantee"
          className="w-full py-1.5 text-center text-xsmall font-semibold text-zinc-400 hover:text-[var(--text-primary)] transition-colors duration-200"
        >
          Contact Support
        </a>
      </div>

      {/* Payment methods and logistics branding */}
      <div className="border-t border-black/5 dark:border-white/5 pt-3.5 flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Payments:</span>
          <div className="flex items-center gap-x-1.5">
            {/* Lenco representation */}
            <span className="text-[10px] font-bold text-amber-500 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-500/20">Lenco</span>
            {/* Visa */}
            <svg className="w-7 h-4 text-zinc-400 dark:text-zinc-500 fill-current" viewBox="0 0 24 15">
              <path d="M9.8 13.5l1.6-9.6h2.5l-1.6 9.6H9.8zm9.5-9.3c-.4-.2-1-.4-1.6-.4-1.8 0-3.1 1-3.1 2.3 0 1 .9 1.6 1.6 1.9.7.3.9.6.9.9 0 .5-.6.7-1.1.7-.8 0-1.2-.2-1.8-.5l-.3-.1-.3 1.9c.5.2 1.5.4 2.4.4 1.9 0 3.2-.9 3.2-2.4 0-.8-.5-1.4-1.6-1.9-.7-.3-1.1-.6-1.1-.9 0-.3.3-.7 1.1-.7.7 0 1.2.1 1.6.3l.2.1.2-1.9zm3.5-.3h-1.9c-.6 0-1 .2-1.3.8l-3.6 8.8h2.6l.5-1.4h3.1l.3 1.4h2.3l-2-9.6zm-1.8 5.6l1-2.8.6 2.8h-1.6zM4.6 4.2H.8L0 4.6c2.9.7 4.9 2.5 5.7 4.7l-.8-4.2c-.1-.7-.6-.9-1.3-.9z" />
            </svg>
            {/* Mastercard */}
            <svg className="w-7 h-4 text-zinc-400 dark:text-zinc-500 fill-current" viewBox="0 0 24 15">
              <circle cx="8" cy="7.5" r="7.5" fillOpacity="0.8" />
              <circle cx="16" cy="7.5" r="7.5" fillOpacity="0.8" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-x-1.5 text-zinc-400 dark:text-zinc-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">{guarantee.logistics_provider} Guaranteed</span>
        </div>
      </div>
    </div>
  )
}
