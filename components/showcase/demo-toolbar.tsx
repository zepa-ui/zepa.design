"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ExternalLink, Moon, RotateCw, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { BookmarkButton } from "@/components/bookmarks/bookmark-button"

export type DemoTheme = "light" | "dark"

interface DemoToolbarProps {
  slug: string
  theme: DemoTheme
  onThemeChange: (theme: DemoTheme) => void
  onRefresh?: () => void
  showOpenInNewTab?: boolean
  showRefresh?: boolean
  showTheme?: boolean
  showBookmark?: boolean
  variant?: "inline" | "overlay"
  className?: string
}

function ToolbarButton({
  children,
  onClick,
  label,
  href,
  target,
  variant,
}: {
  children: ReactNode
  onClick?: () => void
  label: string
  href?: string
  target?: string
  variant: "inline" | "overlay"
}) {
  const className = cn(
    "flex size-8 items-center justify-center rounded-md transition",
    variant === "inline"
      ? "text-white/45 hover:bg-white/10 hover:text-white"
      : "text-white hover:bg-white/10"
  )

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        aria-label={label}
        title={label}
        className={className}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={className}
    >
      {children}
    </button>
  )
}

export function DemoToolbar({
  slug,
  theme,
  onThemeChange,
  onRefresh,
  showOpenInNewTab = true,
  showRefresh = true,
  showTheme = true,
  showBookmark = true,
  variant = "inline",
  className,
}: DemoToolbarProps) {
  const themeButton = showTheme ? (
    <ToolbarButton
      variant={variant}
      label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </ToolbarButton>
  ) : null

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "fixed right-4 top-4 z-[100] rounded-lg border border-white/10 bg-black p-1 shadow-lg",
          className
        )}
      >
        {themeButton}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {showOpenInNewTab ? (
        <ToolbarButton
          variant="inline"
          href={`/components/${slug}/preview`}
          target="_blank"
          label="Open in new tab"
        >
          <ExternalLink className="size-4" />
        </ToolbarButton>
      ) : null}

      {themeButton}

      {showRefresh && onRefresh ? (
        <ToolbarButton variant="inline" label="Refresh demo" onClick={onRefresh}>
          <RotateCw className="size-4" />
        </ToolbarButton>
      ) : null}

      {showBookmark ? (
        <BookmarkButton slug={slug} variant="toolbar" />
      ) : null}
    </div>
  )
}
