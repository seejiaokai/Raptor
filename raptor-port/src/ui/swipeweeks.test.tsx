// @vitest-environment jsdom
/* CONTINUOUS SWIPE ACROSS WEEKS on the view/edit carousel (owner, 22 Aug 26).
   The phone week is a scroll-snap carousel; swiping OFF the last day (pinned at
   the right edge) loads the next week and lands on Monday, and off the first day
   loads the previous week and lands on Sunday. jsdom has no layout, so the
   week's scroll metrics are stubbed to place it at an edge; the real geometry is
   the geometry gate's job. */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, loadWeek } from '../state/store'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement

/* place the week element at a known scroll geometry: 7 day-columns of 400px in
   a 400px viewport, so max scroll is 2400. `at` sets scrollLeft directly, which
   the edge tests use to sit the week at the padding-inset resting positions a
   real phone parks on (~12px in from 0/max), not just at an exact 0/2400. */
const stubWeek = (at: number | boolean) => {
  const w = $('#vWeek')
  Object.defineProperty(w, 'scrollWidth', { value: 2800, configurable: true })
  Object.defineProperty(w, 'clientWidth', { value: 400, configurable: true })
  w.scrollLeft = typeof at === 'number' ? at : (at ? 2400 : 0)
  return w
}

const touch = async (
  el: Element,
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  x: number,
  y = 200,
) => {
  const ev = new Event(type, { bubbles: true })
  const pt = [{ clientX: x, clientY: y }]
  ;(ev as any).touches = type === 'touchend' || type === 'touchcancel' ? [] : pt
  ;(ev as any).changedTouches = pt
  await act(async () => { el.dispatchEvent(ev) })
}

let host: HTMLDivElement
let root: Root

beforeAll(async () => {
  initStore()
  Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true, writable: true })
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await act(async () => { view.setPage('viewsched'); notify() })
})

/* Unmount before the file ends: a render task left queued by the last test
   would otherwise fire after vitest tears jsdom down and die with "window is
   not defined" — an unhandled error that fails the job while every test
   passed (the teardown race closed across the suite, 10 Sep 26). */
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

afterEach(async () => {
  vi.restoreAllMocks()
  if (CURWEEK !== '13/07/2026') await act(async () => { loadWeek('13/07/2026') })
})

describe('swiping off the last day loads the next week at Monday', () => {
  it('a left swipe pinned at the right edge advances a week and lands on day 0', async () => {
    const w = stubWeek(true)                       // sitting on Sunday
    await touch(w, 'touchstart', 300)
    await touch(w, 'touchend', 200)                // finger moved left 100px > threshold
    expect(CURWEEK, 'the following week loaded').toBe('20/07/2026')
    expect(DAYS[0].dt, 'and it is the authored second week').toBe('Jul 20')
    expect(view.WEEKJUMP, 'the landing flag was consumed by the repaint').toBe(null)
    expect(w.scrollLeft, 'scrolled to Monday, not held on the old Sunday').toBe(0)
  })
})

describe('swiping off the first day loads the previous week at Sunday', () => {
  it('a right swipe pinned at the left edge steps back a week and lands on day 6', async () => {
    const w = stubWeek(false)                      // sitting on Monday
    await touch(w, 'touchstart', 200)
    await touch(w, 'touchend', 300)                // finger moved right 100px > threshold
    expect(CURWEEK, 'the previous week loaded').toBe('06/07/2026')
    expect(view.WEEKJUMP).toBe(null)
    expect(w.scrollLeft, 'scrolled to the last day (max)').toBe(2400)
  })
})

