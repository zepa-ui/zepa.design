import type { NextRequest } from "next/server"
import { verifyWebhook } from "@clerk/nextjs/webhooks"

import { deleteUser, upsertUser } from "@/lib/db/queries"

/**
 * Clerk → Neon user sync.
 *
 * Until this existed, `users` rows were only created lazily by `ensureUser` on
 * a user's first write — so anyone who signed up and never bookmarked or liked
 * had no row at all, and the admin user count undercounted accordingly.
 *
 * `verifyWebhook` ships with Clerk v7 (`@clerk/nextjs/webhooks`) and checks the
 * Svix signature against CLERK_WEBHOOK_SIGNING_SECRET, so no separate `svix`
 * dependency is needed. An unverified body must never be trusted — this
 * endpoint is public by necessity, since Clerk calls it rather than a browser.
 *
 * Every handler is idempotent: Clerk retries on non-2xx, and duplicates are
 * normal rather than exceptional.
 */
/* NextRequest, not Request — verifyWebhook needs the cookies/nextUrl surface. */
export async function POST(request: NextRequest) {
  let event
  try {
    event = await verifyWebhook(request)
  } catch {
    // bad signature, or the secret isn't configured
    return new Response("Invalid signature", { status: 400 })
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const data = event.data
        const primary = data.email_addresses?.find(
          (e) => e.id === data.primary_email_address_id
        )

        await upsertUser({
          id: data.id,
          email: primary?.email_address ?? data.email_addresses?.[0]?.email_address ?? "",
          displayName:
            [data.first_name, data.last_name].filter(Boolean).join(" ") ||
            data.username ||
            null,
          avatarUrl: data.image_url ?? null,
        })
        break
      }

      case "user.deleted": {
        // `id` is optional on this payload when the record was already purged
        if (event.data.id) await deleteUser(event.data.id)
        break
      }

      default:
        // other event types are acknowledged so Clerk stops retrying them
        break
    }
  } catch {
    // 500 tells Clerk to retry — safe, because the handlers are idempotent
    return new Response("Handler failed", { status: 500 })
  }

  return new Response("ok", { status: 200 })
}
