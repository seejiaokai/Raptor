import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearLanding, earliestDate, eventRange, paintLanding, parseCellId, parseEventCell, rectCells, rowRun, wireRowSelect, wireSelect, type Selection } from './select'

// The gesture controller (wireSelect) needs a real browser (elementFromPoint,
// pointer capture, layout) and is covered by e2e/leavewar.spec.ts. Here we pin
// the DOM-free geometry, which is where an off-by-one would silently select
// the wrong people or days — and the touch scroll-lock below, which jsdom can
// drive without layout because it turns only on the `armed` flag.

describe('parseCellId', () => {
  it('splits a person id from the trailing YYYY-MM-DD date', () => {
    expect(parseCellId('cell-ramp-2026-01-06')).toEqual({ personId: 'ramp', date: '2026-01-06' })
  })
  it('handles a person id that itself contains a dash (date is the last 10 chars)', () => {
    expect(parseCellId('cell-j-lee-2026-12-31')).toEqual({ personId: 'j-lee', date: '2026-12-31' })
  })
  it('rejects anything that is not a cell testid', () => {
    expect(parseCellId('head-2026-01-06')).toBeNull()
    expect(parseCellId('bal-ramp')).toBeNull()
    expect(parseCellId(null)).toBeNull()
    expect(parseCellId('cell-')).toBeNull()
  })
})

describe('rectCells', () => {
  const order = ['ramp', 'dusk', 'asics', 'tata']
  const dates = ['2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09']

  it('a single cell selects just itself', () => {
    const s = rectCells(order, dates, { personId: 'dusk', date: '2026-01-07' }, { personId: 'dusk', date: '2026-01-07' })!
    expect(s.people).toEqual(['dusk'])
    expect(s.from).toBe('2026-01-07')
    expect(s.to).toBe('2026-01-07')
    expect(s.cells).toEqual([{ personId: 'dusk', date: '2026-01-07' }])
  })

  it('a row drag spans days for one person', () => {
    const s = rectCells(order, dates, { personId: 'ramp', date: '2026-01-06' }, { personId: 'ramp', date: '2026-01-08' })!
    expect(s.people).toEqual(['ramp'])
    expect(s.cells.map(c => c.date)).toEqual(['2026-01-06', '2026-01-07', '2026-01-08'])
  })

  it('a block spans people AND days, in the grid order, whichever way you drag', () => {
    const down = rectCells(order, dates, { personId: 'ramp', date: '2026-01-06' }, { personId: 'asics', date: '2026-01-08' })!
    const up = rectCells(order, dates, { personId: 'asics', date: '2026-01-08' }, { personId: 'ramp', date: '2026-01-06' })!
    expect(down).toEqual(up)                       // direction-independent
    expect(down.people).toEqual(['ramp', 'dusk', 'asics'])
    expect(down.from).toBe('2026-01-06')
    expect(down.to).toBe('2026-01-08')
    expect(down.cells).toHaveLength(3 * 3)
  })

  it('returns null on a stale endpoint (a hit-test that missed the grid)', () => {
    expect(rectCells(order, dates, { personId: 'ramp', date: '2026-01-06' }, { personId: 'ghost', date: '2026-01-06' })).toBeNull()
    expect(rectCells(order, dates, { personId: 'ramp', date: '1999-01-01' }, { personId: 'ramp', date: '2026-01-06' })).toBeNull()
  })
})

// Event cells (owner, 27 Aug 26): a drag along one event line opens the event
// sheet for a date span. The parser must claim ONLY the plain day cell, never
// the band / blocked / row testids that share the `event-` prefix.
describe('parseEventCell', () => {
  it('splits an event line number from the trailing date', () => {
    expect(parseEventCell('event-0-2026-03-14')).toEqual({ line: 0, date: '2026-03-14' })
    expect(parseEventCell('event-12-2026-12-31')).toEqual({ line: 12, date: '2026-12-31' })
  })
  it('rejects the band / blocked / row testids and anything else', () => {
    expect(parseEventCell('event-band-0-2026-03-14')).toBeNull()
    expect(parseEventCell('event-blocked-2026-03-14')).toBeNull()
    expect(parseEventCell('event-row-0')).toBeNull()
    expect(parseEventCell('cell-ramp-2026-03-14')).toBeNull()
    expect(parseEventCell(null)).toBeNull()
  })
})

