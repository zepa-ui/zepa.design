"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { publishedDates } from "@/content/registry/published"
import { formatCategory } from "@/lib/format-category"
import {
  registerPlayer,
  reportVisibility,
  unregisterPlayer,
} from "@/lib/video-budget"

const NEW_BADGE_WINDOW_MS = 72 * 60 * 60 * 1000 // 3 days

/**
 * How far outside the viewport a card starts downloading. Deliberately
 * wider than the play window so the row above and below are already
 * buffered and start instantly when they scroll in.
 */
const LOAD_MARGIN = "200% 0px"

function isRecentlyPublished(slug: string) {
  const publishedAt = publishedDates[slug]
  if (!publishedAt) return false
  return Date.now() - Date.parse(publishedAt) < NEW_BADGE_WINDOW_MS
}

interface ComponentPreviewProps {
  slug: string
  title: string
  preview: string
  category?: string
}

export function ComponentPreview({
  slug,
  title,
  preview,
  category,
}: ComponentPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  /* src is withheld until the card is within LOAD_MARGIN, so opening the
     page never kicks off 40 video downloads at once */
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)

  const prefersReducedMotion = useReducedMotion()
  const isNew = isRecentlyPublished(slug)

  /* ── stage 1: attach src when the card gets close ── */
  useEffect(() => {
    if (shouldLoad) return
    const el = cardRef.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          io.disconnect()
        }
      },
      { rootMargin: LOAD_MARGIN }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shouldLoad])

  /* ── stage 2: report visibility; the budget decides who plays ── */
  useEffect(() => {
    if (!shouldLoad || prefersReducedMotion) return
    const el = cardRef.current
    if (!el) return

    const id = Symbol(slug)
    registerPlayer(
      id,
      () => void videoRef.current?.play().catch(() => {}),
      () => videoRef.current?.pause()
    )

    const io = new IntersectionObserver(
      ([entry]) => {
        reportVisibility(id, entry.isIntersecting ? entry.intersectionRatio : 0)
      },
      // a spread of thresholds so the ranking updates smoothly while scrolling
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] }
    )
    io.observe(el)

    return () => {
      io.disconnect()
      unregisterPlayer(id)
    }
  }, [shouldLoad, prefersReducedMotion, slug])

  /* skeleton stays until there's a real frame to show */
  useEffect(() => {
    if (!shouldLoad || isVideoReady) return
    const video = videoRef.current
    if (!video) return

    if (video.readyState >= 2) {
      setIsVideoReady(true)
      return
    }

    const markReady = () => setIsVideoReady(true)
    video.addEventListener("loadeddata", markReady)
    video.addEventListener("canplay", markReady)
    video.addEventListener("playing", markReady)

    // some browsers fire before React attaches listeners (cached, iOS)
    const poll = window.setInterval(() => {
      if (video.readyState >= 2) markReady()
    }, 400)

    return () => {
      video.removeEventListener("loadeddata", markReady)
      video.removeEventListener("canplay", markReady)
      video.removeEventListener("playing", markReady)
      window.clearInterval(poll)
    }
  }, [shouldLoad, isVideoReady])

  return (
    /* the black matte wraps the whole card — preview *and* caption — so the
       beam has black to ride on all the way round, and a light-coloured demo
       can never wash it out */
    <div
      ref={cardRef}
      className="group card-beam relative rounded-lg bg-black p-1.5"
    >
      <span aria-hidden className="card-beam-arc card-beam-a" />
      <span aria-hidden className="card-beam-arc card-beam-b" />

      <Link href={`/components/${slug}`} className="block w-full">
        {/* the recordings are ~1280x735 (≈1.74), not 16:9 — an aspect-video
            box makes object-cover crop the top and bottom off every clip */}
        <div className="relative aspect-[1.74] overflow-hidden rounded">
          {shouldLoad ? (
            <video
              ref={videoRef}
              src={preview}
              muted
              loop
              playsInline
              preload="auto"
              /* no hover scale — any zoom re-crops the frame, which is the
                 problem the aspect fix above is solving */
              className={`h-full w-full object-cover transition-opacity duration-500 ${
                isVideoReady ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null}

          {!isVideoReady ? (
            <div className="absolute inset-0">
              <Skeleton className="h-full w-full rounded bg-white/10" />
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/25" />

          {isNew ? (
            <span className="absolute right-3 top-3 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black shadow-lg">
              New
            </span>
          ) : null}
        </div>
      </Link>

      {/* caption lives inside the same black frame, separated from the
          preview by a gap rather than by a border */}
      <div className="flex items-center justify-between gap-3 px-1 pb-0.5 pt-2.5">
        <Link
          href={`/components/${slug}`}
          className="min-w-0 truncate rounded bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-white/85 transition hover:bg-white/[0.12] hover:text-white"
        >
          {title}
        </Link>
        {category ? (
          <span className="shrink-0 text-[10px] text-white/30">
            {formatCategory(category)}
          </span>
        ) : null}
      </div>
    </div>
  )
}
