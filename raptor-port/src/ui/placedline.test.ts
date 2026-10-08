/* WHO PLACED A SHARED INPUT — one line for the whole entry (owner D655: a group filing is "one shared input, shown and
   edited as one thing"; D629: who placed it and when, in small print; the plan §3.13: "Placed by Saber for 4 people ·
   7 Oct 26, 14:32"). The single record's line is pinned in ui/sanscal-model.test.ts. */
import { describe, expect, it } from 'vitest'
import { placedLine, placedLineOf, placedShort } from './placedline'

const PEOPLE: Record<string, any> = { a: { cs: 'Saber' }, b: { cs: 'Ranger' }, c: { cs: 'Wisp' }, d: { cs: 'Anvil' } }
const T = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).getTime()
const rec = (person: string, over: any = {}) => ({ person, by: 'a', at: T(7, 14, 32), modBy: 'a', modAt: T(7, 14, 32), grp: 'g', grpBy: 'a', ...over })

describe('who placed a shared input', () => {
  it('one line for the entry: its filer, for how many people, and when', () => {
    expect(placedLineOf([rec('a'), rec('b'), rec('c'), rec('d')], PEOPLE)).toBe('Placed by Saber for 4 people · 7 Oct 26, 14:32')
  })
  it('the filer is the entry’s own, whoever added a man later; the moment is when the entry was first placed', () => {
    const rows = [rec('b', { by: 'c', at: T(8, 9, 0), modBy: 'c', modAt: T(8, 9, 0) }), rec('c'), rec('d')]
    expect(placedLineOf(rows, PEOPLE)).toBe('Placed by Saber for 3 people · 7 Oct 26, 14:32')
  })
  it('a later change to the entry is said once, the latest', () => {
    const rows = [rec('b', { modBy: 'b', modAt: T(8, 9, 10) }), rec('c', { modBy: 'd', modAt: T(9, 10, 0) })]
    expect(placedLineOf(rows, PEOPLE)).toBe('Placed by Saber for 2 people · 7 Oct 26, 14:32 · changed by Anvil · 9 Oct 26, 10:00')
  })
  it('one record is the ordinary line; none, or records that never recorded a filer, say nothing', () => {
    const one = rec('b', { grp: undefined, grpBy: undefined })
    expect(placedLineOf([one], PEOPLE)).toBe(placedLine(one, PEOPLE))
    expect(placedLineOf([], PEOPLE)).toBe('')
    expect(placedLineOf([{ person: 'b' }, { person: 'c' }], PEOPLE)).toBe('')
  })
})

/* THE SHORT LINE OF AN OPENED DAY (owner D701, 9 Oct 26 — drawing B of the shorter input: "Grit · 12 Jul, 14:42"): made
   FROM the full line, so every form of it — for someone else, for several people, changed since — shortens alike. */
describe('the short line of an opened day (D701)', () => {
  it('drops "Placed by" and the year of the day that is open', () => {
    expect(placedShort('Placed by Saber · 7 Oct 26, 14:32', 2026)).toBe('Saber · 7 Oct, 14:32')
    expect(placedShort(placedLineOf([rec('a'), rec('b'), rec('c'), rec('d')], PEOPLE), 2026)).toBe('Saber for 4 people · 7 Oct, 14:32')
    expect(placedShort('Placed by Saber for Wisp · 7 Oct 26, 14:32 · changed by Ranger · 8 Oct 26, 09:10', 2026)).toBe('Saber for Wisp · 7 Oct, 14:32 · changed by Ranger · 8 Oct, 09:10')
  })
  it('keeps the year of a moment in another year than the day’s', () => {
    expect(placedShort('Placed by Saber · 28 Dec 25, 14:32 · changed by Ranger · 2 Jan 26, 09:10', 2026)).toBe('Saber · 28 Dec 25, 14:32 · changed by Ranger · 2 Jan, 09:10')
  })
  it('no line stays no line', () => { expect(placedShort('', 2026)).toBe('') })
})