describe('eventRange', () => {
  const dates = ['2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09']
  it('spans the days between two dates on one line, either drag direction', () => {
    const fwd = eventRange(dates, 1, '2026-01-06', '2026-01-08')!
    const back = eventRange(dates, 1, '2026-01-08', '2026-01-06')!
    expect(fwd).toEqual(back)
    expect(fwd.line).toBe(1)
    expect(fwd.from).toBe('2026-01-06')
    expect(fwd.to).toBe('2026-01-08')
    expect(fwd.dates).toEqual(['2026-01-06', '2026-01-07', '2026-01-08'])
  })
  it('a single cell is a one-day span', () => {
    expect(eventRange(dates, 0, '2026-01-07', '2026-01-07')!.dates).toEqual(['2026-01-07'])
  })
  it('returns null on a date off the visible list (a stale hit-test)', () => {
    expect(eventRange(dates, 0, '2026-01-06', '1999-01-01')).toBeNull()
  })
})

// The move anchor (owner, 27 Aug 26 — "drop the leave on the day you tap"): the
// block's earliest input is the day that lands on the tap, so any empty margin
// swept up before it is dropped. YYYY-MM-DD sorts as date order, so a min string
// is the min date.
describe('earliestDate', () => {
  it('returns the earliest day among the cells, whatever their order', () => {
    expect(earliestDate([
      { personId: 'dusk', date: '2026-01-09' },
      { personId: 'ramp', date: '2026-01-07' },
      { personId: 'asics', date: '2026-01-08' },
    ])).toBe('2026-01-07')
  })
  it('is null for an empty set', () => {
    expect(earliestDate([])).toBeNull()
  })
})

// The landing preview paints `.mvland` straight onto the cells the block would
// occupy, matching by testid the way the selection paint does — so the phone
// can show where a drop lands before it commits (there is no undo).
describe('paintLanding / clearLanding', () => {
  it('marks exactly the landing cells and clears them all again', () => {
    const wrap = document.createElement('div')
    for (const id of ['cell-ramp-2026-01-15', 'cell-ramp-2026-01-16', 'cell-dusk-2026-01-15']) {
      const td = document.createElement('td')
      td.setAttribute('data-testid', id)
      wrap.appendChild(td)
    }
    document.body.appendChild(wrap)
    paintLanding(wrap, [{ personId: 'ramp', date: '2026-01-15' }, { personId: 'dusk', date: '2026-01-15' }])
    expect(wrap.querySelectorAll('.mvland').length).toBe(2)
    expect(wrap.querySelector('[data-testid="cell-ramp-2026-01-16"]')?.classList.contains('mvland')).toBe(false)
    // a fresh paint moves the marks, never stacks them
    paintLanding(wrap, [{ personId: 'ramp', date: '2026-01-16' }])
    expect(wrap.querySelectorAll('.mvland').length).toBe(1)
    clearLanding(wrap)
    expect(wrap.querySelectorAll('.mvland').length).toBe(0)
    wrap.remove()
  })
})

