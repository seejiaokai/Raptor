/* THE MANNING BLOCK'S ONE ORDER — the squadron's counters AND the four fixed rows (owner, D674, 8 Oct 26: "Can
   rearrange allow newly created counter rows be allowed to moved to anywhere in between the fixed blue dot rows? Even
   to below the 4 as well."). `OUTSTANDING.md` `[LW-COUNTERS-AMONG-FIXED]`.

   The pure half: what the saved list means. The four readings told to him, each pinned here or in the store's test
   (countersamong.test.ts): (1) the four keep their own order and only counters move; (2) every counter may go
   anywhere; (3) one order for the squadron, saved; (4) a squadron that has never moved a counter among them sees what
   it saw before — its counters above the four. */
import { describe, expect, it } from 'vitest'
import { FIXED_ROWS, blockOrder, isFixedRow, orderToSave } from './fixedrows'

const [RP, RW, AP, AW] = FIXED_ROWS

describe('what a saved order means — blockOrder', () => {
  it('nothing saved: the counters as they were made, then the four (reading 4)', () => {
    expect(blockOrder([], ['a', 'b'])).toEqual(['a', 'b', RP, RW, AP, AW])
  })
  it('no counter at all: the four alone, Required P first', () => {
    expect(blockOrder([], [])).toEqual([RP, RW, AP, AW])
    expect([...FIXED_ROWS]).toEqual(['@req-p', '@req-w', '@avail-p', '@avail-w'])
  })
  it('an order saved before D674 names no fixed row: it reads as its counters, then the four', () => {
    expect(blockOrder(['b', 'a'], ['a', 'b'])).toEqual(['b', 'a', RP, RW, AP, AW])
  })
  it('a counter saved between two fixed rows, and one below all four, stay exactly there (reading 2)', () => {
    const saved = ['a', RP, 'b', RW, AP, 'c', AW, 'd']
    expect(blockOrder(saved, ['a', 'b', 'c', 'd'])).toEqual(saved)
  })
  it('a counter above all four when every other one is below', () => {
    expect(blockOrder([RP, RW, AP, AW, 'a', 'b'], ['a', 'b'])).toEqual([RP, RW, AP, AW, 'a', 'b'])
  })
  it('the four keep their own order whatever the saved list says (reading 1) — a damaged list is put right, the counters keeping their slots', () => {
    expect(blockOrder([AW, 'a', AP, RW, 'b', RP], ['a', 'b'])).toEqual([RP, 'a', RW, AP, 'b', AW])
  })
  it('a list that names only some of the four (damage) gets the rest back at the foot, still in their order', () => {
    expect(blockOrder(['a', AP, 'b'], ['a', 'b'])).toEqual(['a', RP, 'b', RW, AP, AW])
  })
  it('a counter made since the order was saved appears just above Required P — where a new counter has always appeared', () => {
    expect(blockOrder(['b', 'a'], ['a', 'b', 'c'])).toEqual(['b', 'a', 'c', RP, RW, AP, AW])
  })
  it('…also when other counters sit among and below the four', () => {
    expect(blockOrder(['a', RP, 'b', RW, AP, AW, 'c'], ['a', 'b', 'c', 'd', 'e'])).toEqual(['a', 'd', 'e', RP, 'b', RW, AP, AW, 'c'])
  })
  it('an id that is no counter any more is dropped, and a doubled one counts once', () => {
    expect(blockOrder(['gone', 'a', 'a', RP, RP, RW, AP, AW, 'a'], ['a'])).toEqual(['a', RP, RW, AP, AW])
  })
  it('never loses or doubles a row: every counter and each of the four, once', () => {
    const counters = ['a', 'b', 'c', 'd']
    for (const saved of [[], ['d'], [AW], ['c', AW, 'x', 'c', RP], [RW, RW, 'a'], ['b', RP, 'a', RW, 'd', AP, 'c', AW]]) {
      const out = blockOrder(saved, counters)
      expect([...out].sort(), JSON.stringify(saved)).toEqual([...counters, ...FIXED_ROWS].sort())
      expect(out.filter(isFixedRow), JSON.stringify(saved)).toEqual([...FIXED_ROWS])
    }
  })
})

describe('a fixed row\'s token', () => {
  it('is one no counter can ever be given: a counter\'s id is made of a–z, 0–9 and dashes (CounterForm mintId)', () => {
    for (const f of FIXED_ROWS) expect(/^[a-z0-9-]+$/.test(f), f).toBe(false)
  })
  it('isFixedRow knows the four and nothing else — not the two Available rows\' own rule ids', () => {
    for (const f of FIXED_ROWS) expect(isFixedRow(f)).toBe(true)
    for (const x of ['availp', 'availw', 'req-p', 'sets', '']) expect(isFixedRow(x), x).toBe(false)
  })
})

describe('what is saved — orderToSave', () => {
  it('the four at the foot, in their own order, is what a list without them already means: they are left out', () => {
    expect(orderToSave(['b', 'a', RP, RW, AP, AW])).toEqual(['b', 'a'])
    expect(orderToSave([RP, RW, AP, AW])).toEqual([])
  })
  it('a counter among or below the four: the whole order is saved, fixed rows and all', () => {
    expect(orderToSave(['b', RP, 'a', RW, AP, AW])).toEqual(['b', RP, 'a', RW, AP, AW])
    expect(orderToSave(['b', RP, RW, AP, AW, 'a'])).toEqual(['b', RP, RW, AP, AW, 'a'])
  })
  it('and what is saved reads back as the order it was made from', () => {
    const counters = ['a', 'b', 'c']
    for (const order of [['a', 'b', 'c', RP, RW, AP, AW], ['c', RP, 'a', RW, AP, AW, 'b'], [RP, RW, AP, AW, 'a', 'b', 'c'], ['b', 'a', RP, RW, AP, 'c', AW]]) {
      expect(blockOrder(orderToSave(order), counters), JSON.stringify(order)).toEqual(order)
    }
  })
})
