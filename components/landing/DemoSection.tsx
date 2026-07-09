"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useInView } from "framer-motion"
import Image from "next/image"
import type { ComponentType } from "react"

const DropsHero = dynamic(
  () => import("@/content/registry/hero-sections/drops-hero/demo"),
  { ssr: false }
)
const VercelHero = dynamic(
  () => import("@/content/registry/hero-sections/vercel-hero/demo"),
  { ssr: false }
)
const RampUnicorn = dynamic(
  () => import("@/content/registry/unicorn-section/ramp-unicorn/demo"),
  { ssr: false }
)
const BlurUnicorn = dynamic(
  () => import("@/content/registry/unicorn-section/blur-unicorn/demo"),
  { ssr: false }
)

const tabs: {
  id: string
  label: string
  component: ComponentType
}[] = [
  { id: "drops", label: "Drops", component: DropsHero },
  { id: "vercel", label: "Vercel", component: VercelHero },
  { id: "ramp", label: "Ramp", component: RampUnicorn },
  { id: "blur", label: "Blur", component: BlurUnicorn },
]

export default function DemoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { margin: "200px 0px", amount: 0.1 })
  const [activeTab, setActiveTab] = useState("drops")
  const [paused, setPaused] = useState(false)

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component ?? DropsHero

  useEffect(() => {
    if (!isInView || paused) return

    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = tabs.findIndex((tab) => tab.id === current)
        return tabs[(currentIndex + 1) % tabs.length].id
      })
    }, 6000)

    return () => clearInterval(interval)
  }, [paused, isInView])

  useEffect(() => {
    if (!isInView) return

    void import("@/content/registry/hero-sections/drops-hero/demo")
    void import("@/content/registry/hero-sections/vercel-hero/demo")
    void import("@/content/registry/unicorn-section/ramp-unicorn/demo")
    void import("@/content/registry/unicorn-section/blur-unicorn/demo")
  }, [isInView])

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="mx-auto w-full max-w-[1400px] bg-landing px-4 py-16 md:px-6 md:py-20"
    >
      <div className="relative z-10 mb-10 text-center md:mb-12">
        <h2
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-normal tracking-tight text-zinc-100"
          style={{ fontFamily: "var(--font-manrope), sans-serif" }}
        >
          <span className="text-3xl sm:text-4xl">See</span>
          <Image
            src="/zzepa.png"
            alt="Zepa"
            width={180}
            height={48}
            className="h-10 w-auto shrink-0 sm:h-12"
            style={{ width: "auto", height: "auto" }}
          />
          <span className="text-3xl sm:text-4xl">in Action</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          Explore live, production-ready components built with experience.
        </p>
      </div>

      <div
        className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* title bar */}
        <div className="relative flex items-center justify-center border-b border-white/10 px-2.5 py-3.5 sm:px-6 sm:py-5">
          <div className="hidden gap-2.5 sm:absolute sm:left-6 sm:flex">
            <div className="h-3.5 w-3.5 rounded-full bg-red-500" />
            <div className="h-3.5 w-3.5 rounded-full bg-yellow-500" />
            <div className="h-3.5 w-3.5 rounded-full bg-green-500" />
          </div>

          <div className="flex max-w-full items-center justify-center gap-1 overflow-x-auto sm:gap-3">
            {tabs.map((tab, index) => (
              <div key={tab.id} className="flex shrink-0 items-center gap-1 sm:gap-3">
                {index > 0 && (
                  <span className="hidden text-base text-zinc-600 sm:inline">|</span>
                )}
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium leading-tight transition-all duration-300 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-base sm:leading-normal ${
                    activeTab === tab.id
                      ? "border border-white/15 bg-white/10 text-white"
                      : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  {tab.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Area */}
        <div className="relative isolate h-[720px] overflow-hidden [transform:translateZ(0)] sm:h-[820px] lg:h-[920px]">
          {isInView ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{
                  opacity: 0,
                  filter: "blur(20px)",
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  filter: "blur(20px)",
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.45,
                  ease: "easeInOut",
                }}
                className="demo-embed-root relative h-full w-full overflow-hidden"
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </div>
    </section>
  )
}
