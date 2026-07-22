import CohortNavbar from "@/content/registry/navbar-sections/cohort-navbar/demo"
import CurvedNavbar from "@/content/registry/navbar-sections/curved-navbar/demo"
import UpdatedNavbar from "@/content/registry/navbar-sections/updated-navbar/demo"
import SupasteNavbar from "@/content/registry/navbar-sections/supaste-navbar/demo"
import PhotoNavbar from "@/content/registry/navbar-sections/photo-navbar/demo"
import ClippedNavbar from "@/content/registry/navbar-sections/clipped-navbar/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

/** Slugs tested here before they are added to the registry. */
const LOCAL_PLAYGROUND_SLUGS = {
  "cohort-navbar": CohortNavbar,
  "curved-navbar": CurvedNavbar,
  "updated-navbar": UpdatedNavbar,
  "supaste-navbar": SupasteNavbar,
  "photo-navbar": PhotoNavbar,
  "clipped-navbar": ClippedNavbar,
} as const

const LOCAL_PLAYGROUND_BG: Record<keyof typeof LOCAL_PLAYGROUND_SLUGS, string> = {
  "cohort-navbar": "#f3f3f3",
  "curved-navbar": "#c8c4e8",
  "updated-navbar": "#ffffff",
  "supaste-navbar": "#1a6cf5",
  "photo-navbar": "#1a1a1a",
  "clipped-navbar": "#0a0a0a",
}

type LocalPlaygroundSlug = keyof typeof LOCAL_PLAYGROUND_SLUGS

function isLocalPlaygroundSlug(slug: string): slug is LocalPlaygroundSlug {
  return slug in LOCAL_PLAYGROUND_SLUGS
}

/** Change this slug or use `?slug=your-navbar` in the URL to test another component. */
const DEFAULT_PLAYGROUND_SLUG = "clipped-navbar"

interface NavbarPlaygroundPageProps {
  searchParams: Promise<{ slug?: string }>
}

export default async function NavbarPlaygroundPage({
  searchParams,
}: NavbarPlaygroundPageProps) {
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
    <main className="min-h-screen bg-white">
      <PlaygroundDemo slug={demoSlug} />
    </main>
  )
}
