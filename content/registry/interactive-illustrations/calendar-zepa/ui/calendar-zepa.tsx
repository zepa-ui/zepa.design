"use client"

/**
 * CalendarZepa — month picker card.
 *
 * A graphite appointment card: weekday row, a six-week grid that never
 * reflows, a brass disc that slides to the selected day, and a time strip
 * with a sliding period pill. Click the month name to pick another month
 * without leaving the card.
 *
 *   <CalendarZepa />
 *   <CalendarZepa year={2026} month={7} selectedDay={16} />
 *   <CalendarZepa theme="light" variant="bare" />
 *
 * Implementation notes:
 *  - This is a card, not a page overlay. A fixed lightbox would escape the
 *    bento cell and steal the host layout, so the picker lives inline.
 *  - The disc stays mounted and moves with transform. Conditionally rendering
 *    it on the selected button would pop it in with no "from" state.
 *  - The grid is always 42 cells. Adjacent-month days fill the edges so the
 *    card height never jumps when the month changes.
 *  - Year, month and day are props with fixed defaults. Deriving "today"
 *    at render time would shift the selection between server and client.
 *  - Date labels are assembled from constant month names, never locale
 *    formatters, so the markup is identical on both sides of hydration.
 *  - No `font-family`; typography inherits from the host app.
 *  - Every class and keyframe is prefixed `ca-`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties, ChangeEvent } from "react"

export type CalendarZepaPeriod = "AM" | "PM"

export interface CalendarZepaEvent {
  /** Month, 0-indexed. */
  month: number
  day: number
}

export interface CalendarZepaValue {
  year: number
  month: number
  day: number
  hours: string
  minutes: string
  period: CalendarZepaPeriod
  dateLabel: string
  timeLabel: string
}

