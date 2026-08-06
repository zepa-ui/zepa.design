"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Info, ArrowUpRight } from "lucide-react"

/* ─────────────────────────────────────────────
   featured4-grid — two analytics cards on black
   ─ left: glass overview panel with a currency
     figure that counts up and three gradient bars
   ─ right: floating stat card, portrait cutout
     and a glass action row
   Both cards animate in from opposite sides once
   the section scrolls into view.
   ───────────────────────────────────────────── */

/* self-contained font stacks — no dependency on app-level utilities */
const HEADING = 'var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif)'
const SERIF = 'Georgia, "Times New Roman", serif'

const IMG = {
  blockOne: "https://qclay.design/lovable/synergy/block-1.png",
  blockTwo: "https://qclay.design/lovable/synergy/block-2.png",
  person: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/vivek_i01gjp.png",
  mark: "https://qclay.design/lovable/synergy/Logo-lov.svg",
}

const ROWS = [
  {
    label: "Heroes",
    value: "15,500",
    width: "75%",
    fill: "linear-gradient(90deg, #1DC47D 60.8%, rgba(29,196,125,0) 100%)",
  },
  {
    label: "Components",
    value: "4,250",
    width: "45%",
    fill: "linear-gradient(90deg, #B48F17 55.74%, rgba(180,143,23,0) 100%)",
  },
  {
    label: "Sections",
    value: "8,200",
    width: "60%",
    fill: "linear-gradient(90deg, #FFF 52.46%, rgba(255,255,255,0) 100%)",
  },
]

/* rAF count-up with a cubic ease-out; state is written from the frame
   callback rather than the effect body */
function useCountUp(target: number, start: number, run: boolean, duration = 1200) {
  const [value, setValue] = useState(start)

  useEffect(() => {
    if (!run) return
    let raf = 0
    let startTime: number | null = null

    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(start + (target - start) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, target, start, duration])

  return value
}

/* counts, not currency — integer grouping keeps the figure readable
   while the counter runs */
function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US")
}

