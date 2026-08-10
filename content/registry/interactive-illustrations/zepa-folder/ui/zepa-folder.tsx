"use client"

/**
 * ZepaFolder — interactive folder illustration.
 *
 * A drop-in illustration, not a page section: it sizes itself from a single
 * `size` prop and re-colours from a single `color` prop, so it can sit inside
 * a bento tile, a feature card or a hero without any layout assumptions.
 *
 *   <ZepaFolder files={files} title="Portraits" />          square bento cell
 *   <ZepaFolder files={files} color="#7c5cff" variant="bare" />  inside your own tile
 *
 * Embed-safety notes (see dev-journal "Recurring gotchas"):
 *  - no network fonts, no `window` measurement, no per-frame setState
 *  - every class and keyframe is prefixed `zf-`
 *  - the only fixed-position element is the lightbox, which exists solely
 *    while it is open and is portalled to <body>; `overlay="inline"` keeps it
 *    inside the illustration instead, for embedded tiles.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react"
import { createPortal } from "react-dom"

export interface ZepaFolderFile {
  id: string
  image: string
  title: string
}

export interface ZepaFolderProps {
  /** Files inside the folder. The first `maxVisible` fan out; all are navigable in the lightbox. */
  files: ZepaFolderFile[]
  /** Label under the folder. Omit for a bare illustration. */
  title?: string
  /** Sub-label. Defaults to "N files". Pass null to hide. */
  caption?: string | null
  /** Base folder colour — every shade is derived from it with color-mix. */
  color?: string
  /** Folder width in px. Everything else scales from this. */
  size?: number
  /** Fan width multiplier on open. 1 = default, 0 = stacked. */
  spread?: number
  /** How many files fan out of the folder. */
  maxVisible?: number
  /** Let the top card peek above the rim at rest. */
  peek?: boolean
  /** Click a card to expand it. */
  lightbox?: boolean
  /** "fixed" fills the viewport (portalled). "inline" stays inside the illustration. */
  overlay?: "fixed" | "inline"
  /** "tile" is a square bento cell. "bare" is just the folder, for dropping into someone else's tile. */
  variant?: "tile" | "bare"
  /** Micro-hint shown at rest. Pass null to hide. */
  hint?: string | null
  className?: string
  onFileSelect?: (file: ZepaFolderFile, index: number) => void
}

