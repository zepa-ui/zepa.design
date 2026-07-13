import { readFile } from "fs/promises"
import path from "path"

import { codePaths } from "./code-paths"
import { applyFingerprint } from "./fingerprint"

export async function getComponentCode(
  slug: string
): Promise<Record<string, string>> {
  const files = codePaths[slug]
  if (!files) return {}

  const base = path.join(process.cwd(), "content/registry")

  const entries = await Promise.all(
    files.map(async (file) => {
      const filename = path.basename(file)
      const raw = await readFile(path.join(base, file), "utf-8")
      // Code shown/copied on the site carries the same banner + canary
      // as the shadcn registry payloads.
      return [filename, applyFingerprint(raw, slug, filename)]
    })
  )

  return Object.fromEntries(entries)
}