describe('the end days rest a padding-inset in from 0/max, not exactly on it', () => {
  /* the real bug: `.week` has 12px side padding + a 12px gap and no
     scroll-padding, so scroll-snap parks Monday ~12px in from 0 and Sunday a
     hair short of max. The old 1px edge test read those as "mid-week", so the
     back-swipe never fired (13→12 Jul) and the forward one was flaky. */
  it('a right swipe from the inset left edge still steps back a week', async () => {
    stubWeek(12)                                   // sitting on Monday, snapped 12px in
    const w = $('#vWeek')
    await touch(w, 'touchstart', 200)
    await touch(w, 'touchend', 300)
    expect(CURWEEK, 'the previous week loaded despite the 12px inset').toBe('06/07/2026')
  })

  it('a left swipe from the inset right edge still advances a week', async () => {
    stubWeek(2390)                                 // sitting on Sunday, 10px short of max
    const w = $('#vWeek')
    await touch(w, 'touchstart', 300)
    await touch(w, 'touchend', 200)
    expect(CURWEEK, 'the following week loaded despite the sub-max rest').toBe('20/07/2026')
  })
})

describe('a swipe the browser cancels mid-gesture still crosses', () => {
  /* an overswipe with any scroll room left is claimed as a scroll and ends in
     touchcancel, not touchend — the wiring must treat it the same. */
  it('touchcancel at the right edge advances a week', async () => {
    const w = stubWeek(true)
    await touch(w, 'touchstart', 300)
    await touch(w, 'touchmove', 220)
    await touch(w, 'touchcancel', 200)
    expect(CURWEEK, 'a cancelled overswipe crossed').toBe('20/07/2026')
  })
})

describe('a wave-dense day does not trap the week swipe', () => {
  /* the owner bug (23 Aug 26 — "stuck to swipe back from Jul 20"): a flying day
     is almost entirely `.go` wave blocks, and the old handler ceded the whole
     gesture to a `.go` the instant a touch began inside one, so the week-cross
     never armed. A block already at its own edge (jsdom never scrolls it) must
     let the swipe fall through to the week. */
  const aGo = () => {
    const g = $('#vWeek .go')
    expect(g, 'the seed week renders at least one wave block to swipe on').toBeTruthy()
    return g
  }

  it('a right swipe begun on a wave block at the left edge still steps back a week', async () => {
    stubWeek(12)                                   // sitting on Monday, snapped 12px in
    const g = aGo()
    await touch(g, 'touchstart', 200)              // finger lands ON a wave block
    await touch(g, 'touchend', 300)                // and swipes right past threshold
    expect(CURWEEK, 'the wave block did not eat the back-swipe').toBe('06/07/2026')
  })

  it('a left swipe begun on a wave block at the right edge still advances a week', async () => {
    stubWeek(2390)                                 // sitting on Sunday
    const g = aGo()
    await touch(g, 'touchstart', 300)
    await touch(g, 'touchend', 200)
    expect(CURWEEK, 'the wave block did not eat the forward swipe').toBe('20/07/2026')
  })

  it('but a wave block that actually scrolled keeps the gesture — no cross', async () => {
    stubWeek(12)                                   // on Monday, at the week edge
    const g = aGo()
    await touch(g, 'touchstart', 200)
    g.scrollLeft = 60                              // the wave consumed the drag itself
    await touch(g, 'touchend', 300)
    expect(CURWEEK, 'a wave the finger actually scrolled owns the swipe').toBe('13/07/2026')
  })
})

describe('a vertical-dominant drag at an edge does not cross', () => {
  it('a mostly-downward drag that drifts sideways is not a week swipe', async () => {
    const w = stubWeek(true)
    await touch(w, 'touchstart', 300, 100)
    await touch(w, 'touchend', 240, 400)           // dx −60 but dy +300 dominates
    expect(CURWEEK, 'stayed on the seed week').toBe('13/07/2026')
  })
})

describe('an ordinary within-week swipe does not cross', () => {
  it('a swipe that did not begin pinned at an edge leaves the week alone', async () => {
    const w = $('#vWeek')
    Object.defineProperty(w, 'scrollWidth', { value: 2800, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 400, configurable: true })
    w.scrollLeft = 800                             // mid-week, not at either edge
    await touch(w, 'touchstart', 300)
    await touch(w, 'touchend', 150)                // a big left swipe, but not from an edge
    expect(CURWEEK, 'still the seed week — no crossing').toBe('13/07/2026')
  })

  it('a tiny jiggle at the edge is under the threshold and does not cross', async () => {
    const w = stubWeek(true)
    await touch(w, 'touchstart', 300)
    await touch(w, 'touchend', 280)                // only 20px < 45px threshold
    expect(CURWEEK).toBe('13/07/2026')
  })
})

