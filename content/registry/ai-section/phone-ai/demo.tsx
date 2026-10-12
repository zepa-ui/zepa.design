"use client"

import { useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   phone-ai — AI productivity hero with orbiting
   integrations and a live phone feed

   · Navbar with dropdown chevrons, a NEW badge and
     Sign in / Contact.
   · Ratings row, headline, sub copy and two CTAs
     that rise in on a stagger.
   · Three concentric rings slowly rotate, carrying
     integration bubbles that stay upright. Hover a
     bubble to pause its ring and see its name; the
     whole system tilts gently with the cursor.
   · A phone rises from the bottom with a live
     activity feed — a new notification slides in
     every few seconds and the stack reflows. Click
     a notification to mark it read.
   · A "trusted by" strip that scrolls on hover.

   No dependencies — CSS animation and a little
   state. Phone frame from pop-hero.
   ───────────────────────────────────────────── */

const LOGO = "https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"
const PHONE_FRAME = "https://res.cloudinary.com/dzvffb6vv/image/upload/v1784552915/x2_fhg2ot.avif"

type Glyph = { name: string; bg: string; fg: string; shape: "hash" | "spark" | "loop" | "bolt" | "stack" | "wave" | "flag" | "orbit" | "grid" | "leaf" | "drop" | "chev" }

/* abstract integration glyphs — positioned on rings by angle */
const RINGS: { r: number; dur: number; items: { a: number; g: Glyph }[] }[] = [
  {
    r: 250,
    dur: 90,
    items: [
      { a: 200, g: { name: "Chatline", bg: "#fff", fg: "#4a154b", shape: "hash" } },
      { a: 335, g: { name: "Flowline", bg: "#fff", fg: "#2f6bff", shape: "stack" } },
    ],
  },
  {
    r: 390,
    dur: 130,
    items: [
      { a: 152, g: { name: "Brightspark", bg: "#fff", fg: "#4285f4", shape: "spark" } },
      { a: 205, g: { name: "Loopmeta", bg: "#fff", fg: "#0866ff", shape: "loop" } },
      { a: 228, g: { name: "Adbeam", bg: "#fff", fg: "#fbbc04", shape: "chev" } },
      { a: 318, g: { name: "Cloudstack", bg: "#fff", fg: "#ff9900", shape: "wave" } },
      { a: 340, g: { name: "Taskring", bg: "#fff", fg: "#7b68ee", shape: "orbit" } },
      { a: 95, g: { name: "Paybolt", bg: "#635bff", fg: "#fff", shape: "bolt" } },
    ],
  },
  {
    r: 540,
    dur: 170,
    items: [
      { a: 172, g: { name: "Mailmonkey", bg: "#ffe01b", fg: "#241c15", shape: "leaf" } },
      { a: 245, g: { name: "Zaplink", bg: "#fff", fg: "#ff4f00", shape: "bolt" } },
      { a: 305, g: { name: "Tablebase", bg: "#fff", fg: "#18bfff", shape: "grid" } },
      { a: 20, g: { name: "Dropspace", bg: "#fff", fg: "#0061ff", shape: "drop" } },
      { a: 120, g: { name: "Calendo", bg: "#fff", fg: "#e11d48", shape: "leaf" } },
    ],
  },
]

function GlyphIcon({ g }: { g: Glyph }) {
  const c = g.fg
  const p = { fill: "none", stroke: c, strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  switch (g.shape) {
    case "hash":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M9 4v16M15 4v16" {...p} stroke="#36c5f0" />
          <path d="M4 9h16M4 15h16" {...p} stroke="#e01e5a" />
        </svg>
      )
    case "spark":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 2v20M2 12h20" {...p} stroke="#4285f4" />
          <path d="M5 5l14 14" {...p} stroke="#ea4335" />
          <path d="M19 5 5 19" {...p} stroke="#34a853" />
        </svg>
      )
    case "loop":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M3 15c0-5 2.5-8 5-8s4 3 4 5 1.5 5 4 5 5-3 5-6-1.5-4-3.5-4-4.5 3-5.5 5-3 5-5 5-4-1-4-2z" {...p} strokeWidth={2.2} />
        </svg>
      )
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19" {...p} strokeWidth={3} />
        </svg>
      )
    case "stack":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M7 5h12M5 12h12M7 19h8" {...p} strokeWidth={3.4} />
        </svg>
      )
    case "wave":
      return (
        <svg viewBox="0 0 28 24" width="22" height="18">
          <text x="14" y="13" textAnchor="middle" fontSize="10" fontWeight="700" fill="#232f3e" fontFamily="Arial, sans-serif">cs</text>
          <path d="M5 17c6 3 12 3 18 0" {...p} strokeWidth={2} />
        </svg>
      )
    case "orbit":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M5 15l7-5 7 5" {...p} strokeWidth={3} stroke="#ff02f0" />
          <path d="M5 9l7-5 7 5" {...p} strokeWidth={3} stroke="#7b68ee" />
        </svg>
      )
    case "grid":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 3l9 4-9 4-9-4z" fill="#fcb400" />
          <path d="M13 13l8-3.5V18l-8 3.5z" fill="#18bfff" />
          <path d="M3 10l8 3.5v8L3 18z" fill="#f82b60" />
        </svg>
      )
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <circle cx="12" cy="12" r="7" fill="none" stroke={c} strokeWidth="2.4" />
          <circle cx="10" cy="11" r="1.4" fill={c} />
          <circle cx="14.5" cy="11" r="1.4" fill={c} />
          <path d="M9.5 14.5q2.5 2 5 0" {...p} strokeWidth={1.8} />
        </svg>
      )
    case "drop":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M7 4l5 3-5 3-5-3zM17 4l5 3-5 3-5-3zM7 11l5 3-5 3-5-3zM17 11l5 3-5 3-5-3z" fill={c} />
        </svg>
      )
    case "chev":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M4 19 11 6" {...p} strokeWidth={4.2} stroke="#fbbc04" />
          <path d="M13 6l7 13" {...p} strokeWidth={4.2} stroke="#4285f4" />
          <circle cx="5" cy="18" r="2.6" fill="#34a853" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <circle cx="12" cy="12" r="7" fill={c} />
        </svg>
      )
  }
}

