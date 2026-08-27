import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearLanding, earliestDate, paintLanding, parseCellId, rectCells, wireSelect } from './select'

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

// Edge auto-scroll runs the grid sideways when a MOUSE drag reaches a wrap
// edge, so a desktop selection can extend past the visible columns. On a phone
// it made the day columns slide away under the finger (owner, 27 Aug 26 — "the
// calendar also follows my drag … only for phone"), so a touch drag must never
// start it. arm() schedules the scroll via requestAnimationFrame, so a spy on
// rAF reads exactly whether it was started.
describe('wireSelect edge auto-scroll is desktop-only', () => {
  let wrap: HTMLElement, cell: HTMLElement, teardown: () => void
  let rafSpy: ReturnType<typeof vi.spyOn>
  const origEFP = document.elementFromPoint
  beforeEach(() => {
    document.elementFromPoint = () => null
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1 as unknown as number)
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
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; rafSpy.mockRestore(); vi.useRealTimers() })

  it('a mouse drag starts it (desktop keeps selecting past the edge)', () => {
    cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: 5, clientY: 5, button: 0 }))
    window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: 12, clientY: 5 }))  // > MOUSE_SLOP → arm
    expect(rafSpy).toHaveBeenCalled()
  })

  it('a touch drag never starts it — the phone grid stays put under the finger', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })   // leave rAF real so the spy still reads it
    cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 5, clientY: 5, button: 0 }))
    vi.advanceTimersByTime(200)   // hold → arm
    expect(rafSpy).not.toHaveBeenCalled()
  })
})
