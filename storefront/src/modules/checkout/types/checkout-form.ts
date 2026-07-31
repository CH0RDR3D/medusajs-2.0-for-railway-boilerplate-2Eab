export interface CheckoutForm {
  first_name: string
  last_name: string
  phone: string
  email?: string
  location: {
    lat: number
    lng: number
  }
  shipping_address: {
    address_1: string
    city: string
    postal_code: string
    country_code: string
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateCheckoutForm = (payload: CheckoutForm): string[] => {
  const errors: string[] = []

  if (!payload.first_name?.trim()) errors.push("First name is required")
  if (!payload.last_name?.trim()) errors.push("Last name is required")
  if (!payload.phone?.trim()) errors.push("Phone is required")

  if (payload.email && !EMAIL_REGEX.test(payload.email.trim())) {
    errors.push("Email is invalid")
  }

  if (!Number.isFinite(payload.location.lat) || !Number.isFinite(payload.location.lng)) {
    errors.push("Location is required")
  }

  if (!payload.shipping_address.address_1?.trim()) {
    errors.push("Shipping address is required")
  }

  if (!payload.shipping_address.city?.trim()) {
    errors.push("City is required")
  }

  if (!payload.shipping_address.postal_code?.trim()) {
    errors.push("Postal code is required")
  }

  if (!payload.shipping_address.country_code?.trim()) {
    errors.push("Country code is required")
  }

  return errors
}
