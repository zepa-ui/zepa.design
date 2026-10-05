"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   tuple-grid — interactive pairing-features bento

   · Crisp audio and video — a quality picker. Hover
     a row to preview it, click to select; the
     highlight pill glides to the chosen row.
   · End-to-end encryption — packets stream between
     two monitors through a padlock. Hover lifts the
     shackle; click unlocks it and the packets turn
     to scrambled noise until you lock it again.
   · Seamless collaboration — a live call window with
     four looping video tiles. The active speaker
     rotates, tiles lift on hover, and the toolbar
     works: mute, camera off, and leave / rejoin.
   · One click to swap — toggle mic and camera, and
     the share button flips the shared screen
     between you and your pair.

   Everything rises in on a stagger when the section
   scrolls into view. No dependencies.
   ───────────────────────────────────────────── */

const VIDEOS = [
  {
    name: "Alex",
    src: "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/110_bnaecb.mp4",
  },
  {
    name: "Maya",
    src: "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/111_ltcvxx.mp4",
  },
  {
    name: "Jun",
    src: "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/109_jc84sb.mp4",
  },
  {
    name: "Ravi",
    src: "https://res.cloudinary.com/dzvffb6vv/video/upload/v1781974779/samples/sea-turtle.mp4",
  },
] as const

const QUALITIES = [
  { label: "Maximum", detail: "5K" },
  { label: "Very High", detail: "4K" },
  { label: "High", detail: '15" Retina' },
  { label: "Balanced", detail: "1080p" },
] as const

