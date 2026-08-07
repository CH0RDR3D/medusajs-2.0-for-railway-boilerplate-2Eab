"use client"

import { Button, Container, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

const ProductOnboardingCta = () => {
  const [isOnboarding, setIsOnboarding] = useState(false)

  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    setIsOnboarding(document.cookie.includes("_medusa_onboarding=true"))
  }, [])

  if (!isOnboarding) {
    return null
  }

  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full p-8">
      <div className="flex flex-col gap-y-4 center">
        <Text className="text-ui-fg-base text-xl">
          Your demo product was successfully created! 🎉
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          You can now continue setting up your store in the admin.
        </Text>
        <a href="http://localhost:7001/a/orders?onboarding_step=create_order_nextjs">
          <Button className="w-full">Continue setup in admin</Button>
        </a>
      </div>
    </Container>
  )
}

export default ProductOnboardingCta
