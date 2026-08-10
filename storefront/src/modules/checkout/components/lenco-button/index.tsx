"use client"

import { Button } from "@medusajs/ui"
import { useEffect, useState } from "react"

type LencoButtonProps = {
  disabled?: boolean
  isLoading?: boolean
  onClick: () => void
}

const LencoButton = ({ disabled, isLoading, onClick }: LencoButtonProps) => {
  const [isInitializing, setIsInitializing] = useState(true)
  const [initFailed, setInitFailed] = useState(false)

  useEffect(() => {
    try {
      const timer = window.setTimeout(() => {
        if (!process.env.NEXT_PUBLIC_LENCO_KEY && !process.env.NEXT_PUBLIC_LENCO_PUBLIC_KEY) {
          console.error("Lenco init warning: NEXT_PUBLIC_LENCO_KEY is missing, using fallback mode")
        }
        setIsInitializing(false)
      }, 900)

      return () => window.clearTimeout(timer)
    } catch (error) {
      console.error("Lenco widget initialization failed", error)
      setInitFailed(true)
      setIsInitializing(false)
    }
  }, [])

  if (isInitializing) {
    return (
      <Button size="large" disabled className="w-full" data-testid="lenco-init-loader">
        Initializing Lenco...
      </Button>
    )
  }

  if (initFailed) {
    return (
      <Button size="large" disabled className="w-full" data-testid="lenco-init-error">
        Lenco unavailable
      </Button>
    )
  }

  return (
    <Button
      size="large"
      className="w-full"
      disabled={disabled}
      isLoading={isLoading}
      onClick={onClick}
      data-testid="pay-with-lenco-button"
    >
      Pay with Lenco
    </Button>
  )
}

export default LencoButton
