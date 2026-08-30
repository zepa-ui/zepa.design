"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, LayoutGrid, LineChart, Upload, Users } from "lucide-react"

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/components", label: "Component stats", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/submissions", label: "Submissions", icon: Upload },
  { href: "/admin/analytics", label: "Analytics", icon: LineChart },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="mb-6 flex gap-1.5 overflow-x-auto [scrollbar-width:none] lg:mb-0 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden">
      {LINKS.map(({ href, label, icon: Icon }) => {
        // exact for the index, prefix for the rest, so /admin/users doesn't
        // also light up Overview
        const active =
          href === "/admin" ? pathname === href : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm transition lg:rounded-md ${
              active
                ? "bg-white text-black lg:bg-white/[0.09] lg:text-white"
                : "text-white/55 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <Icon className="size-3.5 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
