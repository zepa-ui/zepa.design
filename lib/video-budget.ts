/**
 * Shared playback budget for the showcase grid.
 *
 * Browsers cap how many videos they will decode at once — Chrome starts
 * throttling somewhere around 8 and Safari is stricter. A 4-column grid
 * can easily have 12+ cards on screen, so letting every visible card call
 * play() produces stutter, fan noise, and cards that never start.
 *
 * Instead each card reports *how visible* it is and the budget decides who
 * actually plays: the most-visible MAX_CONCURRENT win, everyone else is
 * paused. Recalculated on an animation frame so a scroll burst collapses
 * into one pass.
 */

/**
 * The grid is 4-up, so this is "how many rows play at once".
 * 12 = three full rows. Raising it further starts to hit the browser's
 * own decoder limits, at which point play() resolves but nothing moves.
 */
const MAX_CONCURRENT = 12

type Player = {
  /** 0–1, from IntersectionObserver. 0 means offscreen. */
  ratio: number
  play: () => void
  pause: () => void
  /** whether the budget currently has it playing */
  active: boolean
}

const players = new Map<symbol, Player>()
let frame = 0

function reconcile() {
  frame = 0

  const ranked = [...players.entries()]
    .filter(([, p]) => p.ratio > 0)
    .sort((a, b) => b[1].ratio - a[1].ratio)
    .slice(0, MAX_CONCURRENT)

  const winners = new Set(ranked.map(([id]) => id))

  for (const [id, p] of players) {
    const shouldPlay = winners.has(id)
    // only touch the element when the decision actually changes
    if (shouldPlay && !p.active) {
      p.active = true
      p.play()
    } else if (!shouldPlay && p.active) {
      p.active = false
      p.pause()
    }
  }
}

function schedule() {
  if (frame) return
  frame = requestAnimationFrame(reconcile)
}

export function registerPlayer(
  id: symbol,
  play: () => void,
  pause: () => void
) {
  players.set(id, { ratio: 0, play, pause, active: false })
}

export function reportVisibility(id: symbol, ratio: number) {
  const p = players.get(id)
  if (!p || p.ratio === ratio) return
  p.ratio = ratio
  schedule()
}

export function unregisterPlayer(id: symbol) {
  players.delete(id)
  schedule()
}
