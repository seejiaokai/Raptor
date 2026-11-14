// @vitest-environment jsdom
/* A PUBLISHED DAY IS CHECKED BY THE LOGIC SETTINGS IT WAS PUBLISHED UNDER (owner D2005, 12 Nov 26 — over D186's "the
   validator reads today's rules" for a published day's own checks; it widens D1991, which kept only the brief it printed).
   His case, exactly: Ranger flies Monday's LATE and lands 19:00 — with the 2-hour debrief his day ends 21:00. Tuesday is
   PUBLISHED with Ranger on VL, take-off 12:00, B 09:40: 12h40 of rest, clean under "Crew rest" 12 hours. On Wednesday the
   admin raises "Crew rest" to 13 hours. He chose: Tuesday stays clean; the 13 hours applies to Tuesday from its next
   amendment, and to every unpublished day at once.
   The agent's readings (the coordinator's, told to him with the ruling): a changed setting neither STARTS nor CLEARS a
   flag on a published day; a published day with no change waiting shows the same on every surface (the working pass —
   Edit Schedule, the board — as the issued face, View-only Sched); once it is edited, its working copy previews its next
   amendment, so it reads today's settings; publishing it again keeps today's with the new version. OIL is not touched.
   Through the app's own doors: the write funnel (setSlotVal), validate(), the published book (setSign, setDayApproved,
   publishALDay) and the Logic settings (VCONF, SHIFT_HARD); read through the issued face (officialWarn), the working pass
   (workingWarn), the pending comparison (dayDelta) and the four sign-offs (daySigned). Harness: rulesfirst-7's. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { SCHED, setSign, setDayApproved, publishALDay, dayDelta, daySigned, dayCurVer, daySnapOf } from './publish'
import { VCONF, SHIFT_HARD } from './rules'
import { PEOPLE, scQualOK } from './people'
import { HOOKS } from './hooks'
import { validate, workingWarn, officialWarn } from './validate'
import { setSlotVal } from './slots'
import { makeStandalone } from './waves'
import { computeInsights } from './insights'
import { setSession } from '../state/auth'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF }, s: { ...SHIFT_HARD }, earn: HOOKS.oilEarningDay }
const MON = 0, TUE = 1, WED = 2, THU = 3
const day = (di: number): any => DAYS[di]
const ac = (p = '', w = '', rmks = '') => ({ p, w, rmks, area: '', opts: {} })
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [ac('bane')], ...o })
const wave = (forms: any[] = [form()], o: any = {}) => ({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: forms, ...o })
const ws = (b: any, di: number) => (((b.byDay || [])[di] || {}).warns || []) as any[]
const has = (b: any, di: number, code: string, id?: string) => ws(b, di).some((w: any) => w.code === code && (!id || (w.who || []).includes(id)))
/* a day's warnings as a comparable list: code, who, severity and words */
const sig = (b: any, di: number) => ws(b, di).map((w: any) => `${w.code}|${(w.who || []).join(',')}|${w.sev}|${w.msg}`).sort()
const sign = (di: number) => { setSign(di, 'cur', 'ignite'); setSign(di, 'sked', 'bane'); setSign(di, 'plan', 'stiff'); setSign(di, 'appr', 'pump') }
const publish = (di: number) => { validate(); sign(di); setDayApproved(di, true); validate(); sign(di) }
const snapOf = (di: number): any => daySnapOf(di, dayCurVer(di))

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720, maxRun: 6, tightTurn: 60, epBrief: 15, simDebrief: 30, amtDebrief: 30, simLen: 90, openEnd: 60, scDayFrom: 420, scDayTo: 1140 })
  Object.assign(SHIFT_HARD, saved.s)
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, added: {}, dayOK: {}, sign: {}, signBind: {}, retired: {}, correcting: {}, drafts: {}, curDraft: {} })
  setSession({ user: 'ad', role: 'admin' } as any)
})
afterEach(() => {
  HOOKS.oilEarningDay = saved.earn
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete (SCHED as any)[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
  Object.assign(SHIFT_HARD, saved.s)
  validate(); setSession(null)
})

/* his case: Ranger (bane) lands Monday's LATE at 19:00; the next day VL 12:00 with B 09:40 typed */
const lateThenVL = (prev: number, di: number) => {
  day(prev).waves.push(wave([form({ cs: 'LATE', to: '18:00', ld: '19:00' })]))
  day(di).waves.push(wave([form({ br: '09:40' })]))
}

describe('his case (D2005): "Crew rest" raised from 12 to 13 hours after Tuesday was published', () => {
  it('Tuesday stays clean on the published face AND on the working copy; nothing reads pending; the four stand', () => {
    lateThenVL(MON, TUE)
    publish(TUE)
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'the premise: 21:00 to a 09:40 brief is 12h40 — clean').toBe(false)
    VCONF.crewRest = 13 * 60; validate()
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'the published face (View-only Sched): clean').toBe(false)
    expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), 'the working copy, nothing changed on it (Edit Schedule, the board): clean too').toBe(false)
    expect([dayDelta(TUE), daySigned(TUE)], 'a changed setting makes nothing pending by itself').toEqual([[], true])
    expect(officialWarn().trace?.[MON]?.bane, 'no dotted "breaks tomorrow\'s crew rest" mark on Monday from the published Tuesday').toBeUndefined()
    expect(workingWarn().trace?.[MON]?.bane, '…on the working pass either').toBeUndefined()
  })
  it('an unpublished day is checked by the 13 hours at once — the same pair on Wednesday / Thursday turns Thursday red', () => {
    lateThenVL(MON, TUE); lateThenVL(WED, THU)
    publish(TUE)
    VCONF.crewRest = 13 * 60; validate()
    expect(has(workingWarn(), THU, 'CREW_REST', 'bane'), 'Thursday, a draft: red at once').toBe(true)
    expect(has(officialWarn(), THU, 'CREW_REST', 'bane'), 'and on View-only Sched').toBe(true)
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'Tuesday, published: still clean').toBe(false)
  })
  it('the 13 hours applies to Tuesday from its next amendment: an edit makes the working copy read today\'s setting; once published again the face is red and keeps 13 hours', () => {
    lateThenVL(MON, TUE)
    publish(TUE)
    VCONF.crewRest = 13 * 60; validate()
    expect(setSlotVal(`${TUE}.0.0.0.w`, 'pump'), 'an edit on Tuesday — a WSO added behind Ranger').toBe(true); validate()
    expect(dayDelta(TUE).length, 'the day reads pending').toBeGreaterThan(0)
    expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), 'the working copy previews the next amendment: red under 13 hours').toBe(true)
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'the published face is still the one issued: clean').toBe(false)
    sign(TUE); publishALDay(TUE); validate()
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'published again: red').toBe(true)
    expect(snapOf(TUE).rv.crewRest, 'the new version keeps the setting it went out under').toBe(13 * 60)
    VCONF.crewRest = 12 * 60; validate()
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'and a later change back does not clear it: judged by the 13 hours it went out under').toBe(true)
    expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), '…on the working copy, nothing changed on it, either').toBe(true)
  })
  it('a version published before this build kept no settings (or only the brief): it is judged by today\'s (demo data only, D56)', () => {
    lateThenVL(MON, TUE)
    publish(TUE)
    delete snapOf(TUE).rv                                   // as an older version stands in the store
    VCONF.crewRest = 13 * 60; validate()
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'no kept settings: today\'s 13 hours').toBe(true)
  })
})

