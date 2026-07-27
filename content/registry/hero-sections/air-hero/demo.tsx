"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react"

const SKY_VIDEO =
  "https://res.cloudinary.com/dakrfj1oh/video/upload/v1785156022/sky_yxiqww.mp4"
const SAAS_VIDEO =
  "https://res.cloudinary.com/dakrfj1oh/video/upload/v1785156782/Best_SaaS_Product_Launch_Ad_Video___LangEase_eekhd9.mp4"

const TABS = [
  { label: "Organize", icon: "⊞", video: SAAS_VIDEO },
  { label: "Approve",  icon: "✓", video: SAAS_VIDEO },
  { label: "Multiply", icon: "✦", video: SAAS_VIDEO },
]

const springConfig = { damping: 30, stiffness: 100, mass: 2 }

export default function AirHero() {
  const [active, setActive] = useState(0)

  /* ── Tilt state ── */
  const cardRef = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(useMotionValue(0), springConfig)
  const rotateY = useSpring(useMotionValue(0), springConfig)
  const scale   = useSpring(1, springConfig)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2
    rotateX.set((offsetY / (rect.height / 2)) * -8)
    rotateY.set((offsetX / (rect.width  / 2)) *  8)
  }

  function handleMouseEnter() { scale.set(1.03) }
  function handleMouseLeave() {
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <div className="air-root">
      <style>{CSS}</style>

      {/* ── Sky background ── */}
      <video className="air-bg" src={SKY_VIDEO} autoPlay muted loop playsInline />
      <div className="air-overlay" />

      {/* ── Navbar ── */}
      <nav className="air-nav">
        <div className="air-nav-links">
          <Link href="/components">Features</Link>
          <Link href="/templates">Solutions</Link>
          <Link href="/components">Pricing</Link>
          <Link href="/docs">Resources</Link>
          <Link href="/">About</Link>
        </div>

        <Link href="/" className="air-nav-logo">
          <Image
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
            alt="Zepa"
            width={90}
            height={28}
            style={{ height: 44, width: "auto", objectFit: "contain" }}
            priority
          />
        </Link>

        <div className="air-nav-actions">
          <Link href="/login" className="air-login">Login</Link>
          <Link href="/components" className="air-btn-outline">Start for free</Link>
          <Link href="/components" className="air-btn-solid">Book a demo</Link>
        </div>
      </nav>

      {/* ── Hero content ── */}
      <div className="air-content">

        {/* Headline entrance */}
        <motion.h1
          className="air-headline"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Ship faster. <em>Look stunning.</em>
        </motion.h1>

        {/* CTA entrance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/components" className="air-cta">Get some Zepa</Link>
        </motion.div>

        {/* Card entrance + tilt */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "min(66vw, 920px)", flexShrink: 0, marginBottom: "clamp(12px, 1.8vh, 20px)" }}
        >
          <div
            ref={cardRef}
            className="air-tilt-wrapper"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              className="air-card"
              style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
            >
              <div className="air-card-inner">
                {/* Tab video swap animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    className="air-video-wrap"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <video src={TABS[active].video} autoPlay muted loop playsInline />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Tab pills entrance */}
        <motion.div
          className="air-tabs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65, ease: "easeOut" }}
        >
          {TABS.map((tab, i) => (
            <button
              key={i}
              className={`air-tab${i === active ? " air-tab--active" : ""}`}
              onClick={() => setActive(i)}
            >
              <span className="air-tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

      </div>
    </div>
  )
}

const CSS = `
/* ── Root ── */
.air-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: var(--font-manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
}

/* ── Sky background ── */
.air-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.air-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(30,100,200,0.28) 0%, rgba(80,160,230,0.18) 60%, rgba(120,190,240,0.1) 100%);
  z-index: 1;
}

/* ── Navbar ── */
.air-nav {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2.5rem;
  height: 62px;
  background: transparent;
  border-bottom: none;
}
.air-nav-links {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}
.air-nav-links a {
  color: #fff;
  text-decoration: none;
  font-size: 13.5px;
  opacity: 0.82;
  transition: opacity 0.15s;
}
.air-nav-links a:hover { opacity: 1; }
.air-nav-logo { display: block; }
.air-nav-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.air-login {
  color: #fff;
  text-decoration: none;
  font-size: 13.5px;
  opacity: 0.82;
  padding: 0 0.4rem;
  transition: opacity 0.15s;
}
.air-login:hover { opacity: 1; }
.air-btn-outline {
  font-size: 13.5px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1.5px solid rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.12);
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.15s;
}
.air-btn-outline:hover { background: rgba(255,255,255,0.22); }
.air-btn-solid {
  font-size: 13.5px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: rgba(255,255,255,0.92);
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.air-btn-solid:hover { background: rgba(255,255,255,0.78); }

/* ── Content stack ── */
.air-content {
  position: absolute;
  top: 62px;
  left: 0; right: 0; bottom: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: clamp(20px, 3.5vh, 40px);
  overflow: hidden;
}

/* ── Headline ── */
.air-headline {
  margin: 0 0 1.1rem;
  font-size: clamp(34px, 5.2vw, 80px);
  font-weight: 700;
  color: #fff;
  text-align: center;
  line-height: 1.07;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 32px rgba(0,50,120,0.22);
}
.air-headline em {
  font-family: Georgia, "Times New Roman", serif;
  font-style: italic;
  font-weight: 400;
}

/* ── CTA ── */
.air-cta {
  display: inline-block;
  padding: 12px 30px;
  border-radius: 100px;
  background: rgba(255,255,255,0.9);
  color: #1a1a1a;
  font-size: 14.5px;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: clamp(16px, 2.5vh, 28px);
  border: 1.5px solid rgba(255,255,255,0.55);
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  transition: background 0.2s, transform 0.15s;
}
.air-cta:hover { background: #fff; transform: translateY(-1px); }

/* ── Tilt wrapper ── */
.air-tilt-wrapper {
  perspective: 900px;
  width: 100%;
}

/* ── Video card ── */
.air-card {
  width: 100%;
  border-radius: 18px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.55);
  box-shadow:
    0 48px 96px rgba(0,40,100,0.2),
    0 8px 32px rgba(0,0,0,0.1);
  padding: 10px;
  will-change: transform;
}
.air-card-inner {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 10px;
  overflow: hidden;
  background: #000;
  position: relative;
}
.air-video-wrap {
  position: absolute;
  inset: 0;
}
.air-video-wrap video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── Tab pills ── */
.air-tabs {
  display: flex;
  gap: 2px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.45);
  border-radius: 100px;
  padding: 4px;
  flex-shrink: 0;
}
.air-tab {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 22px;
  border-radius: 100px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.8);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.22s, color 0.22s, transform 0.15s;
  font-family: var(--font-manrope, sans-serif);
  white-space: nowrap;
}
.air-tab:hover { background: rgba(255,255,255,0.14); color: #fff; }
.air-tab:active { transform: scale(0.96); }
.air-tab--active { background: rgba(255,255,255,0.94); color: #1a1a1a; }
.air-tab-icon { font-size: 14px; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .air-nav-links { display: none; }
  .air-btn-outline { display: none; }
  .air-headline { font-size: clamp(26px, 7.5vw, 44px); }
  .air-tab { padding: 8px 14px; font-size: 12px; }
}
`
