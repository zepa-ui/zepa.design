/*
 This zepa scene is a custom scene created in the unicorn studio with the permission if you want to use it you can
*/

"use client";

import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import UnicornScene from "unicornstudio-react/next";

const fade = (delay: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 2, ease: "easeOut", delay } as Transition,
});

export default function EarthUnicorn() {
  return (
    <div className="relative w-full h-screen overflow-hidden [&_canvas+div]:hidden [&_[data-us-project]>div:last-child]:hidden">
      <UnicornScene
        jsonFilePath="/unicorn/earth-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-12 pt-7 pointer-events-none select-none">
        <motion.div {...fade(0.2)}>
          <img
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
            alt="Zepa"
            className="h-11 w-auto object-contain"
          />
        </motion.div>
        <motion.div className="flex items-center gap-2" {...fade(0.3)}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/35 text-[10px] tracking-[0.3em] uppercase font-mono">
            Signal Active
          </span>
        </motion.div>
      </div>

      {/* Center — big editorial headline */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-[28rem] pointer-events-none select-none px-4">
        <motion.div {...fade(0.5)} className="text-center">
          <p className="text-white/30 text-[11px] tracking-[0.35em] uppercase font-mono mb-6">
            Global Tracking Network
          </p>
          <h1 className="leading-[0.88]">
            <span
              className="block text-white text-[clamp(4rem,10vw,9rem)]"
              style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontWeight: 300,
                letterSpacing: "-0.02em",
              }}
            >
              Track
            </span>
            <span
              className="block text-white text-[clamp(4rem,10vw,9rem)] font-black uppercase"
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              Anyone.
            </span>
          </h1>
          <motion.p
            className="mt-8 text-white/35 text-[13px] leading-relaxed max-w-[320px] mx-auto"
            {...fade(0.9)}
          >
            Anywhere on the planet. Any device. Any signal.
            <br />
            Real-time precision down to the meter.
          </motion.p>
        </motion.div>
      </div>

      {/* Left edge — coordinates */}
      <motion.div
        className="absolute left-8 bottom-12 pointer-events-none select-none"
        {...fade(1.0)}
      >
        <p className="text-white/20 text-[9px] tracking-[0.2em] uppercase font-mono mb-1">Target coords</p>
        <p className="text-white/50 text-[11px] font-mono">40°42′N 74°00′W</p>
      </motion.div>

      {/* Right edge — signal strength */}
      <motion.div
        className="absolute right-8 bottom-12 pointer-events-none select-none text-right"
        {...fade(1.0)}
      >
        <p className="text-white/20 text-[9px] tracking-[0.2em] uppercase font-mono mb-1">Signal strength</p>
        <p className="text-emerald-400/70 text-[11px] font-mono">██████░░ 78%</p>
      </motion.div>

      {/* Bottom center — page indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none select-none"
        {...fade(1.1)}
      >
        <div className="w-5 h-px bg-white/15" />
        <span className="text-white/20 text-[10px] tracking-[0.28em] uppercase font-mono">01 / 04</span>
        <div className="w-5 h-px bg-white/15" />
      </motion.div>
    </div>
  );
}