/* [WEEK-SWIPE-CROSS] — his iPhone recording, 3 Nov 26: "Sometimes it doesn't allow me to go to the next week. Like Monday
   to Sunday." On Monday, swipe after swipe only bounced the day. Three ways a swipe off an end day was read as no swipe
   at all, each where the browser itself had plainly moved the day sideways (the real browser's proof:
   e2e/weekswipe.spec.ts). `Date.now` is held still and stepped by hand, so a finger's speed is the test's to set. */
describe('a swipe off an end day that the old reading missed', () => {
  let clock = 1_000_000
  const at = (t: number) => { clock = t; vi.spyOn(Date, 'now').mockImplementation(() => clock) }
  const scrolled = async (w: HTMLElement, x: number) => { w.scrollLeft = x; await act(async () => { w.dispatchEvent(new Event('scroll', { bubbles: false })) }) }

  it('a second swipe begun while the week is still settling onto Monday crosses', async () => {
    const w = stubWeek(400)                        // on Tuesday …
    at(1_000_000)
    await scrolled(w, 300)                         // … the strip on its way back to Monday after the last swipe
    at(1_000_030); await scrolled(w, 150)
    at(1_000_060)
    await touch(w, 'touchstart', 100)              // the finger lands with Monday still 150px off
    at(1_000_080); await touch(w, 'touchmove', 160)
    at(1_000_110); await touch(w, 'touchend', 220)
    expect(CURWEEK, 'the swipe crossed into the previous week').toBe('06/07/2026')
  })

  it('but a week at rest half a day out, or one moving away from Monday, is no edge', async () => {
    const w = stubWeek(400)
    at(1_000_000); await scrolled(w, 300); await scrolled(w, 150)
    at(1_000_900)                                  // long at rest since
    await touch(w, 'touchstart', 100); await touch(w, 'touchmove', 160); await touch(w, 'touchend', 220)
    expect(CURWEEK, 'a week at rest between days is not at its edge').toBe('13/07/2026')
    at(1_001_000); await scrolled(w, 100)
    at(1_001_030); await scrolled(w, 150)          // moving AWAY from Monday
    at(1_001_050)
    await touch(w, 'touchstart', 100); await touch(w, 'touchmove', 160); await touch(w, 'touchend', 220)
    expect(CURWEEK, 'a week heading for Tuesday is not at its edge').toBe('13/07/2026')
  })

  /* the walk's A6b (3 Nov 26, 4 of 24 runs): the first swipe left the strip STANDING 127px short of Monday — the browser had
     not begun its snap for 160ms and more — so the second swipe began on no edge and no movement, and only carried the strip
     on to Monday. Its own travel decides now, whatever the snap's timing: enough to bring Monday to its resting place and go
     on by the crossing distance. Replayed from the walk's trace (A6-chromium-nocross-trace-1.json). */
  it('a week left standing short of Monday crosses when the swipe carries it back to Monday and on past it', async () => {
    const w = stubWeek(127)
    at(1_000_000); await scrolled(w, 200); await scrolled(w, 127)
    at(1_000_300)                                  // standing still for 300ms — no snap under way
    await touch(w, 'touchstart', 80)
    for (const [t, x] of [[1_000_332, 105], [1_000_366, 130], [1_000_383, 155], [1_000_400, 180], [1_000_417, 205], [1_000_432, 230]]) { at(t!); await touch(w, 'touchmove', x!) }
    await touch(w, 'touchend', 230)                // 150px: 103 to bring Monday home, 47 on past it
    expect(CURWEEK, 'the swipe crossed into the previous week').toBe('06/07/2026')
  })

  it('and a slow drag from there does too, by distance alone — but not one that only brings Monday home', async () => {
    const w = stubWeek(127)
    at(1_000_000); await scrolled(w, 200); await scrolled(w, 127)
    at(1_000_300); await touch(w, 'touchstart', 60)
    at(1_000_700); await touch(w, 'touchmove', 220)
    at(1_001_000); await touch(w, 'touchend', 220) // 160px, held still before the lift
    expect(CURWEEK, 'a 160px drag from 127px out crossed').toBe('06/07/2026')
    await act(async () => { loadWeek('13/07/2026') })
    const w2 = stubWeek(127)
    at(1_002_000); await scrolled(w2, 200); await scrolled(w2, 127)
    at(1_002_300); await touch(w2, 'touchstart', 60)
    at(1_002_700); await touch(w2, 'touchmove', 170)
    at(1_003_000); await touch(w2, 'touchend', 170) // 110px: Monday home and only 7px on
    expect(CURWEEK, 'a drag that only brings Monday home stays on the week').toBe('13/07/2026')
  })

  it('a swipe begun more than half a day from Monday never crosses, however far it goes', async () => {
    const w = stubWeek(260)
    at(1_000_000); await touch(w, 'touchstart', 20)
    at(1_000_400); await touch(w, 'touchmove', 380)
    at(1_000_700); await touch(w, 'touchend', 380)
    expect(CURWEEK, 'a long swipe from Tuesday side of the middle').toBe('13/07/2026')
  })

  it('a short quick flick off Monday crosses, as a short quick flick inside the week moves a day', async () => {
    const w = stubWeek(12)
    at(1_000_000); await touch(w, 'touchstart', 200)
    at(1_000_015); await touch(w, 'touchmove', 212)
    at(1_000_030); await touch(w, 'touchmove', 226)
    at(1_000_040); await touch(w, 'touchend', 232)  // 32px in 40ms — lifted moving
    expect(CURWEEK, 'the flick crossed into the previous week').toBe('06/07/2026')
  })

  it('a short slow drag, a finger that rests before it lifts, and a tiny quick jiggle do not', async () => {
    const w = stubWeek(12)
    at(1_000_000); await touch(w, 'touchstart', 200)
    at(1_000_200); await touch(w, 'touchmove', 216)
    at(1_000_400); await touch(w, 'touchmove', 232)
    at(1_000_420); await touch(w, 'touchend', 232)
    expect(CURWEEK, 'a slow 32px drag').toBe('13/07/2026')
    at(1_001_000); await touch(w, 'touchstart', 200)
    at(1_001_015); await touch(w, 'touchmove', 220)
    at(1_001_030); await touch(w, 'touchmove', 234)
    at(1_001_300); await touch(w, 'touchend', 234)  // quick, but held still a quarter second before the lift
    expect(CURWEEK, 'a flick that stopped before it lifted').toBe('13/07/2026')
    at(1_002_000); await touch(w, 'touchstart', 200)
    at(1_002_010); await touch(w, 'touchmove', 212)
    at(1_002_020); await touch(w, 'touchend', 216)  // 16px: a finger's jiggle on a tap, however quick
    expect(CURWEEK, 'a 16px jiggle').toBe('13/07/2026')
  })

  it("a thumb's arc whose first movement is sideways crosses, though it drops further than it travels", async () => {
    const w = stubWeek(12)
    await touch(w, 'touchstart', 100, 380)
    for (const [x, y] of [[114, 381], [128, 384], [140, 392], [150, 404], [158, 418], [164, 434], [168, 448]]) await touch(w, 'touchmove', x!, y!)
    await touch(w, 'touchend', 170, 460)            // 70 across, 80 down
    expect(CURWEEK, 'the arc crossed into the previous week').toBe('06/07/2026')
  })

  /* the fresh read's finding 4 (3 Nov 26): a thumb scrolling the page down whose first 10px slant sideways was read as a
     sideways swipe, and its drift crossed the week — though the browser had taken it as a page scroll (on the phone weeks
     the document is the one thing that scrolls up and down). The page moving is the browser's own answer, and wins. */
  it("a page scroll whose first movement slants sideways never crosses — the page moved, so it was the page's", async () => {
    const w = stubWeek(12)
    const was = window.scrollY
    try {
      await touch(w, 'touchstart', 100, 600)
      for (const [x, y, sy] of [[111, 594, 0], [125, 580, 20], [140, 560, 60], [152, 540, 100], [160, 520, 140]]) {
        Object.defineProperty(window, 'scrollY', { value: sy, configurable: true, writable: true })
        await touch(w, 'touchmove', x!, y!)
      }
      await touch(w, 'touchend', 160, 520)          // 60 across, the page scrolled 140 down
      expect(CURWEEK, 'stayed on the seed week').toBe('13/07/2026')
    } finally { Object.defineProperty(window, 'scrollY', { value: was, configurable: true, writable: true }) }
  })

  it('a drag whose first movement is down the day never crosses, whatever its sideways drift', async () => {
    const w = stubWeek(12)
    await touch(w, 'touchstart', 100, 300)
    for (const [x, y] of [[102, 316], [106, 336], [130, 350], [170, 360], [210, 366]]) await touch(w, 'touchmove', x!, y!)
    await touch(w, 'touchend', 220, 368)            // 120 across, 68 down — but it began as the page being scrolled
    expect(CURWEEK, 'stayed on the seed week').toBe('13/07/2026')
  })
})

