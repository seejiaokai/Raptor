// @vitest-environment jsdom
/* PICKING DAYS ON A MONTH — one pointer machine for a calendar's dates (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.5, §3.6; owner D621, D626: several days are picked
   "by hold-and-drag on a phone and by mouse drag on a desktop, the 'Select dates' button gone").

   A press on a date can mean four things, and each must be told from the others:
     a TAP opens the day · a quick sideways SLIDE of a finger turns the month · a MOUSE DRAG across dates picks them ·
     a finger HELD still, then dragged, picks them (held and let go: that one day).
   Whoever may not add here (canPick false) still taps and slides; a drag or a hold of his picks nothing. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initCalPick, PICK_HOLD } from './calpick'

let grid: HTMLDivElement, off: () => void
let taps: string[], ranges: Array<[string, string]>, swipes: number[], picking: Array<{ a: string; b: string } | null>
let can = true
const DAYS = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16']
/* each date is a 50px-wide cell on one row: 12 Oct at x 0–49, 13 Oct at 50–99 … */
const xOf = (iso: string) => DAYS.indexOf(iso) * 50 + 25
const cellAt = (x: number, y: number) => (y < 0 || y > 60 || x < 0 || x >= DAYS.length * 50 ? null : grid.children[Math.floor(x / 50)] as HTMLElement)

beforeEach(() => {
  vi.useFakeTimers()
  grid = document.createElement('div')
  for (const d of DAYS) { const c = document.createElement('div'); c.dataset.icday = d; c.innerHTML = '<span>n</span><button type="button">b</button>'; grid.append(c) }
  document.body.append(grid)
  ;(document as any).elementFromPoint = (x: number, y: number) => cellAt(x, y)
  taps = []; ranges = []; swipes = []; picking = []; can = true
  off = initCalPick(grid, {
    canPick: () => can,
    onTap: iso => taps.push(iso),
    onRange: (a, b) => ranges.push([a, b]),
    onSwipe: dir => swipes.push(dir),
    onPicking: r => picking.push(r),
  })
})
afterEach(() => { off(); grid.remove(); vi.useRealTimers(); delete (document as any).elementFromPoint })

const ev = (type: string, x: number, y: number, pointerType: string, target?: Element) => {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 })
  Object.defineProperties(e, { pointerId: { value: 1 }, pointerType: { value: pointerType }, isPrimary: { value: true } })
  ;(target || (type === 'pointerdown' ? cellAt(x, y)! : window)).dispatchEvent(e)
  return e
}
const down = (iso: string, t: string) => ev('pointerdown', xOf(iso), 30, t)
const move = (iso: string, t: string) => ev('pointermove', xOf(iso), 30, t)
const up = (iso: string, t: string) => ev('pointerup', xOf(iso), 30, t)

describe('a mouse', () => {
  it('a click opens the day', () => {
    down(DAYS[1], 'mouse'); up(DAYS[1], 'mouse')
    expect(taps).toEqual([DAYS[1]]); expect(ranges).toEqual([])
  })
  it('a drag across dates picks them, lit as it goes, and the release gives the run — first day first', () => {
    down(DAYS[3], 'mouse'); move(DAYS[2], 'mouse'); move(DAYS[1], 'mouse')
    expect(picking.at(-1)).toEqual({ a: DAYS[1], b: DAYS[3] })
    up(DAYS[1], 'mouse')
    expect(ranges).toEqual([[DAYS[1], DAYS[3]]]); expect(taps).toEqual([])
    expect(picking.at(-1)).toBeNull()                                    // nothing left lit
  })
  it('a drag taken out and brought back to where it began is that one day', () => {
    down(DAYS[1], 'mouse'); move(DAYS[3], 'mouse'); move(DAYS[1], 'mouse'); up(DAYS[1], 'mouse')
    expect(ranges).toEqual([[DAYS[1], DAYS[1]]])
  })
  it('a drag let go outside the month picks nothing', () => {
    down(DAYS[1], 'mouse'); move(DAYS[2], 'mouse')
    ev('pointerup', 120, 400, 'mouse')
    expect(ranges).toEqual([]); expect(taps).toEqual([]); expect(picking.at(-1)).toBeNull()
  })
  it('never turns the month, however far it travels', () => {
    down(DAYS[0], 'mouse'); ev('pointermove', 400, 30, 'mouse'); ev('pointerup', 400, 30, 'mouse')
    expect(swipes).toEqual([])
  })
  it('a press that begins on a button inside a date is the button’s own', () => {
    const b = grid.children[1].querySelector('button')!
    ev('pointerdown', xOf(DAYS[1]), 30, 'mouse', b); up(DAYS[1], 'mouse')
    expect(taps).toEqual([])
  })
  it('for someone who may not add, a drag picks nothing — and a click still opens the day', () => {
    can = false
    down(DAYS[1], 'mouse'); move(DAYS[3], 'mouse'); up(DAYS[3], 'mouse')
    expect(ranges).toEqual([]); expect(picking.filter(Boolean)).toEqual([])
    down(DAYS[2], 'mouse'); up(DAYS[2], 'mouse')
    expect(taps).toEqual([DAYS[2]])
  })
})