const CSS = `
.tg-root {
  --tg-green: #22b14c;
  --tg-green-d: #1a9a40;
  --tg-ink: #232326;
  --tg-mute: #6b6b70;
  --tg-card: #f8f8f8;
  --tg-line: #ececec;
  box-sizing: border-box;
  width: 100%;
  background: #ffffff;
  color: var(--tg-ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  padding: 56px 24px 68px;
  -webkit-font-smoothing: antialiased;
}
.tg-root *, .tg-root *::before, .tg-root *::after { box-sizing: border-box; }

.tg-head { text-align: center; max-width: 720px; margin: 0 auto 46px; }
.tg-eyebrow {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 13px; letter-spacing: .22em; color: var(--tg-green);
  margin: 0 0 14px;
}
.tg-title {
  font-size: clamp(28px, 4vw, 44px); line-height: 1.08;
  letter-spacing: -.025em; font-weight: 650; margin: 0 0 18px;
}
.tg-sub { font-size: 16px; line-height: 1.6; color: var(--tg-mute); margin: 0; }

/* appear */
.tg-rise {
  opacity: 0; transform: translateY(22px) scale(.985);
  transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1);
  transition-delay: var(--tg-d, 0ms);
}
.tg-in .tg-rise { opacity: 1; transform: none; }

.tg-grid {
  max-width: 990px; margin: 0 auto;
  display: grid; gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.tg-card {
  background: var(--tg-card); border-radius: 14px;
  padding: 26px 26px 0; overflow: hidden; position: relative;
  transition: box-shadow .35s ease, transform .35s ease, background .35s ease;
}
.tg-card:hover { background: #f5f5f5; box-shadow: 0 1px 0 var(--tg-line), 0 18px 40px -24px rgba(0,0,0,.18); }
.tg-tall { grid-row: span 2; display: flex; flex-direction: column; }
.tg-wide { grid-column: span 2; display: grid; grid-template-columns: 1fr 1.08fr; gap: 28px; padding-bottom: 30px; }
.tg-h { color: var(--tg-green); font-weight: 600; font-size: 15px; margin: 0 0 10px; }
.tg-p { color: var(--tg-mute); font-size: 14px; line-height: 1.68; margin: 0; }

/* ── quality picker ── */
.tg-q {
  position: relative; margin: 34px 0 0; padding: 7px;
  background: #fff; border-radius: 14px 14px 0 0;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,.12);
  -webkit-mask-image: linear-gradient(#000 55%, transparent 100%);
          mask-image: linear-gradient(#000 55%, transparent 100%);
}
.tg-q-pill {
  position: absolute; left: 7px; right: 7px; top: 7px; height: 48px;
  background: #f1f1f2; border-radius: 9px;
  transition: transform .45s cubic-bezier(.3,1.3,.5,1);
}
.tg-q-row {
  position: relative; display: flex; align-items: center; gap: 14px;
  width: 100%; height: 48px; padding: 0 12px; border: 0; background: none;
  font: inherit; font-size: 18px; color: var(--tg-ink); cursor: pointer;
  text-align: left; border-radius: 9px; transition: color .2s, opacity .3s;
}
.tg-q-row .tg-q-d { color: #b9b9be; transition: color .25s; }
.tg-q-row[data-on="true"] .tg-q-d { color: var(--tg-ink); }
.tg-q-row[data-on="false"] { color: #8d8d92; }
.tg-q-row:hover { color: var(--tg-ink); }
.tg-q-row:hover .tg-q-d { color: var(--tg-green); }
.tg-q-ic { flex: none; transition: transform .3s; }
.tg-q-row:hover .tg-q-ic { transform: scale(1.1) rotate(-4deg); }

/* ── encryption ── */
.tg-enc {
  display: flex; align-items: center; justify-content: space-between;
  margin: 44px 0 34px; gap: 6px; cursor: pointer; user-select: none;
}
.tg-mon { flex: none; transition: transform .35s; }
.tg-enc:hover .tg-mon:first-child { transform: translateX(-3px); }
.tg-enc:hover .tg-mon:last-child { transform: translateX(3px); }
.tg-wire { position: relative; flex: 1; height: 2px; background: #dedee0; overflow: visible; }
.tg-pkt {
  position: absolute; top: -3px; width: 8px; height: 8px; border-radius: 2px;
  background: var(--tg-green); opacity: 0;
  animation: tg-flow 1.8s linear infinite;
  animation-delay: var(--tg-pd, 0s);
}
.tg-wire-r .tg-pkt { animation-name: tg-flow-r; }
.tg-unlocked .tg-pkt { background: #e5484d; border-radius: 50%; animation-duration: 1.1s; }
@keyframes tg-flow { 0% { left: 0; opacity: 0 } 15% { opacity: 1 } 85% { opacity: 1 } 100% { left: calc(100% - 8px); opacity: 0 } }
@keyframes tg-flow-r { 0% { left: 0; opacity: 0 } 15% { opacity: 1 } 85% { opacity: 1 } 100% { left: calc(100% - 8px); opacity: 0 } }
.tg-lock {
  flex: none; width: 78px; height: 78px; border-radius: 50%;
  background: #eeeeef; border: 1px solid #e2e2e4;
  display: grid; place-items: center; position: relative;
  transition: transform .35s cubic-bezier(.3,1.4,.5,1), background .3s, box-shadow .3s;
}
.tg-enc:hover .tg-lock { transform: scale(1.06); box-shadow: 0 0 0 8px rgba(34,177,76,.08); }
.tg-unlocked .tg-lock { background: #fdeeee; border-color: #f6d4d5; }
.tg-enc:hover.tg-unlocked .tg-lock { box-shadow: 0 0 0 8px rgba(229,72,77,.08); }
.tg-shackle { transition: transform .4s cubic-bezier(.3,1.4,.5,1); transform-origin: 70% 100%; }
.tg-enc:hover .tg-shackle { transform: translateY(-3px); }
.tg-unlocked .tg-shackle { transform: translateY(-5px) rotate(-28deg); }
.tg-enc-cap {
  text-align: center; font-size: 12px; color: var(--tg-mute); margin: -16px 0 30px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace; letter-spacing: .04em;
  transition: color .3s;
}
.tg-unlocked + .tg-enc-cap { color: #e5484d; }

/* ── call window ── */
.tg-call {
  margin: 40px 4px 30px; background: #6c6c72; border-radius: 12px;
  box-shadow: 0 24px 50px -22px rgba(0,0,0,.45);
  flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative;
  min-height: 380px;
}
.tg-bar { display: flex; align-items: center; gap: 6px; padding: 10px 12px; }
.tg-dot { width: 11px; height: 11px; border-radius: 50%; }
.tg-tools { display: flex; gap: 5px; margin: 0 auto 0 14px; }
.tg-tb {
  width: 30px; height: 24px; border-radius: 6px; border: 0; cursor: pointer;
  display: grid; place-items: center; color: #fff; background: #8a8a90;
  transition: background .2s, transform .2s;
}
.tg-tb:hover { transform: translateY(-1px); filter: brightness(1.08); }
.tg-tb:active { transform: scale(.92); }
.tg-tb[data-tone="green"] { background: var(--tg-green); }
.tg-tb[data-tone="red"] { background: #e5484d; }
.tg-more { color: #e8e8ea; display: flex; gap: 10px; align-items: center; }
.tg-tiles {
  display: grid; gap: 8px; padding: 4px 8px 8px; flex: 1;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr auto;
  grid-template-areas: "big big big" "s0 s1 s2";
}
.tg-tile {
  position: relative; border-radius: 9px; overflow: hidden; cursor: pointer;
  background: #49494e; box-shadow: 0 0 0 1px rgba(255,255,255,.18);
  transition: transform .35s cubic-bezier(.3,1.3,.5,1), box-shadow .35s;
  transform: scale(.9); opacity: 0; min-height: 0;
}
.tg-tile[data-big="false"] { aspect-ratio: 1; }
.tg-tile[data-big="true"] { animation: tg-spot .5s cubic-bezier(.3,1.2,.5,1); }
.tg-tile::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,.45));
}
@keyframes tg-spot { from { opacity: .3; transform: scale(.96) } to { opacity: 1; transform: none } }
.tg-in .tg-tile { transform: none; opacity: 1; transition-delay: var(--tg-td, 0ms); }
.tg-in .tg-tile[data-big="false"]:hover { transform: translateY(-3px); z-index: 2; transition-delay: 0ms; box-shadow: 0 0 0 1.5px rgba(255,255,255,.7); }
.tg-pin {
  position: absolute; top: 8px; right: 8px; z-index: 2; font-size: 10px; font-weight: 600;
  color: #fff; background: rgba(0,0,0,.4); backdrop-filter: blur(6px); padding: 3px 8px; border-radius: 99px;
}
.tg-tile[data-speak="true"] { box-shadow: 0 0 0 2.5px var(--tg-green), 0 0 24px -4px rgba(34,177,76,.7); }
.tg-tile video { width: 100%; height: 100%; object-fit: cover; display: block; }
.tg-tag {
  position: absolute; left: 7px; bottom: 7px; display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 500; color: #fff; padding: 3px 7px; border-radius: 6px;
  background: rgba(0,0,0,.45); backdrop-filter: blur(6px);
  opacity: 0; transform: translateY(4px); transition: opacity .25s, transform .25s;
}
.tg-tag { z-index: 1; }
.tg-tile:hover .tg-tag, .tg-tile[data-big="true"] .tg-tag, .tg-tile[data-speak="true"] .tg-tag, .tg-tile[data-muted="true"] .tg-tag { opacity: 1; transform: none; }
.tg-eq { display: flex; gap: 1.5px; align-items: flex-end; height: 9px; }
.tg-eq i { width: 2px; background: var(--tg-green); border-radius: 1px; animation: tg-eq .7s ease-in-out infinite alternate; }
.tg-eq i:nth-child(2) { animation-delay: .2s } .tg-eq i:nth-child(3) { animation-delay: .4s }
@keyframes tg-eq { from { height: 2px } to { height: 9px } }
.tg-off {
  position: absolute; inset: 0; display: grid; place-items: center; background: #3d3d42;
  animation: tg-fade .3s ease;
}
.tg-av {
  width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg,#7b61ff,#e255a1);
  display: grid; place-items: center; color: #fff; font-weight: 600; font-size: 20px;
}
@keyframes tg-fade { from { opacity: 0 } to { opacity: 1 } }
.tg-left {
  position: absolute; inset: 44px 0 0; display: grid; place-items: center; text-align: center;
  background: rgba(60,60,66,.92); backdrop-filter: blur(8px); color: #fff; animation: tg-fade .35s ease;
}
.tg-left p { margin: 0 0 14px; font-size: 15px; }
.tg-btn {
  border: 0; cursor: pointer; font: inherit; font-size: 13px; font-weight: 600;
  padding: 9px 16px; border-radius: 8px; background: var(--tg-green); color: #fff;
  transition: transform .2s, background .2s;
}
.tg-btn:hover { background: var(--tg-green-d); transform: translateY(-1px); }

/* ── swap ── */
.tg-ctl { display: flex; gap: 14px; margin-top: 52px; }
.tg-cb {
  flex: 1; height: 58px; border-radius: 10px; border: 0; cursor: pointer;
  background: #efefef; color: #b4b4b8; display: grid; place-items: center;
  transition: background .25s, color .25s, transform .25s cubic-bezier(.3,1.4,.5,1), box-shadow .25s;
}
.tg-cb:hover { transform: translateY(-2px); background: #e9e9ea; color: #8d8d92; }
.tg-cb:active { transform: scale(.95); }
.tg-cb[data-on="true"] { background: var(--tg-green); color: #fff; box-shadow: 0 10px 22px -10px rgba(34,177,76,.8); }
.tg-cb[data-on="true"]:hover { background: var(--tg-green-d); }
.tg-hint { font-size: 12px; color: #a0a0a5; margin: 12px 0 0; min-height: 18px; }

.tg-desk {
  position: relative; border-radius: 6px; overflow: hidden; min-height: 270px;
  display: grid; place-items: center; perspective: 900px;
  transition: background .6s ease;
}
.tg-desk[data-who="you"] { background: radial-gradient(120% 90% at 20% 0%, #f3b4e4 0%, #d64fc0 35%, #8b2fd6 70%, #5126b8 100%); }
.tg-desk[data-who="pair"] { background: radial-gradient(120% 90% at 80% 0%, #9fe3ff 0%, #3aa7f0 35%, #2462d6 70%, #1b2f8f 100%); }
.tg-desk::before {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(60% 50% at 70% 110%, rgba(255,255,255,.25), transparent 70%);
}
.tg-win {
  position: relative; width: 82%; height: 172px; border-radius: 8px; overflow: hidden;
  display: grid; grid-template-columns: 22% 1fr; background: #1e1e21;
  box-shadow: 0 20px 40px -12px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.08);
  transition: transform .6s cubic-bezier(.4,1.2,.5,1);
}
.tg-desk:hover .tg-win { transform: translateY(-4px) rotateX(4deg); }
.tg-flip { animation: tg-flip .6s cubic-bezier(.4,1.1,.5,1); }
@keyframes tg-flip { 0% { transform: rotateY(0) } 50% { transform: rotateY(90deg) scale(.92) } 100% { transform: rotateY(0) } }
.tg-side { background: rgba(120,60,140,.45); padding: 10px 8px; display: flex; flex-direction: column; gap: 6px; transition: background .6s; }
.tg-desk[data-who="pair"] .tg-side { background: rgba(40,90,170,.45); }
.tg-side i { display: block; height: 3px; border-radius: 2px; background: rgba(255,255,255,.35); }
.tg-code { padding: 14px 12px; display: flex; flex-direction: column; gap: 7px; }
.tg-ln { display: flex; gap: 4px; }
.tg-ln i { display: block; height: 3px; border-radius: 2px; transform-origin: left; animation: tg-type .5s ease both; }
@keyframes tg-type { from { transform: scaleX(0) } to { transform: scaleX(1) } }
.tg-who {
  position: absolute; top: 12px; left: 12px; font-size: 11px; font-weight: 600; color: #fff;
  background: rgba(0,0,0,.32); backdrop-filter: blur(6px); padding: 4px 9px; border-radius: 99px;
  display: flex; gap: 6px; align-items: center;
}
.tg-who b { width: 6px; height: 6px; border-radius: 50%; background: #ff5f57; animation: tg-blink 1.4s infinite; }
@keyframes tg-blink { 50% { opacity: .3 } }

@media (max-width: 920px) {
  .tg-grid { grid-template-columns: 1fr 1fr; }
  .tg-wide { grid-column: span 2; }
  .tg-tall { grid-row: auto; grid-column: span 2; }
  .tg-call { min-height: 0; }
}
@media (max-width: 640px) {
  .tg-root { padding: 48px 16px 56px; }
  .tg-grid { grid-template-columns: 1fr; }
  .tg-wide, .tg-tall { grid-column: auto; }
  .tg-wide { grid-template-columns: 1fr; }
  .tg-card { padding: 24px 22px 0; }
  .tg-wide { padding-bottom: 22px; }
}
@media (prefers-reduced-motion: reduce) {
  .tg-root *, .tg-root *::before, .tg-root *::after { animation: none !important; transition: none !important; }
  .tg-rise, .tg-tile { opacity: 1; transform: none; }
}
`

