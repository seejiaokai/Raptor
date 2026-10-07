/* AN INPUT FILED FOR A GROUP — what an "entry" is, and the one check that keeps a man on it once (owner D654, D655,
   7 Oct 26; the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13, "Records").

   A group is kept as ONE RECORD PER MAN, tied by `grp`. An ENTRY is worked out on read: the live records that share a
   `grp` AND the same shared fields. Nothing is written to keep a group in step, so a record changed alone simply reads
   as that man's own input from then on — and reads as part of the entry again if it later matches. */
import { describe, expect, it } from 'vitest'
import { entriesOf, groupBreach, groupSnapshot, groupsTouched, sharedKey, SHARED_FIELDS } from './inputgroup'

const cs: Record<string, string> = { bane: 'Ranger', stiff: 'Saber', rocky: 'Hex', casper: 'Outlaw', wisp: 'Wisp' }
const nameOf = (p: string) => cs[p] ?? p
let n = 0
const rec = (person: string, o: Record<string, any> = {}) => ({
  iid: `i${++n}`, person, type: 'Meeting', date: 'Feb 10', yr: 2026, allday: false, s: 540, e: 600, remarks: 'brief', ...o,
})
const G = { grp: 'g1', grpBy: 'stiff' }
const people = (e: { rows: any[] }) => e.rows.map(r => r.person)

describe('entriesOf — one entry for the records of a group that still say the same thing', () => {
  it('a record with no group is its own entry, in the order the list holds it', () => {
    const a = rec('bane'), b = rec('stiff'), c = rec('rocky')
    const es = entriesOf([a, b, c], nameOf)
    expect(es.map(e => e.rows)).toEqual([[a], [b], [c]])
    expect(es.every(e => e.grp == null)).toBe(true)
  })
  it('one group: one entry, its people A to Z by callsign', () => {
    const rows = [rec('stiff', G), rec('bane', G), rec('casper', G), rec('rocky', G)]
    const es = entriesOf(rows, nameOf)
    expect(es).toHaveLength(1)
    expect(es[0].grp).toBe('g1')
    expect(people(es[0]), 'Hex, Outlaw, Ranger, Saber').toEqual(['rocky', 'casper', 'bane', 'stiff'])
  })
  it('a record with no group never joins, though every field matches', () => {
    const rows = [rec('stiff', G), rec('bane', G), rec('rocky')]
    const es = entriesOf(rows, nameOf)
    expect(es).toHaveLength(2)
    expect(people(es[0])).toEqual(['bane', 'stiff'])
    expect(people(es[1])).toEqual(['rocky'])
  })
  it('one record changed alone leaves the entry — and returns when it matches again', () => {
    const a = rec('stiff', G), b = rec('bane', G), c = rec('rocky', G)
    b.e = 660
    let es = entriesOf([a, b, c], nameOf)
    expect(es.map(people)).toEqual([['rocky', 'stiff'], ['bane']])
    expect(es[1].grp, 'it still carries its group id').toBe('g1')
    b.e = 600
    es = entriesOf([a, b, c], nameOf)
    expect(es.map(people)).toEqual([['rocky', 'bane', 'stiff']])
  })
  it('each shared field tells records apart; a man\'s own fields never do', () => {
    for (const f of SHARED_FIELDS) {
      const a = rec('stiff', G), b = rec('bane', G)
      ;(b as any)[f] = f === 'allday' ? true : f === 'yr' ? 2027 : f === 's' || f === 'e' ? 615 : 'x'
      expect(entriesOf([a, b], nameOf), `shared: ${f}`).toHaveLength(2)
    }
    const a = rec('stiff', G), b = rec('bane', { ...G, oil: { '2026-02-14': 1 }, acc: 'u', hand: 2, leftAt: { x: 1 }, mod: '2026-02-01', lw: 'w1', by: 'bane', at: 5, modBy: 'bane', modAt: 9, ord: 7 })
    expect(entriesOf([a, b], nameOf), 'his own answers, filing, stamps and place').toHaveLength(1)
  })
  it('a blank end date, half or remark reads the same as none', () => {
    const a = rec('stiff', G), b = rec('bane', { ...G, endDate: undefined, half: '', remarks: 'brief' })
    expect(sharedKey(a)).toBe(sharedKey(b))
    expect(entriesOf([a, b], nameOf)).toHaveLength(1)
  })
  it('a group of one reads as one entry of one man', () => {
    const es = entriesOf([rec('stiff', G)], nameOf)
    expect(es).toHaveLength(1)
    expect(people(es[0])).toEqual(['stiff'])
  })
  it('two groups on one day are two entries', () => {
    const rows = [rec('stiff', G), rec('bane', G), rec('rocky', { grp: 'g2', grpBy: 'bane' }), rec('casper', { grp: 'g2', grpBy: 'bane' })]
    expect(entriesOf(rows, nameOf).map(people)).toEqual([['bane', 'stiff'], ['rocky', 'casper']])
  })
  it('does no tidying of its own: the same man twice is shown twice — the write is what refuses it', () => {
    const rows = [rec('bane', G), rec('bane', G), rec('stiff', G)]
    const es = entriesOf(rows, nameOf)
    expect(es).toHaveLength(1)
    expect(people(es[0])).toEqual(['bane', 'bane', 'stiff'])
  })
  it('an entry sits where its first record sits in the list', () => {
    const lone = rec('rocky'), a = rec('stiff', G), mid = rec('casper'), b = rec('bane', G)
    expect(entriesOf([lone, a, mid, b], nameOf).map(people)).toEqual([['rocky'], ['bane', 'stiff'], ['casper']])
  })
})

