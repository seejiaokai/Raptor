/* D2028 THROUGH THE REAL EARNED-OIL PATH (owner D2028, 13 Nov 26; Astra's scenario design, cases 3–5:
   docs/superpowers/briefs/2026-11-13-d2028-scenarios.md). src/published-day-open-end.test.ts shows the rule on a
   weekday with a stand-in crowd; this file shows it where OIL is actually credited — the seed Saturday, both real
   stores, the Leave War's own answer to "who is available" (sync.ts availableFor) and its credit pass (runOilPass).

   The case: Bane is NAMED on "Briefing" 09:00 with no end; a second row, "Tasking" 10:15–17:15, holds ALL AVAIL.
   Published with "Any other row" at an hour, Bane is free at 10:15, stands behind the placeholder and earns a full day
   from the timed row. At two hours he would be busy until 11:00 and earn nothing. The open-ended row itself earns
   nobody anything (D360). Harness from oilsync.test.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, setSign, setDayApproved, publishALDay, dayDelta, daySigned, dayCurVer, daySnapOf, dayPendingItems } from '../engine/publish'
import { VCONF } from '../engine/rules'
import { HOOKS } from '../engine/hooks'
import { validate, WARN } from '../engine/validate'
import { ensureRowIds } from '../engine/rowids'
import { rowItemKey } from '../engine/oil'
import { oilEvidenceOf, oilSentOf, oilWouldEarn } from '../engine/oilev'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { availableFor, installAbsenceDoor, runOilPass } from './sync'

const ISNAP = JSON.stringify(INPUTS), DSNAP = JSON.stringify(DAYS), VSNAP = { ...VCONF }
const HSNAP = { earn: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO, sent: HOOKS.oilSentinel, none: HOOKS.oilNoPeriod }
const SAT = 5, ISO = '2026-07-18'
const day = (): any => DAYS[SAT]
const sign = () => { setSign(SAT, 'cur', 'ignite'); setSign(SAT, 'sked', 'bane'); setSign(SAT, 'plan', 'stiff'); setSign(SAT, 'appr', 'pump') }
const publish = () => { validate(); sign(); setDayApproved(SAT, true); validate(); sign(); runOilPass() }
const cellOf = (person: string) => getState().wars[0].grid[person]?.[ISO]
const crowd = (r: any) => [...oilSentOf(oilEvidenceOf(SAT), rowItemKey(r.rid)).people]
const issuedCrowd = (r: any) => [...(((daySnapOf(SAT, dayCurVer(SAT)) as any).d.oilev.sent || {})[rowItemKey(r.rid)] || [])]
const codes = () => { const g: any = (WARN.byDay as any)[SAT]; return ((g && g.warns) || []).map((w: any) => w.code) }

beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  Object.assign(SCHED, { orig: {}, cur: {}, als: [], al: 0, pending: {}, changes: {}, added: {}, dayOK: {}, sign: {}, signBind: {}, retired: {}, correcting: {}, drafts: {}, curDraft: {} })
  Object.assign(VCONF, VSNAP, { openEnd: 60 })
  stashClear(); raptorInitStore(); lwInitStore(memoryBackend()); setPeople(projectPeople())
  installAbsenceDoor()
  Object.assign(day(), { waves: [], sims: { amt: [], oft: [] }, ground: [], dutywaves: [], oild: undefined,
    allhands: [{ prog: 'Briefing', str: '09:00', end: '', who: ['bane'] }, { prog: 'Tasking', str: '10:15', end: '17:15', who: ['allavail'] }] })
  ensureRowIds(DAYS)
})
afterEach(() => {
  Object.assign(HOOKS, { oilEarningDay: HSNAP.earn, oilDayISO: HSNAP.iso, oilSentinel: HSNAP.sent, oilNoPeriod: HSNAP.none })
  Object.assign(VCONF, VSNAP)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  Object.assign(SCHED, { orig: {}, cur: {}, als: [], al: 0, pending: {}, changes: {}, added: {}, dayOK: {}, sign: {}, signBind: {}, retired: {}, correcting: {}, drafts: {}, curDraft: {} })
  validate()
})

describe('D2028 on a Saturday that earns — a named man on the open-ended row, ALL AVAIL on a timed row beside it', () => {
  it('premise: published at an hour, Bane stands behind the placeholder and is credited a full day', () => {
    publish()
    expect(crowd(day().allhands[1]), 'free at 10:15').toContain('bane')
    expect(cellOf('bane')).toBe('FO')
    expect(cellOf('ignite'), 'the control: another free man').toBe('FO')
  })
  it('the Logic change alone: nothing waits, the four stay, his credit stays, on the working copy as on what went out', () => {
    publish()
    VCONF.openEnd = 120
    for (const pass of ['first', 'second']) {
      validate(); runOilPass()
      expect(dayDelta(SAT), pass).toEqual([])
      expect(dayPendingItems(SAT), pass).toEqual([])
      expect(daySigned(SAT), pass).toBe(true)
      expect(crowd(day().allhands[1]), `${pass}: Edit Schedule's crowd`).toContain('bane')
      expect(issuedCrowd(day().allhands[1]), `${pass}: what went out`).toContain('bane')
      expect(cellOf('bane'), `${pass}: the Leave War`).toBe('FO')
    }
  })
  it('a real change waiting: the working copy previews two hours (Bane out of the crowd), the credit stays what went out (D2013, D142)', () => {
    publish()
    VCONF.openEnd = 120; validate()
    day().allhands[1].prog = 'Tasking B'; validate(); runOilPass()
    expect(dayPendingItems(SAT).length, 'premise: it waits').toBeGreaterThan(0)
    /* …AND THE LIST NAMES WHAT THE AMENDMENT WILL DO TO HIS OIL (the fresh Opus read, 13 Nov 26 — D44, D45, D99): the
       rename alone was listed, the four signed on it, and the amendment took Bane's day with no line saying so. Once
       anything else waits the comparison is made under the settings the amendment will go out with — the ones the
       working copy is drawn by (D2013) */
    expect(dayPendingItems(SAT).map((i: any) => i.axis), 'the crowd change is listed beside the rename').toContain('oil')
    expect(dayDelta(SAT).some((e: any) => String(e.addr) === `oil:${SAT}`)).toBe(true)
    expect(crowd(day().allhands[1]), 'the next amendment, today\'s setting').not.toContain('bane')
    expect(issuedCrowd(day().allhands[1])).toContain('bane')
    expect(cellOf('bane'), 'only the published schedule earns').toBe('FO')
    day().allhands[1].prog = 'Tasking'; validate(); runOilPass()
    expect(dayPendingItems(SAT), 'put back').toEqual([])
    expect(crowd(day().allhands[1])).toContain('bane')
    expect(cellOf('bane')).toBe('FO')
  })
  it('the amendment published: it goes out under two hours, and his credit goes with it; the others keep theirs', () => {
    publish()
    VCONF.openEnd = 120; validate()
    day().allhands[1].prog = 'Tasking B'; validate()
    sign(); publishALDay(SAT); validate(); runOilPass()
    expect(dayDelta(SAT)).toEqual([])
    expect(issuedCrowd(day().allhands[1])).not.toContain('bane')
    expect(cellOf('bane'), 'busy until 11:00 under the settings it now went out with').toBeUndefined()
    expect(cellOf('ignite')).toBe('FO')
  })
  it('a real leave filed for a man behind the puck, after the Logic change, still reads pending and takes the four down (D44, D45, D103)', () => {
    publish()
    VCONF.openEnd = 120; validate()
    expect(crowd(day().allhands[1]), 'premise').toContain('stiff')
    INPUTS.unshift({ person: 'stiff', type: 'LL', date: 'Jul 18', allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026 } as any)
    validate(); runOilPass()
    expect(dayPendingItems(SAT).length).toBeGreaterThan(0)
    expect(daySigned(SAT)).toBe(false)
    expect(issuedCrowd(day().allhands[1]), 'what went out is frozen').toContain('stiff')
    expect(cellOf('stiff'), 'and so is his credit, until the day is published again').toBe('FO')
  })
})