/* ── icons ── */

function GridIcon({ dim }: { dim?: boolean }) {
  return (
    <svg className="tg-q-ic" width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <rect x="1" y="1" width="24" height="24" rx="6" fill={dim ? "#c9c9cd" : "#8e8e93"} />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect key={`${r}${c}`} x={5 + c * 4.3} y={5 + r * 4.3} width="3.2" height="3.2" rx=".6" fill="#fff" opacity=".75" />
        ))
      )}
    </svg>
  )
}

function Monitor() {
  return (
    <svg className="tg-mon" width="70" height="60" viewBox="0 0 70 60" aria-hidden>
      <rect x="1" y="1" width="68" height="44" rx="4" fill="#d9d9dc" />
      <rect x="4" y="4" width="62" height="38" rx="2" fill="url(#tg-scr)" />
      <path d="M30 45h10l2 8H28z" fill="#c4c4c8" />
      <rect x="24" y="52" width="22" height="3" rx="1.5" fill="#bdbdc1" />
      <defs>
        <linearGradient id="tg-scr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fafafa" />
          <stop offset="1" stopColor="#e4e4e7" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const MicIcon = ({ off, s = 15 }: { off?: boolean; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
)
const CamIcon = ({ off, s = 15 }: { off?: boolean; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="7" width="12" height="10" rx="2" />
    <path d="M15 11l6-3v8l-6-3" />
    {off && <path d="M3 4l17 17" />}
  </svg>
)
const ScreenIcon = ({ off, s = 15 }: { off?: boolean; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M12 16v4M8 20h8" />
    {off && <path d="M4 3l16 16" />}
  </svg>
)
const LeaveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8M17 8l4 4-4 4M21 12H10" />
  </svg>
)

/* ── hooks ── */

function useInView<T extends Element>(threshold = 0.18) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView] as const
}

/* ── cards ── */

function QualityCard() {
  const [sel, setSel] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const pill = hover ?? sel
  return (
    <div className="tg-q" onMouseLeave={() => setHover(null)}>
      <span className="tg-q-pill" style={{ transform: `translateY(${pill * 48}px)` }} />
      {QUALITIES.map((q, i) => (
        <button
          key={q.label}
          type="button"
          className="tg-q-row"
          data-on={i === sel}
          aria-pressed={i === sel}
          onMouseEnter={() => setHover(i)}
          onFocus={() => setHover(i)}
          onClick={() => setSel(i)}
        >
          <GridIcon dim={i !== sel} />
          <span>{q.label}</span>
          <span className="tg-q-d">{q.detail}</span>
        </button>
      ))}
    </div>
  )
}

function EncryptionCard() {
  const [locked, setLocked] = useState(true)
  const pkts = [0, 0.6, 1.2]
  return (
    <>
      <div
        className={`tg-enc${locked ? "" : " tg-unlocked"}`}
        role="button"
        tabIndex={0}
        aria-pressed={!locked}
        aria-label={locked ? "Unlock to see unencrypted traffic" : "Lock to encrypt traffic"}
        onClick={() => setLocked((l) => !l)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setLocked((l) => !l)
          }
        }}
      >
        <Monitor />
        <div className="tg-wire">
          {pkts.map((d) => (
            <span key={d} className="tg-pkt" style={{ ["--tg-pd" as string]: `${d}s` }} />
          ))}
        </div>
        <div className="tg-lock">
          <svg width="30" height="36" viewBox="0 0 30 36" aria-hidden>
            <path className="tg-shackle" d="M8 16V10a7 7 0 0 1 14 0v6" fill="none" stroke={locked ? "#4a4a4f" : "#e5484d"} strokeWidth="3.4" strokeLinecap="round" />
            <rect x="3" y="15" width="24" height="19" rx="4" fill={locked ? "#4a4a4f" : "#e5484d"} />
            <circle cx="15" cy="24.5" r="2.4" fill="#fff" opacity=".85" />
          </svg>
        </div>
        <div className="tg-wire tg-wire-r">
          {pkts.map((d) => (
            <span key={d} className="tg-pkt" style={{ ["--tg-pd" as string]: `${d + 0.3}s` }} />
          ))}
        </div>
        <Monitor />
      </div>
      <p className="tg-enc-cap">{locked ? "AES-256 · peer-to-peer · click to unlock" : "unencrypted · click to lock"}</p>
    </>
  )
}

