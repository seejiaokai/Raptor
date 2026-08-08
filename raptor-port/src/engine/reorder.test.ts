/* The reorder movers. The model half is the easy half; the half that fails
   SILENTLY is the amendment bookkeeping, so every mover is asserted against a
   pending mark, a changes entry and an ISSUED AL at once. Snapshot/restore of
   DAYS follows engine/insights.test.ts so mutations cannot leak between files. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { SCHED } from './publish'
import {
  moveFormation, moveAircraft, moveDutyRow, moveSimRow,
  moveGroundRow, moveProgRow, moveNote, applyMove,
} from './reorder'
import { groundOrder } from './order'

const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
})

describe('moveFormation', () => {
  it('reorders the wave and takes every jet with it, in order', () => {
    const w = DAYS[0].waves[0]
    if (w.formations.length < 2) throw new Error('seed day 0 wave 0 needs two formations')
    const was = w.formations.map((f: any) => f.cs)
    const jets = w.formations[1].aircraft.map((a: any) => a.p)
    expect(moveFormation(0, 0, 1, 0)).toBe(true)
    expect(w.formations.map((f: any) => f.cs)).toEqual([was[1], was[0], ...was.slice(2)])
    expect(w.formations[0].aircraft.map((a: any) => a.p)).toEqual(jets)
  })

  it('carries a pending mark, a changes entry and an issued AL key with the row', () => {
    SCHED.pending = { 'ff:0.0.1.cs': 1 }
    SCHED.changes = { 'fr:0.0.1.0': 1, '0.0.1.0.p': 1 }
    SCHED.als = [{ n: 1, keys: ['st:0.0.1.0', 'at:0.0.1'], sign: {} }]
    moveFormation(0, 0, 1, 0)
    expect(SCHED.pending['ff:0.0.0.cs']).toBe(1)
    expect(SCHED.changes['fr:0.0.0.0']).toBe(1)
    expect(SCHED.changes['0.0.0.0.p']).toBe(1)
    expect(SCHED.als[0].keys).toEqual(['st:0.0.0.0', 'at:0.0.0'])
  })

  it('marks the moved row at its NEW address so the day goes out amended', () => {
    moveFormation(0, 0, 1, 0)
    expect(SCHED.pending['ff:0.0.0.cs']).toBe(1)
  })

  it('refuses an out-of-range index and a no-op, changing nothing', () => {
    const was = JSON.stringify(DAYS[0].waves[0].formations)
    expect(moveFormation(0, 0, 0, 0)).toBe(false)
    expect(moveFormation(0, 0, 9, 0)).toBe(false)
    expect(moveFormation(0, 0, 0, 9)).toBe(false)
    expect(moveFormation(9, 0, 0, 1)).toBe(false)
    expect(JSON.stringify(DAYS[0].waves[0].formations)).toBe(was)
  })
})

describe('moveAircraft', () => {
  it('resequences the jets inside one formation and keeps their seats', () => {
    const f = DAYS[0].waves[0].formations.find((x: any) => x.aircraft.length > 1)
    if (!f) throw new Error('seed day 0 wave 0 needs a multi-jet formation')
    const li = DAYS[0].waves[0].formations.indexOf(f)
    const was = f.aircraft.map((a: any) => a.p + '/' + a.w)
    expect(moveAircraft(0, 0, li, 1, 0)).toBe(true)
    expect(f.aircraft.map((a: any) => a.p + '/' + a.w)).toEqual([was[1], was[0], ...was.slice(2)])
  })

  it('moves the seat keys with the jet', () => {
    const f = DAYS[0].waves[0].formations.find((x: any) => x.aircraft.length > 1)!
    const li = DAYS[0].waves[0].formations.indexOf(f)
    SCHED.changes = { [`0.0.${li}.1.p`]: 1, [`fr:0.0.${li}.0`]: 2 }
    moveAircraft(0, 0, li, 1, 0)
    expect(SCHED.changes[`0.0.${li}.0.p`]).toBe(1)
    /* fr:0.0.${li}.0 belongs to the OTHER jet in the formation (index 0, not
       moved) — the reindex shifts it to index 1 and it survives there
       untouched, proving fr: carries across a move exactly like the bare
       seat key above. Deliberately NOT preloaded at index 0 AFTER the move
       (the moved jet's own new address, `to`=0 — exactly where done() marks
       pending, checked below): fr: has no sibling field the way ap:/dr: do
       (slots.ts: "fr:di.gi.li.ai aircraft remarks" is ONE key per aircraft,
       not one-per-field), so a stale AL tag AT THAT address is retired the
       instant markEdit marks the SAME key pending (publish.ts: "record an
       edit" — every other call site in the app relies on exactly that to
       retire an old AL tag on a re-edit). Preloading there would collide
       with the mark and prove nothing about carry-over. */
    expect(SCHED.changes[`fr:0.0.${li}.1`]).toBe(2)
    expect(SCHED.pending[`fr:0.0.${li}.0`]).toBe(1)
  })
})

