"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

/* ─────────────────────────────────────────────
   pixel2-animation — pixel page transition (center burst)

   Ported from the Codrops "Pixel Transition"
   demo 2 (based on Niccolò Miranda's
   animation). Click an image in the intro to
   open its page: a grid of pixel cells covers
   the view, the content swaps underneath, and
   the cells clear again. The arrow button plays
   the reverse.

   Demo 2: green cells burst out from the center to open
   and close in from the edges, while the intro stretches
   wide and the page image grows in from half width.

   Contained: the overlay and loader are scoped
   to the component and sizes use container
   units, so it works inside any frame.
   ───────────────────────────────────────────── */

const ROWS = 9
const COLUMNS = 17

const IMAGES = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785691408/t4_hytpjp.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518647/cld-sample-4.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518640/samples/balloons.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518637/samples/food/spices.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518631/sample.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518646/samples/paper.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1782376374/z1_iulawo.png",
]

/* intro sequence: words and image slots, in order */
const INTRO: ({ t: string; f?: 1 | 2 | 3 } | { img: number })[] = [
  { t: "Every", f: 3 },
  { img: 0 },
  { t: "pixel" },
  { img: 1 },
  { t: "has", f: 1 },
  { t: "a" },
  { img: 2 },
  { t: "purpose", f: 2 },
  { img: 3 },
  { t: "every", f: 1 },
  { img: 4 },
  { t: "click", f: 2 },
  { img: 5 },
  { t: "tells" },
  { t: "a" },
  { img: 6 },
  { t: "story", f: 2 },
]

const CONTENT = [
  { title: "Every pixel has a purpose.", num: "P01", meta: ["Pixel Grid", "8 × 14", "Precise"] },
  { title: "Motion that feels intentional.", num: "A12", meta: ["Animations", "GSAP", "60 fps"] },
  { title: "Hover is a conversation.", num: "H33", meta: ["Micro-interactions", "Subtle", "Snappy"] },
  { title: "Every click tells a story.", num: "S21", meta: ["Transitions", "Staggered", "Smooth"] },
  { title: "Illustrations you can play with.", num: "I17", meta: ["Illustrations", "SVG", "Playful"] },
  { title: "Small details, big impressions.", num: "D64", meta: ["Details", "Polish", "Craft"] },
  { title: "Delight is a feature.", num: "Z42", meta: ["zepa.design", "Motion", "Made with care"] },
]

