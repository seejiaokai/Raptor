/* Fix read 3, O3 (both readers): the grid's re-anchor put ANY day resting within a pixel of the frozen edge back on it,
   not only one a jump landed — a person's own scroll left there was moved too, and on a phone a sub-pixel write in a
   coast's lull stops the fling. The edge rule is for a jump's landing only (reanchor.ts). */
import { describe, expect, it } from 'vitest'
import { reanchorMode } from './reanchor'

const base = { coarse: false, fromJump: false, colShift: false, edge: true, landed: false }

describe('the re-anchor puts a day back on the frozen edge only where a jump landed it', () => {
  it('desktop: a day the person scrolled to within a pixel of the edge keeps the old rule (no sub-pixel write)', () => {
    expect(reanchorMode({ ...base })).toBe('shift')
  })
  it('desktop: a jumped day stays exact through the whole-year fill, long after the jump’s window', () => {
    expect(reanchorMode({ ...base, landed: true })).toBe('edge')
    expect(reanchorMode({ ...base, landed: true, fromJump: true })).toBe('edge')
  })
  it('phone: a column shift during the person’s own coast, day near the edge, never takes the edge rule', () => {
    expect(reanchorMode({ ...base, coarse: true, colShift: true })).toBe('shift')
    /* …nor a day a jump landed once the jump's window is over (a later fling's redraw) */
    expect(reanchorMode({ ...base, coarse: true, colShift: true, landed: true })).toBe('shift')
  })
  it('phone: inside the jump’s window the landed day goes back on the edge', () => {
    expect(reanchorMode({ ...base, coarse: true, fromJump: true, landed: true })).toBe('edge')
  })
  it('phone: a flick’s redraw with no jump and no column shift writes nothing', () => {
    expect(reanchorMode({ ...base, coarse: true, landed: true })).toBe('skip')
    expect(reanchorMode({ ...base, coarse: true, edge: false })).toBe('skip')
  })
  it('a day off the edge is held by the old rule everywhere', () => {
    expect(reanchorMode({ ...base, edge: false, landed: true })).toBe('shift')
    expect(reanchorMode({ ...base, edge: false, coarse: true, fromJump: true, landed: true })).toBe('shift')
  })
})
