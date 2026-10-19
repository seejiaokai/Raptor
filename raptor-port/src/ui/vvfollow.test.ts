// @vitest-environment jsdom
/* D1081 — a layer that follows the visible screen is placed again on every frame for a short while after a focus change
   or a visual-viewport event (an iPhone's events arrive frames after the keys begin to move), and costs nothing after. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { followVisible } from './vvfollow'

describe('followVisible', () => {
  let vv: any, stop = () => {}
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    vv = new EventTarget()
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => vv })
  })
  afterEach(() => { stop(); vi.useRealTimers(); Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined }) })

  it('places now; after a focus change, every frame for a short while, then not at all', () => {
    let n = 0
    stop = followVisible(() => { n++ })
    expect(n, 'now').toBe(1)
    vi.advanceTimersByTime(500); expect(n, 'nothing moving: nothing done').toBe(1)
    document.body.innerHTML = '<input id="b">'; (document.getElementById('b') as HTMLInputElement).focus()
    vi.advanceTimersByTime(300)
    const during = n
    expect(during, 'frame by frame while the keys move').toBeGreaterThan(10)
    vi.advanceTimersByTime(2000)
    const after = n
    vi.advanceTimersByTime(2000)
    expect(n, 'stops after the moment').toBe(after)
  })
  it('a visual-viewport event starts it too; stopping removes everything', () => {
    let n = 0
    stop = followVisible(() => { n++ })
    vv.dispatchEvent(new Event('scroll')); vi.advanceTimersByTime(100)
    expect(n).toBeGreaterThan(3)
    stop(); const m = n
    vv.dispatchEvent(new Event('resize')); vi.advanceTimersByTime(500)
    expect(n).toBe(m)
  })
})
