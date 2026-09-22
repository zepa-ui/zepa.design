import { auth, currentUser } from "@clerk/nextjs/server"

import {
  addBookmark,
  ensureUser,
  getBookmarkedSlugs,
  removeBookmark,
} from "@/lib/db/queries"
import { enforce } from "@/lib/rate-limit"

/**
 * GET  /api/bookmarks        → { slugs: string[] }  — the whole set, one request
 * POST /api/bookmarks        → { slug, bookmarked } — sets the DESIRED state
 *
 * Two deliberate choices:
 *
 * 1. GET returns every slug at once rather than exposing a per-slug lookup.
 *    A 40-card gallery asking "am I bookmarked?" per card is 40 requests for
 *    data that fits in one small array.
 *
 * 2. POST takes the desired state, not "toggle". Toggle is inherently racy —
 *    two rapid clicks can arrive out of order and land on the wrong value, and
 *    a retried request flips something the user never touched. Setting an
 *    explicit boolean is idempotent: replays and reordering converge on the
 *    same answer.
 *
 * userId always comes from the verified session. A slug in the body is fine —
 * it names a public component — but identity never is.
 */

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    // not an error: signed-out visitors simply have no bookmarks
    return Response.json({ slugs: [] })
  }

  const rows = await getBookmarkedSlugs(userId)
  return Response.json({ slugs: rows.map((r) => r.slug) })
}

export async function POST(request: Request) {
  const limited = enforce(request, "bookmark", 40, 60_000)
  if (limited) return limited

  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { slug, bookmarked } = (body ?? {}) as {
    slug?: unknown
    bookmarked?: unknown
  }

  if (typeof slug !== "string" || !slug || typeof bookmarked !== "boolean") {
    return Response.json(
      { error: "Expected { slug: string, bookmarked: boolean }" },
      { status: 400 }
    )
  }

  try {
    if (bookmarked) {
      // the FK on bookmarks.user_id requires the row to exist first
      await ensureUser(userId, async () => {
        const user = await currentUser()
        return {
          email: user?.primaryEmailAddress?.emailAddress ?? "",
          displayName:
            user?.fullName ?? user?.username ?? null,
          avatarUrl: user?.imageUrl ?? null,
        }
      })
      await addBookmark(userId, slug)
    } else {
      await removeBookmark(userId, slug)
    }
  } catch {
    return Response.json({ error: "Could not save" }, { status: 500 })
  }

  // echo the authoritative state back so the client can reconcile
  return Response.json({ slug, bookmarked })
}
