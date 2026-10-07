"use client"

import { useEffect, useId, useRef } from "react"
import gsap from "gsap"
import { Flip } from "gsap/Flip"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

/* ─────────────────────────────────────────────
   reveal3-animation — Hand / Craft

   The only one masked by a path rather than a circle: a flat line splits into a lens as the two quadratic control points pull apart to 800 and -200.

   The two words start centred on a full-height
   panel, then FLIP into their places in the layout
   below while the mask opens under them — one
   scrubbed timeline drives the title move, the mask
   and the image together.

   One of seven on-scroll SVG filter reveals from
   Codrops' OnScrollFilter (MIT — Codrops), split
   here into a component per reveal.

   The original drives off window scroll with Lenis
   on the page. This owns its own scroll container:
   Lenis is bound to the root as its wrapper and
   ScrollTrigger is given that same root as its
   scroller, so it never touches window scroll or
   position:fixed.
   ───────────────────────────────────────────── */

const LOGO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"

const IMAGE =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/c_fill,w_1000,h_560,g_auto/v1781705172/vivek_i01gjp.png"

export default function Reveal3Animation() {
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleWrapRef = useRef<HTMLDivElement>(null)
  const layoutRef = useRef<HTMLDivElement>(null)
  const upRef = useRef<HTMLSpanElement>(null)
  const downRef = useRef<HTMLSpanElement>(null)
  const maskRef = useRef<SVGPathElement>(null)
  const imageRef = useRef<SVGImageElement>(null)

  /* every filter and mask id has to be unique per instance, or a second copy
     on the page would point both images at the first one's defs */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const fx = "rv3-fx-" + uid
  const mk = "rv3-mask-" + uid

  useEffect(() => {
    const root = rootRef.current
    const content = contentRef.current
    const titleWrap = titleWrapRef.current
    const layout = layoutRef.current
    const up = upRef.current
    const down = downRef.current
    const mask = maskRef.current
    const image = imageRef.current
    if (!root || !content || !titleWrap || !layout || !up || !down || !mask || !image) return

    gsap.registerPlugin(Flip, ScrollTrigger)

    let cleanup = () => {}

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
      // Record where the words are, move them, then let Flip animate the gap.
      // The move is undone in cleanup: React runs effects twice in dev, and
      // without the restore the second run measures the already-moved nodes,
      // start equals end, and Flip produces no tween at all.
      const state = Flip.getState([up, down])
      layout.prepend(up, down)

      // the authored attribute is the closed state; restate it through gsap so
      // the tween owns the value from the first frame
      gsap.set(mask, { attr: { d: "M 0 280 Q 500 280 1000 280 Q 500 280 0 280" } })

      // built explicitly rather than chained onto Flip's return, so the mask
      // and image tweens are on a timeline this code controls
      const tl = gsap.timeline({ defaults: { ease: "none" } })
      tl.add(Flip.from(state, { ease: "none", simple: true }), 0)
        .fromTo(mask, { attr: { d: "M 0 280 Q 500 280 1000 280 Q 500 280 0 280" } }, { attr: { d: "M 0 280 Q 500 800 1000 280 Q 500 -200 0 280" } }, 0)
        .fromTo(
          image,
          { transformOrigin: "50% 50%", filter: "brightness(100%)" },
          { scale: 1, filter: "brightness(150%)" },
          0
        )

      const st = ScrollTrigger.create({
        trigger: titleWrap,
        scroller: root,
        start: "clamp(top bottom-=10%)",
        end: "+=40%",
        scrub: true,
        invalidateOnRefresh: true,
        animation: tl,
      })

      // the trigger is first measured before the SVG image has loaded, so the
      // page is shorter than it will be and clamp() pins start and end together
      ScrollTrigger.refresh()
      const onLoad = () => ScrollTrigger.refresh()
      image.addEventListener("load", onLoad)
      const settle = requestAnimationFrame(() => ScrollTrigger.refresh())
      cleanup = () => {
        image.removeEventListener("load", onLoad)
        cancelAnimationFrame(settle)
        st.kill()
      }
    }, root)

    return () => {
      cleanup()
      ctx.revert()
      // hand the words back to the element React rendered them in, so a
      // re-mount records the same start state and React can unmount cleanly
      if (up.parentElement !== titleWrap) titleWrap.append(up, down)
      cancelAnimationFrame(raf)
      lenis.off("scroll", onScroll)
      lenis.destroy()
    }
  }, [])

  return (
    <div ref={rootRef} className="r3-root">
      <style>{CSS}</style>

      <div ref={contentRef} className="r3-content">
        <div className="r3-lead">
          <img className="r3-logo" src={LOGO} alt="Zepa" draggable={false} />
        </div>

        <div className="r3-wrap">
          <div className="r3-panel">
            <div ref={titleWrapRef} className="r3-title-wrap">
              <span ref={upRef} className="r3-title r3-title--up">
                Hand
              </span>
              <span ref={downRef} className="r3-title r3-title--down">
                Craft
              </span>
            </div>
          </div>

          <div ref={layoutRef} className="r3-panel r3-layout">
            <svg
              className="r3-img"
              width="1000"
              height="560"
              viewBox="0 0 1000 560"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id={fx}>
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.02"
                    numOctaves="3"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="80"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
                <mask id={mk}>
                  <path d="M 0 280 Q 500 280 1000 280 Q 500 280 0 280" fill="white" ref={maskRef} style={{ filter: "url(#" + fx + ")" }} />
                </mask>
              </defs>
              <image
                ref={imageRef}
                href={IMAGE}
                width="1000"
                height="560"
                mask={"url(#" + mk + ")"}
                preserveAspectRatio="xMidYMid slice"
              />
            </svg>

            <p className="r3-text">
              Nothing in the registry is generated. Every piece is drawn by hand and tuned frame by frame, then held back until it survives a slow scroll on a cold cache. The ones that ship are the ones that still read well at a quarter speed, on a narrow screen, with the motion turned off. That is a slower way to build a library, and it is the only way we have found to make components that behave the same in your project as they did in ours.
            </p>
          </div>
        </div>

        <div className="r3-tail" />
      </div>
    </div>
  )
}

