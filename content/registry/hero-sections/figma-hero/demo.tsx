"use client"

import React, { useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   figma-hero — Figma-canvas portfolio hero
   ─ hover any text → Figma selection box
     (blue outline, corner handles, "Text" tag)
   ─ "David" collaborator cursor wanders the
     canvas on its own, even when you stop
   ─ MARTÍN renders as glitchy bitmap pixels
   ───────────────────────────────────────────── */

const PALETTE = [
  "#e56d1f", "#2d5fd0", "#8ec9e8", "#e8b64c",
  "#c9622a", "#4a83e0", "#1c2f66", "#d8d0c4",
]

export default function FigmaHero() {
  const rootRef = useRef<HTMLDivElement>(null)
  const pixRef  = useRef<HTMLCanvasElement>(null)
  const curRef  = useRef<HTMLDivElement>(null)
  const meRef   = useRef<HTMLDivElement>(null)
  /* empty until mount — keeps SSR and client markup identical */
  const [now, setNow] = useState({ clock: "--:--", date: "" })

  /* ── your own cursor — black Figma arrow + "You" pill ── */
  useEffect(() => {
    const root = rootRef.current
    const el   = meRef.current
    if (!root || !el) return

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      el.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`
      el.style.opacity   = "1"
    }
    const onLeave = () => { el.style.opacity = "0" }

    root.addEventListener("pointermove",  onMove)
    root.addEventListener("pointerleave", onLeave)
    return () => {
      root.removeEventListener("pointermove",  onMove)
      root.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  /* ── live NYC clock + date ── */
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setNow({
        clock: d.toLocaleTimeString("en-US", {
          timeZone: "America/New_York",
          hour: "numeric",
          minute: "2-digit",
        }),
        date: d.toLocaleDateString("en-US", {
          timeZone: "America/New_York",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })
    }
    tick()
    const id = setInterval(tick, 20000)
    return () => clearInterval(id)
  }, [])

  /* ── MARTÍN — pixelated bitmap text, re-glitched periodically ── */
  useEffect(() => {
    const canvas = pixRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let retry = 0
    const render = () => {
      const W = canvas.clientWidth
      const H = canvas.clientHeight
      /* layout may not be settled on first paint — retry a few frames */
      if (!W || !H) {
        if (retry++ < 30) requestAnimationFrame(render)
        return
      }
      retry = 0

      /* draw text tiny into an offscreen canvas, then read cells */
      const cols = 88, rows = 22
      const off  = document.createElement("canvas")
      off.width  = cols
      off.height = rows
      const octx = off.getContext("2d")
      if (!octx) return

      octx.fillStyle    = "#000"
      octx.font         = `bold ${rows * 0.92}px Georgia, serif`
      octx.textBaseline = "middle"
      octx.textAlign    = "center"
      octx.fillText("MARTÍN", cols / 2, rows * 0.58)
      const data = octx.getImageData(0, 0, cols, rows).data

      canvas.width  = W
      canvas.height = H
      ctx.clearRect(0, 0, W, H)

      const cw = W / cols, ch = H / rows
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const a = data[(y * cols + x) * 4 + 3]
          if (a > 40) {
            ctx.fillStyle = PALETTE[Math.floor(Math.random() * PALETTE.length)]
            ctx.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw), Math.ceil(ch))
          } else if (Math.random() < 0.012) {
            /* stray glitch pixels around the letters */
            ctx.fillStyle = PALETTE[Math.floor(Math.random() * PALETTE.length)] + "88"
            ctx.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw), Math.ceil(ch))
          }
        }
      }
    }

    render()
    const id = setInterval(render, 700) // gentle re-glitch
    window.addEventListener("resize", render)
    return () => {
      clearInterval(id)
      window.removeEventListener("resize", render)
    }
  }, [])

  /* ── "David" collaborator cursor — wanders on its own ── */
  useEffect(() => {
    const root = rootRef.current
    const el   = curRef.current
    if (!root || !el) return

    let raf: number
    const pos  = { x: root.clientWidth * 0.45, y: root.clientHeight * 0.62 }
    let tgt    = { x: pos.x, y: pos.y }
    let nextPick = 0

    const pick = (now: number) => {
      /* wander mostly around the name area, sometimes far away */
      const W = root.clientWidth
      const H = root.clientHeight
      const wide = Math.random() < 0.3
      tgt = {
        x: W * (wide ? 0.1 + Math.random() * 0.8 : 0.3 + Math.random() * 0.4),
        y: H * (wide ? 0.1 + Math.random() * 0.75 : 0.28 + Math.random() * 0.4),
      }
      nextPick = now + 1400 + Math.random() * 2600
    }

    const tick = (now: number) => {
      if (now > nextPick) pick(now)
      const t = now / 1000
      pos.x += (tgt.x - pos.x) * 0.022
      pos.y += (tgt.y - pos.y) * 0.022
      /* a little organic wobble so it never sits still */
      const wx = Math.sin(t * 1.3) * 6 + Math.sin(t * 0.7) * 4
      const wy = Math.cos(t * 1.1) * 6 + Math.sin(t * 0.9) * 4
      el.style.transform = `translate(${pos.x + wx}px, ${pos.y + wy}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="fgm-root" ref={rootRef}>
      <style>{CSS}</style>

      {/* ── header ── */}
      <div className="fgm-meta">
        NYC {now.clock} · {now.date}
        <br />
        <span className="fgm-dim">79°F ☼</span>
      </div>
      <button className="fgm-collab">⧉&nbsp; Collaboration on</button>

      {/* ── right edge badges ── */}
      <div className="fgm-badge fgm-w">W.<span>Honors</span></div>
      <div className="fgm-badge fgm-laus"><i /><b>Laus</b>In Book&apos;26</div>

      {/* ── hero ── */}
      <div className="fgm-hero">
        <div className="fgm-row">
          {/* DAVID — selection box only on hover */}
          <div className="fgm-sel fgm-in fgm-in-1">
            <span className="fgm-tag">Text</span>
            <i className="fgm-h tl" /><i className="fgm-h tr" />
            <i className="fgm-h bl" /><i className="fgm-h br" />
            <h1>DAVID</h1>
          </div>

          <p className="fgm-blurb fgm-sel fgm-in fgm-in-2">
            <span className="fgm-tag">Text</span>
            <i className="fgm-h tl" /><i className="fgm-h tr" />
            <i className="fgm-h bl" /><i className="fgm-h br" />
            Product leader. 15+ years shipping B2C products as Founder, CPO, and
            Design lead. I help teams find the sharpest problem, then ship the
            cleanest solution.
          </p>
        </div>

        {/* MARTÍN — pixel glitch */}
        <div className="fgm-sel fgm-martin fgm-in fgm-in-3">
          <span className="fgm-tag">Text</span>
          <i className="fgm-h tl" /><i className="fgm-h tr" />
          <i className="fgm-h bl" /><i className="fgm-h br" />
          <div className="fgm-minibar"><i /><i className="o" /></div>
          <canvas ref={pixRef} />
        </div>

        <div className="fgm-sel fgm-suarez fgm-in fgm-in-4">
          <span className="fgm-tag">Text</span>
          <i className="fgm-h tl" /><i className="fgm-h tr" />
          <i className="fgm-h bl" /><i className="fgm-h br" />
          <h1>SUÁREZ</h1>
        </div>
      </div>

      {/* ── your cursor — black, labeled "You" ── */}
      <div className="fgm-me" ref={meRef}>
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path d="M5 3l14 8-6.5 1.5L9 19z" fill="#16161a" stroke="#fff" strokeWidth="1.4" />
        </svg>
        <span>You</span>
      </div>

      {/* ── wandering collaborator cursor ── */}
      <div className="fgm-cursor" ref={curRef}>
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path d="M5 3l14 8-6.5 1.5L9 19z" fill="#8b5cf6" stroke="#fff" strokeWidth="1.4" />
        </svg>
        <span>David</span>
      </div>

      {/* ── footer CTA ── */}
      <div className="fgm-cta">
        <button>Get to know me</button>
        <p>Or scroll down<br />↓</p>
      </div>
      <div className="fgm-strip" />
    </div>
  )
}

const CSS = `
/* ── Root ── */
.fgm-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f5f5f4;
  font-family: var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif);
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  cursor: none;
  background-image: linear-gradient(90deg, rgba(15,23,42,.05) 1px, transparent 1px);
  background-size: calc(100% / 6) 100%;
}

/* ── Header ── */
.fgm-meta {
  position: absolute;
  top: 20px; left: 22px;
  font-size: 13.5px;
  line-height: 1.6;
  z-index: 20;
}
.fgm-dim { color: #7a7a74; }
.fgm-collab {
  position: absolute;
  top: 18px; right: 22px;
  z-index: 20;
  background: none;
  border: 1px solid #d6d3cd;
  border-radius: 999px;
  padding: 9px 18px;
  font-family: inherit;
  font-size: 13.5px;
  color: #3f3f3a;
  cursor: none;
}

/* ── Right badges ── */
.fgm-badge { position: absolute; right: 0; z-index: 20; }
.fgm-w {
  top: 31%;
  background: #111; color: #fff;
  width: 64px;
  padding: 14px 0 18px;
  text-align: center;
  font-size: 20px; font-weight: 600;
}
.fgm-w span {
  display: block;
  margin-top: 42px;
  writing-mode: vertical-rl;
  font-size: 12px; font-weight: 400;
  letter-spacing: .05em;
}
.fgm-laus {
  top: 50%;
  width: 64px;
  text-align: left;
  padding-left: 8px;
  font-size: 10px;
  color: #111;
  line-height: 1.3;
}
.fgm-laus i {
  display: block;
  width: 44px; height: 78px;
  background: #111;
  border-radius: 0 0 0 26px;
  margin-bottom: 8px;
}
.fgm-laus b { display: block; font-size: 17px; }

/* ── Hero layout ── */
.fgm-hero {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-41%, -52%);
  width: min(72vw, 1100px);
  z-index: 5;
}
.fgm-row { display: flex; align-items: flex-start; gap: 60px; }
.fgm-hero h1 {
  margin: 0;
  font-weight: 300;
  font-size: clamp(64px, 8.6vw, 150px);
  line-height: 1;
  letter-spacing: -.025em;
  text-transform: uppercase;
  color: #0f172a;
  white-space: nowrap;
}
.fgm-blurb {
  margin: 24px 0 0;
  max-width: 390px;
  font-size: 16.5px;
  line-height: 1.6;
  color: #33415c;
  font-weight: 400;
}
/* .fgm-sel sets width:fit-content further down this sheet — the double-class
   selector keeps MARTÍN's width definite so the canvas can size itself. */
.fgm-sel.fgm-martin {
  margin: 6px 0 0 18%;
  width: clamp(240px, 17.5vw, 400px);
}

/* ── On-appear stagger ── */
.fgm-in {
  opacity: 0;
  animation: fgmIn .7s cubic-bezier(.22,1,.36,1) forwards;
}
.fgm-in-1 { animation-delay: .05s; }
.fgm-in-2 { animation-delay: .17s; }
.fgm-in-3 { animation-delay: .29s; }
.fgm-in-4 { animation-delay: .41s; }
@keyframes fgmIn {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .fgm-in { animation: none; opacity: 1; }
}
.fgm-martin canvas {
  width: 100%;
  height: clamp(70px, 8.6vw, 150px);
  display: block;
}
.fgm-suarez { margin: 10px 0 0 -4%; }

/* ── Figma selection box ── */
.fgm-sel {
  position: relative;
  padding: 6px 10px;
  width: fit-content;
  outline: 1px solid transparent;
  outline-offset: 0;
  border-radius: 2px;
  transition: outline-color .15s;
  cursor: none;
}
.fgm-sel .fgm-tag {
  position: absolute;
  top: -22px; left: -1px;
  background: #3b82f6;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity .15s;
  z-index: 3;
}
.fgm-sel .fgm-h {
  position: absolute;
  width: 7px; height: 7px;
  background: #fff;
  border: 1.5px solid #3b82f6;
  opacity: 0;
  transition: opacity .15s;
  z-index: 3;
}
.fgm-sel .fgm-h.tl { left: -4px;  top: -4px; }
.fgm-sel .fgm-h.tr { right: -4px; top: -4px; }
.fgm-sel .fgm-h.bl { left: -4px;  bottom: -4px; }
.fgm-sel .fgm-h.br { right: -4px; bottom: -4px; }
.fgm-sel:hover { outline-color: #3b82f6; }
.fgm-sel:hover .fgm-tag,
.fgm-sel:hover .fgm-h { opacity: 1; }

/* ── Your own cursor ── */
.fgm-me {
  position: absolute;
  left: 0; top: 0;
  z-index: 40;
  pointer-events: none;
  opacity: 0;
  will-change: transform;
}
.fgm-me span {
  position: absolute;
  left: 13px; top: 16px;
  background: #16161a;
  color: #fff;
  font-size: 12.5px;
  padding: 3px 12px;
  border-radius: 999px;
  white-space: nowrap;
}

/* ── Mini toolbar above MARTÍN ── */
.fgm-minibar {
  position: absolute;
  top: -14px; left: 38%;
  background: #3b82f6;
  border-radius: 999px;
  padding: 4px 9px;
  display: flex;
  gap: 5px;
  z-index: 4;
}
.fgm-minibar i { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
.fgm-minibar i.o { background: rgba(255,255,255,.45); }

/* ── Wandering collaborator cursor ── */
.fgm-cursor {
  position: absolute;
  left: 0; top: 0;
  z-index: 30;
  pointer-events: none;
  will-change: transform;
}
.fgm-cursor span {
  position: absolute;
  left: 13px; top: 16px;
  background: #8b5cf6;
  color: #fff;
  font-size: 12.5px;
  padding: 3px 12px;
  border-radius: 999px;
  white-space: nowrap;
}

/* ── CTA ── */
.fgm-cta {
  position: absolute;
  left: 50%; bottom: 52px;
  transform: translateX(-50%);
  text-align: center;
  z-index: 20;
}
.fgm-cta button {
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 16px 30px;
  font-family: inherit;
  font-size: 15.5px;
  cursor: none;
}
.fgm-cta p { margin: 12px 0 0; font-size: 13px; color: #6b6b64; line-height: 1.5; }
.fgm-strip {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 34px;
  background: #161615;
}

/* ── Responsive ── */
@media (max-width: 860px) {
  .fgm-row { flex-direction: column; gap: 16px; }
  .fgm-hero { width: 88vw; top: 14%; transform: translate(-50%, 0); }
  .fgm-sel.fgm-martin { margin-left: 6%; width: 74vw; }
  .fgm-badge { display: none; }
}
`