// The phone regression (owner, 27 Aug 26 — "when I hold then drag … I can't
// select a date range, I'm stuck with just adding 1 input"). On touch the
// browser latches scroll-intent at touchstart, so once the drag moves it
// scrolls the grid and fires pointercancel, killing the armed selection. The
// only cure is a NON-PASSIVE touchmove that preventDefaults — but ONLY once
// the long-press has armed, so a quick drag still scrolls (that scroll is
// sacred). This has no e2e coverage (Playwright cannot drive a touch drag —
// see the desktopOnly guard in leavewar.spec.ts), which is how it broke
// silently; this pins the exact on/off condition.
describe('wireSelect touch scroll-lock', () => {
  let wrap: HTMLElement, cell: HTMLElement, teardown: () => void
  const origEFP = document.elementFromPoint
  beforeEach(() => {
    vi.useFakeTimers()
    // jsdom has no layout, so the gesture's hit-test finds nothing; a null
    // focus just paints no rectangle, which is all this test needs.
    document.elementFromPoint = () => null
    wrap = document.createElement('div')
    cell = document.createElement('div')
    cell.setAttribute('data-testid', 'cell-ramp-2026-01-06')
    wrap.appendChild(cell)
    document.body.appendChild(wrap)
    teardown = wireSelect(wrap, {
      order: () => ['ramp'], dates: () => ['2026-01-06'],
      enabled: () => true, onSelect: () => {},
    })
  })
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; vi.useRealTimers() })

  const press = () => cell.dispatchEvent(new PointerEvent('pointerdown',
    { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 5, clientY: 5, button: 0 }))
  // Was the grid's scroll left alone? A touchmove whose default is NOT
  // prevented lets the browser scroll; one that IS prevented locks it.
  const touchmovePrevented = () => {
    const ev = new TouchEvent('touchmove', { bubbles: true, cancelable: true })
    wrap.dispatchEvent(ev)
    return ev.defaultPrevented
  }

  it('leaves a touchmove alone before the hold arms — the sideways scroll survives', () => {
    press()
    expect(touchmovePrevented()).toBe(false)
  })

  it('locks the scroll once the 180ms hold has armed — the drag can select a range', () => {
    press()
    vi.advanceTimersByTime(200)   // past HOLD → arm() fires with no movement
    expect(touchmovePrevented()).toBe(true)
  })
})

// The SLOW-ARM rescue (owner, 27 Aug 26 — "when I try to hold then drag … I
// can't select a date range, I'm stuck with just adding 1 input", again, on
// rows other than his own). The still-hold arms at 180ms only if the finger
// barely moved; a phone user rarely pauses a clean beat before dragging, so a
// drag begun a touch early crossed the slop before arming and was thrown away
// as a scroll. Now a finger down past SLOWARM(140ms) that then crosses the slop
// arms the select anyway — a slow, deliberate drag — while a quick flick, which
// crosses the slop long before 140ms, still cedes to the sacred sideways
// scroll. Driven here with fake timers, which is the whole point of the
// timer-flag design (an elapsed-time read off event timeStamps is not
// deterministic in jsdom).
describe('wireSelect slow-arm rescues a drag begun without a pause', () => {
  let wrap: HTMLElement, cell: HTMLElement, teardown: () => void
  const origEFP = document.elementFromPoint
  beforeEach(() => {
    vi.useFakeTimers()
    document.elementFromPoint = () => null
    wrap = document.createElement('div')
    cell = document.createElement('div')
    cell.setAttribute('data-testid', 'cell-ramp-2026-01-06')
    wrap.appendChild(cell)
    document.body.appendChild(wrap)
    teardown = wireSelect(wrap, {
      order: () => ['ramp'], dates: () => ['2026-01-06'],
      enabled: () => true, onSelect: () => {},
    })
  })
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; vi.useRealTimers() })

  const press = () => cell.dispatchEvent(new PointerEvent('pointerdown',
    { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 5, clientY: 5, button: 0 }))
  const move = (x: number, y: number) => window.dispatchEvent(new PointerEvent('pointermove',
    { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: x, clientY: y }))
  const touchmovePrevented = () => {
    const ev = new TouchEvent('touchmove', { bubbles: true, cancelable: true })
    wrap.dispatchEvent(ev)
    return ev.defaultPrevented
  }

  it('a quick cross of the slop cedes — even the later still-hold no longer arms', () => {
    press()
    move(40, 5)                    // 35px > GIVEUP, before SLOWARM → a flick → cede
    vi.advanceTimersByTime(400)    // would have armed at 180 had it not torn down
    expect(touchmovePrevented()).toBe(false)   // never armed: the scroll kept it
  })

  it('a slow cross of the slop arms the select before the full still-hold', () => {
    press()
    vi.advanceTimersByTime(150)    // past SLOWARM(140), still under HOLD(180)
    move(40, 5)                    // now a slide reads as a deliberate drag → arm
    expect(touchmovePrevented()).toBe(true)    // armed: the scroll is now locked
    expect(wrap.classList.contains('selecting')).toBe(true)   // and the grab shows
  })
})