const CSS = `
.zf-root{position:relative;display:inline-flex;flex-direction:column;align-items:center;isolation:isolate;font-family:var(--font-manrope),ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-user-select:none;user-select:none}
.zf-root *{box-sizing:border-box}
.zf-root[data-variant="tile"]{display:flex;justify-content:center;width:100%;max-width:var(--zf-tile);aspect-ratio:1;padding:clamp(14px,4.5%,24px);border:1px solid var(--zf-line);border-radius:22px;background:var(--zf-surface);transition:border-color .45s ease,box-shadow .45s ease}
.zf-root[data-variant="tile"][data-open="true"]{border-color:var(--zf-line-hi);box-shadow:0 30px 70px -40px var(--zf-color)}
.zf-glow{position:absolute;inset:0;border-radius:inherit;background:radial-gradient(circle at 50% 74%,var(--zf-color) 0%,transparent 68%);opacity:0;transition:opacity .5s ease;pointer-events:none}
.zf-root[data-open="true"] .zf-glow{opacity:.11}

.zf-stage{position:relative;width:var(--zf-fw);height:calc(var(--zf-fh) + var(--zf-head));perspective:1000px;cursor:pointer}
.zf-folder{position:absolute;left:0;right:0;bottom:0;height:var(--zf-fh);transform-style:preserve-3d}

.zf-back{position:absolute;inset:0;z-index:10;border-radius:var(--zf-r);background:linear-gradient(180deg,var(--zf-shade-1),var(--zf-shade-2));transform-origin:bottom center;transition:transform .5s var(--zf-pop);box-shadow:0 12px 26px -16px rgba(0,0,0,.85)}
.zf-tab{position:absolute;left:7%;bottom:100%;z-index:9;width:33%;height:calc(var(--zf-fh) * .17);border-radius:calc(var(--zf-r) * .8) calc(var(--zf-r) * .8) 0 0;background:linear-gradient(180deg,var(--zf-shade-1),var(--zf-shade-2));transform-origin:bottom center;transition:transform .5s var(--zf-pop)}
.zf-front{position:absolute;left:0;right:0;bottom:0;z-index:30;height:74%;border-radius:calc(var(--zf-r) * .95);background:linear-gradient(168deg,var(--zf-face-1),var(--zf-face-2));transform-origin:bottom center;transition:transform .5s var(--zf-pop);box-shadow:0 1px 0 rgba(255,255,255,.28) inset,0 20px 38px -20px rgba(0,0,0,.9)}
.zf-shine{position:absolute;left:0;right:0;bottom:0;z-index:31;height:74%;border-radius:calc(var(--zf-r) * .95);background:linear-gradient(135deg,rgba(255,255,255,.32) 0%,rgba(255,255,255,0) 54%);transform-origin:bottom center;transition:transform .5s var(--zf-pop);pointer-events:none}
.zf-root[data-open="true"] .zf-back{transform:rotateX(-14deg)}
.zf-root[data-open="true"] .zf-tab{transform:rotateX(-24deg) translateY(-2px)}
.zf-root[data-open="true"] .zf-front,.zf-root[data-open="true"] .zf-shine{transform:rotateX(24deg) translateY(calc(var(--zf-fw) * .03))}

.zf-cards{position:absolute;left:50%;bottom:calc(var(--zf-fh) * .10);z-index:20;width:0;height:0}
.zf-file{position:absolute;bottom:0;left:calc(var(--zf-cw) / -2);width:var(--zf-cw);height:var(--zf-ch);padding:0;overflow:hidden;border:1px solid rgba(255,255,255,.16);border-radius:calc(var(--zf-cw) * .12);background:#101014;cursor:pointer;-webkit-appearance:none;appearance:none;transform:var(--zf-rest);transition:transform .6s var(--zf-pop),opacity .35s ease,box-shadow .3s ease;box-shadow:0 16px 32px -16px rgba(0,0,0,.95)}
.zf-root[data-open="true"] .zf-file{transform:var(--zf-open)}
.zf-root[data-open="true"] .zf-file:hover{box-shadow:0 0 0 2px var(--zf-color),0 20px 36px -14px rgba(0,0,0,.95)}
.zf-file:focus-visible{outline:2px solid var(--zf-color);outline-offset:3px}
.zf-file[data-hidden="true"]{opacity:0}
.zf-file[data-static="true"]{cursor:default}
.zf-file img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}
.zf-file-label{position:absolute;left:0;right:0;bottom:0;padding:22% 9% 8%;font-size:calc(var(--zf-cw) * .125);font-weight:600;line-height:1.2;color:#fff;text-align:left;background:linear-gradient(to top,rgba(0,0,0,.78),transparent);opacity:0;transition:opacity .3s ease;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zf-root[data-open="true"] .zf-file-label{opacity:1}

.zf-meta{margin-top:calc(var(--zf-fw) * .07);text-align:center}
.zf-title{margin:0;font-size:clamp(15px,calc(var(--zf-fw) * .072),19px);font-weight:600;letter-spacing:-.01em}
.zf-caption{margin:.35em 0 0;font-size:clamp(12px,calc(var(--zf-fw) * .056),14px);color:var(--zf-muted)}
.zf-hint{margin:.85em 0 0;font-size:11px;letter-spacing:.02em;color:var(--zf-muted);opacity:.7;transition:opacity .3s ease,transform .3s ease}
.zf-root[data-open="true"] .zf-hint{opacity:0;transform:translateY(6px)}

.zf-lb{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:clamp(16px,4vw,48px)}
.zf-lb:focus{outline:none}
.zf-lb[data-mode="inline"]{position:absolute;z-index:60;padding:14px}
.zf-lb-scrim{position:absolute;inset:0;background:rgba(6,6,9,.84);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);animation:zf-fade .38s ease both}
.zf-lb-figure{position:relative;z-index:1;width:min(760px,100%);overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:#0b0b0d;box-shadow:0 44px 90px -34px rgba(0,0,0,.95)}
.zf-lb[data-state="closing"] .zf-lb-scrim{animation:none;opacity:0;transition:opacity .28s ease}
.zf-lb[data-state="closing"] .zf-lb-figure{opacity:0;transform:scale(.96)!important;transition:opacity .28s ease,transform .28s ease}
.zf-lb[data-state="closing"] .zf-lb-btn,.zf-lb[data-state="closing"] .zf-lb-bar{animation:none;opacity:0;transition:opacity .2s ease}
.zf-lb-viewport{overflow:hidden}
.zf-lb-track{display:flex}
.zf-lb-slide{flex:0 0 100%;min-width:100%}
.zf-lb-slide img{display:block;width:100%;height:auto;max-height:min(68vh,620px);object-fit:contain;background:#08080a}
.zf-lb[data-mode="inline"] .zf-lb-slide img{max-height:56vh}

.zf-lb-bar{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:17px 21px;border-top:1px solid rgba(255,255,255,.08);background:#0b0b0d;animation:zf-rise .32s ease .14s both}
.zf-lb-name{margin:0;font-size:16px;font-weight:600;letter-spacing:-.01em;color:#fff}
.zf-lb-sub{display:flex;align-items:center;gap:12px;margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.45)}
.zf-kbd{display:inline-block;margin:0 2px;padding:2px 6px;border:1px solid rgba(255,255,255,.14);border-radius:5px;background:rgba(255,255,255,.06);font-size:11px;line-height:1.2}
.zf-dots{display:flex;align-items:center;gap:6px}
.zf-dot{width:7px;height:7px;padding:0;border:0;border-radius:999px;background:rgba(255,255,255,.28);cursor:pointer;transition:background .25s ease,transform .25s ease}
.zf-dot[data-active="true"]{background:#fff;transform:scale(1.18)}
.zf-lb-view{flex-shrink:0;display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);font-size:13px;font-weight:500;cursor:pointer;transition:background .2s ease,color .2s ease}
.zf-lb-view:hover{background:rgba(255,255,255,.12);color:#fff}

.zf-lb-btn{position:absolute;z-index:2;display:flex;align-items:center;justify-content:center;padding:0;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.72);cursor:pointer;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);animation:zf-fade .3s ease .14s both;transition:background .2s ease,color .2s ease,transform .2s ease}
.zf-lb-btn:hover{background:rgba(255,255,255,.17);color:#fff;transform:scale(1.07)}
.zf-lb-btn:disabled{opacity:0!important;pointer-events:none}
.zf-lb-close{top:clamp(10px,2vw,20px);right:clamp(10px,2vw,20px);width:40px;height:40px}
.zf-lb-prev{left:clamp(6px,2vw,26px);top:50%;margin-top:-24px;width:48px;height:48px}
.zf-lb-next{right:clamp(6px,2vw,26px);top:50%;margin-top:-24px;width:48px;height:48px}

@keyframes zf-fade{from{opacity:0}to{opacity:1}}
@keyframes zf-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){
  .zf-root *,.zf-lb,.zf-lb *{animation-duration:1ms!important;transition-duration:1ms!important}
}
`

