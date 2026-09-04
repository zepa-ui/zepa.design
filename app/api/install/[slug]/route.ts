import { handleIncrement } from "@/lib/stats/api"
import { enforce } from "@/lib/rate-limit"

interface RouteContext {
  params: Promise<{ slug: string }>
}

/**
 * Fires when someone copies an install command — a deliberate action, so a
 * person might legitimately do it a handful of times while comparing
 * components. 20/min leaves room for that and nothing else.
 */
export async function POST(request: Request, context: RouteContext) {
  const limited = enforce(request, "install", 20, 60_000)
  if (limited) return limited

  const { slug } = await context.params
  return handleIncrement(slug, "installs")
}
