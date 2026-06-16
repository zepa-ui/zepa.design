import type { ComponentType, ReactNode } from "react"
import {
  ArrowDown,
  ArrowRight,
  Box,
  FolderTree,
  Globe,
  Hammer,
  Play,
  Terminal,
} from "lucide-react"

function FlowCard({
  icon: Icon,
  title,
  children,
  accent = "text-emerald-400",
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  children: ReactNode
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
        <h4 className="text-sm font-medium text-white">{title}</h4>
      </div>
      <div className="text-sm leading-6 text-zinc-400">{children}</div>
    </div>
  )
}

function FlowArrowDown() {
  return (
    <div className="flex justify-center py-2 text-zinc-600">
      <ArrowDown className="h-5 w-5" />
    </div>
  )
}

function FlowArrowRight() {
  return (
    <div className="hidden items-center justify-center text-zinc-600 md:flex">
      <ArrowRight className="h-5 w-5" />
    </div>
  )
}

export function ContributorMainFlow() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <FlowCard icon={FolderTree} title="1. Create component folder" accent="text-cyan-400">
        Add <code className="text-zinc-300">meta.ts</code>,{" "}
        <code className="text-zinc-300">demo.tsx</code>, and{" "}
        <code className="text-zinc-300">ui/</code> under{" "}
        <code className="text-zinc-300">content/registry/&#123;category&#125;/&#123;slug&#125;/</code>
      </FlowCard>

      <FlowArrowDown />

      <FlowCard icon={Play} title="2. Add gallery preview video" accent="text-amber-400">
        Place <code className="text-zinc-300">preview.mov</code> in{" "}
        <code className="text-zinc-300">public/previews/&#123;category&#125;/&#123;slug&#125;/</code>
      </FlowCard>

      <FlowArrowDown />

      <FlowCard icon={Terminal} title="3. Build the registry" accent="text-violet-400">
        Run <code className="text-zinc-300">npm run build:registry</code> — never edit generated
        files by hand
      </FlowCard>

      <FlowArrowDown />

      <div className="grid gap-3 md:grid-cols-3">
        <FlowCard icon={Box} title="Gallery" accent="text-emerald-400">
          Card appears on <code className="text-zinc-300">/components</code>
        </FlowCard>
        <FlowCard icon={Box} title="Detail page" accent="text-emerald-400">
          Live demo at <code className="text-zinc-300">/components/&#123;slug&#125;</code>
        </FlowCard>
        <FlowCard icon={Globe} title="shadcn install" accent="text-emerald-400">
          JSON at <code className="text-zinc-300">/r/&#123;slug&#125;.json</code>
        </FlowCard>
      </div>
    </div>
  )
}

export function ContributorBuildFlow() {
  return (
    <div className="space-y-4">
      <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
        <FlowCard icon={FolderTree} title="You edit" accent="text-cyan-400">
          <code className="text-zinc-300">meta.ts</code>
          <br />
          <code className="text-zinc-300">demo.tsx</code>
          <br />
          <code className="text-zinc-300">ui/*.tsx</code>
        </FlowCard>

        <FlowArrowRight />

        <FlowCard icon={Hammer} title="build:registry generates" accent="text-violet-400">
          items.ts · loaders.ts
          <br />
          code-paths.ts · registry.json
          <br />
          public/r/&#123;slug&#125;.json
        </FlowCard>
      </div>

      <FlowArrowDown />

      <FlowCard icon={Globe} title="After deploy" accent="text-amber-400">
        <code className="block text-zinc-300">
          npx shadcn@latest add https://zepa.design/r/your-slug.json
        </code>
      </FlowCard>
    </div>
  )
}

export function ContributorGeneratedFlow() {
  const generated = [
    "content/registry/items.ts",
    "content/registry/loaders.ts",
    "content/registry/index.ts",
    "content/registry/registry.json",
    "lib/registry/code-paths.ts",
    "public/r/{slug}.json",
  ]

  const manual = [
    "content/registry/{category}/{slug}/meta.ts",
    "content/registry/{category}/{slug}/demo.tsx",
    "content/registry/{category}/{slug}/ui/*.tsx",
    "public/previews/{category}/{slug}/preview.mov",
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-emerald-400">
          You edit
        </p>
        <ul className="space-y-2 text-sm text-zinc-400">
          {manual.map((item) => (
            <li key={item} className="font-mono text-xs text-zinc-300">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-violet-400">
          Auto-generated (do not edit)
        </p>
        <ul className="space-y-2 text-sm text-zinc-400">
          {generated.map((item) => (
            <li key={item} className="font-mono text-xs text-zinc-300">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