const POP = "cubic-bezier(0.34, 1.56, 0.64, 1)"
const GLIDE = "cubic-bezier(0.16, 1, 0.3, 1)"

/** -1 .. 1 position of card `i` within `count` cards. Single card sits centred. */
function fanPosition(i: number, count: number) {
  return count <= 1 ? 0 : (i / (count - 1)) * 2 - 1
}

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconChevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={dir === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconExternal() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3h7v7M13 3L6.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 10.5V13H3V5h2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface LightboxProps {
  files: ZepaFolderFile[]
  startIndex: number
  sourceRect: DOMRect
  mode: "fixed" | "inline"
  onIndexChange: (index: number) => void
  onClose: () => void
}

function Lightbox({
  files,
  startIndex,
  sourceRect,
  mode,
  onIndexChange,
  onClose,
}: LightboxProps) {
  const [index, setIndex] = useState(startIndex)
  const [closing, setClosing] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const figureRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const current = files[index]

  // FLIP: the figure is laid out at its final size, then yanked back onto the
  // clicked card and released. Measuring the real target beats guessing it —
  // no assumptions about viewport size or aspect ratio survive contact with
  // a bento tile.
  useLayoutEffect(() => {
    const figure = figureRef.current
    const track = trackRef.current
    const overlay = overlayRef.current
    if (!figure || !track) return

    const target = figure.getBoundingClientRect()
    if (target.width === 0 || target.height === 0) return

    const scale = Math.max(
      sourceRect.width / target.width,
      sourceRect.height / target.height
    )
    const dx =
      sourceRect.left + sourceRect.width / 2 - (target.left + target.width / 2)
    const dy =
      sourceRect.top + sourceRect.height / 2 - (target.top + target.height / 2)

    figure.style.transition = "none"
    figure.style.transformOrigin = "center center"
    figure.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`
    figure.style.borderRadius = "10px"
    // The track must not slide in from slide 0 on open.
    track.style.transition = "none"

    void figure.offsetWidth

    figure.style.transition = `transform 460ms ${GLIDE}, border-radius 460ms ${GLIDE}`
    figure.style.transform = "translate(0, 0) scale(1)"
    figure.style.borderRadius = ""
    track.style.transition = `transform 420ms ${GLIDE}`

    overlay?.focus({ preventScroll: true })
  }, [sourceRect])

  // Scroll lock only makes sense for the viewport-filling variant.
  useEffect(() => {
    if (mode !== "fixed") return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mode])

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next > files.length - 1) return
      setIndex(next)
      onIndexChange(next)
    },
    [files.length, onIndexChange]
  )

  const beginClose = useCallback(() => {
    setClosing(true)
    window.setTimeout(onClose, 280)
  }, [onClose])

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation()
      beginClose()
    }
    if (event.key === "ArrowRight") go(index + 1)
    if (event.key === "ArrowLeft") go(index - 1)
  }

  const overlay = (
    <div
      ref={overlayRef}
      className="zf-lb"
      data-mode={mode}
      data-state={closing ? "closing" : "open"}
      role="dialog"
      aria-modal="true"
      aria-label={current?.title ?? "File preview"}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onClick={beginClose}
    >
      <div className="zf-lb-scrim" />

      <button
        type="button"
        className="zf-lb-btn zf-lb-close"
        aria-label="Close preview"
        onClick={(event) => {
          event.stopPropagation()
          beginClose()
        }}
      >
        <IconClose />
      </button>

      <button
        type="button"
        className="zf-lb-btn zf-lb-prev"
        aria-label="Previous file"
        disabled={index === 0}
        onClick={(event) => {
          event.stopPropagation()
          go(index - 1)
        }}
      >
        <IconChevron dir="left" />
      </button>

      <button
        type="button"
        className="zf-lb-btn zf-lb-next"
        aria-label="Next file"
        disabled={index === files.length - 1}
        onClick={(event) => {
          event.stopPropagation()
          go(index + 1)
        }}
      >
        <IconChevron dir="right" />
      </button>

      <div
        ref={figureRef}
        className="zf-lb-figure"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="zf-lb-viewport">
          <div
            ref={trackRef}
            className="zf-lb-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {files.map((file) => (
              <div key={file.id} className="zf-lb-slide">
                <img src={file.image} alt={file.title} draggable={false} />
              </div>
            ))}
          </div>
        </div>

        <div className="zf-lb-bar">
          <div style={{ minWidth: 0 }}>
            <p className="zf-lb-name">{current?.title}</p>
            <div className="zf-lb-sub">
              {files.length > 1 ? (
                <span>
                  Arrows
                  <kbd className="zf-kbd">←</kbd>
                  <kbd className="zf-kbd">→</kbd>
                </span>
              ) : null}
              {files.length > 1 ? (
                <span className="zf-dots">
                  {files.map((file, i) => (
                    <button
                      key={file.id}
                      type="button"
                      className="zf-dot"
                      data-active={i === index}
                      aria-label={`Go to ${file.title}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        go(i)
                      }}
                    />
                  ))}
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            className="zf-lb-view"
            onClick={(event) => event.stopPropagation()}
          >
            <span>Open</span>
            <IconExternal />
          </button>
        </div>
      </div>
    </div>
  )

  if (mode === "inline") return overlay
  return createPortal(overlay, document.body)
}

