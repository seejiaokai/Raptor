/* The demo-only medical lifecycle seed (owner, 27 Aug 26): the Medical
   view's three sections open populated, every seeded medical row carries a
   placeholder document, and — the load-bearing pin — the two added spans sit
   OUTSIDE the loaded week, so the week's warnings and surfaces stay
   byte-identical to a world without this seed (the demosans idiom). */
import { beforeAll, describe, expect, it } from 'vitest'
import { INPUTS, DATES, inputCoversDate, isDownchit, isUpchit, needsDoc } from '../engine/inputs'
import { validate } from '../engine/validate'
import { medDownAsOf, pendingUpchits, upchitsWithin } from '../engine/medical'
import { docHas } from './docs'
import { initStore } from './store'

/* the notional today, 13 Jul 26, as a dateOrd ordinal */
const TODAY_ORD = 20260713

let beforeWarnCount = 0
let beforeNamed = 0
const seedPeople = ['nasty', 'vinci']
const named = (list: any[]) => list.filter((w: any) => (w.who || []).some((id: string) => seedPeople.includes(id)))

beforeAll(() => {
  const before = validate()                 // pristine week, no boot seed
  beforeWarnCount = before.all.length
  beforeNamed = named(before.all).length
  initStore()
})

describe('the demo medical seed', () => {
  it('populates all three sections at the notional today', () => {
    expect(medDownAsOf(TODAY_ORD).some((e: any) => e.person === 'sufa')).toBe(true)
    expect(pendingUpchits(TODAY_ORD).some((e: any) => e.person === 'nasty')).toBe(true)
    expect(upchitsWithin(TODAY_ORD).some((e: any) => e.person === 'vinci')).toBe(true)
  })
  it('every doc-needing seed row carries a real stored document', () => {
    for (const r of INPUTS.filter((x: any) => needsDoc(x.type)))
      expect(docHas(r.docId), `${r.person} ${r.type} ${r.date}`).toBe(true)
  })
  it('the added spans cover NO loaded-week day — the week is untouched', () => {
    const added = INPUTS.filter((r: any) =>
      (isDownchit(r.type) || isUpchit(r.type)) && seedPeople.includes(r.person))
    expect(added.length).toBeGreaterThanOrEqual(3)
    for (const r of added) for (const dt of DATES)
      expect(inputCoversDate(r, dt), `${r.person} ${r.type} vs ${dt}`).toBe(false)
  })
  it('the warning list neither grows nor gains a word for the seeded people', () => {
    const after = validate()
    expect(after.all.length).toBe(beforeWarnCount)
    expect(named(after.all).length).toBe(beforeNamed)
  })
  it('a second boot does not double-file (the idempotence guard)', () => {
    const count = INPUTS.length
    initStore()
    expect(INPUTS.length).toBe(count)
  })
})
