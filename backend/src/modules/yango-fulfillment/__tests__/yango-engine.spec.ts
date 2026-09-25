import {
  YangoEngineService,
  calculateHaversineDistance,
} from "../services/yango-engine"

describe("YangoEngine Fulfillment Provider", () => {
  const mockContainer = {
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  }

  describe("Haversine Distance calculation", () => {
    it("calculates distance correctly with 1.35x road factor", () => {
      // Makeni Linda Rd Warehouse to nearby coordinate
      const origin = { lat: -15.488449898458102, lng: 28.251956946590706 }
      const destination = { lat: -15.505, lng: 28.265 }
      const dist = calculateHaversineDistance(origin, destination, 1.35)
      expect(dist).toBeGreaterThan(0)
      expect(dist).toBeCloseTo(3.1, 0)
    })

    it("returns default fallback distance for invalid coordinates", () => {
      const dist = calculateHaversineDistance(
        { lat: NaN, lng: NaN },
        { lat: -15.488449898458102, lng: 28.251956946590706 }
      )
      expect(dist).toBe(3.5)
    })
  })

  describe("YangoEngineService methods", () => {
    const service = new YangoEngineService(mockContainer, {
      base_fare: 30,
      base_distance_km: 2,
      per_km_rate: 8,
      min_fare: 35,
      max_radius_km: 45,
      road_factor: 1.35,
    })

    it("exposes fulfillment options including express delivery and store pickup", async () => {
      const options = await service.getFulfillmentOptions()
      expect(options).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "yango-express", name: "Yango Express Delivery" }),
          expect.objectContaining({ id: "store-pickup", name: "Store Pickup" }),
        ])
      )
    })

    it("returns 0 cost for store pickup option", async () => {
      const price = await service.calculatePrice(
        { id: "store-pickup" },
        { is_pickup: true },
        {} as any
      )
      expect(price).toEqual({
        calculated_amount: 0,
        is_calculated_price_tax_inclusive: true,
      })
    })

    it("applies min fare 35 ZMW when distance fare is lower (e.g. 1 km -> 30 ZMW base -> 35 ZMW min)", async () => {
      const price = await service.calculatePrice(
        { id: "yango-express" },
        { distance_km: 1 },
        {} as any
      )
      expect(price.calculated_amount).toBe(35)
      expect(price.is_calculated_price_tax_inclusive).toBe(true)
    })

    it("calculates distance rate beyond 2 km correctly (e.g. 5 km -> 30 + 3*8 = 54 ZMW)", async () => {
      const price = await service.calculatePrice(
        { id: "yango-express" },
        { distance_km: 5 },
        {} as any
      )
      expect(price.calculated_amount).toBe(54)
    })

    it("calculates distance rate for 10 km (30 + 8*8 = 94 ZMW)", async () => {
      const price = await service.calculatePrice(
        { id: "yango-express" },
        { distance_km: 10 },
        {} as any
      )
      expect(price.calculated_amount).toBe(94)
    })

    it("can create fulfillment and return status", async () => {
      const res = await service.createFulfillment(
        { test: "data" },
        [],
        undefined,
        { data: {} } as any
      )
      expect(res.data).toMatchObject({
        provider: "yango-engine",
        status: "ready_for_dispatch",
        test: "data",
      })
    })
  })
})
