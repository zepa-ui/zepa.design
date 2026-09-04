"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

/* ─────────────────────────────────────────────
   scroll5-animation — An infinite library of components unfolding

   A gapless field laid almost flat at 50°. Even rows slide left and odd rows slide right, tearing the image apart along its own seams, then every tile drifts vertically once the rows have parted.

   One of six on-scroll perspective grid animations
   from Codrops' Scroll3DGrid (MIT — Codrops), split
   here into a component per animation.

   The original drives off window scroll with Lenis
   on the page. This owns its own scroll container
   instead: Lenis is bound to the root as its wrapper
   and ScrollTrigger is given that same root as its
   scroller, so the component never touches window
   scroll or position:fixed.
   ───────────────────────────────────────────── */

const LOGO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"

const BASE = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/01_wvqrxz.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/02_efyml3.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/03_sceom4.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/04_dpquqc.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/05_ccn9so.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/06_p0lonf.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/07_wzzq5u.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/08_bu1urh.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/09_b5kt8t.png",
]

/** the grid asks for 48 tiles; the nine images repeat to fill it */
const TILES = Array.from({ length: 48 }, (_, i) =>
  BASE[i % BASE.length].replace("/upload/", "/upload/c_fill,w_600,h_600,g_auto/")
)

/**
 * Group the tiles into rows by their vertical centre, then keep every other
 * row. Ported from the original's getGrid() helper, reduced to the one axis
 * this animation actually uses and flattened, since GSAP receives a flat
 * target list either way.
 */
function rowsOf(items: HTMLElement[], which: "even" | "odd") {
  const buckets = new Map<number, HTMLElement[]>()
  for (const el of items) {
    const b = el.getBoundingClientRect()
    const key = Math.round(b.top + b.height / 2)
    const found = buckets.get(key)
    if (found) found.push(el)
    else buckets.set(key, [el])
  }
  const ordered = [...buckets.keys()].sort((a, b) => a - b).map((k) => buckets.get(k) as HTMLElement[])
  const onlyEven = which === "even"
  return ordered.filter((_, i) => !(i % 2) === onlyEven).flat()
}

