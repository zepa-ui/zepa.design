import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

/**
 * Neon's HTTP driver, not a TCP pool. just commenting sameer
 *
 * Each Netlify Function invocation is its own short-lived container. A
 * connection pool there is worse than useless — every invocation would open
 * its own connections and exhaust the limit. The HTTP driver issues a single
 * stateless request per query, which is the right shape for serverless.
 *
 * DATABASE_URL must be the POOLED string (host contains "-pooler").
 *
 * ── WHY THIS IS LAZY ──
 * The connection was previously built at module scope, so a missing
 * DATABASE_URL threw on *import*. `next build` imports every route while
 * collecting page data, which meant the build required a live database string
 * — and CI, which only needs to lint and typecheck, would fail without holding
 * a production secret.
 *
 * Nothing connects at import time now. The first actual query resolves the
 * connection and throws then if it is missing, which is where the failure
 * belongs: loud at runtime, silent at build.
 */
type Database = ReturnType<typeof drizzle<typeof schema>>

let instance: Database | null = null

function getDb(): Database {
  if (instance) return instance

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add the pooled Neon connection string to .env.local locally, and to the environment variables of your host in production."
    )
  }

  instance = drizzle(neon(connectionString), { schema })
  return instance
}

/**
 * Proxy so every existing `db.select(...)` call site keeps working unchanged
 * while the real client is created on first use. Methods are bound to the
 * client, since drizzle's builders rely on `this`.
 */
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb()
    const value = Reflect.get(real, prop, real)
    return typeof value === "function" ? value.bind(real) : value
  },
})

export { schema }