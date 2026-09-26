import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { wireSelect } from './select'

// Its own file on purpose: select.test.ts's earlier gestures leave a one-shot swallow armed under fake timers that
// never ran, and it would eat this file's first click — a pass for the wrong reason (found writing this test).
// THE TAP A FINGER LEAVES BEHIND (the absence-record re-test, W4-1, 26 Sep 26 — found by the phone walker, reproduced
// by the host). A finger held on ONE day and lifted opens the selection sheet for that day; the finger's own tap then
// arrives ~20–30 ms after the lift (measured in the walk) — after the 0 ms sweep had already retired the one-shot
// swallow — landed on the day, and closed the sheet it had just opened. On a day that already holds a mark that left a
// phone user no one-day door to the sheet at all. A finger's tap is now awaited long enough to be eaten; a MOUSE drag
// keeps the 0 ms sweep, so the next real click on a desktop is never lost.
describe('the trailing tap of a finger is swallowed, not only a mouse click (W4-1)', () => {
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
    teardown = wireSelect(wrap, { order: () => ['ramp'], dates: () => ['2026-01-06'], enabled: () => true, onSelect: () => {} })
  })
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; vi.useRealTimers() })
  const heardAClick = () => {
    const heard = vi.fn()
    cell.addEventListener('click', heard)
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    cell.removeEventListener('click', heard)
    return heard.mock.calls.length > 0
  }
  it('a finger held on one day and lifted: its tap 30 ms later does not reach the day', () => {
    cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 5, clientY: 5, button: 0 }))
    vi.advanceTimersByTime(200)   // the hold arms
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'touch', button: 0 }))
    vi.advanceTimersByTime(30)
    expect(heardAClick()).toBe(false)
  })
  it('a mouse drag keeps the instant sweep — the next real click 30 ms later still lands', () => {
    cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: 5, clientY: 5, button: 0 }))
    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 40, clientY: 5 }))
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', button: 0 }))
    vi.advanceTimersByTime(30)
    expect(heardAClick()).toBe(true)
  })
})