/* A SWIPE SAFARI GAVE THE PAGE NO TOUCH FOR ([WEEK-SWIPE-CROSS], his iPhone recordings of 3 Nov 26, 05:41 and 06:00 — read
   by the ?swdebug log): swiping Tuesday → Monday and straight on, Monday stretched and sprang back. The log showed a swipe
   begun while the strip was still gliding into its snap reaching the page as NO touch at all — no start, no move, no end —
   so the touch reading never saw it. Safari still reports the strip pulled past its end (its scrollLeft below 0, or above
   the last day) — so a pull past an end day that began with the strip at rest or easing in there, seen with no touch,
   crosses when the strip springs back. Steps of the strip as Safari reported them; `Date.now` held and stepped by hand. */
describe('a swipe Safari gave the page no touch for', () => {
  let clock = 2_000_000
  const at = (t: number) => { clock = t; vi.spyOn(Date, 'now').mockImplementation(() => clock) }
  const scrolled = async (w: HTMLElement, x: number) => { w.scrollLeft = x; await act(async () => { w.dispatchEvent(new Event('scroll', { bubbles: false })) }) }
  const steps = async (w: HTMLElement, t0: number, pts: [number, number][]) => { for (const [dt, x] of pts) { at(t0 + dt); await scrolled(w, x) } }

  it('Monday easing in, pulled past its edge and springing back, crosses to the previous week', async () => {
    const w = stubWeek(40)
    await steps(w, 2_000_000, [[0, 40], [50, 34], [100, 29]])           // easing onto Monday, slowly
    await steps(w, 2_000_100, [[16, 12], [33, -6], [50, -22], [66, -34]]) // the finger nobody was told of pulls it past
    expect(CURWEEK, 'not while it is still being pulled').toBe('13/07/2026')
    await steps(w, 2_000_100, [[83, -14]])                               // let go: it springs back
    expect(CURWEEK, 'the pull crossed into the previous week').toBe('06/07/2026')
  })

  it('Sunday at rest, pulled past its end and springing back, crosses to the next week', async () => {
    const w = stubWeek(2400)
    await steps(w, 2_100_000, [[0, 2400], [400, 2402], [416, 2414], [433, 2424], [450, 2431], [466, 2412]])
    expect(CURWEEK, 'the pull crossed into the next week').toBe('20/07/2026')
  })

  it('a flick from Tuesday whose own momentum runs past Monday does not cross', async () => {
    const w = stubWeek(414)
    await steps(w, 2_200_000, [[0, 414], [16, 330], [33, 240], [50, 160], [66, 90], [83, 35], [100, -5], [116, -30], [133, -40], [150, -33], [166, -15], [183, 4], [200, 12]])
    expect(CURWEEK, 'the overshoot of a swipe inside the week stays on the week').toBe('13/07/2026')
  })

  it('a pull the page did see, too short to cross, does not cross on its spring-back', async () => {
    const w = stubWeek(12)
    at(2_299_800); await scrolled(w, 12)
    at(2_300_000); await scrolled(w, 12)                                 // at rest on Monday: the reading is set
    at(2_300_400); await touch(w, 'touchstart', 100)
    at(2_300_416); await touch(w, 'touchmove', 115); await scrolled(w, 0)
    at(2_300_433); await touch(w, 'touchmove', 125); await scrolled(w, -14)
    at(2_300_600); await touch(w, 'touchend', 130)                         // 30px and held still: the touch reading says stay
    await steps(w, 2_300_600, [[16, -14], [33, -9], [50, -2], [66, 8], [83, 12]])
    expect(CURWEEK, 'stayed on the seed week').toBe('13/07/2026')
  })

  it('a pull the page did see crosses once, never twice on its spring-back', async () => {
    const w = stubWeek(12)
    at(2_400_000); await scrolled(w, 12)
    at(2_400_400); await touch(w, 'touchstart', 100)
    at(2_400_416); await touch(w, 'touchmove', 140); await scrolled(w, -10)
    at(2_400_433); await touch(w, 'touchmove', 180); await scrolled(w, -25)
    at(2_400_450); await touch(w, 'touchend', 200)
    expect(CURWEEK, 'the touch crossed').toBe('06/07/2026')
    await steps(w, 2_400_450, [[16, -25], [33, -18], [50, -6]])
    expect(CURWEEK, 'and only once').toBe('06/07/2026')
  })
})