type Note = { id: number; who: string; role: string; action: string; target: string; time: string; tone: string; read?: boolean }

const FEED: Omit<Note, "id">[] = [
  { who: "Wei Chen", role: "Grixcreative Dribbble", action: "joined to", target: "Final Presentation", time: "5 min ago", tone: "#f4b19b" },
  { who: "Matthew Johnson", role: "Content Writer", action: "commented on", target: "Q4 Roadmap", time: "8 min ago", tone: "#b9d4a8" },
  { who: "Terry Lipshutz", role: "Approved the design of the iOS app", action: "approved", target: "iOS app", time: "12 min ago", tone: "#f3d7a6" },
  { who: "Ana Ruiz", role: "Product Lead", action: "assigned you", target: "Launch Checklist", time: "just now", tone: "#c8c2f2" },
  { who: "Kofi Mensah", role: "Engineering", action: "completed", target: "API Migration", time: "just now", tone: "#a9d6e5" },
  { who: "Lena Fischer", role: "Design", action: "shared", target: "Brand Kit v2", time: "just now", tone: "#f2b8c6" },
]

const TRUST = ["Northwind", "airloop", "coinbay", "Notely", "gumtree", "PayLine", "upshift", "shopnest", "stripe-y", "zoomly"]

const CSS = `
.ph-wrap { container-type: inline-size; box-sizing: border-box; width: 100%; background: #f4f4f6; padding: 24px 24px 40px; font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; color: #0d0d12; -webkit-font-smoothing: antialiased; }
.ph-wrap *, .ph-wrap *::before, .ph-wrap *::after { box-sizing: border-box; }
.ph-wrap button { font: inherit; cursor: pointer; }
.ph-card { position: relative; max-width: 1280px; margin: 0 auto; background: #fff; border-radius: 28px; overflow: hidden; box-shadow: 0 1px 2px rgba(16,16,24,.04), 0 30px 60px -40px rgba(16,16,24,.15); }

/* nav */
.ph-nav { position: relative; z-index: 6; display: flex; align-items: center; justify-content: space-between; padding: 12px 32px; margin: 0 48px; border-bottom: 1px solid #f0f0f3; }
.ph-brand img { height: 34px; width: auto; display: block; }
.ph-links { display: flex; gap: 6px; }
.ph-links button { display: flex; align-items: center; gap: 5px; border: 0; background: none; color: #3b3b45; font-size: 14px; padding: 7px 12px; border-radius: 8px; transition: background .2s, color .2s; }
.ph-links button:hover { background: #f4f4f6; color: #0d0d12; }
.ph-links svg { transition: transform .25s; }
.ph-links button:hover svg { transform: rotate(180deg); }
.ph-new { font-size: 9px; font-weight: 700; letter-spacing: .04em; color: #4f46e5; background: #eef0ff; border: 1px solid #d9dcff; border-radius: 5px; padding: 1px 5px; }
.ph-acts { display: flex; gap: 8px; }
.ph-ghost, .ph-dark { border-radius: 9px; padding: 8px 16px; font-size: 14px; font-weight: 500; transition: transform .2s, background .2s, box-shadow .2s; }
.ph-ghost { border: 0; background: #f2f2f5; color: #0d0d12; }
.ph-ghost:hover { background: #e8e8ee; }
.ph-dark { border: 0; background: #0d0d12; color: #fff; }
.ph-dark:hover { transform: translateY(-1px); box-shadow: 0 8px 18px -8px rgba(13,13,18,.6); }

/* stage */
.ph-stage { position: relative; overflow: hidden; padding-bottom: 36px; }
.ph-orbits { position: absolute; left: 50%; top: 520px; width: 0; height: 0; transition: transform .6s cubic-bezier(.2,.8,.2,1); }
.ph-ring { position: absolute; left: 0; top: 0; border-radius: 50%; border: 1px solid #ececf2; background: radial-gradient(circle, transparent 62%, rgba(236,236,245,.55) 100%); transform: translate(-50%,-50%) scale(.9); opacity: 0; animation: ph-ring 1.2s cubic-bezier(.2,.8,.2,1) forwards; animation-delay: var(--d); }
@keyframes ph-ring { to { opacity: 1; transform: translate(-50%,-50%) scale(1) } }
.ph-ring::after { content: ""; position: absolute; inset: -1px; border-radius: 50%; border: 1px solid transparent; border-top-color: rgba(79,70,229,.35); border-left-color: rgba(79,70,229,.12); animation: ph-spin calc(var(--dur) * .25s) linear infinite; }
.ph-spinner { position: absolute; left: 0; top: 0; width: 0; height: 0; animation: ph-spin calc(var(--dur) * 1s) linear infinite; }
.ph-spinner[data-paused="true"], .ph-spinner[data-paused="true"] .ph-upright { animation-play-state: paused; }
@keyframes ph-spin { to { transform: rotate(360deg) } }
.ph-slot { position: absolute; left: 0; top: 0; transform: rotate(var(--a)) translateX(var(--r)); }
.ph-tilt { transform: rotate(calc(var(--a) * -1)); }
.ph-upright { animation: ph-spin calc(var(--dur) * 1s) linear infinite reverse; }
.ph-bubble { position: relative; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%; border: 0; display: grid; place-items: center; box-shadow: 0 1px 2px rgba(16,16,24,.06), 0 8px 20px -8px rgba(16,16,24,.25); transform: scale(0); animation: ph-pop .6s cubic-bezier(.3,1.6,.5,1) forwards; animation-delay: var(--bd); transition: box-shadow .25s; }
@keyframes ph-pop { to { transform: scale(1) } }
.ph-bubble:hover { box-shadow: 0 0 0 6px rgba(79,70,229,.08), 0 14px 26px -10px rgba(16,16,24,.35); }
.ph-bubble:hover svg { transform: scale(1.15); }
.ph-bubble svg { transition: transform .25s cubic-bezier(.3,1.6,.5,1); }
.ph-tip { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); white-space: nowrap; background: #0d0d12; color: #fff; font-size: 11px; font-weight: 500; padding: 4px 8px; border-radius: 6px; pointer-events: none; animation: ph-fade .2s ease both; }
@keyframes ph-fade { from { opacity: 0; transform: translate(-50%, 4px) } to { opacity: 1; transform: translate(-50%, 0) } }

/* copy */
.ph-copy { position: relative; z-index: 4; text-align: center; padding-top: 36px; }
.ph-copy > * { opacity: 0; transform: translateY(16px); animation: ph-rise .8s cubic-bezier(.2,.8,.2,1) forwards; }
.ph-copy > *:nth-child(1) { animation-delay: .1s } .ph-copy > *:nth-child(2) { animation-delay: .2s } .ph-copy > *:nth-child(3) { animation-delay: .3s } .ph-copy > *:nth-child(4) { animation-delay: .4s }
@keyframes ph-rise { to { opacity: 1; transform: none } }
.ph-rates { display: inline-flex; gap: 22px; font-size: 13px; color: #6b6b76; }
.ph-rates span { display: inline-flex; align-items: center; gap: 6px; }
.ph-rates b { color: #0d0d12; font-weight: 500; }
.ph-h1 { margin: 22px auto 0; font-size: clamp(38px, 5.2vw, 60px); line-height: 1.08; letter-spacing: -.035em; font-weight: 600; max-width: 640px; }
.ph-sub { margin: 18px auto 0; max-width: 420px; font-size: 15px; line-height: 1.6; color: #6b6b76; }
.ph-ctas { margin-top: 30px; display: flex; gap: 10px; justify-content: center; }
.ph-ctas .ph-dark, .ph-ctas .ph-out { padding: 11px 20px; font-size: 14px; }
.ph-out { border: 1px solid #e6e6ec; background: #fff; border-radius: 9px; color: #0d0d12; font-weight: 500; transition: border-color .2s, transform .2s; }
.ph-out:hover { border-color: #c9c9d4; transform: translateY(-1px); }
.ph-arrow { display: inline-block; transition: transform .25s; margin-left: 4px; }
.ph-dark:hover .ph-arrow { transform: translateX(3px); }

/* phone */
.ph-lift { position: relative; z-index: 3; width: 270px; margin: 40px auto 0; will-change: transform; }
.ph-phone { position: relative; transform: translateY(80px); opacity: 0; animation: ph-rise 1.3s cubic-bezier(.16,1,.3,1) .45s forwards; }
.ph-phone::before { content: ""; position: absolute; left: -40%; right: -40%; top: -20%; height: 70%; background: radial-gradient(closest-side, rgba(99,102,241,.16), transparent); z-index: -1; filter: blur(10px); }
.ph-screen { position: absolute; inset: 1.6% 4.6% 1.6% 4.6%; border-radius: 38px; background: linear-gradient(#f7f8fb, #eef0f6); overflow: hidden; }
.ph-frame { position: relative; z-index: 2; width: 100%; height: auto; display: block; pointer-events: none; }
.ph-feed { position: absolute; left: 8%; right: 8%; top: 62px; z-index: 3; }
.ph-feed-h { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #8b8b96; margin: 0 2px 8px; }
.ph-live { display: inline-flex; align-items: center; gap: 5px; color: #16a34a; font-weight: 600; }
.ph-live i { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: ph-blink 1.4s infinite; }
@keyframes ph-blink { 50% { opacity: .3 } }
.ph-note { display: flex; gap: 9px; align-items: flex-start; width: 100%; text-align: left; border: 1px solid #ececf2; background: #fff; border-radius: 12px; padding: 9px 10px; margin-bottom: 8px; box-shadow: 0 10px 24px -16px rgba(16,16,24,.35); animation: ph-in .55s cubic-bezier(.3,1.3,.5,1) both; transition: transform .25s, opacity .25s, box-shadow .25s; }
.ph-note:hover { transform: translateY(-2px) scale(1.015); box-shadow: 0 16px 30px -16px rgba(16,16,24,.45); }
.ph-note[data-read="true"] { opacity: .55; }
.ph-note:nth-child(3) { transform: scale(.96); }
.ph-note:nth-child(4) { transform: scale(.92); opacity: .6; }
@keyframes ph-in { from { opacity: 0; transform: translateY(-16px) scale(.94) } to { opacity: 1; transform: none } }
.ph-face { position: relative; flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 600; color: #3b2a20; }
.ph-face b { position: absolute; right: -2px; bottom: -2px; width: 11px; height: 11px; border-radius: 50%; background: #4f46e5; border: 2px solid #fff; }
.ph-nt { min-width: 0; flex: 1; font-size: 11.5px; line-height: 1.4; color: #3b3b45; }
.ph-nt strong { color: #0d0d12; font-weight: 600; }
.ph-nt small { display: block; color: #9a9aa5; font-size: 10.5px; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ph-dots { color: #b0b0ba; font-size: 14px; line-height: 1; }

/* trust */
.ph-trust { position: relative; z-index: 5; background: #fff; padding: 18px 0 34px; text-align: center; }
.ph-trust p { margin: 0 0 18px; font-size: 12px; color: #8b8b96; }
.ph-marquee { overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
.ph-track { display: flex; gap: 52px; width: max-content; animation: ph-marq 30s linear infinite; animation-play-state: paused; }
.ph-marquee:hover .ph-track { animation-play-state: running; }
@keyframes ph-marq { to { transform: translateX(-50%) } }
.ph-track span { font-size: 17px; font-weight: 700; letter-spacing: -.02em; color: #55555f; opacity: .8; transition: color .2s, opacity .2s; }
.ph-track span:hover { color: #0d0d12; opacity: 1; }
.ph-track span:nth-child(3n) { font-family: Georgia, serif; font-weight: 600; }
.ph-track span:nth-child(4n) { font-style: italic; }

@container (max-width: 900px) {
  .ph-links { display: none; }
  .ph-nav { margin: 0 16px; padding: 18px 8px; }
}
@container (max-width: 640px) {
  .ph-card { border-radius: 20px; margin: -12px -12px 0; }
  .ph-orbits { transform: scale(.7) !important; top: 500px; }
  .ph-copy { padding: 40px 18px 0; }
  .ph-ctas { flex-direction: column; align-items: center; }
  .ph-lift { width: 240px; }
  .ph-feed { top: 54px; }
  .ph-ghost { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ph-wrap *, .ph-wrap *::before, .ph-wrap *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; animation-delay: 0ms !important; transition: none !important; }
}
`

