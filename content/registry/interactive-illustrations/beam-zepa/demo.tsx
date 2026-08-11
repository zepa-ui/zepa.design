"use client"

import { BeamZepa, type BeamZepaNode } from "./ui/beam-zepa"

/* ─── Stack marks ───
   Drawn inline so the illustration has no external asset to 404 on. Swap any
   of these for a hosted file with `logo: "https://…"` — that takes precedence
   over `icon`. */

function ReactMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse cx="12" cy="12" rx="10" ry="3.85" />
        <ellipse cx="12" cy="12" rx="10" ry="3.85" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="3.85" transform="rotate(120 12 12)" />
      </g>
    </svg>
  )
}

function NextMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#ffffff" />
      <path
        d="M8.2 16.6V7.6h1.5l6.1 8.2"
        stroke="#0b0b0d"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <path d="M15.1 7.6v6.1" stroke="#0b0b0d" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function TailwindMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C13.4 10.85 14.5 12 17 12c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C15.6 7.15 14.5 6 12 6zM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C8.4 16.85 9.5 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C10.6 13.15 9.5 12 7 12z"
        fill="#38BDF8"
      />
    </svg>
  )
}

function TypeScriptMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#3178C6" />
      <path
        d="M13.1 12.6h2.2v1.35h-1.6v4.6h-1.55v-4.6H10.6V12.6h2.5z"
        fill="#ffffff"
      />
      <path
        d="M16.4 18.2v-1.6c.28.2.58.36.9.46.32.1.65.16.98.16.2 0 .37-.02.51-.06a1.1 1.1 0 0 0 .37-.16.65.65 0 0 0 .3-.55.62.62 0 0 0-.13-.38 1.4 1.4 0 0 0-.34-.31 3.6 3.6 0 0 0-.5-.28l-.63-.28a3.2 3.2 0 0 1-1.29-.9 1.95 1.95 0 0 1-.42-1.27c0-.4.08-.75.24-1.04.16-.29.38-.53.66-.71.28-.19.6-.32.97-.41.37-.09.76-.13 1.17-.13.4 0 .76.02 1.08.07.31.05.6.12.87.22v1.5a2.7 2.7 0 0 0-.43-.24 3.4 3.4 0 0 0-.96-.28 2.9 2.9 0 0 0-.48-.04c-.18 0-.35.02-.5.05a1.2 1.2 0 0 0-.37.15.7.7 0 0 0-.24.23.55.55 0 0 0-.08.3c0 .13.03.25.1.35.07.1.17.2.3.3.13.09.28.18.46.27l.6.27c.32.14.6.28.85.44.25.15.47.33.64.53.18.2.31.42.4.68.1.26.14.56.14.9 0 .43-.08.79-.24 1.09-.16.29-.38.53-.66.71-.28.18-.6.31-.98.39-.37.08-.77.12-1.19.12-.43 0-.83-.04-1.22-.11a3.7 3.7 0 0 1-1-.34z"
        fill="#ffffff"
      />
    </svg>
  )
}

function FigmaMark() {
  return (
    <svg viewBox="0 0 24 36" fill="none" aria-hidden="true">
      <path d="M6 36a6 6 0 0 0 6-6V24H6a6 6 0 0 0 0 12z" fill="#0ACF83" />
      <path d="M0 18a6 6 0 0 1 6-6h6v12H6a6 6 0 0 1-6-6z" fill="#A259FF" />
      <path d="M0 6a6 6 0 0 1 6-6h6v12H6A6 6 0 0 1 0 6z" fill="#F24E1E" />
      <path d="M12 0h6a6 6 0 0 1 0 12h-6V0z" fill="#FF7262" />
      <path d="M18 24a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" fill="#1ABCFE" />
    </svg>
  )
}

function ShadcnMark() {
  return (
    <svg viewBox="0 0 256 256" fill="none" aria-hidden="true">
      <path
        d="M208 128L128 208M192 40L40 192"
        stroke="#ffffff"
        strokeWidth="24"
        strokeLinecap="round"
      />
    </svg>
  )
}

const LEFT: BeamZepaNode[] = [
  { id: "react", label: "React", icon: <ReactMark /> },
  { id: "next", label: "Next.js", icon: <NextMark /> },
  { id: "tailwind", label: "Tailwind CSS", icon: <TailwindMark /> },
]

const RIGHT: BeamZepaNode[] = [
  { id: "typescript", label: "TypeScript", icon: <TypeScriptMark /> },
  { id: "figma", label: "Figma", icon: <FigmaMark /> },
  { id: "shadcn", label: "shadcn/ui", icon: <ShadcnMark /> },
]

export default function BeamZepaDemo() {
  return (
    <section
      className="relative flex w-full items-center justify-center bg-[#08080a] px-6 py-16 text-white"
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <BeamZepa leftNodes={LEFT} rightNodes={RIGHT} nodeSize={58} width={600} />
    </section>
  )
}
