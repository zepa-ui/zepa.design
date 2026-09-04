import Link from "next/link"
import { auth, currentUser } from "@clerk/nextjs/server"
import { Bookmark, Upload } from "lucide-react"

import { registryItems } from "@/content/registry/items"
import { getBookmarkedSlugs, getSubmissions } from "@/lib/db/queries"
import { ShowcaseGrid } from "@/components/showcase/showcase-grid"

/**
 * Overview.
 *
 * Note what is NOT here: likes and installs. Both are counted from the first
 * event, but they are surfaced only in admin analytics for now (backend.md
 * Part 3). Showing them later is a template change, not a migration.
 */
export default async function DashboardPage() {
  const { userId } = await auth.protect()
  const user = await currentUser()

  const [bookmarked, subs] = await Promise.all([
    getBookmarkedSlugs(userId),
    getSubmissions(userId),
  ])

  // resolve slugs against the local registry — titles and previews live in
  // the repo, so the database only ever stores the slug
  /* Widen the key to `string`: registry slugs are a narrowed literal union,
     but slugs coming back from Neon or GA are plain strings, so `.get()`
     rejects them without this. */
  const bySlug = new Map<string, (typeof registryItems)[number]>(
    registryItems.map((i) => [i.slug, i])
  )
  const recent = bookmarked
    .map((b) => bySlug.get(b.slug))
    .filter((i): i is NonNullable<typeof i> => Boolean(i))

  const firstName = user?.firstName ?? user?.username ?? null

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-white/50">
        Your saved components and submissions.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
        <Stat icon={<Bookmark className="size-4" />} label="Bookmarks" value={bookmarked.length} />
        <Stat icon={<Upload className="size-4" />} label="Submissions" value={subs.length} />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-medium text-white/80">Recent bookmarks</h2>
          {recent.length > 0 ? (
            <Link
              href="/dashboard/bookmarks"
              className="text-xs text-white/45 transition hover:text-white"
            >
              View all
            </Link>
          ) : null}
        </div>

        {recent.length > 0 ? (
          <ShowcaseGrid items={recent.slice(0, 4)} />
        ) : (
          <EmptyState />
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
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-white/12 px-6 py-14 text-center">
      <p className="text-sm text-white/60">You haven&apos;t saved anything yet.</p>
      <Link
        href="/components"
        className="mt-4 inline-block rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:border-white/30 hover:text-white"
      >
        Browse components
      </Link>
    </div>
  )
}
