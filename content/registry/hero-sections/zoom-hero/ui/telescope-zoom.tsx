"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./telescope-zoom.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

export interface TelescopeZoomProps {
  /** Large image used for the back layer + the 6 blurred/masked front layers */
  bigImage: string;
  /** 10 small images scattered around the section that fly off on scroll */
  smallImages: string[];
  /** Mask png applied to the front layers (radial-ish vignette mask) */
  maskImage: string;
  heading?: { left: string; right: string };
  className?: string;
}

export function TelescopeZoom({
  bigImage,
  smallImages,
  maskImage,
  heading = { left: "for the", right: "planet" },
  className,
}: TelescopeZoomProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    const section = sectionRef.current;
    if (!wrapper || !content || !section) return;

    const sectionEl = section;
    const contentEl = content;
    const embedded = Boolean(wrapper.closest(".demo-embed-root"));
    const frontImages = sectionEl.querySelectorAll<HTMLElement>(".tz-media-front");
    const smallImgEls = sectionEl.querySelectorAll<HTMLElement>(".tz-images img");

    let smoother: ScrollSmoother | undefined;
    let timeline: gsap.core.Timeline | undefined;
    let scrollSpacer: HTMLDivElement | null = null;

    function start() {
      setLoading(false);

      // ScrollSmoother pins the wrapper to the viewport and resizes body — breaks registry embeds.
      if (!embedded) {
        smoother = ScrollSmoother.create({
          wrapper,
          content: contentEl,
          smooth: 1.5,
          effects: true,
          normalizeScroll: true,
        });
      } else {
        scrollSpacer = document.createElement("div");
        scrollSpacer.className = "tz-scroll-spacer";
        scrollSpacer.setAttribute("aria-hidden", "true");
        contentEl.appendChild(scrollSpacer);
      }

      gsap.set(smallImgEls, {
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        force3D: true,
      });

      timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: "bottom top",
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const easedProgress = gsap.parseEase("power1.inOut")(self.progress);
            sectionEl.style.setProperty("--progress", String(easedProgress));
          },
        },
      });

      timeline.to(smallImgEls, {
        z: "100vh",
        duration: 1,
        ease: "power1.inOut",
        stagger: { amount: 0.2, from: "center" },
      });

      timeline.to(
        frontImages,
        { scale: 1, duration: 1, ease: "power1.inOut", delay: 0.1 },
        0.6
      );

      timeline.to(
        frontImages,
        {
          duration: 1,
          filter: "blur(0px)",
          ease: "power1.inOut",
          delay: 0.4,
          stagger: { amount: 0.2, from: "end" },
        },
        0.6
      );

      ScrollTrigger.refresh();
    }

    const imgs = Array.from(wrapper.querySelectorAll("img"));
    let remaining = imgs.length;

    function onOneLoaded() {
      remaining -= 1;
      if (remaining <= 0) start();
    }

    if (imgs.length === 0) {
      start();
    } else {
      imgs.forEach((img) => {
        if (img.complete) {
          onOneLoaded();
        } else {
          img.addEventListener("load", onOneLoaded, { once: true });
          img.addEventListener("error", onOneLoaded, { once: true });
        }
      });
    }

    return () => {
      imgs.forEach((img) => {
        img.removeEventListener("load", onOneLoaded);
        img.removeEventListener("error", onOneLoaded);
      });
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
      smoother?.kill();
      scrollSpacer?.remove();
      ScrollTrigger.refresh();
    };
  }, [bigImage, smallImages, maskImage]);

  return (
    <div
      ref={wrapperRef}
      className={`tz-wrapper ${className ?? ""}`}
      style={{ "--tz-mask-image": `url(${maskImage})` } as CSSProperties}
    >
      <div className="tz-loader" data-hidden={!loading}>
        <span />
      </div>

      <div ref={contentRef} className="tz-content">
        <div ref={sectionRef} className="tz-section">
          <h1>
            <span className="tz-left">{heading.left}</span>
            <span className="tz-right">{heading.right}</span>
          </h1>

          <div className="tz-media">
            <div className="tz-media-back">
              <img src={bigImage} alt="" />
            </div>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className={`tz-media-front tz-front-${n}`}>
                <img src={bigImage} alt="" />
              </div>
            ))}
          </div>

          <div className="tz-images">
            {smallImages.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