function CallTile({
  name,
  src,
  speaking,
  muted,
  camOff,
  play,
  delay,
  area,
  pinned,
  onPick,
}: {
  name: string
  src: string
  speaking: boolean
  muted: boolean
  camOff: boolean
  play: boolean
  delay: number
  area: string
  pinned: boolean
  onPick: () => void
}) {
  const ref = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (play && !camOff) v.play().catch(() => {})
    else v.pause()
  }, [play, camOff])
  return (
    <div
      className="tg-tile"
      data-speak={speaking && !muted}
      data-muted={muted}
      data-big={area === "big"}
      role="button"
      tabIndex={0}
      aria-label={area === "big" ? `${name} in spotlight` : `Spotlight ${name}`}
      onClick={onPick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onPick()
        }
      }}
      style={{ ["--tg-td" as string]: `${delay}ms`, gridArea: area }}
    >
      {pinned && <span className="tg-pin">Pinned · click to unpin</span>}
      <video ref={ref} src={src} muted loop playsInline preload="metadata" aria-label={`${name}'s camera`} />
      {camOff && (
        <div className="tg-off">
          <div className="tg-av">{name[0]}</div>
        </div>
      )}
      <span className="tg-tag">
        {muted ? <MicIcon off s={11} /> : speaking ? <span className="tg-eq"><i /><i /><i /></span> : null}
        {name}
      </span>
    </div>
  )
}

