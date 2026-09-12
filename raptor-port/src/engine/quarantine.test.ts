// @vitest-environment jsdom
/* THE ONE QUARANTINE CLASSIFIER (round-2 fix C, P2-QREV-05/06). Round 1 had four
   readers disagree on a damaged stash: protectedDates() (the input funnel's date
   source) called a no-days / 'null' / '0' blob editable while it was unloaded,
   while applyWeekModel and OIL called it read-only. These pin the single shared
   classifier so every reader agrees. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore, loadWeek } from '../state/store'
import { protectedDates, inputProtected, stashProtected } from './quarantine'
import { medPlanProtected } from '../ui/inputedit'
import { stashClear, stashPut, stashGet } from './weekstash'
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

describe('classifier totality — a throwing classification is unreadable, never propagated (Q2R-04)', () => {
  /* a blob whose `als` is a truthy NON-iterable makes amFormatOf's records-belong-
     to-week walk throw (for..of on a non-iterable). Before the fix stashProtected
     caught only JSON.parse, so the throw escaped protectedDates() and broke the
     input funnel for EVERY week, not just the damaged one. Classification failure
     must read as UNREADABLE (protected), never crash the caller. */
  const THROWS = JSON.stringify({ d: weekBundle(FAR).days, am: 1, cv: { 0: 1 }, a: { bogus: 1 } })
  it('stashProtected returns true (protected) instead of throwing', () => {
    expect(() => stashProtected(FAR, THROWS)).not.toThrow()
    expect(stashProtected(FAR, THROWS)).toBe(true)
  })
  it('protectedDates does not propagate the throw, and quarantines the week', () => {
    stashPut(FAR, THROWS)
    expect(() => protectedDates()).not.toThrow()
    const row = { person: 'dj', type: 'Meeting', allday: true, date: weekBundle(FAR).dates[0], yr: Number(FAR.split('/')[2]) }
    expect(inputProtected(row)).toBe(true)
  })
})

describe('an empty-string stash is a DAMAGED present blob, not an absent week (Q2R-08)', () => {
  it('stashGet returns the present empty string, and the classifier locks it', () => {
    stashPut(FAR, '')
    expect(stashGet(FAR), 'presence is by explicit key, not the value truthiness').toBe('')
    expect(stashProtected(FAR, stashGet(FAR))).toBe(true)
    const row = { person: 'dj', type: 'Meeting', allday: true, date: weekBundle(FAR).dates[0], yr: Number(FAR.split('/')[2]) }
    expect(inputProtected(row), 'an input on the empty-string week is refused').toBe(true)
  })
})

describe('a protected week locks its OWN year, never the loaded year (Q2R-03 cross-year)', () => {
  it('an authored 2026 week held read-only does not lock the same weekday in 2027', () => {
    loadWeek('05/07/2027')                                    // baseYear() becomes 2027
    stashPut('13/07/2026', JSON.stringify({ ok: { 0: 1 } }))  // authored seed week, damaged → protected
    expect(inputProtected({ person: 'dj', type: 'Meeting', allday: true, date: 'Jul 13', yr: 2027 }),
      'a 2027 input must not match the protected 2026 week').toBe(false)
    expect(inputProtected({ person: 'dj', type: 'Meeting', allday: true, date: 'Jul 13', yr: 2026 }),
      'an input actually on the protected 2026 week IS caught').toBe(true)
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
