/* THE DEMO SEED'S "ALREADY SEEDED?" KNOWS BOTH SHAPES — the two halves no other test holds (the break tests of the
   one-rule job's full check, 12 Oct 26: docs/handpass/parts/or-wires-3.md, wire 28; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.11 — the seed's test "learns the new shape so an old store is
   not seeded twice").

   state/demostamps.test.ts already pins: a second boot adds no second shared brief and no second placeholder pair (the
   NEW shape), and an old store whose four brief records are word for word the seed's is given no fifth. Its old-shape
   fixture copies the seed's own moment and words, so it is recognised by those alone — the old GROUP ID was never the
   thing that answered. And nothing held the placeholder pair as a store seeded before the build keeps it (one `person`,
   no list). Each half, broken on purpose, turned no test red. These two cases are those halves. */
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, idsOf, isPlaceholderInput, leadOf } from '../engine/inputs'
import { initStore } from './store'
import { seedDemoGroup, seedDemoPlaceholders } from './demoseed'

const SNAP = JSON.stringify(INPUTS)
beforeEach(() => { INPUTS.splice(0, INPUTS.length, ...JSON.parse(SNAP)); initStore() })

describe('an old store is not seeded a second time (the one-rule plan §4.11)', () => {
  it('the shared brief kept as four records of the old group, its words changed since: known by its group id — no second brief', () => {
    const brief = () => (INPUTS as any[]).filter(r => r.type === 'Meeting' && r.date === 'Jul 23')
    const [now] = brief()
    expect(now, 'the demo carries the brief').toBeTruthy()
    expect(idsOf(now)).toHaveLength(4)
    /* as a browser that booted before the build holds it — one record a man, tied by the group id — and edited since:
       another remark, another hour, so nothing but the group id says it is the demo's brief */
    const olds = idsOf(now).map((person: any, i: number) => ({
      iid: `old-brief-${i}`, person, type: now.type, date: now.date, allday: false, s: 660, e: 720, remarks: 'Flight safety brief — hangar 2', mod: '2026-06-27',
      grp: 'g-demo-brief', grpBy: now.by, by: now.by, at: now.at, modBy: now.by, modAt: now.at + 86_400_000,
    }))
    INPUTS.splice(INPUTS.indexOf(now), 1, ...olds)
    seedDemoGroup()
    expect(brief().map(r => r.iid).sort(), 'the four old records, and no new one beside them').toEqual(olds.map(o => o.iid).sort())
    expect(brief().some(r => Array.isArray(r.people)), 'no record in the new shape was added').toBe(false)
  })
  it('the two placeholder inputs kept in the old shape — one `person`, no list — are given no second pair', () => {
    const phs = () => (INPUTS as any[]).filter(r => isPlaceholderInput(r))
    expect(phs().map(r => `${leadOf(r)} · ${r.type} · ${r.date}`).sort()).toEqual(['all · Event · Jul 22', 'allavail · Duty · Jul 25'])
    /* each rewritten as it was stored before the build: the placeholder its `person` */
    for (const r of phs()) { r.person = leadOf(r); delete r.people }
    expect(phs(), 'an old-shaped placeholder input still reads as one').toHaveLength(2)
    seedDemoPlaceholders()
    expect(phs().map(r => `${leadOf(r)} · ${r.type} · ${r.date}`).sort(), 'still the one pair').toEqual(['all · Event · Jul 22', 'allavail · Duty · Jul 25'])
    expect(phs().every(r => !Array.isArray(r.people)), 'nothing converted, nothing added (D56)').toBe(true)
  })
})
