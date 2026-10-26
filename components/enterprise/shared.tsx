"use client"

import Link from "next/link"
import { useRef, type MouseEvent, type ReactNode } from "react"
import { motion, useInView, type Variants } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CONTACT_URL } from "@/components/enterprise/data"

export const EASE = [0.22, 1, 0.36, 1] as const
export const HEADING_FONT = { fontFamily: "var(--font-manrope), sans-serif" }

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

export const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** `( LABEL )` — the bracketed mono eyebrow used across the page. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500 ${className}`}
    >
      <span className="text-lg font-extralight leading-none text-zinc-400">(</span>
      {children}
      <span className="text-lg font-extralight leading-none text-zinc-400">)</span>
    </p>
  )
}

/** Inline highlighted token inside running copy. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="mx-0.5 whitespace-nowrap rounded-md border border-zinc-700/80 bg-zinc-800/70 px-1.5 py-0.5 font-mono text-[0.78em] text-zinc-200">
      {children}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  muted,
  body,
  align = "center",
}: {
  eyebrow: string
  title: string
  muted?: string
  body?: ReactNode
  align?: "center" | "left"
}) {
  const center = align === "center"
  return (
    <Reveal className={center ? "mx-auto mb-14 max-w-2xl text-center" : "mb-10"}>
      <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
      <h2
        className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
        style={HEADING_FONT}
      >
        {title}
        {muted ? <span className="block text-zinc-500">{muted}</span> : null}
      </h2>
      {body ? (
        <p className={`mt-5 leading-relaxed text-zinc-400 ${center ? "mx-auto max-w-xl" : "max-w-md"}`}>
          {body}
        </p>
      ) : null}
    </Reveal>
  )
}

export function PrimaryCTA({
  children,
  size = "h-12",
  href = CONTACT_URL,
}: {
  children: ReactNode
  size?: string
  href?: string
}) {
  const external = href.startsWith("http")
  return (
    <Button
      asChild
      size="lg"
      className={`shimmer-btn rounded-full bg-white px-8 ${size} text-base font-medium text-zinc-950 shadow-lg shadow-white/10 hover:bg-zinc-200`}
    >
      <Link href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {children}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  )
}

export function GhostCTA({ children, href, size = "h-12" }: { children: ReactNode; href: string; size?: string }) {
  return (
    <Button
      asChild
      variant="outline"
      size="lg"
      className={`${size} rounded-full border-zinc-800 bg-transparent px-8 text-base font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white`}
    >
      <a href={href}>{children}</a>
    </Button>
  )
}

/** Cursor-following spotlight — writes CSS vars, no re-render. */
export function trackSpotlight(e: MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`)
  e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`)
}

export const spotlight =
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:bg-[radial-gradient(320px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.06),transparent_70%)]"
