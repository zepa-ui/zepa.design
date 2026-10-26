"use client"

import Link from "next/link"
import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react"
import { AnimatePresence, LayoutGroup, motion, useInView } from "framer-motion"
import { ArrowUpRight, Check, RotateCw } from "lucide-react"

import {
  CONTACT_URL,
  SERVICE_GROUPS,
  SERVICES,
  type Service,
  type ServiceGroup,
} from "@/components/enterprise/data"
import { EASE, SectionHeading } from "@/components/enterprise/shared"

/* ───────────────── per-category micro visuals (pure CSS) ───────────────── */

const MOTION_CSS = `
@keyframes svc-swap { 0%,100% { transform: translateX(-50px) rotate(-8deg) } 50% { transform: translateX(-34px) rotate(0deg) } }
@keyframes svc-swap-r { 0%,100% { transform: translateX(50px) rotate(8deg) } 50% { transform: translateX(34px) rotate(0deg) } }
@keyframes svc-cursor { 0%,100% { transform: translate(0,0) } 35% { transform: translate(38px,-10px) } 70% { transform: translate(14px,8px) } }
@keyframes svc-bar { 0%,100% { transform: scaleY(.35) } 50% { transform: scaleY(1) } }
@keyframes svc-logs { from { transform: translateY(0) } to { transform: translateY(-50%) } }
@keyframes svc-fill { 0% { width: 0 } 60%,100% { width: 100% } }
@keyframes svc-pop { 0%,55% { transform: scale(0); opacity: 0 } 70% { transform: scale(1.2); opacity: 1 } 80%,100% { transform: scale(1); opacity: 1 } }
@keyframes svc-dash { to { stroke-dashoffset: -24 } }
@keyframes svc-ping { 0% { transform: scale(1); opacity: .7 } 100% { transform: scale(2.4); opacity: 0 } }
@keyframes svc-deploy { 0% { width: 6% } 70%,100% { width: 100% } }
.svc-vis * { animation-play-state: paused; }
.svc-card[data-live="true"] .svc-vis * { animation-play-state: running; }
@media (prefers-reduced-motion: reduce) { .svc-vis * { animation: none !important; } }
`

function DesignVis({ seed }: { seed: number }) {
  const colors = seed % 2 ? ["bg-zinc-600", "bg-zinc-200"] : ["bg-zinc-200", "bg-zinc-600"]
  return (
    <div className="relative flex h-full items-center justify-center">
      <span className={`absolute h-10 w-10 rounded-[10px] ${colors[0]}`} style={{ animation: "svc-swap 3.2s ease-in-out infinite" }} />
      <span className="absolute z-10 h-10 w-10 rounded-[10px] bg-blue-600/85 shadow-[0_0_24px_rgba(37,99,235,0.45)]" />
      <span className={`absolute h-10 w-10 rounded-[10px] ${colors[1]}`} style={{ animation: "svc-swap-r 3.2s ease-in-out infinite" }} />
      <svg viewBox="0 0 12 14" className="absolute left-[40%] top-[56%] z-20 h-3.5 w-3 drop-shadow" style={{ animation: `svc-cursor ${4 + seed * 0.3}s ease-in-out infinite` }}>
        <path d="M0 0 L12 8 L6 9 L3 14 Z" fill="white" stroke="black" strokeWidth="0.8" />
      </svg>
    </div>
  )
}

