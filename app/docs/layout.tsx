import type { Metadata } from "next"

import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Docs",
    description:
      "Documentation for Zepa UI — install React components with the shadcn CLI, contribute new blocks, and ship faster.",
    path: "/docs",
  }),
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