const Chevron = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3.5 5 6.5 8 3.5" />
  </svg>
)

export default function PhoneAI() {
  const [hover, setHover] = useState<string | null>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [notes, setNotes] = useState<Note[]>(() => FEED.slice(0, 3).map((n, i) => ({ ...n, id: i })))
  const next = useRef(3)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [lift, setLift] = useState(70)

  // the phone rises into full view as the section scrolls up
  useEffect(() => {
    const onScroll = () => {
      const el = stageRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const vh = document.documentElement.clientHeight || 800
      const p = Math.min(1, Math.max(0, (vh - r.bottom + r.height * 0.55) / (r.height * 0.6)))
      setLift(Math.round(70 * (1 - p)))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  // a new notification arrives every few seconds
  useEffect(() => {
    const t = window.setInterval(() => {
      const n = FEED[next.current % FEED.length]
      const id = next.current++
      setNotes((list) => [{ ...n, id, time: "just now" }, ...list].slice(0, 4))
    }, 3200)
    return () => window.clearInterval(t)
  }, [])

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 })
  }

  let bubbleIndex = 0

  return (
    <section className="ph-wrap">
      <style>{CSS}</style>
      <div className="ph-card">
        <nav className="ph-nav">
          <a className="ph-brand" href="#" onClick={(e) => e.preventDefault()} aria-label="Zepa home">
            <img src={LOGO} alt="Zepa" />
          </a>
          <div className="ph-links">
            <button type="button">Products</button>
            <button type="button">Solutions <Chevron /></button>
            <button type="button">Services <span className="ph-new">NEW</span></button>
            <button type="button">Pricing</button>
            <button type="button">Insight</button>
          </div>
          <div className="ph-acts">
            <button type="button" className="ph-ghost">Sign in</button>
            <button type="button" className="ph-dark">Contact</button>
          </div>
        </nav>

        <div className="ph-stage" ref={stageRef} onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
          <div className="ph-orbits" style={{ transform: `translate(${tilt.x * -18}px, ${tilt.y * -12}px)` }} aria-hidden={false}>
            {RINGS.map((ring, ri) => {
              const paused = ring.items.some((it) => it.g.name === hover)
              return (
                <div key={ring.r}>
                  <span className="ph-ring" style={{ width: ring.r * 2, height: ring.r * 2, ["--d" as string]: `${ri * 120}ms`, ["--dur" as string]: ring.dur }} />
                  <div className="ph-spinner" data-paused={paused} style={{ ["--dur" as string]: ring.dur }}>
                    {ring.items.map((it) => {
                      const bd = 500 + bubbleIndex++ * 70
                      return (
                        <div key={it.g.name} className="ph-slot" style={{ ["--a" as string]: `${it.a}deg`, ["--r" as string]: `${ring.r}px` }}>
                          <div className="ph-tilt" style={{ ["--a" as string]: `${it.a}deg` }}>
                            <div className="ph-upright" data-paused={paused} style={{ ["--dur" as string]: ring.dur, animationPlayState: paused ? "paused" : undefined }}>
                              <button
                                type="button"
                                className="ph-bubble"
                                aria-label={it.g.name}
                                style={{ background: it.g.bg, ["--bd" as string]: `${bd}ms` }}
                                onMouseEnter={() => setHover(it.g.name)}
                                onMouseLeave={() => setHover(null)}
                                onFocus={() => setHover(it.g.name)}
                                onBlur={() => setHover(null)}
                              >
                                <GlyphIcon g={it.g} />
                                {hover === it.g.name && <span className="ph-tip">{it.g.name}</span>}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="ph-copy">
            <div className="ph-rates">
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285f4" /><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34a853" /><path d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z" fill="#fbbc04" /><path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6z" fill="#ea4335" /></svg>
                <b>4.6</b> Google
              </span>
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24"><path d="M12 2l2.9 6.9L22 9.3l-5.5 4.8L18.2 22 12 17.8 5.8 22l1.7-7.9L2 9.3l7.1-.4z" fill="#00b67a" /></svg>
                <b>4.9</b> Trustpilot
              </span>
            </div>
            <h1 className="ph-h1">AI-powered tools to stay organized</h1>
            <p className="ph-sub">From small tasks to complex projects, manage everything in one place and keep your team moving forward.</p>
            <div className="ph-ctas">
              <button type="button" className="ph-dark">Get started free<span className="ph-arrow">→</span></button>
              <button type="button" className="ph-out">Talk to sales team</button>
            </div>
          </div>

          <div className="ph-lift" style={{ transform: `translateY(${lift}px)` }}>
          <div className="ph-phone">
            <div className="ph-screen" />
            <img className="ph-frame" src={PHONE_FRAME} alt="" />
            <div className="ph-feed" aria-live="polite">
              <div className="ph-feed-h">
                <span>Activity</span>
                <span className="ph-live"><i />Live</span>
              </div>
              {notes.map((n, i) => (
                <button
                  key={n.id}
                  type="button"
                  className="ph-note"
                  data-read={!!n.read}
                  onClick={() => setNotes((list) => list.map((x) => (x.id === n.id ? { ...x, read: !x.read } : x)))}
                >
                  <span className="ph-face" style={{ background: n.tone }}>
                    {n.who.split(" ").map((w) => w[0]).join("")}
                    {i === 0 && !n.read && <b />}
                  </span>
                  <span className="ph-nt">
                    <strong>{n.who}</strong> {n.action} <strong>{n.target}</strong>
                    <small>{n.time} · {n.role}</small>
                  </span>
                  <span className="ph-dots">⋮</span>
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>

        <div className="ph-trust">
          <p>Trusted by 200,000+ users worldwide</p>
          <div className="ph-marquee">
            <div className="ph-track">
              {[...TRUST, ...TRUST].map((t, i) => <span key={i}>{t}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
