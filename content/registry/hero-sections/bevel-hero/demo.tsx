"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"

const IMGS = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785160873/v_lxrjzq.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785163638/d45_qht5mk.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785163638/d33_jmlxbo.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785163637/d_e3jvzy.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785163637/d22_tidwoj.jpg",
]

const CARDS = [
  { user: "sameer.builds", time: "2h",  tag: null,                    likes: 847,  comments: 23, img: IMGS[0] },
  { user: "zepa.design",   time: "5h",  tag: "Built with @zepa.ui ✨", likes: 1204, comments: 41, img: IMGS[1] },
  { user: "dev.nickui",    time: "1d",  tag: null,                    likes: 392,  comments: 17, img: IMGS[2] },
  { user: "build.flow",    time: "3h",  tag: "Loving @zepa.ui 💙",    likes: 2180, comments: 88, img: IMGS[3] },
  { user: "launchcrew",    time: "8h",  tag: null,                    likes: 673,  comments: 31, img: IMGS[4] },
  { user: "uidev.co",      time: "4h",  tag: null,                    likes: 419,  comments: 12, img: IMGS[1] },
  { user: "designops_",    time: "6h",  tag: "Ship fast 🚀",           likes: 1567, comments: 54, img: IMGS[2] },
]
const AVATAR_COLORS = ["#6366f1","#ec4899","#14b8a6","#f59e0b","#3b82f6","#8b5cf6","#10b981"]
const LOOP = [...CARDS, ...CARDS]

