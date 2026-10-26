"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

/** How long the overlay takes to blur away once the intro is done. */
const EXIT_DELAY_MS = 1400
/**
 * Safety net: never hold the page longer than this, even if the video stalls.
 * The intro clip is 5s, so this leaves 2s of headroom for a slow start.
 */
const MAX_WAIT_MS = 7000
/** The intro plays once per browser session; later visits to "/" go straight to the page. */
export const PRELOADER_SEEN_KEY = "zepa-preloaded"

type PreloaderProps = {
  onComplete?: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [loading, setLoading] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const done = useRef(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    try {
      sessionStorage.setItem(PRELOADER_SEEN_KEY, "1")
    } catch {}

    // Reveal the page *as* the overlay starts leaving, not after — the hero
    // animates in underneath the blur instead of waiting on it.
    setIsExiting(true)
    onCompleteRef.current?.()

    setTimeout(() => {
      document.documentElement.classList.remove("preloading")
      setLoading(false)
    }, EXIT_DELAY_MS)
  }, [])

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(PRELOADER_SEEN_KEY) === "1"
    } catch {}

    if (seen) {
      done.current = true
      // hide synchronously so a repeat visit never sees the overlay's exit fade
      if (overlayRef.current) overlayRef.current.style.display = "none"
      document.documentElement.classList.remove("preloading")
      onCompleteRef.current?.()
      // unmount the (already hidden) overlay on the next frame
      const raf = requestAnimationFrame(() => setLoading(false))
      return () => cancelAnimationFrame(raf)
    }

    document.documentElement.classList.add("preloading")
    const fallback = setTimeout(finish, MAX_WAIT_MS)

    // The <video> is server-rendered, so it can fail or finish before React
    // attaches onError/onEnded. Check its state now, and continue straight away
    // if the browser refuses autoplay (e.g. iOS Low Power Mode).
    const v = videoRef.current
    if (v) {
      const NO_SOURCE = 3
      if (v.error || v.ended || v.networkState === NO_SOURCE) {
        finish()
      } else if (v.paused) {
        v.play()?.catch((e: unknown) => {
          // blocked autoplay or unplayable file — skip the intro. (AbortError
          // just means a load superseded this call, so let playback continue.)
          const name = e instanceof DOMException ? e.name : ""
          if (name === "NotAllowedError" || name === "NotSupportedError") finish()
        })
      }
    }

    return () => {
      clearTimeout(fallback)
      document.documentElement.classList.remove("preloading")
    }
  }, [finish])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 1, scale: 1.04 }}
          animate={
            isExiting
              ? { opacity: 0, scale: 1.15, filter: "blur(24px)", y: -40 }
              : { opacity: 1, scale: 1, filter: "blur(0px)" }
          }
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className={`${isExiting ? "pointer-events-none" : ""} fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black`}
        >
          <motion.video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={finish}
            onError={finish}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-[320px] object-contain md:w-[420px]"
          >
            {/* a failed <source> fires its own error event, not the <video>'s */}
            <source src="/news.mp4" type="video/mp4" onError={finish} />
          </motion.video>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
