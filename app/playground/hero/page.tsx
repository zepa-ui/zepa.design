import AirHero from "@/content/registry/hero-sections/air-hero/demo"
import Scroll1Hero from "@/content/registry/hero-sections/scroll1-hero/demo"
import FigmaHero from "@/content/registry/hero-sections/figma-hero/demo"
import BevelHero from "@/content/registry/hero-sections/bevel-hero/demo"
import CardHero from "@/content/registry/hero-sections/card-hero/demo"
import OyoHero from "@/content/registry/hero-sections/oyo-hero/demo"
import Video1Hero from "@/content/registry/hero-sections/video1-hero/demo"
import CrnacuraHero from "@/content/registry/hero-sections/crnacura-hero/demo"
import DropsHero from "@/content/registry/hero-sections/drops-hero/demo"
import LenaHero from "@/content/registry/hero-sections/lena-hero/demo"
import OsmosHero from "@/content/registry/hero-sections/osmos-hero/demo"
import PaperHero from "@/content/registry/hero-sections/paper-hero/demo"
import PopHero from "@/content/registry/hero-sections/pop-hero/demo"
import WaveHero from "@/content/registry/hero-sections/wave-hero/demo"
import ZoomHero from "@/content/registry/hero-sections/zoom-hero/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

/** Slugs tested here before they are added to the registry. */
const LOCAL_PLAYGROUND_SLUGS = {
  "air-hero": AirHero,
  "bevel-hero": BevelHero,
  "scroll1-hero": Scroll1Hero,
  "figma-hero": FigmaHero,
  "card-hero": CardHero,
  "crnacura-hero": CrnacuraHero,
  "drops-hero": DropsHero,
  "lena-hero": LenaHero,
  "osmos-hero": OsmosHero,
  "paper-hero": PaperHero,
  "pop-hero": PopHero,
  "oyo-hero": OyoHero,
  "video1-hero": Video1Hero,
  "wave-hero": WaveHero,
  "zoom-hero": ZoomHero,
} as const

const LOCAL_PLAYGROUND_BG: Record<keyof typeof LOCAL_PLAYGROUND_SLUGS, string> = {
  "air-hero": "#7ab8d8",
  "bevel-hero": "#ffffff",
  "scroll1-hero": "#fffdfc",
  "figma-hero": "#f5f5f4",
  "card-hero": "#000000",
  "crnacura-hero": "#f7f5f0",
  "drops-hero": "#121212",
  "lena-hero": "#0c0b0a",
  "osmos-hero": "#efeeec",
  "paper-hero": "#e4e4e4",
  "pop-hero": "#ffffff",
  "oyo-hero": "#ccd8e4",
  "video1-hero": "#232322",
  "wave-hero": "#808080",
  "zoom-hero": "#f7f5f0",
}

type LocalPlaygroundSlug = keyof typeof LOCAL_PLAYGROUND_SLUGS

function isLocalPlaygroundSlug(slug: string): slug is LocalPlaygroundSlug {
  return slug in LOCAL_PLAYGROUND_SLUGS
}

/** Change this slug or use `?slug=your-hero` in the URL to test another component. */
const DEFAULT_PLAYGROUND_SLUG = "card-hero"

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
