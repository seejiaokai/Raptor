// THE MOVE MACHINE WHILE A CHIP IS PICKED UP (owner, D262, 27 Sep 26 — "when i drag to the edges of the leave war it
// should auto scroll … unless i click on an empty area outside the leave war grids to cancel that function").
//
// `wireMove` is shared by the one-day sheet's Move, the drag-selection's "Move…" and the event move. It gains:
//   - edge scroll: the mouse carried to the grid's left or right edge scrolls the days (it follows the mouse, so moving
//     it IS the drag); a press-and-drag — a finger's hold, or a held mouse button — carries it too, by the same edge
//     machine the drag-select uses, and lands on the lift;
//   - a click on an empty spot outside the grid cancels (a control, the grid's own frame, a sheet's shade do not);
//   - a finger's long press never cancels (Android sends it as a right-click; only a MOUSE right-click cancels).
// jsdom has no layout: rects are stubbed and requestAnimationFrame is captured, as in select.test.ts.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { wireMove } from './select'

let grid: HTMLElement, wrap: HTMLElement, a: HTMLElement, b: HTMLElement, outside: HTMLElement
let teardown: () => void
let sl = 0
const origEFP = document.elementFromPoint
const rect = (o: Partial<DOMRect>) => ({ left: 0, right: 400, top: 0, bottom: 300, width: 400, height: 300, x: 0, y: 0, toJSON() {}, ...o }) as DOMRect
let frames: FrameRequestCallback[] = []
let picks: string[] = [], hovers: string[] = [], cancels = 0

function mount() {
  grid = document.createElement('div'); grid.className = 'card'
  wrap = document.createElement('div')
  a = document.createElement('div'); a.setAttribute('data-testid', 'cell-ramp-2026-01-06')
  b = document.createElement('div'); b.setAttribute('data-testid', 'cell-ramp-2026-01-09')
  wrap.append(a, b); grid.appendChild(wrap)
  outside = document.createElement('div')
  document.body.append(grid, outside)
  sl = 0
  Object.defineProperty(wrap, 'scrollLeft', { configurable: true, get: () => sl, set: v => { sl = v } })
  wrap.getBoundingClientRect = () => rect({})
  teardown = wireMove(wrap, {
    count: 1,
    onHover: d => hovers.push(d),
    onPick: d => picks.push(d),
    onCancel: () => { cancels++ },
    leftEdge: () => 100,                          // the frozen name columns end at x=100
    isGrid: t => grid.contains(t),
  })
}

beforeEach(() => {
  frames = []; picks = []; hovers = []; cancels = 0
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => { frames.push(cb); return frames.length })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  document.elementFromPoint = () => b
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
  mount()
  vi.advanceTimersByTime(500)                     // past the double-click guard
})
afterEach(() => { teardown(); grid.remove(); outside.remove(); document.elementFromPoint = origEFP; vi.restoreAllMocks(); vi.useRealTimers() })

const runFrame = () => { const f = frames.shift(); f?.(0) }
const mouseMove = (target: HTMLElement, x: number, y = 150, buttons = 0) =>
  target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y, buttons }))

describe('the edge scroll while a chip is picked up (D262)', () => {
  it('the mouse at the grid’s RIGHT edge scrolls the days on; at the LEFT edge (past the names) back', () => {
    mouseMove(a, 200)                             // somewhere in the middle first
    mouseMove(a, 390)                             // into the right band
    runFrame()
    expect(sl).toBeGreaterThan(0)
    const at = sl
    mouseMove(a, 110)                             // into the left band, which starts where the days do
    runFrame()
    expect(sl).toBeLessThan(at)
  })

  it('the middle of the grid scrolls nothing', () => {
    mouseMove(a, 200); mouseMove(a, 250)
    runFrame()
    expect(sl).toBe(0)
  })

  it('a pointer ALREADY resting in a band when the move begins does not scroll until it has left it', () => {
    /* Fable's S2: the sheet closes under a still mouse, which may sit in an edge band */
    mouseMove(a, 390)
    runFrame()
    expect(sl).toBe(0)
    mouseMove(a, 200); mouseMove(a, 390)
    runFrame()
    expect(sl).toBeGreaterThan(0)
  })

  it('the mouse over something that is not the grid (the banner, the page) scrolls nothing', () => {
    mouseMove(a, 200)
    mouseMove(outside, 390)
    runFrame()
    expect(sl).toBe(0)
  })

  it('what the grid scrolled under the mouse is previewed there', () => {
    mouseMove(a, 200); mouseMove(a, 390)
    hovers = []
    runFrame()
    expect(hovers).toContain('2026-01-09')        // elementFromPoint now reads the day slid under it
  })
})

