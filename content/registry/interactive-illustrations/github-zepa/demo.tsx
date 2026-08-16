"use client"

import { GithubZepa } from "./ui/github-zepa"

export default function GithubZepaDemo() {
  return (
    <section
      className="relative flex w-full items-center justify-center bg-[#0a0a0a] px-6 py-16 text-white"
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <GithubZepa username="zepa-ui" cellSize={15} cellGap={4} />
    </section>
  )
}