/* validate.ts lifts the settings overlay for OIL's earning test (withLiveRules); the fresh block inside it now counts an
   untouched published day's crowd under the settings it went out with. Astra's case 5: where Bane is the ONLY man who
   would earn and no Leave War period covers the day, the setting change alone must not silence "there is no leave war
   period" — he still earns on that day as it stands. */
describe('D2028 — the missing-period warning on a published Saturday whose only earner depends on the assumed length', () => {
  const soleEarner = () => {
    availableFor(ISO, [615, 1035], day()).filter((id: string) => id !== 'bane').forEach((id: string) =>
      INPUTS.unshift({ person: id, type: 'LL', date: 'Jul 18', allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026 } as any))
    HOOKS.oilNoPeriod = (di: number) => (di === SAT ? '2026' : '')
  }
  it('premise: published at an hour, Bane alone would earn and the day names the missing period', () => {
    soleEarner(); publish()
    expect(crowd(day().allhands[1])).toEqual(['bane'])
    expect(oilWouldEarn(SAT)).toBe(true)
    expect(codes()).toContain('OIL_NO_PERIOD')
  })
  it('the Logic change alone keeps the warning, check after check', () => {
    soleEarner(); publish()
    VCONF.openEnd = 120
    for (const pass of ['first', 'second', 'third']) {
      validate()
      expect(dayDelta(SAT), pass).toEqual([])
      expect(oilWouldEarn(SAT), pass).toBe(true)
      expect(codes(), pass).toContain('OIL_NO_PERIOD')
    }
  })
  it('with a real change waiting the working copy is the next amendment, where nobody would earn — and put back, the warning returns', () => {
    soleEarner(); publish()
    VCONF.openEnd = 120; validate()
    day().allhands[1].prog = 'Tasking B'; validate()
    expect(crowd(day().allhands[1])).toEqual([])
    expect(oilWouldEarn(SAT), 'the next amendment as it stands').toBe(false)
    day().allhands[1].prog = 'Tasking'; validate()
    expect(dayPendingItems(SAT)).toEqual([])
    expect(codes()).toContain('OIL_NO_PERIOD')
  })
})
