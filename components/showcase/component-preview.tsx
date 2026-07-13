"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { publishedDates } from "@/content/registry/published"

const NEW_BADGE_WINDOW_MS = 72 * 60 * 60 * 1000 // 3 days

function isRecentlyPublished(slug: string) {
  const publishedAt = publishedDates[slug]
  if (!publishedAt) return false
  return Date.now() - Date.parse(publishedAt) < NEW_BADGE_WINDOW_MS
}

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
  const [isVideoReady, setIsVideoReady] = useState(false)

  // If the video is already cached/decoded on mount, the loadeddata event
  // may have fired before React attached the listener — check readyState.
  // Safety net: some mobile browsers (iOS low-power mode) never fire
  // loadeddata without a play() — drop the skeleton after 4s regardless
  // so it can never get stuck.
  useEffect(() => {
    const video = videoRef.current
    if (video && video.readyState >= 2) {
      setIsVideoReady(true)
      return
    }

    const timeout = window.setTimeout(() => setIsVideoReady(true), 4000)
    return () => window.clearTimeout(timeout)
  }, [])
  const isTouch = useSyncExternalStore(
    subscribeToHoverNone,
    getHoverNoneSnapshot,
    () => false
  )

  const prefersReducedMotion = useReducedMotion()
  const isNew = isRecentlyPublished(slug)

  // On touch devices there's no hover, so autoplay the preview once the
  // card scrolls into view (and pause it again once it scrolls out).
  // Skipped entirely when the user prefers reduced motion.
  useEffect(() => {
    if (!isTouch || prefersReducedMotion) return

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
  }, [isTouch, prefersReducedMotion])

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
      <div className="relative aspect-video overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={preview}
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setIsVideoReady(true)}
          className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] ${
            isVideoReady ? "opacity-100" : "opacity-0"
          }`}
        />

        {!isVideoReady ? (
          <div className="absolute inset-0 p-3">
            <Skeleton className="h-full w-full rounded-xl bg-white/10" />
          </div>
        ) : null}
      </div>

      <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/40" />

      {isNew ? (
        <span className="absolute right-3 top-3 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black shadow-lg">
          New
        </span>
      ) : null}

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
