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

export default function WalkingUnicorn() {
  return (
    <div className="relative w-full h-screen overflow-hidden [&_canvas+div]:hidden [&_[data-us-project]>div:last-child]:hidden">
      <UnicornScene
        jsonFilePath="/unicorn/walking-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-12 pt-7 pointer-events-none select-none">
        <motion.div {...fade(0.2)}>
          <img
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"
            alt="Zepa"
            className="h-14 w-auto object-contain"
          />
        </motion.div>
        <motion.div className="flex items-center gap-6" {...fade(0.3)}>
          <span className="text-white/25 text-[10px] tracking-[0.3em] uppercase font-mono">
            Tower III — Level 47
          </span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </motion.div>
      </div>

      {/* Center — main headline */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none px-4">
        <motion.div {...fade(0.6)} className="text-center">
          <p className="text-white/25 text-[11px] tracking-[0.4em] uppercase font-mono mb-8">
            Glass Floor Observatory
          </p>
          <h1 className="leading-[0.88]">
            <span
              className="block text-white text-[clamp(4.5rem,11vw,10rem)]"
              style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontWeight: 300,
                letterSpacing: "-0.02em",
              }}
            >
              Walk
            </span>
            <span
              className="block text-white text-[clamp(4.5rem,11vw,10rem)] font-black uppercase"
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              Above.
            </span>
          </h1>
          <motion.p
            className="mt-10 text-white/30 text-[13px] leading-relaxed max-w-[300px] mx-auto font-mono"
            {...fade(1.0)}
          >
            360° transparency. Zero boundaries.
            <br />
            Designed for those who live at the top.
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom-left — elevation tag */}
      <motion.div
        className="absolute left-8 bottom-12 pointer-events-none select-none"
        {...fade(1.1)}
      >
        <p className="text-white/20 text-[9px] tracking-[0.2em] uppercase font-mono mb-1">
          Elevation
        </p>
        <p className="text-white/45 text-[11px] font-mono">+182 m ASL</p>
      </motion.div>

      {/* Bottom-right — material tag */}
      <motion.div
        className="absolute right-8 bottom-12 pointer-events-none select-none text-right"
        {...fade(1.1)}
      >
        <p className="text-white/20 text-[9px] tracking-[0.2em] uppercase font-mono mb-1">
          Material
        </p>
        <p className="text-white/45 text-[11px] font-mono">
          12-ply laminated glass
        </p>
      </motion.div>

      {/* Bottom center — page indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none select-none"
        {...fade(1.2)}
      >
        <div className="w-5 h-px bg-white/15" />
        <span className="text-white/20 text-[10px] tracking-[0.28em] uppercase font-mono">
          01 / 04
        </span>
        <div className="w-5 h-px bg-white/15" />
      </motion.div>
    </div>
  );
}
