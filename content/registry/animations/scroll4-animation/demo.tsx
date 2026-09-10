"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

/* ─────────────────────────────────────────────
   scroll4-animation — One paste unfolds a finished scene

   A narrow column seen from its left edge. Each tile hinges on its top edge from −70° to 70° while stepping 500px toward the camera and back again on a 0.04s stagger — pages turning in sequence rather than all at once.

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

/** the grid asks for 24 tiles; the nine images repeat to fill it */
const TILES = Array.from({ length: 24 }, (_, i) =>
  BASE[i % BASE.length].replace("/upload/", "/upload/c_fill,w_600,h_600,g_auto/")
)

export default function Scroll4Animation() {
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
      const items = gsap.utils.toArray<HTMLElement>(".s4-item")

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

      tl.set(wrap, { transformOrigin: '0% 50%', rotationY: 30, xPercent: -75 })
        .set(items, { transformOrigin: '50% 0%' })
        .to(items, { duration: 0.5, ease: 'power2', z: 500, stagger: 0.04 }, 0)
        .to(items, { duration: 0.5, ease: 'power2.in', z: 0, stagger: 0.04 }, 0.5)
        .fromTo(items,
          { rotationX: -70, filter: 'brightness(120%)' },
          { duration: 1, rotationX: 70, filter: 'brightness(0%)', stagger: 0.04 }, 0)
    }, root)

    return () => {
      cancelAnimationFrame(raf)
      lenis.off("scroll", onScroll)
      lenis.destroy()
      ctx.revert()
    }
  }, [])

  return (
    <div ref={rootRef} className="s4-root">
      <style>{CSS}</style>

      <div ref={contentRef} className="s4-content">
        {/* lead-in the scrub needs — carries the mark instead of nothing */}
        <div className="s4-intro">
          <img className="s4-logo" src={LOGO} alt="Zepa" draggable={false} />
          <p className="s4-kicker">Zepa Motion · Scroll Animation 04</p>
          <p className="s4-scroll">Scroll down</p>
        </div>

        <section className="s4-section">
          <h3 className={"s4-title" + " s4-title--right"}>
            One paste unfolds
            <br />
            a finished scene
          </h3>

          <div className="s4-grid">
            <div ref={wrapRef} className="s4-wrap">
              {TILES.map((src, i) => (
                <div className="s4-item" key={i}>
                  <div
                    className="s4-inner"
                    style={{ backgroundImage: "url(" + src + ")" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* tail the scrub needs, ditto */}
        <div className="s4-outro">
          <img className="s4-logo s4-logo--sm" src={LOGO} alt="Zepa" draggable={false} />
        </div>
      </div>
    </div>
  )
}

const CSS = `
.s4-root {
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
  --grid-width: 50%;
  --perspective: 3000px;
  --grid-item-ratio: 0.8;
  --grid-columns: 3;
  --grid-gap: 1vw;
}
.s4-root::-webkit-scrollbar { display: none; }
.s4-root *,
.s4-root *::before,
.s4-root *::after { box-sizing: border-box; }

/* lead-in and lead-out give the scrub somewhere to run; on the original
   page this space came from the neighbouring sections */
/* Runway — the full lead-in and lead-out, as the original's trigger range
   asks for: start fires at "top bottom+=5%" and end at "bottom top-=5%",
   so anything under ~105vh either side clips the timeline. */
.s4-content { position: relative; width: 100%; padding: 0; }
.s4-intro {
  height: 90vh;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 1.5rem;
}
.s4-outro { height: 110vh; display: grid; place-items: center; }

.s4-logo {
  width: min(62vw, 760px);
  height: auto;
  display: block;
  user-select: none;
  -webkit-user-select: none;
}
.s4-logo--sm { width: min(26vw, 300px); opacity: 0.4; }

.s4-kicker {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
}

.s4-scroll {
  margin: 0.6rem 0 3rem;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.34);
  text-align: center;
  position: relative;
}
.s4-scroll::after {
  content: "";
  position: absolute;
  top: calc(100% + 0.9rem);
  left: 50%;
  width: 1px;
  height: 2.2rem;
  background: rgba(255, 255, 255, 0.34);
  animation: s4ScrollLine 2.1s cubic-bezier(0.76, 0, 0.24, 1) infinite;
}
@keyframes s4ScrollLine {
  0%   { transform: translateX(-50%) scaleY(0); transform-origin: 50% 0%; }
  45%  { transform: translateX(-50%) scaleY(1); transform-origin: 50% 0%; }
  55%  { transform: translateX(-50%) scaleY(1); transform-origin: 50% 100%; }
  100% { transform: translateX(-50%) scaleY(0); transform-origin: 50% 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .s4-scroll::after { animation: none; transform: translateX(-50%); }
}

.s4-section { position: relative; }

.s4-title {
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
.s4-title--top { align-items: start; }
.s4-title--bottom { align-items: end; }
.s4-title--left { justify-items: start; text-align: left; }
.s4-title--right { justify-items: end; text-align: right; }

.s4-grid {
  display: grid;
  place-items: center;
  padding: 2rem;
  width: 100%;
  perspective: var(--perspective);
}

.s4-wrap {
  height: var(--grid-height);
  width: var(--grid-width);
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gap);
  transform-style: preserve-3d;
}

.s4-item {
  aspect-ratio: var(--grid-item-ratio);
  width: 100%;
  height: auto;
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  display: grid;
  place-items: center;
}

.s4-inner {
  position: relative;
  width: calc(1 / var(--grid-inner-scale) * 100%);
  height: calc(1 / var(--grid-inner-scale) * 100%);
  background-size: cover;
  background-position: 50% 50%;
}
`
