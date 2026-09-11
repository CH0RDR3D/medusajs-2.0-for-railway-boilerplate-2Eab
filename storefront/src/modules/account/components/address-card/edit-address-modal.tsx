"use client"

import React, { useEffect, useState } from "react"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import useToggleState from "@lib/hooks/use-toggle-state"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import Spinner from "@modules/common/icons/spinner"
import { useActionState } from "react"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import GoogleAddressAutocomplete, {
  ValidatedAddress,
} from "@modules/common/components/google-address-autocomplete"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [addressData, setAddressData] = useState({
    first_name: address.first_name || "",
    last_name: address.last_name || "",
    company: address.company || "",
    address_1: address.address_1 || "",
    address_2: address.address_2 || "",
    city: address.city || "",
    postal_code: address.postal_code || "",
    province: address.province || "",
    country_code: address.country_code || region?.countries?.[0]?.iso_2 || "zm",
    phone: address.phone || "",
  })

  const [formState, formAction] = useActionState(updateCustomerAddress, {
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

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "border rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors",
          {
            "border-gray-900": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col">
          <Heading
            className="text-left text-base-semi"
            data-testid="address-name"
          >
            {address.first_name} {address.last_name}
          </Heading>
          {address.company && (
            <Text
              className="txt-compact-small text-ui-fg-base"
              data-testid="address-company"
            >
              {address.company}
            </Text>
          )}
          <Text className="flex flex-col text-left text-base-regular mt-2">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </span>
            <span data-testid="address-postal-city">
              {address.postal_code}, {address.city}
            </span>
            <span data-testid="address-province-country">
              {address.province && `${address.province}, `}
              {address.country_code?.toUpperCase()}
            </span>
          </Text>
        </div>
        <div className="flex items-center gap-x-4">
          <button
            className="text-small-regular text-ui-fg-base flex items-center gap-x-2"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit />
            Edit
          </button>
          <button
            className="text-small-regular text-ui-fg-base flex items-center gap-x-2"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <Trash />}
            Remove
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Edit address</Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-3">
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

              {/* Google Maps Places Autocomplete */}
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
                name="country_code"
                region={region}
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
              <div className="text-rose-500 text-small-regular py-2">
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

export default EditAddress

