/*
 This zepa scene is a custom scene created in the unicorn studio with the permission if you want to use it you can  
 want to change the video - change the videos here in https://unicorn.studio/remix/ZZIXxTp0JyrWqVcvcYCJ
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

export default function BlurUnicorn() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <UnicornScene
        jsonFilePath="/unicorn/blur-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* Top-left — logo */}
      <motion.div
        className="absolute top-6 left-6 pointer-events-none select-none"
        {...fade(0.3)}
      >
        <img
          src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
          alt="Zepa"
          className="h-9 w-auto object-contain"
        />
      </motion.div>

      {/* Top-right — visit link */}
      <motion.a
        href="https://zepa.design"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 right-6 text-white/80 text-sm tracking-[0.15em] uppercase hover:text-white transition-colors duration-200 select-none"
        {...fade(0.3)}
      >
        Visit Zepa
      </motion.a>

      {/* Bottom-left — large headline */}
      <div className="absolute bottom-0 left-0 p-6 pb-16 flex flex-col gap-4 pointer-events-none select-none">
        <motion.h1
          className="text-white text-5xl md:text-7xl font-light leading-[1.05] tracking-tight max-w-2xl"
          {...fade(0.5)}
        >
          Components built
          <br />
          to remembered.
        </motion.h1>

        {/* Bottom-left — small description */}
        <motion.p
          className="text-white/60 text-sm leading-relaxed max-w-[320px]"
          {...fade(0.8)}
        >
          We craft react and next components that go beyond templates — built for developers
          who ship things that matter.
        </motion.p>
      </div>
    </div>
  );
}
