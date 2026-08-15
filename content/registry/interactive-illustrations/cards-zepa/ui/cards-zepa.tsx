"use client"

/**
 * CardsZepa — a fanned card stack with pointer tilt.
 *
 * Three cards fanned left / centre / right. Moving the pointer over one tilts
 * it in 3D; clicking a side card promotes it to the centre and the stack
 * reshuffles.
 *
 *   <CardsZepa />
 *   <CardsZepa cards={myCards} tilt={14} />
 *   <CardsZepa variant="bare" />
 *
 * Implementation notes:
 *  - **Two transforms, two elements.** The slot owns placement (translate /
 *    rotate, slow transition) and the card inside owns tilt (rotateX/rotateY,
 *    fast transition). One element cannot hold both without the interaction
 *    fighting the animation.
 *  - **The reorder needs no FLIP.** Position comes from `transform`, not from
 *    document flow, so changing a card's slot changes its transform and the
 *    CSS transition animates it. No measuring, no layout projection.
 *  - Tilt is written to custom properties through a ref on pointermove — no
 *    state, so nothing re-renders while the pointer moves.
 *  - No `font-family`; typography inherits from the host app.
 *  - Every class and keyframe is prefixed `cz-`.
 */

import { useCallback, useRef, useState } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react"

export interface CardsZepaCard {
  id: string
  /** Small label above the title — the category. */
  eyebrow: string
  title: string
  /** Highlighted line under the title. */
  meta: string
  tags: string[]
  footer: string
  /** Top edge colour — the only tinted element on the card. */
  accent: string
  /** Brand mark. Pass a logo as a node, or a hosted file via `logo`. */
  icon?: ReactNode
  logo?: string
}

export interface CardsZepaProps {
  cards?: CardsZepaCard[]
  /** Maximum tilt in degrees. */
  tilt?: number
  /** Horizontal fan offset as a percentage of card width. */
  spread?: number
  /** Fan rotation in degrees. */
  rotation?: number
  /** Max illustration width in px. */
  width?: number
  theme?: "dark" | "light"
  variant?: "tile" | "bare"
  className?: string
}

function IconHero() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 10h18M8 14h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="3" width="8" height="6" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="16" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="11" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const DEFAULT_CARDS: CardsZepaCard[] = [
  {
    id: "selfie-hero",
    eyebrow: "Hero Sections",
    title: "Selfie Hero",
    meta: "1,240 installs",
    tags: ["Video", "Marquee"],
    footer: "Added 4 Aug",
    accent: "#FF2E55",
    icon: <IconHero />,
  },
  {
    id: "featured9-grid",
    eyebrow: "Grid Sections",
    title: "Featured9 Grid",
    meta: "860 installs",
    tags: ["Bento", "Hover video"],
    footer: "Added 9 Aug",
    accent: "#A5F70C",
    icon: <IconGrid />,
  },
  {
    id: "zepa-folder",
    eyebrow: "Illustrations",
    title: "Zepa Folder",
    meta: "New this week",
    tags: ["3D", "Lightbox"],
    footer: "Added 10 Aug",
    accent: "#12C8DE",
    icon: <IconSpark />,
  },
]

const CSS = `
.cz-shell{container-type:inline-size;display:flex;width:100%;max-width:var(--cz-w);justify-content:center}
.cz-shell *{box-sizing:border-box}
.cz-shell[data-variant="bare"]{max-width:none}
.cz-root{width:100%;padding:var(--cz-pad);border:1px solid var(--cz-line);border-radius:20px;background:var(--cz-bg);color:var(--cz-fg);-webkit-user-select:none;user-select:none}
.cz-root[data-variant="bare"]{padding:0;border:0;border-radius:0;background:transparent}

.cz-stage{position:relative;width:100%;height:var(--cz-stage-h);perspective:1200px}

/* Slot = placement. Transitioned slowly, and it is the ONLY thing that moves
   when the order changes — position comes from transform, not from flow, so
   the reshuffle needs no FLIP. */
.cz-slot{position:absolute;left:0;right:0;top:50%;width:var(--cz-cw);margin:0 auto;z-index:var(--cz-z);transform:translate(var(--cz-x),calc(-50% + var(--cz-y))) rotate(var(--cz-r));transition:transform .55s cubic-bezier(.16,1,.3,1)}

/* Card = tilt. A separate element so the pointer interaction never overwrites
   the placement transform. */
.cz-card{display:block;width:100%;padding:0;text-align:left;border:0;border-top:4px solid var(--cz-accent);border-radius:14px;background:var(--cz-card);color:inherit;font:inherit;cursor:pointer;transform-style:preserve-3d;transform:rotateX(var(--cz-rx,0deg)) rotateY(var(--cz-ry,0deg));transition:transform .35s ease,box-shadow .35s ease;box-shadow:0 18px 40px -22px rgba(0,0,0,.9),0 0 0 1px var(--cz-line) inset}
.cz-card:hover{box-shadow:0 26px 54px -20px rgba(0,0,0,.95),0 0 0 1px var(--cz-line-hi) inset}
.cz-card:focus-visible{outline:2px solid var(--cz-accent);outline-offset:3px}
.cz-slot[data-active="true"] .cz-card{cursor:default}

/* Type scale matches the brief exactly at full width — badge 40, company
   16/600 muted, title 18/700 foreground, meta 14/400 foreground, tags 12/500
   muted, footer 12 muted, 24px padding, 16px gaps. Each clamped so it still
   scales in a narrow tile. Colour lives in the top border and the logos;
   nothing else is tinted. */
.cz-body{display:flex;flex-direction:column;gap:clamp(12px,3.4cqw,16px);padding:clamp(16px,5cqw,24px);transform:translateZ(22px)}
.cz-head{display:flex;align-items:center;gap:12px}
.cz-badge{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:clamp(32px,9cqw,40px);height:clamp(32px,9cqw,40px);border-radius:999px;background:var(--cz-badge);color:var(--cz-fg);overflow:hidden}
.cz-badge svg{width:60%;height:60%}
.cz-badge img{width:60%;height:60%;object-fit:contain}
.cz-eyebrow{font-size:clamp(13px,3.4cqw,16px);font-weight:600;color:var(--cz-muted)}
.cz-title{margin:0;font-size:clamp(15px,4.4cqw,18px);font-weight:700;letter-spacing:-.012em;line-height:1.3;color:var(--cz-fg)}
.cz-meta{margin:2px 0 0;font-size:clamp(12px,3.2cqw,14px);font-weight:400;color:var(--cz-fg)}
.cz-tags{display:flex;flex-wrap:wrap;gap:8px}
.cz-tag{padding:2px 10px;border-radius:999px;background:var(--cz-badge);font-size:clamp(10px,2.8cqw,12px);font-weight:500;color:var(--cz-muted)}
.cz-foot{margin:0;padding-top:2px;text-align:right;font-size:clamp(10px,2.8cqw,12px);color:var(--cz-muted)}

@media (prefers-reduced-motion:reduce){
  .cz-card{transition-duration:1ms;transform:none!important}
  .cz-slot{transition-duration:1ms}
}
`