describe('a finger', () => {
  it('a tap opens the day', () => {
    down(DAYS[2], 'touch'); up(DAYS[2], 'touch')
    expect(taps).toEqual([DAYS[2]])
  })
  it('a quick slide sideways turns the month — left to the next, right to the one before — and picks nothing', () => {
    down(DAYS[3], 'touch'); move(DAYS[1], 'touch'); up(DAYS[1], 'touch')
    expect(swipes).toEqual([1])
    down(DAYS[1], 'touch'); move(DAYS[3], 'touch'); up(DAYS[3], 'touch')
    expect(swipes).toEqual([1, -1]); expect(ranges).toEqual([]); expect(taps).toEqual([])
  })
  it('a slide mostly up or down is the page scrolling: nothing happens', () => {
    down(DAYS[1], 'touch'); ev('pointermove', xOf(DAYS[1]) + 20, 200, 'touch'); ev('pointerup', xOf(DAYS[1]) + 60, 300, 'touch')
    expect(swipes).toEqual([]); expect(taps).toEqual([])
  })
  it('held still, the day lights; dragged on, the run grows; let go, the run is picked', () => {
    down(DAYS[1], 'touch')
    vi.advanceTimersByTime(PICK_HOLD - 1); expect(picking).toEqual([])
    vi.advanceTimersByTime(1); expect(picking.at(-1)).toEqual({ a: DAYS[1], b: DAYS[1] })
    move(DAYS[2], 'touch'); move(DAYS[4], 'touch')
    expect(picking.at(-1)).toEqual({ a: DAYS[1], b: DAYS[4] })
    up(DAYS[4], 'touch')
    expect(ranges).toEqual([[DAYS[1], DAYS[4]]]); expect(swipes).toEqual([]); expect(taps).toEqual([])
  })
  it('held and let go without moving is that one day', () => {
    down(DAYS[2], 'touch'); vi.advanceTimersByTime(PICK_HOLD); up(DAYS[2], 'touch')
    expect(ranges).toEqual([[DAYS[2], DAYS[2]]])
  })
  it('once the hold has taken, the page must not scroll under the finger — the move is claimed', () => {
    down(DAYS[1], 'touch')
    const before = new Event('touchmove', { bubbles: true, cancelable: true }); grid.dispatchEvent(before)
    expect(before.defaultPrevented).toBe(false)                          // not yet held: the page may scroll
    vi.advanceTimersByTime(PICK_HOLD)
    const after = new Event('touchmove', { bubbles: true, cancelable: true }); grid.dispatchEvent(after)
    expect(after.defaultPrevented).toBe(true)
  })
  it('a finger that moves before the hold has taken never picks', () => {
    down(DAYS[1], 'touch'); ev('pointermove', xOf(DAYS[1]) + 14, 30, 'touch')
    vi.advanceTimersByTime(PICK_HOLD * 2)
    expect(picking).toEqual([])
    up(DAYS[1], 'touch'); expect(ranges).toEqual([])
  })
  it('the click a phone sends after the release is swallowed once, so it cannot press what opened under the finger', () => {
    down(DAYS[2], 'touch'); vi.advanceTimersByTime(PICK_HOLD); up(DAYS[2], 'touch')
    const first = new MouseEvent('click', { bubbles: true, cancelable: true }); document.body.dispatchEvent(first)
    expect(first.defaultPrevented).toBe(true)
    const next = new MouseEvent('click', { bubbles: true, cancelable: true }); document.body.dispatchEvent(next)
    expect(next.defaultPrevented).toBe(false)
  })
  it('the click after a plain tap is swallowed too — the day’s window has just opened under the finger', () => {
    down(DAYS[2], 'touch'); up(DAYS[2], 'touch')
    const first = new MouseEvent('click', { bubbles: true, cancelable: true }); document.body.dispatchEvent(first)
    expect(first.defaultPrevented).toBe(true)
    /* a click that never came does not lie in wait for a later press */
    down(DAYS[1], 'mouse'); up(DAYS[1], 'mouse'); vi.advanceTimersByTime(400)
    const later = new MouseEvent('click', { bubbles: true, cancelable: true }); document.body.dispatchEvent(later)
    expect(later.defaultPrevented).toBe(false)
  })
  it('for someone who may not add, a hold picks nothing', () => {
    can = false
    down(DAYS[2], 'touch'); vi.advanceTimersByTime(PICK_HOLD); move(DAYS[3], 'touch'); up(DAYS[3], 'touch')
    expect(ranges).toEqual([]); expect(picking.filter(Boolean)).toEqual([])
  })
  it('a press the browser takes away (a scroll it began) leaves nothing lit and picks nothing', () => {
    down(DAYS[1], 'touch'); vi.advanceTimersByTime(PICK_HOLD)
    ev('pointercancel', xOf(DAYS[1]), 30, 'touch')
    expect(picking.at(-1)).toBeNull()
    up(DAYS[1], 'touch'); expect(ranges).toEqual([])
  })
})

it('taken off the month, it hears nothing more', () => {
  off()
  down(DAYS[1], 'mouse'); up(DAYS[1], 'mouse')
  expect(taps).toEqual([])
})
