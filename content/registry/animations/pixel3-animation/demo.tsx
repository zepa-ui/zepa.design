"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

/* ─────────────────────────────────────────────
   pixel3-animation — pixel page transition (diagonal sweep)

   Ported from the Codrops "Pixel Transition"
   demo 3 (based on Niccolò Miranda's
   animation). Click an image in the intro to
   open its page: a grid of pixel cells covers
   the view, the content swaps underneath, and
   the cells clear again. The arrow button plays
   the reverse.

   Demo 3: orange cells sweep in from the last cell to
   open and from the first cell to close, while the intro
   shrinks back and the page image settles from 1.2x.

   Contained: the overlay and loader are scoped
   to the component and sizes use container
   units, so it works inside any frame.
   ───────────────────────────────────────────── */

const ROWS = 7
const COLUMNS = 13

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
  { t: "Design", f: 2 },
  { img: 0 },
  { t: "less", f: 1 },
  { img: 1 },
  { t: "code", f: 3 },
  { img: 2 },
  { t: "less" },
  { img: 3 },
  { t: "launch", f: 2 },
  { img: 4 },
  { t: "more", f: 1 },
  { img: 5 },
  { t: "with" },
  { t: "zepa", f: 2 },
  { img: 6 },
]

const CONTENT = [
  { title: "Design less, launch more.", num: "L01", meta: ["Launch", "Speed", "Focus"] },
  { title: "AI interfaces, front-end ready.", num: "AI3", meta: ["AI Section", "Chat UIs", "Streaming"] },
  { title: "From idea to live in an afternoon.", num: "F09", meta: ["Workflow", "Browse", "Ship"] },
  { title: "Components that scale with you.", num: "S56", meta: ["Systems", "Tokens", "Themes"] },
  { title: "Your brand, every section.", num: "B30", meta: ["Branding", "Colors", "Type"] },
  { title: "Less boilerplate, more product.", num: "Q88", meta: ["Developers", "TypeScript", "Clean code"] },
  { title: "Launch with Zepa.", num: "Z00", meta: ["zepa.design", "Components", "Today"] },
]

