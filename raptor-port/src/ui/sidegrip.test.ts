// @vitest-environment jsdom
/* [BOARD-SIDE-WIDTH] — the board's right panel widens by its left edge (D1113, D1118) and Edit Schedule's crew panel is
   held under the top bar (D1116). jsdom has no layout, so the panel's width is read from a stubbed box: these pin what
   the grip WRITES (the CSS width, what is remembered) — the browser test and the walk pin what is painted. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { wireSideGrip, SIDE_KEY, SIDE_MIN, sideMax } from './board'
import { wireTopbarVar } from './topbarvar'

let side: HTMLElement, grip: HTMLElement, off: () => void, width = SIDE_MIN
const make = () => {
  side = document.createElement('div'); side.className = 'sb-side'
  grip = document.createElement('div'); grip.setAttribute('data-sidegrip', ''); grip.tabIndex = 0
  side.appendChild(grip); document.body.appendChild(side)
  side.getBoundingClientRect = () => ({ width, height: 600, left: 0, top: 0, right: width, bottom: 600, x: 0, y: 0, toJSON() { } }) as DOMRect
  off = wireSideGrip(side)
}
const css = () => side.style.getPropertyValue('--sb-sideW')
const ptr = (type: string, x: number, el: EventTarget = document) => { const e: any = new Event(type, { bubbles: true, cancelable: true }); e.clientX = x; e.button = 0; e.pointerId = 1; el.dispatchEvent(e) }
const key = (k: string) => grip.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))

beforeEach(() => { localStorage.clear(); width = SIDE_MIN; Object.defineProperty(window, 'innerWidth', { value: 1500, configurable: true }) })
afterEach(() => { off?.(); side?.remove() })

describe('the right panel\'s width grip (D1113, D1118)', () => {
  it('opens at 320 — no width written, nothing remembered', () => {
    make()
    expect(css()).toBe('')
    expect(localStorage.getItem(SIDE_KEY)).toBeNull()
    expect(grip.getAttribute('aria-valuenow')).toBe('320')
  })
  it('a drag to the left widens it, and the width is remembered on this computer when let go', () => {
    make()
    ptr('pointerdown', 1000, grip); ptr('pointermove', 900); ptr('pointermove', 850)
    expect(css()).toBe('470px')
    expect(localStorage.getItem(SIDE_KEY)).toBeNull()
    ptr('pointerup', 850)
    expect(localStorage.getItem(SIDE_KEY)).toBe('470')
  })
  it('never past 40% of the window, never under 320', () => {
    make()
    ptr('pointerdown', 1000, grip); ptr('pointermove', 100); ptr('pointerup', 100)
    expect(css()).toBe(sideMax() + 'px')
    expect(sideMax()).toBe(600)
    ptr('pointerdown', 100, grip); ptr('pointermove', 1400); ptr('pointerup', 1400)
    expect(css()).toBe('')
  })
  it('a double-click puts it back to 320 and forgets the width', () => {
    localStorage.setItem(SIDE_KEY, '520'); make()
    expect(css()).toBe('520px')
    grip.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    expect(css()).toBe('')
    expect(localStorage.getItem(SIDE_KEY)).toBeNull()
  })
  it('the keyboard: ← widens and → narrows by 20, End is the widest, Home is 320', () => {
    make()
    key('ArrowLeft'); expect(css()).toBe('340px')
    width = 340; key('ArrowLeft'); expect(css()).toBe('360px')
    width = 360; key('ArrowRight'); expect(css()).toBe('340px')
    key('End'); expect(css()).toBe('600px'); expect(localStorage.getItem(SIDE_KEY)).toBe('600')
    key('Home'); expect(css()).toBe('')
  })
  it('a smaller window shows less, and the width asked for comes back when it grows', () => {
    localStorage.setItem(SIDE_KEY, '560'); make()
    Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true }); window.dispatchEvent(new Event('resize'))
    expect(css()).toBe('400px')
    Object.defineProperty(window, 'innerWidth', { value: 1600, configurable: true }); window.dispatchEvent(new Event('resize'))
    expect(css()).toBe('560px')
  })
})

describe('the top bar\'s height, for what is held under it (D1116)', () => {
  it('is written on the page\'s root as --topbar-h', () => {
    const bar = document.createElement('div')
    bar.getBoundingClientRect = () => ({ height: 58.4 }) as DOMRect
    const stop = wireTopbarVar(bar)
    expect(document.documentElement.style.getPropertyValue('--topbar-h')).toBe('58px')
    /* the bar grows (a band under it) — re-measured, here on the window's resize (the blind read, F1) */
    bar.getBoundingClientRect = () => ({ height: 88 }) as DOMRect
    window.dispatchEvent(new Event('resize'))
    expect(document.documentElement.style.getPropertyValue('--topbar-h')).toBe('88px')
    stop()
  })
})
