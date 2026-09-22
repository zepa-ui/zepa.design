import Link from "next/link"
import { Bookmark, Eye, Heart, Package, Users } from "lucide-react"

import { requireAdmin } from "@/lib/auth/admin"
import { getAllStats, getUserCount } from "@/lib/db/queries"
import { registryItems } from "@/content/registry/items"

export const dynamic = "force-dynamic"

const nf = new Intl.NumberFormat("en-US")

export default async function AdminOverviewPage() {
  await requireAdmin()

  const [rows, userCount] = await Promise.all([getAllStats(), getUserCount()])

  /* Raw stored values — no meta-seed floor. The public pages floor counters at
     their launch seeds so the site's numbers don't drop to zero, but admin has
     to show what actually happened. */
  const totals = rows.reduce(
    (acc, r) => ({
      views: acc.views + r.views,
      likes: acc.likes + r.likes,
      saves: acc.saves + r.saves,
      installs: acc.installs + r.installs,
    }),
    { views: 0, likes: 0, saves: 0, installs: 0 }
  )

  /* Widen the key to `string`: registry slugs are a narrowed literal union,
     but slugs coming back from Neon or GA are plain strings, so `.get()`
     rejects them without this. */
  const bySlug = new Map<string, (typeof registryItems)[number]>(
    registryItems.map((i) => [i.slug, i])
  )
  const top = rows.slice(0, 8)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-white/50">
        Real counters from Neon. Public pages show these floored at each
        component&apos;s launch seed; these are the raw figures.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat icon={<Users className="size-4" />} label="Users" value={userCount} />
        <Stat icon={<Eye className="size-4" />} label="Views" value={totals.views} />
        <Stat icon={<Heart className="size-4" />} label="Likes" value={totals.likes} />
        <Stat icon={<Bookmark className="size-4" />} label="Saves" value={totals.saves} />
        <Stat icon={<Package className="size-4" />} label="Installs" value={totals.installs} />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-medium text-white/80">Top components by views</h2>
          <Link
            href="/admin/components"
            className="text-xs text-white/45 transition hover:text-white"
          >
            View all
          </Link>
        </div>

        {top.length > 0 ? (
          <ul className="divide-y divide-white/[0.07] overflow-hidden rounded-lg border border-white/10">
            {top.map((row) => (
              <li
                key={row.slug}
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <span className="min-w-0 truncate text-sm text-white/85">
                  {bySlug.get(row.slug)?.title ?? row.slug}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-white/55">
                  {nf.format(row.views)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-white/12 px-6 py-12 text-center">
            <p className="text-sm text-white/60">No recorded activity yet.</p>
            <p className="mt-1 text-xs text-white/35">
              Counters populate as people view, like, save and install components.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-white/45">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{nf.format(value)}</p>
    </div>
  )
}
