import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

/**
 * Neon's HTTP driver, not a TCP pool.
 *
 * Each Netlify Function invocation is its own short-lived container. A
 * connection pool there is worse than useless — every invocation would open
 * its own connections and exhaust the limit. The HTTP driver issues a single
 * stateless request per query, which is the right shape for serverless.
 *
 * DATABASE_URL must be the POOLED string (host contains "-pooler").
 */
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy the pooled connection string from the Neon dashboard into .env.local."
  )
}

const sql = neon(connectionString)

export const db = drizzle(sql, { schema })
export { schema }
