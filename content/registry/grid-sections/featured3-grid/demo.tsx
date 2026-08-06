"use client"

import React, {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

/* ─────────────────────────────────────────────
   featured3-grid — three tall AI feature cards
   ─ card 1: rotating Q&A inside a glass panel
   ─ card 2: SVG forecast chart that wipes in
   ─ card 3: categorization tree whose connectors
     are measured from the live DOM, with pulses
     travelling along each path
   Everything lives in this one file; the tree is
   a local component rather than a separate module.
   ───────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const

/* self-contained font stacks — no dependency on app-level utilities */
const HEADING = 'var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif)'
const SERIF = 'Georgia, "Times New Roman", serif'

const QUESTIONS = [
  {
    q: "Can I afford to invest $500 this month?",
    a: "Based on your current income and expenses, you'll have around $620 in available balance after bills. Investing $500 is within reach — but consider saving at least $200 as an emergency buffer.",
  },
  {
    q: "When will I reach my savings goal?",
    a: "At your current savings rate of $850/month, you'll reach your $10,000 goal in approximately 8 months. Cutting discretionary spending by 15% could shave off 3 weeks.",
  },
  {
    q: "How much did I spend on food last month?",
    a: "You spent $643 on food in March — $421 on groceries and $222 on dining out. That's 18% above your monthly food budget of $545.",
  },
]

const BG = {
  one: "https://qclay.design/lovable/synergy/back-3-1.png",
  two: "https://qclay.design/lovable/synergy/back-3-2.png",
  three: "https://qclay.design/lovable/synergy/back-3-3.png",
}
const MARK = "https://qclay.design/lovable/synergy/Logo-lov.svg"

/* ── shared caption ── */
function CardCaption({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ position: "absolute", bottom: 28, left: 24, right: 24, zIndex: 2 }}>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 26,
          fontWeight: 400,
          color: "#fff",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: HEADING,
          fontSize: 13,
          color: "rgba(255,255,255,0.65)",
          lineHeight: 1.6,
        }}
      >
        {desc}
      </div>
    </div>
  )
}

/* ══════════ categorization tree ══════════ */

type NodeId =
  | "root"
  | "transport"
  | "entertainment"
  | "transportDetail"
  | "entertainmentDetail"
  | "bills"
  | "billsDetail"

const Pill = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; isInView: boolean; delay: number }
>(function Pill({ children, isInView, delay }, ref) {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      style={{
        borderRadius: 9999,
        border: "1px solid rgba(255,255,255,0.25)",
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "10px 20px",
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: 16,
        color: "#fff",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </motion.div>
  )
})

const Leaf = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; isInView: boolean; delay: number }
>(function Leaf({ children, isInView, delay }, ref) {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      style={{
        borderRadius: 12,
        background: "rgba(255,255,255,0.92)",
        padding: "10px 16px",
        fontFamily: HEADING,
        fontSize: 12,
        fontWeight: 400,
        color: "rgba(0,0,0,0.75)",
        lineHeight: 1.5,
        display: "inline-block",
        maxWidth: 160,
      }}
    >
      {children}
    </motion.div>
  )
})

const CONNECTIONS: { from: NodeId; to: NodeId; delay: number }[] = [
  { from: "root", to: "transport", delay: 0.25 },
  { from: "root", to: "entertainment", delay: 0.4 },
  { from: "transport", to: "transportDetail", delay: 0.6 },
  { from: "entertainment", to: "entertainmentDetail", delay: 0.78 },
  { from: "root", to: "bills", delay: 0.95 },
  { from: "bills", to: "billsDetail", delay: 1.15 },
]

type Point = { topX: number; topY: number; botX: number; botY: number }

