/* groundOrder moved out of ui/html.ts so engine/reorder.ts can freeze a
   rendered order without the engine importing from ui/. The `man` argument is
   new: a day whose ground list has been reordered by hand stops time-sorting. */
import { describe, expect, it } from 'vitest'
import { groundOrder } from './order'

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
