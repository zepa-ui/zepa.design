/*
 This zepa scene is a custom scene created in the unicorn studio with the permission if you want to use it you can
 remix it from here: https://unicorn.studio/remix/hCwd67hrROK0POoWcIV4
 */

"use client";

import { motion } from "framer-motion";
import UnicornScene from "unicornstudio-react/next";

const EASE = [0.16, 1, 0.3, 1] as const;

const letterContainer = {
  animate: {
    transition: { staggerChildren: 0.055, delayChildren: 0.5 },
  },
};

const letter = {
  initial: { y: "110%", rotate: 4, opacity: 0 },
  animate: {
    y: "0%",
    rotate: 0,
    opacity: 1,
    transition: { duration: 1.1, ease: EASE },
  },
};

function Crosshair({ className }: { className: string }) {
  return (
    <span
      className={`absolute text-white/25 text-[14px] font-light leading-none pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      +
    </span>
  );
}

export default function RevealUnicorn() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black [&_canvas+div]:hidden [&_[data-us-project]>div:last-child]:hidden">
      <UnicornScene
        jsonFilePath="/unicorn/reveal-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.6/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* Soft edge falloff only — keep the etching visible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 18%, transparent 78%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* ═══ Top rule line with items sitting on it ═══ */}
      <motion.div
        className="absolute top-[4.5rem] left-8 right-8 border-t border-white/15 pointer-events-none select-none z-10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
        style={{ transformOrigin: "left" }}
      />
      <div className="absolute top-[4.5rem] left-8 right-8 flex items-start justify-between pt-3 pointer-events-none select-none z-10">
        <motion.p
          className="text-white/50 text-[11px] font-light"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.6 }}
        >
          Zepa — Unicorn Series
        </motion.p>
        <motion.p
          className="text-white/30 text-[11px] font-light hidden sm:block"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.7 }}
        >
          No. 07 — Hover Reveal
        </motion.p>
        <motion.p
          className="text-white/50 text-[11px] font-light"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.8 }}
        >
          Thermopylae, 480 BC
        </motion.p>
      </div>

      {/* Logo — above the rule */}
      <motion.div
        className="absolute top-6 left-8 pointer-events-none select-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.1 }}
      >
        <img
          src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
          alt="Zepa"
          className="h-9 w-auto object-contain"
        />
      </motion.div>

      {/* ═══ Editorial paragraph — bottom right, normal case, justified ═══ */}
      <motion.div
        className="absolute bottom-[6rem] right-8 w-[250px] pointer-events-none select-none z-10 hidden md:block"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: EASE, delay: 1.0 }}
      >
        <p className="text-white/55 text-[12px] leading-[1.75] font-light text-justify">
          Move your cursor across his face and bronze answers — a helmet
          forged four hundred and eighty years before the common era,
          summoned by nothing more than attention. Some armor waits to be
          noticed.
        </p>
        <p className="mt-4 text-white/30 text-[11px] font-light italic">
          ( hover his head — the helmet answers )
        </p>
      </motion.div>

      {/* ═══ Ghost numeral — CCC = 300, clipped right edge ═══ */}
      <motion.p
        className="absolute -right-[1.5vw] top-[52%] -translate-y-1/2 pointer-events-none select-none leading-none font-black z-0 hidden lg:block"
        style={{
          fontSize: "clamp(8rem, 22vw, 24rem)",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,0.14)",
          fontFamily: "var(--font-manrope), sans-serif",
          writingMode: "vertical-rl",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.4 }}
        aria-hidden="true"
      >
        CCC
      </motion.p>

      {/* ═══ Headline — centered above the head ═══ */}
      <div className="absolute inset-x-0 top-[11%] pointer-events-none select-none z-10 text-center px-4">
        <motion.p
          className="mb-3 text-white/45 text-[13px] font-light italic"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
        >
          The last of the three hundred —
        </motion.p>
        <motion.h1
          className="flex justify-center overflow-hidden leading-[0.92] font-black uppercase"
          style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: "clamp(3.5rem, 11.5vw, 12rem)",
            letterSpacing: "-0.03em",
            mixBlendMode: "exclusion",
            color: "#fff",
          }}
          variants={letterContainer}
          initial="initial"
          animate="animate"
        >
          {"SPARTAN".split("").map((ch, i) => (
            <motion.span key={i} className="inline-block" variants={letter}>
              {ch}
            </motion.span>
          ))}
        </motion.h1>
      </div>

      {/* ═══ Bottom rule with items ═══ */}
      <motion.div
        className="absolute bottom-[3.5rem] left-8 right-8 border-t border-white/15 pointer-events-none select-none z-10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, ease: EASE, delay: 1.1 }}
        style={{ transformOrigin: "right" }}
      />
      <div className="absolute bottom-0 left-8 right-8 flex items-center justify-between h-[3.5rem] pointer-events-none select-none z-10">
        <motion.p
          className="text-white/40 text-[11px] font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          Molon labe — come and take them
        </motion.p>
        <motion.p
          className="text-white/25 text-[11px] font-light hidden sm:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
        >
          Bronze &amp; blood, Lacedaemon
        </motion.p>
        <motion.p
          className="text-white/40 text-[11px] font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.7 }}
        >
          37.08° N, 22.42° E
        </motion.p>
      </div>

      {/* Crosshair grid marks */}
      <Crosshair className="top-[4rem] left-1/2 -translate-x-1/2" />
      <Crosshair className="bottom-[3.1rem] left-1/2 -translate-x-1/2" />
      <Crosshair className="top-[52%] left-8" />
    </div>
  );
}
