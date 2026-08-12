/* AUDIT D — applyMove's address parsing and the REORDERED_DI stale-arm signal
   (scenarios 6/7). applyMove is the ONE entry point the UI's drag and nudge
   feed, and its refusals are load-bearing: a malformed or cross-container
   address that slipped through would splice a list at index -1 or move a row
   between containers whose key spaces were never remapped. Every refusal is
   asserted to also leave the MODEL byte-identical — a refusal that half-acts
   is worse than an accept. Harness follows reorder.test.ts. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { SCHED } from './publish'
import { applyMove, popReorderedDay, REORDERED_DI } from './reorder'

const DSNAP = JSON.stringify(DAYS)
let before = ''
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  popReorderedDay()
  const d = DAYS[0]
  d.waves = [
    { label: 'W0', formations: [
      { cs: 'F0', to: '0800', aircraft: [{ p: 'a', w: 'b', opts: {} }, { p: 'c', w: 'd', opts: {} }] },
      { cs: 'F1', to: '0900', aircraft: [{ p: 'e', w: 'f', opts: {} }] },
      { cs: 'F2', to: '1000', aircraft: [{ p: 'g', w: 'h', opts: {} }] },
    ] },
    { label: 'W1', formations: [{ cs: 'G0', to: '1100', aircraft: [{ p: 'i', w: 'j', opts: {} }] }] },
  ]
  d.dutywaves = [
    { label: 'B0', rows: [{ role: 'SDO', id: '', str: '0700' }, { role: 'SXO', id: '', str: '0800' }] },
    { label: 'B1', rows: [{ role: 'SDO', id: '', str: '1300' }] },
  ]
  d.sims = { amt: [{ label: 's0', str: '0800' }, { label: 's1', str: '0900' }],
             oft: [{ label: 'o0', str: '0800' }] }
  d.allhands = [{ prog: 'p0', who: [] }, { prog: 'p1', who: [] }]
  before = JSON.stringify(DAYS)
})
const unchanged = () => expect(JSON.stringify(DAYS)).toBe(before)

describe('malformed mv: addresses are refused whole (scenario 7)', () => {
  it.each([
    ['empty strings', '', ''],
    ['not mv:', 'p.0.0', 'p.0.1'],
    ['wrong prefix', 'xx:p.0.0', 'xx:p.0.1'],
    ['dropped on itself', 'mv:p.0.0', 'mv:p.0.0'],
    ['kind mismatch', 'mv:d.0.0.0', 'mv:s.0.0.0'],
    ['arity mismatch', 'mv:p.0.0', 'mv:p.0.0.1'],
    ['too few components', 'mv:p.0', 'mv:p.1'],
    ['non-numeric index', 'mv:p.0.x', 'mv:p.0.0'],
    ['non-numeric target', 'mv:p.0.0', 'mv:p.0.x'],
    ['negative index', 'mv:p.0.-1', 'mv:p.0.0'],
    ['out of range', 'mv:p.0.0', 'mv:p.0.99'],
    ['cross-day programme', 'mv:p.0.0', 'mv:p.1.0'],
    ['duty row across blocks', 'mv:d.0.0.1', 'mv:d.0.1.0'],
    ['sim row across kinds', 'mv:s.0.amt.0', 'mv:s.0.oft.0'],
    ['unknown kind', 'mv:z.0.0', 'mv:z.0.1'],
    ['ac with 4 components', 'mv:ac.0.0.0', 'mv:ac.0.0.1'],
    ['ac across waves (jet)', 'mv:ac.0.0.0.0', 'mv:ac.0.1.0.0'],
    ['ac across days', 'mv:ac.0.0.0.0', 'mv:ac.1.0.0.0'],
    ['nonsense day', 'mv:p.zz.0', 'mv:p.zz.1'],
  ])('%s', (_lbl, a, b) => {
    expect(applyMove(a, b)).toBe(false)
    unchanged()
    /* a refusal must not raise the stale-arm signal either */
    expect(popReorderedDay()).toBe(null)
  })
})

describe('the ac address: resequence vs carry-the-formation at the boundaries', () => {
  it('same formation, different jet = jets resequence (last to first)', () => {
    expect(applyMove('mv:ac.0.0.0.1', 'mv:ac.0.0.0.0')).toBe(true)
    expect(DAYS[0].waves[0].formations[0].aircraft.map((a: any) => a.p)).toEqual(['c', 'a'])
    /* formations themselves untouched */
    expect(DAYS[0].waves[0].formations.map((f: any) => f.cs)).toEqual(['F0', 'F1', 'F2'])
  })
  it('different formation, same wave = the whole formation travels, jets and all (first to last)', () => {
    expect(applyMove('mv:ac.0.0.0.0', 'mv:ac.0.0.2.0')).toBe(true)
    expect(DAYS[0].waves[0].formations.map((f: any) => f.cs)).toEqual(['F1', 'F2', 'F0'])
    expect(DAYS[0].waves[0].formations[2].aircraft.map((a: any) => a.p)).toEqual(['a', 'c'])
  })
  it('the jet index on a formation carry may differ — the DROP formation decides, not the jet', () => {
    /* dropping F2's grip on F0's second jet still reads as "formation onto
       formation" — the last components are jet indices 0 and 1 but the
       formation components differ, which is the branch that fires */
    expect(applyMove('mv:ac.0.0.2.0', 'mv:ac.0.0.0.1')).toBe(true)
    expect(DAYS[0].waves[0].formations.map((f: any) => f.cs)).toEqual(['F2', 'F0', 'F1'])
  })
})

describe('REORDERED_DI — the stale-arm signal (scenario 6, engine half)', () => {
  it('a successful move raises the day index once, and the read clears it', () => {
    expect(applyMove('mv:p.0.1', 'mv:p.0.0')).toBe(true)
    expect(REORDERED_DI).toBe(0)
    expect(popReorderedDay()).toBe(0)
    expect(popReorderedDay(), 'clears on read').toBe(null)
  })
  it('the signal carries the day of the move, not a stale earlier one', () => {
    DAYS[1].allhands = [{ prog: 'q0', who: [] }, { prog: 'q1', who: [] }]
    expect(applyMove('mv:p.0.1', 'mv:p.0.0')).toBe(true)
    expect(applyMove('mv:p.1.1', 'mv:p.1.0')).toBe(true)
    expect(popReorderedDay()).toBe(1)
  })
})
