"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export interface GsapImageTrailProps {
  /** Image URLs to cycle through as the cursor moves */
  images: string[];
  /** Optional content rendered centered over the trail (defaults to instructional text) */
  children?: ReactNode;
  className?: string;
}

/**
 * Mouse/touch-driven "falling & bouncing images" trail effect.
 * Port of the Codrops "Made With GSAP" demo to React.
 */
export function GsapImageTrail({ images, children, className }: GsapImageTrailProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  // Warm the image cache so the first trail frames don't pop in late.
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || images.length === 0) return;

    let incr = 0;
    let oldIncrX = 0;
    let oldIncrY = 0;
    let firstMove = true;

    const isCoarsePointer = window.matchMedia("(hover: none)").matches;
    const resetDist = window.innerWidth / (isCoarsePointer ? 6 : 8);

    const clampX = gsap.utils.clamp(0, window.innerWidth);
    const clampY = gsap.utils.clamp(0, window.innerHeight);

    function createMedia(x: number, y: number, deltaX: number) {
      const H = window.innerHeight;
      if (!root || y > H - 200) return;

      const image = document.createElement("img");
      image.src = images[indexRef.current];
      image.alt = "";
      image.className =
        "absolute z-[5] w-[15vw] h-[15vw] max-md:w-[35vw] max-md:h-[35vw] object-cover rounded-[4%]";
      root.appendChild(image);

      const tl = gsap.timeline({
        onComplete: () => {
          image.remove();
          tl.kill();
        },
      });

      tl.fromTo(
        image,
        {
          xPercent: -50 + (Math.random() - 0.5) * 80,
          yPercent: -50 + (Math.random() - 0.5) * 10,
          scaleX: 1.3,
          scaleY: 1.3,
          rotation: (Math.random() - 0.5) * 20,
        },
        {
          scaleX: 1,
          scaleY: 1,
          ease: "elastic.out(2, 0.6)",
          duration: 0.4,
        }
      );

      tl.fromTo(
        image,
        { x },
        {
          x: "+=" + deltaX * 2,
          rotation: 0,
          ease: "power1.in",
          duration: 0.4,
        },
        "<"
      );

      tl.fromTo(
        image,
        { y },
        {
          y: "+=" + (H - y),
          scale: 0.9,
          yPercent: -95,
          ease: "back.in(1.1)",
          duration: 0.4,
        },
        "<"
      );

      // bounce
      tl.to(image, {
        x: "+=" + deltaX * 1.6,
        rotation: (Math.random() - 0.5) * 40,
        ease: "power1.in",
        duration: 0.3,
      });
      tl.to(
        image,
        {
          yPercent: 150,
          ease: "back.in(" + (1.5 + (1 - y / H)) + ")",
          duration: 0.3,
        },
        "<"
      );

      indexRef.current = (indexRef.current + 1) % images.length;
    }

    function applyMove(clientX: number, clientY: number) {
      if (!root) return;
      const valX = clampX(clientX);
      const valY = clampY(clientY);

      if (firstMove) {
        firstMove = false;
        oldIncrX = valX;
        oldIncrY = valY;
        return;
      }

      incr += Math.abs(valX - oldIncrX) + Math.abs(valY - oldIncrY);

      if (incr > resetDist) {
        incr = 0;
        createMedia(
          valX,
          valY - root.getBoundingClientRect().top,
          valX - oldIncrX
        );
      }

      oldIncrX = valX;
      oldIncrY = valY;
    }

    function handleMouseMove(e: MouseEvent) {
      applyMove(e.clientX, e.clientY);
    }

    function handleTouchMove(e: TouchEvent) {
      if (!e.touches || !e.touches[0]) return;
      applyMove(e.touches[0].clientX, e.touches[0].clientY);
    }

    root.addEventListener("mousemove", handleMouseMove);
    root.addEventListener("touchstart", handleTouchMove, { passive: true });
    root.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      root.removeEventListener("mousemove", handleMouseMove);
      root.removeEventListener("touchstart", handleTouchMove);
      root.removeEventListener("touchmove", handleTouchMove);
      root.querySelectorAll("img").forEach((img) => img.remove());
    };
  }, [images]);

  return (
    <div
      ref={rootRef}
      className={`relative h-dvh overflow-hidden bg-[#121212] text-[#f1f1f1] ${className ?? ""}`}
    >
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center font-medium leading-[1.3] tracking-[-0.03em] [font-size:min(60px,5.6vw)]">
        {children}
      </div>
    </div>
  );
}
