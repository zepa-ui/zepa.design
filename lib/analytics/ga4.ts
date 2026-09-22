import "server-only"

import { createSign } from "node:crypto"

/**
 * Minimal GA4 Data API client — no SDK.
 *
 * `@google-analytics/data` would work, but it pulls in gRPC and a large
 * dependency tree for what is ultimately two HTTPS calls: mint a signed JWT,
 * exchange it for an access token, then POST a report request. Doing it
 * directly keeps the surface small and avoids another package whose version
 * has to track the rest of the stack.
 *
 * Service account, not OAuth: there is no user to consent, nothing to refresh,
 * and nothing that expires beyond the hour-long access token cached below.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token"
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly"

export interface GaConfig {
  propertyId: string
  clientEmail: string
  privateKey: string
}

/** Null when unconfigured, so callers can render a setup state instead of throwing. */
export function getGaConfig(): GaConfig | null {
  const propertyId = process.env.GA4_PROPERTY_ID
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_PRIVATE_KEY

  if (!propertyId || !clientEmail || !rawKey) return null

  return {
    propertyId,
    clientEmail,
    // env files can't hold real newlines, so the key is stored with literal \n
    privateKey: rawKey.replace(/\\n/g, "\n"),
  }
}

function base64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/**
 * Access tokens last an hour. Cached on the module so a warm serverless
 * container reuses one instead of re-signing on every request; a cold start
 * simply mints a new one.
 */
let cached: { token: string; expiresAt: number } | null = null

async function getAccessToken(config: GaConfig): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token

  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const claims = base64url(
    JSON.stringify({
      iss: config.clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now,
    })
  )

  const signer = createSign("RSA-SHA256")
  signer.update(`${header}.${claims}`)
  signer.end()
  const signature = base64url(signer.sign(config.privateKey))
  const assertion = `${header}.${claims}.${signature}`

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  })

  if (!response.ok) {
    throw new Error(`Token exchange failed (${response.status})`)
  }

  const data = (await response.json()) as {
    access_token: string
    expires_in: number
  }

  cached = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  return cached.token
}

export interface ReportRow {
  dimensions: string[]
  metrics: string[]
}

/**
 * One `runReport` call. Dimensions and metrics are GA4 API names —
 * e.g. metrics `activeUsers`, `screenPageViews`; dimensions `date`,
 * `pagePath`, `sessionDefaultChannelGroup`.
 */
export async function runReport(
  config: GaConfig,
  body: Record<string, unknown>
): Promise<ReportRow[]> {
  const token = await getAccessToken(config)

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // GA4 data is not live; a short cache keeps repeated admin loads cheap
      next: { revalidate: 300 },
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GA4 report failed (${response.status}): ${text.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[]
  }

  return (data.rows ?? []).map((row) => ({
    dimensions: (row.dimensionValues ?? []).map((d) => d.value),
    metrics: (row.metricValues ?? []).map((m) => m.value),
  }))
}

const DATE_RANGE = [{ startDate: "28daysAgo", endDate: "today" }]

/** Site totals for the last 28 days. */
export async function getOverview(config: GaConfig) {
  const rows = await runReport(config, {
    dateRanges: DATE_RANGE,
    metrics: [
      { name: "activeUsers" },
      { name: "newUsers" },
      { name: "screenPageViews" },
      { name: "sessions" },
      { name: "engagementRate" },
      { name: "averageSessionDuration" },
    ],
  })

  const m = rows[0]?.metrics ?? []
  return {
    activeUsers: Number(m[0] ?? 0),
    newUsers: Number(m[1] ?? 0),
    pageViews: Number(m[2] ?? 0),
    sessions: Number(m[3] ?? 0),
    engagementRate: Number(m[4] ?? 0),
    avgSessionSeconds: Number(m[5] ?? 0),
  }
}

/** Daily page views, oldest first. */
export async function getDailyViews(config: GaConfig) {
  const rows = await runReport(config, {
    dateRanges: DATE_RANGE,
    dimensions: [{ name: "date" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  })

  return rows.map((r) => ({
    date: r.dimensions[0] ?? "",
    views: Number(r.metrics[0] ?? 0),
    users: Number(r.metrics[1] ?? 0),
  }))
}

/** Most-viewed component pages — filtered to /components/ paths only. */
export async function getTopComponents(config: GaConfig, limit = 10) {
  const rows = await runReport(config, {
    dateRanges: DATE_RANGE,
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        stringFilter: { matchType: "BEGINS_WITH", value: "/components/" },
      },
    },
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit,
  })

  return rows.map((r) => ({
    path: r.dimensions[0] ?? "",
    slug: (r.dimensions[0] ?? "").replace("/components/", "").split("/")[0],
    views: Number(r.metrics[0] ?? 0),
  }))
}

/** Where people came from. */
export async function getTrafficSources(config: GaConfig, limit = 8) {
  const rows = await runReport(config, {
    dateRanges: DATE_RANGE,
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit,
  })

  return rows.map((r) => ({
    channel: r.dimensions[0] ?? "Unknown",
    sessions: Number(r.metrics[0] ?? 0),
  }))
}