const CSS = `
.px2-root {
  --color-text: #000;
  --color-gr-1: #81e2c6;
  --color-gr-2: #e7613c;
  --color-bg: #f9f9f9;
  --color-link: #d23636;
  --color-link-hover: #df6b47;
  --color-back: #d23636;
  --color-back-hover: #df6b47;
  --color-bg-overlay: rgb(37, 116, 66);
  --pad: 18px;
  box-sizing: border-box; position: relative; display: grid; width: 100%;
  height: 100vh; height: 100dvh; min-height: 560px; overflow: hidden;
  color: var(--color-text); background-color: var(--color-bg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 12px;
  -webkit-font-smoothing: antialiased; container-type: inline-size;
}
.px2-root *, .px2-root *::before, .px2-root *::after { box-sizing: border-box; }
.px2-root a { text-decoration: none; color: var(--color-link); outline: none; }
.px2-root a:hover { color: var(--color-link-hover); }

/* loader (contained) */
.px2-root.px2-loading::before, .px2-root.px2-loading::after { content: ""; position: absolute; z-index: 1000; }
.px2-root.px2-loading::before { inset: 0; background: var(--color-bg); }
.px2-root.px2-loading::after { top: 50%; left: 50%; width: 100px; height: 100px; margin: -50px 0 0 -50px; border-radius: 50%; border: 2px solid var(--color-gr-2); animation: px2-loader .7s linear infinite alternate forwards; }
@keyframes px2-loader { to { opacity: 1; transform: scale3d(.5,.5,1) } }

.px2-hl { white-space: nowrap; overflow: hidden; position: relative; }
.px2-hl::before { content: ""; height: 1px; width: 100%; background: currentColor; position: absolute; top: 92%; transition: transform .3s; transform-origin: 0% 50%; }
.px2-hl:hover::before { transform: scaleX(0); transform-origin: 100% 50%; }
.px2-unbutton { background: none; border: 0; padding: 0; margin: 0; font: inherit; cursor: pointer; }

.px2-frame { grid-area: 1 / 1 / 2 / 2; text-align: center; display: flex; padding: var(--pad) calc(var(--pad) + .6cqw); flex-wrap: wrap; align-self: start; position: relative; z-index: 100; column-gap: 5cqw; row-gap: 12px; font-weight: 600; background: linear-gradient(to bottom, var(--color-bg), transparent); }
.px2-frame h1 { font-size: inherit; margin: 0; font-weight: inherit; }
.px2-frame nav { display: flex; gap: 12px; }

.px2-intro, .px2-wrap { position: relative; grid-area: 1 / 1 / 2 / 2; }
.px2-intro {
  flex: 1; max-height: 80cqw; margin: auto 0; padding: 0 var(--pad);
  font-size: 9cqw; line-height: 1; text-transform: uppercase;
  display: flex; flex-wrap: wrap; column-gap: 2cqw; row-gap: 1cqw; white-space: nowrap;
  font-family: "Arial Narrow", "Helvetica Neue", Arial, sans-serif; font-stretch: expanded; font-weight: 300;
  background-color: var(--color-text); background-image: linear-gradient(45deg, var(--color-gr-1), var(--color-gr-2));
  background-size: 100%; background-repeat: repeat; -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; will-change: transform, opacity;
}
.px2-closed { opacity: 0; pointer-events: none; }
.px2-f1 { font-stretch: condensed; font-weight: 100; }
.px2-f2 { font-stretch: expanded; font-weight: 800; }
.px2-f3 { font-stretch: expanded; font-weight: 400; }
.px2-text { line-height: .6; padding-top: 2cqw; }
.px2-image { flex: 1; position: relative; cursor: pointer; will-change: transform; background-size: cover; background-position: 50% 30%; border-radius: 5cqw; min-width: 50px; max-width: 100px; transition: opacity .3s; border: 0; padding: 0; }
.px2-image:hover { opacity: .8; }

.px2-wrap { align-self: stretch; display: grid; pointer-events: none; }
.px2-content { opacity: 0; pointer-events: none; grid-area: 1 / 1 / -1 / -1; display: grid; grid-template-columns: 100%; height: 100%; grid-template-rows: 70% 1fr; gap: 5cqh; padding: 96px var(--pad) 24px; container-type: size; }
.px2-open { opacity: 1; pointer-events: auto; }
.px2-img { position: relative; overflow: hidden; border-radius: 22px; display: grid; will-change: transform, opacity; }
.px2-img-inner { background-size: cover; background-position: 50% 20%; }
.px2-ctext { display: grid; grid-template-areas: "back number title" "... ... title" "meta meta meta"; column-gap: 24px; grid-template-columns: auto 1fr auto; grid-template-rows: auto 1fr auto; }
.px2-title, .px2-num {
  background-color: var(--color-text); background-image: linear-gradient(45deg, var(--color-gr-1), var(--color-gr-2));
  background-size: 100%; background-repeat: repeat; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.px2-title { grid-area: title; margin: 0; font-family: "Arial Narrow", "Helvetica Neue", Arial, sans-serif; font-stretch: expanded; font-weight: 100; font-size: clamp(24px, 6cqw, 60px); line-height: 1; max-width: 15ch; text-align: right; }
.px2-num { grid-area: number; line-height: 1; margin-top: -1cqw; align-self: start; font-size: clamp(36px, 6cqw, 120px); position: relative; }
.px2-back { grid-area: back; overflow: hidden; align-self: center; }
.px2-back svg { width: 4cqw; height: 4.85cqw; min-width: 22px; min-height: 27px; fill: var(--color-back); transition: fill .2s; display: block; }
.px2-back:hover svg { fill: var(--color-back-hover); }
.px2-meta { grid-area: meta; text-transform: uppercase; display: flex; justify-content: space-between; font-size: clamp(9px, 3cqw, 18px); line-height: 1; }

.px2-overlay { grid-area: 1 / 1 / -1 / -1; display: grid; position: relative; z-index: 1000; pointer-events: none; opacity: 0; grid-template-columns: repeat(var(--columns), 1fr); }
.px2-overlay div { background: var(--color-bg-overlay); will-change: opacity, transform; }

@container (min-width: 636px) {
  .px2-image { min-width: 200px; max-width: 30%; }
  .px2-content { padding-top: 60px; }
}
`

type StaggerFn = gsap.StaggerVars | ((index: number, target: unknown, list: unknown[]) => number)
type Cfg = { transformOrigin?: string; duration?: number; ease?: string; stagger?: StaggerFn }

