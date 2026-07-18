"use client"

/* ─────────────────────────────────────────────
   LENA VOSS — fashion photographer portfolio
   Preloader → 3D spiral gallery (hover = color)

   Rewrite notes (embed-safe by design):
   - No network fonts (no @import) → no late font-swap reflow
   - No per-frame React state → rAF writes styles via refs only
   - All geometry measured from the container, never window
   - Every layer absolutely positioned inside a clipped root
   ───────────────────────────────────────────── */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

// ─── Data ────────────────────────────────────

const IMG = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/09_b5kt8t.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/06_p0lonf.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/08_bu1urh.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/03_sceom4.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/02_efyml3.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/05_ccn9so.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/01_wvqrxz.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876069/5_bgrt7d.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876068/2_jogaln.jpg",
]

interface Project {
  id: string
  name: string
  pub: string
  img: string
}

const PROJECTS: Project[] = [
  { id: "01", name: "NOCTURNE", pub: "VOGUE", img: IMG[0] },
  { id: "02", name: "SILHOUETTES", pub: "DAZED", img: IMG[1] },
  { id: "03", name: "IVORY", pub: "HARPER'S BAZAAR", img: IMG[2] },
  { id: "04", name: "STATIC", pub: "i-D", img: IMG[3] },
  { id: "05", name: "MERIDIAN", pub: "ANOTHER", img: IMG[4] },
  { id: "06", name: "VELVET", pub: "NUMÉRO", img: IMG[5] },
  { id: "07", name: "ASHES", pub: "PURPLE", img: IMG[6] },
  { id: "08", name: "HALO", pub: "SELF SERVICE", img: IMG[7] },
  { id: "09", name: "MIRAGE", pub: "W MAGAZINE", img: IMG[8] },
  { id: "10", name: "TIDE", pub: "RE-EDITION", img: IMG[0] },
  { id: "11", name: "EMBERS", pub: "LOVE", img: IMG[3] },
  { id: "12", name: "PALE FIRE", pub: "SYSTEM", img: IMG[6] },
]

const STEP = 360 / PROJECTS.length

// ─── Utilities ───────────────────────────────

const norm180 = (a: number) => {
  let x = ((a % 360) + 360) % 360
  if (x > 180) x -= 360
  return x
}

