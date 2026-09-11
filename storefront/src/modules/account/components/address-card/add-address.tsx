"use client"

import { Plus } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useActionState } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import { addCustomerAddress } from "@lib/data/customer"
import GoogleAddressAutocomplete, {
  ValidatedAddress,
} from "@modules/common/components/google-address-autocomplete"

const AddAddress = ({ region }: { region: HttpTypes.StoreRegion }) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [addressData, setAddressData] = useState({
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    postal_code: "",
    province: "",
    country_code: region?.countries?.[0]?.iso_2 || "zm",
    phone: "",
  })

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const handleGoogleAddressSelect = (validAddress: ValidatedAddress) => {
    setAddressData((prev) => ({
      ...prev,
      address_1: validAddress.address_1,
      address_2: validAddress.address_2 || prev.address_2,
      city: validAddress.city || prev.city,
      province: validAddress.province || prev.province,
      postal_code: validAddress.postal_code || prev.postal_code,
      country_code: validAddress.country_code || prev.country_code,
    }))
  }

  return (
    <>
      <button
        className="border border-ui-border-base rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between"
        onClick={open}
        data-testid="add-address-button"
      >
        <span className="text-base-semi">New address</span>
        <Plus />
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Add address</Heading>
        </Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <div className="flex flex-col gap-y-3">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  value={addressData.first_name}
                  onChange={(e) =>
                    setAddressData((prev) => ({ ...prev, first_name: e.target.value }))
                  }
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  value={addressData.last_name}
                  onChange={(e) =>
                    setAddressData((prev) => ({ ...prev, last_name: e.target.value }))
                  }
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Company"
                name="company"
                autoComplete="organization"
                value={addressData.company}
                onChange={(e) =>
                  setAddressData((prev) => ({ ...prev, company: e.target.value }))
                }
                data-testid="company-input"
              />

              {/* Google Maps Places Autocomplete & Geocoding input */}
              <GoogleAddressAutocomplete
                label="Street Address (Google Maps Validated)"
                name="address_1"
                value={addressData.address_1}
                required
                countryRestriction={region?.countries?.[0]?.iso_2}
                onAddressSelect={handleGoogleAddressSelect}
                onChange={(e) =>
                  setAddressData((prev) => ({ ...prev, address_1: e.target.value }))
                }
                data-testid="address-1-input"
              />

              <Input
                label="Apartment, suite, etc."
                name="address_2"
                autoComplete="address-line2"
                value={addressData.address_2}
                onChange={(e) =>
                  setAddressData((prev) => ({ ...prev, address_2: e.target.value }))
                }
                data-testid="address-2-input"
              />
              <div className="grid grid-cols-[144px_1fr] gap-x-2">
                <Input
                  label="Postal code"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  value={addressData.postal_code}
                  onChange={(e) =>
                    setAddressData((prev) => ({ ...prev, postal_code: e.target.value }))
                  }
                  data-testid="postal-code-input"
                />
                <Input
                  label="City"
                  name="city"
                  required
                  autoComplete="locality"
                  value={addressData.city}
                  onChange={(e) =>
                    setAddressData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  data-testid="city-input"
                />
              </div>
              <Input
                label="Province / State"
                name="province"
                autoComplete="address-level1"
                value={addressData.province}
                onChange={(e) =>
                  setAddressData((prev) => ({ ...prev, province: e.target.value }))
                }
                data-testid="state-input"
              />
              <CountrySelect
                region={region}
                name="country_code"
                required
                autoComplete="country"
                value={addressData.country_code}
                onChange={(e) =>
                  setAddressData((prev) => ({ ...prev, country_code: e.target.value }))
                }
                data-testid="country-select"
              />
              <Input
                label="Phone"
                name="phone"
                autoComplete="phone"
                value={addressData.phone}
                onChange={(e) =>
                  setAddressData((prev) => ({ ...prev, phone: e.target.value }))
                }
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div
                className="text-rose-500 text-small-regular py-2"
                data-testid="address-error"
              >
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton data-testid="save-button">Save</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress

