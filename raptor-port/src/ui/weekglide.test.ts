// @vitest-environment jsdom
/* The cross-week glide is a phone-only visual slide fired on a Monday/Sunday
   landing. jsdom has no layout, so the real motion is the browser gate's job;
   these pin the GATING (when it must NOT fire) and that a fired glide cleans up
   after itself — no leftover transform, no orphan clone, no page-overflow lock. */
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { beginGlide } from './weekglide'
import * as view from '../state/view'

const setW = (px: number) =>
  Object.defineProperty(window, 'innerWidth', { value: px, configurable: true, writable: true })

const mkRoot = (width: number) => {
  const el = document.createElement('div')
  el.className = 'week'
  el.innerHTML = '<section class="day">Sun</section>'
  document.body.appendChild(el)
  el.getBoundingClientRect = () =>
    ({ width, height: 800, left: 0, top: 0, right: width, bottom: 800, x: 0, y: 0, toJSON() {} }) as DOMRect
  return el
}

/* jsdom has no requestAnimationFrame under vitest's fake timers; a 16ms timer
   stands in so the clone's two-frame handover (weekglide.ts afterTwoFrames)
   runs under vi.advanceTimersByTime / runAllTimers like everything else */
beforeEach(() => { (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => window.setTimeout(() => cb(performance.now()), 16) })
afterEach(() => {
  view.setWeekJump(null)
  document.body.innerHTML = ''
  document.body.style.overflowX = ''
  vi.useRealTimers()
})

describe('the glide only arms on a real phone week cross', () => {
  it('does not arm on an ordinary within-week repaint (no week jump)', () => {
    setW(400); view.setWeekJump(null)
    expect(beginGlide(mkRoot(390))).toBe(null)
  })

  it('does not arm on desktop — the arrows land instant there', () => {
    setW(1200); view.setWeekJump('mon')
    expect(beginGlide(mkRoot(620))).toBe(null)
  })

  it('does not arm without layout (jsdom / not painted), so the gates are untouched', () => {
    setW(400); view.setWeekJump('mon')
    expect(beginGlide(mkRoot(0))).toBe(null)
  })

  it('arms on a phone Monday landing and on a phone Sunday landing', () => {
    setW(400)
    view.setWeekJump('mon'); expect(typeof beginGlide(mkRoot(390))).toBe('function')
    view.setWeekJump('sun'); expect(typeof beginGlide(mkRoot(390))).toBe('function')
  })
})

describe('a fired glide leaves nothing behind', () => {
  it('spawns TWO clones and keeps the real week painted but untouchable mid-slide, then cleans all of it up', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('mon')
    const root = mkRoot(390)
    const run = beginGlide(root)!
    run()
    // mid-slide: BOTH weeks are cloned (outgoing + incoming) and tile the
    // viewport, the real week stays PAINTED under them (never hidden — a hidden
    // element is never painted, and the reveal then drew in from black on the
    // phone, 5 Sep 26) but takes no touches, and the page is clipped so it can't
    // scroll sideways. Three `.week` in the DOM = root + the two clones.
    expect(document.querySelectorAll('body > .week').length).toBe(3)
    expect([...document.querySelectorAll('body > .week')].filter(el => (el as HTMLElement).style.position === 'fixed').length).toBe(2)
    expect(root.style.visibility, 'the real week is never hidden — it paints under the clones').toBe('')
    expect(root.style.pointerEvents, 'but it takes no touches while the clones slide').toBe('none')
    expect(root.style.transform, 'the real week never itself transforms now — the clones do').toBe('')
    expect(document.body.style.overflowX).toBe('hidden')
    // the slide ends (no transitionend in jsdom → the fallback timer at DUR+120
    // finishes it): the outgoing clone goes, the week is uncovered for touches
    // and the page clip lifts — but the INCOMING clone, the landed week's own
    // picture, stays two frames more while the real week's paint commits
    vi.advanceTimersByTime(400)
    expect(root.style.pointerEvents, 'the settled week takes touches again').toBe('')
    expect(document.body.style.overflowX).toBe('')
    expect(document.querySelectorAll('body > .week').length, 'root + the incoming clone still covering').toBe(2)
    vi.advanceTimersByTime(40)
    expect(document.querySelectorAll('body > .week').length, 'two frames later the last clone comes off').toBe(1)
  })

  /* OVERLAPPING GLIDES must not strand the week hidden (24 Aug 26). A second
     cross firing before the first's slide ends used to capture the
     already-hidden styles as ITS baseline and restore to hidden, so the whole
     week went blank and the page stayed clipped until a reload. The burst now
     shares one baseline, captured on the first glide and restored on the last. */
  it('two overlapping glides uncover the real week once, never restore it to covered', () => {
    vi.useFakeTimers()
    setW(400)
    const root = mkRoot(390)
    view.setWeekJump('mon'); beginGlide(root)!()
    expect(root.style.pointerEvents).toBe('none')
    // a SECOND cross fires while the first is still sliding
    view.setWeekJump('sun'); beginGlide(root)!()
    expect(root.style.pointerEvents, 'still covered mid-burst').toBe('none')
    // both clones' fallback timers fire, then the last clone's two-frame handover
    vi.runAllTimers()
    expect(root.style.pointerEvents, 'the week takes touches again, not stranded covered').toBe('')
    expect(document.body.style.overflowX, 'the page clip is lifted').toBe('')
    expect(document.querySelectorAll('body > .week').length, 'all four clones cleaned up').toBe(1)
  })

  /* owner, 23 Aug 26 — "bleeding at the top bar when swiping". The clone is
     position:fixed from the week's rect.top, which is above the sticky top bar
     once the page is scrolled; at z-index 60 (the bar's own) it tied and, being
     appended last, painted the sliding week over the bar. It must lose to the
     bar — any value under 60. */
  it('parks the sliding clone under the sticky top bar (z-index below .topbar 60)', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('mon')
    const root = mkRoot(390)
    beginGlide(root)!()
    const ghost = [...document.querySelectorAll('body > .week')]
      .find(el => (el as HTMLElement).style.position === 'fixed') as HTMLElement
    expect(ghost, 'the fired glide spawned a fixed-position clone').toBeTruthy()
    expect(Number(ghost.style.zIndex), 'the clone must sit below the top bar, not tie it').toBeLessThan(60)
    vi.runAllTimers()
  })

  /* owner, 23 Aug 26 — "artifacts bleeding between weeks". The clone carries the
     week's class, and `.week` sets scroll-behavior:smooth, so parking it with
     `scrollLeft = sl` was ANIMATED: the outgoing week rolled through its middle
     days while it slid off. The clone must opt OUT of smooth so its park is an
     instant freeze on the day the finger left. */
  it('freezes the sliding clone on the finger day (scroll-behavior:auto, not the week\'s smooth)', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('sun')
    const root = mkRoot(390)
    beginGlide(root)!()
    const ghost = [...document.querySelectorAll('body > .week')]
      .find(el => (el as HTMLElement).style.position === 'fixed') as HTMLElement
    expect(ghost, 'the fired glide spawned a fixed-position clone').toBeTruthy()
    expect(ghost.style.scrollBehavior, 'the clone must not inherit .week smooth-scroll, or its park animates').toBe('auto')
    vi.runAllTimers()
  })
})
