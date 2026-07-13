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
  transition: { duration: 1.6, ease: "easeOut", delay } as Transition,
});

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay } as Transition,
});

const TICKER_ITEMS = [
  "JFK → LHR",
  "Altitude FL 450",
  "Mach 0.85",
  "Heading 247°",
  "Airbus A380",
  "Horizon Suite™",
  "7h 20m",
  "5,570 km",
];

function TickerRow() {
  return (
    <div className="flex shrink-0 items-center">
      {TICKER_ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-8 text-[10px] font-mono uppercase tracking-[0.35em] text-white/30 whitespace-nowrap">
            {item}
          </span>
          <span className="h-1 w-1 rounded-full bg-red-500/60" />
        </span>
      ))}
    </div>
  );
}

export default function PlaneUnicorn() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black [&_canvas+div]:hidden [&_[data-us-project]>div:last-child]:hidden">
      <style>{`
        @keyframes plane-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <UnicornScene
        jsonFilePath="/unicorn/plane-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.6/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* Vignette — lighter than before, lets the scene breathe */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 pt-7 pointer-events-none select-none md:px-12">
        <motion.div {...fade(0.2)}>
          <img
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
            alt="Zepa"
            className="h-10 w-auto object-contain"
          />
        </motion.div>
        <motion.p
          className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/30"
          {...fade(0.3)}
        >
          Private Aviation — Est. 2024
        </motion.p>
      </div>

      {/* Upper third — the title owns the empty sky; the plane crosses its
          baseline instead of covering the letters. */}
      <div className="absolute inset-x-0 top-[12vh] flex justify-center pointer-events-none select-none">
        <motion.div className="w-full text-center pl-[6vw]" {...rise(0.4)}>
          <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.55em] text-white/35">
            Next-gen airline experience
          </p>
          <h1
            className="uppercase leading-[0.85] text-[clamp(4rem,14vw,15rem)] font-black"
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            <span className="text-white">SKY</span>
            <span
              style={{
                color: "transparent",
                WebkitTextStroke: "2px rgba(255,255,255,0.85)",
              }}
            >
              WINKS
            </span>
          </h1>
          <motion.p
            className="mx-auto mt-6 max-w-[420px] text-[13px] font-light leading-relaxed text-white/40"
            {...fade(0.9)}
          >
            A new era of private aviation — engineered for those who live
            above the clouds. Full-flat suites, curated dining, and silence
            at 45,000 feet.
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom-left — philosophy */}
      <motion.div
        className="absolute left-8 bottom-20 pointer-events-none select-none md:left-12 md:bottom-24"
        {...rise(0.9)}
      >
        <p className="text-[13px] leading-snug text-white/70 font-light max-w-[240px]">
          The sky is not the limit.
          <br />
          <span className="text-white/35 italic">
            It&apos;s just the beginning.
          </span>
        </p>
      </motion.div>

      {/* Bottom-right — interaction hint */}
      <motion.div
        className="absolute right-8 bottom-20 pointer-events-none select-none text-right md:right-12 md:bottom-24"
        {...rise(1.0)}
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
          ( move cursor )
        </p>
        <p className="mt-1.5 text-[10px] font-mono uppercase tracking-[0.3em] text-white/50">
          The aircraft responds
        </p>
      </motion.div>

      {/* Bottom — telemetry marquee (replaces the old side panels) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4 pointer-events-none select-none overflow-hidden"
        {...fade(1.2)}
      >
        <div
          className="flex w-max"
          style={{ animation: "plane-ticker 28s linear infinite" }}
        >
          <TickerRow />
          <TickerRow />
        </div>
      </motion.div>
    </div>
  );
}