// Edge auto-scroll runs when a drag reaches an edge, so a selection can extend
// past what the screen shows — SIDEWAYS onto more days (moves the wrap) and
// UP/DOWN onto more people (moves the page). It runs for a mouse AND a finger
// (owner, 30 Aug 26 — "auto scroll to the edge to continue selecting more grids"
// → "up down scroller too"); touch RAMPS its speed by how deep the finger sits
// in the edge band, the fix for the 27 Aug "columns slid away under the finger"
// feel that had it turned off for touch. A spy on requestAnimationFrame reads
// whether it started, and driving one captured frame reads the ramp on each axis.
describe('wireSelect edge auto-scroll (mouse and touch, both axes)', () => {
  let outer: HTMLElement, wrap: HTMLElement, cell: HTMLElement, teardown: () => void
  let rafSpy: ReturnType<typeof vi.spyOn>
  let sl: number, st: number      // backing fields for scrollLeft (wrap) / scrollTop (page)
  const origEFP = document.elementFromPoint
  const rect = (o: Partial<DOMRect>) => ({ left: 0, right: 300, top: 0, bottom: 400, width: 300, height: 400, x: 0, y: 0, toJSON() {}, ...o }) as DOMRect
  beforeEach(() => {
    document.elementFromPoint = () => null
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1 as unknown as number)
    // The vertical scroller is an ancestor here (findVScroll picks the nearest
    // overflow-y:auto ancestor whose content overflows), standing in for the
    // page. jsdom moves neither scrollLeft nor scrollTop on its own, so back
    // both with plain fields the `+=` in edgeScroll can actually change.
    outer = document.createElement('div')
    outer.style.overflowY = 'auto'
    Object.defineProperty(outer, 'scrollHeight', { configurable: true, value: 2000 })
    Object.defineProperty(outer, 'clientHeight', { configurable: true, value: 400 })
    st = 0
    Object.defineProperty(outer, 'scrollTop', { configurable: true, get: () => st, set: v => { st = v } })
    outer.getBoundingClientRect = () => rect({})
    wrap = document.createElement('div')
    cell = document.createElement('div')
    cell.setAttribute('data-testid', 'cell-ramp-2026-01-06')
    wrap.appendChild(cell)
    outer.appendChild(wrap)
    document.body.appendChild(outer)
    sl = 0
    Object.defineProperty(wrap, 'scrollLeft', { configurable: true, get: () => sl, set: v => { sl = v } })
    wrap.getBoundingClientRect = () => rect({})
    teardown = wireSelect(wrap, {
      order: () => ['ramp'], dates: () => ['2026-01-06'],
      enabled: () => true, onSelect: () => {},
    })
  })
  afterEach(() => { teardown(); outer.remove(); document.elementFromPoint = origEFP; rafSpy.mockRestore(); vi.useRealTimers() })

  it('a mouse drag starts it (desktop keeps selecting past the edge)', () => {
    cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: 5, clientY: 200, button: 0 }))
    window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: 12, clientY: 200 }))  // > MOUSE_SLOP → arm
    expect(rafSpy).toHaveBeenCalled()
  })

  // Arm a touch drag and hand back the captured rAF callback, so a test can
  // drive one frame at a chosen finger position and read how far each axis moved.
  const armTouchFrame = () => {
    let cb: FrameRequestCallback | null = null
    rafSpy.mockImplementation((fn: FrameRequestCallback) => { cb = fn; return 1 as unknown as number })
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 5, clientY: 200, button: 0 }))
    vi.advanceTimersByTime(200)   // hold → arm, which schedules the first frame
    expect(cb).not.toBeNull()
    return () => cb!(0)
  }
  const move = (x: number, y: number) =>
    window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: x, clientY: y }))

  it('a touch drag scrolls SIDEWAYS at the right edge and ramps by depth', () => {
    const frame = armTouchFrame()
    move(299, 200); sl = 0; frame(); const deep = sl        // deep in the 48px band
    expect(deep).toBeGreaterThan(0)
    move(260, 200); sl = 0; frame(); const shallow = sl     // just inside the lip (252)
    expect(shallow).toBeGreaterThan(0)
    expect(shallow).toBeLessThan(deep)                      // less push, less scroll
  })

  it('a touch drag scrolls UP/DOWN at the bottom edge and ramps by depth', () => {
    const frame = armTouchFrame()
    move(150, 399); st = 0; frame(); const deep = st        // deep in the bottom band
    expect(deep).toBeGreaterThan(0)
    move(150, 360); st = 0; frame(); const shallow = st     // just inside the lip (352)
    expect(shallow).toBeGreaterThan(0)
    expect(shallow).toBeLessThan(deep)
  })
})

