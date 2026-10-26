"use client"

import Link from "next/link"
import { useRef, useState, type FormEvent } from "react"
import { AnimatePresence, motion, useInView } from "framer-motion"
import { ArrowUpRight, Check, Plus } from "lucide-react"
import UnicornScene from "unicornstudio-react/next"

import {
  AGREEMENTS,
  CONTACT_URL,
  PLANS,
  PROCESS,
  STACK,
} from "@/components/enterprise/data"
import {
  Chip,
  EASE,
  Eyebrow,
  GhostCTA,
  HEADING_FONT,
  PrimaryCTA,
  Reveal,
  SectionHeading,
  rise,
  stagger,
} from "@/components/enterprise/shared"

/* ───────────────────────── featured build ───────────────────────── */

function BrowserMock() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-700/70 bg-zinc-950 shadow-[0_40px_100px_-30px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="ml-3 rounded-md bg-zinc-900 px-3 py-1 font-mono text-[10px] text-zinc-500">zepa.design</span>
      </div>
      <div className="relative px-6 pb-8 pt-10 text-center sm:px-10">
        <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[80%] -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="relative mx-auto mb-5 flex w-fit items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] text-zinc-400">Now live</span>
        </div>
        <p className="relative text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl" style={HEADING_FONT}>
          Build faster.
          <span className="block text-zinc-500">Build smarter.</span>
        </p>
        <div className="relative mt-5 flex justify-center gap-2">
          <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-medium text-zinc-950">Browse Components</span>
          <span className="rounded-full border border-zinc-800 px-3 py-1.5 text-[10px] text-zinc-400">View Demo</span>
        </div>
        <div className="relative mt-8 grid grid-cols-3 gap-2.5">
          {["from-zinc-800 to-zinc-900", "from-blue-900/50 to-zinc-900", "from-zinc-800 to-zinc-950"].map((g, i) => (
            <div key={i} className={`aspect-[5/4] rounded-lg border border-zinc-800 bg-gradient-to-br ${g}`}>
              <div className="m-2 h-1.5 w-1/2 rounded-full bg-zinc-700/70" />
              <div className="mx-2 h-1.5 w-1/3 rounded-full bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FeaturedBuild() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <Eyebrow className="mb-5">Featured build</Eyebrow>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl" style={HEADING_FONT}>
              Proof, not promises.
              <span className="block text-zinc-500">We ship our own product.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/components"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-800 px-5 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
            >
              Explore Zepa UI <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <div className="grid items-center gap-10 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:p-10">
          <Reveal>
            <BrowserMock />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">Zepa UI</span>
              {["Next.js", "PostgreSQL", "Auth", "WebGL"].map((t) => (
                <span key={t} className="rounded-full border border-zinc-800 px-2.5 py-0.5 font-mono text-[10px] text-zinc-400">
                  {t}
                </span>
              ))}
            </div>
            <h3 className="mb-4 text-xl font-semibold leading-snug text-white sm:text-2xl">
              A component platform — designed, built and run end to end.
            </h3>
            <p className="mb-8 text-sm leading-relaxed text-zinc-400">
              The same team behind Zepa Enterprise built Zepa UI: a React component library with live
              previews, user accounts, bookmarks, an admin dashboard and analytics — on the exact stack we
              use for client work.
            </p>
            <dl className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-6">
              {[
                { v: "50+", l: "Components" },
                { v: "200+", l: "Developers" },
                { v: "1", l: "Team, end to end" },
              ].map((s) => (
                <div key={s.l}>
                  <dd className="text-2xl font-bold text-white" style={HEADING_FONT}>{s.v}</dd>
                  <dt className="mt-1 text-xs text-zinc-500">{s.l}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── stack accordion ───────────────────────── */

export function Stack() {
  const [open, setOpen] = useState(0)

  return (
    <section className="px-4 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="Technology"
            title="A modern stack."
            muted="Chosen per project."
            body="We pick the stack from your requirements — not every product needs every tool. Your interface is built on the same design system that powers Zepa UI."
          />
          <Reveal>
            <Link
              href={CONTACT_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-3 rounded-full border border-zinc-700 pl-5 pr-1.5 font-mono text-xs uppercase tracking-[0.15em] text-zinc-200 transition-colors hover:bg-zinc-900"
            >
              Scope your stack
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-950">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </Reveal>
        </div>

        <Reveal>
          <ul className="border-t border-zinc-800">
            {STACK.map((row, i) => {
              const isOpen = open === i
              return (
                <li key={row.layer} className="border-b border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-[10px] text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`text-base font-medium transition-colors sm:text-lg ${isOpen ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                        {row.layer}
                      </span>
                    </span>
                    <Plus
                      className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-45 text-white" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-4 pb-6 pl-9 sm:grid-cols-[1.2fr_1fr]">
                          <p className="text-sm leading-relaxed text-zinc-400">{row.text}</p>
                          <div className="flex flex-wrap content-start gap-2 sm:justify-end">
                            {row.tools.map((t) => (
                              <span key={t} className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-xs text-zinc-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────── process ───────────────────────── */

export function Process() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="How we work"
          title="A clear process."
          muted="No surprises."
          body="Every engagement follows the same seven steps, so you always know what is happening and what comes next."
        />
        <motion.ol
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PROCESS.map((step, i) => (
            <motion.li key={step.title} variants={rise} className="group bg-landing p-6 transition-colors hover:bg-zinc-900/70">
              <span className="font-mono text-xs text-zinc-600 transition-colors group-hover:text-blue-400">
                Step {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-2 mt-6 text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{step.text}</p>
            </motion.li>
          ))}
          <motion.li variants={rise} className="flex flex-col justify-end bg-zinc-900 p-6">
            <p className="text-sm text-zinc-500">Typical outcome</p>
            <p className="mt-1 text-lg font-semibold text-white">A live product you fully own.</p>
          </motion.li>
        </motion.ol>
      </div>
    </section>
  )
}

/* ───────────────────────── engagement ───────────────────────── */

export function Engagement() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Engagement"
          title="Transparent pricing."
          muted="Scoped to you."
          body="A landing page and a SaaS platform are different projects, so every quote is based on your scope — features, integrations and timeline."
        />
        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {PLANS.map((p) => (
            <motion.div
              key={p.name}
              variants={rise}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                p.featured
                  ? "border-zinc-600 bg-zinc-900 shadow-[0_0_80px_-20px_rgba(37,99,235,0.25)]"
                  : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
              {p.featured ? (
                <span className="absolute right-6 top-6 rounded-full border border-blue-500/30 bg-blue-600/10 px-2.5 py-0.5 text-[11px] text-blue-300">
                  Most requested
                </span>
              ) : null}
              <h3 className="text-xl font-semibold text-white" style={HEADING_FONT}>{p.name}</h3>
              <p className="mt-2 min-h-[2.5rem] text-sm text-zinc-400">{p.fit}</p>
              <p className="mt-6 text-2xl font-bold text-white">Custom quote</p>
              <ul className="mt-6 space-y-3 border-t border-zinc-800 pt-6">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2} />
                    {pt}
                  </li>
                ))}
              </ul>
              <Link
                href={CONTACT_URL}
                target="_blank"
                rel="noreferrer"
                className={`mt-8 inline-flex h-11 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  p.featured
                    ? "bg-white text-zinc-950 hover:bg-zinc-200"
                    : "border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                Get a quote
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <Reveal className="mt-6 flex flex-col gap-4 rounded-2xl border border-zinc-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-400">Agreed in writing with every client</p>
          <ul className="flex flex-wrap gap-2">
            {AGREEMENTS.map((a) => (
              <li key={a} className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-300">{a}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────── booking ───────────────────────── */

const REVIEW_POINTS = ["Your goals & requirements", "Feature and page scope", "Recommended stack", "Timeline & budget range"]

export function Booking() {
  const [form, setForm] = useState({ name: "", email: "", project: "" })

  function submit(e: FormEvent) {
    e.preventDefault()
    // Calendly pre-fills name / email / first answer from the query string.
    const url = new URL(CONTACT_URL)
    if (form.name) url.searchParams.set("name", form.name)
    if (form.email) url.searchParams.set("email", form.email)
    if (form.project) url.searchParams.set("a1", form.project)
    window.open(url.toString(), "_blank", "noopener,noreferrer")
  }

  const field =
    "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-600"

  return (
    <section id="book" className="scroll-mt-24 px-4 py-24">
      <Reveal className="mx-auto max-w-6xl rounded-3xl border border-zinc-800 bg-zinc-900/30 px-5 py-14 sm:px-10 sm:py-16">
        <div className="mb-12 text-center">
          <Eyebrow className="mb-5">Let&apos;s build something better</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl" style={HEADING_FONT}>
            Book a 30-minute
            <span className="block text-zinc-500">strategy session.</span>
          </h2>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          {/* review card */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-zinc-700/70 bg-gradient-to-b from-zinc-900 to-zinc-950 p-7">
            <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-white/[0.04] blur-3xl" />
            <h3 className="relative text-2xl font-bold leading-tight text-white" style={HEADING_FONT}>
              Free project
              <br />
              review
            </h3>
            <p className="relative mt-3 text-sm leading-relaxed text-zinc-400">
              We&apos;ll look at your idea or current site and map a practical path from scope to launch.
            </p>
            <p className="relative mt-6 mb-3 text-xs font-medium text-zinc-300">During the session we&apos;ll cover</p>
            <ul className="relative space-y-2.5">
              {REVIEW_POINTS.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href={CONTACT_URL}
              target="_blank"
              rel="noreferrer"
              className="relative mt-auto inline-flex h-11 items-center justify-center rounded-full bg-white text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 [margin-top:2rem]"
            >
              Reserve my session
            </Link>
          </div>

          {/* form */}
          <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-7">
            <label className="text-xs text-zinc-500">
              Your name
              <input
                className={`${field} mt-2`}
                placeholder="John Carter"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="text-xs text-zinc-500">
              Business email
              <input
                type="email"
                className={`${field} mt-2`}
                placeholder="john@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="flex flex-1 flex-col text-xs text-zinc-500">
              Tell us about your project
              <textarea
                className={`${field} mt-2 min-h-[110px] flex-1 resize-none`}
                placeholder="What are you building, and what problem should it solve?"
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
              />
            </label>
            <button
              type="submit"
              className="shimmer-btn mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Book free consultation <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  )
}

/* ───────────────────────── atmospheric final cta ───────────────────────── */

export function FinalCTA() {
  return (
    <section className="px-4 pb-16 pt-8">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-zinc-800 bg-landing">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <UnicornScene
            projectId="KNn6dlWqGKdy8LDpWCWy"
            width="100%"
            height="100%"
            scale={1}
            dpi={1.5}
            sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.6/dist/unicornStudio.umd.js"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-landing via-landing/60 to-landing/20" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[80%] -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-600/20 blur-[100px]" />

        <div className="relative px-6 py-24 text-center sm:py-32">
          <Eyebrow className="mb-6">Build partner for growing businesses</Eyebrow>
          <h2
            className="mx-auto max-w-5xl text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem]"
            style={HEADING_FONT}
          >
            Your next customer will judge your website.
            <span className="block bg-gradient-to-b from-zinc-300 to-zinc-600 bg-clip-text text-transparent">
              Let&apos;s make it unforgettable.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-[1.9] text-zinc-400">
            Design and development for <Chip>websites</Chip>, <Chip>web apps</Chip> and{" "}
            <Chip>platforms</Chip> — scoped clearly, built properly, owned by you.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GhostCTA href="#services">View Capabilities</GhostCTA>
            <PrimaryCTA>Start Your Project</PrimaryCTA>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ───────────────────────── closing strip ───────────────────────── */

export function ClosingStrip() {
  return (
    <section className="px-4 pb-10">
      <Reveal className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-gradient-to-r from-zinc-800 via-zinc-600/60 to-zinc-800 p-px sm:rounded-full">
          <div className="flex flex-col items-center gap-5 rounded-[calc(1.5rem-1px)] bg-zinc-950 px-6 py-6 text-center sm:flex-row sm:justify-between sm:rounded-full sm:py-3 sm:pl-6 sm:pr-3 sm:text-left">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
                <span className="pulse-glow h-1.5 w-1.5 rounded-full bg-emerald-500 text-emerald-500" />
                Available
              </span>
              <p className="text-sm text-zinc-300 sm:text-base">
                Start with a 30-minute intro call.{" "}
                <span className="block text-zinc-500 sm:inline">No commitment.</span>
              </p>
            </div>
            <Link
              href={CONTACT_URL}
              target="_blank"
              rel="noreferrer"
              className="shimmer-btn group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white pl-5 pr-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              Book a call
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ───────────────────────── giant wordmark ───────────────────────── */

export function Wordmark() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  return (
    <div ref={ref} aria-hidden className="pointer-events-none select-none overflow-hidden px-4">
      <motion.p
        initial={{ y: "35%", opacity: 0 }}
        animate={inView ? { y: "18%", opacity: 1 } : {}}
        transition={{ duration: 1.2, ease: EASE }}
        className="mx-auto max-w-6xl bg-gradient-to-b from-zinc-500 via-zinc-800 to-transparent bg-clip-text text-center text-[24vw] font-light leading-[0.8] tracking-[-0.06em] text-transparent lg:text-[17rem]"
        style={HEADING_FONT}
      >
        zepa
      </motion.p>
    </div>
  )
}
