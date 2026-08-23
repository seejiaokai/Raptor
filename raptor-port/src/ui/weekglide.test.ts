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
})
