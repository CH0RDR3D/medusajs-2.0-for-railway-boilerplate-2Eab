import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows";

export default async function createZambiaFulfillment({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);
  const link = container.resolve(ContainerRegistrationKeys.LINK);

  console.log("Starting Zambia fulfillment configuration script...");

  // 1. Get the Zambia region
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
    filters: { currency_code: ["zmw", "zmk"] }
  });

  if (!regions.length) {
    console.error("No Zambia region found. Please configure a region first in Medusa Admin.");
    return;
  }
  const region = regions[0];
  console.log("Found region:", region);

  // 2. Get default shipping profile
  const [shippingProfile] = await fulfillmentModuleService.listShippingProfiles({
    type: "default"
  });
  if (!shippingProfile) {
    console.error("No default shipping profile found.");
    return;
  }
  console.log("Found default shipping profile:", shippingProfile.id);

  // 3. Get or create stock location
  let stockLocation;
  const stockLocations = await stockLocationModuleService.listStockLocations({});
  if (stockLocations.length) {
    stockLocation = stockLocations[0];
  } else {
    stockLocation = await stockLocationModuleService.createStockLocations({
      name: "Lusaka Warehouse",
      address: { city: "Lusaka", country_code: "ZM", address_1: "Main St" }
    });
  }
  console.log("Using stock location:", stockLocation.id);

  // 4. Create fulfillment set for Zambia
  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Zambia Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Zambia Zone",
        geo_zones: [
          {
            country_code: "zm",
            type: "country",
          }
        ]
      }
    ]
  });
  console.log("Created fulfillment set with Zambia service zone:", fulfillmentSet.id);

  // Link stock location to manual provider and fulfillment set
  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });
  console.log("Linked Stock Location to Manual Provider and Fulfillment Set.");

  // 5. Create shipping options for Zambia Zone
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Store Pickup",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Store Pickup",
          description: "Collect from the shop.",
          code: "pickup",
        },
        prices: [
          {
            region_id: region.id,
            amount: 0,
          }
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Standard Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard Delivery",
          description: "Deliver in 1-2 days.",
          code: "delivery",
        },
        prices: [
          {
            region_id: region.id,
            amount: 50,
          }
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      }
    ]
  });

  console.log("Successfully created Zambia shipping options!");
}
