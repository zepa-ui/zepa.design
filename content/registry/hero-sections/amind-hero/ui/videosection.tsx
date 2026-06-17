import React from 'react';
export function VideoSection() {
  return (
    <section className="amind-rise amind-d6 relative z-10 mx-auto mt-4 w-[80vw] max-w-[1100px]">
      <div className="group relative overflow-hidden rounded-xl border border-[#E2E2E2]">
        <video
          className="block w-full"
          src="https://carbon-media.accelerator.net/00000000001/ji9KfXI5e4Bby7egHtQulR;2200x1560/frame(1).mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto" />
        
        {/* Hover lightbox — hidden on touch devices */}
        <div className="pointer-events-none absolute inset-0 hidden items-end justify-center bg-[radial-gradient(117%_92%_at_50%_92%,rgba(255,255,255,0.97)_9.5%,rgba(242,244,247,0.47)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
          <button
            className="pointer-events-auto absolute left-1/2 top-1/2 flex h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 scale-50 items-center justify-center rounded-full shadow-[0_8px_16px_2px_rgba(255,154,36,0.2)] transition-transform duration-300 ease-out hover:scale-110 group-hover:scale-100"
            style={{
              background: 'linear-gradient(180deg, #FF5924 0%, #FFA86A 100%)'
            }}
            aria-label="Watch the intro video">
            
            <svg
              width="23"
              height="28"
              viewBox="0 0 23 28"
              fill="none"
              className="ml-1"
              aria-hidden="true">
              
              <path
                d="M21.5 12.27c1.33.77 1.33 2.7 0 3.46L3 26.42c-1.33.77-3-.2-3-1.73V3.3C0 1.78 1.67.82 3 1.58l18.5 10.69z"
                fill="white" />
              
            </svg>
          </button>
          <p className="font-serif-display mb-12 translate-y-7 text-4xl tracking-tight text-[#383F4A] transition-transform duration-300 ease-out group-hover:translate-y-0">
            Watch the intro
          </p>
        </div>
      </div>
    </section>);

}