// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { wireTopbarVar } from './topbarvar'

describe('D1873 — room for the fixed top bar follows its actual border-box height', () => {
  let height: number
  let bar: HTMLDivElement
  let resized: () => void
  let stop: (() => void) | undefined
  const observe = vi.fn(), disconnect = vi.fn()
  const value = () => document.documentElement.style.getPropertyValue('--topbar-h')

  beforeEach(() => {
    document.documentElement.style.removeProperty('--topbar-h')
    height = 58.375
    bar = document.createElement('div')
    bar.getBoundingClientRect = () => ({ height, top: -120, bottom: height - 120 }) as DOMRect
    observe.mockClear(); disconnect.mockClear()
    vi.stubGlobal('ResizeObserver', class {
      constructor(fn: () => void) { resized = fn }
      observe = observe
      disconnect = disconnect
    })
  })
  afterEach(() => { stop?.(); stop = undefined; vi.restoreAllMocks(); vi.unstubAllGlobals() })

  it('sets the space immediately and keeps fractional pixels, regardless of the bar position', () => {
    stop = wireTopbarVar(bar)
    expect(value()).toBe('58.375px')
  })

  it('watches padding and borders too, and follows wrapped names and both warning bands in both directions', () => {
    stop = wireTopbarVar(bar)
    expect(observe).toHaveBeenCalledWith(bar, { box: 'border-box' })
    for (const next of [86.375, 122.375, 158.375, 122.375, 86.375, 58.375]) {
      height = next; resized()
      expect(value()).toBe(`${next}px`)
    }
  })

  it('does not rewrite a root variable when a resize leaves the height alone', () => {
    stop = wireTopbarVar(bar)
    const write = vi.spyOn(document.documentElement.style, 'setProperty')
    resized(); window.dispatchEvent(new Event('resize'))
    expect(write).not.toHaveBeenCalled()
  })

  it('does not follow page scrolling or move the page to hold the bar', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo'), scrollBy = vi.spyOn(window, 'scrollBy')
    stop = wireTopbarVar(bar)
    height = 100
    window.dispatchEvent(new Event('scroll'))
    expect(value()).toBe('58.375px')
    expect(scrollTo).not.toHaveBeenCalled(); expect(scrollBy).not.toHaveBeenCalled()
  })

  it('removes its measurement and listeners when the bar leaves for sign-in', () => {
    stop = wireTopbarVar(bar)
    stop(); stop = undefined
    expect(disconnect).toHaveBeenCalledOnce()
    expect(value()).toBe('')
    height = 100
    window.dispatchEvent(new Event('resize'))
    expect(value()).toBe('')
  })

  it('still measures on mount and window resize without ResizeObserver, then cleans up', () => {
    vi.stubGlobal('ResizeObserver', undefined)
    stop = wireTopbarVar(bar)
    expect(value()).toBe('58.375px')
    height = 94.375; window.dispatchEvent(new Event('resize'))
    expect(value()).toBe('94.375px')
    stop(); stop = undefined
    expect(value()).toBe('')
  })

  it('does nothing without a bar', () => {
    stop = wireTopbarVar(null)
    expect(observe).not.toHaveBeenCalled()
    expect(value()).toBe('')
  })
})