function CallCard({ inView }: { inView: boolean }) {
  const [speaker, setSpeaker] = useState(1)
  const [muted, setMuted] = useState(false)
  const [camOff, setCamOff] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [left, setLeft] = useState(false)
  const [pin, setPin] = useState<number | null>(null)

  useEffect(() => {
    if (!inView || left) return
    const t = setInterval(() => setSpeaker((s) => (s + 1) % VIDEOS.length), 4200)
    return () => clearInterval(t)
  }, [inView, left])

  const spot = pin ?? speaker
  const areaOf = (i: number) => {
    if (i === spot) return "big"
    const rest = VIDEOS.map((_, k) => k).filter((k) => k !== spot)
    return `s${rest.indexOf(i)}`
  }

  return (
    <div className="tg-call">
      <div className="tg-bar">
        <span className="tg-dot" style={{ background: "#ff5f57" }} />
        <span className="tg-dot" style={{ background: "#febc2e" }} />
        <span className="tg-dot" style={{ background: "#28c840" }} />
        <div className="tg-tools">
          <button type="button" className="tg-tb" data-tone={muted ? "" : "green"} aria-label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((m) => !m)}>
            <MicIcon off={muted} />
          </button>
          <button type="button" className="tg-tb" data-tone={sharing ? "green" : ""} aria-label="Share screen" onClick={() => setSharing((s) => !s)}>
            <ScreenIcon off={!sharing} />
          </button>
          <button type="button" className="tg-tb" data-tone={camOff ? "" : "green"} aria-label={camOff ? "Camera on" : "Camera off"} onClick={() => setCamOff((c) => !c)}>
            <CamIcon off={camOff} />
          </button>
          <button type="button" className="tg-tb" data-tone="red" aria-label="Leave call" onClick={() => setLeft(true)}>
            <LeaveIcon />
          </button>
        </div>
        <div className="tg-more" aria-hidden>
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="1" y="5" width="8" height="8" rx="1.5" /><path d="M5 5V2.5A1.5 1.5 0 0 1 6.5 1h7A1.5 1.5 0 0 1 15 2.5v6A1.5 1.5 0 0 1 13.5 10H9" /></svg>
          <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor"><circle cx="2" cy="2" r="1.6" /><circle cx="8" cy="2" r="1.6" /><circle cx="14" cy="2" r="1.6" /></svg>
        </div>
      </div>
      <div className="tg-tiles">
        {VIDEOS.map((v, i) => (
          <CallTile
            key={v.name}
            name={i === 0 ? "You" : v.name}
            src={v.src}
            speaking={!left && speaker === i}
            muted={i === 0 && muted}
            camOff={i === 0 && camOff}
            play={inView && !left}
            delay={500 + i * 110}
            area={areaOf(i)}
            pinned={pin === i}
            onPick={() => setPin((p) => (p === i ? null : i))}
          />
        ))}
      </div>
      {left && (
        <div className="tg-left">
          <div>
            <p>You left the call</p>
            <button type="button" className="tg-btn" onClick={() => setLeft(false)}>
              Rejoin
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const CODE: string[][] = [
  ["#e255a1:22", "#5ec2ff:30", "#9a9aa0:10"],
  ["#9a9aa0:8", "#4ade80:24", "#e255a1:14"],
  ["#5ec2ff:16", "#4ade80:34", "#f87171:12", "#9a9aa0:8"],
  ["#4ade80:28", "#9a9aa0:10"],
  ["#9a9aa0:6", "#5ec2ff:20", "#4ade80:22"],
  ["#e255a1:18", "#5ec2ff:26", "#9a9aa0:12"],
  ["#4ade80:30", "#9a9aa0:8", "#f87171:10"],
  ["#5ec2ff:14", "#4ade80:20"],
  ["#9a9aa0:10", "#e255a1:28", "#5ec2ff:16"],
]

function SwapCard() {
  const [who, setWho] = useState<"you" | "pair">("you")
  const [mic, setMic] = useState(false)
  const [cam, setCam] = useState(false)
  const [flipKey, setFlipKey] = useState(0)
  const swap = useCallback(() => {
    setWho((w) => (w === "you" ? "pair" : "you"))
    setFlipKey((k) => k + 1)
  }, [])
  const rows = who === "you" ? CODE : [...CODE].reverse()
  return (
    <>
      <div>
        <h3 className="tg-h">One click to swap who&apos;s sharing</h3>
        <p className="tg-p">
          It just takes one click to switch who&apos;s sharing when you&apos;re on a call. Easily go back and forth
          with your pair on a tough problem.
        </p>
        <div className="tg-ctl">
          <button type="button" className="tg-cb" data-on={mic} aria-pressed={mic} aria-label="Microphone" onClick={() => setMic((m) => !m)}>
            <MicIcon off={!mic} s={26} />
          </button>
          <button type="button" className="tg-cb" data-on="true" aria-label="Swap who is sharing" onClick={swap}>
            <ScreenIcon s={28} />
          </button>
          <button type="button" className="tg-cb" data-on={cam} aria-pressed={cam} aria-label="Camera" onClick={() => setCam((c) => !c)}>
            <CamIcon off={!cam} s={26} />
          </button>
        </div>
        <p className="tg-hint">Tap the screen button to hand over control.</p>
      </div>
      <div className="tg-desk" data-who={who}>
        <span className="tg-who">
          <b /> {who === "you" ? "You're sharing" : "Maya is sharing"}
        </span>
        <div key={flipKey} className={`tg-win${flipKey ? " tg-flip" : ""}`}>
          <div className="tg-side">
            <span style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              <span className="tg-dot" style={{ width: 7, height: 7, background: "#ff5f57" }} />
              <span className="tg-dot" style={{ width: 7, height: 7, background: "#febc2e" }} />
              <span className="tg-dot" style={{ width: 7, height: 7, background: "#28c840" }} />
            </span>
            {[70, 50, 80, 60, 45].map((w, i) => (
              <i key={i} style={{ width: `${w}%`, background: i === 0 ? "rgba(255,255,255,.75)" : undefined }} />
            ))}
          </div>
          <div className="tg-code">
            {rows.map((ln, r) => (
              <div className="tg-ln" key={`${who}-${r}`} style={{ paddingLeft: (r % 3) * 8 }}>
                {ln.map((seg, j) => {
                  const [c, w] = seg.split(":")
                  return <i key={j} style={{ width: Number(w) * 1.6, background: c, animationDelay: `${120 + r * 55 + j * 30}ms` }} />
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

/* ── section ── */

export default function TupleGrid() {
  const [ref, inView] = useInView<HTMLElement>()
  const d = (ms: number) => ({ ["--tg-d" as string]: `${ms}ms` })
  return (
    <section ref={ref} className={`tg-root${inView ? " tg-in" : ""}`}>
      <style>{CSS}</style>
      <header className="tg-head">
        <p className="tg-eyebrow tg-rise" style={d(0)}>BUILT FOR PAIRING</p>
        <h2 className="tg-title tg-rise" style={d(80)}>Engineers deserve sharp tools</h2>
        <p className="tg-sub tg-rise" style={d(160)}>
          Generic screen sharing tools just won&apos;t cut it.
          <br />
          Tuple is purpose-built for an exceptional pairing experience.
        </p>
      </header>
      <div className="tg-grid">
        <article className="tg-card tg-rise" style={d(240)}>
          <h3 className="tg-h">Ridiculously crisp audio and video</h3>
          <p className="tg-p">
            Tuple streams in super high resolution (up to 5K) so you can read your pair&apos;s tiny programming font.
          </p>
          <QualityCard />
        </article>
        <article className="tg-card tg-rise" style={d(320)}>
          <h3 className="tg-h">End-to-end encryption</h3>
          <p className="tg-p">
            All audio, video, and screen share data is end-to-end encrypted, and is never sent to Tuple&apos;s servers.
            We take your privacy extremely seriously.
          </p>
          <EncryptionCard />
        </article>
        <article className="tg-card tg-tall tg-rise" style={d(400)}>
          <h3 className="tg-h">Seamless collaboration</h3>
          <p className="tg-p">
            Snappy remote control combined with clear audio and video make you feel like you&apos;re sitting right next
            to your pair.
          </p>
          <CallCard inView={inView} />
        </article>
        <article className="tg-card tg-wide tg-rise" style={d(480)}>
          <SwapCard />
        </article>
      </div>
    </section>
  )
}
