// src/state/ord.test.ts
/* [DB-READINESS] group A, phase 2 (plan §2.3) — a list's order on each row: minted from the neighbours, never touching a
   row that still sits in order; a moved row is one row renumbered; ties break by id. */
import { describe, it, expect } from 'vitest'
import { mintOrd, byOrd, sortByOrd, ORD_STEP } from './ord'

const id = (r: any) => r.id
const rows = (...ids: string[]): any[] => ids.map(i => ({ id: i }))
const ords = (l: any[]) => l.map(r => r.ord)
const snapshot = (l: any[]) => JSON.stringify(l)

describe('mintOrd', () => {
  it('a list with none: 1024 apart, in list order', () => {
    const l = rows('a', 'b', 'c')
    expect(mintOrd(l, id)).toBe(true)
    expect(ords(l)).toEqual([ORD_STEP, 2 * ORD_STEP, 3 * ORD_STEP])
  })

  it('a new row on top takes 1024 below the first — no other row changes', () => {
    const l = rows('a', 'b'); mintOrd(l, id)
    const before = snapshot(l)
    l.unshift({ id: 'new' })
    mintOrd(l, id)
    expect(l[0].ord).toBe(0)
    expect(snapshot(l.slice(1))).toBe(before)
  })

  it('a new row at the bottom 1024 above the last; a run of rows in a gap, evenly spaced', () => {
    const l = rows('a', 'b'); mintOrd(l, id)
    l.push({ id: 'z' }); l.splice(1, 0, { id: 'p' }, { id: 'q' })
    mintOrd(l, id)
    expect(ords(l)).toEqual([1024, 1024 + 1024 / 3, 1024 + 2048 / 3, 2048, 3072])
  })

  it('a MOVED row takes a new place; the rows around it keep theirs', () => {
    const l = rows('a', 'b', 'c', 'd', 'e'); mintOrd(l, id)
    const [e] = l.splice(4, 1); l.unshift(e)          // e dragged to the top
    const others = snapshot(l.slice(1))
    mintOrd(l, id)
    expect(l[0].ord).toBeLessThan(l[1].ord)
    expect(snapshot(l.slice(1))).toBe(others)
  })

  it('when a gap closes, the whole list is renumbered — and stays in its order', () => {
    const l = [{ id: 'a', ord: 1 }, { id: 'b', ord: 1 + Number.EPSILON }]   // no number fits between
    l.splice(1, 0, { id: 'mid' } as any)
    mintOrd(l, id)
    expect(l.map(r => r.id)).toEqual(['a', 'mid', 'b'])
    expect(ords(l)).toEqual([ORD_STEP, 2 * ORD_STEP, 3 * ORD_STEP])
  })

  it('nothing to do: false, nothing touched', () => {
    const l = rows('a', 'b'); mintOrd(l, id)
    const before = snapshot(l)
    expect(mintOrd(l, id)).toBe(false)
    expect(snapshot(l)).toBe(before)
  })
})

describe('the order everywhere is (ord, id)', () => {
  it('two rows at one place read by id, every time', () => {
    const l = [{ id: 'z', ord: 5 }, { id: 'a', ord: 5 }, { id: 'm', ord: 1 }]
    sortByOrd(l, id)
    expect(l.map(r => r.id)).toEqual(['m', 'a', 'z'])
    expect([{ id: 'x' }, { id: 'y', ord: 9 }].sort(byOrd(id)).map(r => r.id), 'a row with no place sorts last').toEqual(['y', 'x'])
  })
})