// When the finger leaves every cell — a gap, or the empty area an edge
// auto-scroll runs the grid past — the selection HOLDS the last cell it was
// over instead of collapsing back to the anchor. Without this a drag to the
// bottom edge vanished the instant the auto-scroll ran the last row above the
// finger (owner, 30 Aug 26 "up down scroller too").
describe('wireSelect holds the last focus when the finger leaves the grid', () => {
  let wrap: HTMLElement, teardown: () => void
  const origEFP = document.elementFromPoint
  const cellEls: Record<string, HTMLElement> = {}
  beforeEach(() => {
    vi.useFakeTimers()
    wrap = document.createElement('div')
    for (const [id, y] of [['a', 50], ['b', 150], ['c', 250]] as const) {
      const el = document.createElement('div')
      el.setAttribute('data-testid', `cell-${id}-2026-01-06`)
      wrap.appendChild(el); cellEls[id] = el
    }
    document.body.appendChild(wrap)
    // map a clientY band to a cell; below the grid (y >= 300) is empty → null
    document.elementFromPoint = ((_x: number, y: number) =>
      y < 100 ? cellEls.a : y < 200 ? cellEls.b : y < 300 ? cellEls.c : null) as typeof document.elementFromPoint
    teardown = wireSelect(wrap, {
      order: () => ['a', 'b', 'c'], dates: () => ['2026-01-06'],
      enabled: () => true, onSelect: () => {},
    })
  })
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; vi.useRealTimers() })

  const painted = () => wrap.querySelectorAll('.selcell').length

  it('keeps the span reached when the finger drops off the grid, not just the anchor', () => {
    wrap.querySelector('[data-testid="cell-a-2026-01-06"]')!
      .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 10, clientY: 50, button: 0 }))
    vi.advanceTimersByTime(200)   // hold → arm
    window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 10, clientY: 250 }))  // over cell c
    expect(painted()).toBe(3)     // a, b, c
    window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 10, clientY: 500 }))  // below the grid → no cell
    expect(painted(), 'the a–c span holds instead of collapsing to a').toBe(3)
  })
})

// A member scoped to one person has a one-row `order()`; the grid still RENDERS
// every row, so a drag straying onto another person's cell (or an edge scroll
// running one under the pointer) hands `current()` a focus outside the order.
// It must clamp to the anchor's row — a valid selection the fill then writes to
// the own row — never resolve to an empty rectangle (which left the select
// sheet unopened, so a scoped member could not drag-fill at all).
describe('wireSelect clamps a focus outside the scoped order to the anchor row', () => {
  let wrap: HTMLElement, teardown: () => void
  const origEFP = document.elementFromPoint
  const cellEls: Record<string, HTMLElement> = {}
  const selections: Selection[] = []
  beforeEach(() => {
    vi.useFakeTimers()
    selections.length = 0
    wrap = document.createElement('div')
    for (const [id, y] of [['a', 50], ['b', 150]] as const) {
      const el = document.createElement('div')
      el.setAttribute('data-testid', `cell-${id}-2026-01-06`)
      wrap.appendChild(el); cellEls[id] = el
    }
    document.body.appendChild(wrap)
    document.elementFromPoint = ((_x: number, y: number) =>
      y < 100 ? cellEls.a : y < 200 ? cellEls.b : null) as typeof document.elementFromPoint
    teardown = wireSelect(wrap, {
      // scoped: only 'a' is selectable, though 'b' is on screen
      order: () => ['a'], dates: () => ['2026-01-06'],
      enabled: () => true, onSelect: s => selections.push(s),
    })
  })
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; vi.useRealTimers() })

  it('paints and commits the anchor row when the drag strays onto an unlisted person', () => {
    wrap.querySelector('[data-testid="cell-a-2026-01-06"]')!
      .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 10, clientY: 50, button: 0 }))
    vi.advanceTimersByTime(200)   // hold → arm
    // stray down onto b (not in the scoped order)
    window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 10, clientY: 150 }))
    expect(wrap.querySelectorAll('.selcell').length, 'clamps to a — not an empty rect').toBe(1)
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 10, clientY: 150, button: 0 }))
    // the sheet opens: onSelect fired, covering the anchor's own row only
    expect(selections).toHaveLength(1)
    expect(selections[0].people).toEqual(['a'])
  })
})

