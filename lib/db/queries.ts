import "server-only"

import { desc, eq, sql } from "drizzle-orm"

import { db } from "./index"
import { bookmarks, componentStats, likes, submissions, users } from "./schema"

/**
 * Every function here takes `userId` as an argument and none of them read it
 * from a request. Callers must pass the value from Clerk's server-side
 * `auth()` — never something the browser supplied. See backend.md Part 4.
 *
 * `server-only` makes importing this from a client component a build error
 * rather than a runtime leak of DATABASE_URL.
 */

/** Upsert from the Clerk webhook. Idempotent — Clerk retries. */
export async function upsertUser(input: {
  id: string
  email: string
  displayName?: string | null
  avatarUrl?: string | null
}) {
  await db
    .insert(users)
    .values(input)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: input.email,
        displayName: input.displayName ?? null,
        avatarUrl: input.avatarUrl ?? null,
        updatedAt: new Date(),
      },
    })
}

/**
 * Removes the user and, via ON DELETE CASCADE, their bookmarks, likes and
 * submissions. The per-component counters are intentionally NOT decremented:
 * they are historical totals, and rewinding them on account deletion would
 * make the analytics lie about what actually happened.
 */
export async function deleteUser(userId: string) {
  await db.delete(users).where(eq(users.id, userId))
}

export async function getUser(userId: string) {
  const [row] = await db.select().from(users).where(eq(users.id, userId))
  return row ?? null
}

/**
 * Guarantee a `users` row exists before anything references it.
 *
 * Every child table has a foreign key to users.id, so a bookmark written
 * before the Clerk webhook has delivered would fail on the constraint. Rather
 * than make the core flow depend on webhook timing — webhooks can be delayed,
 * dropped, or simply not configured yet — writes call this first.
 *
 * The existence check is a primary-key lookup, so the common path is one cheap
 * query and no call to Clerk. `fetchProfile` only runs the first time a given
 * user writes anything, ever.
 */
export async function ensureUser(
  userId: string,
  fetchProfile: () => Promise<{
    email: string
    displayName?: string | null
    avatarUrl?: string | null
  }>
) {
  const existing = await getUser(userId)
  if (existing) return

  const profile = await fetchProfile()
  await db
    .insert(users)
    .values({ id: userId, ...profile })
    // a concurrent request may have inserted it between the check and here
    .onConflictDoNothing()
}

/** Slugs only — the page joins these against the local registry for titles. */
export async function getBookmarkedSlugs(userId: string) {
  const rows = await db
    .select({ slug: bookmarks.slug, createdAt: bookmarks.createdAt })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt))
  return rows
}

export async function getLikedSlugs(userId: string) {
  const rows = await db
    .select({ slug: likes.slug, createdAt: likes.createdAt })
    .from(likes)
    .where(eq(likes.userId, userId))
    .orderBy(desc(likes.createdAt))
  return rows
}

export async function getSubmissions(userId: string) {
  return db
    .select()
    .from(submissions)
    .where(eq(submissions.userId, userId))
    .orderBy(desc(submissions.createdAt))
}

/**
 * Toggle helpers. The compound primary key means "already bookmarked" is a
 * conflict rather than a race — no read-then-write.
 */
export async function addBookmark(userId: string, slug: string) {
  await db.insert(bookmarks).values({ userId, slug }).onConflictDoNothing()
  await bumpCounter(slug, "saves", 1)
}

export async function removeBookmark(userId: string, slug: string) {
  const deleted = await db
    .delete(bookmarks)
    .where(sql`${bookmarks.userId} = ${userId} and ${bookmarks.slug} = ${slug}`)
    .returning({ slug: bookmarks.slug })
  if (deleted.length) await bumpCounter(slug, "saves", -1)
}

/**
 * Counter increment as a single atomic upsert.
 *
 * A plain UPDATE throws when the row does not exist yet, so a brand-new
 * component would fail on its first event. See backend.md Part 7b.
 */
export async function bumpCounter(
  slug: string,
  column: "views" | "likes" | "saves" | "installs",
  by = 1
) {
  const col = componentStats[column]
  await db
    .insert(componentStats)
    .values({ slug, [column]: Math.max(by, 0) })
    .onConflictDoUpdate({
      target: componentStats.slug,
      // greatest(...,0) so a decrement can never drive a counter negative
      set: {
        [column]: sql`greatest(${col} + ${by}, 0)`,
        updatedAt: new Date(),
      },
    })
}

/**
 * Likes are user-based: one per person, enforced by the compound primary key,
 * so this sets a desired state rather than incrementing. Views are the
 * event-based counterpart — see backend.md Part 7b.
 *
 * Returns whether the row actually changed, so the counter only moves on a
 * real transition and a double-click can't inflate it.
 */
export async function setLike(userId: string, slug: string, liked: boolean) {
  if (liked) {
    const inserted = await db
      .insert(likes)
      .values({ userId, slug })
      .onConflictDoNothing()
      .returning({ slug: likes.slug })
    if (inserted.length) await bumpCounter(slug, "likes", 1)
    return inserted.length > 0
  }

  const deleted = await db
    .delete(likes)
    .where(sql`${likes.userId} = ${userId} and ${likes.slug} = ${slug}`)
    .returning({ slug: likes.slug })
  if (deleted.length) await bumpCounter(slug, "likes", -1)
  return deleted.length > 0
}

export async function hasLiked(userId: string, slug: string) {
  const [row] = await db
    .select({ slug: likes.slug })
    .from(likes)
    .where(sql`${likes.userId} = ${userId} and ${likes.slug} = ${slug}`)
  return Boolean(row)
}

/** Every counter row, for admin analytics. Small table — one component per row. */
export async function getAllStats() {
  return db.select().from(componentStats).orderBy(desc(componentStats.views))
}

export async function getUserCount() {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(users)
  return row?.n ?? 0
}

export async function getRecentUsers(limit = 20) {
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit)
}

export async function getStats(slug: string) {
  const [row] = await db
    .select()
    .from(componentStats)
    .where(eq(componentStats.slug, slug))
  return row ?? null
}
