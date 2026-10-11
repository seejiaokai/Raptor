/* AN ENTRY IS ITS RECORD — what is left of "an input filed for a group" once an input is ONE record with the list of its
   people (owner D756, D759 — 11 Oct 26; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1, §4.11, and
   §5 step 2 (g)).

   UNTIL THE ONE-RULE BUILD this file pinned the old keeping: one record per man tied by a group id (`grp`), an ENTRY
   worked out on read — the records sharing a group AND the same shared fields — and the check that kept a man on it
   once (`groupBreach`, `groupSnapshot`, `groupsTouched`). All of that is gone with the group:
     · the list of inputs IS the list of entries — `entriesOf`, `entryRowsOf` and `entryLines` answer every record as its
       own, for the screens that still ask them (they go with the dead code, step 6 of the build);
     · who is in an input is the record's own list (engine/inputs.ts peopleOf) — never worked out from a group id;
     · a record stored BEFORE the build that carries a `grp` reads as the one-person input it is — D759 reading 10:
       "old shared demo inputs come back as one-person inputs"; nothing is converted (D56);
     · what one record may hold is refused at the save boundary (engine/inputs.ts shapeProblem, asked by
       state/store.ts of every record a command put) — where "one man once an entry, one filer a group" stood.

   Who is in an input, either shape, and each sentence of shapeProblem: engine/onerecord.test.ts. The one writer and the
   same boundary through the real doors over both stores: leavewar/onerecord-write.test.ts. This file keeps the cases
   the old grouping covered, said as they are true now. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { HOOKS } from '../engine/hooks'
import { INPUTS, idsOf, inputLines, shapeProblem } from '../engine/inputs'
import { entriesOf, entryLines, entryRowsOf } from './inputgroup'
import { initStore, writeInputs } from './store'

const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[] = []
let n = 0
/* a record as it was stored before the build — one `person`, and (for a group filing) the group's id and its filer */
const old = (person: string, o: Record<string, any> = {}): any => ({
  iid: `i${++n}`, person, type: 'Meeting', date: 'Feb 10', yr: 2026, allday: false, s: 540, e: 600, remarks: 'brief', ...o,
})
/* a record as it is stored now — its people, in the order they joined */
const rec = (people: string[], o: Record<string, any> = {}): any => ({
  iid: `i${++n}`, type: 'Meeting', date: 'Feb 10', yr: 2026, allday: false, s: 540, e: 600, remarks: 'brief', mod: '2026-01-15',
  by: 'stiff', at: 1, people: people.map(p => ({ p, by: 'stiff', at: 1 })), ...o,
})
const G = { grp: 'g1', grpBy: 'stiff' }

beforeEach(() => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(ISNAP)); initStore()
  said = []; HOOKS.toast = (m: any) => { said.push(String(m)) }
})
afterEach(() => { HOOKS.toast = toast; INPUTS.splice(0, INPUTS.length, ...JSON.parse(ISNAP)) })

describe('every record is its own entry (D756; the plan §5 step 2 (g))', () => {
  it('a list of inputs is the list of entries, one a record, in the order the list holds them', () => {
    const a = rec(['bane']), b = rec(['stiff', 'rocky', 'casper']), c = old('rocky')
    const es = entriesOf([a, b, c])
    expect(es.map(e => e.rows)).toEqual([[a], [b], [c]])
    expect(es.every(e => e.grp == null), 'no entry carries a group id any more').toBe(true)
    expect(entryLines([a, b, c]), 'one line a record under Personal Inputs').toEqual([[a], [b], [c]])
    for (const r of [a, b, c]) expect(entryRowsOf([a, b, c], r), 'the records of a record\'s entry: itself').toEqual([r])
  })
  it('an input for several people is ONE entry of one record — its people are the record\'s own list, in the order they joined', () => {
    const r = rec(['stiff', 'bane', 'casper', 'rocky'])
    const es = entriesOf([r])
    expect(es).toHaveLength(1)
    expect(es[0].rows).toEqual([r])
    expect(idsOf(es[0].rows[0]), 'never re-ordered A to Z: the first to join stands first').toEqual(['stiff', 'bane', 'casper', 'rocky'])
  })
  it('nothing joins two records: the same day, hours, kind and remark are still two inputs', () => {
    const a = rec(['stiff', 'bane']), b = rec(['rocky'])
    expect(entriesOf([a, b]).map(e => idsOf(e.rows[0]))).toEqual([['stiff', 'bane'], ['rocky']])
  })
  it('an empty list, or a hole in it, makes no entry', () => {
    expect(entriesOf([])).toEqual([])
    expect(entriesOf([null, rec(['bane']), undefined] as any[])).toHaveLength(1)
    expect(entryRowsOf([], null)).toEqual([])
  })
})

