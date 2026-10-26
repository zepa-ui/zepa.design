import "server-only"

/**
 * Sliding-window rate limiter.
 *
 * ── READ THIS BEFORE TRUSTING IT ──
 * The backend is an in-memory Map, which on serverless means **per container**.
 * Netlify runs several concurrently and recycles them, so a determined attacker
 * spraying requests will land in different containers and get a fresh budget
 * each time. Cold starts also reset it.
 *
 * So this is a speed bump, not a wall. It stops the realistic case — a single
 * loop hammering /api/view to inflate a counter — and costs nothing. It does
 * not stop a distributed effort.
 *
 * The real fix is a shared store. Swap `hit()` for an Upstash Redis call and
 * every caller keeps working unchanged:
 *
 *   const { success } = await ratelimit.limit(key)
 *   return { ok: success, ... }
 *
 * Upstash's free tier covers this workload comfortably.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/** Stop the Map growing without bound in a long-lived container. */
function sweep(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
}

export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + windowMs }
    buckets.set(key, bucket)
    return { ok: true, remaining: limit - 1, resetAt: bucket.resetAt }
  }

  existing.count += 1
  return {
    ok: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  }
}

/**
 * Best-effort client identity.
 *
 * `x-forwarded-for` is trivially spoofable in general, but on Netlify the edge
 * sets it and the function only sees what the platform wrote — so the leftmost
 * entry is usable here. Never treat it as identity for anything that matters;
 * this is only for throttling.
 */
export function clientKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-nf-client-connection-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown"
  return `${scope}:${forwarded}`
}

/** 429 with the headers a well-behaved client will respect. */
export function tooManyRequests(result: RateLimitResult) {
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
  return Response.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    }
  )
}

/** One call site for the common case. Returns a 429 Response, or null to proceed. */
export function enforce(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number
) {
  const result = hit(clientKey(request, scope), limit, windowMs)
  return result.ok ? null : tooManyRequests(result)
}
