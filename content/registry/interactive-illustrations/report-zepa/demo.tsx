"use client"

import { ReportZepa } from "./ui/report-zepa"

export default function ReportZepaDemo() {
  return (
    <section
      className="relative flex w-full items-center justify-center bg-[#0b0b0e] px-6 py-16 text-white"
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <ReportZepa />
    </section>
  )
}