const CSS = `
.r3-root {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: #000000;
  color: #ffffff;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scrollbar-width: none;
}
.r3-root::-webkit-scrollbar { display: none; }
.r3-root *, .r3-root *::before, .r3-root *::after { box-sizing: border-box; }

.r3-content { position: relative; width: 100%; }
/* Runway. The two panels share one grid cell, so the wrap is only ~100vh and
   the trigger needs 40vh of travel on top of that. At a 42vh tail there were
   18px of slack, and clamp() pins start and end together the moment a
   measurement is off. */
.r3-lead {
  height: 18vh;
  display: grid;
  place-items: center;
}
.r3-logo {
  width: min(26vw, 210px);
  max-height: 9vh;
  height: auto;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-select: none;
}
.r3-tail { height: 110vh; }

.r3-wrap { display: grid; place-items: center; grid-template-areas: "main"; }
.r3-panel { grid-area: main; display: grid; place-items: center; width: 100%; }
/* the first panel is a full screen of nothing but the two words */
.r3-wrap .r3-panel:first-child { height: 100vh; }

.r3-title-wrap {
  display: flex;
  gap: 1em;
  align-items: center;
  justify-content: center;
}
/* the source set these in Typekit's stinger-variable; manrope at its widest
   tracking and heaviest weight is the closest thing that ships with the site */
.r3-title {
  padding-top: 0.3em;
  line-height: 0.525;
  font-size: clamp(2rem, 15vw, 9rem);
  font-weight: 300;
  letter-spacing: -0.01em;
  position: relative;
  z-index: 100;
  text-indent: -0.1em;
  white-space: nowrap;
}
.r3-title--up { grid-area: title-up; font-style: italic; justify-self: end; align-self: start; }
.r3-title--down { grid-area: title-down; font-weight: 700; justify-self: start; align-self: end; }

.r3-layout {
  display: grid;
  grid-template-areas: "title-up img title-down" "text text text";
  grid-template-columns: 20vw auto 20vw;
  grid-template-rows: auto auto;
  row-gap: 10vh;
  column-gap: 2vw;
  justify-content: center;
  align-content: center;
}
.r3-img { grid-area: img; max-width: 100%; height: auto; aspect-ratio: 1000 / 560; }
.r3-text {
  grid-area: text;
  margin: 0;
  font-size: clamp(0.82rem, 1vw, 1rem);
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.72);
}

.r3-img { width: 30vw; align-self: center; }
.r3-title--up { justify-self: end; align-self: center; }
.r3-title--down { align-self: center; }
.r3-text { column-count: 2; column-gap: 4vw; max-width: 590px; text-align: justify; }

/* ── tablet ──
   The desktop grids pin their side columns in vw/%, which squeezes the
   image and the copy between roughly 849 and 1100. Same layout, looser
   columns. */
@media (min-width: 849px) and (max-width: 1100px) {
  .r3-img { max-width: 132.14vh !important; }   /* 74vh tall at 1.7857 */
  .r3-title { font-size: clamp(2.4rem, 12vw, 6rem); }
  .r3-text { font-size: 0.8rem; max-width: 480px; column-gap: 3vw; }
  .r3-layout { grid-template-columns: 15vw auto 15vw !important; row-gap: 7vh; }
  .r3-img { width: 40vw !important; }
}

/* ── phone ──
   The source drops its per-layout grids below 53em and falls back to
   'title-up title-down' / 'img img' / 'text text'. The two words stay on
   one row — up pushed right, down pushed left — so they still meet in the
   middle and read as one compound word, exactly as they do full size. */
@media (max-width: 848px) {
  .r3-layout {
    width: 100%;
    grid-template-areas: "title-up title-down" "img img" "text text" !important;
    grid-template-columns: 1fr 1fr !important;
    grid-template-rows: none !important;
    gap: 1rem;
    justify-content: center;
    align-content: center;
    padding: 0 6vw;
  }
  .r3-title { font-size: clamp(1.6rem, 8.5vw, 3rem); }
  .r3-title--up { justify-self: end !important; align-self: center !important; }
  .r3-title--down { justify-self: start !important; align-self: center !important; }
  .r3-img {
    width: 100% !important;
    max-width: min(76vw, 82.14vh) !important;   /* 46vh tall at 1.7857 */
    justify-self: center;
    align-self: center !important;
  }
  .r3-text {
    max-width: 46ch !important;
    text-align: left !important;
    justify-self: center !important;
    align-self: center !important;
    column-count: 1 !important;
    margin-top: 1.2rem !important;
  }
  .r3-lead { height: 10vh; }
  .r3-logo { width: min(44vw, 170px); max-height: 7vh; }
  .r3-tail { height: 70vh; }
}

@media (prefers-reduced-motion: reduce) {
  .r3-title { transition: none; }
}
`
