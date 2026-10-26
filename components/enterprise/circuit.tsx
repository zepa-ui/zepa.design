"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { CreditCard, Database, KeyRound, Palette, Server, Smartphone, type LucideIcon } from "lucide-react"

import { PIPELINE } from "@/components/enterprise/data"
import { EASE, Reveal, SectionHeading } from "@/components/enterprise/shared"

/* Geometry lives in a 1200 × 560 viewBox; HTML tiles are placed in % of it. */
const W = 1200
const H = 560
const CX = 600
const CY = 250
const CHIP = 150
const HALF = CHIP / 2

type Node = { label: string; icon: LucideIcon; x: number; y: number; pin: number; side: "l" | "r" }

const NODES: Node[] = [
  { label: "Design", icon: Palette, x: 190, y: 90, pin: -45, side: "l" },
  { label: "Frontend", icon: Smartphone, x: 80, y: 260, pin: -15, side: "l" },
  { label: "Backend", icon: Server, x: 200, y: 430, pin: 15, side: "l" },
  { label: "Database", icon: Database, x: 1010, y: 90, pin: -45, side: "r" },
  { label: "Auth", icon: KeyRound, x: 1120, y: 260, pin: -15, side: "r" },
  { label: "Payments", icon: CreditCard, x: 1000, y: 430, pin: 15, side: "r" },
]

/** Orthogonal trace with one 45° bend, tile → chip pin. */
function trace(n: Node) {
  const py = CY + n.pin
  const d = Math.abs(py - n.y)
  if (n.side === "l") {
    const sx = n.x + 46
    const endX = CX - HALF
    const bend = endX - 50 - d
    return `M ${sx} ${n.y} H ${bend} L ${bend + d} ${py} H ${endX}`
  }
  const sx = n.x - 46
  const endX = CX + HALF
  const bend = endX + 50 + d
  return `M ${sx} ${n.y} H ${bend} L ${bend - d} ${py} H ${endX}`
}

const DROPS = [-27, -9, 9, 27] // bottom pins → production

function Tile({ n, i, show }: { n: Node; i: number; show: boolean }) {
  const Icon = n.icon
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={show ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: EASE, delay: 0.3 + i * 0.08 }}
      className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%` }}
    >
      <div className="flex h-[76px] w-[76px] items-center justify-center rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_-20px_rgba(0,0,0,0.9)] transition-colors duration-300 group-hover:border-zinc-600">
        <Icon className="h-7 w-7 text-zinc-400 transition-colors group-hover:text-white" strokeWidth={1.25} />
      </div>
      <span className="absolute top-full mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        {n.label}
      </span>
    </motion.div>
  )
}

export function Circuit() {
  const ref = useRef(null)
  const show = useInView(ref, { once: true, margin: "-120px" })

  return (
    <section id="why" className="scroll-mt-24 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="The complete stack"
          title="Not just the frontend."
          muted="One core. Every layer connected."
          body="One team takes your product from first sketch to live in production — with the exact scope agreed before development begins."
        />

        {/* desktop circuit */}
        <Reveal className="relative hidden md:block">
          <div ref={ref} className="relative mx-auto aspect-[1200/560] w-full max-w-5xl">
            <style>{`
              @keyframes ze-flow { from { stroke-dashoffset: 0 } to { stroke-dashoffset: -1400 } }
              .ze-pulse { stroke-dasharray: 70 1330; animation: ze-flow 3.6s cubic-bezier(.5,0,.3,1) infinite; }
              @media (prefers-reduced-motion: reduce) { .ze-pulse { animation: none; opacity: 0 } }
            `}</style>
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
              <defs>
                <radialGradient id="ze-fade" cx="50%" cy="45%" r="60%">
                  <stop offset="0%" stopColor="white" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.15" />
                </radialGradient>
                <mask id="ze-mask">
                  <rect width={W} height={H} fill="url(#ze-fade)" />
                </mask>
                <filter id="ze-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g mask="url(#ze-mask)">
                {/* outer runs to the edges */}
                {NODES.map((n) => (
                  <path
                    key={`edge-${n.label}`}
                    d={n.side === "l" ? `M 0 ${n.y} H ${n.x - 46}` : `M ${n.x + 46} ${n.y} H ${W}`}
                    stroke="rgb(39 39 42)"
                    strokeWidth="1.25"
                  />
                ))}
                {NODES.map((n) => (
                  <path key={n.label} d={trace(n)} stroke="rgb(63 63 70)" strokeWidth="1.5" />
                ))}
                {DROPS.map((dx) => (
                  <path key={dx} d={`M ${CX + dx} ${CY + HALF} V ${H - 40}`} stroke="rgb(63 63 70)" strokeWidth="1.5" />
                ))}
              </g>

              {/* travelling pulses */}
              {show &&
                NODES.map((n, i) => (
                  <path
                    key={`p-${n.label}`}
                    d={trace(n)}
                    stroke={i % 3 === 1 ? "#60a5fa" : "white"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="ze-pulse"
                    filter="url(#ze-glow)"
                    style={{ animationDelay: `${i * 0.55}s` }}
                  />
                ))}
              {show &&
                DROPS.map((dx, i) => (
                  <path
                    key={`pd-${dx}`}
                    d={`M ${CX + dx} ${CY + HALF} V ${H - 40}`}
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="ze-pulse"
                    filter="url(#ze-glow)"
                    style={{ animationDelay: `${1.2 + i * 0.3}s`, animationDuration: "2.8s" }}
                  />
                ))}

              {/* chip pins */}
              {[-45, -15, 15, 45].map((o) => (
                <g key={o}>
                  <rect x={CX - HALF - 10} y={CY + o - 3} width="10" height="6" rx="1.5" fill="rgb(63 63 70)" />
                  <rect x={CX + HALF} y={CY + o - 3} width="10" height="6" rx="1.5" fill="rgb(63 63 70)" />
                </g>
              ))}
              {DROPS.map((dx) => (
                <rect key={`pin-${dx}`} x={CX + dx - 3} y={CY + HALF} width="6" height="10" rx="1.5" fill="rgb(63 63 70)" />
              ))}
            </svg>

            {/* the core chip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={show ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: EASE }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(CX / W) * 100}%`, top: `${(CY / H) * 100}%`, width: `${(CHIP / W) * 100}%` }}
            >
              <div className="absolute inset-0 rounded-[28%] bg-blue-600/25 blur-2xl" />
              <div className="relative flex aspect-square items-center justify-center rounded-[28%] border border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_30px_60px_-20px_rgba(0,0,0,1)]">
                <div className="absolute inset-[10%] rounded-[24%] border border-zinc-800/80" />
                <img src="/zz.png" alt="Zepa" className="relative w-[46%] drop-shadow-[0_0_18px_rgba(37,99,235,0.55)]" />
              </div>
            </motion.div>

            {NODES.map((n, i) => (
              <Tile key={n.label} n={n} i={i} show={show} />
            ))}

            {/* destination */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-300">
                <span className="pulse-glow h-1.5 w-1.5 rounded-full bg-emerald-500 text-emerald-500" />
                Live in production
              </span>
            </motion.div>
          </div>
        </Reveal>

        {/* mobile: linear pipeline */}
        <Reveal className="md:hidden">
          <ol className="grid grid-cols-2 gap-3">
            {PIPELINE.map((step, i) => (
              <li key={step} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                <span className="font-mono text-[10px] text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm text-zinc-300">{step}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
