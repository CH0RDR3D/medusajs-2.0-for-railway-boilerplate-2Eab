import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export const DEFAULT_LUSAKA_WAREHOUSE = {
  id: "default_lusaka_warehouse",
  name: "Lusaka Central Warehouse",
  company: "SYA General Dealers LTD",
  address_1: "430B Lamasat Complex 2, Makeni-Bonaventure, Linda Road",
  address_2: "Plot No. F/687/A/1/A/8 Makeni Road",
  city: "Lusaka",
  province: "Lusaka",
  postal_code: "10101",
  country_code: "zm",
  lat: -15.488449898458102,
  lng: 28.251956946590706,
  metadata: {},
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const stockLocationModuleService = req.scope.resolve(Modules.STOCK_LOCATION)
    let stockLocations: any[] = []

    try {
      stockLocations = await stockLocationModuleService.listStockLocations(
        {},
        { relations: ["address"] }
      )
    } catch {
      try {
        stockLocations = await stockLocationModuleService.listStockLocations({})
      } catch {
        stockLocations = []
      }
    }

    const locations = (stockLocations || []).map((loc) => {
      const addr = loc.address || {}
      const meta = (loc.metadata || {}) as Record<string, any>
      const addrMeta = (addr.metadata || {}) as Record<string, any>

      const lat =
        meta.lat ??
        addrMeta.lat ??
        DEFAULT_LUSAKA_WAREHOUSE.lat

      const lng =
        meta.lng ??
        addrMeta.lng ??
        DEFAULT_LUSAKA_WAREHOUSE.lng

      return {
        id: loc.id,
        name: loc.name || DEFAULT_LUSAKA_WAREHOUSE.name,
        company: addr.company || DEFAULT_LUSAKA_WAREHOUSE.company,
        address_1: addr.address_1 || DEFAULT_LUSAKA_WAREHOUSE.address_1,
        address_2: addr.address_2 || "",
        city: addr.city || DEFAULT_LUSAKA_WAREHOUSE.city,
        province: addr.province || DEFAULT_LUSAKA_WAREHOUSE.province,
        postal_code: addr.postal_code || DEFAULT_LUSAKA_WAREHOUSE.postal_code,
        country_code: (addr.country_code || DEFAULT_LUSAKA_WAREHOUSE.country_code).toLowerCase(),
        lat: typeof lat === "number" ? lat : parseFloat(lat) || DEFAULT_LUSAKA_WAREHOUSE.lat,
        lng: typeof lng === "number" ? lng : parseFloat(lng) || DEFAULT_LUSAKA_WAREHOUSE.lng,
        metadata: loc.metadata || {},
      }
    })

    if (locations.length === 0) {
      locations.push(DEFAULT_LUSAKA_WAREHOUSE)
    }

    res.status(200).json({
      locations,
      default_location: locations[0] || DEFAULT_LUSAKA_WAREHOUSE,
    })
  } catch (error: any) {
    res.status(200).json({
      locations: [DEFAULT_LUSAKA_WAREHOUSE],
      default_location: DEFAULT_LUSAKA_WAREHOUSE,
      warning: error?.message || "Using fallback warehouse origin",
    })
  }
}
