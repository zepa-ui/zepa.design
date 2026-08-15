"use client"

import { TimelineZepa } from "./ui/timeline-zepa"

export default function TimelineZepaDemo() {
  return (
    <section
      className="relative flex w-full items-center justify-center bg-[#08080a] px-6 py-16 text-white"
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <TimelineZepa />
    </section>
  )
}
