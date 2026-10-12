"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import {
  ZepaFolder,
  type ZepaFolderFile,
} from "@/content/registry/interactive-illustrations/zepa-folder/ui/zepa-folder"

/* ─────────────────────────────────────────────
   file-grid — a three-step "how it works" band

   Three tiles that actually do what they describe,
   and talk to each other:

   1. Upload — a real file picker and drop zone.
      Pick or drop anything and its name and size
      land in the list, run a short progress bar and
      settle as Uploaded, or fail as Exceeds limit /
      Unsupported format. Nothing is read or stored —
      only the File object's name, size and type.
   2. Settings — ZepaFolder, full width, peeking its
      top sheet over the rim. Hover and the files fan
      out of it. Every image you upload in tile one
      adds to its count.
   3. Storage — the bar and legend track what you
      uploaded, by kind, and Upgrade doubles the
      capacity so the whole bar re-flows.

   Everything rises in on scroll-into-view.
   ───────────────────────────────────────────── */

const MAX_BYTES = 500 * 1024 * 1024

const FOLDER_FILES: ZepaFolderFile[] = [
  { id: "f1", image: "https://res.cloudinary.com/dzvffb6vv/image/upload/samples/two-ladies.jpg", title: "two-ladies.jpg" },
  { id: "f2", image: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/vivek_i01gjp.png", title: "vivek.png" },
  { id: "f3", image: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/samevans_hf73xr.jpg", title: "samevans.jpg" },
]

type Kind = "image" | "video" | "audio" | "doc"
type Status = "uploading" | "done" | "too-big" | "bad-type"

type Row = {
  id: string
  name: string
  bytes: number
  kind: Kind
  status: Status
  progress: number
  /** seeded rows are illustration only and never count toward storage */
  seed?: boolean
  shake?: number
}

const SEED: Row[] = [
  { id: "seed-1", name: "large-footage.mov", bytes: 520 * 1024 * 1024, kind: "video", status: "too-big", progress: 0, seed: true },
  { id: "seed-2", name: "intro-video.mp4", bytes: 12.4 * 1024 * 1024, kind: "video", status: "done", progress: 100, seed: true },
]

const STORAGE = [
  { key: "Photos", kind: "image" as Kind, gb: 48, color: "#97c1f4" },
  { key: "Documents", kind: "doc" as Kind, gb: 13, color: "#f5d2e6" },
  { key: "Videos", kind: "video" as Kind, gb: 26, color: "#f2a5c4" },
  { key: "Sounds", kind: "audio" as Kind, gb: 10, color: "#c6b9ef" },
]

const kindOf = (f: File): Kind =>
  f.type.startsWith("image/")
    ? "image"
    : f.type.startsWith("video/")
      ? "video"
      : f.type.startsWith("audio/")
        ? "audio"
        : "doc"

const ACCEPTED = /^(image|video|audio)\//

function formatBytes(b: number) {
  if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(1).replace(/\.0$/, "")} GB`
  if (b >= 1024 ** 2) return `${(b / 1024 ** 2).toFixed(1).replace(/\.0$/, "")} MB`
  if (b >= 1024) return `${Math.round(b / 1024)} KB`
  return `${b} B`
}

const gb = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} GB`

function KindIcon({ kind }: { kind: Kind }) {
  const p = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  if (kind === "video")
    return <svg {...p}><rect x="3" y="6" width="13" height="12" rx="2.5" /><path d="m16 10 5-3v10l-5-3" /></svg>
  if (kind === "image")
    return <svg {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.6" /><path d="m20 16-4.5-4.5L6 19" /></svg>
  if (kind === "audio")
    return <svg {...p}><path d="M9 17V6l10-2v11" /><circle cx="6.5" cy="17" r="2.5" /><circle cx="16.5" cy="15" r="2.5" /></svg>
  return <svg {...p}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /></svg>
}

export default function FileGrid() {
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /* ── uploads ── */
  const [rows, setRows] = useState<Row[]>(SEED)
  const [dragging, setDragging] = useState(false)
  const dragDepth = useRef(0)

  const addFiles = (list: FileList | null) => {
    if (!list || !list.length) return
    // only the name, size and type are kept — the file itself is never read
    const next: Row[] = Array.from(list).map((f, i) => {
      const status: Status = !ACCEPTED.test(f.type)
        ? "bad-type"
        : f.size > MAX_BYTES
          ? "too-big"
          : "uploading"
      return {
        id: `${Date.now()}-${i}-${f.name}`,
        name: f.name,
        bytes: f.size,
        kind: kindOf(f),
        status,
        progress: 0,
      }
    })
    setRows((r) => [...next, ...r])
  }

  /* one ticker drives every bar that is still filling */
  const anyUploading = rows.some((r) => r.status === "uploading")
  useEffect(() => {
    if (!anyUploading) return
    const id = window.setInterval(() => {
      setRows((rs) =>
        rs.map((r) => {
          if (r.status !== "uploading") return r
          // bigger files fill a little slower, so the bars do not move in lockstep
          const step = 4 + Math.max(0, 9 - Math.log2(1 + r.bytes / 1e5))
          const progress = Math.min(100, r.progress + step)
          return progress >= 100 ? { ...r, progress: 100, status: "done" } : { ...r, progress }
        }),
      )
    }, 70)
    return () => window.clearInterval(id)
  }, [anyUploading])

  const removeRow = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id))
  const retryRow = (id: string) =>
    setRows((rs) =>
      // a file over the limit is still over the limit — say so with a shake
      rs.map((r) => (r.id === id ? { ...r, shake: (r.shake ?? 0) + 1 } : r)),
    )

  /* ── storage, derived from the base plus whatever finished uploading ── */
  const [capacity, setCapacity] = useState(128)
  const [bumped, setBumped] = useState(0)
  const [hoverSeg, setHoverSeg] = useState<number | null>(null)

  /* Uploads are tracked in bytes and shown as their own "+4.2 MB" figure. A
     photo is a few thousandths of a gigabyte, so folding it into "48 GB" would
     round it away and the tile would look like it ignored the upload. */
  const storage = useMemo(() => {
    const extra: Record<Kind, number> = { image: 0, video: 0, audio: 0, doc: 0 }
    for (const r of rows) if (!r.seed && r.status === "done") extra[r.kind] += r.bytes
    return STORAGE.map((s) => ({
      ...s,
      extraBytes: extra[s.kind],
      used: s.gb + extra[s.kind] / 1024 ** 3,
    }))
  }, [rows])
  const baseUsed = storage.reduce((a, s) => a + s.gb, 0)
  const addedBytes = storage.reduce((a, s) => a + s.extraBytes, 0)

  const uploadedImages = rows.filter((r) => !r.seed && r.status === "done" && r.kind === "image").length

  /* ── folder sizing: the folder is the whole middle tile, so it tracks its width ── */
  const cellRef = useRef<HTMLDivElement>(null)
  const [folderSize, setFolderSize] = useState(350)
  const [folderHot, setFolderHot] = useState(false)
  useEffect(() => {
    const el = cellRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      setFolderSize(Math.round(Math.min(404, e.contentRect.width)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const fh = Math.round(folderSize * 0.72)

  return (
    <div ref={rootRef} className={`fg-root${inView ? " is-in" : ""}`}>
      <style>{CSS}</style>

      <header className="fg-head">
        <span className="fg-pill fg-rise" style={{ "--i": 0 } as React.CSSProperties}>Process</span>
        <h2 className="fg-h fg-rise" style={{ "--i": 1 } as React.CSSProperties}>How Zepa Works</h2>
        <p className="fg-sub fg-rise" style={{ "--i": 2 } as React.CSSProperties}>
          From upload to download, everything happens in a few simple steps right on your device.
        </p>
      </header>

      <div className="fg-grid">
        {/* ── 1 · upload ── */}
        <div className="fg-col fg-rise" style={{ "--i": 3 } as React.CSSProperties}>
          <div className="fg-card fg-upload">
            <label
              className={`fg-drop${dragging ? " is-drag" : ""}`}
              onDragEnter={(e) => {
                e.preventDefault()
                dragDepth.current += 1
                setDragging(true)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => {
                // child elements fire their own enter/leave; count depth so the
                // highlight does not flicker as the pointer crosses them
                dragDepth.current = Math.max(0, dragDepth.current - 1)
                if (dragDepth.current === 0) setDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                dragDepth.current = 0
                setDragging(false)
                addFiles(e.dataTransfer.files)
              }}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                className="fg-input"
                onChange={(e) => {
                  addFiles(e.target.files)
                  // reset so picking the same file twice still fires change
                  e.target.value = ""
                }}
              />
              <span className="fg-drop-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
              </span>
              <b>{dragging ? "Drop to add" : "Choose file or drag & drop"}</b>
              <small>WEBP, PNG, MP4, max 500 MB</small>
            </label>

            <ul className="fg-list">
              {rows.map((r) => {
                const bad = r.status === "too-big" || r.status === "bad-type"
                return (
                  <li
                    key={`${r.id}-${r.shake ?? 0}`}
                    className={`fg-file${bad ? " is-bad" : ""}${r.shake ? " is-shake" : ""}`}
                  >
                    <span className={`fg-file-icon fg-k-${r.kind}`}>
                      <KindIcon kind={r.kind} />
                    </span>
                    <span className="fg-file-text">
                      <b title={r.name}>{r.name}</b>
                      <small>
                        {formatBytes(r.bytes)} •{" "}
                        {r.status === "uploading"
                          ? `Uploading ${Math.round(r.progress)}%`
                          : r.status === "done"
                            ? "Uploaded"
                            : r.status === "too-big"
                              ? "Exceeds limit"
                              : "Unsupported format"}
                      </small>
                      {r.status === "uploading" && (
                        <span className="fg-bar">
                          <i style={{ width: `${r.progress}%` }} />
                        </span>
                      )}
                    </span>
                    {bad && (
                      <button type="button" className="fg-retry" onClick={() => retryRow(r.id)}>
                        Try Again
                      </button>
                    )}
                    <button
                      type="button"
                      className={`fg-trash${bad ? " is-hot" : ""}`}
                      aria-label={`Remove ${r.name}`}
                      onClick={() => removeRow(r.id)}
                    >
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                      </svg>
                    </button>
                  </li>
                )
              })}
              {rows.length === 0 && <li className="fg-empty">No files yet — add one above.</li>}
            </ul>
          </div>
          <h3 className="fg-cap-title">Add your image or video</h3>
          <p className="fg-cap">
            Drag in an image or video, or choose one from your device. We will show you when it is
            ready to compress.
          </p>
        </div>

        {/* ── 2 · settings, the folder ── */}
        <div className="fg-col fg-rise" style={{ "--i": 4 } as React.CSSProperties}>
          <div
            ref={cellRef}
            className={`fg-folder-cell${folderHot ? " is-hot" : ""}`}
            onPointerEnter={() => setFolderHot(true)}
            onPointerLeave={() => setFolderHot(false)}
          >
            <div className="fg-folder">
              <ZepaFolder
                variant="bare"
                files={FOLDER_FILES}
                color="#fb7a24"
                size={folderSize}
                caption={null}
                hint={null}
                lightbox={false}
                maxVisible={3}
              />
            </div>
            {/* the label printed on the folder's front face; it steps aside when the folder opens */}
            <div
              className="fg-face"
              style={{ width: folderSize, height: Math.round(fh * 0.74) }}
            >
              <div className="fg-face-top">
                <span>
                  <b>Images</b>
                  <small key={uploadedImages} className="fg-count">
                    {248 + uploadedImages} images
                  </small>
                </span>
                <span className="fg-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <div className="fg-face-foot">Last edited time 19 May, 2024</div>
            </div>
          </div>
          <h3 className="fg-cap-title">Choose your settings</h3>
          <p className="fg-cap">
            Pick the format and quality that work for you. Use the preview to find the right balance
            between clarity and file size.
          </p>
        </div>

        {/* ── 3 · storage ── */}
        <div className="fg-col fg-rise" style={{ "--i": 5 } as React.CSSProperties}>
          <div className="fg-card fg-store">
            <div className="fg-store-head">
              <b>Storage</b>
              <span className="fg-store-used">
                {addedBytes > 0 && (
                  <em key={addedBytes} className="fg-add">+{formatBytes(addedBytes)}</em>
                )}
                <span className="fg-mono">
                  {gb(baseUsed)} / {capacity} GB
                </span>
              </span>
            </div>

            <div className="fg-track" onPointerLeave={() => setHoverSeg(null)}>
              {storage.map((s, i) => (
                <span
                  key={s.key}
                  className={`fg-seg${hoverSeg !== null && hoverSeg !== i ? " is-dim" : ""}`}
                  style={
                    {
                      "--w": `${(s.used / capacity) * 100}%`,
                      background: s.color,
                      "--d": `${i * 110}ms`,
                    } as React.CSSProperties
                  }
                  onPointerEnter={() => setHoverSeg(i)}
                />
              ))}
            </div>

            <ul className="fg-legend" onPointerLeave={() => setHoverSeg(null)}>
              {storage.map((s, i) => (
                <li
                  key={s.key}
                  className={`${hoverSeg === i ? "is-on" : ""}${hoverSeg !== null && hoverSeg !== i ? " is-dim" : ""}`}
                  onPointerEnter={() => setHoverSeg(i)}
                >
                  <span className="fg-dot" style={{ background: s.color }} />
                  <b>
                    {s.key}
                    {s.extraBytes > 0 && (
                      <em key={s.extraBytes} className="fg-add">+{formatBytes(s.extraBytes)}</em>
                    )}
                  </b>
                  <span className="fg-mono">{gb(s.gb)}</span>
                </li>
              ))}
            </ul>

            <div className="fg-up">
              <div className="fg-up-text">
                <small>{capacity > 128 ? "Upgraded" : "Upgrade"}</small>
                <b>{capacity >= 1024 ? "You are on the largest plan." : "Want to Increase Storage?"}</b>
                <button
                  type="button"
                  disabled={capacity >= 1024}
                  onClick={() => {
                    setCapacity((c) => Math.min(1024, c * 2))
                    setBumped((b) => b + 1)
                  }}
                >
                  {capacity >= 1024 ? "Maxed" : `Upgrade to ${Math.min(1024, capacity * 2)} GB`}
                </button>
              </div>
              <span key={bumped} className={`fg-mini${bumped ? " is-pop" : ""}`} aria-hidden="true">
                <i className="fg-mini-tab" />
                <i className="fg-mini-paper" />
                <i className="fg-mini-front" />
              </span>
            </div>
          </div>
          <h3 className="fg-cap-title">Download the smaller file</h3>
          <p className="fg-cap">
            Save the optimized file to your device when you are happy with the result. Your original
            stays exactly as it was.
          </p>
        </div>
      </div>
    </div>
  )
}

const CSS = `
.fg-root {
  --fg-orange: #f2551d;
  --fg-ink: #0b0b0c;
  --fg-mute: #6b6b70;
  --fg-line: #f1e9e3;
  position: relative;
  width: 100%;
  padding: clamp(50px, 7.2vw, 94px) clamp(16px, 4vw, 40px) clamp(44px, 5.4vw, 80px);
  background: #ffffff;
  color: var(--fg-ink);
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.fg-root *, .fg-root *::before, .fg-root *::after { box-sizing: border-box; }
.fg-root button { font: inherit; color: inherit; border: 0; background: none; cursor: pointer; }
.fg-root ul { list-style: none; margin: 0; padding: 0; }
.fg-root h2, .fg-root h3, .fg-root p { margin: 0; }
.fg-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; }

/* ── appear ── */
.fg-rise {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i, 0) * 90ms);
}
.fg-root.is-in .fg-rise { opacity: 1; transform: none; }

/* ── header ── */
.fg-head { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: clamp(44px, 6.3vw, 82px); }
.fg-pill {
  padding: 6px 14px;
  border-radius: 999px;
  background: #ffefe7;
  color: var(--fg-orange);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.fg-h {
  margin-top: 18px !important;
  font-size: clamp(33px, 4.7vw, 58px);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 1.05;
}
.fg-sub { margin-top: 14px !important; max-width: 46rem; font-size: clamp(15px, 1.4vw, 18px); line-height: 1.6; color: var(--fg-mute); }

/* ── grid ── */
.fg-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(22px, 3.1vw, 40px);
  max-width: 1140px;
  margin: 0 auto;
}
.fg-col { display: flex; flex-direction: column; min-width: 0; }
.fg-cap-title {
  margin-top: 24px !important;
  font-size: clamp(20px, 2.1vw, 27px);
  font-weight: 400;
  letter-spacing: -0.035em;
}
.fg-cap { margin-top: 10px !important; font-size: 14px; line-height: 1.75; color: var(--fg-mute); }

.fg-card {
  position: relative;
  height: 378px;
  padding: 18px;
  border-radius: 26px;
  background: #ffffff;
  border: 1px solid var(--fg-line);
  box-shadow: 0 30px 60px -48px rgba(242, 85, 29, 0.35), 0 1px 0 rgba(255, 255, 255, 0.9) inset;
  transition: box-shadow 0.35s ease, transform 0.35s ease;
}
.fg-card:hover { box-shadow: 0 34px 70px -44px rgba(242, 85, 29, 0.45); transform: translateY(-3px); }

/* ── 1 · upload ── */
.fg-upload { display: flex; flex-direction: column; }
.fg-drop {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 136px;
  flex: none;
  border: 1.5px dashed #f6cbb6;
  border-radius: 20px;
  background: #fffaf7;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}
.fg-drop:hover { background: #fff4ee; border-color: #f4a882; }
.fg-drop.is-drag { background: #ffece2; border-color: var(--fg-orange); border-style: solid; transform: scale(1.015); }
.fg-drop:focus-within { outline: 2px solid var(--fg-orange); outline-offset: 3px; }
.fg-input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.fg-drop-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 6px;
  border-radius: 50%;
  background: #fde4d8;
  color: var(--fg-orange);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fg-drop:hover .fg-drop-icon { transform: translateY(-4px); }
.fg-drop.is-drag .fg-drop-icon { animation: fg-bob 0.8s ease-in-out infinite; }
@keyframes fg-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
.fg-drop b { font-size: 14px; font-weight: 700; }
.fg-drop small { font-size: 11.5px; color: #8a8a90; }

.fg-list {
  flex: 1;
  min-height: 0;
  margin-top: 18px !important;
  display: flex;
  flex-direction: column;
  gap: 9px;
  overflow-y: auto;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(to bottom, #000 82%, transparent);
  mask-image: linear-gradient(to bottom, #000 82%, transparent);
}
.fg-list::-webkit-scrollbar { display: none; }
.fg-file {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 0 0 1px #f2f2f2, 0 6px 14px -10px rgba(0, 0, 0, 0.18);
  animation: fg-in 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.fg-file:hover { transform: translateX(3px); box-shadow: 0 0 0 1px #ebebeb, 0 10px 18px -12px rgba(0, 0, 0, 0.25); }
@keyframes fg-in { from { opacity: 0; transform: translateY(-10px) scale(0.98); } to { opacity: 1; transform: none; } }
.fg-file.is-shake { animation: fg-shake 0.45s ease; }
@keyframes fg-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(3px); }
}
.fg-file-icon { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 10px; background: #eef3ff; color: #2f62f0; }
.fg-file.is-bad .fg-file-icon { background: #ffe9ee; color: #ef3e64; }
.fg-file-icon.fg-k-image { background: #eaf6ef; color: #1f9d55; }
.fg-file-icon.fg-k-audio { background: #f2edff; color: #7a5af0; }
.fg-file-icon.fg-k-doc { background: #f3f3f3; color: #555555; }
.fg-file-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.fg-file-text b { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fg-file-text small { font-size: 13px; font-weight: 600; color: #2f62f0; }
.fg-file.is-bad .fg-file-text small { color: #ef3e64; }
.fg-bar { display: block; height: 4px; margin-top: 4px; border-radius: 99px; background: #eef1f6; overflow: hidden; }
.fg-bar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #6a93ff, #2f62f0); transition: width 0.12s linear; }
.fg-retry { font-size: 13px; font-weight: 700; color: #ef3e64 !important; white-space: nowrap; }
.fg-retry:hover { text-decoration: underline; }
.fg-trash {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: #c9c9cd !important;
  transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}
.fg-trash.is-hot { color: #111111 !important; }
.fg-trash:hover { color: #ef3e64 !important; background: #fff0f3 !important; transform: rotate(-8deg); }
.fg-empty { padding: 18px 0; text-align: center; font-size: 13px; color: #9a9aa0; }

/* ── 2 · the folder ── */
.fg-folder-cell { position: relative; height: 378px; }
.fg-folder { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); z-index: 3; }
.fg-face {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 4;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 26px 26px 30px;
  color: #ffffff;
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fg-folder-cell.is-hot .fg-face { opacity: 0; transform: translate(-50%, 10px); }
.fg-face-top { display: flex; justify-content: space-between; align-items: flex-start; }
.fg-face-top b { display: block; font-size: 26px; font-weight: 700; letter-spacing: -0.03em; }
.fg-face-top small { display: block; margin-top: 2px; font-size: 13px; font-weight: 600; opacity: 0.85; }
.fg-count { animation: fg-tick 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes fg-tick { from { transform: translateY(6px); opacity: 0.2; } to { transform: none; } }
.fg-dots {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.fg-dots i { width: 3px; height: 3px; border-radius: 50%; background: #ffffff; }
.fg-face-foot {
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ── 3 · storage ── */
.fg-store { display: flex; flex-direction: column; }
.fg-store-head { display: flex; justify-content: space-between; align-items: baseline; }
.fg-store-head b { font-size: 14px; font-weight: 700; }
.fg-store-head .fg-mono { font-size: 13px; color: #8a8a90; }
.fg-store-used { display: inline-flex; align-items: center; gap: 8px; }
.fg-add {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 6px;
  background: #e9f7ef;
  color: #1f9d55;
  font-style: normal;
  font-size: 11px;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  vertical-align: 1px;
  animation: fg-tick 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fg-track {
  display: flex;
  gap: 0;
  height: 12px;
  margin-top: 14px;
  border-radius: 99px;
  background: #f1f1f3;
  overflow: hidden;
}
.fg-seg {
  flex: none;
  width: 0;
  height: 100%;
  cursor: pointer;
  transition: width 1.1s cubic-bezier(0.22, 1, 0.36, 1) var(--d), opacity 0.25s ease, filter 0.25s ease;
}
.fg-root.is-in .fg-seg { width: var(--w); }
.fg-seg:hover { filter: saturate(1.4) brightness(0.95); }
.fg-seg.is-dim { opacity: 0.3; }

.fg-legend { margin-top: 18px; display: flex; flex-direction: column; gap: 2px; }
.fg-legend li {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 5px 8px;
  margin: 0 -8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}
.fg-legend li.is-on { background: #f6f6f8; }
.fg-legend li.is-dim { opacity: 0.45; }
.fg-dot { width: 10px; height: 10px; border-radius: 50%; }
.fg-legend b { font-size: 14px; font-weight: 600; }
.fg-legend .fg-mono { font-size: 13px; color: #555559; }

.fg-up {
  position: relative;
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  min-height: 104px;
  padding: 16px 0 0 18px;
  border-radius: 18px;
  background: linear-gradient(120deg, #ffffff 30%, #fff2ec);
  box-shadow: 0 0 0 1px #f3ece7;
  overflow: hidden;
}
.fg-up-text { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding-bottom: 16px; }
.fg-up-text small { font-size: 10.5px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-orange); }
.fg-up-text b { font-size: 13.5px; font-weight: 700; max-width: 15ch; }
.fg-up-text button {
  margin-top: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #ffffff !important;
  box-shadow: 0 0 0 1px #e6e6e8;
  font-size: 12.5px;
  font-weight: 700;
  transition: box-shadow 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}
.fg-up-text button:hover:not(:disabled) { box-shadow: 0 0 0 1px var(--fg-orange); transform: translateY(-1px); }
.fg-up-text button:disabled { opacity: 0.5; cursor: default; }

/* the little folder in the upgrade box, built from three plain blocks */
.fg-mini { position: relative; flex: none; width: 128px; height: 86px; margin-right: -2px; transform-origin: bottom right; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fg-store:hover .fg-mini { transform: rotate(-4deg) translateY(-3px); }
.fg-mini.is-pop { animation: fg-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes fg-pop { 0% { transform: scale(1); } 40% { transform: scale(1.12) rotate(-5deg); } 100% { transform: scale(1); } }
.fg-mini i { position: absolute; display: block; }
.fg-mini-tab { left: 0; top: 0; width: 52px; height: 24px; border-radius: 10px 10px 0 0; background: #ea5a1a; }
.fg-mini-paper { left: 8px; right: 10px; top: 14px; height: 40px; border-radius: 8px; background: #ffffff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08); transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fg-store:hover .fg-mini-paper { transform: translateY(-8px); }
.fg-mini-front { left: 0; right: 0; bottom: 0; height: 66px; border-radius: 12px 0 0 0; background: linear-gradient(160deg, #ff9b5c, #f46b20); }
.fg-mini-front::before { content: ""; position: absolute; left: 12px; right: 12px; top: 12px; height: 10px; border-radius: 99px; background: rgba(255, 255, 255, 0.55); }
.fg-mini-front::after { content: ""; position: absolute; left: 12px; width: 48px; bottom: 14px; height: 5px; border-radius: 99px; background: rgba(255, 255, 255, 0.4); }

/* ── tablet / phone ── */
@media (max-width: 1000px) {
  .fg-grid { grid-template-columns: minmax(0, 480px); justify-content: center; row-gap: 56px; }
}
@media (max-width: 480px) {
  .fg-card, .fg-folder-cell { height: 362px; }
  .fg-file { grid-template-columns: 34px minmax(0, 1fr) auto auto; gap: 10px; padding: 10px 12px; }
  .fg-file-icon { width: 34px; height: 34px; }
  .fg-retry { font-size: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .fg-rise, .fg-seg { transition: none; }
  .fg-file, .fg-count, .fg-mini.is-pop, .fg-drop.is-drag .fg-drop-icon { animation: none; }
}
`
