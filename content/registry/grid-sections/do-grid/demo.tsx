"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   do-grid — interactive investor dashboard bento

   A dark trading dashboard on a sage backdrop, and
   every tile does something:

   · Market sentiment — a 220° gauge that counts up
     on appear. Press and drag along it to scrub the
     reading; let go and leave, and it springs back.
   · Portfolio performance — range tabs redraw the
     line, and a crosshair tooltip follows the cursor.
   · My portfolio — the curve has its own hover
     readout, and the allocation bar and legend
     highlight each other.
   · Protect your capital — hovering lifts the
     padlock's shackle; Secure account steps the
     protection level up; the close button dismisses
     it with an undo.
   · Trading activity — a 19-week heatmap that pops
     in diagonally, with a per-day tooltip.
   · Last activity, quick actions, top picks and the
     dock all respond to hover, and the dock and the
     carousel arrows work.

   Everything appears on scroll-into-view with a
   staggered rise. No dependencies — SVG, CSS and
   a few lines of state.
   ───────────────────────────────────────────── */

/* ── deterministic data ─────────────────────── */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const money = (n: number, sign = false) => {
  const s = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(n))
  if (!sign) return s
  return (n < 0 ? "-" : "+") + s
}

type Range = "1D" | "7D" | "1M" | "1Y" | "All"
const RANGES: Range[] = ["1D", "7D", "1M", "1Y", "All"]

const RANGE_LABELS: Record<Range, string[]> = {
  "1D": ["9am", "11am", "1pm", "3pm", "5pm", "7pm", "9pm"],
  "7D": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "1M": ["Apr", "May", "Jun", "Jul", "Aug", "Oct", "Nov", "Dec", "Jan"],
  "1Y": ["Feb", "Apr", "Jun", "Aug", "Oct", "Dec", "Feb"],
  All: ["2019", "2020", "2021", "2022", "2023", "2024"],
}

/** a jittery walk that climbs, wanders, dips hard near the end and recovers —
    the same shape the reference chart tells */
function buildSeries(range: Range) {
  const n = { "1D": 60, "7D": 70, "1M": 96, "1Y": 110, All: 120 }[range]
  const rand = mulberry32({ "1D": 11, "7D": 23, "1M": 7, "1Y": 41, All: 97 }[range])
  const out: number[] = []
  let v = 19800
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const drift =
      t < 0.42 ? 120 : t < 0.78 ? -95 : t < 0.86 ? -260 : 520
    v += drift + (rand() - 0.5) * 900
    out.push(Math.max(15500, Math.min(28500, v)))
  }
  return out
}

const PORT_MONTHS = [
  "June, 2023", "July, 2023", "August, 2023", "September, 2023",
  "October, 2023", "November, 2023", "December, 2023", "January, 2024",
  "February, 2024", "March, 2024", "April, 2024", "May, 2024",
]
const PORT_VALUES = [
  31220.1, 33480.55, 35910.2, 34120.85, 36640.4, 41980.15, 52310.6, 56120.9,
  59394.3, 64820.25, 69410.8, 66920.4,
]

const TOTAL = 249196

const ALLOC = [
  { key: "Stocks", pct: 32, color: "#f0606a" },
  { key: "Crypto", pct: 25, color: "#f1eb7c" },
  { key: "Funds", pct: 17, color: "#8a7cf0" },
  { key: "Bonds", pct: 14, color: "#8db8f5" },
  { key: "Other", pct: 12, color: "#e38df0" },
]

const ACTIVITY = [
  { name: "Boeing Co", ticker: "BA", side: "Buy", amount: -2090, time: "22:35", bg: "#1d3fb6", fg: "#ffffff", glyph: "B" },
  { name: "Walt Disney", ticker: "DIS", side: "Buy", amount: -1500, time: "21:10", bg: "#f2f2f2", fg: "#111111", glyph: "D" },
  { name: "Nike Inc", ticker: "NKE", side: "Sell", amount: 860.4, time: "18:42", bg: "#e8461d", fg: "#ffffff", glyph: "N" },
  { name: "Netflix", ticker: "NFLX", side: "Buy", amount: -3120, time: "16:05", bg: "#c4182b", fg: "#ffffff", glyph: "N" },
]

const PICKS = [
  { name: "Apple", ticker: "AAPL", price: 189.43, change: 1.2, bg: "#2b2b2b" },
  { name: "Tesla", ticker: "TSLA", price: 201.1, change: 3.4, bg: "#3fbf6a" },
  { name: "AMD", ticker: "AMD", price: 171.22, change: -0.8, bg: "#2155e6" },
  { name: "Shopify", ticker: "SHOP", price: 78.64, change: 2.1, bg: "#f2611d" },
  { name: "Nvidia", ticker: "NVDA", price: 912.5, change: 4.6, bg: "#76b900" },
]

const LEVELS = ["Basic", "Advanced", "Maximum"]

const HEAT_COLS = 19
const HEAT_ROWS = 7
const HEAT_SHADES = ["#2b2b25", "#46462f", "#6b6b44", "#989a5b", "#f5ef8c"]

/* ── icons ──────────────────────────────────── */

type IconName =
  | "plus" | "gift" | "bell" | "search" | "shield" | "close" | "chev-r"
  | "chev-l" | "expand" | "up" | "down" | "calendar" | "pie" | "grid"
  | "wallet" | "swap" | "doc" | "send" | "cash"

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  switch (name) {
    case "plus": return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>
    case "gift": return <svg {...p}><rect x="3.5" y="8" width="17" height="4" rx="1" /><path d="M5 12v8h14v-8M12 8v12M12 8c-1.5-3-5-3.5-5-1.2C7 8 12 8 12 8Zm0 0c1.5-3 5-3.5 5-1.2C17 8 12 8 12 8Z" /></svg>
    case "bell": return <svg {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
    case "search": return <svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
    case "shield": return <svg {...p}><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" /><path d="m12.6 8-2.4 4h3.4L11.2 16" /></svg>
    case "close": return <svg {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
    case "chev-r": return <svg {...p}><path d="m9 6 6 6-6 6" /></svg>
    case "chev-l": return <svg {...p}><path d="m15 6-6 6 6 6" /></svg>
    case "expand": return <svg {...p}><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5M4 4l5 5M20 4l-5 5M4 20l5-5M20 20l-5-5" /></svg>
    case "up": return <svg {...p}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
    case "down": return <svg {...p}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
    case "calendar": return <svg {...p}><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>
    case "pie": return <svg {...p}><path d="M12 3a9 9 0 1 0 9 9h-9V3Z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5Z" /></svg>
    case "grid": return <svg {...p}><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></svg>
    case "wallet": return <svg {...p}><rect x="3.5" y="6" width="17" height="13" rx="3" /><path d="M16 12.5h2M3.5 9.5 15 6" /></svg>
    case "swap": return <svg {...p}><path d="M4 8h14l-3-3M20 16H6l3 3" /></svg>
    case "doc": return <svg {...p}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 13h5M10 17h3" /></svg>
    case "send": return <svg {...p}><path d="M5 12h12M13 6l6 6-6 6" /></svg>
    case "cash": return <svg {...p}><rect x="3.5" y="6.5" width="17" height="11" rx="2.5" /><circle cx="12" cy="12" r="2.4" /></svg>
  }
}

/* ── the gauge ──────────────────────────────── */

const G = { cx: 250, cy: 300, r: 196, start: 200, sweep: 220 }
const polar = (deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: G.cx + G.r * Math.cos(a), y: G.cy - G.r * Math.sin(a) }
}
const arcPath = (() => {
  const s = polar(G.start)
  const e = polar(G.start - G.sweep)
  return `M ${s.x} ${s.y} A ${G.r} ${G.r} 0 1 1 ${e.x} ${e.y}`
})()