describe('a swipe Safari gave the page no touch for — its edges', () => {
  let clock = 3_000_000
  const at = (t: number) => { clock = t; vi.spyOn(Date, 'now').mockImplementation(() => clock) }
  const scrolled = async (w: HTMLElement, x: number) => { w.scrollLeft = x; await act(async () => { w.dispatchEvent(new Event('scroll', { bubbles: false })) }) }
  const steps = async (w: HTMLElement, t0: number, pts: [number, number][]) => { for (const [dt, x] of pts) { at(t0 + dt); await scrolled(w, x) } }

  it('a deep pull held, wobbling a px or two, does not cross until let go', async () => {
    const w = stubWeek(12)
    await steps(w, 3_000_000, [[0, 12], [500, 12]])
    await steps(w, 3_000_500, [[16, 0], [33, -30], [50, -40]])                       // a deep pull, held …
    await steps(w, 3_000_500, [[66, -39], [83, -38]])                                // … wobbling a little: still held
    expect(CURWEEK, 'not while the pull is held, wobbling').toBe('13/07/2026')
    await steps(w, 3_000_500, [[100, -20]])                                         // let go
    expect(CURWEEK, 'crossed when it springs back').toBe('06/07/2026')
  })

  it('a short pull under the mark springs back without crossing, and a deeper one after it crosses', async () => {
    const w = stubWeek(12)
    await steps(w, 3_050_000, [[0, 12], [500, 12]])
    await steps(w, 3_050_500, [[16, 0], [33, -6], [50, -4], [66, 4], [83, 12]])     // a short pull, under the mark
    await steps(w, 3_051_000, [[16, 0], [33, -13], [50, -20]])                       // a second, deeper pull, still held
    expect(CURWEEK, 'not while the second pull is still held').toBe('13/07/2026')
    await steps(w, 3_051_000, [[66, -6]])
    expect(CURWEEK, 'crossed when it springs back').toBe('06/07/2026')
  })

  it('the strip settling just after a cross never counts as a pull', async () => {
    const w = stubWeek(2400)
    at(3_100_000); await touch(w, 'touchstart', 300); await touch(w, 'touchend', 200)   // a swipe off Sunday crosses …
    expect(CURWEEK).toBe('20/07/2026')
    const w2 = stubWeek(2400)
    await steps(w2, 3_100_000, [[16, 2400], [300, 2400], [400, 2415], [450, 2404]])     // … and the landing's own settle
    expect(CURWEEK, 'no second cross').toBe('20/07/2026')
  })
})

