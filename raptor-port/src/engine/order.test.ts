/* groundOrder moved out of ui/html.ts so engine/reorder.ts can freeze a
   rendered order without the engine importing from ui/. The `man` argument is
   new: a day whose ground list has been reordered by hand stops time-sorting. */
import { describe, expect, it } from 'vitest'
import { groundOrder, secOrder, moveSectionModel, SECTIONS } from './order'

const ROWS = [{ prog: 'C', str: '1000' }, { prog: 'A', str: '0800' }, { prog: 'B', str: '0900' }]

describe('groundOrder', () => {
  it('sorts by start time and reports each row\'s model index', () => {
    expect(groundOrder(ROWS).map(x => x.row.prog)).toEqual(['A', 'B', 'C'])
    expect(groundOrder(ROWS).map(x => x.ri)).toEqual([1, 2, 0])
  })

  it('puts rows with no start time last, in model order', () => {
    const r = [{ prog: 'X' }, { prog: 'A', str: '0800' }, { prog: 'Y' }]
    expect(groundOrder(r).map(x => x.row.prog)).toEqual(['A', 'X', 'Y'])
  })

  it('ties break on model index, so equal times keep their typed order', () => {
    const r = [{ prog: 'P', str: '0800' }, { prog: 'Q', str: '0800' }]
    expect(groundOrder(r).map(x => x.row.prog)).toEqual(['P', 'Q'])
  })

  it('man returns model order untouched', () => {
    expect(groundOrder(ROWS, true).map(x => x.row.prog)).toEqual(['C', 'A', 'B'])
    expect(groundOrder(ROWS, true).map(x => x.ri)).toEqual([0, 1, 2])
  })

  it('survives an empty or missing list', () => {
    expect(groundOrder([])).toEqual([])
    expect(groundOrder(undefined as any)).toEqual([])
  })
})

describe('secOrder / moveSectionModel (the section display order)', () => {
  it('an un-arranged day reads the plain canonical order', () => {
    expect(secOrder({})).toEqual(SECTIONS)
    expect(secOrder({ secOrder: undefined })).toEqual(SECTIONS)
    expect(SECTIONS).toEqual(['prog', 'waves', 'duty', 'sims', 'ground'])
  })

  it('a stored order stands, with any missing canonical section appended and unknowns dropped', () => {
    /* the owner put ground first, dropped nothing → the rest follow in default order */
    expect(secOrder({ secOrder: ['ground'] })).toEqual(['ground', 'prog', 'waves', 'duty', 'sims'])
    /* a hand-edited file with junk keys: junk is ignored, the real ones honoured */
    expect(secOrder({ secOrder: ['sims', 'nope', 'prog'] })).toEqual(['sims', 'prog', 'waves', 'duty', 'ground'])
    /* a duplicate cannot double a section */
    expect(secOrder({ secOrder: ['waves', 'waves'] })).toEqual(['waves', 'prog', 'duty', 'sims', 'ground'])
  })

  it('moveSectionModel nudges a section and materialises a full, sanitised order', () => {
    const d: any = {}
    expect(moveSectionModel(d, 'duty', -1)).toBe(true)       // duty up one
    expect(d.secOrder).toEqual(['prog', 'duty', 'waves', 'sims', 'ground'])
    expect(moveSectionModel(d, 'prog', 1)).toBe(true)        // prog down one
    expect(d.secOrder).toEqual(['duty', 'prog', 'waves', 'sims', 'ground'])
  })

  it('is a no-op at the ends and for an unknown key (returns false, order untouched)', () => {
    const d: any = { secOrder: ['prog', 'waves', 'duty', 'sims', 'ground'] }
    expect(moveSectionModel(d, 'prog', -1)).toBe(false)      // already first
    expect(moveSectionModel(d, 'ground', 1)).toBe(false)     // already last
    expect(moveSectionModel(d, 'nope', -1)).toBe(false)      // not a section
    expect(d.secOrder).toEqual(['prog', 'waves', 'duty', 'sims', 'ground'])
    expect(moveSectionModel(null, 'prog', 1)).toBe(false)    // no day
  })
})
