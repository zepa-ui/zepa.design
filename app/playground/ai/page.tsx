import OrangebotAI from "@/content/registry/ai-section/orangebot-ai/demo"
import GeminiAI from "@/content/registry/ai-section/gemini-ai/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

/** Slugs tested here before they are added to the registry. */
const LOCAL_PLAYGROUND_SLUGS = {
  "orangebot-ai": OrangebotAI,
  "gemini-ai": GeminiAI,
} as const

const LOCAL_PLAYGROUND_BG: Record<keyof typeof LOCAL_PLAYGROUND_SLUGS, string> = {
  "orangebot-ai": "#f6f7f9",
  "gemini-ai": "#ffffff",
}

type LocalPlaygroundSlug = keyof typeof LOCAL_PLAYGROUND_SLUGS

function isLocalPlaygroundSlug(slug: string): slug is LocalPlaygroundSlug {
  return slug in LOCAL_PLAYGROUND_SLUGS
}

/** Change this slug or use `?slug=your-ai` in the URL to test another component. */
const DEFAULT_PLAYGROUND_SLUG = "orangebot-ai"

interface AiPlaygroundPageProps {
  searchParams: Promise<{ slug?: string }>
}

export default async function AiPlaygroundPage({ searchParams }: AiPlaygroundPageProps) {
  const { slug } = await searchParams
  const demoSlug = slug ?? DEFAULT_PLAYGROUND_SLUG

  if (isLocalPlaygroundSlug(demoSlug)) {
    const LocalDemo = LOCAL_PLAYGROUND_SLUGS[demoSlug]

    return (
      <main className="min-h-screen" style={{ background: LOCAL_PLAYGROUND_BG[demoSlug] }}>
        <LocalDemo />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <PlaygroundDemo slug={demoSlug} />
    </main>
  )
}
