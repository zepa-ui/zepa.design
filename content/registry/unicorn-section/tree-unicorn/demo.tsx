/*
 This zepa scene is a custom scene created in the unicorn studio with the permission if you want to use it you can
 remix it from here: https://unicorn.studio/remix/TmS68tqnbADxBAGWAvdS
 */

"use client";

import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import UnicornScene from "unicornstudio-react/next";

const fade = (delay: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 2.5, ease: "easeOut", delay } as Transition,
});

export default function TreeUnicorn() {
  return (
    <div className="relative w-full h-screen overflow-hidden [&_canvas+div]:hidden [&_[data-us-project]>div:last-child]:hidden">
      <UnicornScene
        jsonFilePath="/unicorn/tree-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 pt-7 pointer-events-none select-none">
        <motion.div {...fade(0.2)}>
          <img
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
            alt="Zepa"
            className="h-8 w-auto object-contain"
          />
        </motion.div>
        <motion.span
          className="text-white/35 text-[10px] tracking-[0.3em] uppercase"
          {...fade(0.3)}
        >
          Nature Series — 001
        </motion.span>
      </div>

      {/* Left column — vertically centered, compact */}
      <div className="absolute left-8 md:left-12 top-0 bottom-0 flex flex-col justify-center pb-20 pointer-events-none select-none max-w-[380px]">
        <motion.div className="flex items-center gap-3 mb-5" {...fade(0.4)}>
          <div className="w-6 h-px bg-white/35" />
          <span className="text-white/40 text-[10px] tracking-[0.22em] uppercase">Ancient & Alive</span>
        </motion.div>

        <motion.h1 className="leading-[0.92]" {...fade(0.55)}>
          <span
            className="block text-white text-[clamp(2.8rem,5.5vw,5rem)]"
            style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 300 }}
          >
            Where roots
          </span>
          <span
            className="block text-white text-[clamp(2.8rem,5.5vw,5rem)] font-black"
            style={{ fontFamily: "var(--font-manrope), sans-serif" }}
          >
            remember.
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 text-white/40 text-[13px] leading-relaxed max-w-[260px]"
          {...fade(0.75)}
        >
          Every branch holds a century. Every ring, a story the ground never forgot.
        </motion.p>

        <motion.div className="mt-10 flex items-center gap-2.5" {...fade(0.95)}>
          <div className="w-4 h-4 rounded-full border border-white/25 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/50" />
          </div>
          <span className="text-white/25 text-[10px] tracking-[0.2em] uppercase">Hover to reveal</span>
        </motion.div>
      </div>

      {/* Bottom-right — specimen card anchored to corner */}
      <motion.div
        className="absolute bottom-10 right-8 pointer-events-none select-none"
        {...fade(1.0)}
      >
        <div
          className="rounded-xl px-5 py-4 flex flex-col gap-3.5 w-[190px]"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderTop: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <div>
            <span className="text-white/25 text-[9px] tracking-[0.28em] uppercase block mb-1">Specimen</span>
            <span className="text-white/85 text-[13px] font-medium italic" style={{ fontFamily: "Georgia, serif" }}>Quercus robur</span>
          </div>

          <div className="w-full h-px bg-white/8" style={{ background: "rgba(255,255,255,0.08)" }} />

          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-white/25 text-[9px] tracking-[0.2em] uppercase">Age</span>
              <span className="text-white/60 text-[11px] font-medium">~300 Years</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-white/25 text-[9px] tracking-[0.2em] uppercase">Location</span>
              <span className="text-white/60 text-[11px] font-medium">48°52′N 2°21′E</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/25 text-[9px] tracking-[0.2em] uppercase">Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                <span className="text-white/60 text-[11px] font-medium">Alive</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom center — page indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none select-none"
        {...fade(1.1)}
      >
        <div className="w-5 h-px bg-white/15" />
        <span className="text-white/20 text-[10px] tracking-[0.28em] uppercase">01 / 04</span>
        <div className="w-5 h-px bg-white/15" />
      </motion.div>
    </div>
  );
}
