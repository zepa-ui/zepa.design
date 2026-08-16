import ZepaFolder from "@/content/registry/interactive-illustrations/zepa-folder/demo"
import ZepaDiagram from "@/content/registry/interactive-illustrations/zepa-diagram/demo"
import BeamZepa from "@/content/registry/interactive-illustrations/beam-zepa/demo"
import RingZepa from "@/content/registry/interactive-illustrations/ring-zepa/demo"
import CardsZepa from "@/content/registry/interactive-illustrations/cards-zepa/demo"
import ReportZepa from "@/content/registry/interactive-illustrations/report-zepa/demo"
import TimelineZepa from "@/content/registry/interactive-illustrations/timeline-zepa/demo"
import HalfZepa from "@/content/registry/interactive-illustrations/half-zepa/demo"
import ThreatZepa from "@/content/registry/interactive-illustrations/threat-zepa/demo"
import GithubZepa from "@/content/registry/interactive-illustrations/github-zepa/demo"
import NotificationZepa from "@/content/registry/interactive-illustrations/notification-zepa/demo"
import NotifyZepa from "@/content/registry/interactive-illustrations/notify-zepa/demo"
import CalendarZepa from "@/content/registry/interactive-illustrations/calendar-zepa/demo"
import ZoomZepa from "@/content/registry/interactive-illustrations/zoom-zepa/demo"
import { PlaygroundDemo } from "@/components/showcase/playground-demo"

/** Slugs tested here before they are added to the registry. */
const LOCAL_PLAYGROUND_SLUGS = {
  "zepa-folder": ZepaFolder,
  "zepa-diagram": ZepaDiagram,
  "beam-zepa": BeamZepa,
  "ring-zepa": RingZepa,
  "cards-zepa": CardsZepa,
  "report-zepa": ReportZepa,
  "timeline-zepa": TimelineZepa,
  "half-zepa": HalfZepa,
  "threat-zepa": ThreatZepa,
  "github-zepa": GithubZepa,
  "notification-zepa": NotificationZepa,
  "notify-zepa": NotifyZepa,
  "calendar-zepa": CalendarZepa,
  "zoom-zepa": ZoomZepa,
} as const

const LOCAL_PLAYGROUND_BG: Record<keyof typeof LOCAL_PLAYGROUND_SLUGS, string> = {
  "zepa-folder": "#08080a",
  "zepa-diagram": "#08080a",
  "beam-zepa": "#08080a",
  "ring-zepa": "#08080a",
  "cards-zepa": "#08080a",
  "report-zepa": "#0b0b0e",
  "timeline-zepa": "#08080a",
  "half-zepa": "#0b0b0e",
  "threat-zepa": "#08080a",
  "github-zepa": "#0a0a0a",
  "notification-zepa": "#08080a",
  "notify-zepa": "#f6f6f6",
  "calendar-zepa": "#08080a",
  "zoom-zepa": "#08080a",
}

type LocalPlaygroundSlug = keyof typeof LOCAL_PLAYGROUND_SLUGS

function isLocalPlaygroundSlug(slug: string): slug is LocalPlaygroundSlug {
  return slug in LOCAL_PLAYGROUND_SLUGS
}

/** Change this slug or use `?slug=your-illustration` in the URL to test another component. */
const DEFAULT_PLAYGROUND_SLUG = "zoom-zepa"

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
