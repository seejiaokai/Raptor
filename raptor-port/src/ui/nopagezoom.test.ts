// @vitest-environment jsdom
/* [NO-PAGE-ZOOM] (owner D1567, 2 Nov 26): on a touch-first screen an iPhone's own pinch — its gesture events — is held
   off on the whole page; a desktop is left as the browser has it (D1286). The pinch itself, the double tap and the grids'
   own pinch are proved with real fingers in e2e/nopagezoom.spec.ts and e2e/pinchzoom.spec.ts. */
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it } from 'vitest'
import { installNoPageZoom, touchFirst } from './nopagezoom'

const fakeWin = (coarse: boolean) => ({
  matchMedia: (q: string) => ({ matches: coarse && q === '(pointer: coarse)' }),
}) as unknown as Window
const gesture = (type: string) => {
  const e = new Event(type, { bubbles: true, cancelable: true })
  document.body.dispatchEvent(e)
  return e.defaultPrevented
}

let off: (() => void) | null = null
afterEach(() => { off?.(); off = null })

describe('the page never zooms on a touch screen (D1567)', () => {
  it('a finger-first screen cancels Safari\'s own pinch on the whole page', () => {
    off = installNoPageZoom(document, fakeWin(true))
    expect(gesture('gesturestart')).toBe(true)
    expect(gesture('gesturechange')).toBe(true)
  })

  it('a desktop keeps the browser\'s own zoom — nothing is cancelled', () => {
    off = installNoPageZoom(document, fakeWin(false))
    expect(touchFirst(fakeWin(false))).toBe(false)
    expect(gesture('gesturestart')).toBe(false)
    expect(gesture('gesturechange')).toBe(false)
  })

  it('a browser with no media queries is treated as a desktop', () => {
    expect(touchFirst({} as Window)).toBe(false)
  })

  it('taking the hold off lets the gestures through again', () => {
    installNoPageZoom(document, fakeWin(true))()
    expect(gesture('gesturestart')).toBe(false)
  })

  it('the page setting and the stylesheet carry the other two locks', () => {
    const html = readFileSync('index.html', 'utf8')
    expect(html).toContain("matchMedia('(pointer: coarse)')")
    expect(html).toContain('maximum-scale=1, user-scalable=no')
    const css = readFileSync('src/ui/scheduler/00-foundation-login.css', 'utf8')
    expect(css).toContain('@media (pointer:coarse){html{touch-action:pan-x pan-y}}')
  })
})
