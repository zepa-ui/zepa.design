"use client"

/**
 * NotifyZepa — notification card.
 *
 * A slowly turning aurora behind a halftone screen, a bell sitting in the dark
 * eye at its centre, and a badge that ticks up every time the pointer crosses
 * the bell.
 *
 *   <NotifyZepa />
 *   <NotifyZepa initialCount={26} />
 *   <NotifyZepa videoMp4="https://res.cloudinary.com/…/waves.mp4" />
 *
 * Implementation notes:
 *  - **The aurora is CSS, not a video.** Shipping a hosted clip would mean
 *    either hotlinking someone else's CDN (gotcha #23) or asking every
 *    consumer to supply an asset before the component renders. Four blurred
 *    radial gradients on a slow rotation, a halftone dot screen and a dark
 *    core get there with nothing to download. Pass `videoMp4` / `videoWebm`
 *    to use a real clip — host it yourself.
 *  - The count lives in state and only changes on pointer enter, so there is
 *    no timer and nothing runs while the card is idle.
 *  - The badge remounts on each change (keyed by count) so its pop animation
 *    replays without any imperative restart.
 *  - No `font-family`; typography inherits from the host app.
 *  - Every class and keyframe is prefixed `nf-`.
 */

import { useCallback, useState } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"

export interface NotifyZepaProps {
  /** Badge value before any hover. */
  initialCount?: number
  /** Bold lead-in of the caption. */
  label?: string
  /** Rest of the caption. */
  description?: string
  /** Optional background clip. Host it yourself — see the note above. */
  videoMp4?: string
  videoWebm?: string
  /** Badge colour. */
  badgeColor?: string
  width?: number
  variant?: "tile" | "bare"
  className?: string
}

function BellGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.2c-3.31 0-6 2.69-6 6v3.05c0 .48-.17.94-.49 1.3l-1.2 1.36c-.6.68-.12 1.75.79 1.75h13.8c.91 0 1.39-1.07.79-1.75l-1.2-1.36a1.96 1.96 0 0 1-.49-1.3V9.2c0-3.31-2.69-6-6-6z"
        fill="currentColor"
      />
      <path
        d="M9.6 19.1a2.6 2.6 0 0 0 4.8 0z"
        fill="currentColor"
      />
    </svg>
  )
}

