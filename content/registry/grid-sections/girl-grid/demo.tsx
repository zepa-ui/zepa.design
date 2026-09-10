"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  ZepaFolder,
  type ZepaFolderFile,
} from "@/content/registry/interactive-illustrations/zepa-folder/ui/zepa-folder"

/* ─────────────────────────────────────────────
   girl-grid — a support-agent bento

   Five tiles on soft grey, laid out wide and shallow
   so the board reads as one band rather than a wall.

   The portrait sits under a frosted top band and
   carries a conversation that arrives bubble by
   bubble, then starts over. The language card is a
   real set of switches: off they are outlined chips
   showing the code, on they widen into a pill with
   the flag filling the track and a knob sprung to
   the right. The omni-channel tile floats its
   channels along an arc that keeps tracing itself,
   and its microphone records when pressed.
   The conversations counter sits under a bare
   ZepaFolder, which fans its files out on hover.

   The component owns its own scroll container, so it
   never touches window scroll or position:fixed.
   ───────────────────────────────────────────── */

const PHOTO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/c_fill,w_680,h_1120,g_auto/v1781876068/2_jogaln.jpg"

/** the conversations the 300K counts, as a folder you can fan open */
const CONVOS: ZepaFolderFile[] = [
  { id: "han", image: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/han_chmdo4.jpg", title: "Han" },
  { id: "sam", image: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/samevans_hf73xr.jpg", title: "Sam Evans" },
  { id: "vivek", image: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/vivek_i01gjp.png", title: "Vivek" },
  { id: "yash", image: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705173/yash_u2hx6k.png", title: "Yash" },
]

/** the plain row under the highlighted one */
const TASKS = [
  { tone: "cool", text: "Identify new leads using LinkedIn or Apollo" },
] as const

type Msg = { from: "them" | "us"; text: string }

const THREAD: Msg[] = [
  { from: "us", text: "I installed it, but the panel shows a red flashlight. How do I fix this?" },
  {
    from: "them",
    text: "Please follow the link for more detailed information on resolving your issue.",
  },
  { from: "us", text: "That worked — the light is green now. Thanks!" },
]

type Lang = { code: string; label: string }
/** three on the first line, two on the second — as in the reference */
const ROW_A: Lang[] = [
  { code: "EN", label: "English" },
  { code: "UK", label: "Ukrainian" },
  { code: "ES", label: "Spanish" },
]
const ROW_B: Lang[] = [
  { code: "GB", label: "British English" },
  { code: "FR", label: "French" },
]
const DEFAULT_ON = ["ES", "GB"]

/**
 * Flags are drawn on a 51x20 box — the same 2.55 aspect as the switched-on
 * pill — and stretched to fill it. preserveAspectRatio="none" means no
 * letterboxing and nothing that can spill outside the track.
 */
function Flag({ code }: { code: string }) {
  const box = { viewBox: "0 0 51 20", preserveAspectRatio: "none", className: "gg-flag" } as const
  if (code === "ES")
    return (
      <svg {...box} aria-hidden>
        <rect width="51" height="20" fill="#c60b1e" />
        <rect y="5" width="51" height="10" fill="#ffc400" />
      </svg>
    )
  if (code === "FR")
    return (
      <svg {...box} aria-hidden>
        <rect width="51" height="20" fill="#fff" />
        <rect width="17" height="20" fill="#002395" />
        <rect x="34" width="17" height="20" fill="#ed2939" />
      </svg>
    )
  if (code === "EN")
    return (
      <svg {...box} aria-hidden>
        <rect width="51" height="20" fill="#fff" />
        <rect x="21" width="9" height="20" fill="#ce1124" />
        <rect y="5.5" width="51" height="9" fill="#ce1124" />
      </svg>
    )
  if (code === "UK")
    return (
      <svg {...box} aria-hidden>
        <rect width="51" height="10" fill="#0057b7" />
        <rect y="10" width="51" height="10" fill="#ffd700" />
      </svg>
    )
  return (
    <svg {...box} aria-hidden>
      <rect width="51" height="20" fill="#012169" />
      <path d="M0 0 51 20M51 0 0 20" stroke="#fff" strokeWidth="4.6" />
      <path d="M0 0 51 20M51 0 0 20" stroke="#c8102e" strokeWidth="2.4" />
      <path d="M25.5 0v20M0 10h51" stroke="#fff" strokeWidth="7" />
      <path d="M25.5 0v20M0 10h51" stroke="#c8102e" strokeWidth="4.2" />
    </svg>
  )
}

export default function GirlGrid() {
  const rootRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const statRef = useRef<HTMLElement>(null)
  const [folderSize, setFolderSize] = useState(112)
  const [live, setLive] = useState(false)
  const [shown, setShown] = useState(0)
  const [on, setOn] = useState<string[]>(DEFAULT_ON)
  const [rec, setRec] = useState(false)

  const toggle = useCallback((code: string) => {
    setOn((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]))
  }, [])

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setLive(true))
      return () => cancelAnimationFrame(id)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setLive(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    io.observe(grid)
    return () => io.disconnect()
  }, [])

  /* ── the folder takes a px size, so it is measured off the card ───── */
  useEffect(() => {
    const el = statRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => {
      const h = el.clientHeight
      setFolderSize(Math.round(Math.max(74, Math.min(152, h * 0.46))))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* ── the thread plays out, holds, then starts over ────────────────── */
  useEffect(() => {
    if (!live) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setShown(THREAD.length))
      return () => cancelAnimationFrame(id)
    }
    const id = setInterval(() => {
      // one step past the end is the pause before it resets
      setShown((n) => (n > THREAD.length ? 0 : n + 1))
    }, 1700)
    return () => clearInterval(id)
  }, [live])

  const sw = (l: Lang) => {
    const active = on.includes(l.code)
    return (
      <button
        key={l.code}
        type="button"
        className={"gg-sw" + (active ? " is-on" : "")}
        aria-pressed={active}
        aria-label={l.label}
        onClick={() => toggle(l.code)}
      >
        <span className="gg-sw-track">
          <Flag code={l.code} />
        </span>
        <span className="gg-sw-code">{l.code}</span>
        <span className="gg-sw-knob" />
      </button>
    )
  }

  return (
    <div ref={rootRef} className="gg-root">
      <style>{CSS}</style>

      <div className="gg-content">
        <div className="gg-lead" />

        <div ref={gridRef} className={"gg-grid" + (live ? " gg-in" : "")}>
          {/* ── portrait + conversation ── */}
          <section className="gg-card gg-girl" style={{ ["--d" as string]: "0ms" }}>
            <img className="gg-photo" src={PHOTO} alt="" draggable={false} />
            <span className="gg-haze" aria-hidden />
            <span className="gg-scrim" aria-hidden />

            <div className="gg-thread">
              {THREAD.map((m, i) => (
                <p
                  key={i}
                  className={"gg-bubble gg-bubble--" + m.from + (i < shown ? " is-in" : "")}
                >
                  {m.text}
                </p>
              ))}
            </div>

            <div className="gg-girl-copy">
              <h3>
                Collaborative
                <br />
                intelligence
              </h3>
              <p>
                Sub-agents work together seamlessly to handle complex scenarios, achieving
                superior results through coordinated effort.
              </p>
            </div>
          </section>

          {/* ── languages ── */}
          <section className="gg-card gg-lang" style={{ ["--d" as string]: "80ms" }}>
            <div className="gg-switches">
              <div className="gg-sw-row">{ROW_A.map(sw)}</div>
              <div className="gg-sw-row">{ROW_B.map(sw)}</div>
            </div>
            <div className="gg-foot">
              <span>Automatically detect</span>
              <h3>All major languages</h3>
            </div>
          </section>

          {/* ── daily conversations ── */}
          <section ref={statRef} className="gg-card gg-stat" style={{ ["--d" as string]: "160ms" }}>
            <div className="gg-folder">
              <ZepaFolder
                variant="bare"
                files={CONVOS}
                color="#5b63d3"
                size={folderSize}
                caption={null}
                hint={null}
                lightbox={false}
                maxVisible={3}
              />
            </div>
            <strong>300K</strong>
            <span className="gg-stat-label">Daily Conversations</span>
          </section>

          {/* ── multitasking ── */}
          <section className="gg-card gg-multi" style={{ ["--d" as string]: "240ms" }}>
            <div className="gg-rows">
              {/* the prism wash bleeds out past the row and is blurred, so the
                  white pill appears to float on a soft colour field */}
              <div className="gg-lead-wrap">
                <span className="gg-wash" aria-hidden />
                <div className="gg-lead-row">
                  <span className="gg-dot gg-dot--warm" aria-hidden>
                    <svg viewBox="0 0 12 12" width="58%" height="58%">
                      <path d="M3.4 3.4l5.2 5.2M8.6 3.4l-5.2 5.2" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
                    </svg>
                  </span>
                  Enrich contact details from raw lead data
                </div>
              </div>
              {TASKS.map((t) => (
                <div key={t.text} className="gg-sub-row">
                  <span className={"gg-dot gg-dot--" + t.tone} aria-hidden>
                    <svg viewBox="0 0 12 12" width="58%" height="58%">
                      <path d="M2.8 6.2l2.2 2.2 4.3-4.6" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {t.text}
                </div>
              ))}
            </div>
            <div className="gg-foot">
              <span>Any task done by a human</span>
              <h3>Multitasking</h3>
            </div>
          </section>

          {/* ── omni channel ── */}
          <section className="gg-card gg-omni" style={{ ["--d" as string]: "320ms" }}>
            <div className="gg-foot gg-foot--top">
              <span>Email, chat, SMS etc.</span>
              <h3>Omni channel</h3>
            </div>

            <div className="gg-orbit">
              <svg className="gg-arcs" viewBox="0 0 200 110" preserveAspectRatio="none" aria-hidden>
                <path d="M8 96C40 40 96 22 152 34" fill="none" stroke="rgba(20,20,40,.13)" strokeWidth="1" />
                <path d="M18 108C62 66 118 54 192 66" fill="none" stroke="rgba(20,20,40,.1)" strokeWidth="1" />
                <path
                  className="gg-arc-live"
                  d="M8 96C40 40 96 22 152 34"
                  fill="none"
                  stroke="rgba(45,196,182,.9)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>

              <span className="gg-chip gg-chip--mail" aria-hidden>
                <svg viewBox="0 0 24 24" width="46%" height="46%">
                  <path d="M3.4 6.6h17.2v10.8H3.4z" fill="none" stroke="#6b7280" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="m3.4 7.2 8.6 6 8.6-6" fill="none" stroke="#6b7280" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>

              <button
                type="button"
                className={"gg-chip gg-chip--mic" + (rec ? " is-rec" : "")}
                aria-pressed={rec}
                aria-label={rec ? "Stop recording" : "Start recording"}
                onClick={() => setRec((v) => !v)}
              >
                {rec ? (
                  <span className="gg-eq" aria-hidden>
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <svg viewBox="0 0 24 24" width="46%" height="46%" aria-hidden>
                    <rect x="9.4" y="3.4" width="5.2" height="10.4" rx="2.6" fill="#fff" />
                    <path d="M6.4 11.4a5.6 5.6 0 0 0 11.2 0M12 17v3.4" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              <span className="gg-chip gg-chip--globe" aria-hidden>
                <svg viewBox="0 0 24 24" width="48%" height="48%">
                  <circle cx="12" cy="12" r="8.4" fill="none" stroke="#f97316" strokeWidth="1.6" />
                  <ellipse cx="12" cy="12" rx="3.6" ry="8.4" fill="none" stroke="#f97316" strokeWidth="1.6" />
                  <path d="M3.8 12h16.4" stroke="#f97316" strokeWidth="1.6" />
                </svg>
              </span>

              <span className="gg-chip gg-chip--cal" aria-hidden>
                <svg viewBox="0 0 24 24" width="48%" height="48%">
                  <rect x="4" y="5.4" width="16" height="14" rx="2.6" fill="none" stroke="#9aa1ab" strokeWidth="1.6" />
                  <path d="M4 10h16M9 3.4v3.6M15 3.4v3.6" stroke="#9aa1ab" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </section>
        </div>

        <div className="gg-tail" />
      </div>
    </div>
  )
}

const CSS = `
.gg-root {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: #ececed;
  color: #14141a;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  scrollbar-width: none;
}
.gg-root::-webkit-scrollbar { display: none; }
.gg-root *, .gg-root *::before, .gg-root *::after { box-sizing: border-box; }

.gg-content { position: relative; width: 100%; }
.gg-lead { height: 14vh; }
.gg-tail { height: 16vh; }

/* wide and shallow: the reference board is 2:1, and the row height is
   0.243 x the board width — everything below is sized off that */
.gg-grid {
  width: min(92vw, 1080px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  grid-template-rows: 1fr 1fr;
  gap: clamp(8px, 0.85vw, 13px);
  /* a floor as well as a cap: on a short window 60vh collapsed the rows far
     enough that the footers crowded the content above them */
  height: clamp(500px, 66vh, 590px);
}

.gg-card {
  position: relative;
  overflow: hidden;
  border-radius: clamp(12px, 1.25vw, 20px);
  background: #fff;
  padding: clamp(12px, 1.35vw, 21px);
  opacity: 0;
  transform: translateY(20px);
  box-shadow: 0 2px 12px -7px rgba(20, 20, 40, 0.2);
}
.gg-grid.gg-in .gg-card {
  animation: ggRise 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d);
}
@keyframes ggRise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.gg-girl  { grid-column: span 7;  grid-row: 1 / span 2; padding: 0; }
.gg-lang  { grid-column: span 10; grid-row: 1; display: grid; align-content: space-between; }
/* the only card that lets its contents out: the fanned files have to clear
   the top edge on hover, and overflow:hidden on .gg-card would slice them */
.gg-stat  {
  grid-column: span 7;
  grid-row: 1;
  display: grid;
  align-content: center;
  justify-items: center;
  text-align: center;
  gap: clamp(5px, 0.5vw, 8px);
  overflow: visible;
}
/* lifted over its neighbours only while open, so it never steals their hover */
.gg-stat:hover { z-index: 6; }
.gg-multi { grid-column: span 8;  grid-row: 2; display: grid; align-content: space-between; }
.gg-omni  { grid-column: span 9;  grid-row: 2; display: grid; grid-template-rows: auto 1fr; }

.gg-card h3 { margin: 0; letter-spacing: -0.03em; line-height: 1.12; }
.gg-card p  { margin: 0; }

/* ── portrait ── */
.gg-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.gg-haze {
  position: absolute; inset: 0 0 55% 0;
  backdrop-filter: blur(8px) saturate(112%);
  -webkit-backdrop-filter: blur(8px) saturate(112%);
  background: rgba(255, 255, 255, 0.08);
  mask-image: linear-gradient(to bottom, #000 40%, transparent 97%);
  -webkit-mask-image: linear-gradient(to bottom, #000 40%, transparent 97%);
}
.gg-scrim {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(8, 8, 16, 0.88) 3%, rgba(8, 8, 16, 0.2) 40%, transparent 62%);
}

.gg-thread {
  position: relative;
  display: grid;
  gap: clamp(5px, 0.5vw, 8px);
  padding: clamp(11px, 1.2vw, 19px);
}
.gg-bubble {
  max-width: 88%;
  border-radius: clamp(9px, 0.95vw, 15px);
  padding: clamp(5px, 0.55vw, 9px) clamp(7px, 0.75vw, 12px);
  font-size: clamp(9px, min(0.8vw, 1.42vh), 12px);
  line-height: 1.4;
  opacity: 0;
  transform: translateY(7px) scale(0.96);
  transition: opacity 0.42s ease, transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}
.gg-bubble.is-in { opacity: 1; transform: translateY(0) scale(1); }
.gg-bubble--us {
  justify-self: end;
  background: #2f6bf6;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.gg-bubble--them {
  justify-self: start;
  background: rgba(238, 238, 242, 0.24);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #f4f4f6;
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-bottom-left-radius: 4px;
}

.gg-girl-copy {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: clamp(12px, 1.35vw, 21px);
  color: #fff;
}
.gg-girl-copy h3 { font-size: clamp(15px, min(1.7vw, 2.9vh), 25px); font-weight: 700; }
.gg-girl-copy p {
  margin-top: clamp(5px, 0.55vw, 9px);
  font-size: clamp(9px, min(0.86vw, 1.5vh), 13px);
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.84);
}

/* ── language switches ── */
.gg-switches { display: grid; gap: clamp(6px, 0.62vw, 10px); justify-items: start; }
.gg-sw-row { display: flex; gap: clamp(6px, 0.62vw, 10px); }

.gg-sw {
  --h: clamp(24px, min(2.5vw, 4.4vh), 38px);
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  height: var(--h);
  width: calc(var(--h) * 2.05);
  padding: 0;
  border: 1.5px solid #e3e3e8;
  border-radius: 999px;
  background: #fff;
  font: inherit;
  cursor: pointer;
  overflow: hidden;
  transition: width 0.36s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease;
}
.gg-sw:hover { border-color: #cfcfd6; }
.gg-sw:focus-visible { outline: 2px solid #2f6bf6; outline-offset: 2px; }

.gg-sw-track { position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s ease; }
.gg-flag { width: 100%; height: 100%; display: block; overflow: hidden; }
.gg-sw-code {
  position: relative;
  width: 100%;
  text-align: center;
  font-size: clamp(11px, min(1.1vw, 1.9vh), 16px);
  font-weight: 600;
  color: #3a3a44;
  transition: opacity 0.24s ease;
}
.gg-sw-knob {
  position: absolute;
  top: 50%;
  left: calc(var(--h) * 0.11);
  width: calc(var(--h) * 0.78);
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.28);
  transform: translate(0, -50%) scale(0);
  transition: transform 0.38s cubic-bezier(0.34, 1.42, 0.64, 1);
}
/* on: the pill grows, the code hides, the flag shows and the knob springs right */
.gg-sw.is-on { width: calc(var(--h) * 2.55); border-color: transparent; }
.gg-sw.is-on .gg-sw-track { opacity: 1; }
.gg-sw.is-on .gg-sw-code { opacity: 0; }
.gg-sw.is-on .gg-sw-knob { transform: translate(calc(var(--h) * 1.55), -50%) scale(1); }

.gg-foot > span {
  display: block;
  font-size: clamp(9px, min(0.86vw, 1.5vh), 13px);
  color: #8a8a94;
  margin-bottom: clamp(3px, 0.3vw, 5px);
}
.gg-foot h3 { font-size: clamp(14px, min(1.7vw, 2.9vh), 25px); font-weight: 700; }
.gg-foot--top { margin-bottom: clamp(4px, 0.5vw, 8px); }

/* ── stat ── */
/* the folder sizes itself in px from the card, so the wrapper only has to
   keep it from stretching the grid row. The negative top margin lifts it so
   the files have somewhere to fan into — up and out over the card's edge. */
.gg-folder {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  min-height: 0;
  margin-top: calc(clamp(16px, 3vh, 38px) * -1);
  margin-bottom: clamp(2px, 0.4vw, 7px);
}
.gg-stat strong {
  font-size: clamp(28px, min(3.2vw, 5.6vh), 48px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}
.gg-stat-label { font-size: clamp(9px, min(0.86vw, 1.5vh), 13px); color: #8a8a94; }

/* ── multitasking ── */
.gg-rows { display: grid; gap: clamp(5px, 0.55vw, 9px); align-content: start; }
.gg-lead-wrap { position: relative; }
/* blurred prism field bleeding out past the pill */
.gg-wash {
  position: absolute;
  inset: -34% -4%;
  border-radius: 999px;
  background: linear-gradient(100deg, #f7a13f 6%, #6fd08c 34%, #58a6f0 64%, #b98cf0 94%);
  filter: blur(clamp(9px, 1.1vw, 17px));
  opacity: 0.36;
}
.gg-lead-row {
  position: relative;
  display: flex; align-items: center;
  gap: clamp(6px, 0.65vw, 10px);
  background: #fff;
  border-radius: clamp(8px, 0.85vw, 13px);
  padding: clamp(7px, 0.7vw, 11px) clamp(9px, 0.9vw, 14px);
  font-size: clamp(9px, min(0.78vw, 1.4vh), 13px);
  font-weight: 600;
  line-height: 1.3;
  box-shadow: 0 3px 14px -5px rgba(20, 20, 40, 0.2);
}
.gg-sub-row {
  display: flex; align-items: center;
  gap: clamp(6px, 0.65vw, 10px);
  padding: 0 clamp(9px, 0.9vw, 14px);
  font-size: clamp(9px, min(0.78vw, 1.4vh), 13px);
  line-height: 1.3;
  color: #4c4c56;
}
.gg-dot {
  flex: 0 0 auto;
  display: grid; place-items: center;
  width: clamp(14px, min(1.35vw, 2.4vh), 21px);
  aspect-ratio: 1;
  border-radius: 50%;
}
.gg-dot--warm  { background: #f26f3b; }
.gg-dot--cool  { background: #6d5bf0; }

/* ── omni channel ── */
.gg-orbit { position: relative; min-height: 0; }
.gg-arcs { position: absolute; inset: 0; width: 100%; height: 100%; }
.gg-arc-live { stroke-dasharray: 26 190; }
.gg-grid.gg-in .gg-arc-live { animation: ggTrace 4.4s linear infinite; }
@keyframes ggTrace {
  from { stroke-dashoffset: 216; }
  to   { stroke-dashoffset: 0; }
}
.gg-chip {
  position: absolute;
  display: grid; place-items: center;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 15px -4px rgba(20, 20, 40, 0.26);
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.42s ease;
}
.gg-grid.gg-in .gg-chip { animation: ggBob 5s ease-in-out var(--bd, 0s) infinite; }
@keyframes ggBob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
}
.gg-omni:hover .gg-chip {
  animation-play-state: paused;
  transform: translateY(-3px);
  box-shadow: 0 9px 24px -7px rgba(20, 20, 40, 0.34);
}
.gg-chip--mail  { left: 3%;  bottom: 4%; width: clamp(22px, min(2.2vw, 3.9vh), 35px); aspect-ratio: 1; --bd: 0.9s; }
.gg-chip--mic   { left: 41%; top: 22%;   width: clamp(30px, min(3vw, 5.3vh), 47px);   aspect-ratio: 1; background: #2ec4b6; --bd: 0s; }
.gg-chip--globe { right: 5%; top: 0%;    width: clamp(24px, min(2.4vw, 4.3vh), 39px); aspect-ratio: 1; --bd: 1.6s; }
.gg-chip--cal   { right: 13%; bottom: 0%; width: clamp(20px, min(2vw, 3.6vh), 32px);  aspect-ratio: 1; box-shadow: none; background: transparent; --bd: 2.3s; }
/* the mic is the one channel you can press */
.gg-chip--mic {
  border: 0;
  padding: 0;
  font: inherit;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}
.gg-chip--mic:focus-visible { outline: 2px solid #2ec4b6; outline-offset: 3px; }
.gg-chip--mic::after {
  content: "";
  position: absolute; inset: -17%;
  border-radius: 50%;
  border: 1px solid rgba(46, 196, 182, 0.4);
}
/* recording: two rings push out on an offset cycle */
.gg-chip--mic::before {
  content: "";
  position: absolute; inset: -17%;
  border-radius: 50%;
  border: 1.5px solid rgba(46, 196, 182, 0.6);
  opacity: 0;
}
.gg-chip--mic.is-rec { background: #14a99c; }
.gg-chip--mic.is-rec::before { animation: ggRipple 1.7s ease-out infinite; }
.gg-chip--mic.is-rec::after  { animation: ggRipple 1.7s ease-out 0.85s infinite; }
@keyframes ggRipple {
  0%   { transform: scale(1);    opacity: 0.65; }
  100% { transform: scale(2.15); opacity: 0; }
}

/* the level meter that replaces the glyph while recording */
.gg-eq {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12%;
  height: 42%;
}
.gg-eq i {
  width: 8%;
  min-width: 2px;
  height: 28%;
  border-radius: 999px;
  background: #fff;
  animation: ggEq 0.9s ease-in-out infinite;
}
.gg-eq i:nth-child(1) { animation-delay: 0s; }
.gg-eq i:nth-child(2) { animation-delay: 0.18s; }
.gg-eq i:nth-child(3) { animation-delay: 0.36s; }
.gg-eq i:nth-child(4) { animation-delay: 0.12s; }
.gg-eq i:nth-child(5) { animation-delay: 0.3s; }
@keyframes ggEq {
  0%, 100% { height: 26%; }
  50%      { height: 94%; }
}

/* ── tablet ── */
@media (max-width: 900px) {
  .gg-grid {
    width: 94vw;
    height: auto;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    gap: 10px;
  }
  .gg-girl  { grid-column: 1 / span 2; grid-row: auto; min-height: 330px; }
  .gg-lang  { grid-column: 1; grid-row: auto; min-height: 180px; }
  .gg-stat  { grid-column: 2; grid-row: auto; min-height: 180px; }
  .gg-multi { grid-column: 1; grid-row: auto; min-height: 180px; }
  .gg-omni  { grid-column: 2; grid-row: auto; min-height: 180px; }
  .gg-thread { padding: 15px; }
  .gg-bubble { max-width: 66%; font-size: 11px; }
}

/* ── phone ──
   One column, and every clamp capped on vw goes back to fixed px — at 375px
   those caps collapse the switches, chips and icons to nothing. */
@media (max-width: 560px) {
  .gg-lead { height: 5vh; }
  .gg-tail { height: 10vh; }
  .gg-grid { width: 92vw; grid-template-columns: 1fr; gap: 9px; }
  .gg-card { padding: 16px; border-radius: 16px; }
  .gg-girl, .gg-lang, .gg-stat, .gg-multi, .gg-omni {
    grid-column: 1; grid-row: auto; min-height: 0;
  }

  .gg-girl { padding: 0; min-height: 410px; }
  .gg-thread { padding: 16px; gap: 8px; }
  .gg-bubble { max-width: 80%; font-size: 12.5px; border-radius: 14px; padding: 9px 13px; }
  .gg-girl-copy { padding: 17px; }
  .gg-girl-copy h3 { font-size: 22px; }
  .gg-girl-copy p { font-size: 12.5px; }

  .gg-lang { min-height: 178px; }
  .gg-sw { --h: 36px; }
  .gg-sw-code { font-size: 14px; }

  .gg-foot > span, .gg-stat-label { font-size: 12px; }
  .gg-foot h3 { font-size: 21px; }

  .gg-stat { min-height: 160px; gap: 8px; }
  .gg-stat strong { font-size: 44px; }

  .gg-multi { min-height: 180px; }
  .gg-lead-row, .gg-sub-row { font-size: 13px; }
  .gg-dot { width: 20px; }

  .gg-omni { min-height: 210px; }
  /* stacked on a phone there is a card directly above, so keep the fan inside */
  .gg-stat { overflow: hidden; }
  .gg-folder { margin-top: 0; }
  .gg-chip--mail  { width: 36px; }
  .gg-chip--mic   { width: 50px; }
  .gg-chip--globe { width: 40px; }
  .gg-chip--cal   { width: 32px; }

  /* a tap has no hover, so the lift would stick after touch */
  .gg-omni:hover .gg-chip { transform: none; box-shadow: 0 4px 15px -4px rgba(20, 20, 40, 0.26); }
}

@media (max-width: 380px) {
  .gg-girl-copy h3 { font-size: 20px; }
  .gg-stat strong { font-size: 38px; }
  .gg-sw { --h: 33px; }
  .gg-lead-row, .gg-sub-row { font-size: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .gg-grid.gg-in .gg-card,
  .gg-grid.gg-in .gg-chip,
  .gg-grid.gg-in .gg-arc-live,
  .gg-chip--mic.is-rec::before,
  .gg-chip--mic.is-rec::after,
  .gg-eq i { animation: none; opacity: 1; transform: none; }
  .gg-eq i { height: 60%; }
  .gg-bubble, .gg-sw, .gg-sw-knob, .gg-sw-track, .gg-sw-code, .gg-chip { transition: none; }
}
`