export default function Featured4Grid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const total = useCountUp(14250, 100, isInView)
  const sent = useCountUp(925, 10, isInView)

  return (
    <section className="f4g-root">
      <style>{CSS}</style>

      <div ref={ref} className="f4g-head">
        <div
          style={{
            fontFamily: HEADING,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 2,
            color: "rgba(255,255,255,0.50)",
            marginBottom: 16,
          }}
        >
          COMPONENTS
        </div>

        <motion.h2
          initial={{ opacity: 0, filter: "blur(12px)", y: 30 }}
          animate={isInView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="f4g-title"
          style={{ margin: 0, color: "#fff" }}
        >
          <span
            style={{
              display: "block",
              fontFamily: HEADING,
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: "-1.02px",
            }}
          >
            Faster ship cycles
          </span>
          <span
            style={{
              display: "block",
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: "-1.02px",
            }}
          >
            sections at a glance
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, filter: "blur(8px)", y: 20 }}
          animate={isInView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          style={{
            fontFamily: HEADING,
            fontSize: 16,
            fontWeight: 400,
            color: "rgba(255,255,255,0.60)",
            marginTop: 16,
          }}
        >
          Keep your heroes and layouts in sync with copy-paste code
        </motion.p>
      </div>

      <div className="f4g-row">
        {/* ── CARD 1 — monthly overview ── */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="f4g-card f4g-card--wide"
        >
          <img src={IMG.blockOne} alt="" className="f4g-bg" />
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(0,0,0,0.35)" }} />

          <div
            style={{
              position: "absolute",
              top: 32,
              left: 32,
              right: 32,
              zIndex: 2,
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.20)",
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(56px)",
              WebkitBackdropFilter: "blur(56px)",
              padding: "24px 28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: HEADING, fontSize: 11, fontWeight: 500,
                  letterSpacing: 1.5, color: "rgba(255,255,255,0.60)",
                }}
              >
                REGISTRY OVERVIEW
              </span>
              <span
                style={{
                  fontFamily: HEADING, fontSize: 11, fontWeight: 500,
                  letterSpacing: 1.5, color: "rgba(255,255,255,0.60)",
                  textDecoration: "underline",
                }}
              >
                MONTHLY
              </span>
            </div>

            <div
              style={{
                fontFamily: HEADING,
                fontSize: 42,
                fontWeight: 400,
                letterSpacing: "-1px",
                color: "#fff",
                marginBottom: 24,
                /* keeps the figure from jittering as digits change */
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmt(total)}
            </div>

            <div
              style={{
                width: "100%",
                borderTop: "1px dashed rgba(255,255,255,0.20)",
                marginBottom: 20,
              }}
            />

            {ROWS.map((row) => (
              <div key={row.label} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: HEADING, fontSize: 13, color: "rgba(255,255,255,0.70)" }}>
                    {row.label}
                  </span>
                  <span style={{ fontFamily: HEADING, fontSize: 13, color: "#fff", fontWeight: 500 }}>
                    {row.value}
                  </span>
                </div>
                <div
                  style={{
                    height: 5, borderRadius: 5, width: "100%",
                    marginTop: 6, position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0.13,
                      background: "linear-gradient(90deg, #040504 0%, rgba(4,5,4,0.50) 100%)",
                      borderRadius: 5,
                    }}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: row.width } : {}}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                    style={{
                      position: "absolute",
                      left: 0, top: 0,
                      height: "100%",
                      borderRadius: 5,
                      background: row.fill,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ position: "absolute", bottom: 22, left: 32, right: 32, zIndex: 2 }}>
            <div
              style={{
                fontFamily: SERIF, fontStyle: "italic", fontSize: 26,
                fontWeight: 400, color: "#fff", marginBottom: 8,
              }}
            >
              See the full range of your components.
            </div>
            <p
              style={{
                fontFamily: HEADING, fontSize: 13, fontWeight: 400,
                lineHeight: 1.6, color: "rgba(255,255,255,0.65)", margin: 0,
              }}
            >
              Zepa keeps your heroes, sections, and grids effortlessly aligned giving you a
              clearer view of your design system rhythm, faster shipping, and lasting polish.
            </p>
          </div>
        </motion.div>

        {/* ── CARD 2 — transactions ── */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.45 }}
          className="f4g-card"
        >
          <img src={IMG.blockTwo} alt="" className="f4g-bg" />
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(0,0,0,0.25)" }} />

          <span
            style={{
              position: "absolute", top: 24, right: 24, zIndex: 2,
              fontFamily: HEADING, fontSize: 11, fontWeight: 500,
              letterSpacing: 1.5, color: "rgba(255,255,255,0.70)",
              textDecoration: "underline",
            }}
          >
            DAILY
          </span>

          <div
            style={{
              position: "absolute",
              top: 32,
              left: 32,
              zIndex: 2,
              width: 200,
              borderRadius: 16,
              background: "#fff",
              padding: "16px 18px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.20)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{
                  fontFamily: HEADING, fontSize: 22, fontWeight: 400,
                  color: "#000", letterSpacing: "-0.5px",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmt(sent)}
              </span>
              <Info size={16} color="rgba(0,0,0,0.35)" />
            </div>
            <div
              style={{
                fontFamily: HEADING, fontSize: 12,
                color: "rgba(0,0,0,0.45)", marginBottom: 14,
              }}
            >
              Copied today
            </div>
            <button className="f4g-cta">
              View component
              <span
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <ArrowUpRight size={13} color="#fff" />
              </span>
            </button>
          </div>

          <img
            src={IMG.person}
            alt=""
            style={{
              position: "absolute",
              bottom: 140,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              width: 200,
              height: 240,
              objectFit: "cover",
              objectPosition: "top center",
              borderRadius: 16,
            }}
          />

          <div
            style={{
              position: "absolute", bottom: 160, right: 24, zIndex: 3,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: 9999,
                padding: "8px 16px 8px 10px",
              }}
            >
              <img
                src={IMG.mark}
                alt="Zepa UI"
                style={{ height: 18, filter: "brightness(0) invert(1)" }}
              />
            </div>
            <button className="f4g-round" aria-label="Open">
              <ArrowUpRight size={16} color="#fff" />
            </button>
          </div>

          <div style={{ position: "absolute", bottom: 22, left: 32, right: 32, zIndex: 2 }}>
            <div
              style={{
                fontFamily: SERIF, fontStyle: "italic", fontSize: 24,
                fontWeight: 400, color: "#fff", marginBottom: 8,
              }}
            >
              Your stack, perfect components
            </div>
            <p
              style={{
                fontFamily: HEADING, fontSize: 13, fontWeight: 400,
                lineHeight: 1.6, color: "rgba(255,255,255,0.65)", margin: 0,
              }}
            >
              Stay grounded with real-time visibility into what your team&apos;s using and shipping.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const CSS = `
.f4g-root {
  position: relative;
  background: #000;
  padding: 80px clamp(16px, 3.5vw, 48px);
  overflow: hidden;
}
.f4g-head { text-align: center; margin-bottom: 64px; }
.f4g-title { font-size: clamp(36px, 5vw, 72px); }

.f4g-row {
  display: flex;
  gap: 16px;
  align-items: stretch;
  max-width: 1200px;
  margin: 0 auto;
}
.f4g-card {
  flex: 1;
  min-width: 0;
  min-height: 480px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
}
.f4g-card--wide { flex: 1.4; }
.f4g-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.f4g-cta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #000;
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 14px;
  border-radius: 9999px;
  width: 100%;
  border: none;
  cursor: pointer;
}
.f4g-round {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

@media (max-width: 1000px) {
  .f4g-row { flex-wrap: wrap; }
  .f4g-card, .f4g-card--wide { flex: 1 1 100%; min-height: 520px; }
}
@media (prefers-reduced-motion: reduce) {
  .f4g-root * { animation-duration: .001ms !important; }
}
`
