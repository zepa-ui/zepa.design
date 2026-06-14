"use client"

import Link from "next/link"
import { useEffect, useRef, useSyncExternalStore } from "react"

interface ComponentPreviewProps {
  slug: string
  title: string
  preview: string
}

const hoverNoneQuery = "(hover: none)"

function subscribeToHoverNone(onStoreChange: () => void) {
  const media = window.matchMedia(hoverNoneQuery)
  media.addEventListener("change", onStoreChange)
  return () => media.removeEventListener("change", onStoreChange)
}

function getHoverNoneSnapshot() {
  return window.matchMedia(hoverNoneQuery).matches
}

export function ComponentPreview({
  slug,
  title,
  preview,
}: ComponentPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const isTouch = useSyncExternalStore(
    subscribeToHoverNone,
    getHoverNoneSnapshot,
    () => false
  )

  // On touch devices there's no hover, so autoplay the preview once the
  // card scrolls into view (and pause it again once it scrolls out).
  useEffect(() => {
    if (!isTouch) return

    const video = videoRef.current
    const container = linkRef.current
    if (!video || !container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [isTouch])

  const handleMouseEnter = () => {
    if (isTouch) return
    videoRef.current?.play().catch(() => {})
  }

  const handleMouseLeave = () => {
    if (isTouch) return
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
  }

  return (
    <Link
      ref={linkRef}
      href={`/components/${slug}`}
      className="group relative block w-full overflow-hidden rounded-2xl border border-white/10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="aspect-video overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={preview}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/40" />

      <div
        className={`absolute inset-x-0 bottom-0 p-4 transition duration-300 ${
          isTouch
            ? "translate-y-0"
            : "translate-y-full group-hover:translate-y-0"
        }`}
      >
        <div className="w-fit rounded-md bg-white px-2.5 py-1 text-xs font-medium text-black">
          {title}
        </div>
      </div>
    </Link>
  )
}
