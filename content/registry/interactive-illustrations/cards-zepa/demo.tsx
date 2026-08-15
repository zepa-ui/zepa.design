"use client"

import { CardsZepa, type CardsZepaCard } from "./ui/cards-zepa"

/* ─── Stack marks ───
   Drawn inline so the illustration has no external asset to 404 on, and kept
   in the demo rather than the component — brand marks are data, not part of
   the reusable piece. Swap any for a hosted file with `logo: "https://…"`. */

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

const CARDS: CardsZepaCard[] = [
  {
    id: "selfie-hero",
    eyebrow: "React",
    title: "Selfie Hero",
    meta: "1,240 installs",
    tags: ["Video", "Marquee"],
    footer: "Added 4 Aug",
    accent: "#FF2E55",
    icon: <ReactMark />,
  },
  {
    id: "featured9-grid",
    eyebrow: "Next.js",
    title: "Featured9 Grid",
    meta: "860 installs",
    tags: ["Bento", "Hover video"],
    footer: "Added 9 Aug",
    accent: "#F5C518",
    icon: <NextMark />,
  },
  {
    id: "zepa-folder",
    eyebrow: "Tailwind",
    title: "Zepa Folder",
    meta: "New this week",
    tags: ["3D", "Lightbox"],
    footer: "Added 10 Aug",
    accent: "#3B82F6",
    icon: <TailwindMark />,
  },
]

export default function CardsZepaDemo() {
  return (
    <section
      className="relative flex w-full items-center justify-center bg-[#08080a] px-6 py-16 text-white"
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <CardsZepa cards={CARDS} />
    </section>
  )
}
