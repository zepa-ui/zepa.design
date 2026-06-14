"use client"

import { useInView } from "framer-motion"
import { useEffect, useRef } from "react"

const FEATURE_VIDEOS = [
  { src: "/7.mp4", label: "Hero layouts" },
  { src: "/6.mp4", label: "Motion systems" },
  { src: "/5.mp4", label: "3D & WebGL" },
] as const

export function FeatureSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const isInView = useInView(sectionRef, { margin: "120px 0px", amount: 0.15 })

  useEffect(() => {
    for (const video of videoRefs.current) {
      if (!video) continue
      if (isInView) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    }
  }, [isInView])

  return (
    <section
      ref={sectionRef}
      id="features"
      className="px-4 py-12 md:px-6 md:py-14"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {FEATURE_VIDEOS.map((item, index) => (
          <article
            key={item.src}
            className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50"
          >
            <div
              className="relative aspect-[5/4] w-full overflow-hidden bg-zinc-950 select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              <video
                ref={(el) => {
                  videoRefs.current[index] = el
                }}
                src={item.src}
                muted
                loop
                playsInline
                preload="none"
                draggable={false}
                controls={false}
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload nofullscreen noremoteplayback"
                className="pointer-events-none h-full w-full object-cover [-webkit-user-drag:none]"
              />
              <div
                className="absolute inset-0 z-10"
                aria-hidden
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
            <p className="px-3 py-2 text-center text-xs font-medium tracking-wide text-zinc-400">
              {item.label}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