describe('a record stored before the build with a group id reads as a one-person input (D759 reading 10; D56)', () => {
  it('four records of one old group: four entries, each one man\'s own — the group id joins nothing', () => {
    const rows = [old('stiff', G), old('bane', G), old('casper', G), old('rocky', G)]
    const es = entriesOf(rows)
    expect(es, 'was ONE entry of four until the build').toHaveLength(4)
    expect(es.map(e => idsOf(e.rows[0]))).toEqual([['stiff'], ['bane'], ['casper'], ['rocky']])
    expect(es.map(e => e.grp)).toEqual([null, null, null, null])
    expect(inputLines(rows).map((l: any) => l.person), 'and the rules about one man\'s day read each as before').toEqual(['stiff', 'bane', 'casper', 'rocky'])
  })
  it('it breaks no rule of what a record may hold — its old group fields are not this build\'s to judge', () => {
    for (const r of [old('bane', G), old('bane', { grp: 'g1' }), old('bane', { grpBy: 'stiff' }), old('bane', { ...G, type: 'OML', allday: true })])
      expect(shapeProblem(r), JSON.stringify({ grp: r.grp, grpBy: r.grpBy, type: r.type })).toBe('')
  })
  /* THE RULE CHANGED WITH THE SHAPE (D756, D759 reading 10). "One man once an entry" was held across the RECORDS of a
     group (`groupBreach`: "Ranger is already on this input"); a man is now in an input once because the record's own list
     holds him once (below). Two old records of one man with one group id are two one-person inputs, as two Meetings a
     man files for himself always were — the save boundary has nothing to refuse. */
  it('the same man on two records of one old group is two inputs of his, and the save takes them — where the group\'s check refused the second', () => {
    expect(writeInputs(() => { INPUTS.unshift(old('bane', G)) })).toBe(true)
    expect(writeInputs(() => { INPUTS.unshift(old('bane', G)) }), 'no "Ranger is already on this input"').toBe(true)
    expect(said.join(' ')).not.toMatch(/already on this input/)
    expect(entriesOf(INPUTS.filter((r: any) => r.grp === 'g1'))).toHaveLength(2)
  })
})

describe('what one record may hold is refused at the save boundary (shapeProblem; the plan §4.1 — D655 reading 4)', () => {
  const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
  it('a person twice, nobody, two people on a medical entry or an upchit: refused whole, each with its sentence', () => {
    for (const [bad, sentence] of [
      [rec(['bane', 'rocky', 'bane']), /Ranger is already on this input/],
      [rec([]), /An input needs at least one person/],
      [rec(['bane', 'rocky'], { type: 'OML', allday: true }), /A medical entry is one person’s — each needs its own document/],
      [rec(['bane', 'rocky'], { type: 'Upchit', allday: true }), /An upchit is one person’s — each needs its own document/],
    ] as Array<[any, RegExp]>) {
      said = []
      expect(shapeProblem(bad), 'the rule itself').toMatch(sentence)
      expect(writeInputs(() => { INPUTS.unshift(bad) }), `${bad.type} ${JSON.stringify(idsOf(bad))}`).toBe(false)
      expect(live(bad.iid), 'nothing of it was kept').toBeUndefined()
      expect(said.join(' | '), 'and it says why').toMatch(sentence)
    }
  })
  it('the same records sound are saved: several people on a Meeting, one on a medical entry', () => {
    const a = rec(['bane', 'rocky']), b = rec(['bane'], { type: 'OML', allday: true, date: 'Feb 12' })
    expect(writeInputs(() => { INPUTS.unshift(a); INPUTS.unshift(b) })).toBe(true)
    expect(idsOf(live(a.iid))).toEqual(['bane', 'rocky'])
    expect(idsOf(live(b.iid))).toEqual(['bane'])
  })
  it('a record already saved that a later command would break is put back as it was — a man added twice, its last person taken out', () => {
    const a = rec(['bane', 'rocky'])
    expect(writeInputs(() => { INPUTS.unshift(a) })).toBe(true)
    const was = JSON.stringify(live(a.iid))
    expect(writeInputs(() => { live(a.iid).people.push({ p: 'rocky', by: 'stiff', at: 2 }) }), 'Hex a second time').toBe(false)
    expect(said.join(' ')).toMatch(/Hex is already on this input/)
    expect(writeInputs(() => { live(a.iid).people = [] }), 'nobody left in it').toBe(false)
    expect(JSON.stringify(live(a.iid)), 'the record as it was saved').toBe(was)
  })
  it('only what a command put is judged — a bad record nobody touched does not stop a save beside it (D56)', () => {
    /* stored data: placed in the list outside every command, as an old store would hand it over */
    const stale = rec(['bane', 'bane'])
    INPUTS.unshift(stale); initStore()
    expect(writeInputs(() => { INPUTS.unshift(rec(['rocky'])) })).toBe(true)
    expect(live(stale.iid), 'left as it is').toBeTruthy()
  })
})
