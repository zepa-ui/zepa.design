import CrnacuraHero from "@/content/registry/hero-sections/crnacura-hero/demo"
import DropsHero from "@/content/registry/hero-sections/drops-hero/demo"
import LenaHero from "@/content/registry/hero-sections/lena-hero/demo"
import OsmosHero from "@/content/registry/hero-sections/osmos-hero/demo"
import PaperHero from "@/content/registry/hero-sections/paper-hero/demo"
import PopHero from "@/content/registry/hero-sections/pop-hero/demo"
import ZoomHero from "@/content/registry/hero-sections/zoom-hero/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

/** Slugs tested here before they are added to the registry. */
const LOCAL_PLAYGROUND_SLUGS = {
  "crnacura-hero": CrnacuraHero,
  "drops-hero": DropsHero,
  "lena-hero": LenaHero,
  "osmos-hero": OsmosHero,
  "paper-hero": PaperHero,
  "pop-hero": PopHero,
  "zoom-hero": ZoomHero,
} as const

const LOCAL_PLAYGROUND_BG: Record<keyof typeof LOCAL_PLAYGROUND_SLUGS, string> = {
  "crnacura-hero": "#f7f5f0",
  "drops-hero": "#121212",
  "lena-hero": "#0c0b0a",
  "osmos-hero": "#efeeec",
  "paper-hero": "#e4e4e4",
  "pop-hero": "#ffffff",
  "zoom-hero": "#f7f5f0",
}

type LocalPlaygroundSlug = keyof typeof LOCAL_PLAYGROUND_SLUGS

function isLocalPlaygroundSlug(slug: string): slug is LocalPlaygroundSlug {
  return slug in LOCAL_PLAYGROUND_SLUGS
}

/** Change this slug or use `?slug=your-hero` in the URL to test another component. */
const DEFAULT_PLAYGROUND_SLUG = "osmos-hero"

interface HeroPlaygroundPageProps {
  searchParams: Promise<{ slug?: string }>
}

export default async function HeroPlaygroundPage({
  searchParams,
}: HeroPlaygroundPageProps) {
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