describe('a touch whose end Safari never sent', () => {
  let clock = 4_000_000
  const at = (t: number) => { clock = t; vi.spyOn(Date, 'now').mockImplementation(() => clock) }
  const scrolled = async (w: HTMLElement, x: number) => { w.scrollLeft = x; await act(async () => { w.dispatchEvent(new Event('scroll', { bubbles: false })) }) }
  it('does not stop a later pull past Monday from being read', async () => {
    const w = stubWeek(12)
    at(4_000_000); await scrolled(w, 12)
    at(4_000_100); await touch(w, 'touchstart', 100)              // a touch begins … and nothing more of it comes
    for (const [t, x] of [[4_002_000, 12], [4_002_016, 0], [4_002_033, -14], [4_002_050, -24], [4_002_066, -10]] as [number, number][]) { at(t); await scrolled(w, x) }
    expect(CURWEEK, 'the later pull crossed').toBe('06/07/2026')
  })
})

describe('a swipe Safari gave the page no touch for — the fresh read’s cases', () => {
  let clock = 5_000_000
  const at = (t: number) => { clock = t; vi.spyOn(Date, 'now').mockImplementation(() => clock) }
  const scrolled = async (w: HTMLElement, x: number) => { w.scrollLeft = x; await act(async () => { w.dispatchEvent(new Event('scroll', { bubbles: false })) }) }
  const steps = async (w: HTMLElement, t0: number, pts: [number, number][]) => { for (const [dt, x] of pts) { at(t0 + dt); await scrolled(w, x) } }

  it('a flick inside the week with one late frame mid-way does not cross', async () => {
    const w = stubWeek(414)
    await steps(w, 5_000_000, [[0, 414], [50, 380], [66, 180], [176, -28], [192, -36], [208, -30], [224, -20], [240, -5], [256, 8], [272, 12]])
    expect(CURWEEK, 'stayed on the seed week').toBe('13/07/2026')
  })

  it('a pull held past Monday, the finger easing back a few px, does not cross until it is let go', async () => {
    const w = stubWeek(12)
    await steps(w, 5_100_000, [[0, 12], [400, 12], [416, 0], [433, -25], [450, -40], [466, -37], [483, -36], [500, -39]])
    expect(CURWEEK, 'still held').toBe('13/07/2026')
    await steps(w, 5_100_000, [[516, -12]])
    expect(CURWEEK, 'let go: crossed').toBe('06/07/2026')
  })

  it('Sunday pulled only 10px past its end crosses on the spring-back, as Monday does', async () => {
    const w = stubWeek(2400)
    await steps(w, 5_200_000, [[0, 2400], [400, 2400], [416, 2406], [433, 2410], [450, 2402]])
    expect(CURWEEK, 'crossed into the next week').toBe('20/07/2026')
  })

  it('a touch the browser cancelled after 12px, the finger pulling on unseen, crosses when let go', async () => {
    const w = stubWeek(12)
    at(5_300_000); await scrolled(w, 12)
    at(5_300_400); await scrolled(w, 12)
    at(5_300_500); await touch(w, 'touchstart', 100)
    at(5_300_516); await touch(w, 'touchmove', 112); await scrolled(w, 4)
    at(5_300_520); await touch(w, 'touchcancel', 112)               // Safari takes the gesture: the touch reading stays
    expect(CURWEEK).toBe('13/07/2026')
    await steps(w, 5_300_520, [[16, -10], [33, -30], [50, -40], [66, -15]])
    expect(CURWEEK, 'the unseen rest of the pull crossed').toBe('06/07/2026')
  })
})

