"use client";

import './ui/index.css';
import { Header } from './ui/header';
import { Hero } from './ui/hero';
import { VideoSection } from './ui/videosection';

export default function AmindHeroDemo() {
  return (
    <div className="amind-hero-root min-h-screen w-full bg-white text-[#1a1a1a]">
      {/* Centered page frame with white gutters on both sides */}
      <div className="relative mx-auto max-w-[1400px] overflow-hidden bg-white">
        {/* Hero environment: gradient image (back) → white circle → content */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1300px]"
          aria-hidden="true">

          {/* Background gradient blob — fades + gently scales in */}
          <img
            src="https://mymind.com/wp-content/uploads/2023/05/mymind_review_neue-1.jpg"
            alt=""
            className="amind-bg-fade absolute left-1/2 top-[-22%] h-[140vmin] w-[140vmin] min-h-[1050px] min-w-[1050px] rounded-full object-cover blur-2xl" />

          {/* White circle — inlined to avoid CSS load-order conflicts with zepa globals */}
          <div
            className="amind-circle-drop amind-d1 absolute left-1/2 top-[-18%] h-[125vmin] w-[125vmin] min-h-[950px] min-w-[950px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,1) 68%, rgba(255,255,255,0.9) 82%, rgba(255,255,255,0) 100%)' }}
          />
        </div>

        <Header />
        <main className="relative">
          <Hero />
          <VideoSection />
        </main>
      </div>
    </div>
  );
}
