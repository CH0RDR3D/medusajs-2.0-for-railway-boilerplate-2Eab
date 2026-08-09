const { defineConfig, loadEnv } = require("@medusajs/utils")

loadEnv(process.env.NODE_ENV || "development", process.cwd())

// CORS when consuming Medusa from admin
const ADMIN_CORS = `${
  process.env.ADMIN_CORS?.length
    ? `${process.env.ADMIN_CORS},`
    : "http://localhost:7000,http://localhost:7001,"
}`

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = `${
  process.env.STORE_CORS?.length
    ? `${process.env.STORE_CORS},`
    : "http://localhost:8000,"
}`

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://medusa:password@localhost/medusa"

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

export default defineConfig({
  plugins: [
    `medusa-fulfillment-manual`,
    `medusa-payment-manual`,
    {
      resolve: `@medusajs/file-local`,
      options: {
        upload_dir: "uploads",
      },
    },
    {
      resolve: `medusa-plugin-meilisearch`,
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST,
          apiKey: process.env.MEILISEARCH_API_KEY,
        },
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: ["title", "description", "variant_sku"],
              displayedAttributes: [
                "id",
                "title",
                "description",
                "variant_sku",
                "thumbnail",
                "handle",
              ],
            },
            primaryKey: "id",
          },
        },
      },
    },
  ],
  admin: {
    backendUrl: "http://localhost:9000",
  },
  projectConfig: {
    databaseUrl: DATABASE_URL,
    http: {
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      authCors: process.env.AUTH_CORS || ADMIN_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    redisUrl: REDIS_URL,
  },
})