describe('a swipe Safari gave the page no touch for — the narrow read’s cases', () => {
  let clock = 6_000_000
  const at = (t: number) => { clock = t; vi.spyOn(Date, 'now').mockImplementation(() => clock) }
  const scrolled = async (w: HTMLElement, x: number) => { w.scrollLeft = x; await act(async () => { w.dispatchEvent(new Event('scroll', { bubbles: false })) }) }
  const steps = async (w: HTMLElement, t0: number, pts: [number, number][]) => { for (const [dt, x] of pts) { at(t0 + dt); await scrolled(w, x) } }

  it('a short tug the browser cancelled stays, as the same tug ending normally would', async () => {
    const w = stubWeek(12)
    at(6_000_000); await scrolled(w, 12)
    at(6_000_400); await scrolled(w, 12)
    at(6_000_500); await touch(w, 'touchstart', 100)
    at(6_000_516); await touch(w, 'touchmove', 110); await scrolled(w, 0)
    at(6_000_533); await touch(w, 'touchmove', 120); await scrolled(w, -14)
    at(6_000_540); await touch(w, 'touchcancel', 120)                  // 20px: the touch reading stays
    await steps(w, 6_000_540, [[16, -12], [33, -4], [50, 12]])          // and it springs back
    expect(CURWEEK, 'stayed on the seed week').toBe('13/07/2026')
  })

  it('a flick with one late frame just short of Monday does not cross', async () => {
    const w = stubWeek(414)
    await steps(w, 6_100_000, [[0, 414], [16, 300], [33, 160], [50, 20], [160, -30], [176, -38], [192, -22], [208, -6], [224, 8], [240, 12]])
    expect(CURWEEK, 'stayed on the seed week').toBe('13/07/2026')
  })

  it('a shallow pull held, the finger wobbling 4px, does not cross', async () => {
    const w = stubWeek(12)
    await steps(w, 6_200_000, [[0, 12], [400, 12], [416, 0], [433, -9], [450, -5], [466, -9]])
    expect(CURWEEK, 'still held').toBe('13/07/2026')
  })

  it('a cross read from the strip ends a touch left hanging, so its late end cannot cross again', async () => {
    const w = stubWeek(12)
    at(6_300_000); await scrolled(w, 12)
    at(6_300_100); await touch(w, 'touchstart', 100)                   // a touch begins … and goes silent
    await steps(w, 6_300_100, [[1500, 12], [1516, 0], [1533, -20], [1550, -30], [1566, -10]])
    expect(CURWEEK, 'the pull crossed').toBe('06/07/2026')
    at(6_301_700); await touch(w, 'touchend', 220)                       // the touch's late end
    expect(CURWEEK, 'and only once').toBe('06/07/2026')
  })
})

