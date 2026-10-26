"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, type Variants } from "framer-motion"
import {
  AppWindow,
  ArrowRight,
  Check,
  CreditCard,
  Globe,
  LayoutDashboard,
  Palette,
  Rocket,
  type LucideIcon,
} from "lucide-react"
import UnicornScene from "unicornstudio-react"

import { SAMPLE_BUILDS } from "@/components/enterprise/data"
import { Chip, EASE, Eyebrow, GhostCTA, HEADING_FONT, PrimaryCTA } from "@/components/enterprise/shared"

const textReveal: Variants = {
  hidden: { y: "105%" },
  visible: (i: number) => ({
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: 0.15 + i * 0.1 },
  }),
}

const LEFT_PILLS: { label: string; icon: LucideIcon; accent?: boolean }[] = [
  { label: "UI/UX Design", icon: Palette, accent: true },
  { label: "Business Websites", icon: Globe },
  { label: "Web Applications", icon: AppWindow },
]
const RIGHT_PILLS: { label: string; icon: LucideIcon; accent?: boolean }[] = [
  { label: "Payments", icon: CreditCard },
  { label: "Admin Dashboards", icon: LayoutDashboard, accent: true },
  { label: "Deployment", icon: Rocket },
]

function Pill({
  label,
  icon: Icon,
  accent,
  side,
  index,
}: {
  label: string
  icon: LucideIcon
  accent?: boolean
  side: "left" | "right"
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -24 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.9 + index * 0.12 }}
      className={`flex items-center ${side === "left" ? "flex-row" : "flex-row-reverse"}`}
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4 + index, repeat: Infinity, ease: "easeInOut", delay: index * 0.6 }}
        className="flex items-center gap-2.5 rounded-full border border-zinc-800 bg-zinc-950/80 py-1.5 pl-1.5 pr-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md"
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            accent ? "bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30" : "bg-zinc-800 text-zinc-300"
          }`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        <span className="whitespace-nowrap text-xs font-medium text-zinc-300">{label}</span>
      </motion.div>
      {/* connector to the card */}
      <span className="h-px w-10 border-t border-dashed border-zinc-700/70 xl:w-16" />
    </motion.div>
  )
}

function BuildCard() {
  const [i, setI] = useState(0)
  const build = SAMPLE_BUILDS[i]

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SAMPLE_BUILDS.length), 5200)
    return () => clearInterval(t)
  }, [i])

  return (
    <div className="relative w-full max-w-[420px]">
      {/* stacked sheets behind */}
      <div className="absolute inset-x-6 -bottom-3 h-full rounded-2xl border border-zinc-800/70 bg-zinc-900/40" />
      <div className="absolute inset-x-3 -bottom-1.5 h-full rounded-2xl border border-zinc-800 bg-zinc-900/60" />

      <div className="relative overflow-hidden rounded-2xl border border-zinc-700/70 bg-zinc-950/90 p-5 text-left shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-600/15 blur-3xl" />

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="pulse-glow h-1.5 w-1.5 rounded-full bg-emerald-500 text-emerald-500" />
            <span className="text-sm font-semibold text-white">Zepa is building</span>
          </div>
          <span className="rounded-full border border-zinc-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Sample build
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={build.id}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
              <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                <span className="text-blue-400">PRJ_{build.id}</span>
                <span className="text-zinc-600">{build.name}</span>
              </div>
              <p className="mb-3 font-mono text-[13px] text-zinc-200">{build.now}…</p>
              <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-white"
                  initial={{ width: "8%" }}
                  animate={{ width: `${build.progress}%` }}
                  transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 font-mono text-[12px]">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-600">Completed</p>
                <ul className="space-y-1.5">
                  {build.done.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-zinc-300">
                      <Check className="h-3 w-3 text-emerald-500" strokeWidth={2.5} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-600">Up next</p>
                <ul className="space-y-1.5">
                  {build.queue.map((q) => (
                    <li key={q} className="flex items-center gap-2 text-zinc-500">
                      <span className="h-1 w-1 rounded-full bg-zinc-600" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
          <div className="flex gap-1.5">
            {SAMPLE_BUILDS.map((b, idx) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Show ${b.name}`}
                onClick={() => setI(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === i ? "w-5 bg-white" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next sample build"
            onClick={() => setI((v) => (v + 1) % SAMPLE_BUILDS.length)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-950 transition-transform hover:translate-x-0.5"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function EnterpriseHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-36 sm:pt-40">
      {/* atmosphere — the same WebGL scene as the Zepa UI home hero */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-landing" />
        <div className="absolute inset-0 flex items-start justify-center opacity-70">
          <UnicornScene
            projectId="JzRF54wZO8Z2TMKMPPmT"
            width="1440px"
            height="1080px"
            scale={1}
            dpi={1.5}
            sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js"
          />
        </div>
        <div className="absolute left-1/2 top-[38%] h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-blue-700/[0.08] blur-[140px]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(39 39 42 / 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgb(39 39 42 / 0.5) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 70%, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 70%, black 20%, transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-landing/30 via-landing/50 to-landing" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <Eyebrow className="mb-7">
            Zepa Enterprise<span className="hidden sm:inline">&nbsp;· Design &amp; Development Studio</span>
          </Eyebrow>
        </motion.div>

        <h1
          className="mx-auto mb-7 max-w-5xl text-[2.5rem] font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.25rem]"
          style={HEADING_FONT}
        >
          <span className="block overflow-hidden pb-1">
            <motion.span className="block" variants={textReveal} initial="hidden" animate="visible" custom={0}>
              We build products that
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-2">
            <motion.span
              className="block bg-gradient-to-b from-zinc-300 to-zinc-600 bg-clip-text text-transparent"
              variants={textReveal}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              make businesses stand out.
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mx-auto mb-10 max-w-2xl text-base leading-[1.9] text-zinc-400 sm:text-lg"
        >
          From frontend design to backend, database, authentication, payments and deployment — the
          complete build partner for <Chip>startups</Chip>, <Chip>growing businesses</Chip> and{" "}
          <Chip>enterprises</Chip>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mb-20 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <div className="order-2 sm:order-1">
            <GhostCTA href="#why">Why Zepa?</GhostCTA>
          </div>
          <div className="order-1 sm:order-2">
            <PrimaryCTA>Start Your Project</PrimaryCTA>
          </div>
        </motion.div>

        {/* stage: pills ↔ card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
          className="flex items-center justify-center"
        >
          <div className="hidden flex-col items-end gap-9 lg:flex">
            {LEFT_PILLS.map((p, i) => (
              <div key={p.label} className={i === 1 ? "-mr-6" : ""}>
                <Pill {...p} side="left" index={i} />
              </div>
            ))}
          </div>
          <BuildCard />
          <div className="hidden flex-col items-start gap-9 lg:flex">
            {RIGHT_PILLS.map((p, i) => (
              <div key={p.label} className={i === 1 ? "-ml-6" : ""}>
                <Pill {...p} side="right" index={i + 3} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* mobile pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 lg:hidden">
          {[...LEFT_PILLS, ...RIGHT_PILLS].map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-300"
            >
              <Icon className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.75} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
