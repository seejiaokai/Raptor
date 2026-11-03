// @vitest-environment jsdom
/* F9 of the 3 Nov 26 re-check (the Inputs batch [INPUTS-FIXES-1103]): "Calendar…" in a SANS day opened the Calendar window
   at its own corner — on a desktop right over the day, its ✕ under it. A window asked for beside another opens to the
   left of it where it fits; where it does not, at its own corner; one he has placed already keeps his place.
   jsdom draws nothing, so each window's box is given here by its id. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FloatWin } from './FloatWindow'
import { _resetFloatWins, openBeside, winBox, setWinBox } from './winorder'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const RECTS: Record<string, { left: number, top: number, width: number, height: number }> = {}
beforeEach(() => {
  _resetFloatWins()
  Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const r = RECTS[(this as HTMLElement).dataset?.winid || ''] || { left: 0, top: 0, width: 0, height: 0 }
    return { ...r, x: r.left, y: r.top, right: r.left + r.width, bottom: r.top + r.height, toJSON() {} } as DOMRect
  })
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(async () => { await act(async () => { root.unmount() }); host.remove(); vi.restoreAllMocks(); _resetFloatWins() })

const two = async () => act(async () => {
  root.render(<>
    <FloatWin id="sansday" title="Wed 15 Jul" onClose={() => {}}><p>day</p></FloatWin>
    <FloatWin id="days" title="Calendar" onClose={() => {}}><p>calendar</p></FloatWin>
  </>)
})

describe('a window opened beside another (F9)', () => {
  it('opens to the left of the window that asked for it', async () => {
    RECTS.sansday = { left: 994, top: 96, width: 430, height: 441 }
    RECTS.days = { left: 544, top: 96, width: 880, height: 605 }
    openBeside('days', 'sansday')
    await two()
    const b = winBox('days')
    expect(b, 'given a place').toBeTruthy()
    expect(b!.x + 880, 'its right edge left of the day').toBeLessThanOrEqual(994 - 12)
    expect(b!.moved, 'its top stays the stylesheet’s').toBeFalsy()
  })
  it('where it would run off the screen’s left edge, it opens at its own corner', async () => {
    RECTS.sansday = { left: 600, top: 96, width: 430, height: 441 }
    RECTS.days = { left: 544, top: 96, width: 880, height: 605 }
    openBeside('days', 'sansday')
    await two()
    expect(winBox('days')).toBeNull()
  })
  it('a window he has placed keeps his place', async () => {
    RECTS.sansday = { left: 994, top: 96, width: 430, height: 441 }
    RECTS.days = { left: 200, top: 300, width: 880, height: 605 }
    setWinBox('days', { x: 200, y: 300, w: 880, h: 605, moved: true })
    openBeside('days', 'sansday')
    await two()
    expect(winBox('days')).toMatchObject({ x: 200, y: 300 })
  })
})

/* F5 of the 3 Nov 26 re-check: on a 320 × 568 phone the Calendar window, dragged low and back, grew to 653 tall — its last
   week under the screen's foot. A dragged phone window is capped at the room under its top. */
describe('a window dragged on a small phone stays on the screen (F5)', () => {
  /* the windows ask the screen's width through matchMedia, which jsdom has not got */
  beforeEach(() => { (window as any).matchMedia = (q: string) => ({ matches: /max-width:s*620px/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) })
  afterEach(() => { delete (window as any).matchMedia })
  it('its height is capped at the room under its top', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 568, configurable: true })
    RECTS.days = { left: 6, top: 0, width: 308, height: 653 }
    setWinBox('days', { x: 6, y: 0, w: 308, h: 653, phone: true, moved: true })
    await act(async () => { root.render(<FloatWin id="days" title="Calendar" onClose={() => {}}><p>calendar</p></FloatWin>) })
    const n = document.querySelector('[data-winid="days"]') as HTMLElement
    expect(n.style.maxHeight).toBe('562px')
  })
  it('a panel with two rest heights is left to its own pull', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 568, configurable: true })
    RECTS.sansday = { left: 0, top: 100, width: 320, height: 400 }
    setWinBox('sansday', { x: 0, y: 100, w: 320, h: 400, phone: true, moved: true })
    await act(async () => { root.render(<FloatWin id="sansday" title="Wed" rests onClose={() => {}}><p>day</p></FloatWin>) })
    const n = document.querySelector('[data-winid="sansday"]') as HTMLElement
    expect(n.style.maxHeight).not.toBe('462px')
  })
})
