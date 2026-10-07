import { handleIncrement } from "@/lib/stats/api"
import { enforce } from "@/lib/rate-limit"

interface RouteContext {
  params: Promise<{ slug: string }>
}

/**
 * Unauthenticated by design — views are event-based and anonymous. That makes
 * this the easiest endpoint to abuse, so it carries the tightest limit.
 *
 * The client also throttles per session (2.5s delay, once per slug per 30min),
 * but that lives in the browser and a curl loop ignores it entirely. This is
 * the server-side half.
 *
 * 30/min is far above any real person: the client fires at most once per slug
 * per half hour.
 */
export async function POST(request: Request, context: RouteContext) {
  const limited = enforce(request, "view", 30, 60_000)
  if (limited) return limited

  const { slug } = await context.params
  return handleIncrement(slug, "views")
}
