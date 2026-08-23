// @vitest-environment jsdom
/* The cross-week glide is a phone-only visual slide fired on a Monday/Sunday
   landing. jsdom has no layout, so the real motion is the browser gate's job;
   these pin the GATING (when it must NOT fire) and that a fired glide cleans up
   after itself — no leftover transform, no orphan clone, no page-overflow lock. */
import { afterEach, describe, expect, it, vi } from 'vitest'
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
  it('spawns TWO clones and hides the real week mid-slide, then cleans all of it up', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('mon')
    const root = mkRoot(390)
    const run = beginGlide(root)!
    run()
    // mid-slide: BOTH weeks are cloned (outgoing + incoming) and tile the
    // viewport, the real week is hidden behind them, and the page is clipped so
    // it can't scroll sideways. Three `.week` in the DOM = root + the two clones.
    expect(document.querySelectorAll('body > .week').length).toBe(3)
    expect([...document.querySelectorAll('body > .week')].filter(el => (el as HTMLElement).style.position === 'fixed').length).toBe(2)
    expect(root.style.visibility, 'the real week is hidden while the clones slide').toBe('hidden')
    expect(root.style.transform, 'the real week never itself transforms now — the clones do').toBe('')
    expect(document.body.style.overflowX).toBe('hidden')
    // after the slide (no transitionend in jsdom → the fallback timer finishes it)
    vi.runAllTimers()
    expect(document.querySelectorAll('body > .week').length).toBe(1)   // both clones gone, only root
    expect(root.style.visibility, 'the real week is revealed again').toBe('')
    expect(document.body.style.overflowX).toBe('')
  })

  /* OVERLAPPING GLIDES must not strand the week hidden (24 Aug 26). A second
     cross firing before the first's slide ends used to capture the
     already-hidden styles as ITS baseline and restore to hidden, so the whole
     week went blank and the page stayed clipped until a reload. The burst now
     shares one baseline, captured on the first glide and restored on the last. */
  it('two overlapping glides reveal the real week once, never restore it to hidden', () => {
    vi.useFakeTimers()
    setW(400)
    const root = mkRoot(390)
    view.setWeekJump('mon'); beginGlide(root)!()
    expect(root.style.visibility).toBe('hidden')
    // a SECOND cross fires while the first is still sliding
    view.setWeekJump('sun'); beginGlide(root)!()
    expect(root.style.visibility, 'still hidden mid-burst').toBe('hidden')
    // both clones' fallback timers fire
    vi.runAllTimers()
    expect(root.style.visibility, 'the week is revealed, not stranded hidden').toBe('')
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
