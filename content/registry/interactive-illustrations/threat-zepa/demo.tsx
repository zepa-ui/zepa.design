"use client"

import { ThreatZepa } from "./ui/threat-zepa"

export default function ThreatZepaDemo() {
  return (
    <section
      className="relative flex w-full items-center justify-center bg-[#08080a] px-6 py-16 text-white"
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <ThreatZepa />
    </section>
  )
}
