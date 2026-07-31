"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

type StorePickupLinkProps = {
  className?: string
}

const StorePickupLink = ({ className }: StorePickupLinkProps) => {
  return (
    <LocalizedClientLink
      href="/store"
      className={className}
      onClick={() => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("store_pickup_selected", "true")
        }
      }}
      data-testid="shop-and-pick-up-link"
    >
      Shop and Pick Up
    </LocalizedClientLink>
  )
}

export default StorePickupLink
