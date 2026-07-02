/**
 * This Original Zepa scene created with: Unicorn Studio
 * you can Remix at: https://unicorn.studio/community
 * React implementation: zepa
 * Used with permission.
 */
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UnicornScene from "unicornstudio-react/next";

const TITLES = [
  "OnZepa",
  "BuildZepa",
  "ShipZepa",
  "LaunchZepa",
];

export default function RampUnicorn() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % TITLES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen">
      <UnicornScene
        jsonFilePath="/unicorn/ramp-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none px-4">

        {/* Rotating title */}
        <div className="relative w-full flex items-center justify-center" style={{ height: "140px" }}>
          <AnimatePresence mode="wait">
            <motion.h1
              key={TITLES[index]}
              className="text-white font-bold tracking-[-0.02em] text-center absolute w-full"
              style={{ fontSize: "clamp(3rem, 10vw, 7rem)", lineHeight: 1, fontFamily: "Inter, 'SF Pro Display', system-ui, sans-serif" }}
              initial={{ opacity: 0, filter: "blur(16px)", y: 30 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(16px)", y: -30 }}
              transition={{ duration: 0.65, ease: "easeInOut" }}
            >
              {TITLES[index]}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Subtitle */}
        <motion.div
          className="mt-3 flex flex-col items-center gap-0"
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <p className="text-white/60 text-lg md:text-xl font-medium tracking-wide text-center">
            crafting ui for the modern web
          </p>
          <p className="text-white/40 text-lg md:text-xl font-medium tracking-wide text-center">
            new components every week.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
