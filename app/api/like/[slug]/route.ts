import { auth, currentUser } from "@clerk/nextjs/server"

import { assertRegistrySlug, statsJson } from "@/lib/stats/api"
import { getStats, ensureUser, hasLiked, setLike } from "@/lib/db/queries"
import { enforce } from "@/lib/rate-limit"
import { getMetaStats } from "@/lib/stats/meta-seeds"

interface RouteContext {
  params: Promise<{ slug: string }>
}

/**
 * Likes are USER-based — one per person, enforced by the compound primary key
 * on (user_id, slug). That is the opposite of views, which are event-based and
 * anonymous (backend.md Part 7b).
 *
 * So this route requires auth, and it sets a desired state rather than
 * incrementing: an increment endpoint can be called repeatedly by anyone and
 * the number means nothing.
 */
export async function POST(request: Request, context: RouteContext) {
  /* Auth already caps the damage — the compound PK means a like can't be
     counted twice — but toggling on/off in a loop would still hammer Neon. */
  const limited = enforce(request, "like", 30, 60_000)
  if (limited) return limited

  const { slug } = await context.params

  const notFound = await assertRegistrySlug(slug)
  if (notFound) return notFound

  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // body is optional: no body means "like it", matching the old call site
  let liked = true
  try {
    const body = (await request.json()) as { liked?: unknown }
    if (typeof body?.liked === "boolean") liked = body.liked
  } catch {
    // no JSON body — keep the default
  }

  if (liked) {
    // FK on likes.user_id needs the row to exist before we reference it
    await ensureUser(userId, async () => {
      const user = await currentUser()
      return {
        email: user?.primaryEmailAddress?.emailAddress ?? "",
        displayName: user?.fullName ?? user?.username ?? null,
        avatarUrl: user?.imageUrl ?? null,
      }
    })
  }

  await setLike(userId, slug, liked)

  const row = await getStats(slug)
  const seed = getMetaStats(slug)
  return statsJson({
    views: Math.max(row?.views ?? 0, seed.views),
    likes: Math.max(row?.likes ?? 0, seed.likes),
    installs: Math.max(row?.installs ?? 0, seed.installs),
  })
}

/** Whether the signed-in user has liked this component. */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params
  const { userId } = await auth()
  if (!userId) return Response.json({ liked: false })
  return Response.json({ liked: await hasLiked(userId, slug) })
}
