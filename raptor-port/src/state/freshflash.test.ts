// @vitest-environment jsdom
/* THE FRESH-ADD BOX REPAINTS ITSELF, NOT THE PAGE (5 Sep 26 — the owner's
   phone recording: a black screen for ~1s after a fling, ~6s after a week
   load). Every week load accepts a few inputs into the ground programme, each
   add flashes its ~6s box with two timers, and each timer used to fire a full
   notify() for the board AND the edit week — a dozen repaints in one second,
   rebuilding seven day strings each time, for a box the week never draws.
   The timers now re-hang the decoration only. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOOKS } from '../engine/hooks'
import { FRESHADD, FRESHOUT, FRESH_MS, FRESH_FADE_MS, flashAdded } from './view'

describe('the fresh-add flash', () => {
  const saved = { paint: HOOKS.paintFreshAdds, week: HOOKS.renderEditWeek, board: HOOKS.renderScheduler }
  let paints = 0, renders = 0
  beforeEach(() => {
    vi.useFakeTimers(); paints = 0; renders = 0
    HOOKS.paintFreshAdds = () => { paints++ }
    HOOKS.renderEditWeek = () => { renders++ }
    HOOKS.renderScheduler = () => { renders++ }
    FRESHADD.clear(); FRESHOUT.clear()
  })
  afterEach(() => { vi.useRealTimers(); HOOKS.paintFreshAdds = saved.paint; HOOKS.renderEditWeek = saved.week; HOOKS.renderScheduler = saved.board })

  it('five inputs accepted on a week load: the fade and the removal re-hang the box and never repaint the page', () => {
    for (let i = 0; i < 5; i++) flashAdded(`gr:0.${i}.prog`)
    expect(FRESHADD.size).toBe(5)
    vi.advanceTimersByTime(FRESH_MS - FRESH_FADE_MS)
    expect(FRESHOUT.size, 'all five enter the fade together').toBe(5)
    expect(renders, 'no full repaint at the fade').toBe(0)
    expect(paints).toBe(5)
    vi.advanceTimersByTime(FRESH_FADE_MS)
    expect(FRESHADD.size).toBe(0); expect(FRESHOUT.size).toBe(0)
    expect(renders, 'no full repaint at the removal either').toBe(0)
    expect(paints).toBe(10)
  })
})