describe('groupBreach — one man once an entry, one filer a group; asked of the groups a command touched', () => {
  it('a sound group breaks nothing', () => {
    const rows = [rec('stiff', G), rec('bane', G)]
    expect(groupBreach(rows, new Set(['g1']), nameOf)).toBeNull()
  })
  it('the same man twice with the same shared fields is refused, naming him', () => {
    const rows = [rec('stiff', G), rec('bane', G), rec('bane', G)]
    expect(groupBreach(rows, new Set(['g1']), nameOf)).toBe('Ranger is already on this input')
  })
  it('the same man twice is allowed while his two records say different things', () => {
    const rows = [rec('stiff', G), rec('bane', G), rec('bane', { ...G, e: 700 })]
    expect(groupBreach(rows, new Set(['g1']), nameOf)).toBeNull()
  })
  it('two filers in one group are refused', () => {
    const rows = [rec('stiff', G), rec('bane', { grp: 'g1', grpBy: 'bane' })]
    expect(groupBreach(rows, new Set(['g1']), nameOf)).toMatch(/one person who filed it/)
  })
  it('a record with a group and no filer, or a filer and no group, is refused', () => {
    expect(groupBreach([rec('stiff', { grp: 'g1' })], new Set(['g1']), nameOf)).toMatch(/one person who filed it/)
  })
  it('only the groups named are judged — a group nobody touched is left alone (D56)', () => {
    const rows = [rec('bane', G), rec('bane', G), rec('stiff', { grp: 'g2', grpBy: 'stiff' })]
    expect(groupBreach(rows, new Set(['g2']), nameOf)).toBeNull()
  })
})

describe('groupsTouched — which groups a command changed', () => {
  it('a record added to a group, changed in one, or given one — and nothing for a record left as it was', () => {
    const a = rec('stiff', G), b = rec('bane', G), lone = rec('rocky'), other = rec('casper', { grp: 'g2', grpBy: 'bane' })
    const before = groupSnapshot([a, b, lone, other])
    expect([...groupsTouched(before, [a, b, lone, other])]).toEqual([])
    b.e = 700
    expect([...groupsTouched(before, [a, b, lone, other])]).toEqual(['g1'])
    b.e = 600
    Object.assign(lone, { grp: 'g3', grpBy: 'rocky' })
    expect([...groupsTouched(before, [a, b, lone, other])]).toEqual(['g3'])
    const added = rec('wisp', { grp: 'g2', grpBy: 'bane' })
    expect([...groupsTouched(before, [a, b, lone, other, added])].sort()).toEqual(['g2', 'g3'])
  })
  it('a change to a man\'s own fields alone touches no group', () => {
    const a = rec('stiff', G), b = rec('bane', G)
    const before = groupSnapshot([a, b])
    ;(b as any).oil = { '2026-02-14': 1 }; (b as any).modAt = 99
    expect([...groupsTouched(before, [a, b])]).toEqual([])
  })
})