export function ZepaFolder({
  files,
  title,
  caption,
  color = "#f5a623",
  size = 260,
  spread = 1,
  maxVisible = 3,
  peek = true,
  lightbox = true,
  overlay = "fixed",
  variant = "tile",
  hint = "Hover to open",
  className,
  onFileSelect,
}: ZepaFolderProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<{ index: number; rect: DOMRect } | null>(
    null
  )
  const [hiddenId, setHiddenId] = useState<string | null>(null)
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null)

  const visible = files.slice(0, Math.max(1, maxVisible))

  const handleOpenFile = (
    file: ZepaFolderFile,
    index: number,
    element: HTMLButtonElement
  ) => {
    onFileSelect?.(file, index)
    if (!lightbox) return
    lastTriggerRef.current = element
    setHiddenId(file.id)
    setActive({ index, rect: element.getBoundingClientRect() })
  }

  const handleCloseLightbox = useCallback(() => {
    setActive(null)
    setHiddenId(null)
    lastTriggerRef.current?.focus({ preventScroll: true })
  }, [])

  // Keeps the card under the lightbox hidden as the user navigates, so closing
  // on a different file doesn't flash the original card back in.
  const handleIndexChange = useCallback(
    (index: number) => {
      setHiddenId(files[index]?.id ?? null)
    },
    [files]
  )

  const rootStyle = {
    "--zf-fw": `${size}px`,
    "--zf-fh": `${Math.round(size * 0.72)}px`,
    "--zf-cw": `${Math.round(size * 0.52)}px`,
    "--zf-ch": `${Math.round(size * 0.73)}px`,
    "--zf-r": `${Math.round(size * 0.055)}px`,
    // Headroom for the fan: 0.072 (anchor) + 0.74 (lift) + 0.73 (card) - 0.72
    // (folder) = 0.822 of `size`, plus a little slack.
    "--zf-head": `${Math.round(size * 0.85)}px`,
    // Square side that fits stage + labels + padding without clipping the fan.
    // Kept tight on purpose — the folder should dominate the tile, not float
    // in it. Roughly 45% of the tile width at any `size`.
    "--zf-tile": `${Math.round(size * 1.57 + 128)}px`,
    "--zf-pop": POP,
    "--zf-color": color,
    "--zf-shade-1": `color-mix(in oklab, ${color} 90%, #000)`,
    "--zf-shade-2": `color-mix(in oklab, ${color} 78%, #000)`,
    "--zf-face-1": `color-mix(in oklab, ${color} 92%, #fff)`,
    "--zf-face-2": color,
    "--zf-muted": "color-mix(in oklab, currentColor 55%, transparent)",
    "--zf-line": "color-mix(in oklab, currentColor 12%, transparent)",
    "--zf-line-hi": `color-mix(in oklab, ${color} 42%, transparent)`,
    "--zf-surface": "color-mix(in oklab, currentColor 4%, transparent)",
  } as CSSProperties

  const resolvedCaption =
    caption === null
      ? null
      : (caption ?? `${files.length} ${files.length === 1 ? "file" : "files"}`)

  return (
    <div
      className={className ? `zf-root ${className}` : "zf-root"}
      data-variant={variant}
      data-open={open}
      style={rootStyle}
    >
      <style>{CSS}</style>
      <div className="zf-glow" />

      <div
        className="zf-stage"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setOpen(true)
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setOpen(false)
        }}
        onClick={(event) => {
          // Touch and pen have no hover — a tap on the folder toggles it.
          const native = event.nativeEvent
          if (
            typeof PointerEvent !== "undefined" &&
            native instanceof PointerEvent &&
            native.pointerType !== "mouse"
          ) {
            setOpen((v) => !v)
          }
        }}
      >
        <div className="zf-folder">
          <div className="zf-back" />
          <div className="zf-tab" />

          <div className="zf-cards">
            {visible.map((file, index) => {
              const t = fanPosition(index, visible.length)
              const rest = peek
                ? `translate(${(t * size * 0.024).toFixed(2)}px, ${(
                    size * -0.09
                  ).toFixed(2)}px) rotate(${(t * 3.5).toFixed(2)}deg) scale(.88)`
                : "translate(0px, 0px) rotate(0deg) scale(.5)"
              // 0.36 keeps the widest fan just inside the card padding at the
              // default size — `spread` is the knob for pushing past it.
              const opened = `translate(${(t * size * 0.36 * spread).toFixed(
                2
              )}px, ${(size * -0.74).toFixed(2)}px) rotate(${(t * 12).toFixed(
                2
              )}deg) scale(1)`

              return (
                <button
                  key={file.id}
                  type="button"
                  className="zf-file"
                  data-hidden={hiddenId === file.id}
                  data-static={!lightbox && !onFileSelect}
                  aria-label={
                    lightbox ? `Open ${file.title}` : file.title
                  }
                  tabIndex={lightbox || onFileSelect ? 0 : -1}
                  style={
                    {
                      "--zf-rest": rest,
                      "--zf-open": opened,
                      zIndex: 10 - Math.round(
                        Math.abs(index - (visible.length - 1) / 2)
                      ),
                      transitionDelay: `${index * 70}ms`,
                      opacity: peek || open ? undefined : 0,
                    } as CSSProperties
                  }
                  onFocus={() => setOpen(true)}
                  onBlur={(event) => {
                    if (
                      !event.currentTarget.parentElement?.contains(
                        event.relatedTarget as Node | null
                      )
                    ) {
                      setOpen(false)
                    }
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleOpenFile(file, index, event.currentTarget)
                  }}
                >
                  <img src={file.image} alt="" draggable={false} />
                  <span className="zf-file-label">{file.title}</span>
                </button>
              )
            })}
          </div>

          <div className="zf-front" />
          <div className="zf-shine" />
        </div>
      </div>

      {title || resolvedCaption || hint ? (
        <div className="zf-meta">
          {title ? <p className="zf-title">{title}</p> : null}
          {resolvedCaption ? <p className="zf-caption">{resolvedCaption}</p> : null}
          {hint ? <p className="zf-hint">{hint}</p> : null}
        </div>
      ) : null}

      {active ? (
        <Lightbox
          files={files}
          startIndex={active.index}
          sourceRect={active.rect}
          mode={overlay}
          onIndexChange={handleIndexChange}
          onClose={handleCloseLightbox}
        />
      ) : null}
    </div>
  )
}

export default ZepaFolder
