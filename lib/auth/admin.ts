import "server-only"

import { auth, currentUser } from "@clerk/nextjs/server"

/**
 * Admin is a role on the same Clerk account, not a separate login.
 *
 * A second admin credential would be strictly worse: another password to
 * phish, no SSO, and a login page that advertises an admin panel exists.
 *
 * The role lives in Clerk `publicMetadata`:
 *   Clerk Dashboard → Users → (you) → Metadata → Public → { "role": "admin" }
 *
 * IMPORTANT: `publicMetadata` is NOT in the session token by default, so
 * `sessionClaims.metadata` is empty until you add a custom claim:
 *   Clerk Dashboard → Sessions → Customize session token →
 *     { "metadata": "{{user.public_metadata}}" }
 *
 * Rather than depend on that being configured, this reads the claim first
 * (free — it's already in the token) and falls back to `currentUser()`, which
 * always carries publicMetadata at the cost of one API call. Correct either
 * way; just faster once the claim is set up.
 *
 * NEVER read the role from the client. A value the browser supplies is a
 * suggestion, not a permission.
 */
async function readRole(): Promise<string | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null

  const claim = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (claim) return claim

  // claim not configured — ask Clerk directly
  const user = await currentUser()
  const meta = user?.publicMetadata as { role?: string } | undefined
  return meta?.role ?? null
}

export async function getIsAdmin() {
  return (await readRole()) === "admin"
}

/**
 * Throws Next's notFound() rather than a 403.
 *
 * A 403 confirms the route exists, which tells an attacker where to aim. A 404
 * is indistinguishable from a typo.
 */
export async function requireAdmin() {
  const { userId } = await auth()
  const role = await readRole()

  if (!userId || role !== "admin") {
    const { notFound } = await import("next/navigation")
    notFound()
  }

  return userId
}
