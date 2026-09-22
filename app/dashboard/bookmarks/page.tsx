import Link from "next/link"
import { auth } from "@clerk/nextjs/server"

import { registryItems } from "@/content/registry/items"
import { getBookmarkedSlugs } from "@/lib/db/queries"
import { ShowcaseGrid } from "@/components/showcase/showcase-grid"

export default async function BookmarksPage() {
  const { userId } = await auth.protect()
  const rows = await getBookmarkedSlugs(userId)

  /* Widen the key to `string`: registry slugs are a narrowed literal union,
     but slugs coming back from Neon or GA are plain strings, so `.get()`
     rejects them without this. */
  const bySlug = new Map<string, (typeof registryItems)[number]>(
    registryItems.map((i) => [i.slug, i])
  )
  /* a bookmark can outlive its component if a slug is renamed or removed —
     drop the orphans rather than rendering a broken card */
  const items = rows
    .map((r) => bySlug.get(r.slug))
    .filter((i): i is NonNullable<typeof i> => Boolean(i))

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Bookmarks</h1>
      <p className="mt-1 text-sm text-white/50">
        {items.length} saved {items.length === 1 ? "component" : "components"}
      </p>

      <div className="mt-8">
        {items.length > 0 ? (
          <ShowcaseGrid items={items} />
        ) : (
          <div className="rounded-lg border border-dashed border-white/12 px-6 py-14 text-center">
            <p className="text-sm text-white/60">No bookmarks yet.</p>
            <Link
              href="/components"
              className="mt-4 inline-block rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:border-white/30 hover:text-white"
            >
              Browse components
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