function CategorizationTree({ isInView, uid }: { isInView: boolean; uid: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  /* one ref per node — a dynamic ref-setter factory trips the
     react-hooks/refs rule, since the linter can't tell the callback
     only runs at commit time */
  const rootRef = useRef<HTMLDivElement>(null)
  const transportRef = useRef<HTMLDivElement>(null)
  const entertainmentRef = useRef<HTMLDivElement>(null)
  const transportDetailRef = useRef<HTMLDivElement>(null)
  const entertainmentDetailRef = useRef<HTMLDivElement>(null)
  const billsRef = useRef<HTMLDivElement>(null)
  const billsDetailRef = useRef<HTMLDivElement>(null)

  const [points, setPoints] = useState<Record<string, Point>>({})
  const [size, setSize] = useState({ w: 0, h: 0 })

  /* connectors are drawn between measured DOM positions, so the tree
     re-routes itself whenever the card resizes */
  useLayoutEffect(() => {
    const entries: [NodeId, React.RefObject<HTMLDivElement | null>][] = [
      ["root", rootRef],
      ["transport", transportRef],
      ["entertainment", entertainmentRef],
      ["transportDetail", transportDetailRef],
      ["entertainmentDetail", entertainmentDetailRef],
      ["bills", billsRef],
      ["billsDetail", billsDetailRef],
    ]

    const measure = () => {
      const container = containerRef.current
      if (!container) return
      const cRect = container.getBoundingClientRect()
      setSize({ w: cRect.width, h: cRect.height })

      const next: Record<string, Point> = {}
      entries.forEach(([id, nodeRef]) => {
        const el = nodeRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        next[id] = {
          topX: r.left - cRect.left + r.width / 2,
          topY: r.top - cRect.top,
          botX: r.left - cRect.left + r.width / 2,
          botY: r.bottom - cRect.top,
        }
      })
      setPoints(next)
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        position: "relative",
        zIndex: 2,
        height: "100%",
      }}
    >
      <svg
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 1 }}
        width={size.w}
        height={size.h}
      >
        {CONNECTIONS.map((c, i) => {
          const p = points[c.from]
          const q = points[c.to]
          if (!p || !q) return null

          const x1 = p.botX
          const y1 = p.botY
          const x2 = q.topX
          const y2 = q.topY
          const midY = (y1 + y2) / 2
          const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`
          const pathId = `${uid}-tree-${i}`

          return (
            <g key={i}>
              <motion.path
                id={pathId}
                d={d}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1}
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, ease: "easeOut", delay: c.delay }}
              />
              <motion.circle
                cx={x2}
                cy={y2}
                r={2.5}
                fill="rgba(255,255,255,0.9)"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: c.delay + 0.5 }}
              />
              {/* pulse travelling along the connector */}
              <motion.circle
                r={3}
                fill="#fff"
                style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: [0, 1, 1, 0] } : {}}
                transition={{
                  duration: 2.4,
                  delay: c.delay + 0.6,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  ease: "easeInOut",
                  times: [0, 0.1, 0.9, 1],
                }}
              >
                <animateMotion dur="2.4s" begin={`${c.delay + 0.6}s`} repeatCount="indefinite">
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </motion.circle>
            </g>
          )
        })}
      </svg>

      <Pill ref={rootRef} isInView={isInView} delay={0}>
        Categorization
      </Pill>

      <div style={{ display: "flex", gap: 16 }}>
        <Pill ref={transportRef} isInView={isInView} delay={0.18}>
          Transportation
        </Pill>
        <Pill ref={entertainmentRef} isInView={isInView} delay={0.36}>
          Entertainment
        </Pill>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <Leaf ref={transportDetailRef} isInView={isInView} delay={0.54}>
          Fuel, rides, car maintenance, public transit
        </Leaf>
        <Leaf ref={entertainmentDetailRef} isInView={isInView} delay={0.72}>
          Streaming services, gaming, events
        </Leaf>
      </div>

      <Pill ref={billsRef} isInView={isInView} delay={0.9}>
        Bills and Utilities
      </Pill>
      <Leaf ref={billsDetailRef} isInView={isInView} delay={1.08}>
        Electricity, water, gas, internet, phone
      </Leaf>
    </div>
  )
}

/* ══════════ section ══════════ */

export default function Featured3Grid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [qIdx, setQIdx] = useState(0)

  /* namespaces every SVG id so two instances on one page can't collide */
  const uid = useId().replace(/:/g, "")

  useEffect(() => {
    const i = setInterval(() => setQIdx((p) => (p + 1) % QUESTIONS.length), 4000)
    return () => clearInterval(i)
  }, [])

  return (
    <section className="f3g-root">
      <style>{CSS}</style>

      <div ref={ref} className="f3g-head">
        <div
          style={{
            fontFamily: HEADING,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 2,
            color: "rgba(255,255,255,0.50)",
            marginBottom: 16,
          }}
        >
          AI INTELLIGENCE
        </div>

        <motion.h2
          initial={{ opacity: 0, filter: "blur(12px)", y: 30 }}
          animate={isInView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="f3g-title"
          style={{ margin: 0, color: "#fff" }}
        >
          <span style={{ fontFamily: HEADING, fontWeight: 400, letterSpacing: "-1.02px" }}>
            Your personal{" "}
          </span>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, letterSpacing: "-1.02px" }}>
            AI advisor
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)", y: 20 }}
          animate={isInView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          style={{
            fontFamily: HEADING,
            fontSize: 16,
            fontWeight: 400,
            color: "rgba(255,255,255,0.60)",
            lineHeight: 1.6,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          Experience the power of artificial intelligence working for your financial well being
        </motion.p>
      </div>

      <div className="f3g-row">
        {/* ── CARD 1 — rotating Q&A ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="f3g-card"
        >
          <img src={BG.one} alt="" className="f3g-bg" />
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(0,0,0,0.30)" }} />

          <div
            style={{
              position: "absolute",
              top: 32,
              left: 24,
              right: 24,
              zIndex: 2,
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.20)",
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(56px)",
              WebkitBackdropFilter: "blur(56px)",
              padding: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 40, height: 40, background: "#fff", borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <img src={MARK} alt="" style={{ width: 22, filter: "invert(1)" }} />
              </div>
              <span style={{ fontFamily: HEADING, fontSize: 16, fontWeight: 500, color: "#fff" }}>
                Synergeus
              </span>
            </div>

            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.20)", marginBottom: 16 }} />

            <div style={{ position: "relative", height: 160 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={qIdx}
                  initial={{ opacity: 0, filter: "blur(8px)", y: 8 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(8px)", y: -6 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  <div
                    style={{
                      fontFamily: HEADING, fontSize: 16, fontWeight: 500,
                      color: "#fff", marginBottom: 12, lineHeight: 1.4,
                    }}
                  >
                    {QUESTIONS[qIdx].q}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 20, height: 20, borderRadius: 6,
                        background: "rgba(255,255,255,0.15)", display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}
                    >
                      <img src={MARK} alt="" style={{ width: 12, opacity: 0.8 }} />
                    </div>
                    <div
                      style={{
                        fontFamily: HEADING, fontSize: 12, fontWeight: 400,
                        lineHeight: 1.6, color: "rgba(255,255,255,0.55)",
                      }}
                    >
                      {QUESTIONS[qIdx].a}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginTop: 16,
              }}
            >
              <button className="f3g-btn">
                View transaction
                <span
                  style={{
                    width: 22, height: 22, borderRadius: "50%", background: "#000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <ArrowUpRight size={12} color="#fff" />
                </span>
              </button>
              <span className="f3g-ask">ASK YOURS</span>
            </div>
          </div>

          <CardCaption
            title="Natural Language Queries"
            desc="Ask questions about your finances in plain English and get instant, accurate answers."
          />
        </motion.div>

        {/* ── CARD 2 — forecast chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
          className="f3g-card"
        >
          <img src={BG.two} alt="" className="f3g-bg" />
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(0,0,0,0.20)" }} />

          <div style={{ position: "absolute", top: 32, left: 24, right: 24, zIndex: 2 }}>
            <div
              style={{
                borderRadius: 20,
                background: "rgba(255,255,255,0.92)",
                padding: "24px 20px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: HEADING, fontSize: 12, fontWeight: 400,
                  color: "rgba(0,0,0,0.50)", lineHeight: 1.5, marginBottom: 4,
                }}
              >
                Expenses
                <br />
                expected to rise
              </div>
              <div
                style={{
                  fontFamily: SERIF, fontStyle: "italic", fontSize: 52,
                  fontWeight: 400, color: "#000", letterSpacing: "-1px", lineHeight: 1,
                }}
              >
                3%
              </div>

              <div style={{ height: 16 }} />

              <div
                style={{
                  width: 280, maxWidth: "100%", height: 145,
                  position: "relative", overflow: "visible", margin: "0 auto",
                }}
              >
                <svg
                  viewBox="60 -25 220 145"
                  width="100%"
                  height="100%"
                  preserveAspectRatio="none"
                  style={{ overflow: "visible" }}
                >
                  <defs>
                    <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(180,210,80,0.85)" />
                      <stop offset="100%" stopColor="rgba(180,210,80,0.10)" />
                    </linearGradient>
                    <clipPath id={`${uid}-reveal`}>
                      <motion.rect
                        x={60}
                        y={-25}
                        height={145}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: 220 } : {}}
                        transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                      />
                    </clipPath>
                  </defs>

                  <g clipPath={`url(#${uid}-reveal)`}>
                    <path
                      d="M 60 75 L 150 20 L 280 28 L 280 120 L 60 120 Z"
                      fill={`url(#${uid}-area)`}
                    />
                    <path
                      d="M 60 75 L 150 20 L 280 28"
                      stroke="#8DB800"
                      strokeWidth={3}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <line x1={60} y1={75} x2={60} y2={120} stroke="#8DB800" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                    <line x1={280} y1={28} x2={280} y2={120} stroke="#8DB800" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                  </g>

                  <motion.line
                    x1={150} y1={-15} x2={150} y2={20}
                    stroke="#1DC47D"
                    strokeWidth={1.2}
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 1.4 }}
                  />
                  <motion.circle
                    cx={150} cy={-15} r={4.5}
                    fill="#1DC47D"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 1.7 }}
                    style={{ transformOrigin: "150px -15px" }}
                  />
                </svg>
              </div>

              <div
                style={{
                  fontFamily: HEADING,
                  borderRadius: 9999,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "rgba(255,255,255,0.80)",
                  backdropFilter: "blur(8px)",
                  padding: "8px 16px",
                  marginTop: 16,
                  display: "inline-block",
                  fontSize: 11,
                  color: "rgba(0,0,0,0.60)",
                  textAlign: "center",
                }}
              >
                Tip: Reduce subscriptions to maintain savings target.
              </div>
            </div>
          </div>

          <CardCaption
            title="Predictive Analysis"
            desc="AI algorithms analyze patterns to forecast future expenses and income trends."
          />
        </motion.div>

        {/* ── CARD 3 — categorization tree ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
          className="f3g-card"
        >
          <img src={BG.three} alt="" className="f3g-bg" />
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(0,0,0,0.30)" }} />

          <div style={{ position: "absolute", top: 32, left: 16, right: 16, bottom: 110, zIndex: 2 }}>
            <CategorizationTree isInView={isInView} uid={uid} />
          </div>

          <CardCaption
            title="Smart Categorization"
            desc="Automatically categorize transactions with machine learning that improves over time."
          />
        </motion.div>
      </div>
    </section>
  )
}

const CSS = `
.f3g-root {
  position: relative;
  background: #000;
  padding: 80px clamp(16px, 3.5vw, 48px);
  overflow: hidden;
}
.f3g-head { text-align: center; margin-bottom: 64px; }
.f3g-title { font-size: clamp(36px, 5vw, 72px); line-height: 1.05; }

.f3g-row {
  display: flex;
  gap: 16px;
  align-items: stretch;
  max-width: 1200px;
  margin: 0 auto;
}
.f3g-card {
  flex: 1;
  min-width: 0;
  min-height: 560px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
}
.f3g-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.f3g-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: #000;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 6px 6px 16px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
}
.f3g-ask {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.80);
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 1000px) {
  .f3g-row { flex-wrap: wrap; }
  .f3g-card { flex: 1 1 100%; min-height: 520px; }
}
@media (prefers-reduced-motion: reduce) {
  .f3g-root * { animation-duration: .001ms !important; }
}
`
