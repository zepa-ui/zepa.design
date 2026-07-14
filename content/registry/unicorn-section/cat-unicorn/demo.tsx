/*
 This zepa scene is a custom scene created in the unicorn studio with the permission if you want to use it you can
*/

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import UnicornScene from "unicornstudio-react/next";

const fade = (delay: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.8, ease: "easeOut", delay } as Transition,
});

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay } as Transition,
});

const TICKER_ITEMS = [
  "I'M AN ALBATRAOZ",
  "125 BPM",
  "ARONCHUPA",
  "NINE LIVES",
  "SIDE A",
  "LOW END THEORY",
  "FELIS CATUS",
  "AFTER HOURS",
];

const EQ_BARS = [0.9, 1.4, 0.7, 1.1, 1.6, 0.8, 1.3, 0.6, 1.5, 1.0, 0.75, 1.2];

export default function CatUnicorn() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  // True when the browser blocked autoplay and we're waiting for the
  // first user gesture to start the track.
  const [awaitingGesture, setAwaitingGesture] = useState(false);

  const START_AT = 30; // start the track at 0:30

  const startAudio = (audio: HTMLAudioElement) => {
    if (audio.currentTime < START_AT) audio.currentTime = START_AT;
    return audio.play();
  };

  // Autoplay on mount — if the browser blocks it, start on first interaction
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // When the loop wraps, jump back to 0:30 instead of 0:00
    const onEnded = () => {
      audio.currentTime = START_AT;
      void audio.play();
    };
    audio.addEventListener("ended", onEnded);

    const unlock = () => {
      startAudio(audio)
        .then(() => {
          setPlaying(true);
          setAwaitingGesture(false);
        })
        .catch(() => {});
    };

    startAudio(audio)
      .then(() => setPlaying(true))
      .catch(() => {
        // Autoplay blocked by the browser — start on the very first
        // gesture anywhere (click, key, or touch).
        setAwaitingGesture(true);
        window.addEventListener("pointerdown", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });
        window.addEventListener("touchstart", unlock, { once: true });
      });

    return () => {
      audio.removeEventListener("ended", onEnded);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      audio.pause();
    };
  }, []);

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setAwaitingGesture(false);
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      startAudio(audio)
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black [&_canvas+div]:hidden [&_[data-us-project]>div:last-child]:hidden">
      <style>{`
        @keyframes cat-eq {
          0%, 100% { transform: scaleY(0.15); }
          50% { transform: scaleY(1); }
        }
        @keyframes cat-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes cat-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        @keyframes cat-shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .cat-glass-word {
          font-family: var(--font-manrope), sans-serif;
          font-weight: 900;
          letter-spacing: -0.045em;
          -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.55);
          background: linear-gradient(
            110deg,
            rgba(255, 255, 255, 0) 20%,
            rgba(255, 255, 255, 0.28) 38%,
            rgba(255, 255, 255, 0.55) 50%,
            rgba(255, 255, 255, 0.28) 62%,
            rgba(255, 255, 255, 0) 80%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: cat-shine 7s linear infinite;
        }
      `}</style>

      <audio
        ref={audioRef}
        src="https://res.cloudinary.com/dakrfj1oh/video/upload/v1784050147/Aronchupa-I-M-An-Albatraoz_mcxiot.mp3"
        preload="auto"
      />

      <UnicornScene
        jsonFilePath="/unicorn/cat-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.6/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.45) 72%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.5) 4px)",
        }}
      />

      {/* ─── Top bar ─── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 pt-7 pointer-events-none select-none z-10">
        <motion.div {...fade(0.2)}>
          <img
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
            alt="Zepa"
            className="h-14 w-auto object-contain"
          />
        </motion.div>

        <motion.div className="flex items-center gap-6" {...fade(0.35)}>
          <span className="flex items-center gap-2 text-[9px] tracking-[0.4em] uppercase font-mono text-white/40">
            <span
              className="w-1.5 h-1.5 rounded-full bg-red-500"
              style={{ animation: "cat-pulse 1.4s ease-in-out infinite" }}
            />
            Live
          </span>
          <div className="w-px h-3 bg-white/10" />
          <span className="text-white/25 text-[9px] tracking-[0.4em] uppercase font-mono">
            125 BPM
          </span>
          <div className="w-px h-3 bg-white/10" />
          <span className="text-white/25 text-[9px] tracking-[0.4em] uppercase font-mono">
            24-bit / 96 kHz
          </span>
        </motion.div>
      </div>

      {/* ─── Kicker above the cat ─── */}
      <motion.div
        className="absolute top-[16%] left-1/2 -translate-x-1/2 pointer-events-none select-none z-10 text-center"
        {...rise(0.5)}
      >
        <p className="text-white/30 text-[10px] tracking-[0.6em] uppercase font-mono">
          Zepa Sound System presents
        </p>
      </motion.div>

      {/* ─── Left: equalizer ─── */}
      <motion.div
        className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none select-none z-10 hidden md:block"
        {...fade(0.9)}
      >
        <div className="flex items-end gap-[5px] h-16">
          {EQ_BARS.map((d, i) => (
            <span
              key={i}
              className="w-[3px] bg-white/45 origin-bottom"
              style={{
                height: "100%",
                animation: `cat-eq ${d}s ease-in-out ${i * 0.09}s infinite`,
                animationPlayState: playing ? "running" : "paused",
              }}
            />
          ))}
        </div>
        <p className="mt-4 text-white/20 text-[9px] tracking-[0.35em] uppercase font-mono">
          Purr — 26 Hz
        </p>
      </motion.div>

      {/* ─── Right: vertical track title ─── */}
      <motion.div
        className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none select-none z-10 hidden md:flex flex-col items-center gap-5"
        {...fade(0.9)}
      >
        <div className="w-px h-16 bg-gradient-to-b from-transparent to-white/25" />
        <p
          className="text-white/30 text-[10px] tracking-[0.5em] uppercase font-mono"
          style={{ writingMode: "vertical-rl" }}
        >
          The sound of nine lives
        </p>
        <div className="w-px h-16 bg-gradient-to-t from-transparent to-white/25" />
      </motion.div>

      {/* ─── Giant glass wordmark ─── */}
      <div className="absolute inset-x-0 bottom-[10%] pointer-events-none select-none z-10 flex justify-center px-4">
        <motion.h1
          className="cat-glass-word leading-none text-center text-[clamp(4.5rem,14.5vw,15rem)]"
          initial={{ opacity: 0, y: 60, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        >
          NOCTURNE
        </motion.h1>
      </div>

      {/* ─── Ticker marquee ─── */}
      <motion.div
        className="absolute bottom-[6.5%] left-0 right-0 pointer-events-none select-none z-10 overflow-hidden"
        {...fade(1.2)}
      >
        <div
          className="flex whitespace-nowrap w-max"
          style={{ animation: "cat-marquee 28s linear infinite" }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {TICKER_ITEMS.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center text-white/25 text-[10px] tracking-[0.45em] uppercase font-mono"
                >
                  <span className="px-6">{item}</span>
                  <span className="text-white/15">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Sound toggle ─── */}
      <motion.button
        type="button"
        onClick={toggleSound}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 cursor-pointer select-none group"
        {...fade(1.5)}
        aria-label={playing ? "Turn sound off" : "Turn sound on"}
      >
        <span className="flex items-end gap-[3px] h-3">
          {[0.7, 1.1, 0.5, 0.9].map((d, i) => (
            <span
              key={i}
              className="w-[2px] bg-white/60 origin-bottom"
              style={{
                height: "100%",
                animation: `cat-eq ${d}s ease-in-out ${i * 0.12}s infinite`,
                animationPlayState: playing ? "running" : "paused",
                transform: playing ? undefined : "scaleY(0.15)",
              }}
            />
          ))}
        </span>
        <span
          className="text-[9px] tracking-[0.4em] uppercase font-mono text-white/40 group-hover:text-white/80 transition-colors"
          style={
            awaitingGesture && !playing
              ? { animation: "cat-pulse 1.4s ease-in-out infinite" }
              : undefined
          }
        >
          {playing
            ? "Sound on"
            : awaitingGesture
              ? "Tap anywhere for sound"
              : "Sound off"}
        </span>
      </motion.button>

      {/* ─── Bottom bar ─── */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-10 pb-7 pointer-events-none select-none z-10">
        <motion.div {...fade(1.4)}>
          <p className="text-white/15 text-[9px] tracking-[0.3em] uppercase font-mono mb-1.5">
            Now playing
          </p>
          <p className="text-white/40 text-[12px] font-mono leading-relaxed">
            A1 — I&apos;m an Albatraoz
            <br />
            <span className="text-white/25">AronChupa — 02:46</span>
          </p>
        </motion.div>

        <motion.div className="text-right" {...fade(1.4)}>
          <p className="text-white/15 text-[9px] tracking-[0.3em] uppercase font-mono mb-1.5">
            Recorded at
          </p>
          <p className="text-white/40 text-[12px] font-mono leading-relaxed">
            Berlin — 03:47 AM
            <br />
            <span className="text-white/25">52.5200° N, 13.4050° E</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
