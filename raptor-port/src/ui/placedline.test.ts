/* WHO PLACED A SHARED INPUT — one line for the whole entry (owner D655: a group filing is "one shared input, shown and
   edited as one thing"; D629: who placed it and when, in small print; the plan §3.13: "Placed by Saber for 4 people ·
   7 Oct 26, 14:32"). The single record's line is pinned in ui/sanscal-model.test.ts. */
import { describe, expect, it } from 'vitest'
import { placedLine, placedLineOf, placedShort } from './placedline'

const PEOPLE: Record<string, any> = { a: { cs: 'Saber' }, b: { cs: 'Ranger' }, c: { cs: 'Wisp' }, d: { cs: 'Anvil' } }
const T = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).getTime()
/* AN INPUT FOR SEVERAL PEOPLE IS ONE RECORD (owner D756, 11 Oct 26 — "an input is stored as ONE record with the list of
   its people"; the one-rule plan §4.5 "By Saber": the input's `by`). These fixtures used to build a shared input as one
   record a man tied by a group id (`grp` / `grpBy`), and the line gathered its filer, its first moment and its latest
   change ACROSS them. They build the ONE record now: its own `by`, `at`, `modBy` and `modAt` are the four facts, and
   who put a person in later rides that person's own entry. Every assertion keeps its sentence. */
const rec = (person: string, over: any = {}) => ({ person, by: 'a', at: T(7, 14, 32), modBy: 'a', modAt: T(7, 14, 32), ...over })
const shared = (people: Array<string | { p: string; by?: string; at?: number }>, over: any = {}) => {
  const r: any = rec('', over)
  delete r.person
  r.people = people.map(x => (typeof x === 'string' ? { p: x, by: r.by, at: r.at } : { by: r.by, at: r.at, ...x }))
  return r
}

describe('who placed a shared input', () => {
  it('one line for the entry: its filer, for how many people, and when', () => {
    expect(placedLineOf([shared(['a', 'b', 'c', 'd'])], PEOPLE)).toBe('Placed by Saber for 4 people · 7 Oct 26, 14:32')
  })
  it('the filer is the input’s own, whoever added a man later; the moment is when the input was first placed', () => {
    const r = shared([{ p: 'b', by: 'c', at: T(8, 9, 0) }, 'c', 'd'])
    expect(placedLineOf([r], PEOPLE)).toBe('Placed by Saber for 3 people · 7 Oct 26, 14:32')
  })
  /* (the latest of the records' changes, once; the one record carries its one last change) */
  it('a later change to the input is said once, the latest', () => {
    const r = shared(['b', 'c'], { modBy: 'd', modAt: T(9, 10, 0) })
    expect(placedLineOf([r], PEOPLE)).toBe('Placed by Saber for 2 people · 7 Oct 26, 14:32 · changed by Anvil · 9 Oct 26, 10:00')
  })
  it('one person is the ordinary line; none, or an input that never recorded a filer, says nothing', () => {
    const one = rec('b')
    expect(placedLineOf([one], PEOPLE)).toBe(placedLine(one, PEOPLE))
    expect(placedLine(one, PEOPLE)).toBe('Placed by Saber for Ranger · 7 Oct 26, 14:32')
    expect(placedLineOf([], PEOPLE)).toBe('')
    expect(placedLineOf([{ people: [{ p: 'b' }, { p: 'c' }] }], PEOPLE)).toBe('')
  })
  /* a record stored before the one-rule build — one `person`, no list — is the one-person input it always was (D756) */
  it('a one-person record in the OLD shape reads the same line as one in the new', () => {
    expect(placedLine(rec('b'), PEOPLE)).toBe(placedLine(shared(['b']), PEOPLE))
    expect(placedLine(rec('a'), PEOPLE), 'his own filing names nobody it is "for"').toBe('Placed by Saber · 7 Oct 26, 14:32')
    expect(placedLine(shared(['a']), PEOPLE)).toBe('Placed by Saber · 7 Oct 26, 14:32')
    /* …and one that still carries an old group id is one man's input: nothing is gathered across records (D759 reading 10) */
    expect(placedLineOf([rec('b', { grp: 'g', grpBy: 'a' })], PEOPLE)).toBe('Placed by Saber for Ranger · 7 Oct 26, 14:32')
  })
})

/* THE SHORT LINE OF AN OPENED DAY (owner D701, 9 Oct 26 — drawing B of the shorter input: "Grit · 12 Jul, 14:42"): made
   FROM the full line, so every form of it — for someone else, for several people, changed since — shortens alike. */
describe('the short line of an opened day (D701)', () => {
  it('drops "Placed by" and the year of the day that is open', () => {
    expect(placedShort('Placed by Saber · 7 Oct 26, 14:32', 2026)).toBe('Saber · 7 Oct, 14:32')
    expect(placedShort(placedLineOf([shared(['a', 'b', 'c', 'd'])], PEOPLE), 2026)).toBe('Saber for 4 people · 7 Oct, 14:32')
    expect(placedShort('Placed by Saber for Wisp · 7 Oct 26, 14:32 · changed by Ranger · 8 Oct 26, 09:10', 2026)).toBe('Saber for Wisp · 7 Oct, 14:32 · changed by Ranger · 8 Oct, 09:10')
  })
  it('keeps the year of a moment in another year than the day’s', () => {
    expect(placedShort('Placed by Saber · 28 Dec 25, 14:32 · changed by Ranger · 2 Jan 26, 09:10', 2026)).toBe('Saber · 28 Dec 25, 14:32 · changed by Ranger · 2 Jan, 09:10')
  })
  it('no line stays no line', () => { expect(placedShort('', 2026)).toBe('') })
})
