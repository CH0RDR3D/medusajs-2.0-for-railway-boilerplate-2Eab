import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createShippingOptionsWorkflow, deleteShippingOptionsWorkflow } from "@medusajs/medusa/core-flows";

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
    filters: { currency_code: ["zmw", "zmk"] },
  });

  if (!regions.length) {
    console.error("No Zambia region found. Please configure a region first in Medusa Admin.");
    return;
  }
  const region = regions[0];
  console.log("Found region:", region);

  // 2. Get default shipping profile
  const [shippingProfile] = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
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
      name: "Lusaka Central Warehouse",
      address: {
        city: "Lusaka",
        country_code: "ZM",
        address_1: "430B Lamasat Complex 2, Makeni-Bonaventure, Linda Road",
      },
    });
  }
  console.log("Using stock location:", stockLocation.id);

  // 4. Find or create fulfillment set
  const existingSets = await fulfillmentModuleService.listFulfillmentSets(
    { name: "Zambia Warehouse delivery" },
    { relations: ["service_zones", "service_zones.geo_zones"] }
  );

  let fulfillmentSet: any = existingSets.length ? existingSets[0] : null;

  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Zambia Warehouse delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Zambia Zone",
          geo_zones: [
            {
              country_code: "zm",
              type: "country",
            },
          ],
        },
      ],
    });
    console.log("Created fulfillment set with Zambia service zone:", fulfillmentSet.id);
  } else {
    console.log("Found existing fulfillment set:", fulfillmentSet.id);
  }

  // Ensure service zone exists
  let serviceZone = fulfillmentSet.service_zones?.[0];
  if (!serviceZone) {
    serviceZone = await fulfillmentModuleService.createServiceZones({
      fulfillment_set_id: fulfillmentSet.id,
      name: "Zambia Zone",
      geo_zones: [
        {
          country_code: "zm",
          type: "country",
        },
      ],
    });
    console.log("Created service zone:", serviceZone.id);
  }

  // Link stock location to providers and fulfillment set
  const providersToLink = ["manual_manual", "yango-engine_yango-engine"];
  for (const providerId of providersToLink) {
    try {
      await link.create({
        [Modules.STOCK_LOCATION]: {
          stock_location_id: stockLocation.id,
        },
        [Modules.FULFILLMENT]: {
          fulfillment_provider_id: providerId,
        },
      });
      console.log(`Linked Stock Location to provider: ${providerId}`);
    } catch {
      // already linked
    }
  }

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });
    console.log("Linked Stock Location to Fulfillment Set.");
  } catch {
    // already linked
  }

  // 5. Clean up old/redundant options (like 50 ZMW Standard Delivery)
  const existingOptions = (await (fulfillmentModuleService as any).listShippingOptions({
    service_zone_id: serviceZone.id,
  })) as any[];

  const oldOptionsToDelete = existingOptions.filter(
    (o: any) =>
      o.name === "Standard Delivery" ||
      o.name === "Standard Shipping" ||
      o.name === "Yango Express Delivery"
  );

  if (oldOptionsToDelete.length > 0) {
    console.log(`Deleting ${oldOptionsToDelete.length} obsolete shipping option(s)...`);
    try {
      await deleteShippingOptionsWorkflow(container).run({
        input: {
          ids: oldOptionsToDelete.map((o: any) => o.id),
        },
      });
      console.log("Obsolete shipping options removed.");
    } catch (err: any) {
      console.warn("Could not delete obsolete options via workflow, continuing...", err.message);
    }
  }

  // 6. Check if Store Pickup exists
  const hasPickup = existingOptions.some((o: any) => o.name === "Store Pickup");

  const newOptions: any[] = [];

  if (!hasPickup) {
    newOptions.push({
      name: "Store Pickup",
      price_type: "flat",
      provider_id: "manual_manual",
      service_zone_id: serviceZone.id,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "Store Pickup",
        description: "Collect from our Lusaka Central Warehouse.",
        code: "pickup",
      },
      prices: [
        {
          region_id: region.id,
          amount: 0,
        },
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
    });
  }

  // Always create or recreate Yango Express Delivery calculated option
  newOptions.push({
    name: "Yango Express Delivery",
    price_type: "calculated",
    provider_id: "yango-engine_yango-engine",
    service_zone_id: serviceZone.id,
    shipping_profile_id: shippingProfile.id,
    type: {
      label: "Yango Express Delivery",
      description: "Dynamic distance-based delivery across Lusaka.",
      code: "delivery",
    },
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
  });

  if (newOptions.length > 0) {
    console.log("Creating new shipping options:", newOptions.map((o) => o.name));
    await createShippingOptionsWorkflow(container).run({
      input: newOptions,
    });
  }

  console.log("Successfully configured Zambia shipping options!");
}