/* ONE TEST PER SETTING: the same day planted twice — Tuesday (after Monday), published, and Thursday (after Wednesday),
   a draft. The setting is changed: Thursday's warnings move (the setting reaches an unpublished day at once — and the
   fixture really exercises it), Tuesday's do not, on the face or the working copy, and nothing reads pending. */
const EP = (o: any) => ({ label: 'EP-1', str: '10:00', end: '11:00', p: 'bane', w: '', rmks: '', ...o })
const MTG = (str: string, end: string) => ({ prog: 'MTG', str, end, who: 'bane' })
let dayOnly = ''
const cases: Array<[string, (prev: number, di: number) => void, () => void]> = [
  ['Crew rest', lateThenVL, () => { VCONF.crewRest = 780 }],
  ['Flight debrief after land (Monday\'s day ends later)', lateThenVL, () => { VCONF.debrief = 180 }],
  ['Default rally before T/O (the nominal report falls inside crew rest)', lateThenVL, () => { VCONF.reportLead = 200 }],
  ['Tight turn threshold', (_p, di) => { day(di).waves.push(wave([form({ to: '08:00', ld: '09:00' }), form({ cs: 'VR', to: '10:30', ld: '11:30' })])) }, () => { VCONF.tightTurn = 120 }],
  ['Step before take-off (the tight-turn floor)', (_p, di) => { day(di).waves.push(wave([form({ to: '08:00', ld: '09:00' }), form({ cs: 'VR', to: '10:30', ld: '11:30' })])) }, () => { VCONF.step = 90 }],
  ['Dekit after landing (the tight-turn floor)', (_p, di) => { day(di).waves.push(wave([form({ to: '08:00', ld: '09:00' }), form({ cs: 'VR', to: '10:30', ld: '11:30' })])) }, () => { VCONF.dekit = 60 }],
  ['Long work day', (_p, di) => { day(di).waves.push(wave([form()])) }, () => { VCONF.longDay = 300 }],
  ['Assumed sim length, no end time (a clash CLEARED by the change)', (_p, di) => { day(di).sims.oft.push({ label: 'BFM-9', str: '10:00', end: '', p: '', w: 'bane', rmks: '' }); day(di).ground.push(MTG('11:15', '12:00')) }, () => { VCONF.simLen = 60 }],
  ['Assumed length, no end time (a clash CLEARED by the change)', (_p, di) => { day(di).ground.push({ prog: 'LECT', str: '10:00', end: '', who: 'bane' }); day(di).ground.push(MTG('10:45', '11:30')) }, () => { VCONF.openEnd = 30 }],
  ['EP sim brief', (_p, di) => { day(di).sims.oft.push(EP({})); day(di).ground.push(MTG('09:00', '09:40')) }, () => { VCONF.epBrief = 30 }],
  ['Sim debrief', (_p, di) => { day(di).sims.oft.push(EP({ str: '08:00', end: '09:00' })); day(di).ground.push(MTG('09:40', '10:30')) }, () => { VCONF.simDebrief = 60 }],
  ['AMT debrief', (_p, di) => { day(di).sims.amt.push({ label: 'AMT', str: '08:00', end: '09:00', p: 'bane', w: '', rmks: '' }, { label: 'DEBRIEF', str: '09:00', end: '', p: '', w: '', rmks: '' }); day(di).ground.push(MTG('09:40', '10:30')) }, () => { VCONF.amtDebrief = 60 }],
  ['SC day window (a night shift becomes a day shift: the currency flag CLEARED by the change)', (_p, di) => {
    const w: any = makeStandalone('sc'); Object.assign(w.formations[0], { to: '13:00', ld: '21:00' }); w.formations[0].aircraft[0].p = dayOnly; day(di).waves.push(w)
  }, () => { VCONF.scDayTo = 22 * 60; VCONF.scDayFrom = 6 * 60 }],
  ['What an SC MAIN shift cannot share a minute with (a ground event made a Warning)', (_p, di) => {
    const w: any = makeStandalone('sc'); Object.assign(w.formations[0], { to: '08:00', ld: '12:00' }); w.formations[0].aircraft[0].p = 'bane'; day(di).waves.push(w); day(di).ground.push(MTG('09:00', '10:00'))
  }, () => { (SHIFT_HARD as any).ground = true }],
]
describe('every Logic setting a day\'s checks read: a published day keeps its own, an unpublished day takes the change at once (D2005)', () => {
  beforeEach(() => { dayOnly = Object.keys(PEOPLE).filter(id => !(PEOPLE as any)[id].special).find(id => scQualOK(id, 'day') && !scQualOK(id, 'night'))! })
  it.each(cases)('%s', (_name, plant, knob) => {
    plant(MON, TUE); plant(WED, THU)
    publish(TUE)
    const tueFace = sig(officialWarn(), TUE), tueWork = sig(workingWarn(), TUE), thu = sig(workingWarn(), THU)
    expect(tueWork, 'the premise: the published Tuesday reads the same on both passes').toEqual(tueFace)
    knob(); validate()
    expect(sig(workingWarn(), THU), 'the fixture exercises the setting: the unpublished Thursday moves at once').not.toEqual(thu)
    expect(sig(officialWarn(), TUE), 'the published face: unchanged').toEqual(tueFace)
    expect(sig(workingWarn(), TUE), 'the working copy, nothing changed on it: unchanged').toEqual(tueWork)
    expect([dayDelta(TUE), daySigned(TUE)], 'nothing reads pending').toEqual([[], true])
  })
})

