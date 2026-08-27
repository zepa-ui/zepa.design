import Featured1Grid from "@/content/registry/grid-sections/featured1-grid/demo"
import Featured2Grid from "@/content/registry/grid-sections/featured2-grid/demo"
import Featured3Grid from "@/content/registry/grid-sections/featured3-grid/demo"
import Featured4Grid from "@/content/registry/grid-sections/featured4-grid/demo"
import Featured5Grid from "@/content/registry/grid-sections/featured5-grid/demo"
import Featured6Grid from "@/content/registry/grid-sections/featured6-grid/demo"
import Featured7Grid from "@/content/registry/grid-sections/featured7-grid/demo"
import Featured8Grid from "@/content/registry/grid-sections/featured8-grid/demo"
import Featured9Grid from "@/content/registry/grid-sections/featured9-grid/demo"
import Featured10Grid from "@/content/registry/grid-sections/featured10-grid/demo"
import Featured11Grid from "@/content/registry/grid-sections/featured11-grid/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

/** Slugs tested here before they are added to the registry. */
const LOCAL_PLAYGROUND_SLUGS = {
  "featured1-grid": Featured1Grid,
  "featured2-grid": Featured2Grid,
  "featured3-grid": Featured3Grid,
  "featured4-grid": Featured4Grid,
  "featured5-grid": Featured5Grid,
  "featured6-grid": Featured6Grid,
  "featured7-grid": Featured7Grid,
  "featured8-grid": Featured8Grid,
  "featured9-grid": Featured9Grid,
  "featured10-grid": Featured10Grid,
  "featured11-grid": Featured11Grid,
} as const

const LOCAL_PLAYGROUND_BG: Record<keyof typeof LOCAL_PLAYGROUND_SLUGS, string> = {
  "featured1-grid": "#0f111e",
  "featured2-grid": "#3a8ef6",
  "featured3-grid": "#000000",
  "featured4-grid": "#000000",
  "featured5-grid": "#000212",
  "featured6-grid": "#f0f0f0",
  "featured7-grid": "#faf9f7",
  "featured8-grid": "#faf9f7",
  "featured9-grid": "#000000",
  "featured10-grid": "#fbfbfc",
  "featured11-grid": "#ffffff",
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
