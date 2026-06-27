import HandUnicorn from "@/content/registry/unicorn-section/hand-unicorn/demo"
import RampUnicorn from "@/content/registry/unicorn-section/ramp-unicorn/demo"
import RigelUnicorn from "@/content/registry/unicorn-section/rigel-unicorn/demo"
import VoidUnicorn from "@/content/registry/unicorn-section/void-unicorn/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

const LOCAL_PLAYGROUND_SLUGS = {
  "hand-unicorn": HandUnicorn,
  "ramp-unicorn": RampUnicorn,
  "rigel-unicorn": RigelUnicorn,
  "void-unicorn": VoidUnicorn,
} as const

const LOCAL_PLAYGROUND_BG: Record<keyof typeof LOCAL_PLAYGROUND_SLUGS, string> = {
  "hand-unicorn": "#000000",
  "ramp-unicorn": "#000024",
  "rigel-unicorn": "#000000",
  "void-unicorn": "#000000",
}

type LocalPlaygroundSlug = keyof typeof LOCAL_PLAYGROUND_SLUGS

function isLocalPlaygroundSlug(slug: string): slug is LocalPlaygroundSlug {
  return slug in LOCAL_PLAYGROUND_SLUGS
}

const DEFAULT_PLAYGROUND_SLUG = "ramp-unicorn"

interface UnicornPlaygroundPageProps {
  searchParams: Promise<{ slug?: string }>
}

export default async function UnicornPlaygroundPage({
  searchParams,
}: UnicornPlaygroundPageProps) {
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
    <main className="min-h-screen bg-[#000024]">
      <PlaygroundDemo slug={demoSlug} />
    </main>
  )
}
