// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EDGE, TOUCH_EDGE, TURN_AGAIN, TURN_HOLD, TURN_SETTLE, edgeTurn } from './edgescroll'
import { initCalPick } from './calpick'

/* CARRIED TO THE EDGE OF A VIEW THAT TURNS (owner D897 — "should dragging to the edge turn to the next month? Yes";
   D898 — the edge and the hold the agent's). The Inputs month turns sideways, so a run of days, or a bar, carried to
   its SIDE and held there turns it: the right side to the next month, the left to the last, again every TURN_AGAIN
   while held. jsdom lays nothing out, so the month is a box whose rect is lent to it, and the clock is faked. */

/** a month 350 px wide (seven 50 px dates) and 300 px tall, at the screen's top left */
const month = () => {
  const el = document.createElement('div')
  el.getBoundingClientRect = () => ({ top: 0, bottom: 300, left: 0, right: 350, width: 350, height: 300, x: 0, y: 0, toJSON() {} }) as DOMRect
  document.body.appendChild(el)
  return el
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers(); document.body.innerHTML = '' })

describe('the turn at the month\'s side', () => {
  it('held at the right side, the month turns forward after the hold — and again while held', () => {
    const turns: number[] = []
    const t = edgeTurn({ el: month(), touch: false, x: 100, y: 100, onTurn: d => turns.push(d) })
    t.point(350 - EDGE + 2, 100)
    vi.advanceTimersByTime(TURN_HOLD - 10)
    expect(turns, 'not before the hold has taken').toEqual([])
    vi.advanceTimersByTime(10)
    expect(turns).toEqual([1])
    vi.advanceTimersByTime(TURN_AGAIN)
    expect(turns).toEqual([1, 1])
    t.stop()
    vi.advanceTimersByTime(TURN_AGAIN * 3)
    expect(turns, 'let go, it stops').toEqual([1, 1])
  })

  it('held at the left side it turns back', () => {
    const turns: number[] = []
    const t = edgeTurn({ el: month(), touch: false, x: 100, y: 100, onTurn: d => turns.push(d) })
    t.point(EDGE - 2, 150)
    vi.advanceTimersByTime(TURN_HOLD)
    expect(turns).toEqual([-1])
    t.stop()
  })

  it('a pointer carried THROUGH the band to a date inside it, and on, turns nothing', () => {
    const turns: number[] = []
    const t = edgeTurn({ el: month(), touch: false, x: 100, y: 100, onTurn: d => turns.push(d) })
    t.point(345, 100); vi.advanceTimersByTime(TURN_HOLD / 2)
    t.point(200, 100); vi.advanceTimersByTime(TURN_HOLD * 2)
    expect(turns).toEqual([])
    t.stop()
  })

  it('past the side counts, while level with the month; above or below it does not', () => {
    const turns: number[] = []
    const t = edgeTurn({ el: month(), touch: false, x: 100, y: 100, onTurn: d => turns.push(d) })
    t.point(420, 100); vi.advanceTimersByTime(TURN_HOLD)
    expect(turns).toEqual([1])
    t.point(420, 360); vi.advanceTimersByTime(TURN_AGAIN * 2)
    expect(turns, 'below the month: no longer at its side').toEqual([1])
    t.stop()
  })

  it('a finger\'s band is the outer half of the finger band — most of a Sunday is still a date to end a run on', () => {
    const turns: number[] = []
    const t = edgeTurn({ el: month(), touch: true, x: 100, y: 100, onTurn: d => turns.push(d) })
    t.point(350 - TOUCH_EDGE + 4, 100); vi.advanceTimersByTime(TURN_HOLD * 2)
    expect(turns, 'inside the finger band, outside its outer half').toEqual([])
    t.point(350 - TOUCH_EDGE / 2 + 4, 100); vi.advanceTimersByTime(TURN_HOLD)
    expect(turns).toEqual([1])
    t.stop()
  })

  it('a band the press began in is dead until the pointer has left it', () => {
    const turns: number[] = []
    const t = edgeTurn({ el: month(), touch: false, x: 340, y: 100, onTurn: d => turns.push(d) })
    vi.advanceTimersByTime(TURN_HOLD * 3)
    t.point(342, 120); vi.advanceTimersByTime(TURN_HOLD * 3)
    expect(turns, 'still where it went down').toEqual([])
    t.point(200, 120); t.point(342, 120); vi.advanceTimersByTime(TURN_HOLD)
    expect(turns, 'left and come back: now it turns').toEqual([1])
    t.stop()
  })

  it('a pointer said to be gone (no place) stops the turns', () => {
    const turns: number[] = []
    const t = edgeTurn({ el: month(), touch: false, x: 100, y: 100, onTurn: d => turns.push(d) })
    t.point(345, 100); vi.advanceTimersByTime(TURN_HOLD)
    t.point(NaN, NaN); vi.advanceTimersByTime(TURN_AGAIN * 3)
    expect(turns).toEqual([1])
    t.stop()
  })
})

