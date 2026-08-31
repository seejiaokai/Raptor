/* THE SECTION-ORDER RULES-SAFETY GUARD (owner, 29 Aug 26 — "make sure rules
   that are reading the data will not be corrupted due to the change in
   arrangement"). Section order (engine/order.ts secOrder) is a pure DISPLAY
   sequence: re-ordering it must move NO row inside any array, touch NO slot key,
   and change NOTHING the validator or the amendment machinery reads. This file
   pins exactly that — the whole feature rests on it. Snapshot/restore of DAYS
   follows reorder.test.ts so mutations can't leak between files. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { SCHED } from './publish'
import { validate, WARN } from './validate'
import { moveSectionModel, secOrder } from './order'

const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
})

/* the section-content of a day — everything the rules and the AL address by
   index. If a section reorder is truly display-only, every one of these is
   byte-identical afterwards (only d.secOrder, which none of them read, differs). */
const content = (d: any) => JSON.stringify({
  notes: d.notes, allhands: d.allhands, waves: d.waves,
  sims: d.sims, dutywaves: d.dutywaves, ground: d.ground,
})

describe('re-ordering sections cannot corrupt the rules', () => {
  it('leaves every validate() warning, and all SCHED amendment state, byte-identical', () => {
    /* some pending/AL marks in flight, to prove they are not disturbed either */
    SCHED.pending = { 'ff:0.0.0.cs': 1, 'g:0.0': 1 }
    SCHED.changes = { 'dr:0.0.0.role': 1 }
    SCHED.als = [{ n: 1, keys: ['st:0.0.0.0'], sign: {} }]
    validate()
    const warnBefore = JSON.stringify(WARN)
    const pendBefore = JSON.stringify(SCHED.pending)
    const chgBefore = JSON.stringify(SCHED.changes)
    const alsBefore = JSON.stringify(SCHED.als)
    const dataBefore = DAYS.map(content)

    /* a real re-arrangement on a couple of days */
    expect(moveSectionModel(DAYS[0], 'ground', -1)).toBe(true)
    expect(moveSectionModel(DAYS[0], 'ground', -1)).toBe(true)
    expect(moveSectionModel(DAYS[1] || DAYS[0], 'duty', -1)).toBe(true)
    validate()

    expect(JSON.stringify(WARN), 'no warning moved, appeared or vanished').toBe(warnBefore)
    expect(JSON.stringify(SCHED.pending), 'no pending mark touched').toBe(pendBefore)
    expect(JSON.stringify(SCHED.changes), 'no changes mark touched').toBe(chgBefore)
    expect(JSON.stringify(SCHED.als), 'no issued AL touched').toBe(alsBefore)
    /* the content arrays every slot key is built from are UNTOUCHED — so every
       di.gi.li.ai / d: / s: / g: / a: key still names exactly what it did */
    expect(DAYS.map(content), 'no row moved inside any section array').toEqual(dataBefore)
  })

  it('only d.secOrder changes — the section arrays are the same objects, just re-emitted', () => {
    const d = DAYS[0]
    const wavesRef = d.waves, groundRef = d.ground
    moveSectionModel(d, 'ground', -1)   // ground up one: sims and ground swap
    expect(d.secOrder, 'the order is recorded').toEqual(secOrder(d))
    expect(d.waves, 'the waves array is the very same object').toBe(wavesRef)
    expect(d.ground, 'the ground array is the very same object').toBe(groundRef)
    expect(secOrder(d)).toEqual(['notes', 'prog', 'waves', 'duty', 'ground', 'sims', 'inputs', 'avail', 'sans', 'unav'])
  })
})