const CSS = `
.nf-shell{container-type:inline-size;display:flex;width:100%;max-width:var(--nf-w);justify-content:center}
.nf-shell *{box-sizing:border-box}
.nf-shell[data-variant="bare"]{max-width:none}
.nf-root{position:relative;width:100%;aspect-ratio:428 / 420;overflow:hidden;border-radius:14px;background:#0c0c0d;color:#fff;-webkit-user-select:none;user-select:none;box-shadow:0 0 0 6px rgba(255,255,255,.4)}
.nf-root[data-variant="bare"]{border-radius:0;box-shadow:none}

.nf-media{position:absolute;inset:0;overflow:hidden}
.nf-video{position:absolute;left:50%;top:50%;min-width:100%;min-height:100%;transform:translate(-50%,-50%);object-fit:cover}

/* Four blurred blobs on a slow turn. Rotating the whole layer rather than each
   blob keeps this to a single composited transform. */
.nf-aurora{position:absolute;inset:-25%;filter:blur(42px);animation:nf-turn 22s linear infinite;background:
  radial-gradient(circle at 34% 30%,#4f7dff 0%,transparent 42%),
  radial-gradient(circle at 68% 26%,#8b5cf6 0%,transparent 44%),
  radial-gradient(circle at 74% 64%,#f0a05a 0%,transparent 42%),
  radial-gradient(circle at 30% 70%,#a78bfa 0%,transparent 44%)}

/* Halftone screen — the dotted texture over the glow. Masked to a ring so the
   dots fade out at the core and at the card edge. */
.nf-dots{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.55) .85px,transparent .85px);background-size:4px 4px;opacity:.4;mix-blend-mode:overlay;
  -webkit-mask-image:radial-gradient(circle at 50% 50%,transparent 20%,#000 38%,#000 66%,transparent 86%);
  mask-image:radial-gradient(circle at 50% 50%,transparent 20%,#000 38%,#000 66%,transparent 86%)}

/* Dark eye at the centre plus an edge vignette, both blending into the card. */
.nf-core{position:absolute;inset:0;background:
  radial-gradient(circle at 50% 50%,#000 0%,#000 15%,transparent 34%),
  radial-gradient(circle at 50% 50%,transparent 52%,#0c0c0d 88%)}

.nf-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.nf-bell{position:relative;display:flex;align-items:center;justify-content:center;width:clamp(66px,22cqw,92px);height:clamp(66px,22cqw,92px);padding:0;border:0;border-radius:999px;background:radial-gradient(circle at 50% 45%,#141416 0%,#050506 78%);color:#fff;cursor:pointer;box-shadow:0 0 0 1px rgba(255,255,255,.14),0 0 34px -6px rgba(120,140,255,.55);transition:transform .3s cubic-bezier(.22,1,.28,1),box-shadow .3s ease}
.nf-bell:hover{transform:scale(1.06);box-shadow:0 0 0 1px rgba(255,255,255,.24),0 0 44px -4px rgba(150,160,255,.75)}
.nf-bell:active{transform:scale(.98)}
.nf-bell:focus-visible{outline:2px solid #fff;outline-offset:4px}
.nf-bell svg{width:46%;height:46%;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5))}

.nf-badge{position:absolute;top:8%;left:56%;display:flex;align-items:center;justify-content:center;min-width:clamp(24px,7.4cqw,31px);height:clamp(24px,7.4cqw,31px);padding:0 7px;border-radius:999px;background:var(--nf-badge);color:#fff;font-size:clamp(11px,3.4cqw,13.5px);font-weight:600;letter-spacing:-.01em;font-variant-numeric:tabular-nums;box-shadow:0 2px 10px -2px rgba(0,0,0,.6);animation:nf-pop .34s cubic-bezier(.22,1,.28,1)}

.nf-caption{position:absolute;left:0;right:0;bottom:0;z-index:10;padding:0 clamp(18px,5.5cqw,24px) clamp(18px,5.5cqw,24px);font-size:clamp(14px,4.2cqw,16px);font-weight:300;line-height:1.375;letter-spacing:-.02em;color:hsla(0,0%,100%,.65)}
.nf-caption b{font-weight:500;color:#fff}

@keyframes nf-turn{to{transform:rotate(360deg)}}
@keyframes nf-pop{
  0%{transform:scale(.55)}
  60%{transform:scale(1.14)}
  100%{transform:scale(1)}
}
@media (prefers-reduced-motion:reduce){
  .nf-aurora{animation:none}
  .nf-badge{animation:none}
  .nf-bell{transition:none}
}
`

export function NotifyZepa({
  initialCount = 26,
  label = "Notifications.",
  description = "Every install, review and release lands here the moment it happens.",
  videoMp4,
  videoWebm,
  badgeColor = "#f9836b",
  width = 428,
  variant = "tile",
  className,
}: NotifyZepaProps) {
  const [count, setCount] = useState(initialCount)

  const bump = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse") return
    setCount((value) => value + 1)
  }, [])

  const hasVideo = Boolean(videoMp4 || videoWebm)

  const shellStyle = {
    "--nf-w": `${width}px`,
    "--nf-badge": badgeColor,
  } as CSSProperties

  return (
    <div
      className={className ? `nf-shell ${className}` : "nf-shell"}
      data-variant={variant}
      style={shellStyle}
    >
      <style>{CSS}</style>

      <div className="nf-root" data-variant={variant}>
        <div className="nf-media" aria-hidden="true">
          {hasVideo ? (
            <video
              className="nf-video"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              {videoWebm ? <source src={videoWebm} type="video/webm" /> : null}
              {videoMp4 ? <source src={videoMp4} type="video/mp4" /> : null}
            </video>
          ) : (
            <div className="nf-aurora" />
          )}
          <div className="nf-dots" />
          <div className="nf-core" />
        </div>

        <div className="nf-center">
          <button
            type="button"
            className="nf-bell"
            aria-label={`Notifications, ${count} unread`}
            onPointerEnter={bump}
            onClick={() => setCount((value) => value + 1)}
          >
            <BellGlyph />
            {/* Keyed by count so the pop replays on every change without an
                imperative animation restart. */}
            <span key={count} className="nf-badge">
              {count}
            </span>
          </button>
        </div>

        <p className="nf-caption">
          <b>{label}</b> {description}
        </p>
      </div>
    </div>
  )
}

export default NotifyZepa