export default function Pixel2Animation() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const introRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const imgRefs = useRef<(HTMLDivElement | null)[]>([])
  const busy = useRef(false)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<number | null>(null)

  const cells = () => [...(overlayRef.current?.children ?? [])] as HTMLElement[]

  // preload images, then drop the loader
  useEffect(() => {
    let alive = true
    Promise.all(
      IMAGES.map(
        (src) =>
          new Promise<void>((res) => {
            const im = new window.Image()
            im.onload = im.onerror = () => res()
            im.src = src
          })
      )
    ).then(() => alive && setLoading(false))
    const targets = [...(overlayRef.current?.children ?? []), introRef.current, ...imgRefs.current]
    return () => {
      alive = false
      gsap.killTweensOf(targets)
    }
  }, [])

  const show = (c: Cfg) =>
    new Promise<void>((resolve) => {
      const cfg = { transformOrigin: "50% 50%", duration: 0.5, ease: "none", stagger: { grid: [ROWS, COLUMNS], from: 0, each: 0.05, ease: "none" } as StaggerFn, ...c }
      gsap.set(overlayRef.current, { opacity: 1 })
      gsap.fromTo(
        cells(),
        { scale: 0, opacity: 0, transformOrigin: cfg.transformOrigin },
        { duration: cfg.duration, ease: cfg.ease, scale: 1.03, opacity: 1, stagger: cfg.stagger as gsap.StaggerVars, onComplete: resolve }
      )
    })

  const hide = (c: Cfg) =>
    new Promise<void>((resolve) => {
      const cfg = { transformOrigin: "50% 50%", duration: 0.5, ease: "none", stagger: { grid: [ROWS, COLUMNS], from: 0, each: 0.05, ease: "none" } as StaggerFn, ...c }
      gsap.fromTo(
        cells(),
        { transformOrigin: cfg.transformOrigin },
        { duration: cfg.duration, ease: cfg.ease, scale: 0, opacity: 0, stagger: cfg.stagger as gsap.StaggerVars, onComplete: resolve }
      )
    })

  const openPage = (position: number) => {
    if (busy.current) return
    busy.current = true
    const intro = introRef.current
    gsap.to(intro, { duration: 1, ease: "power3.inOut", scaleX: 1.8, opacity: 0 })
    show({
      duration: 0.25,
      ease: "power1.in",
      stagger: { grid: [ROWS, COLUMNS], from: "center", each: 0.025 },
    }).then(() => {
      reveal(position)
      hide({
        duration: 0.25,
        ease: "power1",
        stagger: { grid: [ROWS, COLUMNS], from: "center", each: 0.025 },
      }).then(() => { busy.current = false })
      gsap.fromTo(imgRefs.current[position], { scaleX: 0.5, opacity: 0 }, { duration: 0.8, ease: "power3", scaleX: 1, opacity: 1 })
    })
  }

  const closePage = (position: number) => {
    if (busy.current) return
    busy.current = true
    const intro = introRef.current
    const img = imgRefs.current[position]
    gsap.to(img, { duration: 0.7, ease: "power2.in", scaleX: 0.75, opacity: 0 })
    show({
      duration: 0.25,
      ease: "power1.in",
      stagger: { grid: [ROWS, COLUMNS], from: "edges", each: 0.025 },
    }).then(() => {
      conceal()
      hide({
        duration: 0.25,
        ease: "power1",
        stagger: { grid: [ROWS, COLUMNS], from: "edges", each: 0.025 },
      }).then(() => { busy.current = false })
      gsap.to(intro, { duration: 0.8, ease: "expo", scaleX: 1, opacity: 1 })
    })
  }

  // the setters called inside the animation callbacks
  const reveal = (position: number) => {
    introRef.current?.classList.add("px2-closed")
    setOpen(position)
  }
  const conceal = () => {
    introRef.current?.classList.remove("px2-closed")
    setOpen(null)
  }

  return (
    <div ref={rootRef} className={`px2-root${loading ? " px2-loading" : ""}`}>
      <style>{CSS}</style>
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
        <symbol id="px2-arrow" viewBox="0 0 562 980">
          <path d="M561.4 0H421.2v138.7h140.2zM421.2 138.7H281v140.2h140.2zM281 278.9H140.8v140.2H281zM281 559.4H140.8v140.2H281zM421.2 699.6H281v140.2h140.2zM561.4 839.8H421.2V980h140.2zM140.8 419.1H.6v140.2h140.2z" />
        </symbol>
      </svg>

      <div className="px2-frame">
        <h1>Zepa</h1>
        <nav>
          <a className="px2-hl" href="#" onClick={(e) => e.preventDefault()}>Components</a>
          <a className="px2-hl" href="#" onClick={(e) => e.preventDefault()}>zepa.design</a>
        </nav>
      </div>

      <div className="px2-intro" ref={introRef}>
        {INTRO.map((it, i) =>
          "img" in it ? (
            <button
              key={i}
              type="button"
              className="px2-image"
              aria-label={`Open: ${CONTENT[it.img].title}`}
              style={{ backgroundImage: `url(${IMAGES[it.img]})` }}
              onClick={() => openPage(it.img)}
            />
          ) : (
            <div key={i} className={`px2-text${it.f ? ` px2-f${it.f}` : ""}`}>{it.t}</div>
          )
        )}
      </div>

      <section className="px2-wrap">
        {CONTENT.map((c, i) => (
          <div key={c.num} className={`px2-content${open === i ? " px2-open" : ""}`} aria-hidden={open !== i}>
            <div className="px2-img" ref={(el) => { imgRefs.current[i] = el }}>
              <div className="px2-img-inner" style={{ backgroundImage: `url(${IMAGES[i]})` }} />
            </div>
            <div className="px2-ctext">
              <h2 className="px2-title">{c.title}</h2>
              <span className="px2-num">{c.num}</span>
              <button type="button" className="px2-back px2-unbutton" aria-label="Back" tabIndex={open === i ? 0 : -1} onClick={() => closePage(i)}>
                <svg aria-hidden focusable="false"><use href="#px2-arrow" /></svg>
              </button>
              <div className="px2-meta">
                {c.meta.map((m) => <span key={m}>{m}</span>)}
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="px2-overlay" ref={overlayRef} style={{ ["--columns" as string]: COLUMNS }}>
        {Array.from({ length: ROWS * COLUMNS }, (_, i) => <div key={i} />)}
      </div>
    </div>
  )
}