describe('a swipe Safari gave the page no touch for — the last read’s cases', () => {
  let clock = 7_000_000
  const at = (t: number) => { clock = t; vi.spyOn(Date, 'now').mockImplementation(() => clock) }
  const scrolled = async (w: HTMLElement, x: number) => { w.scrollLeft = x; await act(async () => { w.dispatchEvent(new Event('scroll', { bubbles: false })) }) }
  const steps = async (w: HTMLElement, t0: number, pts: [number, number][]) => { for (const [dt, x] of pts) { at(t0 + dt); await scrolled(w, x) } }

  it('the glide onto Monday caught in its last few px, held a moment, then pulled past, crosses', async () => {
    const w = stubWeek(80)
    await steps(w, 7_000_000, [[0, 80], [16, 60], [33, 45], [50, 33], [66, 24], [83, 18]])     // the glide's tail, 0.35-1.2 px/ms
    await steps(w, 7_000_000, [[233, 12], [250, 0], [266, -15], [283, -30], [300, -15]])        // caught, held, pulled, let go
    expect(CURWEEK, 'crossed into the previous week').toBe('06/07/2026')
  })

  it('Monday at rest after a real snap tail, then a pull past it, crosses', async () => {
    const w = stubWeek(60)
    await steps(w, 7_100_000, [[0, 60], [16, 40], [33, 28], [50, 20], [66, 16], [83, 13], [100, 12]])
    await steps(w, 7_100_000, [[900, 6], [916, -10], [933, -24], [950, -8]])
    expect(CURWEEK, 'crossed into the previous week').toBe('06/07/2026')
  })

  it('a touch the browser cancelled past the end, the finger pulling on further unseen, crosses when let go', async () => {
    const w = stubWeek(12)
    at(7_200_000); await scrolled(w, 12)
    at(7_200_400); await scrolled(w, 12)
    at(7_200_500); await touch(w, 'touchstart', 100)
    at(7_200_516); await touch(w, 'touchmove', 115); await scrolled(w, -2)
    at(7_200_533); await touch(w, 'touchmove', 125); await scrolled(w, -14)
    at(7_200_540); await touch(w, 'touchcancel', 125)
    await steps(w, 7_200_540, [[16, -24], [33, -32], [50, -18]])
    expect(CURWEEK, 'the unseen rest of the pull crossed').toBe('06/07/2026')
  })
})