describe('a press-and-drag carries it and lands on the lift (D262)', () => {
  const down = (el: HTMLElement, type: string, x = 150) => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 3, pointerType: type, clientX: x, clientY: 150, button: 0 }))
  const move = (type: string, x: number) => window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 3, pointerType: type, clientX: x, clientY: 150 }))
  const up = (type: string, x: number) => window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 3, pointerType: type, clientX: x, clientY: 150, button: 0 }))

  it('a held mouse dragged from one day to another lands on the day it is released over — once', () => {
    down(a, 'mouse'); move('mouse', 170); move('mouse', 260); up('mouse', 260)
    expect(picks).toEqual(['2026-01-09'])
    b.dispatchEvent(new MouseEvent('click', { bubbles: true }))   // the click a release can leave behind
    expect(picks).toEqual(['2026-01-09'])
  })

  it('a finger held, then dragged, stages the day it lifts over (a phone confirms it)', () => {
    down(a, 'touch')
    vi.advanceTimersByTime(200)                   // the hold arms
    move('touch', 260); up('touch', 260)
    expect(picks).toEqual(['2026-01-09'])
    vi.advanceTimersByTime(30)
    b.dispatchEvent(new MouseEvent('click', { bubbles: true }))   // the finger's trailing tap
    expect(picks).toEqual(['2026-01-09'])
  })

  it('a quick swipe scrolls the grid and lands nothing', () => {
    down(a, 'touch'); move('touch', 200); up('touch', 200)
    expect(picks).toEqual([])
  })

  it('a finger’s LONG PRESS (sent as a right-click on Android) never cancels the move', () => {
    down(a, 'touch')
    vi.advanceTimersByTime(600)
    a.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    expect(cancels).toBe(0)
  })

  it('a MOUSE right-click still cancels (27 Aug 26)', () => {
    a.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 4, pointerType: 'mouse', button: 2 }))
    a.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    expect(cancels).toBe(1)
  })
})

describe('a click while a chip is picked up (D262)', () => {
  it('on a day picks it; on an empty spot outside the grid cancels', () => {
    b.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(picks).toEqual(['2026-01-09'])
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(cancels).toBe(1)
  })

  it('on a control, or a sheet’s shade, outside the grid does not cancel', () => {
    const btn = document.createElement('button'); outside.appendChild(btn)
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    const scrim = document.createElement('div'); scrim.setAttribute('data-testid', 'sheet-scrim'); outside.appendChild(scrim)
    scrim.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    /* the Legend's and the under-manned list's shades too (found writing the walk) */
    const shade = document.createElement('div'); shade.setAttribute('data-testid', 'legend-scrim'); outside.appendChild(shade)
    shade.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    /* and the move's own banner, clicked beside its buttons */
    const bar = document.createElement('div'); bar.className = 'mv-banner'; outside.appendChild(bar)
    bar.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(cancels).toBe(0)
  })

  it('on the grid’s own frame (not a day) does nothing', () => {
    grid.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(cancels).toBe(0)
    expect(picks).toEqual([])
  })

  /* THE DOUBLE-CLICK GUARD IS A PLACE AS WELL AS A TIME (the gate run, 27 Sep 26): a time-only guard also dropped a
     deliberate click on another day made quickly after Move — the existing "loose box" browser test does exactly that.
     A double-click's second click lands where the first pressed Move; a deliberate one lands somewhere else. */
  const pressAt = (x: number, y: number) => document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: x, clientY: y, button: 0 }))
  it('in the first moments of the move, a click on the SAME spot as the Move press (a double-click) lands nothing', () => {
    teardown(); grid.remove(); outside.remove()
    pressAt(150, 150)                             // the press on Move
    mount()                                       // a fresh move, no time passed
    b.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 151, clientY: 150 }))
    expect(picks).toEqual([])
  })
  it('in the first moments of the move, a deliberate click on ANOTHER spot lands it', () => {
    teardown(); grid.remove(); outside.remove()
    pressAt(150, 150)
    mount()
    b.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 260, clientY: 150 }))
    expect(picks).toEqual(['2026-01-09'])
  })
})
