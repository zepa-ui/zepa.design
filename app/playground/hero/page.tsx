import CrnacuraHero from "@/content/registry/hero-sections/crnacura-hero/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

/** Slugs tested here before they are added to the registry. */
const LOCAL_PLAYGROUND_SLUGS = {
  "crnacura-hero": CrnacuraHero,
} as const

type LocalPlaygroundSlug = keyof typeof LOCAL_PLAYGROUND_SLUGS

function isLocalPlaygroundSlug(slug: string): slug is LocalPlaygroundSlug {
  return slug in LOCAL_PLAYGROUND_SLUGS
}

/** Change this slug or use `?slug=your-hero` in the URL to test another component. */
const DEFAULT_PLAYGROUND_SLUG = "crnacura-hero"

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
      <main className="min-h-screen bg-[#f7f5f0]">
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