/* D482 (1 Oct 26, settled — "A rule change logic page should move the mentioned work hours") is not a check of the day:
   Insights' work hours still move with a changed setting, published days included — D2005 rules the day's checks only
   (the agent's reading, set out in the report: D2005 does not clearly cover the hours, so D482 stands for them) */
describe('D482 stands beside D2005: Insights\' work hours move at once with a changed setting, a published day included', () => {
  it('Tuesday published (VL 12:00–13:00, no in-time: report 09:00, end 15:00 — 6 hours); the default rally raised to 4 hours: 7 hours in Insights, while Tuesday\'s checks keep its own', () => {
    day(TUE).waves.push(wave([form()]))
    publish(TUE)
    const mins = () => (computeInsights().hours.find((h: any) => h.id === 'bane') || {}).mins
    expect(mins(), 'the premise: 6 hours').toBe(360)
    VCONF.reportLead = 240; validate()
    expect(mins(), 'D482: the hours move at once').toBe(420)
    VCONF.debrief = 180; validate()
    expect(mins(), '…with the debrief too').toBe(480)
    expect([dayDelta(TUE), daySigned(TUE)], 'and nothing reads pending').toEqual([[], true])
  })
  it('a row with no end time counts the assumed length as it stands today — a published Tuesday\'s 10:00 lecture: 1 hour, then 1½ once the setting is 90 minutes', () => {
    day(TUE).ground.push({ prog: 'LECT', str: '10:00', end: '', who: 'bane' })
    publish(TUE)
    const mins = () => (computeInsights().hours.find((h: any) => h.id === 'bane') || {}).mins
    expect(mins(), 'the premise: 1 hour').toBe(60)
    VCONF.openEnd = 90; validate()
    expect(mins(), 'D482: the hours move at once').toBe(90)
  })
})

