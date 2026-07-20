"use client";

import { useEffect, useState } from "react";

import { PaperCard } from "./ui/paper-card";

const VIDEO_SRC =
  "https://res.cloudinary.com/dakrfj1oh/video/upload/v1784550080/pub_rwdrfq.mp4";

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(
        [now.getHours(), now.getMinutes(), now.getSeconds()]
          .map((n) => String(n).padStart(2, "0"))
          .join(":")
      );
    }
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return <span>{time}</span>;
}

export default function PaperHero() {
  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none"
      style={{ background: "#e4e4e4", color: "#111111" }}
    >
      {/* ═══ Top nav ═══ */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 pt-6 font-mono text-[11px] uppercase tracking-[0.25em] md:px-10">
        <p className="font-semibold">Zepa Studio</p>
        <p className="hidden text-[#111]/50 sm:block">Component Library</p>
        <p className="hidden text-[#111]/50 md:block">Menu</p>
        <p>Let&apos;s Build!</p>
      </div>

      {/* ═══ Massive centered headline ═══ */}
      <div className="absolute inset-0 z-[5] flex items-center justify-center px-4">
        <h1
          className="text-center uppercase"
          style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 900,
            fontSize: "clamp(3rem, 10vw, 10rem)",
            lineHeight: 0.88,
            letterSpacing: "-0.025em",
          }}
        >
          We craft
          <br />
          bold and
          <br />
          clean UI
        </h1>
      </div>

      {/* ═══ The paper video card — chases the cursor, bends like paper ═══ */}
      <PaperCard videoSrc={VIDEO_SRC} />

      {/* ═══ Bottom furniture ═══ */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-6 pb-6 font-mono text-[11px] uppercase tracking-[0.25em] md:px-10">
        <p className="text-[#111]/60">
          We craft bold design &amp; clean components.
        </p>
        <p className="hidden items-center gap-6 text-[#111]/60 sm:flex">
          <span>zepa.design</span>
          <span className="tabular-nums">
            <LiveClock />
          </span>
        </p>
      </div>
    </div>
  );
}
