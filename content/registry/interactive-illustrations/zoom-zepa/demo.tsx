"use client"

import { ZoomZepa } from "./ui/zoom-zepa"

export default function ZoomZepaDemo() {
  return (
    <section
      className="relative flex w-full items-center justify-center bg-[#08080a] px-6 py-16 text-white"
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <ZoomZepa />
    </section>
  )
}