function ProductVis({ seed }: { seed: number }) {
  const base = [0.5, 0.8, 0.4, 1, 0.65, 0.9]
  const h = base.map((_, i) => base[(i + seed) % base.length])
  return (
    <div className="flex h-full items-end justify-center gap-1.5 px-6 pb-3">
      {h.map((v, i) => (
        <span
          key={i}
          className={`w-3 origin-bottom rounded-sm ${h[i] === 1 ? "bg-blue-500" : "bg-zinc-600"}`}
          style={{ height: `${v * 100}%`, animation: `svc-bar ${2 + (i % 3) * 0.4}s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </div>
  )
}

const LOGS = [
  ["POST", "/api/auth/session", "200"],
  ["GET", "/api/orders?limit=20", "200"],
  ["PUT", "/api/users/42/role", "204"],
  ["POST", "/api/webhooks/pay", "200"],
]

function BackendVis({ seed }: { seed: number }) {
  const logs = LOGS.map((_, i) => LOGS[(i + seed) % LOGS.length])
  return (
    <div className="h-full overflow-hidden px-3 py-2 font-mono text-[10px] leading-[18px]">
      <div style={{ animation: `svc-logs ${5 + (seed % 3)}s linear infinite` }}>
        {[...logs, ...logs].map(([m, path, code], i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-8 text-blue-400">{m}</span>
            <span className="flex-1 truncate text-zinc-400">{path}</span>
            <span className="text-emerald-500">{code}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CommerceVis({ seed }: { seed: number }) {
  return (
    <div className="flex h-full items-center gap-3 px-5">
      <div className="flex h-10 w-14 shrink-0 flex-col justify-between rounded-md bg-gradient-to-br from-zinc-500 to-zinc-700 p-1.5">
        <span className="h-1.5 w-2.5 rounded-[2px] bg-zinc-300/80" />
        <span className="h-1 w-8 rounded-full bg-zinc-300/50" />
      </div>
      <div className="flex-1">
        <div className="mb-1.5 flex justify-between font-mono text-[9px] text-zinc-500">
          <span>checkout</span>
          <span>₹ paid</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-white" style={{ animation: `svc-fill ${3 + (seed % 2) * 0.6}s ease-out infinite` }} />
        </div>
      </div>
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950"
        style={{ animation: `svc-pop ${3 + (seed % 2) * 0.6}s ease-out infinite` }}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </div>
  )
}

function IntegrationsVis({ seed }: { seed: number }) {
  const pts = [
    [24, 18],
    [24, 58],
    [136, 18],
    [136, 58],
  ].map(([x, y]) => [x, seed % 2 ? 76 - y : y])
  return (
    <svg viewBox="0 0 160 76" className="h-full w-full" fill="none">
      {pts.map(([x, y], i) => (
        <path
          key={i}
          d={`M ${x} ${y} L 80 38`}
          stroke="rgb(82 82 91)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          style={{ animation: `svc-dash 1.${i + 2}s linear infinite` }}
        />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={`n${i}`} cx={x} cy={y} r="5" fill="rgb(39 39 42)" stroke="rgb(113 113 122)" />
      ))}
      <circle cx="80" cy="38" r="9" fill="#2563eb" style={{ transformOrigin: "80px 38px", animation: "svc-ping 2s ease-out infinite" }} />
      <circle cx="80" cy="38" r="9" fill="#2563eb" />
      <circle cx="80" cy="38" r="3" fill="white" />
    </svg>
  )
}

function LaunchVis({ seed }: { seed: number }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-5 font-mono text-[10px]">
      <div className="flex items-center justify-between text-zinc-500">
        <span>▲ deploying main</span>
        <span className="inline-flex items-center gap-1 text-emerald-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" style={{ animation: "svc-ping 1.6s ease-out infinite" }} />
          live
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-white" style={{ animation: `svc-deploy ${3.2 + (seed % 3) * 0.4}s ease-in-out infinite` }} />
      </div>
      <span className="text-zinc-600">https://your-business.com · SSL ✓</span>
    </div>
  )
}

const VISUALS: Record<ServiceGroup, (p: { seed: number }) => React.JSX.Element> = {
  Design: DesignVis,
  Product: ProductVis,
  Backend: BackendVis,
  Commerce: CommerceVis,
  Integrations: IntegrationsVis,
  Launch: LaunchVis,
}

/* ───────────────────────── card ───────────────────────── */

function ServiceCard({ s, index }: { s: Service; index: number }) {
  const [flipped, setFlipped] = useState(false)
  const [hover, setHover] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: "-60px" })
  const Icon = s.icon
  const Vis = VISUALS[s.group]

  function move(e: MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    el.style.setProperty("--mx", `${x}px`)
    el.style.setProperty("--my", `${y}px`)
    el.style.setProperty("--rx", `${((y / r.height) - 0.5) * -8}deg`)
    el.style.setProperty("--ry", `${((x / r.width) - 0.5) * 10}deg`)
  }

  function leave(e: MouseEvent<HTMLDivElement>) {
    setHover(false)
    e.currentTarget.style.setProperty("--rx", "0deg")
    e.currentTarget.style.setProperty("--ry", "0deg")
  }

  function key(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setFlipped((f) => !f)
    }
  }

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${s.title} — ${flipped ? "hide" : "show"} what's included`}
      data-live={inView && (hover || !flipped) ? "true" : "false"}
      onMouseMove={move}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={leave}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={key}
      className="svc-card group relative h-[300px] cursor-pointer rounded-2xl outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-zinc-500"
    >
      {/* tilt wrapper */}
      <div
        className="relative h-full w-full transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        style={{ transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))" }}
      >
        {/* flip wrapper */}
        <div
          className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(.22,1,.36,1)]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* ── front ── */}
          <div className="absolute inset-0 [backface-visibility:hidden]">
            {/* cursor-tracked border glow */}
            <div className="absolute inset-0 rounded-2xl bg-zinc-800 transition-opacity duration-300 group-hover:bg-zinc-700" />
            <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(260px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.55),transparent_60%)]" />
            <div className="absolute inset-px flex flex-col overflow-hidden rounded-[15px] bg-zinc-900 p-5">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(300px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.05),transparent_70%)]" />

              <div className="svc-vis relative mb-5 h-[76px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: "radial-gradient(rgb(63 63 70) 1px, transparent 1px)",
                    backgroundSize: "10px 10px",
                  }}
                />
                <div className="relative h-full">
                  <Vis seed={index} />
                </div>
              </div>

              <div className="relative flex items-center gap-3">
                <div className="rounded-lg bg-zinc-800 p-2">
                  <Icon className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-[17px] font-semibold text-white">{s.title}</h3>
              </div>
              <p className="relative mt-3 text-sm leading-relaxed text-zinc-400">{s.description}</p>

              <div className="relative mt-auto flex items-center justify-between pt-4">
                <span className="rounded bg-zinc-800/80 px-2 py-1 text-[11px] text-zinc-500">{s.group}</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600 transition-colors group-hover:text-zinc-300">
                  {String(index + 1).padStart(2, "0")} · Details
                  <RotateCw className="h-3 w-3 transition-transform duration-500 group-hover:rotate-180" />
                </span>
              </div>
            </div>
          </div>

          {/* ── back ── */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-600 via-zinc-800 to-blue-900/60" />
            <div className="absolute inset-px flex flex-col overflow-hidden rounded-[15px] bg-zinc-950 p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-600/15 blur-3xl" />
              <div className="relative mb-5 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">What&apos;s included</span>
                <Icon className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
              </div>
              <h3 className="relative mb-4 text-lg font-semibold text-white">{s.title}</h3>
              <ul className="relative space-y-2.5">
                {s.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="relative mt-auto flex items-center justify-between pt-4">
                <Link
                  href={CONTACT_URL}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={flipped ? 0 : -1}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
                >
                  Discuss this <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Tap to flip back</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── section ───────────────────────── */

type Filter = "All" | ServiceGroup

export function Services() {
  const [filter, setFilter] = useState<Filter>("All")
  const gridRef = useRef(null)
  const inView = useInView(gridRef, { once: true, margin: "-80px" })

  const tabs: Filter[] = ["All", ...SERVICE_GROUPS]
  const count = (t: Filter) => (t === "All" ? SERVICES.length : SERVICES.filter((s) => s.group === t).length)
  const visible = SERVICES.map((s, i) => ({ s, i })).filter(({ s }) => filter === "All" || s.group === filter)

  return (
    <section id="services" className="scroll-mt-24 px-4 py-24">
      <style>{MOTION_CSS}</style>
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="What we offer"
          title="Everything you need."
          muted="Under one roof."
          body="Seventeen capabilities, scoped to exactly what your business needs. Filter by area, or flip any card to see what's included."
        />

        {/* filter tabs */}
        <LayoutGroup id="svc-tabs">
          <div className="scrollbar-hidden -mx-4 mb-10 flex justify-start gap-1 overflow-x-auto px-4 sm:mx-0 sm:justify-center sm:px-0">
            <div className="flex shrink-0 gap-1 rounded-full border border-zinc-800 bg-zinc-950 p-1">
              {tabs.map((t) => {
                const active = filter === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilter(t)}
                    aria-pressed={active}
                    className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                      active ? "text-zinc-950" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="svc-tab"
                        className="absolute inset-0 rounded-full bg-white"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      />
                    )}
                    <span className="relative z-10">
                      {t}
                      <span className={`ml-1.5 font-mono text-[10px] ${active ? "text-zinc-500" : "text-zinc-600"}`}>
                        {count(t)}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </LayoutGroup>

        <motion.ul
          ref={gridRef}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map(({ s, i }) => (
              <motion.li
                key={s.title}
                layout
                initial={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <ServiceCard s={s} index={i} />
              </motion.li>
            ))}

            <motion.li key="custom" layout transition={{ duration: 0.45, ease: EASE }}>
              <Link
                href={CONTACT_URL}
                target="_blank"
                rel="noreferrer"
                className="group relative flex h-[300px] flex-col overflow-hidden rounded-2xl bg-white p-6 text-zinc-950"
              >
                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: "radial-gradient(black 1px, transparent 1px)", backgroundSize: "12px 12px" }}
                />
                <div className="relative mb-6 flex items-start justify-between">
                  <span className="font-mono text-xs text-zinc-500">18</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="relative mt-auto text-2xl font-semibold leading-tight">
                  Something
                  <br />
                  custom?
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-zinc-600">
                  If it runs in a browser, we can design and build it. Tell us what you have in mind.
                </p>
                <span className="relative mt-5 text-sm font-medium underline decoration-zinc-400 underline-offset-4">
                  Discuss your project
                </span>
              </Link>
            </motion.li>
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  )
}