// The gesture belongs to ONE pointer (27 Aug 26 overnight pass). A second
// finger brushing the grid used to re-enter onDown and reset the state, so an
// armed selection silently evaporated on lift; and any pointerup — a second
// finger's, or a right button clicked mid-left-drag — committed the rectangle
// at wherever the cursor happened to be.
describe('wireSelect ignores pointers that are not the gesture\'s own', () => {
  let wrap: HTMLElement, cell: HTMLElement, teardown: () => void
  let selections: unknown[]
  const origEFP = document.elementFromPoint
  beforeEach(() => {
    vi.useFakeTimers()
    document.elementFromPoint = () => null
    wrap = document.createElement('div')
    cell = document.createElement('div')
    cell.setAttribute('data-testid', 'cell-ramp-2026-01-06')
    wrap.appendChild(cell)
    document.body.appendChild(wrap)
    selections = []
    teardown = wireSelect(wrap, {
      order: () => ['ramp'], dates: () => ['2026-01-06'],
      enabled: () => true, onSelect: s => selections.push(s),
    })
  })
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; vi.useRealTimers() })

  const touchmovePrevented = () => {
    const ev = new TouchEvent('touchmove', { bubbles: true, cancelable: true })
    wrap.dispatchEvent(ev)
    return ev.defaultPrevented
  }

  it('a second finger landing and lifting mid-drag neither disarms nor commits', () => {
    cell.dispatchEvent(new PointerEvent('pointerdown',
      { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 5, clientY: 5, button: 0 }))
    vi.advanceTimersByTime(200)              // hold → armed
    expect(touchmovePrevented()).toBe(true)
    cell.dispatchEvent(new PointerEvent('pointerdown',
      { bubbles: true, pointerId: 2, pointerType: 'touch', clientX: 60, clientY: 40, button: 0 }))
    window.dispatchEvent(new PointerEvent('pointerup',
      { bubbles: true, pointerId: 2, pointerType: 'touch', button: 0 }))
    expect(touchmovePrevented()).toBe(true)  // the drag is still live
    expect(selections).toHaveLength(0)       // and nothing committed
    // the OWNING finger's lift commits exactly once
    window.dispatchEvent(new PointerEvent('pointerup',
      { bubbles: true, pointerId: 1, pointerType: 'touch', button: 0 }))
    expect(selections).toHaveLength(1)
  })

  it('a right-button release mid-left-drag does not commit; the left release still does', () => {
    cell.dispatchEvent(new PointerEvent('pointerdown',
      { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: 5, clientY: 5, button: 0 }))
    window.dispatchEvent(new PointerEvent('pointermove',
      { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: 15, clientY: 5 }))  // > MOUSE_SLOP → armed
    window.dispatchEvent(new PointerEvent('pointerup',
      { bubbles: true, pointerId: 1, pointerType: 'mouse', button: 2 }))   // chorded right release
    expect(selections).toHaveLength(0)
    window.dispatchEvent(new PointerEvent('pointerup',
      { bubbles: true, pointerId: 1, pointerType: 'mouse', button: 0 }))
    expect(selections).toHaveLength(1)
  })
})

