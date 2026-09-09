"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { clx, Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"

export type CheckoutStep = "address" | "delivery" | "payment" | "confirmation"

interface StepConfig {
  id: CheckoutStep
  stepNumber: number
  title: string
  subtitle: string
  queryParam?: string
}

const STEPS: StepConfig[] = [
  {
    id: "address",
    stepNumber: 1,
    title: "Personal Details",
    subtitle: "Address & Contact",
    queryParam: "address",
  },
  {
    id: "delivery",
    stepNumber: 2,
    title: "Delivery",
    subtitle: "Method & Location",
    queryParam: "delivery",
  },
  {
    id: "payment",
    stepNumber: 3,
    title: "Payment",
    subtitle: "Review & Pay",
    queryParam: "payment",
  },
  {
    id: "confirmation",
    stepNumber: 4,
    title: "Confirmation",
    subtitle: "Order Complete",
  },
]

interface CheckoutStepIndicatorProps {
  currentStep?: CheckoutStep
  cart?: HttpTypes.StoreCart | null
  isConfirmationPage?: boolean
  className?: string
}

export default function CheckoutStepIndicator({
  currentStep: propStep,
  cart,
  isConfirmationPage = false,
  className = "",
}: CheckoutStepIndicatorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 1. Determine active step
  const activeStepParam = isConfirmationPage
    ? "confirmation"
    : propStep || (searchParams?.get("step") as CheckoutStep) || "address"

  // 2. Compute completed step status based on cart data or progression
  const hasShippingAddress = Boolean(cart?.shipping_address?.address_1)
  const isPickup = Boolean((cart?.metadata as any)?.is_pickup)
  const hasShippingMethod = (cart?.shipping_methods?.length ?? 0) > 0
  const hasDelivery = isPickup || hasShippingMethod

  const isStepCompleted = (stepId: CheckoutStep): boolean => {
    if (isConfirmationPage) return true
    if (stepId === "address") {
      return (activeStepParam === "delivery" || activeStepParam === "payment") && hasShippingAddress
    }
    if (stepId === "delivery") {
      return activeStepParam === "payment" && hasDelivery
    }
    if (stepId === "payment") {
      return isConfirmationPage
    }
    return false
  }

  const isStepClickable = (stepId: CheckoutStep): boolean => {
    if (isConfirmationPage) return false
    if (stepId === activeStepParam) return false
    if (stepId === "address") return true
    if (stepId === "delivery") return hasShippingAddress
    if (stepId === "payment") return hasShippingAddress && hasDelivery
    return false
  }

  const getStepIndex = (stepId: CheckoutStep): number => {
    const idx = STEPS.findIndex((s) => s.id === stepId)
    return idx >= 0 ? idx : 0
  }

  const activeIndex = isConfirmationPage ? 3 : getStepIndex(activeStepParam)
  const progressPercentage = Math.round((activeIndex / (STEPS.length - 1)) * 100)

  const handleStepClick = (step: StepConfig) => {
    if (!isStepClickable(step.id) || !step.queryParam) return
    router.push(`${pathname}?step=${step.queryParam}`, { scroll: false })
  }

  return (
    <div
      className={clx(
        "w-full bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-4 small:p-6 mb-8 shadow-sm transition-all duration-300",
        className
      )}
      data-testid="checkout-step-indicator"
    >
      {/* Mobile Compact Stepper Header */}
      <div className="flex small:hidden flex-col gap-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ui-bg-interactive text-ui-fg-on-color text-xs font-semibold">
              {activeIndex + 1}
            </span>
            <span className="text-small-semi text-ui-fg-base">
              Step {activeIndex + 1} of 4: {STEPS[activeIndex]?.title}
            </span>
          </div>
          <span className="text-xs text-ui-fg-muted font-medium">
            {progressPercentage}% Completed
          </span>
        </div>

        {/* Mobile Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-ui-border-base overflow-hidden">
          <div
            className="h-full bg-ui-bg-interactive transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Mobile Step Pills */}
        <div className="flex items-center justify-between gap-1 pt-1">
          {STEPS.map((step, idx) => {
            const completed = isStepCompleted(step.id)
            const active = idx === activeIndex
            const clickable = isStepClickable(step.id)

            return (
              <button
                key={step.id}
                type="button"
                disabled={!clickable}
                onClick={() => handleStepClick(step)}
                className={clx(
                  "flex-1 py-1.5 px-2 rounded-md text-center text-[11px] font-medium transition-colors truncate",
                  {
                    "bg-ui-bg-interactive text-ui-fg-on-color shadow-sm": active,
                    "bg-ui-bg-subtle text-ui-fg-subtle hover:bg-ui-bg-subtle-hover hover:text-ui-fg-base cursor-pointer":
                      completed && !active,
                    "bg-transparent text-ui-fg-muted opacity-50 cursor-not-allowed":
                      !completed && !active,
                  }
                )}
                title={clickable ? `Go back to ${step.title}` : step.title}
              >
                {step.stepNumber}. {step.title}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden small:block relative">
        {/* Continuous Connecting Track */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-ui-border-base -translate-y-1/2 z-0">
          <div
            className="h-full bg-ui-bg-interactive transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Steps Grid */}
        <div className="relative z-10 grid grid-cols-4 gap-x-4">
          {STEPS.map((step, index) => {
            const completed = isStepCompleted(step.id)
            const active = index === activeIndex
            const clickable = isStepClickable(step.id)

            return (
              <div
                key={step.id}
                className={clx("flex flex-col items-center text-center group", {
                  "cursor-pointer": clickable,
                  "cursor-default": !clickable,
                })}
                onClick={() => handleStepClick(step)}
              >
                {/* Step Circle Badge */}
                <button
                  type="button"
                  disabled={!clickable}
                  className={clx(
                    "relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                    {
                      // Active state: Ring aura + brand contrast
                      "bg-ui-bg-interactive text-ui-fg-on-color ring-4 ring-ui-border-interactive ring-offset-2 ring-offset-[var(--surface-card)] scale-110 shadow-md":
                        active,
                      // Completed state: Solid check badge with hover feedback
                      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm cursor-pointer":
                        completed && !active,
                      // Upcoming state: Subtle muted circle
                      "bg-ui-bg-subtle text-ui-fg-muted border border-ui-border-base cursor-not-allowed opacity-75":
                        !active && !completed,
                    }
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {completed && !active ? (
                    <svg
                      className="w-5 h-5 transition-transform group-hover:scale-110"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}

                  {/* Pulsing indicator for active step */}
                  {active && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                  )}
                </button>

                {/* Step Label & Subtitle */}
                <div className="mt-3 flex flex-col items-center">
                  <span
                    className={clx(
                      "text-sm font-semibold transition-colors duration-200",
                      {
                        "text-ui-fg-base": active,
                        "text-ui-fg-subtle group-hover:text-ui-fg-base": completed && !active,
                        "text-ui-fg-muted opacity-60": !active && !completed,
                      }
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-xs text-ui-fg-muted mt-0.5 hidden large:block">
                    {step.subtitle}
                  </span>

                  {clickable && (
                    <span className="text-[10px] text-ui-fg-interactive opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                      Click to edit
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