const CSS = `
.px3-root {
  --color-text: #fff;
  --color-gr-1: #81e2c6;
  --color-gr-2: #e7613c;
  --color-bg: #000;
  --color-link: #ba9978;
  --color-link-hover: #df6b47;
  --color-back: #d23636;
  --color-back-hover: #df6b47;
  --color-bg-overlay: rgb(223, 107, 71);
  --pad: 18px;
  box-sizing: border-box; position: relative; display: grid; width: 100%;
  height: 100vh; height: 100dvh; min-height: 560px; overflow: hidden;
  color: var(--color-text); background-color: var(--color-bg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 12px;
  -webkit-font-smoothing: antialiased; container-type: inline-size;
}
.px3-root *, .px3-root *::before, .px3-root *::after { box-sizing: border-box; }
.px3-root a { text-decoration: none; color: var(--color-link); outline: none; }
.px3-root a:hover { color: var(--color-link-hover); }

/* loader (contained) */
.px3-root.px3-loading::before, .px3-root.px3-loading::after { content: ""; position: absolute; z-index: 1000; }
.px3-root.px3-loading::before { inset: 0; background: var(--color-bg); }
.px3-root.px3-loading::after { top: 50%; left: 50%; width: 100px; height: 100px; margin: -50px 0 0 -50px; border-radius: 50%; border: 2px solid var(--color-gr-2); animation: px3-loader .7s linear infinite alternate forwards; }
@keyframes px3-loader { to { opacity: 1; transform: scale3d(.5,.5,1) } }

.px3-hl { white-space: nowrap; overflow: hidden; position: relative; }
.px3-hl::before { content: ""; height: 1px; width: 100%; background: currentColor; position: absolute; top: 92%; transition: transform .3s; transform-origin: 0% 50%; }
.px3-hl:hover::before { transform: scaleX(0); transform-origin: 100% 50%; }
.px3-unbutton { background: none; border: 0; padding: 0; margin: 0; font: inherit; cursor: pointer; }

.px3-frame { grid-area: 1 / 1 / 2 / 2; text-align: center; display: flex; padding: var(--pad) calc(var(--pad) + .6cqw); flex-wrap: wrap; align-self: start; position: relative; z-index: 100; column-gap: 5cqw; row-gap: 12px; font-weight: 600; background: linear-gradient(to bottom, var(--color-bg), transparent); }
.px3-frame h1 { font-size: inherit; margin: 0; font-weight: inherit; }
.px3-frame nav { display: flex; gap: 12px; }

.px3-intro, .px3-wrap { position: relative; grid-area: 1 / 1 / 2 / 2; }
.px3-intro {
  flex: 1; max-height: 80cqw; margin: auto 0; padding: 0 var(--pad);
  font-size: 9cqw; line-height: 1; text-transform: uppercase;
  display: flex; flex-wrap: wrap; column-gap: 2cqw; row-gap: 1cqw; white-space: nowrap;
  font-family: "Arial Narrow", "Helvetica Neue", Arial, sans-serif; font-stretch: expanded; font-weight: 300;
  background-color: var(--color-text); background-image: linear-gradient(45deg, var(--color-gr-1), var(--color-gr-2));
  background-size: 100%; background-repeat: repeat; -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; will-change: transform, opacity;
}
.px3-closed { opacity: 0; pointer-events: none; }
.px3-f1 { font-stretch: condensed; font-weight: 100; }
.px3-f2 { font-stretch: expanded; font-weight: 800; }
.px3-f3 { font-stretch: expanded; font-weight: 400; }
.px3-text { line-height: .6; padding-top: 2cqw; }
.px3-image { flex: 1; position: relative; cursor: pointer; will-change: transform; background-size: cover; background-position: 50% 30%; border-radius: 5cqw; min-width: 50px; max-width: 100px; transition: opacity .3s; border: 0; padding: 0; }
.px3-image:hover { opacity: .8; }

.px3-wrap { align-self: stretch; display: grid; pointer-events: none; }
.px3-content { opacity: 0; pointer-events: none; grid-area: 1 / 1 / -1 / -1; display: grid; grid-template-columns: 100%; height: 100%; grid-template-rows: 70% 1fr; gap: 5cqh; padding: 96px var(--pad) 24px; container-type: size; }
.px3-open { opacity: 1; pointer-events: auto; }
.px3-img { position: relative; overflow: hidden; border-radius: 22px; display: grid; will-change: transform, opacity; }
.px3-img-inner { background-size: cover; background-position: 50% 20%; }
.px3-ctext { display: grid; grid-template-areas: "back number title" "... ... title" "meta meta meta"; column-gap: 24px; grid-template-columns: auto 1fr auto; grid-template-rows: auto 1fr auto; }
.px3-title, .px3-num {
  background-color: var(--color-text); background-image: linear-gradient(45deg, var(--color-gr-1), var(--color-gr-2));
  background-size: 100%; background-repeat: repeat; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.px3-title { grid-area: title; margin: 0; font-family: "Arial Narrow", "Helvetica Neue", Arial, sans-serif; font-stretch: expanded; font-weight: 100; font-size: clamp(24px, 6cqw, 60px); line-height: 1; max-width: 15ch; text-align: right; }
.px3-num { grid-area: number; line-height: 1; margin-top: -1cqw; align-self: start; font-size: clamp(36px, 6cqw, 120px); position: relative; }
.px3-back { grid-area: back; overflow: hidden; align-self: center; }
.px3-back svg { width: 4cqw; height: 4.85cqw; min-width: 22px; min-height: 27px; fill: var(--color-back); transition: fill .2s; display: block; }
.px3-back:hover svg { fill: var(--color-back-hover); }
.px3-meta { grid-area: meta; text-transform: uppercase; display: flex; justify-content: space-between; font-size: clamp(9px, 3cqw, 18px); line-height: 1; }

.px3-overlay { grid-area: 1 / 1 / -1 / -1; display: grid; position: relative; z-index: 1000; pointer-events: none; opacity: 0; grid-template-columns: repeat(var(--columns), 1fr); }
.px3-overlay div { background: var(--color-bg-overlay); will-change: opacity, transform; }

@container (min-width: 636px) {
  .px3-image { min-width: 200px; max-width: 30%; }
  .px3-content { padding-top: 60px; }
}
`

type StaggerFn = gsap.StaggerVars | ((index: number, target: unknown, list: unknown[]) => number)
type Cfg = { transformOrigin?: string; duration?: number; ease?: string; stagger?: StaggerFn }

