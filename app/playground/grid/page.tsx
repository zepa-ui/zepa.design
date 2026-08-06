import Featured1Grid from "@/content/registry/grid-sections/featured1-grid/demo"
import Featured2Grid from "@/content/registry/grid-sections/featured2-grid/demo"
import Featured3Grid from "@/content/registry/grid-sections/featured3-grid/demo"
import Featured4Grid from "@/content/registry/grid-sections/featured4-grid/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

/** Slugs tested here before they are added to the registry. */
const LOCAL_PLAYGROUND_SLUGS = {
  "featured1-grid": Featured1Grid,
  "featured2-grid": Featured2Grid,
  "featured3-grid": Featured3Grid,
  "featured4-grid": Featured4Grid,
} as const

const LOCAL_PLAYGROUND_BG: Record<keyof typeof LOCAL_PLAYGROUND_SLUGS, string> = {
  "featured1-grid": "#0f111e",
  "featured2-grid": "#3a8ef6",
  "featured3-grid": "#000000",
  "featured4-grid": "#000000",
}

type LocalPlaygroundSlug = keyof typeof LOCAL_PLAYGROUND_SLUGS

function isLocalPlaygroundSlug(slug: string): slug is LocalPlaygroundSlug {
  return slug in LOCAL_PLAYGROUND_SLUGS
}

/** Change this slug or use `?slug=your-grid` in the URL to test another component. */
const DEFAULT_PLAYGROUND_SLUG = "featured1-grid"

interface GridPlaygroundPageProps {
  searchParams: Promise<{ slug?: string }>
}

export default async function GridPlaygroundPage({
  searchParams,
}: GridPlaygroundPageProps) {
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
