import type { Metadata } from "next"

import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Components",
    description:
      "Browse copy-paste React UI components — hero sections, landing blocks, and shadcn-ready pieces from the Zepa component library.",
    path: "/components",
  }),
}

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
