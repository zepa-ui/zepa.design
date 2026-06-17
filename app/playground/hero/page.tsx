import { PlaygroundDemo } from "@/components/showcase/playground-demo"

/** Change this slug or use `?slug=your-hero` in the URL to test another component. */
const DEFAULT_PLAYGROUND_SLUG = "amind-hero"

interface HeroPlaygroundPageProps {
  searchParams: Promise<{ slug?: string }>
}

export default async function HeroPlaygroundPage({
  searchParams,
}: HeroPlaygroundPageProps) {
  const { slug } = await searchParams
  const demoSlug = slug ?? DEFAULT_PLAYGROUND_SLUG

  return (
    <main className="min-h-screen bg-black">
      <PlaygroundDemo slug={demoSlug} />
    </main>
  )
}
