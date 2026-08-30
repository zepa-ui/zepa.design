import Link from "next/link"

import { requireAdmin } from "@/lib/auth/admin"
import { getAllStats } from "@/lib/db/queries"
import { registryItems } from "@/content/registry/items"
import { formatCategory } from "@/lib/format-category"

export const dynamic = "force-dynamic"

const nf = new Intl.NumberFormat("en-US")

export default async function AdminComponentsPage() {
  await requireAdmin()

  const rows = await getAllStats()
  /* Widen the key to `string`: registry slugs are a narrowed literal union,
     but slugs coming back from Neon or GA are plain strings, so `.get()`
     rejects them without this. */
  const bySlug = new Map<string, (typeof registryItems)[number]>(
    registryItems.map((i) => [i.slug, i])
  )

  /* Components with no row yet still belong in the table — a zero is
     information, and hiding them would make the list silently incomplete. */
  const seen = new Set(rows.map((r) => r.slug))
  const missing = registryItems
    .filter((i) => !seen.has(i.slug))
    .map((i) => ({
      slug: i.slug,
      views: 0,
      likes: 0,
      saves: 0,
      installs: 0,
      updatedAt: null as Date | null,
    }))

  const all = [...rows, ...missing]

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Component stats</h1>
      <p className="mt-1 text-sm text-white/50">
        {all.length} components · raw counters, no launch-seed floor
      </p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] text-left text-xs uppercase tracking-wider text-white/35">
              <th className="px-4 py-2.5 font-medium">Component</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 text-right font-medium">Views</th>
              <th className="px-4 py-2.5 text-right font-medium">Likes</th>
              <th className="px-4 py-2.5 text-right font-medium">Saves</th>
              <th className="px-4 py-2.5 text-right font-medium">Installs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {all.map((row) => {
              const item = bySlug.get(row.slug)
              return (
                <tr key={row.slug} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-2.5">
                    {item ? (
                      <Link
                        href={`/components/${row.slug}`}
                        className="text-white/85 transition hover:text-white"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      /* a counter row whose component was renamed or removed */
                      <span className="text-white/40">{row.slug} (orphaned)</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-white/40">
                    {item ? formatCategory(item.category) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/70">
                    {nf.format(row.views)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/70">
                    {nf.format(row.likes)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/70">
                    {nf.format(row.saves)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-white/70">
                    {nf.format(row.installs)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