describe('"Max days worked in a row": the day being judged decides — a published Saturday by its kept limit', () => {
  const runWeek = () => { for (let di = 0; di <= 5; di++) day(di).waves.push(wave([form()])) }
  it('Ranger on six days running; Saturday (the sixth) published at a limit of 6; the limit lowered to 5: Saturday stays clean; the same week all unpublished turns red at once', () => {
    runWeek(); publish(5)
    expect(has(officialWarn(), 5, 'DAYS_RUN', 'bane'), 'the premise: six in a row at a limit of 6 is clean').toBe(false)
    VCONF.maxRun = 5; validate()
    expect(has(officialWarn(), 5, 'DAYS_RUN', 'bane'), 'published Saturday: still clean').toBe(false)
    expect(has(workingWarn(), 5, 'DAYS_RUN', 'bane'), '…on the working copy too').toBe(false)
    expect([dayDelta(5), daySigned(5)]).toEqual([[], true])
  })
  it('the same week with nothing published reads the new limit at once: Saturday red', () => {
    runWeek(); validate()
    expect(has(workingWarn(), 5, 'DAYS_RUN', 'bane'), 'the premise: clean at 6').toBe(false)
    VCONF.maxRun = 5; validate()
    expect(has(workingWarn(), 5, 'DAYS_RUN', 'bane'), 'unpublished: red at once').toBe(true)
    expect(has(officialWarn(), 5, 'DAYS_RUN', 'bane')).toBe(true)
  })
  it('the run trace follows the day it breaks on: Saturday published at 6, a seventh day (Sunday, a draft) at today\'s 5 — Sunday red, Saturday clean, the trace pointing at Sunday', () => {
    for (let di = 0; di <= 6; di++) day(di).waves.push(wave([form()]))
    publish(5)
    VCONF.maxRun = 5; validate()
    expect(has(officialWarn(), 5, 'DAYS_RUN', 'bane'), 'Saturday, judged by its kept 6: clean').toBe(false)
    expect(has(workingWarn(), 6, 'DAYS_RUN', 'bane'), 'Sunday, a draft, at 5: red').toBe(true)
    expect(workingWarn().trace?.[5]?.bane?.run?.dow, 'Saturday carries the dotted mark pointing at Sunday').toBe(day(6).dow)
  })
})