export default function BevelHero() {
  return (
    <div className="bvl-root">
      <style>{CSS}</style>

      {/* ── Navbar ── */}
      <nav className="bvl-nav">
        <div className="bvl-nav-left">
          <Link href="/components" className="bvl-nav-link">Components</Link>
          <Link href="/docs"       className="bvl-nav-link">Docs</Link>
        </div>

        <Link href="/" className="bvl-logo">
          <Image
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"
            alt="Zepa"
            width={110}
            height={36}
            style={{ height: 36, width: "auto", filter: "brightness(0)" }}
            priority
          />
        </Link>

        <div className="bvl-nav-right">
          <Link href="/login"      className="bvl-nav-link">Login</Link>
          <Link href="/components" className="bvl-nav-cta">⚡ Get Started</Link>
        </div>
      </nav>

      {/* ── Hero text block ── */}
      <div className="bvl-body">

        {/* eyebrow */}
        <motion.div
          className="bvl-eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="bvl-eyebrow-dot" />
          Trusted by 10,000+ developers worldwide
        </motion.div>

        {/* headline — serif, editorial */}
        <motion.h1
          className="bvl-headline"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          Ship beautiful{" "}
          <em className="bvl-headline-em">UI</em>
          <br />
          loved by developers
        </motion.h1>

        {/* sub-copy */}
        <motion.p
          className="bvl-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          Copy-paste components that look stunning out of the box.
        </motion.p>

      </div>

      {/* ── Scrolling reel strip ── */}
      <motion.div
        className="bvl-marquee"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bvl-strip">
          {LOOP.map((card, i) => (
            <div key={i} className="bvl-card">
              <img src={card.img} alt="" className="bvl-card-img" />

              {/* top user bar */}
              <div className="bvl-card-top">
                <div
                  className="bvl-avatar"
                  style={{ background: AVATAR_COLORS[i % CARDS.length % AVATAR_COLORS.length] }}
                >
                  {card.user[0].toUpperCase()}
                </div>
                <div>
                  <div className="bvl-card-name">{card.user}</div>
                  <div className="bvl-card-time">{card.time} ago</div>
                </div>
              </div>

              {card.tag && <div className="bvl-card-tag">{card.tag}</div>}

              <div className="bvl-card-btm">
                <span>❤️ {card.likes.toLocaleString()}</span>
                <span>💬 {card.comments}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bvl-fade-l" />
        <div className="bvl-fade-r" />
      </motion.div>

      {/* bottom spacer */}
      <div className="bvl-floor" />
    </div>
  )
}

const CSS = `
/* ── Root ── */
.bvl-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #fff;
  color: #111;
  font-family: var(--font-manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
}

/* ── Navbar ── */
.bvl-nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 2.5rem;
  height: 66px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.bvl-nav-left  { display: flex; align-items: center; gap: 1.75rem; }
.bvl-nav-right { display: flex; align-items: center; gap: 1.1rem; justify-content: flex-end; }
.bvl-nav-link  {
  color: #666; text-decoration: none; font-size: 14px;
  font-weight: 450; transition: color 0.15s;
}
.bvl-nav-link:hover { color: #111; }
.bvl-logo { display: flex; align-items: center; }
.bvl-nav-cta {
  display: inline-flex; align-items: center; gap: 5px;
  background: #111; color: #fff;
  font-size: 13.5px; font-weight: 500;
  padding: 9px 20px; border-radius: 100px;
  text-decoration: none;
  transition: background 0.15s, transform 0.12s;
}
.bvl-nav-cta:hover { background: #1f1f1f; transform: translateY(-1px); }

/* ── Hero body ── */
.bvl-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: clamp(28px, 4vh, 56px) 2rem clamp(52px, 7.5vh, 96px);
  gap: clamp(14px, 1.8vh, 22px);
  flex-shrink: 0;
}

/* eyebrow */
.bvl-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #888;
  font-weight: 500;
  letter-spacing: 0.01em;
}
.bvl-eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #111;
  flex-shrink: 0;
}

/* headline — editorial serif */
.bvl-headline {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(38px, 5.8vw, 80px);
  font-weight: normal;
  line-height: 1.04;
  color: #0a0a0a;
  letter-spacing: -0.025em;
  max-width: 22ch;
}

/* italic accent word */
.bvl-headline-em {
  font-style: italic;
  font-family: Georgia, "Times New Roman", serif;
}

/* sub-copy */
.bvl-sub {
  margin: 0;
  font-size: clamp(14px, 1.3vw, 17px);
  color: #888;
  font-weight: 400;
  line-height: 1.5;
  max-width: 46ch;
}

/* ── Marquee ── */
.bvl-marquee {
  position: relative;
  overflow: hidden;
  flex: 1;
  min-height: 240px;
  max-height: 440px;
}

/* ── Strip ── */
.bvl-strip {
  display: flex;
  align-items: stretch;
  gap: 16px;
  height: 100%;
  width: max-content;
  padding: 0 16px;
  animation: bvlScroll 36s linear infinite;
}
.bvl-strip:hover { animation-play-state: paused; }
@keyframes bvlScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ── Card ── */
.bvl-card {
  position: relative;
  flex-shrink: 0;
  width: 238px;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: #161616;
  box-shadow:
    0 2px 8px rgba(0,0,0,0.06),
    0 8px 32px rgba(0,0,0,0.08),
    0 0 0 1px rgba(0,0,0,0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.bvl-card:hover {
  transform: translateY(-4px) scale(1.015);
  box-shadow:
    0 4px 16px rgba(0,0,0,0.1),
    0 16px 48px rgba(0,0,0,0.14),
    0 0 0 1px rgba(0,0,0,0.05);
}
.bvl-card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* top user bar */
.bvl-card-top {
  position: absolute;
  top: 0; left: 0; right: 0;
  padding: 12px 10px 40px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
}
.bvl-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
  border: 1.5px solid rgba(255,255,255,0.75);
  flex-shrink: 0;
}
.bvl-card-name { font-size: 11px; font-weight: 600; color: #fff; line-height: 1.25; }
.bvl-card-time { font-size: 9.5px; color: rgba(255,255,255,0.6); }

/* caption tag */
.bvl-card-tag {
  position: absolute;
  bottom: 44px; left: 10px; right: 10px;
  z-index: 2;
  font-size: 10.5px; font-weight: 500; color: #fff;
  background: rgba(0,0,0,0.52);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 5px 8px;
  line-height: 1.4;
}

/* bottom stats */
.bvl-card-btm {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 18px 10px 9px;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
  display: flex;
  gap: 10px;
  z-index: 2;
  font-size: 11px; font-weight: 600; color: #fff;
}

/* edge fades */
.bvl-fade-l, .bvl-fade-r {
  position: absolute;
  top: 0; bottom: 0;
  width: clamp(80px, 15vw, 240px);
  z-index: 4;
  pointer-events: none;
}
.bvl-fade-l { left:  0; background: linear-gradient(to right, #fff 20%, rgba(255,255,255,0)); }
.bvl-fade-r { right: 0; background: linear-gradient(to left,  #fff 20%, rgba(255,255,255,0)); }

/* floor */
.bvl-floor {
  height: clamp(14px, 2.2vh, 28px);
  flex-shrink: 0;
}

/* responsive */
@media (max-width: 640px) {
  .bvl-nav-left { display: none; }
  .bvl-headline { font-size: clamp(34px, 10vw, 52px); }
  .bvl-card { width: 185px; border-radius: 14px; }
}
`
