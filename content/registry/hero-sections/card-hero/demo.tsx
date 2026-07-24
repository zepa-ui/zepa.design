"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Heart, MessageCircle } from "lucide-react";

/* ─── Constants ─────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;
const VIDEO_SRC = "https://res.cloudinary.com/dakrfj1oh/video/upload/v1781518638/samples/sea-turtle.mp4";

const LOGOS = [
  "https://qclay.design/lovable/synergy/logo-taa.png",
  "https://qclay.design/lovable/synergy/logo-harris.png",
  "https://qclay.design/lovable/synergy/logo-siemens.png",
  "https://qclay.design/lovable/synergy/logo-summit.png",
];

const NAV_ITEMS = ["Components", "Templates", "Docs", "Changelog"];

/* ─── HeroVideo ──────────────────────────────────────────── */
function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, []);

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      autoPlay
      loop
      muted
      playsInline
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
      }}
    />
  );
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav
      style={{
        position: "absolute",  /* was fixed — changed for embed safety */
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "16px 32px",
      }}
    >
      <div className="relative flex items-center" style={{ height: 48 }}>
        {/* Logo */}
        <a href="#" className="flex items-center">
          <img
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
            alt="Zepa"
            style={{ height: 38 }}
          />
        </a>

        {/* Center pill nav */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(28,28,28,0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 9999,
            padding: "6px 8px",
            display: "flex",
            gap: 4,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href="#"
              className="ch-font-heading"
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: "rgba(255,255,255,0.80)",
                padding: "8px 16px",
                borderRadius: 9999,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center" style={{ gap: 8 }}>
          <a
            href="#"
            className="ch-font-heading"
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.80)",
              padding: "8px 16px",
              textDecoration: "none",
            }}
          >
            Login
          </a>
          <button
            className="ch-font-heading"
            style={{
              background: "#fff",
              color: "#000",
              fontSize: 14,
              fontWeight: 500,
              padding: "10px 20px",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ─── StoryCard ──────────────────────────────────────────── */
function StoryCard() {
  const [slide, setSlide] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 120, damping: 18, mass: 0.4 });
  const rotateY = useTransform(sx, [-1, 1], [-18, 18]);
  const rotateX = useTransform(sy, [-1, 1], [12, -12]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      x.set(nx);
      y.set(ny);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  useEffect(() => {
    const t = setTimeout(() => setSlide(1), 3000);
    const i = setInterval(() => {
      setSlide(0);
      setTimeout(() => setSlide(1), 3000);
    }, 6000);
    return () => {
      clearTimeout(t);
      clearInterval(i);
    };
  }, []);

  return (
    <div style={{ marginTop: 48, perspective: 1200 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        style={{
          width: 310,
          height: 455,
          borderRadius: 28,
          background: "#1a1a1a",
          overflow: "hidden",
          position: "relative",
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {/* Person image */}
        <img
          src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/vivek_i01gjp.png"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 20%",
          }}
        />

        {/* Dark sea blue tint overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            mixBlendMode: "soft-light",
            pointerEvents: "none",
            background:
              "linear-gradient(160deg, rgba(0,70,130,0.70) 0%, rgba(0,50,100,0.40) 40%, rgba(0,25,60,0.25) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 30% 15%, rgba(20,110,200,0.30), transparent 55%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 28,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
            pointerEvents: "none",
          }}
        />

        {/* Story progress bars */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            display: "flex",
            gap: 6,
            zIndex: 20,
          }}
        >
          {(["story-bar-1", "story-bar-2"] as const).map((cls) => (
            <div
              key={cls}
              className={cls}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 9999,
                background: "rgba(255,255,255,0.25)",
                overflow: "hidden",
              }}
            >
              <div
                className="story-bar-fill"
                style={{ height: "100%", background: "rgba(255,255,255,0.95)" }}
              />
            </div>
          ))}
        </div>

        {/* Bottom gradient */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55%",
            background: "linear-gradient(0deg, #020408 20.54%, rgba(5,15,30,0) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Sliding headline */}
        <motion.h3
          key={slide}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 88,
            zIndex: 10,
            color: "#fff",
            fontSize: 38,
            lineHeight: "40px",
            letterSpacing: "-0.5px",
            textShadow: "0 2px 18px rgba(0,0,0,0.35)",
            margin: 0,
          }}
        >
          {slide === 0 ? (
            <>
              <span className="ch-font-heading" style={{ fontWeight: 700 }}>Build</span>{" "}
              <span className="ch-font-serif" style={{ fontStyle: "italic", fontWeight: 400 }}>faster UIs</span>
            </>
          ) : (
            <>
              <span className="ch-font-heading" style={{ fontWeight: 700 }}>Ship</span>{" "}
              <span className="ch-font-serif" style={{ fontStyle: "italic", fontWeight: 400 }}>with Zepa</span>
            </>
          )}
        </motion.h3>

        {/* Bottom actions */}
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 10,
          }}
        >
          <div
            className="ch-font-heading"
            style={{
              background: "rgba(255,255,255,0.96)",
              color: "#0a0a0a",
              fontSize: 13,
              fontWeight: 500,
              padding: "9px 16px",
              borderRadius: 9999,
              boxShadow: "0 6px 18px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            Open Source
          </div>
          {[Heart, MessageCircle].map((Icon, i) => (
            <div
              key={i}
              style={{
                width: 38,
                height: 38,
                borderRadius: 14,
                background: "rgba(20,20,20,0.45)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={18} color="#fff" strokeWidth={1.8} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function CardHero() {
  return (
    <div className="card-hero-page">
      <style>{css}</style>

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          background: "#000",
        }}
      >
        <HeroVideo />

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        <Navbar />

        {/* Center content */}
        <div
          className="flex flex-col items-center justify-center"
          style={{ position: "absolute", inset: 0, zIndex: 10, paddingTop: 80 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            style={{
              color: "#fff",
              textAlign: "center",
              margin: 0,
              fontSize: 102,
              lineHeight: "96px",
              letterSpacing: "-1.02px",
            }}
          >
            <span className="ch-font-heading" style={{ display: "block", fontWeight: 400 }}>
              Components built
            </span>
            <span style={{ display: "block", fontWeight: 400 }}>
              <span className="ch-font-heading" style={{ fontWeight: 400 }}>for </span>
              <span className="ch-font-serif" style={{ fontStyle: "italic", fontWeight: 400 }}>
                modern React
              </span>
            </span>
          </motion.h1>

          <motion.a
            href="https://zepa.design/components"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            className="ch-font-heading flex items-center"
            style={{
              marginTop: 32,
              background: "#fff",
              color: "#000",
              fontSize: 15,
              fontWeight: 500,
              paddingLeft: 24,
              paddingRight: 8,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 9999,
              gap: 8,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Browse Components
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 9999,
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowUpRight size={14} color="#fff" strokeWidth={2.5} />
            </span>
          </motion.a>

          <StoryCard />
        </div>

        {/* Bottom-left: logo marquee */}
        <div style={{ position: "absolute", bottom: 40, left: 40, zIndex: 10 }}>
          <div
            className="ch-font-heading"
            style={{
              fontSize: 21,
              lineHeight: 1.2,
              color: "rgba(255,255,255,0.6)",
              marginBottom: 18,
            }}
          >
            Trusted by developers at
          </div>
          <div style={{ width: 430, overflow: "hidden" }}>
            <div
              className="flex animate-ch-marquee"
              style={{ gap: 54, width: "max-content" }}
            >
              {[...LOGOS, ...LOGOS].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  style={{
                    height: 30,
                    width: "auto",
                    objectFit: "contain",
                    filter: "brightness(0) invert(1) opacity(0.55)",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom-right: copy + link */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            zIndex: 10,
            maxWidth: 430,
          }}
        >
          <p
            className="ch-font-heading"
            style={{ color: "#fff", fontSize: 21, lineHeight: 1.4, marginBottom: 12 }}
          >
            Zepa UI is an open-source component library — handcrafted, accessible, and ready
            to drop into any React project.
          </p>
          <a
            href="https://zepa.design/components"
            className="ch-font-heading"
            style={{ color: "#fff", textDecoration: "underline", fontSize: 21 }}
          >
            Learn more
          </a>
        </div>
      </section>
    </div>
  );
}

/* ─── Scoped styles ──────────────────────────────────────── */
const css = `
.card-hero-page .ch-font-heading {
  font-family: var(--font-manrope), -apple-system, BlinkMacSystemFont, sans-serif;
}
.card-hero-page .ch-font-serif {
  font-family: Georgia, 'Times New Roman', serif;
}

@keyframes ch-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.card-hero-page .animate-ch-marquee {
  animation: ch-marquee 14s linear infinite;
}

/* Story bar progress — synced to 3s / 6s cycle */
@keyframes ch-sbar1 {
  0%    { width: 0%; }
  49.9% { width: 100%; }
  50%   { width: 0%; }
  100%  { width: 0%; }
}
@keyframes ch-sbar2 {
  0%, 50% { width: 0%; }
  100%    { width: 100%; }
}
.card-hero-page .story-bar-1 .story-bar-fill {
  animation: ch-sbar1 6s linear infinite;
}
.card-hero-page .story-bar-2 .story-bar-fill {
  animation: ch-sbar2 6s linear infinite;
}
`;