/* ── smoothing for the portfolio curve ──────── */

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ""
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export default function DoGrid() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const rootRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  /* appear once, when the dashboard first scrolls into view */
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /* ── sentiment gauge ── */
  const [sentiment, setSentiment] = useState(68)
  const scrubbing = useRef(false)
  const animRef = useRef(0)
  const gaugeRef = useRef<SVGSVGElement>(null)

  const tweenSentiment = useCallback((from: number, to: number, ms: number) => {
    cancelAnimationFrame(animRef.current)
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      setSentiment(from + (to - from) * easeOut(t))
      if (t < 1) animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    if (!inView) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!reduce) tweenSentiment(0, 68, 1600)
    return () => cancelAnimationFrame(animRef.current)
  }, [inView, tweenSentiment])

  const sentimentFromPointer = (e: React.PointerEvent) => {
    const svg = gaugeRef.current
    if (!svg) return
    const box = svg.getBoundingClientRect()
    const vb = svg.viewBox.baseVal
    const x = ((e.clientX - box.left) / box.width) * vb.width
    const y = ((e.clientY - box.top) / box.height) * vb.height
    let deg = (Math.atan2(G.cy - y, x - G.cx) * 180) / Math.PI
    if (deg < G.start - G.sweep - 40) deg += 360
    const p = (G.start - deg) / G.sweep
    cancelAnimationFrame(animRef.current)
    setSentiment(Math.round(Math.max(0, Math.min(1, p)) * 100))
  }

  const sentimentInt = Math.round(sentiment)
  const knob = polar(G.start - (sentiment / 100) * G.sweep)
  const bearish = sentimentInt < 45
  const mood =
    sentimentInt >= 55
      ? "Market is leaning towards buying volume."
      : sentimentInt <= 45
        ? "Market is leaning towards selling volume."
        : "Market is holding steady, both ways."

  /* ── performance chart ── */
  const [range, setRange] = useState<Range>("1M")
  const series = useMemo(() => buildSeries(range), [range])
  const [perfHover, setPerfHover] = useState<number | null>(null)
  const perfIdx = perfHover ?? Math.round(series.length * 0.42)
  const VB_W = 1000
  const VB_H = 260
  const [lo, hi] = useMemo(() => {
    const min = Math.min(...series)
    const max = Math.max(...series)
    const pad = (max - min) * 0.18
    return [min - pad, max + pad]
  }, [series])
  const yOf = (v: number) => VB_H - ((v - lo) / (hi - lo)) * VB_H
  const linePath = useMemo(
    () =>
      series
        .map((v, i) => `${i ? "L" : "M"} ${(i / (series.length - 1)) * VB_W} ${yOf(v)}`)
        .join(" "),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, lo, hi],
  )
  const areaPath = `${linePath} L ${VB_W} ${VB_H} L 0 ${VB_H} Z`
  const perfX = (perfIdx / (series.length - 1)) * 100
  const perfY = (yOf(series[perfIdx]) / VB_H) * 100

  const onPerfMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const f = Math.max(0, Math.min(1, (e.clientX - box.left) / box.width))
    setPerfHover(Math.round(f * (series.length - 1)))
  }

  /* ── portfolio curve ── */
  const [portHover, setPortHover] = useState<number | null>(null)
  const portIdx = portHover ?? 8
  const PV_W = 400
  const PV_H = 130
  const portPts = useMemo(() => {
    const min = Math.min(...PORT_VALUES) * 0.92
    const max = Math.max(...PORT_VALUES) * 1.04
    return PORT_VALUES.map((v, i) => ({
      x: (i / (PORT_VALUES.length - 1)) * PV_W,
      y: PV_H - ((v - min) / (max - min)) * PV_H,
    }))
  }, [])
  const portPath = useMemo(() => smoothPath(portPts), [portPts])
  const onPortMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const f = Math.max(0, Math.min(1, (e.clientX - box.left) / box.width))
    setPortHover(Math.round(f * (PORT_VALUES.length - 1)))
  }

  const [allocHover, setAllocHover] = useState<number | null>(null)

  /* total counts up with the gauge */
  const [total, setTotal] = useState(TOTAL)
  useEffect(() => {
    if (!inView) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return
    let raf = 0
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 1500)
      setTotal(TOTAL * easeOut(t))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView])

  /* ── protection card ── */
  const [level, setLevel] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [secured, setSecured] = useState(0)

  /* ── heatmap ── */
  const heat = useMemo(() => {
    const rand = mulberry32(2024)
    return Array.from({ length: HEAT_ROWS * HEAT_COLS }, (_, i) => {
      const col = i % HEAT_COLS
      const bias = col > 9 ? 0.18 : 0
      const r = rand() + bias
      return r > 0.86 ? 4 : r > 0.62 ? 3 : r > 0.4 ? 2 : r > 0.2 ? 1 : 0
    })
  }, [])
  const [heatHover, setHeatHover] = useState<number | null>(null)
  const heatDate = (i: number) => {
    const col = i % HEAT_COLS
    const row = Math.floor(i / HEAT_COLS)
    const d = new Date(2023, 8, 4 + col * 7 + row)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  /* ── misc ── */
  const [bellDot, setBellDot] = useState(true)
  const [dock, setDock] = useState(3)
  const picksRef = useRef<HTMLDivElement>(null)
  const scrollPicks = (dir: 1 | -1) => {
    const el = picksRef.current
    if (!el) return
    el.scrollBy({ left: dir * 180, behavior: "smooth" })
  }

  const DOCK: { icon: IconName; label: string }[] = [
    { icon: "calendar", label: "Calendar" },
    { icon: "search", label: "Search" },
    { icon: "pie", label: "Allocation" },
    { icon: "grid", label: "Dashboard" },
    { icon: "wallet", label: "Wallet" },
    { icon: "swap", label: "Exchange" },
    { icon: "doc", label: "Reports" },
  ]

  return (
    <div ref={rootRef} className={`dog-root${inView ? " is-in" : ""}`}>
      <style>{CSS}</style>

      <div className="dog-frame">
        {/* ── header ── */}
        <header className="dog-head dog-rise" style={{ "--i": 0 } as React.CSSProperties}>
          <div className="dog-user">
            <span className="dog-avatar">DT</span>
            <span className="dog-user-text">
              <b>David Thomas</b>
              <small>Investor</small>
            </span>
          </div>
          <div className="dog-head-actions">
            <button type="button" className="dog-add">
              Add widget <Icon name="plus" size={16} />
            </button>
            <button type="button" className="dog-icon-btn" aria-label="Rewards">
              <Icon name="gift" />
            </button>
            <button
              type="button"
              className="dog-icon-btn"
              aria-label="Notifications"
              onClick={() => setBellDot(false)}
            >
              <Icon name="bell" />
              {bellDot && <span className="dog-dot" />}
            </button>
            <button type="button" className="dog-icon-btn" aria-label="Search">
              <Icon name="search" />
            </button>
          </div>
        </header>

        <div className="dog-grid">
          {/* ── market sentiment ── */}
          <section
            className={`dog-card dog-sent dog-rise${bearish ? " is-bear" : ""}`}
            style={{ "--i": 1 } as React.CSSProperties}
            onPointerLeave={() => {
              if (scrubbing.current) return
              if (sentimentInt !== 68) tweenSentiment(sentiment, 68, 900)
            }}
          >
            <div className="dog-sent-top">
              <h3 className="dog-title">Market sentiment</h3>
              <div className="dog-sent-num">
                {sentimentInt}
                <span>%</span>
              </div>
            </div>

            <svg
              ref={gaugeRef}
              className="dog-gauge"
              viewBox="0 0 500 330"
              onPointerDown={(e) => {
                scrubbing.current = true
                e.currentTarget.setPointerCapture(e.pointerId)
                sentimentFromPointer(e)
              }}
              onPointerMove={(e) => {
                if (scrubbing.current) sentimentFromPointer(e)
              }}
              onPointerUp={(e) => {
                scrubbing.current = false
                e.currentTarget.releasePointerCapture(e.pointerId)
              }}
              role="slider"
              aria-label="Market sentiment"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={sentimentInt}
            >
              <defs>
                <pattern id={`${uid}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
                  <rect width="2" height="9" fill="rgba(255,255,255,0.28)" />
                </pattern>
                <radialGradient id={`${uid}-glow`}>
                  <stop offset="0%" stopColor="var(--dog-sent)" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="var(--dog-sent)" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* the untravelled track, hatched */}
              <path d={arcPath} stroke={`url(#${uid}-hatch)`} strokeWidth="58" fill="none" />
              <circle className="dog-gauge-glow" cx={knob.x} cy={knob.y} r="120" fill={`url(#${uid}-glow)`} />
              {/* the reading */}
              <path
                d={arcPath}
                pathLength={100}
                className="dog-gauge-fill"
                strokeWidth="58"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(0.01, sentiment)} 100`}
              />
              <g className="dog-knob" style={{ transformOrigin: `${knob.x}px ${knob.y}px` }}>
                <circle cx={knob.x} cy={knob.y} r="27" className="dog-knob-ring" />
                <circle cx={knob.x} cy={knob.y} r="13" fill="#141414" />
              </g>
            </svg>

            <p className="dog-sent-mood">{mood}</p>
          </section>

          {/* ── portfolio performance ── */}
          <section className="dog-card dog-perf dog-rise" style={{ "--i": 2 } as React.CSSProperties}>
            <div className="dog-row">
              <h3 className="dog-title">Portfolio performance</h3>
              <div className="dog-tabs" role="tablist">
                <span
                  className="dog-tab-pill"
                  style={{ transform: `translateX(${RANGES.indexOf(range) * 100}%)` }}
                />
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="tab"
                    aria-selected={r === range}
                    className={`dog-tab${r === range ? " is-on" : ""}`}
                    onClick={() => {
                      setRange(r)
                      setPerfHover(null)
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="dog-chart"
              onPointerMove={onPerfMove}
              onPointerLeave={() => setPerfHover(null)}
            >
              <div className="dog-chart-grid" />
              <svg key={range} className="dog-chart-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.09" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill={`url(#${uid}-area)`} />
                <path d={linePath} fill="none" stroke="#ffffff" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              </svg>
              <span className="dog-cross" style={{ left: `${perfX}%`, top: `${perfY}%` }} />
              <span className="dog-cross-dot" style={{ left: `${perfX}%`, top: `${perfY}%` }} />
              <span
                className={`dog-tip${perfY < 32 ? " is-below" : ""}`}
                style={{ left: `clamp(60px, ${perfX}%, calc(100% - 60px))`, top: `${perfY}%` }}
              >
                {money(series[perfIdx])}
              </span>
            </div>

            <div className="dog-axis">
              {RANGE_LABELS[range].map((l, i) => (
                <span key={`${range}-${i}`}>{l}</span>
              ))}
            </div>
          </section>

          {/* ── right column ── */}
          <div className="dog-side">
            <section className="dog-card dog-port dog-rise" style={{ "--i": 3 } as React.CSSProperties}>
              <div className="dog-row">
                <h3 className="dog-title">My portfolio</h3>
                <button type="button" className="dog-chip">
                  <Icon name="plus" size={15} /> Deposit
                </button>
              </div>

              <div className="dog-port-total">
                <span className="dog-serif">{money(total)}</span>
                <span className="dog-up">
                  <Icon name="up" size={13} /> + 17.5%
                </span>
              </div>

              <div
                className="dog-port-chart"
                onPointerMove={onPortMove}
                onPointerLeave={() => setPortHover(null)}
              >
                <svg viewBox={`0 0 ${PV_W} ${PV_H}`} preserveAspectRatio="none">
                  <path d={portPath} fill="none" stroke="#ffffff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </svg>
                <span
                  className="dog-port-dot"
                  style={{
                    left: `${(portPts[portIdx].x / PV_W) * 100}%`,
                    top: `${(portPts[portIdx].y / PV_H) * 100}%`,
                  }}
                />
                <span
                  className={`dog-port-read${portIdx < 5 ? " is-right" : ""}`}
                  style={{
                    left: `${(portPts[portIdx].x / PV_W) * 100}%`,
                    top: `${(portPts[portIdx].y / PV_H) * 100}%`,
                  }}
                >
                  <small>{PORT_MONTHS[portIdx]}</small>
                  <b className="dog-serif">{money(PORT_VALUES[portIdx])}</b>
                </span>
              </div>

              <div className="dog-alloc" onPointerLeave={() => setAllocHover(null)}>
                {ALLOC.map((a, i) => (
                  <span
                    key={a.key}
                    className={`dog-seg${allocHover !== null && allocHover !== i ? " is-dim" : ""}`}
                    style={
                      {
                        "--w": `${a.pct}`,
                        "--c": a.color,
                        "--d": `${i * 90}ms`,
                      } as React.CSSProperties
                    }
                    onPointerEnter={() => setAllocHover(i)}
                  />
                ))}
              </div>

              <ul className="dog-legend" onPointerLeave={() => setAllocHover(null)}>
                {ALLOC.map((a, i) => (
                  <li
                    key={a.key}
                    className={`${allocHover === i ? "is-on" : ""}${allocHover !== null && allocHover !== i ? " is-dim" : ""}`}
                    onPointerEnter={() => setAllocHover(i)}
                  >
                    <span className="dog-legend-dot" style={{ background: a.color }} />
                    <span className="dog-legend-name">
                      {a.key}
                      <small>{a.pct}%</small>
                    </span>
                    <span className="dog-serif dog-legend-val">{money((TOTAL * a.pct) / 100)}</span>
                  </li>
                ))}
              </ul>

              <button type="button" className="dog-wide">View all 26</button>
            </section>

            <section className="dog-card dog-last dog-rise" style={{ "--i": 7 } as React.CSSProperties}>
              <div className="dog-row">
                <h3 className="dog-title">Last activity</h3>
                <button type="button" className="dog-chip">
                  View all <Icon name="chev-r" size={15} />
                </button>
              </div>
              <ul className="dog-acts">
                {ACTIVITY.map((a) => (
                  <li key={a.ticker}>
                    <span className="dog-logo" style={{ background: a.bg, color: a.fg }}>{a.glyph}</span>
                    <span className="dog-act-name">
                      <b>
                        {a.name} <em>{a.ticker}</em>
                      </b>
                      <small className={a.side === "Buy" ? "is-buy" : "is-sell"}>
                        <Icon name={a.side === "Buy" ? "up" : "down"} size={13} /> {a.side}
                      </small>
                    </span>
                    <span className="dog-act-amt">
                      <b className="dog-serif">{money(a.amount, true)}</b>
                      <small>{a.time}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ── protect your capital ── */}
          <section
            className={`dog-card dog-prot dog-rise${dismissed ? " is-gone" : ""}`}
            style={{ "--i": 4 } as React.CSSProperties}
          >
            {dismissed ? (
              <div className="dog-prot-gone">
                <Icon name="shield" size={22} />
                <p>Protection tips hidden.</p>
                <button type="button" onClick={() => setDismissed(false)}>Undo</button>
              </div>
            ) : (
              <>
                <div className="dog-row">
                  <span className="dog-level">
                    <Icon name="shield" size={16} />
                    Protection level: {LEVELS[level]}
                    <span className="dog-level-dots">
                      {LEVELS.map((l, i) => (
                        <i key={l} className={i <= level ? "is-on" : ""} />
                      ))}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="dog-x"
                    aria-label="Dismiss"
                    onClick={() => setDismissed(true)}
                  >
                    <Icon name="close" size={20} />
                  </button>
                </div>

                <h3 className="dog-prot-title">
                  {level === 2 ? "Your capital is protected" : "Protect your capital"}
                </h3>
                <p className="dog-prot-copy">
                  Activate multi-layered account protection and institutional-grade
                  encryption for all your transactions.
                </p>

                <button
                  type="button"
                  className="dog-secure"
                  onClick={() => {
                    setLevel((l) => Math.min(2, l + 1))
                    setSecured((s) => s + 1)
                  }}
                >
                  {level === 2 ? "Fully secured" : "Secure account"}
                  <Icon name="chev-r" size={16} />
                </button>

                <svg key={secured} className="dog-lock" viewBox="0 0 220 240" aria-hidden="true">
                  <defs>
                    <linearGradient id={`${uid}-steel`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3a3a3a" />
                      <stop offset="22%" stopColor="#f4f4f4" />
                      <stop offset="45%" stopColor="#8d8d8d" />
                      <stop offset="70%" stopColor="#1e1e1e" />
                      <stop offset="100%" stopColor="#bdbdbd" />
                    </linearGradient>
                    <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f5f5f5" />
                      <stop offset="35%" stopColor="#a8a8a8" />
                      <stop offset="62%" stopColor="#2a2a2a" />
                      <stop offset="100%" stopColor="#c9c9c9" />
                    </linearGradient>
                  </defs>
                  <g transform="rotate(-10 110 130)">
                    <path
                      className="dog-shackle"
                      d="M62 118 V78 a48 48 0 0 1 96 0 V118"
                      fill="none"
                      stroke={`url(#${uid}-steel)`}
                      strokeWidth="24"
                      strokeLinecap="round"
                    />
                    <rect x="22" y="104" width="176" height="128" rx="34" fill={`url(#${uid}-body)`} />
                    <rect x="22" y="104" width="176" height="128" rx="34" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                    {[64, 110, 156].map((x) => (
                      <text key={x} x={x} y="196" textAnchor="middle" fontSize="44" fill="#1a1a1a" opacity="0.85">♣</text>
                    ))}
                  </g>
                </svg>
              </>
            )}
          </section>

          {/* ── trading activity ── */}
          <section className="dog-card dog-trade dog-rise" style={{ "--i": 5 } as React.CSSProperties}>
            <div className="dog-row">
              <h3 className="dog-title">Trading activity</h3>
              <button type="button" className="dog-ghost" aria-label="Expand">
                <Icon name="expand" size={20} />
              </button>
            </div>
            <div className="dog-heat" onPointerLeave={() => setHeatHover(null)}>
              {heat.map((v, i) => (
                <span
                  key={i}
                  className="dog-cell"
                  style={
                    {
                      background: HEAT_SHADES[v],
                      "--d": `${((i % HEAT_COLS) + Math.floor(i / HEAT_COLS)) * 18}ms`,
                    } as React.CSSProperties
                  }
                  onPointerEnter={() => setHeatHover(i)}
                />
              ))}
              {heatHover !== null && (
                <span
                  className="dog-heat-tip"
                  style={{
                    left: `${(((heatHover % HEAT_COLS) + 0.5) / HEAT_COLS) * 100}%`,
                    top: `${(Math.floor(heatHover / HEAT_COLS) / HEAT_ROWS) * 100}%`,
                  }}
                >
                  {heat[heatHover] * 6 + (heatHover % 5)} trades · {heatDate(heatHover)}
                </span>
              )}
            </div>
            <div className="dog-axis dog-axis--heat">
              {["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </section>

          {/* ── quick actions ── */}
          <section className="dog-card dog-quick dog-rise" style={{ "--i": 6 } as React.CSSProperties}>
            <h3 className="dog-title">Quick actions</h3>
            <div className="dog-quick-grid">
              {(
                [
                  ["Exchange", "swap"],
                  ["Tax report", "doc"],
                  ["Transfer", "send"],
                  ["Withdraw", "cash"],
                ] as [string, IconName][]
              ).map(([label, icon]) => (
                <button key={label} type="button" className="dog-quick-btn">
                  {label}
                  <Icon name={icon} size={18} />
                </button>
              ))}
            </div>
          </section>

          {/* ── top picks ── */}
          <section className="dog-card dog-picks dog-rise" style={{ "--i": 7 } as React.CSSProperties}>
            <div className="dog-row">
              <h3 className="dog-title">Top picks</h3>
              <div className="dog-picks-nav">
                <button type="button" className="dog-chip">
                  View more <Icon name="chev-r" size={15} />
                </button>
                <button type="button" className="dog-ghost" aria-label="Previous" onClick={() => scrollPicks(-1)}>
                  <Icon name="chev-l" size={18} />
                </button>
                <button type="button" className="dog-ghost" aria-label="Next" onClick={() => scrollPicks(1)}>
                  <Icon name="chev-r" size={18} />
                </button>
              </div>
            </div>
            <div ref={picksRef} className="dog-picks-track">
              {PICKS.map((p) => (
                <div key={p.ticker} className="dog-pick">
                  <span className="dog-pick-logo" style={{ background: p.bg }}>{p.name[0]}</span>
                  <span className="dog-pick-text">
                    <b>{p.name}</b>
                    <small>{p.ticker}</small>
                  </span>
                  <span className={`dog-pick-chg${p.change < 0 ? " is-down" : ""}`}>
                    {p.change > 0 ? "+" : ""}
                    {p.change}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* the dashboard runs off the bottom of the frame, into black */}
        <div className="dog-fade" />

        <nav className="dog-dock dog-rise" style={{ "--i": 9 } as React.CSSProperties}>
          {DOCK.map((d, i) => (
            <button
              key={d.label}
              type="button"
              className={`dog-dock-btn${dock === i ? " is-on" : ""}`}
              aria-label={d.label}
              onClick={() => setDock(i)}
            >
              <Icon name={d.icon} size={dock === i ? 22 : 20} />
              <span className="dog-dock-tip">{d.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

const CSS = `
.dog-root {
  --dog-card: #1b1b1b;
  --dog-line: rgba(255, 255, 255, 0.06);
  --dog-mute: rgba(255, 255, 255, 0.5);
  --dog-orange: #f2481d;
  --dog-sent: #5fdc7c;
  position: relative;
  width: 100%;
  padding: clamp(12px, 3.4vw, 46px);
  background: #9ca99f;
  color: #ffffff;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.dog-root *, .dog-root *::before, .dog-root *::after { box-sizing: border-box; }
.dog-root button { font: inherit; color: inherit; border: 0; background: none; cursor: pointer; }
.dog-root ul { list-style: none; margin: 0; padding: 0; }
.dog-root h3, .dog-root p { margin: 0; }

.dog-serif {
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.dog-frame {
  position: relative;
  max-width: 1160px;
  margin: 0 auto;
  padding: 22px 22px 0;
  border-radius: 28px;
  background: #0f0f0f;
  overflow: hidden;
  box-shadow: 0 40px 80px rgba(20, 30, 24, 0.35);
}

/* ── appear: everything rises in on a stagger once the frame is in view ── */
.dog-rise {
  opacity: 0;
  transform: translateY(26px) scale(0.985);
  transition: opacity 0.7s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i, 0) * 70ms);
}
.dog-root.is-in .dog-rise { opacity: 1; transform: none; }

/* ── header ── */
.dog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.dog-user { display: flex; align-items: center; gap: 12px; }
.dog-avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c79f7a, #6c4f3e);
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 0 0 2px #232323;
}
.dog-user-text { display: flex; flex-direction: column; line-height: 1.25; }
.dog-user-text b { font-size: 15px; font-weight: 600; }
.dog-user-text small { font-size: 12px; color: var(--dog-mute); }

.dog-head-actions { display: flex; align-items: center; gap: 10px; }
.dog-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--dog-orange) !important;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease;
}
.dog-add svg { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
.dog-add:hover { background: #ff5a2c !important; box-shadow: 0 8px 24px rgba(242, 72, 29, 0.35); transform: translateY(-1px); }
.dog-add:hover svg { transform: rotate(90deg); }

.dog-icon-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #1d1d1d !important;
  color: rgba(255, 255, 255, 0.85) !important;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.dog-icon-btn:hover { background: #2a2a2a !important; transform: translateY(-1px); }
.dog-icon-btn:hover svg { animation: dog-wiggle 0.5s ease; }
@keyframes dog-wiggle {
  0%, 100% { transform: rotate(0); }
  30% { transform: rotate(-12deg); }
  60% { transform: rotate(9deg); }
}
.dog-dot {
  position: absolute;
  top: 10px;
  right: 11px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff4b3a;
  box-shadow: 0 0 0 0 rgba(255, 75, 58, 0.6);
  animation: dog-ping 2s ease-out infinite;
}
@keyframes dog-ping {
  0% { box-shadow: 0 0 0 0 rgba(255, 75, 58, 0.6); }
  70%, 100% { box-shadow: 0 0 0 7px rgba(255, 75, 58, 0); }
}

/* ── grid ── */
.dog-grid {
  display: grid;
  grid-template-columns: 1fr 1.46fr 0.98fr;
  grid-template-rows: 266px 262px 208px;
  grid-template-areas:
    "sent perf side"
    "prot trade side"
    "quick picks side";
  gap: 14px;
}
.dog-sent { grid-area: sent; }
.dog-perf { grid-area: perf; }
.dog-side { grid-area: side; display: flex; flex-direction: column; gap: 14px; min-height: 0; }
.dog-prot { grid-area: prot; }
.dog-trade { grid-area: trade; }
.dog-quick { grid-area: quick; }
.dog-picks { grid-area: picks; }

.dog-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 18px 18px 16px;
  border-radius: 22px;
  background: linear-gradient(180deg, #1e1e1e, var(--dog-card));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.dog-title { font-size: 15.5px; font-weight: 600; letter-spacing: -0.01em; }
.dog-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

.dog-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 31px;
  padding: 0 12px;
  border-radius: 999px;
  background: #262626 !important;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}
.dog-chip:hover { background: #333333 !important; }
.dog-chip:hover svg { transform: translateX(2px); }
.dog-chip svg { transition: transform 0.2s ease; }
.dog-ghost {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.75) !important;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.dog-ghost:hover { background: #2a2a2a !important; color: #fff !important; }

/* ── market sentiment ── */
.dog-sent { padding-bottom: 0; }
.dog-sent.is-bear { --dog-sent: #f5a524; }
.dog-sent-top { position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: flex-start; }
.dog-sent-num {
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  font-size: 46px;
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}
.dog-sent-num span { font-size: 23px; color: var(--dog-mute); margin-left: 2px; font-weight: 500; }
.dog-gauge {
  position: absolute;
  left: -16%;
  bottom: -14%;
  width: 118%;
  height: auto;
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.dog-gauge:active { cursor: grabbing; }
.dog-gauge-fill { stroke: var(--dog-sent); transition: stroke 0.4s ease; }
.dog-gauge-glow { transition: opacity 0.3s ease; opacity: 0.8; }
.dog-sent:hover .dog-gauge-glow { opacity: 1; }
.dog-knob-ring { fill: var(--dog-sent); transition: fill 0.4s ease; }
.dog-knob { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dog-sent:hover .dog-knob { transform: scale(1.14); }
.dog-sent-mood {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 18px;
  z-index: 2;
  padding: 0 56px;
  text-align: center;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.9);
  pointer-events: none;
}

/* ── performance ── */
.dog-perf { display: flex; flex-direction: column; }
.dog-tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 42px);
  padding: 3px;
  border-radius: 999px;
  background: #242424;
}
.dog-tab-pill {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 42px;
  height: calc(100% - 6px);
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.dog-tab {
  position: relative;
  z-index: 1;
  height: 28px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85) !important;
  transition: color 0.3s ease;
}
.dog-tab.is-on { color: #111111 !important; }
.dog-tab:not(.is-on):hover { color: #ffffff !important; }

.dog-chart { position: relative; flex: 1; margin: 16px -18px 0; cursor: crosshair; }
.dog-chart-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(to right, var(--dog-line) 1px, transparent 1px);
  background-size: calc(100% / 9) 100%;
  pointer-events: none;
}
.dog-chart-svg { position: absolute; inset: 0; width: 100%; height: 100%; animation: dog-draw 1.1s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes dog-draw {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}
.dog-root:not(.is-in) .dog-chart-svg { animation-play-state: paused; }
/* top comes inline from the hovered point; bottom pins it to the axis */
.dog-cross {
  position: absolute;
  bottom: 0;
  width: 0;
  border-left: 1.5px dashed rgba(255, 255, 255, 0.55);
  transform: translateX(-50%);
  pointer-events: none;
  transition: left 0.12s ease-out, top 0.12s ease-out;
}
.dog-cross-dot {
  position: absolute;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.15);
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: left 0.12s ease-out, top 0.12s ease-out;
}
.dog-tip {
  position: absolute;
  transform: translate(-50%, calc(-100% - 16px));
  padding: 8px 14px;
  border-radius: 10px;
  background: #ffffff;
  color: #111111;
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  font-size: 14.5px;
  font-weight: 700;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
  transition: left 0.12s ease-out, top 0.12s ease-out;
}
.dog-tip.is-below { transform: translate(-50%, 16px); }
.dog-tip.is-below::after { top: -5px; bottom: auto; }
.dog-tip::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -5px;
  width: 10px;
  height: 10px;
  background: #ffffff;
  transform: translateX(-50%) rotate(45deg);
}
.dog-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
  color: var(--dog-mute);
}
.dog-axis span { animation: dog-fade-in 0.5s ease both; }
@keyframes dog-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

/* ── my portfolio ── */
.dog-port { flex: 0 0 auto; height: 462px; display: flex; flex-direction: column; }
.dog-port-total { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 18px; }
.dog-port-total .dog-serif { font-size: 28px; font-variant-numeric: tabular-nums; }
.dog-up {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(80, 220, 120, 0.12);
  color: #57e083;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.dog-port-chart { position: relative; height: 92px; margin: 26px 0 16px; cursor: crosshair; }
.dog-port-chart svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.dog-port-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #1b1b1b;
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: left 0.15s ease-out, top 0.15s ease-out;
}
.dog-port-read {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transform: translate(calc(-100% - 12px), -70%);
  pointer-events: none;
  white-space: nowrap;
  transition: left 0.15s ease-out, top 0.15s ease-out;
}
.dog-port-read.is-right { transform: translate(12px, -70%); }
.dog-port-read small { font-size: 11px; color: var(--dog-mute); }
.dog-port-read b { font-size: 15px; }

.dog-alloc { display: flex; gap: 4px; height: 19px; }
.dog-seg {
  flex: 0 0 auto;
  width: 0;
  border-radius: 6px;
  background: var(--c);
  cursor: pointer;
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1) var(--d), opacity 0.25s ease, transform 0.25s ease;
}
.dog-root.is-in .dog-seg { width: calc((100% - 16px) * var(--w) / 100); }
.dog-seg:hover { transform: scaleY(1.18); }
.dog-seg.is-dim { opacity: 0.28; }

.dog-legend {
  position: relative;
  flex: 1;
  min-height: 0;
  margin-top: 16px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, #000 62%, transparent);
  mask-image: linear-gradient(to bottom, #000 62%, transparent);
}
.dog-legend li {
  display: grid;
  grid-template-columns: 16px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 7px 8px;
  margin: 0 -8px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}
.dog-legend li.is-on { background: #242424; }
.dog-legend li.is-dim { opacity: 0.45; }
.dog-legend-dot { width: 10px; height: 10px; border-radius: 50%; }
.dog-legend-name { display: flex; flex-direction: column; font-size: 13.5px; line-height: 1.25; }
.dog-legend-name small { font-size: 12px; color: var(--dog-mute); }
.dog-legend-val { font-size: 17px; font-variant-numeric: tabular-nums; }

.dog-wide {
  height: 40px;
  margin-top: 6px;
  border-radius: 999px;
  background: #242424 !important;
  font-size: 13px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}
.dog-wide:hover { background: #303030 !important; }

/* ── last activity ── */
.dog-last { flex: 1; min-height: 0; }
.dog-acts { margin-top: 12px; }
.dog-acts li {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: 11px;
  padding: 8px 8px;
  margin: 0 -8px;
  border-radius: 14px;
  transition: background-color 0.2s ease, transform 0.25s ease;
}
.dog-acts li:hover { background: #242424; transform: translateX(3px); }
.dog-logo {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  font-family: "Iowan Old Style", Palatino, Georgia, serif;
  font-size: 19px;
  font-weight: 700;
}
.dog-act-name { display: flex; flex-direction: column; line-height: 1.35; min-width: 0; }
.dog-act-name b { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dog-act-name em { font-style: normal; color: var(--dog-mute); margin-left: 3px; }
.dog-act-name small { display: inline-flex; align-items: center; gap: 3px; font-size: 13px; }
.dog-act-name small.is-buy { color: #57e083; }
.dog-act-name small.is-sell { color: #ff6b5b; }
.dog-act-amt { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.35; }
.dog-act-amt b { font-size: 16px; font-variant-numeric: tabular-nums; }
.dog-act-amt small { font-size: 12px; color: var(--dog-mute); }

/* ── protect your capital ── */
.dog-prot {
  background: linear-gradient(160deg, #f4521f, #e8411a 60%, #d93812);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
  padding: 16px 18px 18px;
}
.dog-level {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.95);
}
.dog-level-dots { display: inline-flex; gap: 4px; margin-left: 4px; }
.dog-level-dots i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.75);
  transition: background-color 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dog-level-dots i.is-on { background: #ffffff; border-color: #ffffff; transform: scale(1.1); }
.dog-x {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background-color 0.2s ease, transform 0.3s ease;
}
.dog-x:hover { background: rgba(255, 255, 255, 0.16) !important; transform: rotate(90deg); }
.dog-prot-title {
  position: relative;
  z-index: 2;
  margin-top: 22px !important;
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.05;
}
.dog-prot-copy {
  position: relative;
  z-index: 2;
  max-width: 70%;
  margin-top: 9px !important;
  font-size: 12px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.92);
}
.dog-secure {
  position: absolute;
  left: 18px;
  bottom: 18px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 40px;
  padding: 0 16px 0 18px;
  border-radius: 999px;
  background: #ffffff !important;
  color: #111111 !important;
  font-size: 13px;
  font-weight: 700;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.dog-secure:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0, 0, 0, 0.25); }
.dog-secure:hover svg { transform: translateX(3px); }
.dog-secure svg { transition: transform 0.2s ease; }

.dog-lock {
  position: absolute;
  right: -20px;
  bottom: -46px;
  width: 52%;
  max-width: 230px;
  filter: drop-shadow(-10px 16px 22px rgba(0, 0, 0, 0.35));
  animation: dog-lock-snap 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes dog-lock-snap {
  0% { transform: scale(1); }
  40% { transform: scale(1.06) rotate(-2deg); }
  100% { transform: scale(1); }
}
.dog-shackle { transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dog-prot:hover .dog-shackle { transform: translateY(-14px); }

.dog-prot.is-gone { display: grid; place-items: center; }
.dog-prot-gone { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
.dog-prot-gone p { font-size: 15px; font-weight: 600; }
.dog-prot-gone button {
  height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  background: #ffffff !important;
  color: #111111 !important;
  font-size: 13px;
  font-weight: 700;
}

/* ── trading heatmap ── */
.dog-trade { display: flex; flex-direction: column; }
.dog-heat {
  position: relative;
  display: grid;
  grid-template-columns: repeat(19, 1fr);
  gap: 3px;
  margin-top: 14px;
}
.dog-cell {
  aspect-ratio: 1;
  border-radius: 5px;
  transform: scale(0.4);
  opacity: 0;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) var(--d), opacity 0.4s ease var(--d), filter 0.15s ease;
  cursor: pointer;
}
.dog-root.is-in .dog-cell { transform: scale(1); opacity: 1; }
.dog-root.is-in .dog-cell:hover {
  transform: scale(1.28);
  transition-delay: 0s;
  filter: brightness(1.35);
  z-index: 2;
  box-shadow: 0 0 0 2px #0f0f0f;
}
.dog-heat-tip {
  position: absolute;
  z-index: 3;
  transform: translate(-50%, calc(-100% - 8px));
  padding: 6px 10px;
  border-radius: 8px;
  background: #ffffff;
  color: #111111;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
}
.dog-axis--heat { margin-top: 10px; }

/* ── quick actions ── */
.dog-quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.dog-quick-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 14px;
  border-radius: 14px;
  background: #242424 !important;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.dog-quick-btn:hover { background: #2e2e2e !important; transform: translateY(-2px); }

/* ── top picks ── */
.dog-picks-nav { display: flex; align-items: center; gap: 6px; }
.dog-picks-track {
  display: flex;
  gap: 12px;
  margin-top: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.dog-picks-track::-webkit-scrollbar { display: none; }
.dog-pick {
  flex: 0 0 168px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 16px;
  background: #222222;
  scroll-snap-align: start;
  transition: background-color 0.2s ease, transform 0.25s ease;
}
.dog-pick:hover { background: #2b2b2b; transform: translateY(-2px); }
.dog-pick-logo {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: 800;
  box-shadow: inset 0 -6px 12px rgba(0, 0, 0, 0.25);
}
.dog-pick-text { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; }
.dog-pick-text b { font-size: 14px; font-weight: 600; }
.dog-pick-text small { font-size: 12px; color: var(--dog-mute); }
.dog-pick-chg { margin-left: auto; font-size: 12px; font-weight: 700; color: #57e083; }
.dog-pick-chg.is-down { color: #ff6b5b; }

/* ── fade + dock ── */
.dog-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 190px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(15, 15, 15, 0) 0%, rgba(15, 15, 15, 0.82) 48%, #0a0a0a 100%);
  -webkit-backdrop-filter: blur(0px);
  z-index: 4;
}
.dog-dock {
  position: absolute;
  left: 50%;
  bottom: 22px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  translate: -50% 0;
}
.dog-dock-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.65) !important;
  transition: color 0.2s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.25s ease, width 0.3s ease, height 0.3s ease;
}
.dog-dock-btn:hover { color: #ffffff !important; transform: translateY(-4px); }
.dog-dock-btn.is-on {
  width: 52px;
  height: 52px;
  color: #ffffff !important;
  background: #1c1c1c !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12), 0 10px 26px rgba(0, 0, 0, 0.6);
}
.dog-dock-tip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  padding: 4px 8px;
  border-radius: 6px;
  background: #ffffff;
  color: #111111;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transform: translate(-50%, 4px);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dog-dock-btn:hover .dog-dock-tip { opacity: 1; transform: translate(-50%, 0); }

/* ── tablet ── */
@media (max-width: 1100px) {
  .dog-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 270px 270px 270px auto 208px;
    grid-template-areas:
      "perf perf"
      "sent prot"
      "trade trade"
      "side side"
      "quick picks";
  }
  .dog-side { flex-direction: row; }
  .dog-side > * { flex: 1 1 0; }
  .dog-port { height: 462px; }
}

/* ── phone ── */
@media (max-width: 720px) {
  .dog-frame { padding: 16px 14px 0; border-radius: 22px; }
  .dog-head { flex-wrap: wrap; }
  .dog-add { height: 38px; padding: 0 14px; }
  .dog-icon-btn { width: 38px; height: 38px; }
  .dog-grid {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    grid-template-areas:
      "sent" "perf" "side" "prot" "trade" "quick" "picks";
    gap: 12px;
  }
  .dog-sent { height: 270px; }
  .dog-perf { height: 262px; }
  .dog-side { flex-direction: column; }
  .dog-prot { height: 270px; }
  .dog-quick, .dog-picks { height: 200px; }
  .dog-tabs { grid-template-columns: repeat(5, 36px); }
  .dog-tab-pill { width: 36px; }
  .dog-perf .dog-row { flex-wrap: wrap; }
  .dog-prot-copy { max-width: 70%; }
  .dog-heat { gap: 3px; }
  .dog-dock-btn { width: 38px; height: 38px; }
  .dog-dock-btn.is-on { width: 48px; height: 48px; }
}

@media (prefers-reduced-motion: reduce) {
  .dog-rise, .dog-cell, .dog-seg { transition: none; }
  .dog-chart-svg, .dog-lock, .dog-dot { animation: none; }
}
`