/* THE RUN ACROSS A MONTH'S END, on the pick machine itself: a month whose seven dates are 50 px wide; after a turn the
   test redraws it as the next month, as the Inputs calendar does, and the date under the still pointer is read again. */
describe('a run of days carried across a month\'s end', () => {
  const OCT = ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']
  const NOV = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08']
  let grid: HTMLElement, off: () => void
  let ranges: Array<[string, string]>, picking: Array<{ a: string; b: string } | null>, turns: number[]
  const draw = (days: string[]) => {
    grid.innerHTML = ''
    for (const d of days) { const c = document.createElement('div'); c.dataset.icday = d; grid.append(c) }
  }
  const cellAt = (x: number, y: number) => (y < 0 || y > 300 || x < 0 || x >= 350 ? null : grid.children[Math.floor(x / 50)] as HTMLElement)
  const ev = (type: string, x: number, y: number, pointerType: string) => {
    const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 })
    Object.defineProperties(e, { pointerId: { value: 1 }, pointerType: { value: pointerType }, isPrimary: { value: true } })
    ;(type === 'pointerdown' ? cellAt(x, y)! : window).dispatchEvent(e)
  }
  beforeEach(() => {
    grid = month(); draw(OCT)
    ;(document as any).elementFromPoint = (x: number, y: number) => cellAt(x, y)
    ranges = []; picking = []; turns = []
    off = initCalPick(grid, {
      canPick: () => true, onTap: () => {}, onSwipe: () => {},
      onRange: (a, b) => ranges.push([a, b]),
      onPicking: r => picking.push(r),
      onTurn: d => { turns.push(d); draw(d > 0 ? NOV : OCT) },
    })
  })
  afterEach(() => { off(); delete (document as any).elementFromPoint })

  it('a mouse: held at the right side the month turns, the run goes on from its first date, and the release picks across', () => {
    ev('pointerdown', 125, 100, 'mouse')                         // 28 Oct
    ev('pointermove', 340, 100, 'mouse')                         // 1 Nov, the last date of the row, in the side band
    vi.advanceTimersByTime(TURN_HOLD)
    expect(turns).toEqual([1])
    vi.advanceTimersByTime(TURN_SETTLE)
    expect(picking.at(-1), 'the date now under the still pointer is lit').toEqual({ a: '2026-10-28', b: '2026-11-08' })
    ev('pointermove', 75, 100, 'mouse')                          // back to 3 Nov
    ev('pointerup', 75, 100, 'mouse')
    expect(ranges).toEqual([['2026-10-28', '2026-11-03']])
    vi.advanceTimersByTime(TURN_AGAIN * 3)
    expect(turns, 'let go, nothing turns on').toEqual([1])
  })

  it('a finger turns the month only once its hold has taken — a finger moving before then is the page\'s', () => {
    ev('pointerdown', 340, 100, 'touch')
    vi.advanceTimersByTime(TURN_HOLD * 3)
    expect(turns, 'not a pick yet, and the press began in the band').toEqual([])
    ev('pointerup', 340, 100, 'touch')
    ev('pointerdown', 125, 100, 'touch')
    vi.advanceTimersByTime(500)                                   // the pick's own hold (PICK_HOLD) has taken
    ev('pointermove', 345, 100, 'touch')
    vi.advanceTimersByTime(TURN_HOLD)
    expect(turns).toEqual([1])
    ev('pointerup', 345, 100, 'touch')
    vi.advanceTimersByTime(TURN_SETTLE + TURN_AGAIN * 2)
    expect(turns).toEqual([1])
  })

  /* SAFARI (the bug-check order §7.9): a touch's later events go to the element it landed on even after the turn has
     drawn it away — an element out of the page, from which an event reaches neither the month nor the window */
  it('Safari: the finger\'s later events, sent to the date it landed on after the turn removed it, still carry the run', () => {
    const landed = cellAt(125, 100)!
    const on = (type: string, x: number, y: number, target: Element) => {
      const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 })
      Object.defineProperties(e, { pointerId: { value: 1 }, pointerType: { value: 'touch' }, isPrimary: { value: true } })
      target.dispatchEvent(e)
    }
    on('pointerdown', 125, 100, landed)                          // 28 Oct
    vi.advanceTimersByTime(500)                                   // the pick's hold has taken
    on('pointermove', 345, 100, landed)
    vi.advanceTimersByTime(TURN_HOLD)
    expect(turns).toEqual([1])
    expect(landed.isConnected, 'the date it landed on is gone from the page').toBe(false)
    on('pointermove', 75, 100, landed)                           // 3 Nov — told only to the gone date
    on('pointerup', 75, 100, landed)
    expect(ranges).toEqual([['2026-10-28', '2026-11-03']])
    vi.advanceTimersByTime(TURN_SETTLE + TURN_AGAIN * 3)
    expect(turns, 'let go, nothing turns on').toEqual([1])
  })

  /* HIS FIND ON HIS IPHONE (15 Oct 26): carried forward into the next month the run turned, carried back to the left side
     it did not turn back. Safari's shape of it: once the turn has drawn the landed-on date away, its pointer events for
     that finger are cancelled, and only the finger's TOUCH events still reach the gone date. The run must go on — back
     to the last month and a release there. */
  it('Safari: after a turn its pointer cancel is set aside, and the finger\'s touch events carry the run back a month', () => {
    const landed = cellAt(125, 100)!
    const ptr = (type: string, x: number, y: number) => {
      const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 })
      Object.defineProperties(e, { pointerId: { value: 7 }, pointerType: { value: 'touch' }, isPrimary: { value: true } })
      landed.dispatchEvent(e)
    }
    const touch = (type: string, x: number, y: number) => {
      const e = new Event(type, { bubbles: true, cancelable: true })
      Object.defineProperty(e, 'changedTouches', { value: [{ clientX: x, clientY: y, identifier: 0 }] })
      landed.dispatchEvent(e)
    }
    ptr('pointerdown', 125, 100)                                  // 28 Oct
    vi.advanceTimersByTime(500)
    ptr('pointermove', 345, 100)
    vi.advanceTimersByTime(TURN_HOLD)
    expect(turns).toEqual([1]); expect(landed.isConnected).toBe(false)
    ptr('pointercancel', 345, 100)                                // Safari: the gone date's pointer is cancelled
    touch('touchmove', 150, 100)                                  // off the side band: no more forward turns
    touch('touchmove', 3, 100)                                    // to the LEFT side, held
    vi.advanceTimersByTime(TURN_HOLD)
    expect(turns, 'it turns back').toEqual([1, -1])
    vi.advanceTimersByTime(TURN_SETTLE)
    touch('touchmove', 75, 100)                                   // 27 Oct, in October drawn again
    touch('touchend', 75, 100)
    expect(ranges).toEqual([['2026-10-27', '2026-10-28']])
    vi.advanceTimersByTime(TURN_AGAIN * 3)
    expect(turns).toEqual([1, -1])
  })

  it('an event that reaches both the date and the window is taken once', () => {
    ev('pointerdown', 25, 100, 'mouse'); ev('pointermove', 125, 100, 'mouse')
    const c = cellAt(125, 100)!
    const e = new MouseEvent('pointerup', { bubbles: true, cancelable: true, clientX: 125, clientY: 100, button: 0 })
    Object.defineProperties(e, { pointerId: { value: 1 }, pointerType: { value: 'mouse' }, isPrimary: { value: true } })
    c.dispatchEvent(e)                                           // bubbles on to the window: two listeners, one event
    expect(ranges).toEqual([['2026-10-26', '2026-10-28']])
  })

  it('a pick that never reaches a side never turns the month', () => {
    ev('pointerdown', 25, 100, 'mouse'); ev('pointermove', 175, 100, 'mouse')
    vi.advanceTimersByTime(TURN_HOLD * 4)
    ev('pointerup', 175, 100, 'mouse')
    expect(turns).toEqual([]); expect(ranges).toEqual([['2026-10-26', '2026-10-29']])
  })
})

