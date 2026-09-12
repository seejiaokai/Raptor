// @vitest-environment jsdom
/* THE ONE QUARANTINE CLASSIFIER (round-2 fix C, P2-QREV-05/06). Round 1 had four
   readers disagree on a damaged stash: protectedDates() (the input funnel's date
   source) called a no-days / 'null' / '0' blob editable while it was unloaded,
   while applyWeekModel and OIL called it read-only. These pin the single shared
   classifier so every reader agrees. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore } from '../state/store'
import { protectedDates, inputProtected, stashProtected } from './quarantine'
import { medPlanProtected } from '../ui/inputedit'
import { stashClear, stashPut } from './weekstash'
import { weekBundle } from './weeks-data'

const FAR = '06/01/2025'   // far from the loaded seed week, so it is a purely stashed week

beforeEach(() => { initStore(); stashClear() })
afterEach(() => { stashClear() })

describe('stashProtected — is a stored week read-only?', () => {
  it('a MISSING record (null json) is NOT protected — a genuinely absent week', () => {
    expect(stashProtected(FAR, null)).toBe(false)
  })
  it('an UNPARSEABLE blob is protected', () => {
    expect(stashProtected(FAR, '{not json,,')).toBe(true)
  })
  it("the JSON texts 'null', 'false', '0' are protected (parse to falsy/primitive, not absent)", () => {
    expect(stashProtected(FAR, 'null')).toBe(true)
    expect(stashProtected(FAR, 'false')).toBe(true)
    expect(stashProtected(FAR, '0')).toBe(true)
  })
  it('a blob that parses but has NO days array is protected', () => {
    expect(stashProtected(FAR, JSON.stringify({ ok: { 0: 1 }, note: 'no d' }))).toBe(true)
  })
  it('a valid current-format book (real days, no publication content) is NOT protected', () => {
    expect(stashProtected(FAR, JSON.stringify({ d: weekBundle(FAR).days }))).toBe(false)
  })
  it('an unsupported (pre-Phase-2) book WITH content is protected', () => {
    expect(stashProtected(FAR, JSON.stringify({ d: weekBundle(FAR).days, o: { 0: { d: {}, c: {} } }, cv: { 0: 'orig' } }))).toBe(true)
  })
})

describe('protectedDates + inputProtected span an unopened damaged stash (P2-QREV-05)', () => {
  it('a damaged (no-days) stashed week contributes its dates, and an input covering one is protected', () => {
    stashPut(FAR, JSON.stringify({ ok: { 0: 1 } }))   // damaged, never opened
    const dates = protectedDates()
    const farDates = weekBundle(FAR).dates
    expect(dates, 'the damaged week is quarantined even though it was never loaded').toEqual(expect.arrayContaining([farDates[0]]))
    const row = { person: 'dj', type: 'Meeting', allday: true, date: farDates[0], yr: Number(FAR.split('/')[2]) }
    expect(inputProtected(row), 'an input covering a protected date is refused').toBe(true)
  })
  it('nothing is protected when no week is quarantined', () => {
    expect(protectedDates()).toEqual([])
    expect(inputProtected({ person: 'dj', type: 'Meeting', allday: true, date: 'Jul 13', yr: 2026 })).toBe(false)
  })
})

describe('medPlanProtected — the medical-cascade preflight (P2-QREV-01)', () => {
  it('flags a plan that trims/deletes a row on a protected week, and its minted tail', () => {
    const farDates = weekBundle(FAR).dates
    stashPut(FAR, JSON.stringify({ ok: { 0: 1 } }))   // FAR damaged → protected
    const protRow = { person: 'dj', type: 'OML', allday: true, date: farDates[0], yr: Number(FAR.split('/')[2]) }
    expect(medPlanProtected([{ row: protRow, action: 'trim', newEndOrd: 1 }]), 'a trim on a protected row').toBe(true)
    expect(medPlanProtected([{ row: protRow, action: 'delete' }]), 'a delete on a protected row').toBe(true)
    const normRow = { person: 'dj', type: 'OML', allday: true, date: 'Jul 13', yr: 2026 }
    expect(medPlanProtected([{ row: normRow, action: 'trim', newEndOrd: 1 }]), 'a trim on a normal row is fine').toBe(false)
    expect(medPlanProtected([]), 'an empty plan is fine').toBe(false)
  })
})