export default function Pixel3Animation() {
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
        { duration: cfg.duration, ease: cfg.ease, scale: 1.01, opacity: 1, stagger: cfg.stagger as gsap.StaggerVars, onComplete: resolve }
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
    gsap.to(intro, { duration: 0.7, ease: "power2.in", scale: 0.75 })
    show({
      duration: 0.3,
      ease: "power1.inOut",
      stagger: { grid: [ROWS, COLUMNS], from: "end", each: 0.035 },
    }).then(() => {
      reveal(position)
      hide({
        duration: 0.3,
        ease: "power3",
        stagger: { grid: [ROWS, COLUMNS], from: "end", each: 0.035 },
      }).then(() => { busy.current = false })
      gsap.fromTo(imgRefs.current[position], { scale: 1.2 }, { duration: 0.9, ease: "expo", scale: 1 })
    })
  }

  const closePage = (position: number) => {
    if (busy.current) return
    busy.current = true
    const intro = introRef.current
    const img = imgRefs.current[position]
    gsap.to(img, { duration: 0.7, ease: "power2.in", scale: 1.2 })
    show({
      duration: 0.3,
      ease: "power1.inOut",
      stagger: { grid: [ROWS, COLUMNS], from: "start", each: 0.035 },
    }).then(() => {
      conceal()
      hide({
        duration: 0.3,
        ease: "power3",
        stagger: { grid: [ROWS, COLUMNS], from: "start", each: 0.035 },
      }).then(() => { busy.current = false })
      gsap.to(intro, { duration: 0.9, ease: "expo", scale: 1 })
    })
  }

  // the setters called inside the animation callbacks
  const reveal = (position: number) => {
    introRef.current?.classList.add("px3-closed")
    setOpen(position)
  }
  const conceal = () => {
    introRef.current?.classList.remove("px3-closed")
    setOpen(null)
  }

  return (
    <div ref={rootRef} className={`px3-root${loading ? " px3-loading" : ""}`}>
      <style>{CSS}</style>
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
        <symbol id="px3-arrow" viewBox="0 0 562 980">
          <path d="M561.4 0H421.2v138.7h140.2zM421.2 138.7H281v140.2h140.2zM281 278.9H140.8v140.2H281zM281 559.4H140.8v140.2H281zM421.2 699.6H281v140.2h140.2zM561.4 839.8H421.2V980h140.2zM140.8 419.1H.6v140.2h140.2z" />
        </symbol>
      </svg>

      <div className="px3-frame">
        <h1>Zepa</h1>
        <nav>
          <a className="px3-hl" href="#" onClick={(e) => e.preventDefault()}>Components</a>
          <a className="px3-hl" href="#" onClick={(e) => e.preventDefault()}>zepa.design</a>
        </nav>
      </div>

      <div className="px3-intro" ref={introRef}>
        {INTRO.map((it, i) =>
          "img" in it ? (
            <button
              key={i}
              type="button"
              className="px3-image"
              aria-label={`Open: ${CONTENT[it.img].title}`}
              style={{ backgroundImage: `url(${IMAGES[it.img]})` }}
              onClick={() => openPage(it.img)}
            />
          ) : (
            <div key={i} className={`px3-text${it.f ? ` px3-f${it.f}` : ""}`}>{it.t}</div>
          )
        )}
      </div>

      <section className="px3-wrap">
        {CONTENT.map((c, i) => (
          <div key={c.num} className={`px3-content${open === i ? " px3-open" : ""}`} aria-hidden={open !== i}>
            <div className="px3-img" ref={(el) => { imgRefs.current[i] = el }}>
              <div className="px3-img-inner" style={{ backgroundImage: `url(${IMAGES[i]})` }} />
            </div>
            <div className="px3-ctext">
              <h2 className="px3-title">{c.title}</h2>
              <span className="px3-num">{c.num}</span>
              <button type="button" className="px3-back px3-unbutton" aria-label="Back" tabIndex={open === i ? 0 : -1} onClick={() => closePage(i)}>
                <svg aria-hidden focusable="false"><use href="#px3-arrow" /></svg>
              </button>
              <div className="px3-meta">
                {c.meta.map((m) => <span key={m}>{m}</span>)}
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="px3-overlay" ref={overlayRef} style={{ ["--columns" as string]: COLUMNS }}>
        {Array.from({ length: ROWS * COLUMNS }, (_, i) => <div key={i} />)}
      </div>
    </div>
  )
}
