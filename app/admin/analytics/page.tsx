import Link from "next/link"
import { ExternalLink, Eye, Timer, TrendingUp, UserPlus, Users } from "lucide-react"

import { requireAdmin } from "@/lib/auth/admin"
import { registryItems } from "@/content/registry/items"
import {
  getDailyViews,
  getGaConfig,
  getOverview,
  getTopComponents,
  getTrafficSources,
} from "@/lib/analytics/ga4"

export const dynamic = "force-dynamic"

const nf = new Intl.NumberFormat("en-US")

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  const config = getGaConfig()
  if (!config) return <SetupState />

  /* One failure shouldn't blank the page — allSettled lets the panels that
     did load still render, and the rest show their own error. */
  const [overview, daily, top, sources] = await Promise.allSettled([
    getOverview(config),
    getDailyViews(config),
    getTopComponents(config),
    getTrafficSources(config),
  ])

  /* Widen the key to `string`: registry slugs are a narrowed literal union,
     but slugs coming back from Neon or GA are plain strings, so `.get()`
     rejects them without this. */
  const bySlug = new Map<string, (typeof registryItems)[number]>(
    registryItems.map((i) => [i.slug, i])
  )
  const maxDaily =
    daily.status === "fulfilled"
      ? Math.max(1, ...daily.value.map((d) => d.views))
      : 1

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-white/50">
        Google Analytics 4 · last 28 days · everyone, including signed-out
        visitors
      </p>

      {overview.status === "fulfilled" ? (
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <Stat icon={<Users className="size-4" />} label="Visitors" value={nf.format(overview.value.activeUsers)} />
          <Stat icon={<UserPlus className="size-4" />} label="New users" value={nf.format(overview.value.newUsers)} />
          <Stat icon={<Eye className="size-4" />} label="Page views" value={nf.format(overview.value.pageViews)} />
          <Stat icon={<TrendingUp className="size-4" />} label="Sessions" value={nf.format(overview.value.sessions)} />
          <Stat
            icon={<TrendingUp className="size-4" />}
            label="Engagement"
            value={`${Math.round(overview.value.engagementRate * 100)}%`}
          />
          <Stat
            icon={<Timer className="size-4" />}
            label="Avg session"
            value={formatDuration(overview.value.avgSessionSeconds)}
          />
        </div>
      ) : (
        <PanelError error={overview.reason} />
      )}

      {/* page views over time — a CSS bar chart, no charting library */}
      <section className="mt-10">
        <h2 className="mb-4 text-sm font-medium text-white/80">Page views over time</h2>
        {daily.status === "fulfilled" ? (
          daily.value.length > 0 ? (
            <div className="rounded-lg border border-white/10 p-4">
              <div className="flex h-40 items-end gap-[3px]">
                {daily.value.map((day) => (
                  <div
                    key={day.date}
                    title={`${formatDate(day.date)} — ${nf.format(day.views)} views`}
                    style={{ height: `${Math.max((day.views / maxDaily) * 100, 2)}%` }}
                    className="flex-1 rounded-sm bg-white/20 transition hover:bg-white/40"
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-white/30">
                <span>{formatDate(daily.value[0]?.date ?? "")}</span>
                <span>{formatDate(daily.value.at(-1)?.date ?? "")}</span>
              </div>
            </div>
          ) : (
            <Empty>No page view data in this range.</Empty>
          )
        ) : (
          <PanelError error={daily.reason} />
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-sm font-medium text-white/80">Top components</h2>
          {top.status === "fulfilled" ? (
            top.value.length > 0 ? (
              <ul className="divide-y divide-white/[0.07] overflow-hidden rounded-lg border border-white/10">
                {top.value.map((row) => (
                  <li key={row.path} className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <Link
                      href={row.path}
                      className="min-w-0 truncate text-sm text-white/85 transition hover:text-white"
                    >
                      {bySlug.get(row.slug)?.title ?? row.slug}
                    </Link>
                    <span className="shrink-0 text-sm tabular-nums text-white/55">
                      {nf.format(row.views)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No component page views yet.</Empty>
            )
          ) : (
            <PanelError error={top.reason} />
          )}
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium text-white/80">Traffic sources</h2>
          {sources.status === "fulfilled" ? (
            sources.value.length > 0 ? (
              <ul className="divide-y divide-white/[0.07] overflow-hidden rounded-lg border border-white/10">
                {sources.value.map((row) => (
                  <li key={row.channel} className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <span className="min-w-0 truncate text-sm text-white/85">{row.channel}</span>
                    <span className="shrink-0 text-sm tabular-nums text-white/55">
                      {nf.format(row.sessions)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No session data yet.</Empty>
            )
          ) : (
            <PanelError error={sources.reason} />
          )}
        </section>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-white/30">
        GA4 lags 24–48h on most dimensions, so today will look emptier than it
        is. Neon holds the component counters; this page holds everything about
        people who never signed in.
      </p>
    </div>
  )
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s.toString().padStart(2, "0")}s`
}

/** GA4 returns dates as YYYYMMDD strings. */
function formatDate(raw: string) {
  if (raw.length !== 8) return raw
  return `${raw.slice(6, 8)}/${raw.slice(4, 6)}`
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-white/45">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-white/12 px-6 py-10 text-center text-sm text-white/45">
      {children}
    </div>
  )
}

function PanelError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div className="rounded-lg border border-red-400/20 bg-red-400/[0.04] px-4 py-3">
      <p className="text-sm text-red-300">Couldn&apos;t load this panel.</p>
      <p className="mt-1 break-all text-xs text-white/40">{message}</p>
    </div>
  )
}

function SetupState() {
  const NEEDED = [
    { key: "GA4_PROPERTY_ID", note: "GA4 Admin → Property Settings → Property ID (numeric, not the G- tag)" },
    { key: "GOOGLE_SERVICE_ACCOUNT_EMAIL", note: "…@….iam.gserviceaccount.com" },
    { key: "GOOGLE_PRIVATE_KEY", note: "private_key from the service account JSON, newlines escaped as \\n" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-white/50">
        Site-wide traffic from Google Analytics 4.
      </p>

      <div className="mt-8 rounded-lg border border-dashed border-white/12 p-6">
        <h2 className="text-sm font-medium text-white/85">Not connected yet</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/50">
          The panels are built and will render as soon as these three variables
          are set. Create a <strong className="font-medium text-white/75">service
          account</strong> in Google Cloud, enable the Analytics Data API,
          download the JSON key, then add the service account&apos;s email as a{" "}
          <strong className="font-medium text-white/75">Viewer</strong> on the GA4
          property.
        </p>

        <ul className="mt-5 space-y-1.5">
          {NEEDED.map(({ key, note }) => (
            <li key={key} className="text-sm">
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[13px] text-white/85">
                {key}
              </code>
              <span className="ml-2 text-white/40">{note}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 max-w-2xl text-xs leading-relaxed text-white/35">
          Wrap the private key in double quotes in <code>.env.local</code> — it
          contains spaces and literal <code>\n</code> sequences.
        </p>

        <a
          href="https://analytics.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
        >
          Open Google Analytics
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  )
}
