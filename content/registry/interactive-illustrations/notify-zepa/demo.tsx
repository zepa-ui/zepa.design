"use client"

import { NotifyZepa } from "./ui/notify-zepa"

export default function NotifyZepaDemo() {
  return (
    <section
      className="relative flex w-full items-center justify-center bg-[#f6f6f6] px-6 py-16"
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <NotifyZepa />
    </section>
  )
}
