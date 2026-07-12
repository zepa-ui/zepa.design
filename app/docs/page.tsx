import {
  BookOpen,
  CheckCircle,
  FileText,
  FolderTree,
  Hash,
  Layers,
  Play,
  Terminal,
  Video,
  Zap,
  AlertTriangle,
  Scale,
  XCircle,
} from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { getShadcnInstallCommand } from "@/lib/site-url"

const EXAMPLE_SLUG = "amero-hero"
const SHADCN_INSTALL_COMMAND = getShadcnInstallCommand(EXAMPLE_SLUG)

const QUICK_CHECKLIST = [
  "Added meta.ts",
  "Added demo.tsx",
  "Added ui/ folder (if the component has local UI files)",
  "Added preview at public/previews/{category}/{slug}/preview.mov (compressed to under 5MB)",
  "Ran npm run build:registry",
  "Ran npm run lint",
  "Ran npm run test",
  "Responsive on mobile and desktop",
  "No console.log",
  "No hardcoded secrets or API keys",
  "No unnecessary dependencies",
  "Tested on localhost/components before pushing",
] as const

const EXAMPLE_STEPS = [
  {
    step: "1",
    title: "Create the component folder",
    body: (
      <>
        Create a folder under{" "}
        <code className="text-zinc-300">content/registry/hero-sections/sameer-hero</code>
      </>
    ),
  },
  {
    step: "2",
    title: "Add your source files",
    body: (
      <ul className="mt-2 space-y-2">
        <li>
          • <code className="text-zinc-300">meta.ts</code> in the{" "}
          <code className="text-zinc-300">sameer-hero</code> folder
        </li>
        <li>
          • <code className="text-zinc-300">demo.tsx</code> in the same folder
        </li>
        <li>
          • <code className="text-zinc-300">ui/</code> — add any local UI files inside{" "}
          <code className="text-zinc-300">sameer-hero/ui/</code>
        </li>
      </ul>
    ),
  },
  {
    step: "3",
    title: "Add the gallery preview video",
    body: (
      <>
        Add{" "}
        <code className="text-zinc-300">
          public/previews/hero-sections/sameer-hero/preview.mov
        </code>
      </>
    ),
  },
  {
    step: "4",
    title: "Build the registry",
    body: (
      <>
        Run <code className="text-zinc-300">npm run build:registry</code>
      </>
    ),
  },
  {
    step: "5",
    title: "Verify it appears",
    body: (
      <>
        Open <code className="text-zinc-300">/components</code> and confirm your card
        shows up
      </>
    ),
  },
  {
    step: "6",
    title: "Test locally before pushing",
    body: (
      <>
        Check <code className="text-zinc-300">localhost:3000/components/sameer-hero</code>{" "}
        — live demo, install command, and code tabs should all work
      </>
    ),
  },
] as const

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl">
        <div className="mb-12">
          <p className="mb-3 text-sm text-zinc-500">Contributing</p>
          <h1 className="text-4xl font-semibold tracking-tight">Add a component</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Contributing is simple: add your folder, run one command, verify on{" "}
            <code className="text-zinc-300">/components</code>. Everything else on this
            page is reference.
          </p>
        </div>

        <div className="space-y-12">
          {/* Primary: quick checklist + example */}
          <section className="rounded-2xl border border-emerald-500/30 bg-zinc-950 p-8 md:p-10">
            <h2 className="mb-2 flex items-center gap-2 text-3xl font-semibold">
              <CheckCircle className="h-7 w-7 text-emerald-400" />
              Quick checklist
            </h2>
            <p className="mb-8 text-zinc-400">
              Run through this before you open a PR. This is the only flow you need to
              remember.
            </p>

            <div className="grid gap-8 lg:grid-cols-2">
              <ul className="space-y-4">
                {QUICK_CHECKLIST.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-base text-zinc-200"
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-medium">
                  <FolderTree className="h-5 w-5 text-cyan-400" />
                  Example: sameer-hero
                </h3>
                <ol className="space-y-6">
                  {EXAMPLE_STEPS.map((item) => (
                    <li key={item.step} className="flex gap-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-sm font-medium text-emerald-400">
                        {item.step}
                      </span>
                      <div>
                        <p className="font-medium text-white">{item.title}</p>
                        <div className="mt-1 text-sm leading-7 text-zinc-400">
                          {item.body}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* Reference sections — same visual style as before */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-medium">
              <FileText className="h-5 w-5 text-emerald-400" />
              Folder structure
            </h2>
            <div className="overflow-x-auto">
              <pre className="text-sm leading-7 text-zinc-300">{`content/registry/
└ hero-sections/
  └ sameer-hero/
    ├ meta.ts
    ├ demo.tsx
    └ ui/
      └ (optional local components)

public/previews/
└ hero-sections/
  └ sameer-hero/
    └ preview.mov`}</pre>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-medium">
              <Hash className="h-5 w-5 text-cyan-400" />
              Naming rules
            </h2>
            <ul className="space-y-3 text-zinc-400 leading-7">
              <li className="flex items-start gap-3">
                <Zap className="mt-1 h-4 w-4 shrink-0 text-amber-400" />
                Use lowercase kebab-case (e.g.{" "}
                <code className="text-zinc-300">sameer-hero</code>).
              </li>
              <li className="flex items-start gap-3">
                <FileText className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                <code className="text-zinc-300">meta.slug</code> must match the folder
                name exactly.
              </li>
              <li className="flex items-start gap-3">
                <Layers className="mt-1 h-4 w-4 shrink-0 text-violet-400" />
                Category today is{" "}
                <code className="text-zinc-300">hero-sections</code> — more categories
                will appear in the sidebar as they are added.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-medium">
              <Video className="h-5 w-5 text-amber-400" />
              Preview video
            </h2>
            <p className="text-zinc-400 leading-7">
              Every component needs a lightweight{" "}
              <code className="text-zinc-300">preview.mov</code> (or .mp4). The gallery
              at <code className="text-zinc-300">/components</code> plays it on hover —
              no live WebGL in the grid. Full demo runs on the detail page. Keep the
              video under <code className="text-zinc-300">5MB</code> — compress with{" "}
              <code className="text-zinc-300">
                ffmpeg -i preview.mov -vf scale=1280:-2 -r 30 -c:v libx264 -crf 23
                -preset fast -movflags +faststart -an preview.mov
              </code>{" "}
              before committing.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-medium">
              <FileText className="h-5 w-5 text-emerald-400" />
              Example meta.ts
            </h2>
            <div className="overflow-x-auto">
              <pre className="text-sm leading-7 text-zinc-300">{`export const meta = {
  slug: "sameer-hero",
  title: "Sameer Hero",
  description: "Your one-line description for the gallery and detail page.",
  category: "hero-sections",
  preview: "/previews/hero-sections/sameer-hero/preview.mov",
  github: "your-github-username",
  tags: ["hero", "motion"],
  dependencies: ["framer-motion"],
  registryDependencies: [],
  version: 1,
} as const`}</pre>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-medium">
              <Terminal className="h-5 w-5 text-violet-400" />
              Commands
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                  Install component (shadcn CLI)
                </p>
                <pre className="overflow-x-auto text-sm text-zinc-300">
                  {SHADCN_INSTALL_COMMAND}
                </pre>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                  Install dependencies (if listed in meta.ts)
                </p>
                <pre className="overflow-x-auto text-sm text-zinc-300">
                  npm install framer-motion lucide-react
                </pre>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                  After adding or updating a component
                </p>
                <pre className="text-sm text-zinc-300">npm run build:registry</pre>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                  Local dev
                </p>
                <pre className="text-sm text-zinc-300">npm run dev</pre>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                  Lint & test
                </p>
                <pre className="text-sm text-zinc-300">{`npm run lint
npm run test`}</pre>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                  Playground (optional)
                </p>
                <pre className="text-sm text-zinc-300">{`/playground/hero?slug=sameer-hero`}</pre>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-medium">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              What gets generated for you
            </h2>
            <p className="mb-4 text-zinc-400 leading-7">
              Never edit these by hand —{" "}
              <code className="text-zinc-300">npm run build:registry</code> overwrites them:
            </p>
            <ul className="space-y-2 font-mono text-xs text-zinc-300">
              <li>content/registry/items.ts</li>
              <li>content/registry/loaders.ts</li>
              <li>content/registry/registry.json</li>
              <li>public/r/&#123;slug&#125;.json</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-medium">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Common mistakes
            </h2>
            <ul className="space-y-3 text-zinc-400 leading-7">
              <li>
                • <code className="text-zinc-300">meta.slug</code> does not match folder
                name
              </li>
              <li>
                • Missing <code className="text-zinc-300">demo.tsx</code> → demo not found
              </li>
              <li>
                • Missing preview → card hidden from{" "}
                <code className="text-zinc-300">/components</code>
              </li>
              <li>
                • Skipping <code className="text-zinc-300">npm run build:registry</code>{" "}
                before pushing
              </li>
              <li>
                • Using <code className="text-zinc-300">position: fixed</code> in demos —
                breaks the split layout on the detail page (use{" "}
                <code className="text-zinc-300">absolute</code> inside a relative root)
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-medium">
              <Play className="h-5 w-5 text-amber-400" />
              After deploy
            </h2>
            <p className="text-zinc-400 leading-7">
              Users can install via shadcn once{" "}
              <code className="text-zinc-300">public/r/your-slug.json</code> is deployed:
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-300">
              {SHADCN_INSTALL_COMMAND}
            </pre>
          </section>

          {/* License — prominent, unmissable */}
          <section className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-zinc-950 p-8 md:p-12">
            <h2 className="mb-4 flex items-center gap-3 text-4xl font-bold tracking-tight md:text-5xl">
              <Scale className="h-9 w-9 text-emerald-400 md:h-11 md:w-11" />
              License
            </h2>
            <p className="mb-10 max-w-3xl text-2xl font-medium leading-snug text-zinc-200 md:text-3xl">
              Build anything you want with Zepa. Just{" "}
              <span className="text-emerald-400">don&apos;t repackage Zepa itself.</span>
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-emerald-400">
                  <CheckCircle className="h-6 w-6" />
                  You can
                </h3>
                <ul className="space-y-3 text-lg leading-7 text-zinc-200">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                    Use Zepa in unlimited personal & commercial projects
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                    Ship it in websites, apps, SaaS, and client work
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                    Copy, modify, and customize the components freely
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-red-400">
                  <XCircle className="h-6 w-6" />
                  You can&apos;t
                </h3>
                <ul className="space-y-3 text-lg leading-7 text-zinc-200">
                  <li className="flex items-start gap-3">
                    <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-400" />
                    Sell or redistribute the components themselves
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-400" />
                    Republish them — alone, bundled, or as a ported version
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-400" />
                    Include them in another component library, kit, or template
                  </li>
                </ul>
              </div>
            </div>

            <p className="mt-8 text-base text-zinc-400">
              Licensed under{" "}
              <a
                href="https://github.com/zepa-ui/zepa.design/blob/main/LICENSE"
                className="font-medium text-emerald-400 underline decoration-emerald-400/40 underline-offset-4 hover:decoration-emerald-400"
              >
                MIT + Commons Clause
              </a>
              . Free to use, not to resell.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
