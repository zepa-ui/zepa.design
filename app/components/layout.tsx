import type { Metadata } from "next"

import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Components",
    description:
      "Browse copy-paste React UI components — hero sections, landing blocks, and shadcn-ready pieces from the Zepa component library.",
    path: "/components",
    image: {
      url: "https://res.cloudinary.com/dakrfj1oh/image/upload/w_1200,h_630,c_fill/v1783870719/Screenshot_2026-07-12_at_9.04.50_PM_d2kcls.png",
      width: 1200,
      height: 630,
      alt: "Zepa UI components gallery — hero sections, navbars, and animated blocks",
    },
  }),
}

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
