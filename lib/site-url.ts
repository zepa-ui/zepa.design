export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://zepa.design"

export function getRegistryItemUrl(slug: string) {
  return `${SITE_URL}/r/${slug}.json`
}

export function getShadcnInstallCommand(slug: string) {
  return `npx shadcn@latest add ${getRegistryItemUrl(slug)}`
}
