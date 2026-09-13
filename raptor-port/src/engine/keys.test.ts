/* Ported from reference/tfin.js — group K (key parsing) and the B48 shiftKeys
   renumbering check (originally run through w.eval because SCHED is scoped). */
import { beforeEach, describe, expect, it } from 'vitest'
import { keyDay, shiftKeys, permuteKeys, moveKeys } from './keys'
import { SCHED } from './publish'

beforeEach(() => {
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
})

describe('slot / text key parsing (tfin K)', () => {
  it('keyDay resolves the day for every prefix', () => {
    const cases: [string, number][] = [['0.1.0.0.p', 0], ['ar:0.1.0', 0], ['at:3.1.0', 3], ['st:2.1.0.0', 2], ['it:4.1', 4],
      ['d:0.0.1', 0], ['s:1.amt.1.pax.3', 1], ['g:2.2', 2], ['a:3.4', 3],
      ['dn:1.0', 1], ['sn:2', 2], ['ap:0.1.k', 0], ['wl:4.1', 4], ['ff:2.1.0.k', 2],
      ['fr:3.1.0.0', 3], ['dl:1.1', 1], ['dr:0.1.2.k', 0], ['sr:2.amt.1.k', 2], ['gr:1.2.k', 1]]
    const kbad = cases.filter(c => keyDay(c[0]) !== c[1])
    expect(kbad, kbad.map(c => c[0] + '→' + keyDay(c[0])).join(' ')).toEqual([])
  })

  it('keyDay rejects junk', () => {
    expect(keyDay('nonsense')).toBe(-1)
    expect(keyDay('xx:zz')).toBe(-1)
  })

  /* keyDay still reads the day off a rid-anchored key — the day index stays a
     literal first component, only the position slots collapse to rids */
  it('keyDay reads the day off a rid-anchored key too', () => {
    expect(keyDay('wl:0.r1abc')).toBe(0)
    expect(keyDay('3.r1.r2.r3.p')).toBe(3)
    expect(keyDay('ff:2.rW.rF.cs')).toBe(2)
  })
})

/* ADDRESSING BY rid (task 4): shiftKeys/permuteKeys renumber POSITIONAL keys but
   are automatically INERT on a rid-anchored one — +«rid» is NaN, so the key is
   returned unchanged (never renumbered, never dropped). The renumber's "effect"
   stops; the calls stay, still live for the positional-fallback and note space. */
describe('shiftKeys / permuteKeys are inert on rid-anchored keys', () => {
  it('a delete renumbers a positional neighbour but leaves a rid key untouched', () => {
    SCHED.pending = {}
    SCHED.changes = { 'wl:0.rWAVE': 1, 'wl:0.2': 2, 'dn:0.2': 3 }
    shiftKeys('wl:0.', 0, 1)                 // delete positional wave 1
    expect(SCHED.changes['wl:0.rWAVE']).toBe(1)   // the rid key rode through unchanged
    expect(SCHED.changes['wl:0.1']).toBe(2)       // the positional neighbour shifted 2→1
    expect(SCHED.changes['dn:0.2']).toBe(3)       // a different key space is untouched
  })
  it('a reorder permutes positional keys but leaves a rid key untouched', () => {
    SCHED.pending = {}
    SCHED.changes = { 'wl:0.rWAVE': 1, 'wl:0.0': 2, 'wl:0.1': 3 }
    permuteKeys('wl:0.', 0, [1, 0])          // swap positional waves 0 and 1
    expect(SCHED.changes['wl:0.rWAVE']).toBe(1)   // the rid key did not move
    expect(SCHED.changes['wl:0.1']).toBe(2)       // positional 0 → 1
    expect(SCHED.changes['wl:0.0']).toBe(3)       // positional 1 → 0
  })
})

describe('shiftKeys renumbering (tfin B48)', () => {
  it('drops the deleted row, shifts the rest, leaves the earlier ones', () => {
    SCHED.pending = {}
    SCHED.changes = { 'dn:0.0': 1, 'dn:0.1': 1, 'dn:0.3': 2 }
    SCHED.als = [{ n: 1, keys: ['dn:0.1', 'dn:0.3'], sign: {} }]
    shiftKeys('dn:0.', 0, 1)
    const c = SCHED.changes
    expect(c['dn:0.0']).toBe(1)
    expect(c['dn:0.1']).toBeUndefined()
    expect(c['dn:0.2']).toBe(2)
    expect(SCHED.als[0].keys.join(',')).toBe('dn:0.2')
  })

  it('a different key space is left alone', () => {
    SCHED.pending = { 'dn:1.0': 1, 'ap:0.1.prog': 1 }
    shiftKeys('dn:0.', 0, 0)
    expect(Object.keys(SCHED.pending).sort()).toEqual(['ap:0.1.prog', 'dn:1.0'])
  })
})

