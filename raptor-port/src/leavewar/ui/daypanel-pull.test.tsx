/* A PULL OF THE PHONE DAY WINDOW IS NEVER UNDONE BY ITS "↓ N MORE" COUNT (D1788's foot; the fresh code read of 8 Nov
   26, finding F1). The count was the day window's own state, so each change of it drew the whole window again, and the
   window's own every-draw placing (`useFloatWin`'s `place`, FloatWin's size reset) wiped the pull's inline height and
   top under the held finger — the panel snapped back to its lower rest until the finger moved again. A pull changes the
   body's height, which recounts, so it happened on nearly every pull of a long list. The count is drawn by the foot
   alone now, so a recount redraws only the foot. jsdom has no layout: the window's, body's and lines' boxes are given,
   with a ResizeObserver whose callback the test fires, and a phone `matchMedia`. */
import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { initStore, setCellRange, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { _resetFloatWins } from '../../ui/winorder'
import { DayPanelHost } from './DayPanel'
import { closeDayPanel, openDayPanel } from './daypanelopen'

const ros: Array<{ cb: () => void; els: Element[] }> = []
class FakeRO { cb: () => void; els: Element[] = []; constructor(cb: () => void) { this.cb = cb; ros.push(this) } observe(e: Element) { this.els.push(e) } unobserve() {} disconnect() { this.els = [] } }
class FakePE extends MouseEvent { pointerId: number; constructor(t: string, i: any = {}) { super(t, i); this.pointerId = i.pointerId ?? 1 } }
const box = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 100, width: 100, height: bottom - top, x: 0, y: top, toJSON() { return {} } }) as DOMRect

let undo: (() => void)[] = []
beforeEach(() => {
  const was = { gRO: (globalThis as any).ResizeObserver, wRO: (window as any).ResizeObserver, PE: (window as any).PointerEvent, mm: window.matchMedia }
  ;(globalThis as any).ResizeObserver = FakeRO
  ;(window as any).ResizeObserver = FakeRO
  if (!(window as any).PointerEvent) (window as any).PointerEvent = FakePE
  window.matchMedia = ((q: string) => ({ matches: /max-width/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as any
  initStore(memoryBackend()); setRole('admin')
  const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const win = this.closest('.floatwin') as HTMLElement | null
    /* the panel at its lower rest: its body ends at 400; pulled up (inline height auto) it ends at 700 */
    if (this.classList.contains('win-body')) return box(320, win?.style.height === 'auto' ? 700 : 400)
    if (this.classList.contains('floatwin')) return box(300, 760)
    if (this.classList.contains('ll-row')) {
      const body = this.closest('.win-body') as HTMLElement | null
      const i = Array.from(body?.querySelectorAll('.lwday-away .ll-row') ?? []).indexOf(this)
      return box(100 + 40 * i - 30, 100 + 40 * i - (body?.scrollTop ?? 0))
    }
    return box(0, 0)
  })
  undo = [() => spy.mockRestore(), () => {
    ;(globalThis as any).ResizeObserver = was.gRO; (window as any).ResizeObserver = was.wRO
    ;(window as any).PointerEvent = was.PE; window.matchMedia = was.mm; ros.length = 0
  }]
})
afterEach(() => { act(() => { closeDayPanel() }); _resetFloatWins(); for (const f of undo) f(); undo = [] })

it('a pull of the phone day window keeps the finger\'s height and place while the count changes', () => {
  const who = ['ramp', 'tata', 'splice', 'jaguar', 'switcher', 'asics', 'pipper', 'dusk', 'miles', 'roulette', 'cross', 'decal']
  for (const p of who) setCellRange(p, '2026-02-10', '2026-02-12', 'LL')
  render(<DayPanelHost />)
  act(() => { openDayPanel('2026-02-11') })
  const win = document.querySelector('[data-testid="win-lwday"]') as HTMLElement
  expect(win.classList.contains('rests'), 'the phone panel').toBe(true)
  const cueAt = () => document.querySelector('[data-testid="lwday-more"]')?.textContent ?? null
  const atRest = cueAt()
  expect(atRest, 'a long list wears the cue at the lower rest').toMatch(/↓ \d+ more/)
  const bar = win.querySelector('.win-bar') as HTMLElement
  act(() => { fireEvent.pointerDown(bar, { clientY: 500, pointerId: 1 }) })
  act(() => { fireEvent.pointerMove(bar, { clientY: 300, pointerId: 1 }) })
  expect(win.style.height, 'pulled: the panel stretches to the foot').toBe('auto')
  const top = win.style.top
  expect(top, 'pulled: the panel stands where the finger put it').not.toBe('')
  /* the browser reports the body's new size: the count is taken again */
  act(() => { for (const r of ros) if (r.els.some(e => e.classList?.contains('win-body'))) r.cb() })
  expect(win.style.height, 'the finger still holds the bar: the panel keeps stretching to the foot').toBe('auto')
  expect(win.style.top, 'and keeps the place the finger gave it').toBe(top)
  expect(cueAt(), 'the count follows the taller body').not.toBe(atRest)
})
