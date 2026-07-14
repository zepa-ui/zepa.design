import BlurUnicorn from "@/content/registry/unicorn-section/blur-unicorn/demo"
import CubeUnicorn from "@/content/registry/unicorn-section/cube-unicorn/demo"
import EarthUnicorn from "@/content/registry/unicorn-section/earth-unicorn/demo"
import GlassUnicorn from "@/content/registry/unicorn-section/glass-unicorn/demo"
import TreeUnicorn from "@/content/registry/unicorn-section/tree-unicorn/demo"
import HandUnicorn from "@/content/registry/unicorn-section/hand-unicorn/demo"
import RampUnicorn from "@/content/registry/unicorn-section/ramp-unicorn/demo"
import RigelUnicorn from "@/content/registry/unicorn-section/rigel-unicorn/demo"
import VoidUnicorn from "@/content/registry/unicorn-section/void-unicorn/demo"
import CatUnicorn from "@/content/registry/unicorn-section/cat-unicorn/demo"
import RingUnicorn from "@/content/registry/unicorn-section/ring-unicorn/demo"
import PlaneUnicorn from "@/content/registry/unicorn-section/plane-unicorn/demo"
import WalkingUnicorn from "@/content/registry/unicorn-section/walking-unicorn/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

const LOCAL_PLAYGROUND_SLUGS = {
  "blur-unicorn": BlurUnicorn,
  "cube-unicorn": CubeUnicorn,
  "earth-unicorn": EarthUnicorn,
  "glass-unicorn": GlassUnicorn,
  "hand-unicorn": HandUnicorn,
  "tree-unicorn": TreeUnicorn,
  "ramp-unicorn": RampUnicorn,
  "rigel-unicorn": RigelUnicorn,
  "void-unicorn": VoidUnicorn,
  "walking-unicorn": WalkingUnicorn,
  "plane-unicorn": PlaneUnicorn,
  "cat-unicorn": CatUnicorn,
  "ring-unicorn": RingUnicorn,
} as const

const LOCAL_PLAYGROUND_BG: Record<keyof typeof LOCAL_PLAYGROUND_SLUGS, string> = {
  "blur-unicorn": "#000000",
  "cube-unicorn": "#000000",
  "earth-unicorn": "#000000",
  "glass-unicorn": "#000000",
  "hand-unicorn": "#000000",
  "tree-unicorn": "#000000",
  "ramp-unicorn": "#000024",
  "rigel-unicorn": "#000000",
  "void-unicorn": "#000000",
  "walking-unicorn": "#0a0f14",
  "plane-unicorn": "#000000",
  "cat-unicorn": "#000000",
  "ring-unicorn": "#08111a",
}

type LocalPlaygroundSlug = keyof typeof LOCAL_PLAYGROUND_SLUGS

function isLocalPlaygroundSlug(slug: string): slug is LocalPlaygroundSlug {
  return slug in LOCAL_PLAYGROUND_SLUGS
}

const DEFAULT_PLAYGROUND_SLUG = "blur-unicorn"

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
