import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const pgConnection = req.scope.resolve("pg_connection") as any;
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any;

    const seed = req.query.seed ? parseFloat(req.query.seed as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const collectionIds = req.query.collection_id 
      ? (Array.isArray(req.query.collection_id) ? req.query.collection_id : [req.query.collection_id]) 
      : [];
    const categoryIds = req.query.category_id 
      ? (Array.isArray(req.query.category_id) ? req.query.category_id : [req.query.category_id]) 
      : [];
    const regionId = req.query.region_id as string | undefined;

    // 1. Set PostgreSQL seed if valid (between -1.0 and 1.0)
    if (seed !== undefined && !isNaN(seed) && seed >= -1.0 && seed <= 1.0) {
      try {
        await pgConnection.raw("SELECT setseed(?)", [seed]);
      } catch (e) {
        // Fall back if setseed is not supported in the database engine
      }
    }

    // 2. Query product IDs ordering by RANDOM()
    let queryStr = "SELECT DISTINCT p.id FROM product p";
    const queryParams: any[] = [];
    const whereClauses: string[] = ["p.status = 'published'"];

    if (collectionIds.length > 0) {
      whereClauses.push(`p.collection_id = ANY(?)`);
      queryParams.push(collectionIds);
    }

    if (categoryIds.length > 0) {
      queryStr += " JOIN product_category_product pcp ON pcp.product_id = p.id";
      whereClauses.push(`pcp.product_category_id = ANY(?)`);
      queryParams.push(categoryIds);
    }

    if (whereClauses.length > 0) {
      queryStr += " WHERE " + whereClauses.join(" AND ");
    }

    queryStr += " ORDER BY random()";

    const queryResult = await pgConnection.raw(queryStr, queryParams);
    const allIds = queryResult.rows.map((row: any) => row.id);
    const count = allIds.length;

    // 3. Slice product IDs for pagination
    const paginatedIds = allIds.slice(offset, offset + limit);

    if (paginatedIds.length === 0) {
      res.json({ products: [], count });
      return;
    }

    // 4. Resolve full product data from the database using Query Service
    const queryResultGraph = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "subtitle",
        "description",
        "thumbnail",
        "status",
        "created_at",
        "updated_at",
        "collection_id",
        "collection.id",
        "collection.title",
        "collection.handle",
        "categories.id",
        "categories.name",
        "categories.handle",
        "tags.id",
        "tags.value",
        "images.id",
        "images.url",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.inventory_quantity",
        "variants.images.id",
        "variants.images.url",
        "variants.options.id",
        "variants.options.value",
        "variants.calculated_price.*",
        "variants.prices.*"
      ],
      filters: {
        id: paginatedIds,
      },
      context: regionId ? {
        region_id: regionId
      } : undefined
    });

    const products = queryResultGraph.data || [];

    // 5. Reorder matching products to match the randomized database list order
    const productsMap = new Map(products.map((p: any) => [p.id, p]));
    const orderedProducts = paginatedIds
      .map((id: string) => productsMap.get(id))
      .filter(Boolean);

    res.json({ products: orderedProducts, count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
