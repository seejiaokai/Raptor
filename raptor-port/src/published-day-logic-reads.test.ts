// @vitest-environment jsdom
/* D2005, THE TWO BLIND READS' FINDINGS, PINNED (12 Nov 26). Written by the fresh Opus reader as proof tests, each red on
   the first build and green after its fix: F1 the day before's assumed end judged by the judged day; F2 a hide-only
   change previews today's settings; F3 the picker's run question by each day's own limit; F4 a frozen advisory's words
   by the day's own settings, so a Logic change never makes it pending; plus Astra's finding 3, OIL's earning test on
   today's settings whole. Harness copied from engine/published-day-logic.test.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './engine/data'
import { INPUTS } from './engine/inputs'
import { SCHED, setSign, setDayApproved, publishALDay, dayDelta, daySigned, dayCurVer, daySnapOf } from './engine/publish'
import { VCONF, SHIFT_HARD, withRuleVals, withLiveRules, ruleNow } from './engine/rules'
import { HOOKS } from './engine/hooks'
import { validate, workingWarn, officialWarn, crossDayIfPlaced, wlbl, WCODE } from './engine/validate'
import { withDaySnap } from './ui/html'
import { setSlotVal } from './engine/slots'
import { hideKey } from './engine/warnhide'
import { setSession } from './state/auth'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF }, s: { ...SHIFT_HARD }, earn: HOOKS.oilEarningDay, hk: HOOKS.hiddenKeys }
const MON = 0, TUE = 1, WED = 2
const day = (di: number): any => DAYS[di]
const ac = (p = '', w = '', rmks = '') => ({ p, w, rmks, area: '', opts: {} })
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [ac('bane')], ...o })
const wave = (forms: any[] = [form()], o: any = {}) => ({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: forms, ...o })
const ws = (b: any, di: number) => (((b.byDay || [])[di] || {}).warns || []) as any[]
const has = (b: any, di: number, code: string, id?: string) => ws(b, di).some((w: any) => w.code === code && (!id || (w.who || []).includes(id)))
const sign = (di: number) => { setSign(di, 'cur', 'ignite'); setSign(di, 'sked', 'bane'); setSign(di, 'plan', 'stiff'); setSign(di, 'appr', 'pump') }
const publish = (di: number) => { validate(); sign(di); setDayApproved(di, true); validate(); sign(di) }

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720, maxRun: 6, tightTurn: 60, epBrief: 15, simDebrief: 30, amtDebrief: 30, simLen: 90, openEnd: 60, scDayFrom: 420, scDayTo: 1140 })
  Object.assign(SHIFT_HARD, saved.s)
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, added: {}, dayOK: {}, sign: {}, signBind: {}, retired: {}, correcting: {}, drafts: {}, curDraft: {} })
  setSession({ user: 'ad', role: 'admin' } as any)
  HOOKS.hiddenKeys = null
})
afterEach(() => {
  HOOKS.oilEarningDay = saved.earn; HOOKS.hiddenKeys = saved.hk
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete (SCHED as any)[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
  Object.assign(SHIFT_HARD, saved.s)
  validate(); setSession(null)
})

describe('F1 — cross-day crew rest: the day before\'s ASSUMED end is built under the day before\'s settings, not the judged day\'s', () => {
  it('published Tuesday; Monday (a draft) ends with a 20:00 lecture with no end time; "Assumed length, no end time" 60 → 120: Tuesday must stay clean', () => {
    day(MON).ground.push({ prog: 'LECT', str: '20:00', end: '', who: 'bane' })     // assumed 21:00
    day(TUE).waves.push(wave([form({ br: '09:40' })]))                               // 21:00 + 12h = 09:00 ≤ 09:40 — clean
    publish(TUE)
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'premise: clean').toBe(false)
    VCONF.openEnd = 120; validate()                                                  // Monday's lecture now assumed to 22:00 → clear 10:00
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'published face (View-only Sched)').toBe(false)
    expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), 'working copy, nothing changed on it').toBe(false)
  })
  it('the same with Monday\'s sim with no end time and "Assumed sim length"', () => {
    day(MON).sims.oft.push({ label: 'BFM-9', str: '19:30', end: '', p: 'bane', w: '', rmks: '' })   // assumed 21:00
    day(TUE).waves.push(wave([form({ br: '09:40' })]))
    publish(TUE)
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'premise: clean').toBe(false)
    VCONF.simLen = 180; validate()
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'published face').toBe(false)
    expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), 'working copy').toBe(false)
  })
})

describe('F1 mirror — a published Monday\'s assumed end does not take a changed setting for a DRAFT Tuesday', () => {
  it('Monday published with a 20:00 lecture, no end; Tuesday a draft; "Assumed length" 60 → 120: Tuesday (unpublished) must read 120 at once', () => {
    day(MON).ground.push({ prog: 'LECT', str: '20:00', end: '', who: 'bane' })
    day(TUE).waves.push(wave([form({ br: '09:40' })]))
    publish(MON)
    expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), 'premise: clean').toBe(false)
    VCONF.openEnd = 120; validate()
    expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), 'the draft Tuesday is judged by today\'s setting: 22:00 + 12h = 10:00 after the 09:40 brief').toBe(true)
  })
})

describe('F2 —a change waiting that untouchedKept does not see: the working copy does not preview the next amendment', () => {
  it('Tuesday published; crew rest raised to 13h; a warning on Tuesday hidden (one change waiting): the working copy must read today\'s 13h (as the amendment will)', () => {
    day(MON).waves.push(wave([form({ cs: 'LATE', to: '18:00', ld: '19:00' })]))
    day(TUE).waves.push(wave([form({ br: '09:40' }), form({ cs: 'T1', to: '14:00', ld: '15:00', aircraft: [ac('stiff')] }), form({ cs: 'T2', to: '16:00', ld: '17:00', aircraft: [ac('stiff')] })]))
    VCONF.tightTurn = 120
    publish(TUE)
    const turn = ws(officialWarn(), TUE).find((w: any) => w.code === 'TURN')
    expect(turn, 'premise: a tight-turn advisory to hide').toBeTruthy()
    VCONF.crewRest = 13 * 60; validate()
    expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), 'premise: untouched — kept 12h').toBe(false)
    const k = hideKey(turn); HOOKS.hiddenKeys = () => new Set([k]); validate()
    expect(dayDelta(TUE).length, 'the hide is one change waiting').toBeGreaterThan(0)
    const workingRed = has(workingWarn(), TUE, 'CREW_REST', 'bane')
    sign(TUE); publishALDay(TUE); validate()
    const faceRed = has(officialWarn(), TUE, 'CREW_REST', 'bane')
    expect([workingRed, faceRed], 'the working copy before publishing must show what the amendment then shows').toEqual([faceRed, faceRed])
  })
})

describe('the narrow read of the fixes — a hide that today\'s settings would clear never makes the day flip between passes', () => {
  it('Tuesday published at tight turn 120 with its TURN advisory; the setting lowered to 30; TURN hidden: five passes read the same', () => {
    day(TUE).waves.push(wave([form({ cs: 'T1', to: '14:00', ld: '15:00', aircraft: [ac('stiff')] }), form({ cs: 'T2', to: '16:00', ld: '17:00', aircraft: [ac('stiff')] })]))
    VCONF.tightTurn = 120
    publish(TUE)
    const turn = ws(officialWarn(), TUE).find((w: any) => w.code === 'TURN')
    expect(turn, 'premise: a tight-turn advisory to hide').toBeTruthy()
    VCONF.tightTurn = 30; validate()
    const k = hideKey(turn); HOOKS.hiddenKeys = () => new Set([k])
    const seen: string[] = []
    for (let i = 0; i < 5; i++) {
      validate()
      const t = ws(workingWarn(), TUE).find((w: any) => w.code === 'TURN')
      seen.push(JSON.stringify([dayDelta(TUE).length, t ? t.msg : null, daySigned(TUE)]))
    }
    expect(seen.slice(1), 'every pass after the hide reads the same').toEqual(seen.slice(1).map(() => seen[1]))
    expect(JSON.parse(seen[0])[0], 'the hide is one change waiting from the first pass').toBeGreaterThan(0)
    expect(JSON.parse(seen[4])[0], '…and stays one').toBeGreaterThan(0)
  })
})

describe('the narrow read of the fixes — the issued face names its warning\'s limit by the settings it went out with', () => {
  it('Tuesday published at crew rest 13h, lowered to 11h: the heading reads <13h on the working copy and inside the issued face alike', () => {
    day(MON).waves.push(wave([form({ cs: 'LATE', to: '18:00', ld: '19:00' })]))
    day(TUE).waves.push(wave([form({ br: '08:40' })]))
    VCONF.crewRest = 13 * 60
    publish(TUE)
    VCONF.crewRest = 11 * 60; validate()
    const working = wlbl(WCODE.CREW_REST, TUE)
    const face = withDaySnap(TUE, dayCurVer(TUE), () => wlbl(WCODE.CREW_REST, TUE))
    expect([working, face]).toEqual([expect.stringContaining('13h'), expect.stringContaining('13h')])
  })
})

describe('F3 — the crew picker\'s run question reads today\'s limit, the validator the judged day\'s', () => {
  it('Saturday published at a limit of 5, the limit raised to 6; Ranger on Mon, Tue, Thu, Fri, Sat; placing him on Wednesday: the picker must say what the validator then flags', () => {
    VCONF.maxRun = 5
    for (const di of [0, 1, 3, 4, 5]) day(di).waves.push(wave([form()]))
    day(WED).waves.push(wave([form({ aircraft: [ac('')] })]))
    publish(5)
    VCONF.maxRun = 6; validate()
    const said = crossDayIfPlaced('bane', `${WED}.0.0.0.p`)
    expect(setSlotVal(`${WED}.0.0.0.p`, 'bane')).toBe(true); validate()
    const flagged = has(workingWarn(), 5, 'DAYS_RUN', 'bane') || has(officialWarn(), 5, 'DAYS_RUN', 'bane')
    expect([flagged, /day in a row/.test(said)], 'the picker and the validator agree').toEqual([flagged, flagged])
  })
})

describe('F4 — a frozen-class warning that reads TODAY\'s settings on the published day makes it pending', () => {
  it('Tuesday published: a sortie typed 12:00–12:00 with its rally box at 12:00; "Flight debrief after land" 120 → 0: nothing pending, the four stand', () => {
    day(TUE).waves.push(wave([form({ to: '12:00', ld: '12:00', rl: '12:00' })]))
    publish(TUE)
    expect(has(officialWarn(), TUE, 'FLT_NO_LEN'), 'premise: the advisory is there').toBe(true)
    expect([dayDelta(TUE), daySigned(TUE)], 'premise').toEqual([[], true])
    VCONF.debrief = 0; validate()
    expect([dayDelta(TUE).map((e: any) => e.kind), daySigned(TUE)], 'a Logic change makes nothing pending (D2005, D186)').toEqual([[], true])
  })
})

describe('Astra 3 — OIL keeps today\'s settings whole inside a day judged by its kept ones', () => {
  it('withLiveRules lifts the overlay — VCONF and SHIFT_HARD today\'s inside, the kept values back after', () => {
    VCONF.simLen = 180
    const k0 = Object.keys(SHIFT_HARD)[0], live = SHIFT_HARD[k0]
    withRuleVals({ simLen: 60, shiftHard: { [k0]: !live } }, () => {
      expect([VCONF.simLen, SHIFT_HARD[k0]], 'premise: the overlay is on').toEqual([60, !live])
      withLiveRules(() => {
        expect([VCONF.simLen, SHIFT_HARD[k0], ruleNow('simLen')], 'today\'s, whole').toEqual([180, live, 180])
        withRuleVals({ simLen: 30 }, () => expect(ruleNow('simLen'), 'a day judged inside still has today\'s as its ruleNow').toBe(180))
      })
      expect([VCONF.simLen, SHIFT_HARD[k0]], 'the kept values back').toEqual([60, !live])
    })
    expect([VCONF.simLen, SHIFT_HARD[k0]], 'and today\'s after').toEqual([180, live])
  })
  /* the day-level proof (Astra's: OIL's evidence under a kept overlay equals today's) needs a dated week with a Leave War
     period, which this harness clears; validate()'s OIL block runs inside withLiveRules, and the mechanism is pinned above */
})