/* CARRIED TO THE EDGE OF A VIEW THAT PANS (owner D899): the Tracker's Edit chart layout canvas pans both ways at once.
   The frames are run by hand. */
describe('the pan at a canvas\'s edge', () => {
  let frames: Array<() => void> = []
  const realRAF = globalThis.requestAnimationFrame, realCAF = globalThis.cancelAnimationFrame
  const run = (n: number) => { for (let i = 0; i < n; i++) { const f = frames; frames = []; f.forEach(cb => cb()) } }
  beforeEach(() => {
    frames = []
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => { frames.push(() => cb(0)); return frames.length }) as typeof requestAnimationFrame
    globalThis.cancelAnimationFrame = (() => { frames = [] }) as typeof cancelAnimationFrame
  })
  afterEach(() => { globalThis.requestAnimationFrame = realRAF; globalThis.cancelAnimationFrame = realCAF })

  it('in a corner it pans both ways at once, a mouse at the constant step; in the middle, not at all', async () => {
    const { EDGE_STEP, edgePan } = await import('./edgescroll')
    const steps: Array<[number, number]> = []
    const p = edgePan({ box: month(), touch: false, x: 175, y: 150, onPan: (dx, dy) => steps.push([dx, dy]) })
    run(2)
    expect(steps).toEqual([])
    p.point(348, 298); run(2)
    expect(steps).toEqual([[EDGE_STEP, EDGE_STEP], [EDGE_STEP, EDGE_STEP]])
    p.point(2, 150); run(1)
    expect(steps.at(-1)).toEqual([-EDGE_STEP, 0])
    p.stop(); run(3)
    expect(steps.length).toBe(3)
  })

  /* found by the walk (15 Oct 26): on a desktop the canvas's box runs on below the window's foot — its edge is the one
     the person SEES, the window's, or a ball carried to the foot never pans */
  it('a canvas taller than the window pans at the window\'s foot, where its edge is seen', async () => {
    const { EDGE_STEP, edgePan } = await import('./edgescroll')
    const tall = document.createElement('div')
    tall.getBoundingClientRect = () => ({ top: 0, bottom: 2000, left: 0, right: 350, width: 350, height: 2000, x: 0, y: 0, toJSON() {} }) as DOMRect
    document.body.appendChild(tall)
    const steps: Array<[number, number]> = []
    const p = edgePan({ box: tall, touch: false, x: 175, y: 300, onPan: (dx, dy) => steps.push([dx, dy]) })
    p.point(175, window.innerHeight - 4); run(1)
    expect(steps).toEqual([[0, EDGE_STEP]])
    p.stop()
  })

  it('a drag that began at an edge does not pan that way until it has left it', async () => {
    const { edgePan } = await import('./edgescroll')
    const steps: Array<[number, number]> = []
    const p = edgePan({ box: month(), touch: true, x: 345, y: 150, onPan: (dx, dy) => steps.push([dx, dy]) })
    run(3)
    expect(steps).toEqual([])
    p.point(150, 150); run(1); p.point(345, 150); run(1)
    expect(steps.length).toBe(1); expect(steps[0][0]).toBeGreaterThan(0)
    p.stop()
  })
})
