// @vitest-environment node
/* [TRK-ROUND-SEEN] (2) and (3), [UI-CONSISTENCY-LOOK] round 5 (c) — the pictures round's Tracker answers (owner D1790,
   D1791, D1792 (c), 8 Nov 26). The marking window's placing is a pure rule (app/popPlace.js), pinned here on the
   numbers the drawing measured at his iPhone's size (notes-marks.md §1): the window 429 tall, 210 wide; the tabs' foot,
   which is the chart box's top, at 165; the screen 874 tall. The ✕ and the slide are pinned in the browser suite. */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { placePop, POP_EDGE, POP_GAP } from './app/popPlace.js'

const PH = { w: 210, h: 429, vw: 402, vh: 874, top: 165 }
const at = (top: number, room = 5000) => ({ ...PH, ball: { top, bottom: top + 29 }, tap: { x: 200, y: top + 14 }, room })

describe('D1790 — where the marking window opens', () => {
  it('under the event, nothing moving, where it fits whole there', () => {
    const p = placePop(at(200))
    expect(p).toMatchObject({ slide: 0, how: 'below', y: 229 + POP_GAP })
    expect(p.y + PH.h).toBeLessThanOrEqual(PH.vh - POP_EDGE)
  })
  it('ACG-09 landed by Find (419–448): the chart slides it up under the tabs — 232px, to 187–216, as drawn — and the window opens whole under it, clear of the tabs and the event', () => {
    const p = placePop(at(419))
    expect(p.how).toBe('slide')
    expect(p.slide, "the drawing's slide").toBe(232)
    expect(p.y, 'under the event once slid').toBe(448 - p.slide + POP_GAP)
    expect(p.y + PH.h, 'whole on screen').toBeLessThanOrEqual(PH.vh - POP_EDGE)
    expect(419 - p.slide, 'the event stays under the tabs').toBeGreaterThanOrEqual(PH.top)
  })
  it('the band the drawing measured (event centres 440–600): every one slides, none opens over the tabs', () => {
    for (let c = 440; c <= 600; c += 20) {
      const p = placePop(at(c - 14))
      expect(p.how).toBe('slide')
      expect(p.y).toBeGreaterThanOrEqual(PH.top)
    }
  })
  it('near the chart\'s end, a slide short of the tabs that still fits the window is A, stopped where the chart ends', () => {
    const p = placePop(at(419, 100))
    expect(p).toMatchObject({ slide: 100, how: 'slide', y: 448 - 100 + POP_GAP })
  })
  it('an event too near the chart\'s end to slide: nothing moves, the window is held between the tabs and the event (the page\'s B)', () => {
    const p = placePop(at(489, 40))
    expect(p).toMatchObject({ slide: 0, how: 'above' })
    expect(p.y, 'not over the tabs').toBeGreaterThanOrEqual(PH.top)
    expect(p.y + p.maxH, 'not over the event').toBeLessThanOrEqual(489 - POP_GAP)
  })
  it('a low event at the chart\'s end with room above: the window opens whole above it, nothing moving', () => {
    const p = placePop(at(700, 0))
    expect(p).toMatchObject({ slide: 0, how: 'above', maxH: PH.h, y: 700 - POP_GAP - PH.h })
  })
  it('a phone on its side (390 tall): never over the bars; the event slides as high as it may and the window scrolls inside itself', () => {
    const p = placePop({ w: 210, h: 429, vw: 844, vh: 390, top: 150, ball: { top: 300, bottom: 329 }, tap: { x: 400, y: 314 }, room: 5000 })
    expect(p.how).toBe('short')
    expect(300 - p.slide).toBeGreaterThanOrEqual(150)
    expect(p.y).toBeGreaterThanOrEqual(150)
    expect(p.y + p.maxH).toBeLessThanOrEqual(390 - POP_EDGE)
  })
  /* Astra's read, finding 3 (8 Nov 26): sideways, a slide stopped short (the chart's end, or a slide cut off) left the
     window a forced 120 tall under the event, its foot past the screen's (333 + 120 = 453 on a 390 screen), while 142
     stood free above the event */
  it('a phone on its side with the chart unable to slide: never past the screen\'s foot — held above the event, scrolling inside', () => {
    for (const room of [0, 50]) {
      const p = placePop({ w: 210, h: 429, vw: 844, vh: 390, top: 150, ball: { top: 300, bottom: 329 }, tap: { x: 400, y: 314 }, room })
      expect(p.y, `room ${room}: not over the bars`).toBeGreaterThanOrEqual(150)
      expect(p.y + p.maxH, `room ${room}: not past the screen's foot`).toBeLessThanOrEqual(390 - POP_EDGE)
      expect(p, `room ${room}`).toMatchObject({ slide: 0, how: 'above' })
      expect(p.y + p.maxH, `room ${room}: not over the event`).toBeLessThanOrEqual(300 - POP_GAP)
    }
  })
  it('wherever it opens, its foot never passes the screen\'s and its top never the chart box\'s', () => {
    for (let vh = 300; vh <= 900; vh += 50) for (let bt = 160; bt < vh - 30; bt += 37) for (const room of [0, 30, 120, 5000]) {
      const p = placePop({ w: 210, h: 429, vw: 402, vh, top: 150, ball: { top: bt, bottom: bt + 29 }, tap: { x: 100, y: bt + 14 }, room })
      const at = `vh ${vh}, event ${bt}, room ${room}`
      expect(p.y, at).toBeGreaterThanOrEqual(150)
      expect(p.y + p.maxH, at).toBeLessThanOrEqual(vh - POP_EDGE)
      expect(p.slide, at).toBeLessThanOrEqual(room)
    }
  })
  it('never past the screen\'s right edge', () => {
    expect(placePop({ ...at(200), tap: { x: 380, y: 214 } }).x).toBe(PH.vw - PH.w - POP_EDGE)
  })
})

describe('D1792 (c) — ↺ Restore wears the drawn Reset arrow', () => {
  it('the Syllabus and Course order windows\' Restore is the drawn arrow, not the typed ↺', () => {
    const src = readFileSync(new URL('./components/Modals.jsx', import.meta.url), 'utf8')
    expect(src).toMatch(/<ResetGlyph \/> Restore<\/button>/)
    expect(src).not.toMatch(/↺ Restore/)
  })
})
