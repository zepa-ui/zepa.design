"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV_LINKS = ["About", "Spaces", "Locations", "Contact"];

export default function HeroSection() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const node = glowRef.current;
      if (!node) return;
      node.style.setProperty("--mx", `${x}px`);
      node.style.setProperty("--my", `${y}px`);
      node.style.setProperty("--r", "220px");
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const node = glowRef.current;
      if (!node) return;
      node.style.setProperty("--r", "0px");
    });
  };

  return (
    <div
      className="relative min-h-screen w-full max-w-[1920px] mx-auto flex flex-col justify-between overflow-hidden bg-black p-6 md:p-8 lg:p-12"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background video */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src="https://cdn.sceneai.art/Hero%20Section%20Video/1bc60917-cb77-4441-bc15-bb839a9dd6c2.mp4"
      />

      {/* Interactive organic glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-10"
        style={
          {
            "--mx": "50%",
            "--my": "50%",
            "--r": "0px",
            background:
              "radial-gradient(circle var(--r) at var(--mx) var(--my), rgba(80,150,255,0.35), transparent)",
            transition: "background 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
          } as React.CSSProperties
        }
      />

      {/* Header */}
      <header className="relative z-50 flex w-full items-center justify-between">
        <span className="text-2xl font-semibold text-black md:text-[28px]">
          Gour
        </span>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 rounded-full bg-gray-200/50 p-1 backdrop-blur-md md:flex">
          {NAV_LINKS.map((link) =>
            link === "About" ? (
              <a
                key={link}
                href="#"
                className="rounded-full bg-white/80 px-6 py-2 text-[14px] font-medium text-black shadow-sm"
              >
                {link}
              </a>
            ) : (
              <a
                key={link}
                href="#"
                className="px-6 py-2 text-[14px] font-medium text-gray-700 transition-colors hover:text-black"
              >
                {link}
              </a>
            )
          )}
        </nav>

        {/* Desktop CTA */}
        <button className="hidden items-center gap-1.5 rounded-full bg-[#4B66D1] px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#3B54B4] md:flex">
          Contact Us
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Mobile hamburger */}
        <button
          className="flex items-center justify-center rounded-full bg-gray-200/50 p-2.5 backdrop-blur-md md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <X className="h-5 w-5 text-black" />
          ) : (
            <Menu className="h-5 w-5 text-black" />
          )}
        </button>
      </header>

      {/* Mobile dropdown overlay */}
      {menuOpen && (
        <div className="absolute inset-x-6 top-24 z-50 flex flex-col gap-2 rounded-3xl bg-white/20 p-4 backdrop-blur-xl md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className={`rounded-full px-6 py-3 text-[14px] font-medium ${
                link === "About"
                  ? "bg-white/80 text-black shadow-sm"
                  : "text-gray-800 hover:text-black"
              }`}
            >
              {link}
            </a>
          ))}
          <button className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-[#4B66D1] px-6 py-3 text-[14px] font-medium text-white hover:bg-[#3B54B4]">
            Contact Us
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Hero bottom content */}
      <main className="relative z-20 mt-auto flex flex-col items-start justify-between gap-10 pb-4 lg:flex-row lg:items-end lg:gap-20">
        {/* Bottom left: typography */}
        <div className="flex flex-col space-y-4 md:space-y-6">
          <h1 className="text-[60px] font-medium leading-[0.85] tracking-[-0.04em] text-white drop-shadow-md md:text-[86px]">
            EightHours
          </h1>
          <h2
            className="text-[60px] font-medium leading-[0.85] tracking-[-0.04em] text-white/20 md:text-[86px]"
            style={{ WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.9)" }}
          >
            Studio
          </h2>
        </div>

        {/* Bottom right: description + CTA */}
        <div className="flex w-full max-w-[340px] flex-col items-start gap-6 lg:items-end lg:gap-8">
          <p
            className="text-left text-[15px] font-light leading-relaxed text-white/95 [text-shadow:0_1px_4px_rgba(0,0,0,0.4)] lg:text-right lg:text-[16px]"
          >
            Welcome to eightHours Studio, the perfect place for artists to
            ignite their creativity and boost productivity!
          </p>
          <button className="group flex w-full items-center justify-between rounded-full bg-white px-6 py-4 font-medium text-black shadow-lg transition-colors hover:bg-gray-50 sm:w-[240px]">
            View Project
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </main>
    </div>
  );
}