/* fallback for sandboxed previews that block external images */
const placeholder = (seed: number, label: string) => {
  const g1 = 14 + ((seed * 37) % 30)
  const g2 = 40 + ((seed * 53) % 60)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='440' height='560'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='rgb(${g1},${g1},${g1})'/>
      <stop offset='1' stop-color='rgb(${g2},${g2},${g2 + 8})'/>
    </linearGradient></defs>
    <rect width='440' height='560' fill='url(#g)'/>
    <circle cx='${80 + ((seed * 61) % 280)}' cy='${120 + ((seed * 97) % 320)}' r='${50 + ((seed * 29) % 90)}' fill='rgb(${g2 + 30},${g2 + 30},${g2 + 34})' opacity='.35'/>
    <text x='24' y='530' font-family='monospace' font-size='16' letter-spacing='6' fill='rgba(232,228,220,.5)'>${label}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/* ── Preloader — rAF writes textContent, zero re-renders ── */
function Preloader({ done }: { done: () => void }) {
  const numRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const doneRef = useRef(done)
  useEffect(() => {
    doneRef.current = done
  }, [done])
  useEffect(() => {
    const t0 = performance.now()
    const dur = 1900
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      const n = Math.round(eased * 100)
      if (numRef.current) numRef.current.textContent = String(n)
      if (barRef.current) barRef.current.style.transform = `scaleX(${n / 100})`
      if (p < 1) raf = requestAnimationFrame(tick)
      else window.setTimeout(() => doneRef.current(), 350)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="lv-pre">
      <div className="lv-pre-num" ref={numRef}>0</div>
      <div className="lv-pre-label">LENA VOSS — SHOWREEL 2026</div>
      <div className="lv-pre-bar">
        <span ref={barRef} />
      </div>
    </div>
  )
}

/* ── Rotating badge ────────────────────────── */
function Badge() {
  const text = "SHOWREEL 2026 — FASHION · EDITORIAL · "
  return (
    <div className="lv-badge">
      <svg viewBox="0 0 120 120">
        <defs>
          <path id="lv-c" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text>
          <textPath href="#lv-c">{text}</textPath>
        </text>
        <circle cx="60" cy="60" r="2.4" fill="currentColor" />
      </svg>
    </div>
  )
}

/* ── Hero ──────────────────────────────────── */
export default function LenaHero() {
  const [loaded, setLoaded] = useState(false)
  const [view, setView] = useState<"spiral" | "list">("spiral")

  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const imgRefs = useRef<(HTMLImageElement | null)[]>([])
  const curIdRef = useRef<HTMLSpanElement>(null)
  const curNameRef = useRef<HTMLSpanElement>(null)

  /* motion state — refs only, never React state */
  const rotRef = useRef(0)
  const velRef = useRef(0.12)
  const scrollVelRef = useRef(0)
  const dragRef = useRef<{ x: number; start: number } | null>(null)
  const hoverIdxRef = useRef<number>(-1)
  const dimsRef = useRef({ w: 1200, h: 800 })
  const viewRef = useRef(view)
  useEffect(() => {
    viewRef.current = view
  }, [view])

  /* measure the container (never the window) */
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const set = () => {
      dimsRef.current = {
        w: el.clientWidth || 1200,
        h: el.clientHeight || 800,
      }
    }
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* single rAF loop — writes transforms directly to the DOM */
  useEffect(() => {
    let raf = 0
    let lastFront = -1
    const loop = () => {
      if (viewRef.current === "spiral") {
        if (!dragRef.current) {
          const target = hoverIdxRef.current >= 0 ? 0.02 : 0.12
          velRef.current += (target - velRef.current) * 0.04
          rotRef.current += velRef.current + scrollVelRef.current
          scrollVelRef.current *= 0.93
          if (Math.abs(scrollVelRef.current) < 0.001) scrollVelRef.current = 0
        }
        const { w, h } = dimsRef.current
        const radius = Math.min(w * 0.38, 560)
        const spread = Math.min(h * 0.58, 520)
        const rot = rotRef.current

        let front = 0
        let best = 999
        for (let i = 0; i < PROJECTS.length; i++) {
          const angle = rot + i * STEP
          const a = norm180(angle)
          const ad = Math.abs(a)
          if (ad < best) {
            best = ad
            front = i
          }
          const card = cardRefs.current[i]
          if (!card) continue
          const y = (a / 360) * spread
          const depth = (Math.cos((a * Math.PI) / 180) + 1) / 2
          const isHover = hoverIdxRef.current === i
          card.style.transform = `translate(-50%,-50%) rotateY(${angle}deg) translateZ(${radius}px) translateY(${y}px) scale(${isHover ? 1.07 : 1})`
          card.style.zIndex = String(Math.round(depth * 100))
          card.style.opacity = String(0.25 + depth * 0.75)
          const img = imgRefs.current[i]
          if (img) {
            img.style.filter = isHover
              ? "grayscale(0) brightness(1.05) contrast(1.05)"
              : `grayscale(1) brightness(${0.22 + depth * 0.3}) contrast(1.15)`
          }
        }
        /* front-most project meta (textContent write, no re-render) */
        if (front !== lastFront) {
          lastFront = front
          const fp = PROJECTS[front]
          if (curIdRef.current) curIdRef.current.textContent = fp.id
          if (curNameRef.current)
            curNameRef.current.textContent = `${fp.name} — ${fp.pub}`
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* drag — starts on the stage, tracked on window while held */
  const onDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, start: rotRef.current }
  }, [])
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return
      rotRef.current =
        dragRef.current.start + (e.clientX - dragRef.current.x) * 0.25
    }
    const onUp = () => {
      dragRef.current = null
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [])

  /* wheel — scoped to the demo root, spins the gallery */
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (viewRef.current !== "spiral") return
      e.preventDefault()
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      scrollVelRef.current = Math.max(
        -6,
        Math.min(6, scrollVelRef.current + delta * 0.004)
      )
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  return (
    <div className="lv-root" ref={rootRef}>
      <style>{css}</style>

      {!loaded && <Preloader done={() => setLoaded(true)} />}

      <div className="lv-grid" />

      {/* spiral view */}
      <div
        className={`lv-stage ${loaded && view === "spiral" ? "in" : ""}`}
        ref={stageRef}
        onPointerDown={onDown}
      >
        <div className="lv-ring">
          {PROJECTS.map((p, i) => (
            <div
              key={p.id}
              className="lv-card"
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              onMouseEnter={() => {
                hoverIdxRef.current = i
              }}
              onMouseLeave={() => {
                hoverIdxRef.current = -1
              }}
            >
              <img
                ref={(el) => {
                  imgRefs.current[i] = el
                }}
                src={p.img}
                onError={(e) => {
                  e.currentTarget.src = placeholder(i + 3, `${p.id} ${p.name}`)
                }}
                alt={p.name}
                draggable={false}
              />
              <div className="lv-card-tag">
                {p.id} — {p.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* list view */}
      {view === "list" && (
        <div className="lv-list">
          {PROJECTS.map((p, i) => (
            <a key={p.id} className="lv-row">
              <span className="lv-row-id">{p.id}</span>
              <span className="lv-row-name">{p.name}</span>
              <span className="lv-row-pub">{p.pub}</span>
              <img
                className="lv-row-peek"
                src={p.img}
                onError={(e) => {
                  e.currentTarget.src = placeholder(i + 3, p.name)
                }}
                alt=""
                draggable={false}
              />
            </a>
          ))}
        </div>
      )}

      {/* title */}
      <div className={`lv-hero ${loaded ? "in" : ""}`}>
        <p className="lv-eyebrow">FASHION PHOTOGRAPHER — PARIS</p>
        <h1>
          {"LENA VOSS".split("").map((ch, i) => (
            <span key={i} style={{ transitionDelay: `${0.05 * i + 0.2}s` }}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </h1>
      </div>

      {/* view switch */}
      <nav className={`lv-switch ${loaded ? "in" : ""}`}>
        <button
          className={view === "spiral" ? "on" : ""}
          onClick={() => setView("spiral")}
        >
          spiral
        </button>
        <span className="lv-dot" />
        <button
          className={view === "list" ? "on" : ""}
          onClick={() => setView("list")}
        >
          list
        </button>
      </nav>

      {/* corners */}
      <div className={`lv-bl ${loaded ? "in" : ""}`}>
        <Badge />
      </div>
      <div className={`lv-br ${loaded ? "in" : ""}`}>
        <span className="lv-cur-id" ref={curIdRef}>01</span>
        <span className="lv-cur-line" />
        <span className="lv-cur-name" ref={curNameRef}>
          NOCTURNE — VOGUE
        </span>
      </div>
    </div>
  )
}

/* ── styles — no @import, local font stacks only ── */
const css = `
.lv-root, .lv-root * { margin:0; padding:0; box-sizing:border-box; overflow-anchor:none; }
.lv-root {
  --ink:var(--background, #0c0b0a);
  --bone:var(--foreground, #e8e4dc);
  --dim:var(--muted-foreground, #6b675f);
  --serif:'Didot','Bodoni MT','Playfair Display','Cormorant Garamond',Georgia,'Times New Roman',serif;
  --sans:ui-sans-serif,system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif;
  --bone-3:color-mix(in oklab, var(--bone) 3.5%, transparent);
  --bone-10:color-mix(in oklab, var(--bone) 10%, transparent);
  --bone-12:color-mix(in oklab, var(--bone) 12%, transparent);
  --bone-35:color-mix(in oklab, var(--bone) 35%, transparent);
  --bone-55:color-mix(in oklab, var(--bone) 55%, transparent);
  --shadow:color-mix(in oklab, var(--ink) 55%, rgba(0,0,0,.55));
  position:relative; width:100%; height:100vh; overflow:hidden;
  container-type:inline-size;
  background:var(--ink); color:var(--bone);
  font-family:var(--sans); user-select:none;
}
.lv-grid { position:absolute; inset:0; pointer-events:none; opacity:.5;
  background-image:linear-gradient(var(--bone-3) 1px,transparent 1px),
    linear-gradient(90deg, var(--bone-3) 1px,transparent 1px);
  background-size:120px 120px; }

/* preloader — counter uses tabular figures so digits never reflow */
.lv-pre { position:absolute; inset:0; z-index:200; background:var(--ink);
  display:flex; flex-direction:column; justify-content:flex-end; padding:6vh 5cqw; }
.lv-pre-num { font-family:var(--serif); font-size:clamp(90px,18cqw,240px);
  line-height:.9; font-variant-numeric:tabular-nums; min-width:2ch; }
.lv-pre-label { margin-top:16px; font-size:11px; letter-spacing:.35em; color:var(--dim); }
.lv-pre-bar { margin-top:24px; height:1px; background:var(--bone-12); }
.lv-pre-bar span { display:block; height:100%; background:var(--bone);
  transform-origin:left; transform:scaleX(0); }

/* spiral stage */
.lv-stage { position:absolute; inset:0; perspective:1400px; cursor:grab;
  overflow:hidden; contain:layout paint;
  opacity:0; transition:opacity 1.4s ease .3s; }
.lv-stage.in { opacity:1; }
.lv-stage:active { cursor:grabbing; }
.lv-ring { position:absolute; left:50%; top:46%; transform-style:preserve-3d; }
.lv-card { position:absolute; width:clamp(140px,15cqw,235px); aspect-ratio:4/5;
  transform-style:preserve-3d; will-change:transform; }
.lv-card img { width:100%; height:100%; object-fit:cover; border-radius:10px;
  display:block; box-shadow:0 30px 60px var(--shadow); pointer-events:auto; }
.lv-card-tag { position:absolute; left:2px; bottom:-26px; font-size:10px;
  letter-spacing:.3em; color:var(--bone); opacity:0; transform:translateY(6px);
  transition:all .4s ease; white-space:nowrap; }
.lv-card:hover .lv-card-tag { opacity:.9; transform:none; }

/* title */
.lv-hero { position:absolute; left:0; right:0; bottom:10vh; z-index:40;
  text-align:center; pointer-events:none; }
.lv-eyebrow { font-size:11px; letter-spacing:.5em; color:var(--dim);
  margin-bottom:1.5vh; opacity:0; transition:opacity 1s ease .9s; }
.lv-hero.in .lv-eyebrow { opacity:1; }
.lv-hero h1 { font-family:var(--serif); font-weight:400;
  font-size:clamp(56px,11cqw,180px); line-height:.85; letter-spacing:.04em;
  mix-blend-mode:difference; }
.lv-hero h1 span { display:inline-block; opacity:0; transform:translateY(60%);
  transition:opacity .9s ease, transform .9s cubic-bezier(.2,.8,.2,1); }
.lv-hero.in h1 span { opacity:1; transform:none; }

/* view switch */
.lv-switch { position:absolute; left:50%; bottom:4vh; transform:translateX(-50%);
  z-index:50; display:flex; align-items:center; gap:16px; font-size:14px;
  opacity:0; transition:opacity .8s ease .4s; }
.lv-switch.in { opacity:1; }
.lv-switch button { background:none; border:none; color:var(--dim); font:inherit;
  letter-spacing:.06em; cursor:pointer; transition:color .3s; }
.lv-switch button.on, .lv-switch button:hover { color:var(--bone); }
.lv-dot { width:4px; height:4px; border-radius:50%; background:var(--dim); }

/* corners */
.lv-bl { position:absolute; left:48px; bottom:44px; z-index:45;
  opacity:0; transition:opacity 1s ease 1.2s; }
.lv-br { position:absolute; right:48px; bottom:44px; z-index:45;
  display:flex; align-items:center; gap:14px; font-size:12px; letter-spacing:.28em;
  opacity:0; transition:opacity 1s ease 1.2s; }
.lv-bl.in, .lv-br.in { opacity:1; }
.lv-cur-id { color:var(--dim); }
.lv-cur-line { width:44px; height:1px; background:var(--bone-35); }
.lv-cur-name { color:var(--bone); }
.lv-badge { width:118px; height:118px; animation:lv-spin 14s linear infinite; }
.lv-badge svg { width:100%; height:100%; overflow:visible; }
.lv-badge text { font-size:10.5px; letter-spacing:.32em; fill:var(--bone-55);
  font-family:var(--sans); }
@keyframes lv-spin { to { transform:rotate(360deg); } }

/* list view */
.lv-list { position:absolute; inset:0; z-index:30; padding:14vh 8cqw 20vh;
  overflow-y:auto; opacity:0; animation:lv-fadein .8s ease forwards; }
@keyframes lv-fadein { to { opacity:1; } }
.lv-row { display:grid; grid-template-columns:60px 1fr auto; align-items:baseline;
  gap:24px; padding:22px 0; border-bottom:1px solid var(--bone-10);
  cursor:pointer; position:relative; }
.lv-row-id { font-size:12px; letter-spacing:.2em; color:var(--dim); }
.lv-row-name { font-family:var(--serif); font-size:clamp(28px,4.5cqw,64px);
  line-height:1; color:var(--dim); transition:color .35s, letter-spacing .35s; }
.lv-row-pub { font-size:11px; letter-spacing:.3em; color:var(--dim); }
.lv-row:hover .lv-row-name { color:var(--bone); letter-spacing:.06em; }
.lv-row-peek { position:absolute; right:14%; top:50%;
  width:clamp(130px,15cqw,220px); aspect-ratio:4/5; object-fit:cover;
  border-radius:8px; box-shadow:0 24px 50px var(--shadow);
  pointer-events:none; z-index:5;
  opacity:0; transform:translateY(-42%) scale(.55) rotate(8deg);
  transition:opacity .45s ease, transform .5s cubic-bezier(.2,.8,.2,1); }
.lv-row:hover .lv-row-peek { opacity:1; transform:translateY(-50%) scale(1) rotate(3deg); }

@media (prefers-reduced-motion: reduce) {
  .lv-badge { animation:none !important; }
  .lv-hero h1 span, .lv-card { transition:none !important; }
}
@media (max-width:640px) {
  .lv-bl { display:none; }
  .lv-br { right:20px; bottom:24px; font-size:10px; }
}
`
