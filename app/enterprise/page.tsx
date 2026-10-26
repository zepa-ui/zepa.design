import type { Metadata } from "next"

import { buildMetadata } from "@/lib/seo"
import { EnterprisePage } from "@/components/enterprise/enterprise-page"

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Enterprise — Websites & Web Applications",
    description:
      "Zepa Enterprise designs and builds complete websites and web applications for businesses — UI/UX, backend, databases, authentication, payments, and deployment.",
    path: "/enterprise",
    keywords: [
      "zepa enterprise",
      "web development agency",
      "custom web application development",
      "business website development",
      "saas development",
      "next.js development",
      "full stack development",
      "ecommerce development",
      "admin dashboard development",
    ],
  }),
}

export default function Page() {
  return <EnterprisePage />
}