export interface CalendarZepaProps {
  year?: number
  /** 0-indexed month. */
  month?: number
  selectedDay?: number
  hours?: string
  minutes?: string
  period?: CalendarZepaPeriod
  events?: CalendarZepaEvent[]
  accent?: string
  onDateTimeSelect?: (value: CalendarZepaValue) => void
  width?: number
  theme?: "dark" | "light"
  variant?: "tile" | "bare"
  className?: string
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const

const DEFAULT_EVENTS: CalendarZepaEvent[] = [
  { month: 6, day: 22 },
  { month: 6, day: 29 },
  { month: 7, day: 3 },
  { month: 7, day: 7 },
  { month: 7, day: 12 },
  { month: 7, day: 16 },
  { month: 7, day: 21 },
  { month: 7, day: 28 },
  { month: 8, day: 4 },
  { month: 8, day: 18 },
]

type Cell = {
  key: string
  day: number
  month: number
  year: number
  offset: -1 | 0 | 1
  index: number
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function firstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function shiftMonth(year: number, month: number, delta: number) {
  const next = month + delta
  if (next < 0) return { year: year - 1, month: 11 }
  if (next > 11) return { year: year + 1, month: 0 }
  return { year, month: next }
}

function clampDay(year: number, month: number, day: number) {
  return Math.min(day, daysInMonth(year, month))
}

function pad2(value: string | number) {
  return String(value).padStart(2, "0")
}

function buildGrid(year: number, month: number): Cell[] {
  const lead = firstWeekday(year, month)
  const count = daysInMonth(year, month)
  const previous = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)
  const prevCount = daysInMonth(previous.year, previous.month)
  const cells: Cell[] = []

  for (let index = 0; index < 42; index += 1) {
    if (index < lead) {
      const day = prevCount - lead + 1 + index
      cells.push({
        key: `${previous.year}-${previous.month}-${day}`,
        day,
        month: previous.month,
        year: previous.year,
        offset: -1,
        index,
      })
    } else if (index - lead + 1 <= count) {
      const day = index - lead + 1
      cells.push({
        key: `${year}-${month}-${day}`,
        day,
        month,
        year,
        offset: 0,
        index,
      })
    } else {
      const day = index - lead - count + 1
      cells.push({
        key: `${next.year}-${next.month}-${day}`,
        day,
        month: next.month,
        year: next.year,
        offset: 1,
        index,
      })
    }
  }

  return cells
}

function dateLabel(year: number, month: number, day: number) {
  return `${MONTHS[month]} ${day}, ${year}`
}

function timeLabel(hours: string, minutes: string, period: CalendarZepaPeriod) {
  return `${pad2(hours)}:${pad2(minutes)} ${period}`
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Caret() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const CSS = `
.ca-shell{container-type:inline-size;display:flex;width:100%;max-width:var(--ca-w);justify-content:center}
.ca-shell *{box-sizing:border-box}
.ca-shell[data-variant="bare"]{max-width:none}
.ca-root{position:relative;width:100%;padding:var(--ca-pad);border:1px solid var(--ca-line);border-radius:22px;background:var(--ca-bg);color:var(--ca-fg);-webkit-user-select:none;user-select:none}
.ca-root[data-variant="bare"]{padding:0;border:0;border-radius:0;background:transparent}

.ca-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:clamp(12px,3.6cqw,16px)}
.ca-month{display:inline-flex;align-items:center;gap:5px;margin:0;padding:4px 6px 4px 2px;border:0;border-radius:8px;background:transparent;color:var(--ca-fg);font:inherit;font-size:clamp(15px,4.6cqw,17px);font-weight:600;letter-spacing:-.02em;line-height:1.2;cursor:pointer}
.ca-month:hover{background:var(--ca-hover)}
.ca-month:focus-visible{outline:2px solid var(--ca-accent);outline-offset:2px}
.ca-caret{display:flex;width:10px;height:10px;color:var(--ca-accent);transition:transform .22s ease}
.ca-caret svg{width:100%;height:100%}
.ca-month[data-open="true"] .ca-caret{transform:rotate(180deg)}
.ca-nav{display:flex;align-items:center;gap:2px}
.ca-icon{display:flex;align-items:center;justify-content:center;width:clamp(28px,8cqw,32px);height:clamp(28px,8cqw,32px);padding:0;border:0;border-radius:999px;background:transparent;color:var(--ca-accent);cursor:pointer}
.ca-icon svg{width:14px;height:14px}
.ca-icon:hover{background:var(--ca-hover)}
.ca-icon:focus-visible{outline:2px solid var(--ca-accent);outline-offset:2px}

.ca-week{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px}
.ca-wd{display:flex;align-items:center;justify-content:center;height:clamp(18px,5.4cqw,22px);font-size:clamp(9px,2.6cqw,10px);font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ca-muted)}
.ca-wd[data-on="true"]{color:var(--ca-accent)}

.ca-stage{position:relative;height:calc(var(--ca-cell) * 6)}
.ca-grid{display:grid;grid-template-columns:repeat(7,1fr);grid-template-rows:repeat(6,var(--ca-cell));position:relative;z-index:1;height:100%}
.ca-day{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;padding:0;border:0;background:transparent;color:var(--ca-fg);font:inherit;font-size:clamp(13px,4cqw,15px);font-weight:500;font-variant-numeric:tabular-nums;cursor:pointer}
.ca-day::after{content:"";position:absolute;z-index:-1;width:calc(var(--ca-cell) * .78);height:calc(var(--ca-cell) * .78);border-radius:999px}
.ca-day[data-out="true"]{color:var(--ca-faint)}
.ca-day[data-weekend="true"]:not([data-out="true"]):not([data-selected="true"]){color:var(--ca-muted)}
.ca-day[data-today="true"]:not([data-selected="true"])::after{box-shadow:inset 0 0 0 1.5px var(--ca-accent)}
.ca-day[data-selected="true"]{color:var(--ca-on-accent);font-weight:600}
.ca-day:hover:not([data-selected="true"])::after{background:var(--ca-hover)}
.ca-day:focus-visible{outline:2px solid var(--ca-accent);outline-offset:-3px;border-radius:999px}
.ca-dot{position:absolute;bottom:calc((100% - var(--ca-cell) * .78) / 2 + 3px);left:50%;width:3.5px;height:3.5px;border-radius:999px;background:var(--ca-accent);transform:translateX(-50%)}
.ca-day[data-selected="true"] .ca-dot{background:var(--ca-on-accent)}
.ca-day[data-out="true"] .ca-dot{opacity:.35}

.ca-disc{position:absolute;z-index:0;top:0;left:0;width:calc(100% / 7);height:var(--ca-cell);display:flex;align-items:center;justify-content:center;pointer-events:none;transform:translate(calc(var(--ca-col) * 100%),calc(var(--ca-row) * 100%));transition:transform .38s cubic-bezier(.22,1,.28,1),opacity .18s ease}
.ca-disc[data-jump="true"]{transition:none}
.ca-root[data-picker="true"] .ca-disc{opacity:0}
.ca-orb{width:calc(var(--ca-cell) * .78);height:calc(var(--ca-cell) * .78);border-radius:999px;background:var(--ca-accent);box-shadow:0 8px 18px -8px var(--ca-accent)}

.ca-picker{position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;padding:clamp(8px,2.4cqw,12px);border-radius:16px;background:var(--ca-overlay);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:ca-in .22s cubic-bezier(.22,1,.28,1) backwards}
.ca-year{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--ca-line)}
.ca-year span{font-size:clamp(14px,4.2cqw,16px);font-weight:700;letter-spacing:-.02em}
.ca-months{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;flex:1}
.ca-chip{padding:clamp(7px,2.2cqw,9px) 0;border:0;border-radius:9px;background:transparent;color:var(--ca-fg);font:inherit;font-size:clamp(11px,3.2cqw,12px);font-weight:700;cursor:pointer}
.ca-chip[data-on="true"]{background:var(--ca-accent);color:var(--ca-on-accent)}
.ca-chip:hover:not([data-on="true"]){background:var(--ca-hover)}
.ca-chip:focus-visible{outline:2px solid var(--ca-accent);outline-offset:1px}

.ca-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:clamp(12px,3.6cqw,16px);padding-top:clamp(12px,3.6cqw,16px);border-top:1px solid var(--ca-line)}
.ca-label{font-size:clamp(14px,4.4cqw,16px);font-weight:600;letter-spacing:-.015em}
.ca-time{display:flex;align-items:center;gap:8px}
.ca-well{display:flex;align-items:center;height:clamp(30px,8.6cqw,34px);padding:0 8px;border-radius:9px;background:var(--ca-well);font-size:clamp(14px,4.4cqw,16px);font-weight:600;font-variant-numeric:tabular-nums}
.ca-well input{width:1.35em;padding:0;border:0;background:transparent;color:inherit;font:inherit;font-weight:600;text-align:center;outline:none}
.ca-well input:focus-visible{color:var(--ca-accent)}
.ca-colon{opacity:.55;padding:0 1px}
.ca-period{position:relative;display:grid;grid-template-columns:1fr 1fr;height:clamp(30px,8.6cqw,34px);padding:2px;border-radius:9px;background:var(--ca-well)}
.ca-pill{position:absolute;top:2px;left:2px;width:calc((100% - 4px) / 2);height:calc(100% - 4px);border-radius:7px;background:var(--ca-pill);box-shadow:0 1px 2px rgba(0,0,0,.18);transition:transform .22s cubic-bezier(.22,1,.28,1)}
.ca-period[data-period="PM"] .ca-pill{transform:translateX(100%)}
.ca-ampm{position:relative;z-index:1;padding:0 8px;border:0;border-radius:7px;background:transparent;color:var(--ca-fg);font:inherit;font-size:clamp(11px,3.2cqw,12.5px);font-weight:700;cursor:pointer;opacity:.55}
.ca-ampm[data-on="true"]{opacity:1}
.ca-ampm:hover{opacity:.9}
.ca-ampm:focus-visible{outline:2px solid var(--ca-accent);outline-offset:1px}

@keyframes ca-in{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
@keyframes ca-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes ca-fade{from{opacity:0}to{opacity:1}}

@media (prefers-reduced-motion:no-preference){
  .ca-root[data-play="false"] .ca-day{opacity:0}
  .ca-root[data-play="true"] .ca-day{animation:ca-rise .42s ease var(--ca-delay) backwards}
  .ca-root[data-play="false"] .ca-disc{opacity:0}
  .ca-root[data-play="true"] .ca-disc{animation:ca-fade .5s ease .16s backwards}
}
@media (prefers-reduced-motion:reduce){
  .ca-disc,.ca-pill,.ca-caret,.ca-picker{transition:none;animation:none}
}
`

export function CalendarZepa({
  year: yearProp = 2026,
  month: monthProp = 7,
  selectedDay: dayProp = 16,
  hours: hoursProp = "10",
  minutes: minutesProp = "24",
  period: periodProp = "AM",
  events = DEFAULT_EVENTS,
  accent = "#d4a054",
  onDateTimeSelect,
  width = 340,
  theme = "dark",
  variant = "tile",
  className,
}: CalendarZepaProps) {
  const [year, setYear] = useState(yearProp)
  const [month, setMonth] = useState(monthProp)
  const [selectedDay, setSelectedDay] = useState(() =>
    clampDay(yearProp, monthProp, dayProp)
  )
  const [hours, setHours] = useState(pad2(hoursProp))
  const [minutes, setMinutes] = useState(pad2(minutesProp))
  const [period, setPeriod] = useState<CalendarZepaPeriod>(periodProp)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [jump, setJump] = useState(false)
  const [playing, setPlaying] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const cells = useMemo(() => buildGrid(year, month), [year, month])

  const selectedIndex = useMemo(() => {
    const match = cells.find(
      (cell) => cell.offset === 0 && cell.day === selectedDay
    )
    return match?.index ?? 0
  }, [cells, selectedDay])

  const emit = useCallback(
    (
      nextYear: number,
      nextMonth: number,
      nextDay: number,
      nextHours: string,
      nextMinutes: string,
      nextPeriod: CalendarZepaPeriod
    ) => {
      onDateTimeSelect?.({
        year: nextYear,
        month: nextMonth,
        day: nextDay,
        hours: pad2(nextHours),
        minutes: pad2(nextMinutes),
        period: nextPeriod,
        dateLabel: dateLabel(nextYear, nextMonth, nextDay),
        timeLabel: timeLabel(nextHours, nextMinutes, nextPeriod),
      })
    },
    [onDateTimeSelect]
  )

  const goTo = useCallback(
    (nextYear: number, nextMonth: number, nextDay?: number) => {
      const day = clampDay(nextYear, nextMonth, nextDay ?? selectedDay)
      setJump(true)
      setYear(nextYear)
      setMonth(nextMonth)
      setSelectedDay(day)
      setPickerOpen(false)
      emit(nextYear, nextMonth, day, hours, minutes, period)
    },
    [emit, hours, minutes, period, selectedDay]
  )

  useEffect(() => {
    if (!jump) return
    const frame = requestAnimationFrame(() => setJump(false))
    return () => cancelAnimationFrame(frame)
  }, [jump])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPlaying(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const selectCell = (cell: Cell) => {
    if (cell.offset !== 0) {
      goTo(cell.year, cell.month, cell.day)
      return
    }
    setSelectedDay(cell.day)
    emit(year, month, cell.day, hours, minutes, period)
  }

  const stepMonth = (delta: number) => {
    const next = shiftMonth(year, month, delta)
    goTo(next.year, next.month)
  }

  const handleHour = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 2)
    const numeric = parseInt(digits, 10)
    const next = Number.isFinite(numeric) && numeric > 12 ? "12" : digits
    setHours(next)
    if (next) emit(year, month, selectedDay, next, minutes, period)
  }

  const handleMinute = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 2)
    const numeric = parseInt(digits, 10)
    const next = Number.isFinite(numeric) && numeric > 59 ? "59" : digits
    setMinutes(next)
    if (next) emit(year, month, selectedDay, hours, next, period)
  }

  const commitHour = () => {
    const numeric = parseInt(hours, 10)
    const next = !Number.isFinite(numeric) || numeric < 1 ? "12" : pad2(Math.min(numeric, 12))
    setHours(next)
    emit(year, month, selectedDay, next, minutes, period)
  }

  const commitMinute = () => {
    const numeric = parseInt(minutes, 10)
    const next = !Number.isFinite(numeric) ? "00" : pad2(Math.min(Math.max(numeric, 0), 59))
    setMinutes(next)
    emit(year, month, selectedDay, hours, next, period)
  }

  const setAmpm = (next: CalendarZepaPeriod) => {
    setPeriod(next)
    emit(year, month, selectedDay, hours, minutes, next)
  }

  const eventSet = useMemo(() => {
    const set = new Set<string>()
    for (const event of events) set.add(`${event.month}-${event.day}`)
    return set
  }, [events])

  const isDark = theme === "dark"
  const selectedCol = selectedIndex % 7
  const selectedRow = Math.floor(selectedIndex / 7)

  const shellStyle = {
    "--ca-w": `${width}px`,
    "--ca-accent": accent,
    "--ca-on-accent": "#1a1408",
    "--ca-bg": isDark ? "#121214" : "#ffffff",
    "--ca-fg": isDark ? "#f3f3f4" : "#16161a",
    "--ca-muted": isDark ? "#8b8b96" : "#6f6f78",
    "--ca-faint": isDark ? "#3f3f48" : "#c5c5cc",
    "--ca-line": isDark ? "#26262e" : "#e8e8ec",
    "--ca-hover": isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)",
    "--ca-well": isDark ? "#1c1c22" : "#ececf1",
    "--ca-pill": isDark ? "#3a3a42" : "#ffffff",
    "--ca-overlay": isDark ? "rgba(18,18,20,.94)" : "rgba(255,255,255,.94)",
  } as CSSProperties

  const fluidStyle = {
    "--ca-pad": "clamp(16px, 5.2cqw, 20px)",
    "--ca-cell": "clamp(28px, 8.6cqw, 34px)",
    "--ca-col": selectedCol,
    "--ca-row": selectedRow,
  } as CSSProperties

  return (
    <div
      className={className ? `ca-shell ${className}` : "ca-shell"}
      data-variant={variant}
      style={shellStyle}
    >
      <style>{CSS}</style>

      <div
        ref={rootRef}
        className="ca-root"
        data-variant={variant}
        data-play={playing}
        data-picker={pickerOpen}
        style={fluidStyle}
      >
        <div className="ca-head">
          <button
            type="button"
            className="ca-month"
            data-open={pickerOpen}
            aria-expanded={pickerOpen}
            aria-label={`${MONTHS[month]} ${year}, choose month`}
            onClick={() => setPickerOpen((open) => !open)}
          >
            <span>
              {MONTHS[month]} {year}
            </span>
            <span className="ca-caret">
              <Caret />
            </span>
          </button>

          <div className="ca-nav">
            <button
              type="button"
              className="ca-icon"
              aria-label="Previous month"
              onClick={() => stepMonth(-1)}
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              className="ca-icon"
              aria-label="Next month"
              onClick={() => stepMonth(1)}
            >
              <Chevron direction="right" />
            </button>
          </div>
        </div>

        <div className="ca-week">
          {WEEKDAYS.map((label, index) => (
            <div
              key={label}
              className="ca-wd"
              data-on={selectedCol === index}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="ca-stage">
          <div
            className="ca-disc"
            data-jump={jump}
            aria-hidden="true"
          >
            <span className="ca-orb" />
          </div>

          <div className="ca-grid" role="grid" aria-label="Choose a day">
            {cells.map((cell) => {
              const selected = cell.offset === 0 && cell.day === selectedDay
              const today =
                cell.year === yearProp &&
                cell.month === monthProp &&
                cell.day === dayProp
              const weekend = cell.index % 7 === 0 || cell.index % 7 === 6
              const marked = eventSet.has(`${cell.month}-${cell.day}`)
              const row = Math.floor(cell.index / 7)

              return (
                <button
                  key={cell.key}
                  type="button"
                  role="gridcell"
                  className="ca-day"
                  aria-selected={selected}
                  aria-label={`${cell.day} ${MONTHS[cell.month]} ${cell.year}`}
                  data-selected={selected}
                  data-out={cell.offset !== 0}
                  data-today={today}
                  data-weekend={weekend}
                  style={{ "--ca-delay": `${row * 45}ms` } as CSSProperties}
                  onClick={() => selectCell(cell)}
                >
                  {cell.day}
                  {marked ? <span className="ca-dot" /> : null}
                </button>
              )
            })}
          </div>

          {pickerOpen ? (
            <div className="ca-picker">
              <div className="ca-year">
                <button
                  type="button"
                  className="ca-icon"
                  aria-label="Previous year"
                  onClick={() => {
                    const nextYear = year - 1
                    const day = clampDay(nextYear, month, selectedDay)
                    setYear(nextYear)
                    setSelectedDay(day)
                    emit(nextYear, month, day, hours, minutes, period)
                  }}
                >
                  <Chevron direction="left" />
                </button>
                <span>{year}</span>
                <button
                  type="button"
                  className="ca-icon"
                  aria-label="Next year"
                  onClick={() => {
                    const nextYear = year + 1
                    const day = clampDay(nextYear, month, selectedDay)
                    setYear(nextYear)
                    setSelectedDay(day)
                    emit(nextYear, month, day, hours, minutes, period)
                  }}
                >
                  <Chevron direction="right" />
                </button>
              </div>

              <div className="ca-months">
                {MONTHS.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className="ca-chip"
                    data-on={index === month}
                    onClick={() => goTo(year, index)}
                  >
                    {label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="ca-foot">
          <span className="ca-label">Time</span>
          <div className="ca-time">
            <div className="ca-well">
              <input
                value={hours}
                onChange={handleHour}
                onBlur={commitHour}
                inputMode="numeric"
                autoComplete="off"
                aria-label="Hours"
                maxLength={2}
              />
              <span className="ca-colon">:</span>
              <input
                value={minutes}
                onChange={handleMinute}
                onBlur={commitMinute}
                inputMode="numeric"
                autoComplete="off"
                aria-label="Minutes"
                maxLength={2}
              />
            </div>

            <div className="ca-period" data-period={period}>
              <span className="ca-pill" aria-hidden="true" />
              <button
                type="button"
                className="ca-ampm"
                data-on={period === "AM"}
                aria-pressed={period === "AM"}
                onClick={() => setAmpm("AM")}
              >
                AM
              </button>
              <button
                type="button"
                className="ca-ampm"
                data-on={period === "PM"}
                aria-pressed={period === "PM"}
                onClick={() => setAmpm("PM")}
              >
                PM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarZepa
