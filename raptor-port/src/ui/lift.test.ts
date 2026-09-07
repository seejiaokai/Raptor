// @vitest-environment jsdom
/* ONE LIFT, EVERY DRAG (owner, 6 Sep 26) — the DOM-only module every drag
   surface calls. jsdom lays nothing out, so the rects are stubbed; what is
   pinned is the arithmetic, the class choreography and the two ways the
   landing class leaves (animationend, or the timer alone under reduced motion). */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { LIFT_LAND_MS, boxOf, frameLift, frameLand, landOn, liftOn, liftOff, markLand, paintLand, pendingLand } from './lift'

const rect = (top: number, left: number, width: number, height: number) =>
  ({ top, left, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() { return {} } }) as DOMRect
const el = (r: DOMRect, clientWidth = 0, tag = 'div') => {
  const e = document.createElement(tag)
  e.getBoundingClientRect = () => r
  Object.defineProperty(e, 'clientWidth', { value: clientWidth, configurable: true })
  document.body.appendChild(e)
  return e
}
afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); paintLand(); markLand(''); paintLand() })

describe('boxOf — the frame\'s rectangle', () => {
  it('takes top/height from the row and left/width from the scroller, relative to the host', () => {
    const host = el(rect(100, 50, 400, 900)), row = el(rect(130, 50, 8000, 22)), wrap = el(rect(100, 60, 380, 900), 368)
    expect(boxOf(host, row, wrap)).toEqual({ top: 30, height: 22, left: 10, width: 368 })
  })
  it('adds the scroller offset the caller passes — content coordinates for a frame INSIDE a sideways scroller', () => {
    const host = el(rect(0, 0, 500, 300)), col = el(rect(0, 120, 60, 20), 60), tbl = el(rect(10, 0, 900, 260))
    expect(boxOf(host, tbl, col, 40)).toEqual({ top: 10, height: 260, left: 160, width: 60 })
  })
  it('falls back to the x element\'s rect width when it has no clientWidth (an inline th in jsdom)', () => {
    const host = el(rect(0, 0, 500, 300)), col = el(rect(0, 120, 60, 20), 0), tbl = el(rect(10, 0, 900, 260))
    expect(boxOf(host, tbl, col)!.width).toBe(60)
  })
  it('answers null when nothing is laid out — a zero-height row or a zero-width host (jsdom)', () => {
    const zero = rect(0, 0, 0, 0)
    expect(boxOf(el(zero), el(zero), el(zero))).toBeNull()
    expect(boxOf(el(rect(0, 0, 400, 10)), el(zero), el(rect(0, 0, 10, 10)))).toBeNull()
  })
})

describe('the frame', () => {
  const frame = () => { const f = document.createElement('div'); f.className = 'lift-frame'; document.body.appendChild(f); return f }
  it('frameLift places it as four px values and lifts it; null hides it', () => {
    const f = frame()
    frameLift(f, { top: 30, left: 10, width: 368, height: 22 })
    expect([f.style.top, f.style.left, f.style.width, f.style.height]).toEqual(['30px', '10px', '368px', '22px'])
    expect(f.classList.contains('lift')).toBe(true)
    frameLift(f, null)
    expect(f.classList.contains('lift')).toBe(false)
    expect(f.className).toBe('lift-frame')
  })
  it('frameLand moves it to the landed place and swaps lift for lift-land; the class leaves on animationend', () => {
    const f = frame()
    frameLift(f, { top: 30, left: 10, width: 368, height: 22 })
    frameLand(f, { top: 96, left: 10, width: 368, height: 22 })
    expect(f.style.top).toBe('96px')
    expect(f.classList.contains('lift')).toBe(false)
    expect(f.classList.contains('lift-land')).toBe(true)
    const ev = new Event('animationend'); (ev as any).animationName = 'liftLand'
    f.dispatchEvent(ev)
    expect(f.classList.contains('lift-land')).toBe(false)
  })
  it('…and leaves on the timer ALONE when no animationend ever comes (reduced motion)', () => {
    vi.useFakeTimers()
    const f = frame()
    frameLand(f, { top: 96, left: 10, width: 368, height: 22 })
    vi.advanceTimersByTime(LIFT_LAND_MS - 1)
    expect(f.classList.contains('lift-land')).toBe(true)
    vi.advanceTimersByTime(60)
    expect(f.classList.contains('lift-land')).toBe(false)
  })
  /* ONE frame serves every row, so an arm can land inside the previous drop's
     600ms — and the timer from that drop must not fire into the new lift. It
     only ever stripped `.lift-land`, which is harmless today; frameLift ends the
     flash outright so nothing rests on that (review, 6 Sep 26). */
  it('a re-arm inside the landing cancels its timer — the new lift is never touched by the old drop', () => {
    vi.useFakeTimers()
    const f = frame()
    frameLand(f, { top: 96, left: 10, width: 368, height: 22 })
    vi.advanceTimersByTime(120)
    frameLift(f, { top: 30, left: 10, width: 368, height: 22 })
    expect(f.classList.contains('lift')).toBe(true)
    expect(f.classList.contains('lift-land')).toBe(false)
    // the assertion with the teeth: nothing is left ticking. The class checks
    // below pass either way, because clear() only ever removes `lift-land` —
    // which is exactly the unstated invariant this cancel removes.
    expect(vi.getTimerCount(), 'the landing timer is cancelled, not left to fire').toBe(0)
    vi.advanceTimersByTime(2000)                            // the old timer's moment, and well past it
    expect(f.classList.contains('lift'), 'the lift survives the cancelled landing').toBe(true)
    expect(f.classList.contains('lift-land')).toBe(false)
  })
  /* Both keyframes fire animationend at the same element: the frame's 120ms
     bloom (liftIn) ends WHILE a later landing could be running, so the listener
     reads the name rather than assuming (review, 6 Sep 26). */
  it('an animationend from the bloom does not end the flash — only liftLand does', () => {
    vi.useFakeTimers()
    const f = frame()
    frameLand(f, { top: 96, left: 10, width: 368, height: 22 })
    const bloom = new Event('animationend'); (bloom as any).animationName = 'liftIn'
    f.dispatchEvent(bloom)
    expect(f.classList.contains('lift-land'), 'liftIn is not the landing').toBe(true)
    const land = new Event('animationend'); (land as any).animationName = 'liftLand'
    f.dispatchEvent(land)
    expect(f.classList.contains('lift-land')).toBe(false)
  })
  it('a null box at landing hides the frame rather than flashing at a stale place', () => {
    const f = frame()
    frameLift(f, { top: 30, left: 10, width: 368, height: 22 })
    frameLand(f, null)
    expect(f.className).toBe('lift-frame')
  })
  it('null and undefined frames are ignored (a ref before mount)', () => {
    expect(() => { frameLift(null, null); frameLand(null, null); landOn(null); liftOn(undefined); liftOff(null) }).not.toThrow()
  })
})

describe('lifting and landing a plain element', () => {
  it('liftOn/liftOff add and strip the class pair', () => {
    const d = document.createElement('div')
    liftOn(d); expect(d.classList.contains('lift')).toBe(true)
    d.classList.add('lift-land'); liftOff(d)
    expect(d.className).toBe('')
  })
  it('landOn restarts a flash already running (the one reflow at a drop) and one timer survives', () => {
    vi.useFakeTimers()
    const d = document.createElement('div'); document.body.appendChild(d)
    landOn(d); vi.advanceTimersByTime(300); landOn(d)
    vi.advanceTimersByTime(400)
    expect(d.classList.contains('lift-land')).toBe(true)  // the first timer was cancelled, the second is still running
    vi.advanceTimersByTime(300)
    expect(d.classList.contains('lift-land')).toBe(false)
  })
})

describe('markLand / paintLand — landing on a DOM that is rebuilt after the drop', () => {
  it('paints the marked node once it exists, and a later repaint of that same node adds nothing', () => {
    markLand('[data-move="mv:d.0.0.2"]')
    paintLand()                                             // nothing to find yet
    expect(pendingLand()).toEqual({ sel: '[data-move="mv:d.0.0.2"]', climb: undefined })
    const row = document.createElement('div'); row.setAttribute('data-move', 'mv:d.0.0.2'); document.body.appendChild(row)
    paintLand()
    expect(row.classList.contains('lift-land')).toBe(true)
    row.classList.remove('lift-land'); paintLand()
    expect(row.classList.contains('lift-land'), 'the node it already lit is never re-flashed').toBe(false)
  })
  /* ONE FLASH PER NODE, not per mark (corrected 6 Sep 26, measured in Chromium
     against the built board). refreshHighlights runs once per re-rendered
     surface, and on the board TWO fire in the same commit — EditWeek's ~20ms
     BEFORE SchedBoard's, while #sbBoard still holds its pre-drop markup. A mark
     spent on the first node found was spent on a doomed one: the innerHTML swap
     that followed replaced it and the drop flashed nothing at all. */
  it('hands the flash on when the pass that found the node was looking at a DOM about to be rebuilt', () => {
    const stale = document.createElement('div'); stale.setAttribute('data-move', 'mv:g.0.1'); document.body.appendChild(stale)
    markLand('[data-move="mv:g.0.1"]')
    paintLand()                                             // the early pass, on markup that has not caught up
    expect(stale.classList.contains('lift-land')).toBe(true)
    stale.remove()                                          // …and the rebuild throws that node away
    const fresh = document.createElement('div'); fresh.setAttribute('data-move', 'mv:g.0.1'); document.body.appendChild(fresh)
    paintLand()                                             // the pass that rebuilt it
    expect(fresh.classList.contains('lift-land'), 'the row the user is actually looking at flashes').toBe(true)
  })
  it('climbs to the container the caller names (a formation that travelled)', () => {
    const line = document.createElement('div'); line.className = 'sb-line'
    const jet = document.createElement('div'); jet.setAttribute('data-move', 'mv:ac.0.1.2.0'); line.appendChild(jet); document.body.appendChild(line)
    markLand('[data-move^="mv:ac.0.1.2."]', '.sb-line'); paintLand()
    expect(line.classList.contains('lift-land')).toBe(true)
    expect(jet.classList.contains('lift-land')).toBe(false)
  })
  it('a mark nobody painted for a second is dropped, not painted late', () => {
    vi.useFakeTimers()
    markLand('[data-move="mv:d.0.0.9"]')
    vi.advanceTimersByTime(1100)
    const row = document.createElement('div'); row.setAttribute('data-move', 'mv:d.0.0.9'); document.body.appendChild(row)
    paintLand()
    expect(row.classList.contains('lift-land')).toBe(false)
    expect(pendingLand()).toBeNull()
  })
  it('a second mark replaces the first — one slot, the latest drop wins', () => {
    markLand('[data-a]'); markLand('[data-b]')
    expect(pendingLand()!.sel).toBe('[data-b]')
  })
})
