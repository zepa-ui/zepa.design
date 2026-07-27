/**
 * Component originally based on the CSS Grid Layout Slideshow by Codrops.
 * https://tympanus.net/codrops/?p=32417
 * Licensed under the MIT License.
 * Copyright 2017, Codrops — http://www.codrops.com
 * Modified for Zepa UI.
 */
"use client"

import React, { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS_STRING = `
.oyo-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: var(--font-manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  background: #ccd8e4;
  color: #1a1a1a;
  --gap: 10px;
}

/* ── Revealer ── */
.oyo-hero .revealer {
  position: absolute;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  background: #ccd8e4;
  top: -2px;
  left: -2px;
  opacity: 0;
  pointer-events: none;
}
.oyo-hero .revealer--right  { transform-origin: 100% 50%; }
.oyo-hero .revealer--left   { transform-origin: 0% 50%; }
.oyo-hero .revealer--top    { transform-origin: 50% 0%; }
.oyo-hero .revealer--bottom { transform-origin: 50% 100%; }
.oyo-hero .revealer--showX,
.oyo-hero .revealer--hideX,
.oyo-hero .revealer--showY,
.oyo-hero .revealer--hideY,
.oyo-hero .revealer--visible { opacity: 1; }

.oyo-hero .revealer--hideX { animation: oyoHideX 0.8s cubic-bezier(0.7,0,0.3,1) forwards; }
@keyframes oyoHideX { from { transform: scale3d(0,1,1); } to { transform: scale3d(1,1,1); } }

.oyo-hero .revealer--showX { animation: oyoShowX 0.8s cubic-bezier(0.7,0,0.3,1) forwards; }
@keyframes oyoShowX { to { opacity:1; transform: scale3d(0,1,1); } }

.oyo-hero .revealer--hideY { animation: oyoHideY 0.8s cubic-bezier(0.7,0,0.3,1) forwards; }
@keyframes oyoHideY { from { transform: scale3d(1,0,1); } to { transform: scale3d(1,1,1); } }

.oyo-hero .revealer--showY { animation: oyoShowY 0.8s cubic-bezier(0.7,0,0.3,1) forwards; }
@keyframes oyoShowY { to { opacity:1; transform: scale3d(1,0,1); } }

/* ── Frame (logo overlay) ── */
.oyo-hero .oyo-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5em 2em;
  pointer-events: none;
}
.oyo-hero .oyo-frame a {
  pointer-events: auto;
  color: rgba(26,26,26,0.55);
  text-decoration: none;
  font-size: 0.8125em;
  letter-spacing: 0.02em;
  transition: color 0.2s;
}
.oyo-hero .oyo-frame a:hover { color: #1a1a1a; }
.oyo-hero .oyo-frame__nav { display: flex; gap: 2em; }

/* ── Grid ── */
.oyo-hero .grid {
  display: grid;
  position: absolute;
  top: 3em;
  left: 3em;
  width: calc(100% - 6em);
  height: calc(100vh - 6em);
  grid-auto-rows: calc((calc(100vh - 6em) / 30) - var(--gap));
  grid-auto-columns: calc((calc(100% - 6em) / 30) - var(--gap));
  justify-content: center;
  align-content: center;
  grid-gap: var(--gap);
  pointer-events: none;
  opacity: 0;
}
.oyo-hero .grid--current {
  opacity: 1;
  pointer-events: auto;
}
.oyo-hero .grid__item {
  position: relative;
  padding: 1em;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
  overflow: hidden;
}
.oyo-hero .grid__item--name,
.oyo-hero .grid__item--title,
.oyo-hero .grid__item--text {
  pointer-events: none;
  padding: 0;
  margin: 0;
}
.oyo-hero .grid__item--name,
.oyo-hero .grid__item--title {
  text-transform: uppercase;
  line-height: 0.82;
  font-weight: 900;
}
.oyo-hero .grid__item--name {
  font-size: 7vw;
  color: #7c3aed;
  word-break: break-word;
}
.oyo-hero .grid__item--title {
  font-size: 3.5vh;
  writing-mode: vertical-lr;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  color: #7c3aed;
  letter-spacing: 0.1em;
}
.oyo-hero .grid__item--text {
  font-size: 0.8em;
  line-height: 1.5;
  display: flex;
  align-items: flex-end;
  color: #334155;
}
.oyo-hero .grid__item--nav {
  background: #4f46e5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.oyo-hero .grid__item--nav:hover { background: #1e1b4b; }
.oyo-hero .grid__item--nav-next svg { margin-left: auto; }

/* ── Text fade animations ── */
.oyo-hero .grid__item--animateOut {
  animation: oyoTextOut 0.8s cubic-bezier(0.7,0,0.3,1) forwards;
}
@keyframes oyoTextOut { to { opacity: 0; } }

.oyo-hero .grid__item--animateIn {
  animation: oyoTextIn 0.8s cubic-bezier(0.7,0,0.3,1) forwards;
}
@keyframes oyoTextIn { from { opacity: 0; } to { opacity: 1; } }

/* ── Layout 1 ── */
.oyo-hero .grid--layout-1 .grid__item:nth-child(1)  { grid-area: 11 / 1 / 17 / 5; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(2)  { grid-area: 22 / 6 / 28 / 10; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(3)  { grid-area: 8 / 5 / 22 / 15; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(4)  { grid-area: 22 / 10 / 29 / 15; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(5)  { grid-area: 1 / 11 / 8 / 15; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(6)  { grid-area: 17 / 15 / 24 / 20; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(7)  { grid-area: 9 / 15 / 17 / 23; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(8)  { grid-area: 2 / 18 / 9 / 23; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(9)  { grid-area: 17 / 20 / 22 / 26; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(10) { grid-area: 22 / 20 / 28 / 23; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(11) { grid-area: 4 / 23 / 11 / 27; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(12) { grid-area: 11 / 23 / 17 / 30; }
.oyo-hero .grid--layout-1 .grid__item:nth-child(13) { grid-area: 17 / 26 / 22 / 28; }
.oyo-hero .grid--layout-1 .grid__item--name     { grid-area: 3 / 12 / 30 / 25; }
.oyo-hero .grid--layout-1 .grid__item--title    { grid-area: 1 / 27 / 11 / 29; }
.oyo-hero .grid--layout-1 .grid__item--text     { grid-area: 22 / 23 / 30 / 26; }
.oyo-hero .grid--layout-1 .grid__item--nav-prev { grid-area: 3 / 6 / 8 / 11; }
.oyo-hero .grid--layout-1 .grid__item--nav-next { grid-area: 24 / 15 / 29 / 20; }

/* ── Layout 2 ── */
.oyo-hero .grid--layout-2 .grid__item:nth-child(1)  { grid-area: 17 / 1 / 24 / 5; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(2)  { grid-area: 22 / 6 / 28 / 10; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(3)  { grid-area: 14 / 5 / 22 / 10; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(4)  { grid-area: 17 / 10 / 26 / 15; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(5)  { grid-area: 1 / 10 / 17 / 15; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(6)  { grid-area: 11 / 15 / 24 / 20; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(7)  { grid-area: 5 / 15 / 11 / 18; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(8)  { grid-area: 1 / 18 / 11 / 23; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(9)  { grid-area: 20 / 20 / 27 / 24; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(10) { grid-area: 24 / 15 / 29 / 20; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(11) { grid-area: 4 / 23 / 11 / 27; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(12) { grid-area: 11 / 20 / 20 / 30; }
.oyo-hero .grid--layout-2 .grid__item:nth-child(13) { grid-area: 25 / 24 / 29 / 28; }
.oyo-hero .grid--layout-2 .grid__item--name     { grid-area: 16 / 9 / 30 / 16; }
.oyo-hero .grid--layout-2 .grid__item--title    { grid-area: 1 / 27 / 11 / 29; }
.oyo-hero .grid--layout-2 .grid__item--text     { grid-area: 1 / 5 / 9 / 10; align-items: flex-end; text-align: right; }
.oyo-hero .grid--layout-2 .grid__item--nav-prev { grid-area: 9 / 5 / 14 / 10; }
.oyo-hero .grid--layout-2 .grid__item--nav-next { grid-area: 20 / 24 / 25 / 30; }

/* ── Layout 3 ── */
.oyo-hero .grid--layout-3 .grid__item:nth-child(1)  { grid-area: 6 / 1 / 14 / 5; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(2)  { grid-area: 3 / 5 / 14 / 10; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(3)  { grid-area: 14 / 1 / 21 / 5; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(4)  { grid-area: 19 / 10 / 28 / 20; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(5)  { grid-area: 1 / 10 / 11 / 18; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(6)  { grid-area: 11 / 10 / 19 / 15; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(7)  { grid-area: 11 / 15 / 19 / 20; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(8)  { grid-area: 1 / 18 / 6 / 23; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(9)  { grid-area: 20 / 20 / 27 / 24; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(10) { grid-area: 20 / 28 / 25 / 30; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(11) { grid-area: 4 / 23 / 11 / 27; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(12) { grid-area: 11 / 20 / 20 / 30; }
.oyo-hero .grid--layout-3 .grid__item:nth-child(13) { grid-area: 20 / 24 / 26 / 28; }
.oyo-hero .grid--layout-3 .grid__item--name     { grid-area: 15 / 16 / 30 / 23; }
.oyo-hero .grid--layout-3 .grid__item--title    { grid-area: 1 / 27 / 11 / 29; }
.oyo-hero .grid--layout-3 .grid__item--text     { grid-area: 19 / 5 / 30 / 10; align-items: flex-end; text-align: right; }
.oyo-hero .grid--layout-3 .grid__item--nav-prev { grid-area: 14 / 5 / 19 / 10; }
.oyo-hero .grid--layout-3 .grid__item--nav-next { grid-area: 6 / 18 / 11 / 23; }
`

// ─── Images ───────────────────────────────────────────────────────────────────

// Deterministic grayscale editorial photos from picsum
const img = (n: number) =>
  `https://picsum.photos/seed/zepaui${n}/400/600?grayscale`

// Each layout uses 13 images (matching original CSS indices)
const L1_IMGS = [2,4,6,8,10,12,14,16,18,20,22,3,5].map(img)
const L2_IMGS = [7,9,11,13,15,17,19,21,23,2,4,6,8].map(img)
const L3_IMGS = [1,2,3,4,5,6,7,8,9,10,11,12,13].map(img)

// ─── Slide content ────────────────────────────────────────────────────────────

const SLIDES = [
  { name: "ZEPA UI",  title: "SHIP", text: "Build faster.\nShip more beautiful." },
  { name: "DESIGN",   title: "OPEN", text: "Components built\nfor the modern web." },
  { name: "SOURCE",   title: "CODE", text: "Drop-in.\nAnimate. Ship." },
]

// ─── Animation types ──────────────────────────────────────────────────────────

interface AniOpts {
  direction?: "rtl" | "ltr" | "ttb" | "btt"
  delay?: number
  target?: HTMLElement
}

// ─── Revealer ─────────────────────────────────────────────────────────────────

class Revealer {
  private el: HTMLElement
  private rev: HTMLDivElement
  private ALL = [
    "revealer--visible","revealer--right","revealer--left","revealer--top",
    "revealer--bottom","revealer--showX","revealer--showY","revealer--hideX","revealer--hideY",
  ]

  constructor(el: HTMLElement, color = "#ccd8e4") {
    this.el = el
    this.rev = document.createElement("div")
    this.rev.className = "revealer"
    this.rev.style.backgroundColor = color
    el.appendChild(this.rev)
  }

  show(opts?: AniOpts) { return this._toggle(opts, "show") }
  hide(opts?: AniOpts) { return this._toggle(opts, "hide") }

  private _toggle(opts: AniOpts | undefined, action: "show" | "hide") {
    return new Promise<void>((resolve) => {
      if (opts) {
        this._animate(opts, action)
        this.rev.addEventListener("animationend", () => resolve(), { once: true })
      } else {
        this.rev.classList.remove(...this.ALL)
        this.rev.classList.add("revealer--visible")
        resolve()
      }
    })
  }

  private _animate(opts: AniOpts, action: "show" | "hide") {
    setTimeout(() => {
      const target = opts.target || this.rev
      target.style.visibility = "visible"
      target.classList.remove(...this.ALL)

      let dirClass = "revealer--right"
      let axis = "h"
      if (opts.direction === "rtl") {
        dirClass = action === "hide" ? "revealer--right" : "revealer--left"; axis = "h"
      } else if (opts.direction === "ltr") {
        dirClass = action === "hide" ? "revealer--left" : "revealer--right"; axis = "h"
      } else if (opts.direction === "ttb") {
        dirClass = action === "hide" ? "revealer--top" : "revealer--bottom"; axis = "v"
      } else if (opts.direction === "btt") {
        dirClass = action === "hide" ? "revealer--bottom" : "revealer--top"; axis = "v"
      }

      target.classList.add(dirClass, axis === "h" ? `revealer--${action}X` : `revealer--${action}Y`)
    }, opts.delay ?? 0)
  }
}

// ─── GridItem ─────────────────────────────────────────────────────────────────

class GridItem {
  el: HTMLElement
  private rev: Revealer

  constructor(el: HTMLElement) {
    this.el = el
    this.rev = new Revealer(el)
  }

  private get opts(): AniOpts {
    return {
      direction: (this.el.dataset.dir as AniOpts["direction"]) ?? "rtl",
      delay: Number(this.el.dataset.delay ?? 0),
    }
  }

  show(animated = true) { return animated ? this.rev.show(this.opts) : this.rev.show() }
  hide(animated = true) { return animated ? this.rev.hide(this.opts) : this.rev.hide() }
}

// ─── SlideGrid ────────────────────────────────────────────────────────────────

class SlideGrid {
  private el: HTMLElement
  private items: GridItem[]
  private textEls: HTMLElement[]

  constructor(el: HTMLElement) {
    this.el = el
    this.items = Array.from(el.querySelectorAll<HTMLElement>("div.grid__item")).map(
      (e) => new GridItem(e)
    )
    this.textEls = (
      [".grid__item--name", ".grid__item--title", ".grid__item--text"] as const
    )
      .map((s) => el.querySelector<HTMLElement>(s))
      .filter((e): e is HTMLElement => e !== null)
  }

  show() {
    return new Promise<void>((resolve) => {
      this.el.classList.add("grid--animating")
      this.items.forEach((i) => i.hide(false))       // instant curtain over all
      this.el.classList.add("grid--current")
      const ps: Promise<void>[] = [
        ...this.items.map((i) => i.show()),           // wipe curtains away
        ...this.textEls.map((e) => this._fadeText(e, "In")),
      ]
      Promise.all(ps).then(() => {
        this.textEls.forEach((e) => e.classList.remove("grid__item--animateIn"))
        this.el.classList.remove("grid--animating")
        resolve()
      })
    })
  }

  hide() {
    return new Promise<void>((resolve) => {
      this.el.classList.add("grid--animating")
      const ps: Promise<void>[] = [
        ...this.items.map((i) => i.hide()),           // wipe curtains in
        ...this.textEls.map((e) => this._fadeText(e, "Out")),
      ]
      Promise.all(ps).then(() => {
        this.textEls.forEach((e) => e.classList.remove("grid__item--animateOut"))
        this.el.classList.remove("grid--animating", "grid--current")
        resolve()
      })
    })
  }

  private _fadeText(el: HTMLElement, dir: "In" | "Out") {
    return new Promise<void>((resolve) => {
      el.classList.add(`grid__item--animate${dir}`)
      el.addEventListener("animationend", () => resolve(), { once: true })
    })
  }
}

// ─── Slideshow ────────────────────────────────────────────────────────────────

class OyoSlideshow {
  private grids: SlideGrid[]
  private current = 0
  private busy = false

  constructor(els: HTMLElement[]) {
    this.grids = els.map((el) => new SlideGrid(el))
  }

  navigate(dir: "next" | "prev") {
    if (this.busy) return
    this.busy = true
    const n = this.grids.length
    const from = this.grids[this.current]
    this.current =
      dir === "next" ? (this.current + 1) % n : (this.current - 1 + n) % n
    from.hide().then(() =>
      this.grids[this.current].show().then(() => (this.busy = false))
    )
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      width={22} height={22} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      width={22} height={22} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

// ─── OyoHero ──────────────────────────────────────────────────────────────────

const GRID_IMAGES = [L1_IMGS, L2_IMGS, L3_IMGS]
const LAYOUT_CLASSES = ["grid--layout-1", "grid--layout-2", "grid--layout-3"]

export default function OyoHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const slideshowRef = useRef<OyoSlideshow | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const gridEls = Array.from(container.querySelectorAll<HTMLElement>(".oyo-grid"))
    slideshowRef.current = new OyoSlideshow(gridEls)
    return () => { slideshowRef.current = null }
  }, [])

  const nav = (dir: "next" | "prev") => () => slideshowRef.current?.navigate(dir)

  return (
    <div ref={containerRef} className="oyo-hero">
      <style>{CSS_STRING}</style>

      {/* Logo + nav links */}
      <div className="oyo-frame">
        <Link href="/">
          <Image
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"
            alt="Zepa"
            width={90}
            height={26}
            style={{ height: 26, width: "auto", objectFit: "contain", filter: "brightness(0)" }}
            priority
          />
        </Link>
        <nav className="oyo-frame__nav">
          <Link href="/components">Components</Link>
          <Link href="/templates">Templates</Link>
          <Link href="/docs">Docs</Link>
        </nav>
      </div>

      {/* Three grid layouts */}
      {SLIDES.map((slide, gi) => (
        <div
          key={gi}
          className={`grid oyo-grid ${LAYOUT_CLASSES[gi]}${gi === 0 ? " grid--current" : ""}`}
        >
          {/* 13 photo items — must be children 1–13 for :nth-child CSS to apply */}
          {GRID_IMAGES[gi].map((src, i) => (
            <div
              key={i}
              className="grid__item"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}

          {/* Text items */}
          <div className="grid__item grid__item--name">
            {gi === 0 ? (
              <>
                <span style={{ color: "#2563eb" }}>ZEPA</span>
                <span style={{ color: "#111827" }}>{" "}UI</span>
              </>
            ) : (
              slide.name
            )}
          </div>
          <div className="grid__item grid__item--title">{slide.title}</div>
          <div className="grid__item grid__item--text">
            {slide.text.split("\n").map((line, k) => (
              <span key={k}>{line}{k < slide.text.split("\n").length - 1 && <br />}</span>
            ))}
          </div>

          {/* Nav buttons */}
          <div
            className="grid__item grid__item--nav grid__item--nav-prev"
            onClick={nav("prev")}
            role="button"
            aria-label="Previous slide"
          >
            <ArrowLeft />
          </div>
          <div
            className="grid__item grid__item--nav grid__item--nav-next"
            onClick={nav("next")}
            role="button"
            aria-label="Next slide"
          >
            <ArrowRight />
          </div>
        </div>
      ))}
    </div>
  )
}
