import ZepaFolder from "@/content/registry/interactive-illustrations/zepa-folder/demo"
import ZepaDiagram from "@/content/registry/interactive-illustrations/zepa-diagram/demo"
import BeamZepa from "@/content/registry/interactive-illustrations/beam-zepa/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

/** Slugs tested here before they are added to the registry. */
const LOCAL_PLAYGROUND_SLUGS = {
  "zepa-folder": ZepaFolder,
  "zepa-diagram": ZepaDiagram,
  "beam-zepa": BeamZepa,
} as const

const LOCAL_PLAYGROUND_BG: Record<keyof typeof LOCAL_PLAYGROUND_SLUGS, string> = {
  "zepa-folder": "#08080a",
  "zepa-diagram": "#08080a",
  "beam-zepa": "#08080a",
}

type LocalPlaygroundSlug = keyof typeof LOCAL_PLAYGROUND_SLUGS

function isLocalPlaygroundSlug(slug: string): slug is LocalPlaygroundSlug {
  return slug in LOCAL_PLAYGROUND_SLUGS
}

/** Change this slug or use `?slug=your-illustration` in the URL to test another component. */
const DEFAULT_PLAYGROUND_SLUG = "zepa-folder"

interface IllustrationPlaygroundPageProps {
  searchParams: Promise<{ slug?: string }>
}

export default async function IllustrationPlaygroundPage({
  searchParams,
}: IllustrationPlaygroundPageProps) {
  const { slug } = await searchParams
  const demoSlug = slug ?? DEFAULT_PLAYGROUND_SLUG

  if (isLocalPlaygroundSlug(demoSlug)) {
    const LocalDemo = LOCAL_PLAYGROUND_SLUGS[demoSlug]

    return (
      <main
        className="min-h-screen"
        style={{ background: LOCAL_PLAYGROUND_BG[demoSlug] }}
      >
        <LocalDemo />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <PlaygroundDemo slug={demoSlug} />
    </main>
  )
}