describe('moveDutyRow / moveSimRow / moveProgRow / moveNote', () => {
  it('a duty row moves inside its block and takes its keys', () => {
    const rows = DAYS[0].dutywaves[0].rows
    const was = rows.map((r: any) => r.role)
    SCHED.changes = { 'd:0.0.2': 1, 'dr:0.0.0.role': 2 }
    expect(moveDutyRow(0, 0, 2, 0)).toBe(true)
    expect(rows.map((r: any) => r.role)).toEqual([was[2], was[0], was[1]])
    expect(SCHED.changes['d:0.0.0']).toBe(1)
    /* dr:0.0.0.role belongs to the OTHER duty row (index 0, not moved) — the
       reindex shifts it to index 1 and it survives there untouched, proving
       dr: carries across a move the same way d: does above. Deliberately NOT
       preloaded at index 0 AFTER the move (the moved row's own new address,
       `to`=0 — exactly where done() marks pending, checked below): dr:...role
       is the field done() marks pending for a duty row (same address
       board.ts's "add duty row" uses), so a stale AL tag AT THAT exact
       address is retired the instant markEdit marks the SAME key pending —
       see the fr: comment above moveAircraft's test. Preloading there would
       collide with the mark and prove nothing about carry-over. */
    expect(SCHED.changes['dr:0.0.1.role']).toBe(2)
    expect(SCHED.pending['dr:0.0.0.role']).toBe(1)
  })

  it('a sim row moves inside its own kind and leaves the other kind alone', () => {
    const di = DAYS.findIndex((d: any) => ((d.sims || {}).amt || []).length > 1)
    if (di < 0) throw new Error('seed week needs a day with two AMT rows')
    const amt = DAYS[di].sims.amt
    const oft = JSON.stringify(DAYS[di].sims.oft || [])
    const was = amt.map((r: any) => r.label)
    SCHED.changes = { [`s:${di}.amt.1`]: 1, [`sr:${di}.oft.0.label`]: 9 }
    expect(moveSimRow(di, 'amt', 1, 0)).toBe(true)
    expect(amt.map((r: any) => r.label)).toEqual([was[1], was[0], ...was.slice(2)])
    expect(SCHED.changes[`s:${di}.amt.0`]).toBe(1)
    expect(SCHED.changes[`sr:${di}.oft.0.label`]).toBe(9)
    expect(JSON.stringify(DAYS[di].sims.oft || [])).toBe(oft)
  })

  it('a programme item moves and carries both its key spaces', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    if (di < 0) throw new Error('seed week needs a day with two programme items')
    const was = DAYS[di].allhands.map((x: any) => x.prog)
    SCHED.changes = { [`ap:${di}.0.prog`]: 1, [`a:${di}.1.0`]: 2 }
    expect(moveProgRow(di, 1, 0)).toBe(true)
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual([was[1], was[0], ...was.slice(2)])
    /* ap:${di}.0.prog belongs to the OTHER programme item (index 0, not
       moved) — the reindex shifts it to index 1 and it survives there
       untouched, proving ap: carries across a move the same way a: does
       below. Deliberately NOT preloaded at index 0 AFTER the move (the
       moved row's own new address, `to`=0 — exactly where done() marks
       pending, checked below): ap:...prog is the field done() marks pending
       for a programme row, so a stale AL tag AT THAT exact address is
       retired the instant markEdit marks the SAME key pending — see the fr:
       comment above moveAircraft's test. Preloading there would collide
       with the mark and prove nothing about carry-over. */
    expect(SCHED.changes[`ap:${di}.1.prog`]).toBe(1)
    expect(SCHED.changes[`a:${di}.0.0`]).toBe(2)
    expect(SCHED.pending[`ap:${di}.0.prog`]).toBe(1)
  })

  it('a note line moves and carries its key', () => {
    DAYS[0].notes = ['one', 'two', 'three']
    SCHED.changes = { 'dn:0.1': 1 }
    expect(moveNote(0, 2, 0)).toBe(true)
    expect(DAYS[0].notes).toEqual(['three', 'one', 'two'])
    /* dn:0.1 belongs to the OTHER note line (index 1, not moved) — the
       reindex shifts it to index 2 and it survives there untouched, proving
       dn: carries across a move exactly like every other head above.
       Deliberately NOT preloaded at index 0 AFTER the move (the moved
       note's own new address, `to`=0 — exactly where done() marks pending,
       checked below): dn: is a note line's ONLY key (no per-field split at
       all, unlike ap:/dr:), so a stale AL tag AT THAT exact address is
       retired the instant markEdit marks the SAME key pending — see the fr:
       comment above moveAircraft's test. Preloading there would collide
       with the mark and prove nothing about carry-over. */
    expect(SCHED.changes['dn:0.2']).toBe(1)
    expect(SCHED.pending['dn:0.0']).toBe(1)
  })
})

