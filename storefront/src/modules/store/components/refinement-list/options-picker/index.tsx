"use client"

import * as Accordion from "@radix-ui/react-accordion"
import { useEffect, useState } from "react"

import { ChevronDownMini } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import clsx from "clsx"

const getMedusaBackendUrl = () =>
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const getPublishableApiKey = () =>
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

type OptionsPickerProps = {
  regionId?: string
  categoryId?: string
  collectionId?: string
  attributes?: Record<string, string[]>
  selectedValueIds: string[]
  setOptionValueIds: (valueIds: string[]) => void
}

export type CustomOption = {
  id: string
  title: string
  values: { id: string; value: string }[]
}

const OptionsPicker = ({
  regionId,
  categoryId,
  collectionId,
  attributes,
  selectedValueIds,
  setOptionValueIds,
}: OptionsPickerProps) => {
  const [options, setOptions] = useState<CustomOption[]>([])
  const [openItems, setOpenItems] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchDynamicOptions = async () => {
      try {
        // Query products for the current category / collection / region context
        const queryParams: Record<string, any> = {
          limit: 100,
          fields: "*options,*options.values,*variants",
        }

        if (regionId) queryParams.region_id = regionId
        if (categoryId) queryParams.category_id = [categoryId]
        if (collectionId) queryParams.collection_id = [collectionId]

        const url = new URL(`${getMedusaBackendUrl()}/store/products`)
        Object.entries(queryParams).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => url.searchParams.append(key, String(item)))
          } else {
            url.searchParams.set(key, String(value))
          }
        })

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: getPublishableApiKey()
            ? {
                "x-publishable-api-key": getPublishableApiKey(),
              }
            : undefined,
        }).then((res) => res.json() as Promise<{ products?: HttpTypes.StoreProduct[] }>)

        if (!isMounted) return

        const products = response?.products || []
        const optionMap = new Map<string, { id: string; title: string; values: Map<string, { id: string; value: string }> }>()

        // Extract options dynamically from matching products
        products.forEach((product) => {
          if (product.options?.length) {
            product.options.forEach((opt) => {
              const optTitle = opt.title || "Option"
              if (!optionMap.has(optTitle)) {
                optionMap.set(optTitle, {
                  id: opt.id || optTitle.toLowerCase().replace(/\s+/g, "_"),
                  title: optTitle,
                  values: new Map(),
                })
              }
              const entry = optionMap.get(optTitle)!
              opt.values?.forEach((val) => {
                if (val.value && !entry.values.has(val.value)) {
                  entry.values.set(val.value, {
                    id: val.id || `${entry.id}-${val.value}`,
                    value: val.value,
                  })
                }
              })
            })
          }
        })

        if (!isMounted) return

        if (optionMap.size > 0) {
          const dynamicOptions: CustomOption[] = Array.from(optionMap.values()).map((opt) => ({
            id: opt.id,
            title: opt.title,
            values: Array.from(opt.values.values()),
          }))
          setOptions(dynamicOptions)
          return
        }

        // Fallback: if attributes prop is provided, convert them into synthetic options
        if (attributes && Object.keys(attributes).length > 0) {
          const syntheticOptions: CustomOption[] = Object.entries(attributes).map(
            ([title, vals]) => ({
              id: title.toLowerCase().replace(/\s+/g, "_"),
              title,
              values: vals.map((v) => ({
                id: `${title.toLowerCase()}-${v}`,
                value: v,
              })),
            })
          )
          setOptions(syntheticOptions)
        }
      } catch (error) {
        console.error("Failed to fetch dynamic product options", error)

        // Fallback to attributes prop on error
        if (attributes && Object.keys(attributes).length > 0) {
          const syntheticOptions: CustomOption[] = Object.entries(attributes).map(
            ([title, vals]) => ({
              id: title.toLowerCase().replace(/\s+/g, "_"),
              title,
              values: vals.map((v) => ({
                id: `${title.toLowerCase()}-${v}`,
                value: v,
              })),
            })
          )
          if (isMounted) setOptions(syntheticOptions)
        }
      }
    }

    fetchDynamicOptions()

    return () => {
      isMounted = false
    }
  }, [regionId, categoryId, collectionId, attributes])

  useEffect(() => {
    if (options.length) {
      setOpenItems(options.map((option) => option.id))
    }
  }, [options])

  if (!options.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="txt-compact-small-plus text-ui-fg-subtle">
          Options
        </span>
      </div>
      <Accordion.Root
        type="multiple"
        value={openItems}
        onValueChange={(values) => setOpenItems(values as string[])}
        className="flex flex-col gap-y-3 pr-6"
      >
        {options.map((option) => {
          const values =
            option.values
              ?.map((value) => ({
                id: value.id,
                label: value.value,
              }))
              .filter(
                (value): value is { id: string; label: string } =>
                  !!value.id && !!value.label
              ) || []

          if (!values.length) {
            return null
          }

          const toggleValue = (valueId: string) => {
            const isSelected = selectedValueIds.includes(valueId)
            const nextSelections = isSelected
              ? selectedValueIds.filter((id) => id !== valueId)
              : [...selectedValueIds, valueId]

            setOptionValueIds(Array.from(new Set(nextSelections)))
          }

          const isOpen = openItems.includes(option.id)
          const selectedCount = values.filter((value) =>
            selectedValueIds.includes(value.id)
          ).length

          return (
            <Accordion.Item
              key={option.id}
              value={option.id}
              className="overflow-hidden"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between py-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="txt-compact-small-plus text-ui-fg-base">
                      {option.title || "Option"}
                    </span>
                    <span className="txt-compact-small-plus text-ui-fg-muted">
                      ({selectedCount})
                    </span>
                  </div>
                  <span
                    className={clsx(
                      "flex h-7 w-7 items-center justify-center text-ui-fg-muted transition-transform duration-150",
                      {
                        "rotate-180": isOpen,
                      }
                    )}
                  >
                    <ChevronDownMini />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="pb-4 pt-1">
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = selectedValueIds.includes(value.id)

                    return (
                      <button
                        key={value.id}
                        onClick={() => toggleValue(value.id)}
                        className={clsx(
                          "border-ui-border-base border text-small-regular h-10 rounded-rounded px-3 flex items-center transition-colors duration-150",
                          {
                            "border-ui-border-interactive text-ui-fg-base":
                              isSelected,
                            "text-ui-fg-muted hover:text-ui-fg-base":
                              !isSelected,
                          }
                        )}
                        aria-pressed={isSelected}
                      >
                        {value.label}
                      </button>
                    )
                  })}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion.Root>
    </div>
  )
}

export default OptionsPicker