describe('permuteKeys / moveKeys reordering', () => {
  it('moveKeys carries a mark down with its row and slides the ones it passes', () => {
    SCHED.changes = { 'dn:0.0': 'a', 'dn:0.1': 'b', 'dn:0.2': 'c', 'dn:0.3': 'd' }
    moveKeys('dn:0.', 0, 3, 1, 4)          // row 3 lands at index 1
    expect(SCHED.changes).toEqual({ 'dn:0.0': 'a', 'dn:0.1': 'd', 'dn:0.2': 'b', 'dn:0.3': 'c' })
  })

  it('moveKeys works upward as well as downward', () => {
    SCHED.changes = { 'dn:0.0': 'a', 'dn:0.1': 'b', 'dn:0.2': 'c', 'dn:0.3': 'd' }
    moveKeys('dn:0.', 0, 1, 3, 4)          // row 1 lands at index 3
    expect(SCHED.changes).toEqual({ 'dn:0.0': 'a', 'dn:0.1': 'c', 'dn:0.2': 'd', 'dn:0.3': 'b' })
  })

  /* the property that separates this from shiftKeys: a delete DROPS a key,
     a move must never lose one. A vanished mark is an AL that silently
     forgets an amendment. */
  it('drops nothing and collides nothing — it is a bijection', () => {
    const before: any = {}
    for (let i = 0; i < 6; i++) before['dn:0.' + i] = 'v' + i
    SCHED.changes = { ...before }
    moveKeys('dn:0.', 0, 4, 0, 6)
    expect(Object.keys(SCHED.changes).length).toBe(6)
    expect(Object.values(SCHED.changes).sort()).toEqual(Object.values(before).sort())
  })

  it('rewrites pending and every issued AL, not just changes', () => {
    SCHED.pending = { 'dn:0.2': 1 }
    SCHED.changes = { 'dn:0.0': 1 }
    SCHED.als = [{ n: 1, keys: ['dn:0.2', 'dn:0.0'], sign: {} }]
    moveKeys('dn:0.', 0, 2, 0, 3)
    expect(SCHED.pending['dn:0.0']).toBe(1)
    expect(SCHED.changes['dn:0.1']).toBe(1)
    expect(SCHED.als[0].keys).toEqual(['dn:0.0', 'dn:0.1'])
  })

  it('leaves a different key space alone', () => {
    SCHED.changes = { 'dn:0.0': 1, 'dn:1.0': 2, 'ap:0.0.prog': 3 }
    moveKeys('dn:0.', 0, 0, 1, 2)
    expect(SCHED.changes['dn:1.0']).toBe(2)
    expect(SCHED.changes['ap:0.0.prog']).toBe(3)
  })

  it('keeps the tail of a longer key intact', () => {
    SCHED.changes = { 'ap:0.0.prog': 1, 'ap:0.1.sub': 2 }
    moveKeys('ap:0.', 0, 0, 1, 2)
    expect(SCHED.changes).toEqual({ 'ap:0.1.prog': 1, 'ap:0.0.sub': 2 })
  })

  it('a no-op move and an out-of-range index change nothing', () => {
    const c = { 'dn:0.0': 1, 'dn:0.1': 2 }
    SCHED.changes = { ...c }
    moveKeys('dn:0.', 0, 1, 1, 2)
    moveKeys('dn:0.', 0, 9, 0, 2)
    moveKeys('', 0, 0, 1, 2)
    expect(SCHED.changes).toEqual(c)
  })

  it('an index outside the permutation is left alone rather than dropped', () => {
    SCHED.changes = { 'dn:0.0': 1, 'dn:0.7': 2 }
    permuteKeys('dn:0.', 0, [1, 0])
    expect(SCHED.changes).toEqual({ 'dn:0.1': 1, 'dn:0.7': 2 })
  })

  it('permuteKeys applies an arbitrary reordering, not just a single move', () => {
    SCHED.changes = { 'g:0.0': 'a', 'g:0.1': 'b', 'g:0.2': 'c' }
    permuteKeys('g:0.', 0, [2, 0, 1])      // new 0 was old 2, new 1 was old 0, new 2 was old 1
    expect(SCHED.changes).toEqual({ 'g:0.0': 'c', 'g:0.1': 'a', 'g:0.2': 'b' })
  })
})

/* A PHASE-2 AL RECORD IS NEVER GIVEN LEGACY FIELDS (P2-REV2-08). A current-format
   record carries a frozen `diff` + `snap`, not live keys/adds/structAdds — those
   were removed from the record contract. The old remap assigned an EMPTY array to
   each absent field, re-adding all three to every issued record (unrelated days
   included), so the serialized document diverged from the contract though
   snap/diff stayed intact. The remap must touch a field only when it is present. */
describe('shiftKeys / permuteKeys leave a Phase-2 record byte-shaped (P2-REV2-08)', () => {
  const phase2Rec = () => ({ id: 'v1', di: 3, iso: '2026-07-16', seq: 1, snap: { d: {} }, diff: [{ kind: 'change' }] })

  it('shiftKeys does not add keys/adds/structAdds to a record that never had them', () => {
    SCHED.als = [phase2Rec()]
    shiftKeys('gr:0.', 0, 1)                       // a delete on an UNRELATED day (0), record is on day 3
    const a: any = SCHED.als[0]
    expect('keys' in a, 'no empty keys array bolted on').toBe(false)
    expect('adds' in a, 'no empty adds array bolted on').toBe(false)
    expect('structAdds' in a, 'no empty structAdds array bolted on').toBe(false)
    expect(a.diff, 'the frozen diff is untouched').toEqual([{ kind: 'change' }])
    expect(a.snap, 'the frozen snapshot is untouched').toEqual({ d: {} })
  })

  it('permuteKeys does not add keys/adds/structAdds either', () => {
    SCHED.als = [phase2Rec()]
    permuteKeys('wl:0.', 0, [1, 0])               // a reorder on an unrelated day
    const a: any = SCHED.als[0]
    expect('keys' in a || 'adds' in a || 'structAdds' in a, 'none of the three legacy fields appear').toBe(false)
  })

  it('a LEGACY record with live keys is still remapped', () => {
    SCHED.als = [{ n: 1, di: 0, keys: ['gr:0.2.prog'], adds: [], structAdds: [] } as any]
    shiftKeys('gr:0.', 0, 1)                       // delete row 1 → row 2 slides to 1
    expect((SCHED.als[0] as any).keys, 'the legacy key was renumbered').toEqual(['gr:0.1.prog'])
  })
})