// ROW SELECT (the OIL tracker — owner, 2 Sep 26: "drag to select should also
// be enabled on the mobile, use the same mechanics as the leave war grid").
// The same gesture core drives it, so the same on/off conditions hold: a
// mouse arms on a 4px move, a finger on the 180ms hold or the slow-arm
// rescue, and a quick flick cedes. What differs is WHAT is hit: only a
// row's pick target starts a drag (the history strip beside it keeps its
// sideways scroll), and the selection is the run of rows between anchor and
// focus in the given order.
describe('rowRun', () => {
  const order = ['a', 'b', 'c', 'd']
  it('is the run between two ids whichever way you drag', () => {
    expect(rowRun(order, 'b', 'd')).toEqual(['b', 'c', 'd'])
    expect(rowRun(order, 'd', 'b')).toEqual(['b', 'c', 'd'])
    expect(rowRun(order, 'c', 'c')).toEqual(['c'])
  })
  it('is null off the order', () => {
    expect(rowRun(order, 'a', 'zz')).toBeNull()
  })
})

describe('wireRowSelect', () => {
  let wrap: HTMLElement, rows: HTMLElement[], picks: HTMLElement[], teardown: () => void, got: string[][]
  const origEFP = document.elementFromPoint
  beforeEach(() => {
    vi.useFakeTimers()
    got = []
    wrap = document.createElement('div')
    rows = []; picks = []
    for (const id of ['a', 'b', 'c']) {
      const r = document.createElement('div')
      r.setAttribute('data-oilrow', id)
      const p = document.createElement('div')
      p.setAttribute('data-oilpick', '')
      const strip = document.createElement('div')
      strip.className = 'strip'
      r.appendChild(p); r.appendChild(strip)
      wrap.appendChild(r); rows.push(r); picks.push(p)
    }
    document.body.appendChild(wrap)
    // jsdom has no layout: the hit-test answers by the y the test chooses —
    // row a at y<100, b at 100..199, c at 200+.
    document.elementFromPoint = (_x: number, y: number) => rows[Math.min(2, Math.max(0, Math.floor(y / 100)))]!
    teardown = wireRowSelect(wrap, { order: () => ['a', 'b', 'c'], enabled: () => true, onSelect: ids => { got.push(ids) } })
  })
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; vi.useRealTimers() })

  const down = (el: HTMLElement, type: 'mouse' | 'touch', y = 50) => el.dispatchEvent(new PointerEvent('pointerdown',
    { bubbles: true, pointerId: 1, pointerType: type, clientX: 5, clientY: y, button: 0 }))
  const move = (type: 'mouse' | 'touch', y: number) => window.dispatchEvent(new PointerEvent('pointermove',
    { bubbles: true, pointerId: 1, pointerType: type, clientX: 5, clientY: y }))
  const up = () => window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, button: 0 }))
  const touchmovePrevented = () => {
    const ev = new TouchEvent('touchmove', { bubbles: true, cancelable: true })
    wrap.dispatchEvent(ev)
    return ev.defaultPrevented
  }

  it('a mouse drag down the names selects the run and paints it', () => {
    down(picks[0]!, 'mouse')
    move('mouse', 250)
    expect(rows.map(r => r.classList.contains('selrow'))).toEqual([true, true, true])
    expect(wrap.classList.contains('selecting')).toBe(true)
    up()
    expect(got).toEqual([['a', 'b', 'c']])
    expect(rows.some(r => r.classList.contains('selrow'))).toBe(false)
  })

  it('a press on the history strip starts nothing — that strip scrolls', () => {
    down(rows[0]!.querySelector('.strip') as HTMLElement, 'mouse')
    move('mouse', 250)
    up()
    expect(got).toEqual([])
  })

  it('a finger must hold 180ms before the scroll locks; a quick flick cedes', () => {
    down(picks[0]!, 'touch')
    expect(touchmovePrevented()).toBe(false)
    move('touch', 90)                // 40px, before SLOWARM → a flick → cede
    vi.advanceTimersByTime(400)
    expect(touchmovePrevented()).toBe(false)
    up()
    expect(got).toEqual([])
  })

  it('a held finger arms, then a drag selects the run', () => {
    down(picks[1]!, 'touch', 150)
    vi.advanceTimersByTime(200)      // past HOLD → armed with no movement
    expect(touchmovePrevented()).toBe(true)
    move('touch', 250)
    up()
    expect(got).toEqual([['b', 'c']])
  })

  it('an un-armed tap is left to the row\'s own click', () => {
    down(picks[2]!, 'mouse', 250)
    up()
    expect(got).toEqual([])
    expect(wrap.classList.contains('selecting')).toBe(false)
  })
})
