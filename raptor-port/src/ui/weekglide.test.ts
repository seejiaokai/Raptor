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
  it('spawns one clone, then removes it and clears the transform + overflow lock', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('mon')
    const root = mkRoot(390)
    const run = beginGlide(root)!
    run()
    // mid-slide: the outgoing week is cloned over the viewport and the live week
    // is shifted one screen off, with the page clipped so it can't scroll sideways
    expect(document.querySelectorAll('body > .week').length).toBe(2)
    expect(root.style.transform).toContain('translateX')
    expect(document.body.style.overflowX).toBe('hidden')
    // after the slide (no transitionend in jsdom → the fallback timer finishes it)
    vi.runAllTimers()
    expect(document.querySelectorAll('body > .week').length).toBe(1)
    expect(root.style.transform).toBe('')
    expect(document.body.style.overflowX).toBe('')
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
