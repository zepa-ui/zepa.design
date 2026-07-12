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
  transition: { duration: 2.5, ease: "easeOut", delay } as Transition,
});

export default function GlassUnicorn() {
  return (
    <div className="relative w-full h-screen overflow-hidden [&_canvas+div]:hidden [&_[data-us-project]>div:last-child]:hidden">
      <UnicornScene
        jsonFilePath="/unicorn/glass-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* Top-left — logo */}
      <motion.div
        className="absolute top-6 left-10 pointer-events-none select-none"
        {...fade(0.3)}
      >
        <img
          src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
          alt="Zepa"
          className="h-12 w-auto object-contain"
        />
      </motion.div>

      {/* Bottom-right — big text */}
      <div className="absolute bottom-0 right-0 p-8 pb-10 flex flex-col items-end gap-3 pointer-events-none select-none">
        <motion.p
          className="text-white text-6xl md:text-8xl font-bold tracking-tight leading-none uppercase"
          {...fade(0.5)}
        >
          Motion
          <br />
          Design
        </motion.p>
      </div>
    </div>
  );
}
