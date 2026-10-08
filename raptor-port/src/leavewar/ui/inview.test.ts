/* IS A DAY'S COLUMN ALREADY ON SCREEN? — what decides whether an Undo or a Redo moves the Leave War's grid.

   Owner, D670 (8 Oct 26), with two phone pictures of an LL put on Mon 9 Feb, then Undo, then Redo: "the screen snaps 9
   Feb to the left … if the change was already in view for the undo and redo, the screen should just remain there and
   show the undo/redo item, instead of snapping the change to the left of the screen. I understand if u scroll away from
   the screen and press undo/redo and it snaps back to 9feb it's ok."

   The grid's jump (`Matrix.tsx jumpTo`) always puts the day at the left, just past the frozen name columns — right for
   a month button, wrong for a change he is looking at. `columnInView` is the one question asked before that jump when
   the ask is "only if hidden" (`focusDay(date, { ifHidden: true })`): is the day's column drawn, and WHOLLY inside the
   part of the grid he can see — to the right of the frozen columns, to the left of the grid's right edge?

   Pure, so it is tested here on plain boxes; that the real grid stays put is the browser gate's (e2e/leavewar.spec.ts
   "Undo and Redo leave the grid where it is…") — jsdom reports every box as 0 × 0. */
import { describe, expect, it } from 'vitest'
import { columnInView } from './inview'

/** the grid's scroller: 0…390 across (a phone), its name columns frozen over the first 120 */
const wrap = { left: 0, right: 390 }
const FROZEN = 120
const col = (left: number, width = 28) => ({ left, right: left + width, width })

describe('columnInView', () => {
  it('a column in the middle of the visible days is in view', () => {
    expect(columnInView(col(250), wrap, FROZEN)).toBe(true)
  })
  it('the first column past the frozen ones, and the last one that still fits, are in view', () => {
    expect(columnInView(col(120), wrap, FROZEN)).toBe(true)
    expect(columnInView(col(362), wrap, FROZEN)).toBe(true)
  })
  it('a column partly under the frozen name columns is not', () => {
    expect(columnInView(col(110), wrap, FROZEN)).toBe(false)
  })
  it('a column wholly under them, or off to the left, is not', () => {
    expect(columnInView(col(40), wrap, FROZEN)).toBe(false)
    expect(columnInView(col(-200), wrap, FROZEN)).toBe(false)
  })
  it('a column cut off at the right edge is not, nor one past it', () => {
    expect(columnInView(col(370), wrap, FROZEN)).toBe(false)
    expect(columnInView(col(800), wrap, FROZEN)).toBe(false)
  })
  it('a sub-pixel overhang is forgiven — a zoomed grid lays columns out on fractions', () => {
    expect(columnInView(col(119.6), wrap, FROZEN)).toBe(true)
    expect(columnInView(col(362.4), wrap, FROZEN)).toBe(true)
  })
  it('a month not drawn (no column to measure) is not in view', () => {
    expect(columnInView(null, wrap, FROZEN)).toBe(false)
  })
  it('a column with no width — the page is hidden, nothing is laid out — is not in view', () => {
    expect(columnInView({ left: 0, right: 0, width: 0 }, { left: 0, right: 0 }, 0)).toBe(false)
  })
  it('a grid whose scroller starts in from the screen’s edge is measured from its own left', () => {
    const inset = { left: 24, right: 1400 }
    expect(columnInView(col(24 + 300), inset, 300)).toBe(true)
    expect(columnInView(col(24 + 280), inset, 300)).toBe(false)
  })
})