export default function Scroll5Animation() {
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const content = contentRef.current
    const wrap = wrapRef.current
    if (!root || !content || !wrap) return

    gsap.registerPlugin(ScrollTrigger)

    /* Lenis smooths the component's own scroller, not the page's */
    const lenis = new Lenis({ wrapper: root, content, lerp: 0.1, smoothWheel: true })
    const onScroll = () => ScrollTrigger.update()
    lenis.on("scroll", onScroll)

    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".s5-item")

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap,
          scroller: root,
          start: "top bottom+=5%",
          end: "bottom top-=5%",
          scrub: true,
        },
      })

      const grouped = { even: rowsOf(items, 'even'), odd: rowsOf(items, 'odd') }

      tl.set(wrap, { rotationX: 50 })
        .to(wrap, { rotationX: 30 })
        .fromTo(items, { filter: 'brightness(0%)' }, { filter: 'brightness(100%)' }, 0)
        .to(grouped.even, { xPercent: -100, ease: 'power1' }, 0)
        .to(grouped.odd, { xPercent: 100, ease: 'power1' }, 0)
        .addLabel('rowsEnd', '>-=0.15')
        .to(items, { ease: 'power1', yPercent: () => gsap.utils.random(-100, 200) }, 'rowsEnd')
    }, root)

    return () => {
      cancelAnimationFrame(raf)
      lenis.off("scroll", onScroll)
      lenis.destroy()
      ctx.revert()
    }
  }, [])

  return (
    <div ref={rootRef} className="s5-root">
      <style>{CSS}</style>

      <div ref={contentRef} className="s5-content">
        {/* lead-in the scrub needs — carries the mark instead of nothing */}
        <div className="s5-intro">
          <img className="s5-logo" src={LOGO} alt="Zepa" draggable={false} />
          <p className="s5-kicker">Zepa Motion · Scroll Animation 05</p>
          <p className="s5-scroll">Scroll down</p>
        </div>

        <section className="s5-section">
          <h3 className={"s5-title" + ""}>
            An infinite library
            <br />
            of components unfolding
          </h3>

          <div className="s5-grid">
            <div ref={wrapRef} className="s5-wrap">
              {TILES.map((src, i) => (
                <div className="s5-item" key={i}>
                  <div
                    className="s5-inner"
                    style={{ backgroundImage: "url(" + src + ")" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* tail the scrub needs, ditto */}
        <div className="s5-outro">
          <img className="s5-logo s5-logo--sm" src={LOGO} alt="Zepa" draggable={false} />
        </div>
      </div>
    </div>
  )
}

const CSS = `
.s5-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #000000;
  color: #ffffff;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-weight: 300;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scrollbar-width: none;

  /* defaults from the original :root, then this animation's overrides */
  --perspective: 1500px;
  --grid-item-ratio: 1.5;
  --grid-width: 100%;
  --grid-height: auto;
  --grid-gap: 2vw;
  --grid-columns: 4;
  --grid-inner-scale: 1;
  --grid-width: 120%;
  --grid-columns: 8;
  --grid-gap: 0;
}
.s5-root::-webkit-scrollbar { display: none; }
.s5-root *,
.s5-root *::before,
.s5-root *::after { box-sizing: border-box; }

/* lead-in and lead-out give the scrub somewhere to run; on the original
   page this space came from the neighbouring sections */
/* Runway — the full lead-in and lead-out, as the original's trigger range
   asks for: start fires at "top bottom+=5%" and end at "bottom top-=5%",
   so anything under ~105vh either side clips the timeline. */
.s5-content { position: relative; width: 100%; padding: 0; }
.s5-intro {
  height: 90vh;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 1.5rem;
}
.s5-outro { height: 110vh; display: grid; place-items: center; }

.s5-logo {
  width: min(62vw, 760px);
  height: auto;
  display: block;
  user-select: none;
  -webkit-user-select: none;
}
.s5-logo--sm { width: min(26vw, 300px); opacity: 0.4; }

.s5-kicker {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
}

.s5-scroll {
  margin: 0.6rem 0 3rem;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.34);
  text-align: center;
  position: relative;
}
.s5-scroll::after {
  content: "";
  position: absolute;
  top: calc(100% + 0.9rem);
  left: 50%;
  width: 1px;
  height: 2.2rem;
  background: rgba(255, 255, 255, 0.34);
  animation: s5ScrollLine 2.1s cubic-bezier(0.76, 0, 0.24, 1) infinite;
}
@keyframes s5ScrollLine {
  0%   { transform: translateX(-50%) scaleY(0); transform-origin: 50% 0%; }
  45%  { transform: translateX(-50%) scaleY(1); transform-origin: 50% 0%; }
  55%  { transform: translateX(-50%) scaleY(1); transform-origin: 50% 100%; }
  100% { transform: translateX(-50%) scaleY(0); transform-origin: 50% 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .s5-scroll::after { animation: none; transform: translateX(-50%); }
}

.s5-section { position: relative; }

.s5-title {
  position: absolute;
  height: 100vh;
  width: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 0 10vw;
  display: grid;
  place-items: center;
  text-align: center;
  font-weight: 300;
  font-size: clamp(1.5rem, 15vw, 6.5rem);
  line-height: 1.05;
  pointer-events: none;
  z-index: 2;
}
.s5-title--top { align-items: start; }
.s5-title--bottom { align-items: end; }
.s5-title--left { justify-items: start; text-align: left; }
.s5-title--right { justify-items: end; text-align: right; }

.s5-grid {
  display: grid;
  place-items: center;
  padding: 2rem;
  width: 100%;
  perspective: var(--perspective);
}

.s5-wrap {
  height: var(--grid-height);
  width: var(--grid-width);
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gap);
  transform-style: preserve-3d;
}

.s5-item {
  aspect-ratio: var(--grid-item-ratio);
  width: 100%;
  height: auto;
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  display: grid;
  place-items: center;
}

.s5-inner {
  position: relative;
  width: calc(1 / var(--grid-inner-scale) * 100%);
  height: calc(1 / var(--grid-inner-scale) * 100%);
  background-size: cover;
  background-position: 50% 50%;
}
`
