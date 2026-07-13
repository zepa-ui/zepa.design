"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Check, Copy } from "lucide-react"

import { getInstallCommand } from "@/lib/registry/helpers"
import { getShadcnInstallCommand } from "@/lib/site-url"
import type { HighlightedCodeFile } from "@/lib/registry/highlight"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { CodeBlock } from "./code-block"
import { ComponentDemo } from "./component-demo"
import { DemoToolbar, type DemoTheme } from "./demo-toolbar"
import { InstallCommandBlock, usePackageManager } from "./install-tabs"

export interface ComponentDetailProps {
  slug: string
  title: string
  description: string
  github?: string
  dependencies: string[]
  code: Record<string, HighlightedCodeFile>
  onInstallCopy?: () => void
}

function CopyButton({
  value,
  label,
  onCopied,
}: {
  value: string
  label: string
  onCopied?: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    onCopied?.()
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
    >
      {copied ? (
        <Check className="size-3.5" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copied" : label}
    </Button>
  )
}

export function ComponentDetail({
  slug,
  title,
  description,
  github,
  dependencies,
  code,
  onInstallCopy,
}: ComponentDetailProps) {
  const installCommand = getInstallCommand(dependencies)
  const shadcnInstallCommand = getShadcnInstallCommand(slug)
  const codeEntries = Object.entries(code)
  const defaultCodeKey = codeEntries[0]?.[0] ?? ""
  const [activeCodeKey, setActiveCodeKey] = useState(defaultCodeKey)
  const [demoTheme, setDemoTheme] = useState<DemoTheme>("dark")
  const [refreshKey, setRefreshKey] = useState(0)
  const [pm, setPm] = usePackageManager()
  const activeCode = code[activeCodeKey]

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="relative z-20 w-full shrink-0 border-b border-white/10 bg-black p-6 lg:w-1/4 lg:max-w-sm lg:border-b-0 lg:border-r">
          <Link
            href="/components"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to components
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {description}
          </p>

          <section className="mt-8 space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-white/40">
              Install
            </h2>
            <InstallCommandBlock
              label="shadcn CLI"
              command={shadcnInstallCommand}
              pm={pm}
              onPmChange={setPm}
              copyLabel="Copy command"
              onCopied={onInstallCopy}
            />
            {installCommand ? (
              <div className="pt-2">
                <InstallCommandBlock
                  label="Dependencies"
                  command={installCommand}
                  pm={pm}
                  onPmChange={setPm}
                  copyLabel="Copy install"
                />
              </div>
            ) : null}
          </section>

          {codeEntries.length > 0 ? (
            <section className="mt-8 space-y-3">
              <p className="text-[15px] leading-snug">
                {github ? (
                  <a
                    href={`https://github.com/${github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-white/85 transition hover:text-white"
                  >
                    <img
                      src="/git.png"
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 shrink-0"
                    />
                    <span>
                      GitHub: @{github.toLowerCase()}
                    </span>
                  </a>
                ) : (
                  <span className="font-medium text-white/80">Anonymous</span>
                )}
              </p>

              <h2 className="text-xs font-medium uppercase tracking-wider text-white/40">
                Code
              </h2>
              <div className="flex flex-wrap gap-2">
                {codeEntries.map(([filename]) => {
                  const isActive = activeCodeKey === filename

                  return (
                    <button
                      key={filename}
                      type="button"
                      onClick={() => setActiveCodeKey(filename)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 font-mono text-xs transition",
                        isActive
                          ? "border-white bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                          : "border-white/10 bg-transparent text-white/45 hover:border-white/25 hover:bg-white/5 hover:text-white/80"
                      )}
                    >
                      {filename}
                    </button>
                  )
                })}
              </div>

              {activeCode ? (
                <>
                  <CodeBlock html={activeCode.html} />
                  <CopyButton value={activeCode.raw} label="Copy code" />
                </>
              ) : null}
            </section>
          ) : null}

          {dependencies.length > 0 ? (
            <section className="mt-8 space-y-3">
              <h2 className="text-xs font-medium uppercase tracking-wider text-white/40">
                Dependencies
              </h2>
              <ul className="flex flex-wrap gap-2">
                {dependencies.map((dep) => (
                  <li
                    key={dep}
                    className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80"
                  >
                    {dep}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>

        <section className="relative z-10 flex min-w-0 flex-1 flex-col p-6 lg:w-3/4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">
              Live demo
            </p>
            <DemoToolbar
              slug={slug}
              theme={demoTheme}
              onThemeChange={setDemoTheme}
              onRefresh={() => setRefreshKey((key) => key + 1)}
              variant="inline"
            />
          </div>
          <ComponentDemo slug={slug} theme={demoTheme} refreshKey={refreshKey} />
        </section>
      </div>
    </main>
  )
}
