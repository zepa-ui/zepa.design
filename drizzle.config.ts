import { existsSync, readFileSync } from "node:fs"

import { defineConfig } from "drizzle-kit"

/**
 * Next.js loads .env.local automatically; drizzle-kit does not — it only reads
 * .env. Rather than add dotenv-cli or duplicate the secret into a second file,
 * parse it here. Existing process env always wins, so CI can override.
 */
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
    const match = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/.exec(line)
    if (!match) continue
    const key = match[1]
    if (process.env[key]) continue
    process.env[key] = (match[2] ?? "")
      .trim()
      .replace(/^(['"])(.*)\1$/, "$2")
  }
}

/**
 * `npm run db:push` applies lib/db/schema.ts straight to Neon — no migration
 * files. That is the right trade while the schema is still moving; switch to
 * `drizzle-kit generate` + versioned migrations once real user data exists and
 * a bad push would be destructive.
 */
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