describe('moveGroundRow freezes the visible order first', () => {
  it('the first move pins the order you can SEE, then moves within it', () => {
    DAYS[0].ground = [
      { prog: 'C', str: '1000' }, { prog: 'A', str: '0800' }, { prog: 'B', str: '0900' },
    ]
    /* rendered A,B,C. Dragging C (model 0) onto A (model 1) must leave C above
       A — a naive model-index move would produce A,C,B and read as no change
       at all on the row the scheduler grabbed. */
    expect(moveGroundRow(0, 0, 1)).toBe(true)
    expect(DAYS[0].gman).toBe(true)
    expect(groundOrder(DAYS[0].ground, DAYS[0].gman).map(x => x.row.prog)).toEqual(['C', 'A', 'B'])
  })

  it('the freeze permutation moves the keys too', () => {
    DAYS[0].ground = [
      { prog: 'C', str: '1000' }, { prog: 'A', str: '0800' }, { prog: 'B', str: '0900' },
    ]
    SCHED.changes = { 'g:0.0': 'C', 'g:0.1': 'A', 'g:0.2': 'B' }
    moveGroundRow(0, 0, 1)
    expect(SCHED.changes['g:0.0']).toBe('C')
    expect(SCHED.changes['g:0.1']).toBe('A')
    expect(SCHED.changes['g:0.2']).toBe('B')
  })

  it('once manual, a later move is a plain model move', () => {
    DAYS[0].ground = [{ prog: 'A', str: '0800' }, { prog: 'B', str: '0900' }]
    DAYS[0].gman = true
    expect(moveGroundRow(0, 0, 1)).toBe(true)
    expect(DAYS[0].ground.map((r: any) => r.prog)).toEqual(['B', 'A'])
  })

  it('a no-op move does NOT switch the sort off', () => {
    DAYS[0].ground = [{ prog: 'A', str: '0800' }, { prog: 'B', str: '0900' }]
    expect(moveGroundRow(0, 1, 1)).toBe(false)
    expect(DAYS[0].gman).toBeFalsy()
  })
})

describe('applyMove parses addresses and enforces the containers', () => {
  it('two jets in one formation resequence', () => {
    const f = DAYS[0].waves[0].formations.find((x: any) => x.aircraft.length > 1)!
    const li = DAYS[0].waves[0].formations.indexOf(f)
    const was = f.aircraft.map((a: any) => a.p)
    expect(applyMove(`mv:ac.0.0.${li}.1`, `mv:ac.0.0.${li}.0`)).toBe(true)
    expect(f.aircraft.map((a: any) => a.p)).toEqual([was[1], was[0], ...was.slice(2)])
  })

  it('a jet dropped on another formation moves the whole formation instead', () => {
    const w = DAYS[0].waves[0]
    const was = w.formations.map((f: any) => f.cs)
    const jets = w.formations[1].aircraft.length
    expect(applyMove('mv:ac.0.0.1.0', 'mv:ac.0.0.0.0')).toBe(true)
    expect(w.formations.map((f: any) => f.cs)).toEqual([was[1], was[0], ...was.slice(2)])
    expect(w.formations[0].aircraft.length).toBe(jets)
  })

  it('a drop into another Go is refused', () => {
    const was = JSON.stringify(DAYS[0].waves)
    expect(applyMove('mv:ac.0.0.0.0', 'mv:ac.0.1.0.0')).toBe(false)
    expect(JSON.stringify(DAYS[0].waves)).toBe(was)
  })

  it('a drop into another day, another duty block or another sim kind is refused', () => {
    expect(applyMove('mv:d.0.0.0', 'mv:d.0.1.0')).toBe(false)
    expect(applyMove('mv:s.0.amt.0', 'mv:s.0.oft.0')).toBe(false)
    expect(applyMove('mv:g.0.0', 'mv:g.1.0')).toBe(false)
  })

  it('mismatched kinds and junk are refused', () => {
    expect(applyMove('mv:g.0.0', 'mv:p.0.1')).toBe(false)
    expect(applyMove('nonsense', 'mv:g.0.1')).toBe(false)
    expect(applyMove('mv:g.0.0', '')).toBe(false)
    expect(applyMove(null as any, null as any)).toBe(false)
  })
})