export function CardsZepa({
  cards = DEFAULT_CARDS,
  tilt = 10,
  spread = 30,
  rotation = 8,
  width = 560,
  theme = "dark",
  variant = "tile",
  className,
}: CardsZepaProps) {
  const [order, setOrder] = useState(() => cards.map((_, index) => index))
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([])

  const centre = Math.floor(order.length / 2)

  // Tilt is a DOM write, never state — the pointer moves far too often for a
  // render to be involved.
  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const element = event.currentTarget
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5

      element.style.setProperty("--cz-ry", `${(px * tilt * 2).toFixed(2)}deg`)
      element.style.setProperty("--cz-rx", `${(-py * tilt * 2).toFixed(2)}deg`)
    },
    [tilt]
  )

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const element = event.currentTarget
      element.style.setProperty("--cz-ry", "0deg")
      element.style.setProperty("--cz-rx", "0deg")
    },
    []
  )

  const promote = useCallback(
    (position: number) => {
      setOrder((current) => {
        if (position === Math.floor(current.length / 2)) return current
        const next = [...current]
        const [picked] = next.splice(position, 1)
        next.splice(Math.floor(current.length / 2), 0, picked)
        return next
      })
    },
    []
  )

  const isDark = theme === "dark"

  const shellStyle = {
    "--cz-w": `${width}px`,
    "--cz-bg": isDark ? "#08080a" : "#f8f8f9",
    "--cz-card": isDark ? "#131317" : "#ffffff",
    "--cz-badge": isDark ? "#ffffff12" : "#00000009",
    "--cz-fg": isDark ? "#f4f4f5" : "#18181b",
    "--cz-muted": isDark ? "#8b8b94" : "#71717a",
    "--cz-line": isDark ? "#ffffff14" : "#00000010",
    "--cz-line-hi": isDark ? "#ffffff28" : "#00000020",
  } as CSSProperties

  const fluidStyle = {
    "--cz-pad": "clamp(18px, 5cqw, 30px)",
    "--cz-cw": "clamp(190px, 54cqw, 300px)",
    "--cz-stage-h": "clamp(230px, 62cqw, 330px)",
  } as CSSProperties

  return (
    <div
      className={className ? `cz-shell ${className}` : "cz-shell"}
      data-variant={variant}
      style={shellStyle}
    >
      <style>{CSS}</style>

      <div className="cz-root" data-variant={variant} style={fluidStyle}>
        <div className="cz-stage">
          {order.map((cardIndex, position) => {
            const card = cards[cardIndex]
            if (!card) return null

            const offset = position - centre
            const active = position === centre

            const slotStyle = {
              "--cz-x": `${offset * spread}%`,
              "--cz-y": active ? "-5%" : "10%",
              "--cz-r": `${offset * rotation}deg`,
              "--cz-z": `${active ? 30 : 20 - Math.abs(offset)}`,
              "--cz-accent": card.accent,
            } as CSSProperties

            return (
              <div
                key={card.id}
                className="cz-slot"
                data-active={active}
                style={slotStyle}
              >
                <button
                  type="button"
                  className="cz-card"
                  ref={(element) => {
                    cardRefs.current[cardIndex] = element
                  }}
                  aria-label={
                    active
                      ? `${card.title}, ${card.eyebrow}`
                      : `Bring ${card.title} to the front`
                  }
                  onPointerMove={handlePointerMove}
                  onPointerLeave={handlePointerLeave}
                  onClick={() => promote(position)}
                >
                  <div className="cz-body">
                    <div className="cz-head">
                      <span className="cz-badge">
                        {card.logo ? (
                          <img src={card.logo} alt="" draggable={false} />
                        ) : (
                          card.icon
                        )}
                      </span>
                      <span className="cz-eyebrow">{card.eyebrow}</span>
                    </div>

                    <div>
                      <h3 className="cz-title">{card.title}</h3>
                      <p className="cz-meta">{card.meta}</p>
                    </div>

                    <div className="cz-tags">
                      {card.tags.map((tag) => (
                        <span key={tag} className="cz-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="cz-foot">{card.footer}</p>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CardsZepa
