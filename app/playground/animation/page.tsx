import CardsAnimation from "@/content/registry/animations/cards-animation/demo"
import Scroll1Animation from "@/content/registry/animations/scroll1-animation/demo"
import Scroll2Animation from "@/content/registry/animations/scroll2-animation/demo"
import Scroll3Animation from "@/content/registry/animations/scroll3-animation/demo"
import Scroll4Animation from "@/content/registry/animations/scroll4-animation/demo"
import Scroll5Animation from "@/content/registry/animations/scroll5-animation/demo"
import Scroll6Animation from "@/content/registry/animations/scroll6-animation/demo"
import Reveal1Animation from "@/content/registry/animations/reveal1-animation/demo"
import Reveal3Animation from "@/content/registry/animations/reveal3-animation/demo"
import Reveal4Animation from "@/content/registry/animations/reveal4-animation/demo"
import Reveal6Animation from "@/content/registry/animations/reveal6-animation/demo"
import DraggableAnimation from "@/content/registry/animations/draggable-animation/demo"
import JiggleAnimation from "@/content/registry/animations/jiggle-animation/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

/** Slugs tested here before they are added to the registry. */
const LOCAL_PLAYGROUND_SLUGS = {
  "cards-animation": CardsAnimation,
  "scroll1-animation": Scroll1Animation,
  "scroll2-animation": Scroll2Animation,
  "scroll3-animation": Scroll3Animation,
  "scroll4-animation": Scroll4Animation,
  "scroll5-animation": Scroll5Animation,
  "scroll6-animation": Scroll6Animation,
  "reveal1-animation": Reveal1Animation,
  "reveal3-animation": Reveal3Animation,
  "reveal4-animation": Reveal4Animation,
  "reveal6-animation": Reveal6Animation,
  "draggable-animation": DraggableAnimation,
  "jiggle-animation": JiggleAnimation,
} as const

const LOCAL_PLAYGROUND_BG: Record<keyof typeof LOCAL_PLAYGROUND_SLUGS, string> = {
  "cards-animation": "#ffffff",
  "scroll1-animation": "#000000",
  "scroll2-animation": "#000000",
  "scroll3-animation": "#000000",
  "scroll4-animation": "#000000",
  "scroll5-animation": "#000000",
  "scroll6-animation": "#000000",
  "reveal1-animation": "#000000",
  "reveal3-animation": "#000000",
  "reveal4-animation": "#000000",
  "reveal6-animation": "#000000",
  "draggable-animation": "#111111",
  "jiggle-animation": "#ffffff",
}

type LocalPlaygroundSlug = keyof typeof LOCAL_PLAYGROUND_SLUGS

function isLocalPlaygroundSlug(slug: string): slug is LocalPlaygroundSlug {
  return slug in LOCAL_PLAYGROUND_SLUGS
}

/** Change this slug or use `?slug=your-animation` in the URL to test another component. */
const DEFAULT_PLAYGROUND_SLUG = "cards-animation"

interface AnimationPlaygroundPageProps {
  searchParams: Promise<{ slug?: string }>
}

export default async function AnimationPlaygroundPage({
  searchParams,
}: AnimationPlaygroundPageProps) {
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
