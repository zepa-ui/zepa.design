/**
 * Original scene created with: Unicorn Studio
 * Remix: https://unicorn.studio/community
 * React implementation: zepa
 * Used with permission.
 */
"use client";

import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import UnicornScene from "unicornstudio-react/next";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, filter: "blur(12px)", y: 16 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  transition: { duration: 1.1, ease: "easeOut", delay } as Transition,
})

export default function RigelUnicorn() {
  return (
    <div className="relative w-full h-screen">
      <UnicornScene
        jsonFilePath="/unicorn/rigel-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-32 pointer-events-none select-none">
        <motion.img
          src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
          alt="Zepa"
          className="h-18 w-auto object-contain mb-5 -translate-x-5 translate-y-2"
          {...fadeUp(0.2)}
        />
        <div className="flex flex-col items-center gap-1">
          <motion.h1
            className="text-white text-5xl md:text-8xl font-semibold tracking-tight text-center leading-none"
            {...fadeUp(0.5)}
          >
            Build faster
          </motion.h1>
          <motion.h1
            className="text-white/40 text-5xl md:text-8xl font-semibold tracking-tight text-center leading-none"
            {...fadeUp(0.75)}
          >
            Build Bigger
          </motion.h1>
        </div>
      </div>
    </div>
  );
}
