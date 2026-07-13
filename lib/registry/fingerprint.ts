import { createHash } from "crypto"

/**
 * Canary fingerprinting for distributed component code.
 *
 * Injected ONLY into distributed output (public/r/*.json payloads and the
 * code served on the site) — source files under content/registry are never
 * modified.
 *
 * Two markers per component:
 *  1. Visible banner comment at the top of every code file (license + URL).
 *  2. Hidden canary in demo.tsx: an unused export that looks like build
 *     metadata (`export const __demoId = "<hash>"`). It's real code — not a
 *     comment, so it survives comment-stripping — but it prints nothing,
 *     gets tree-shaken out of production bundles, and raises no lint
 *     warnings. Search the hash on grep.app, GitHub code search, or
 *     publicwww.com to find copies in the wild (see data/canary-map.json).
 */

const SALT = "zepa-canary-v1"

/** Stable 12-char hash unique to each component. */
export function componentFingerprint(slug: string) {
  return createHash("sha256")
    .update(`${SALT}:${slug}`)
    .digest("hex")
    .slice(0, 12)
}

function buildBanner(slug: string) {
  return `/**
 * Zepa UI — ${slug}
 * https://zepa.design/components/${slug}
 * Free to use in your projects. Please don't republish or resell as your own.
 */
`
}

const CODE_EXTENSIONS = /\.(tsx|ts|jsx|js)$/

/**
 * Returns the file content with the banner injected, plus the hidden
 * canary export when the file is the component's demo.tsx.
 * Non-code files (e.g. scene.json) are returned untouched.
 */
export function applyFingerprint(
  content: string,
  slug: string,
  filename: string
) {
  if (!CODE_EXTENSIONS.test(filename)) return content

  let result = content

  // Hidden canary — real code, not a comment. Unused export: tree-shaken
  // from bundles, no lint warnings, looks like build metadata.
  if (filename.endsWith("demo.tsx") && !result.includes("__demoId")) {
    const canary = `export const __demoId = "${componentFingerprint(slug)}"`
    result = `${result.replace(/\s*$/, "")}\n\n${canary}\n`
  }

  const banner = buildBanner(slug)
  if (!result.startsWith(banner)) {
    result = banner + result
  }

  return result
}
