import { desc } from "drizzle-orm"

import { requireAdmin } from "@/lib/auth/admin"
import { db } from "@/lib/db"
import { submissions } from "@/lib/db/schema"

export const dynamic = "force-dynamic"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
  approved: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
  rejected: "bg-red-400/10 text-red-300 ring-red-400/20",
}

export default async function AdminSubmissionsPage() {
  await requireAdmin()

  /* every submission, not just the current user's — that is the point of the
     admin view */
  const rows = await db
    .select()
    .from(submissions)
    .orderBy(desc(submissions.createdAt))
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Submissions</h1>
      <p className="mt-1 text-sm text-white/50">
        {rows.length} {rows.length === 1 ? "submission" : "submissions"} across all
        users
      </p>

      <div className="mt-8">
        {rows.length > 0 ? (
          <ul className="divide-y divide-white/[0.07] overflow-hidden rounded-lg border border-white/10">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white/90">{row.title}</p>
                  <p className="text-xs text-white/40">
                    {row.slug ?? "no slug"} · {row.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] capitalize ring-1 ${
                    STATUS_STYLES[row.status] ??
                    "bg-white/5 text-white/60 ring-white/10"
                  }`}
                >
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-white/12 px-6 py-14 text-center">
            <p className="text-sm text-white/60">No submissions yet.</p>
            <p className="mt-1 text-xs text-white/35">
              Community submissions aren&apos;t open yet — approve and reject
              actions land here once they are.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
