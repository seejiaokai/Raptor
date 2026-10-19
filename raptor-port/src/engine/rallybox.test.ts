/* [RALLY-PER-FORMATION] — each formation's own rally box (owner D1026, D1032, D1034, 19 Oct 26), in the engine.
   The R box (f.rl) counts exactly as a typed rally did: the earliest applicable in-time or rally starts the formation's
   report — crew rest, the long day, OIL, work hours, the wave's report time — and an empty box counts as nothing entered
   (the nominal report, D592). The box is a formation's OWN rally: it replaces the whole-wave typed RALLY lines (D505), it
   stands beside a typed rally naming the formation (the earlier counts, D506), and it never becomes an in-time — a
   whole-wave in-time 06:00 with a rally 07:00 still starts everyone at 06:00 (D1034). Same harness as
   rally-consumers.test.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { SCHED } from './publish'
import { VCONF } from './rules'
import { buildDay, waveInTime } from './events'
import { dayOilSpans } from './oil'
import { validate, workSpan, REST } from './validate'
import { resolveReporting, reportingIssuesForWave } from './reporting'
import { txtSet, txtGet, TIME_TXT } from './slots'
import { dayKeys } from './restore'
import { makeStandalone } from './waves'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF } }
const f = (to = '12:00', ld = '13:00', br = '10:00', rl = '') => ({ cs: 'VL', msn: 'BFM', to, ld, br, rl, aircraft: [{ p: 'bane', w: '', rmks: '', opts: {} }] })
const flight = (lines: string[] = [], form: any = f()) => ({ label: 'WAVE 1', intimes: lines, formations: [form] })
const eventDay = (d: any) => buildDay(d, 0, undefined, undefined).events.filter((e: any) => e.id === 'bane')
const rep = (w: any, form = w.formations[0]) => resolveReporting(w, form, Number.parseInt(form.to) * 60 + +form.to.slice(3))
beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, dayOK: {}, sign: {} })
})
afterEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
})

describe('RB1 RB2 RB3 — the R box in the one reporting reader (D1032, D1034)', () => {
  it('a box alone is the report; an empty box is nothing entered (the nominal report, D592)', () => {
    expect(rep(flight([], f('12:00', '13:00', '10:00', '08:30')))).toMatchObject({ inTime: null, rally: 510, report: 510 })
    expect(rep(flight([], f()))).toMatchObject({ inTime: null, rally: null, report: null })
  })
  it('a whole-wave in-time stays everyone’s in-time: in-time 06:00 + box 07:00 reports at 06:00 (D1034)', () => {
    expect(rep(flight(['06:00 IN TIME'], f('12:00', '13:00', '10:00', '07:00')))).toMatchObject({ inTime: 360, rally: 420, report: 360 })
  })
  it('a typed line that still says RALLY stays a rally (D1034): the box, the formation’s own, replaces a whole-wave one (D505)', () => {
    expect(rep(flight(['06:30 RALLY'], f()))).toMatchObject({ rally: 390, report: 390 })
    expect(rep(flight(['06:30 RALLY'], f('12:00', '13:00', '10:00', '07:00'))), 'the box wins over the wave-wide rally').toMatchObject({ rally: 420, report: 420 })
  })
  it('a typed rally naming the formation stands beside its box: the earlier counts (D506)', () => {
    expect(rep(flight(['VL RALLY 06:45'], f('12:00', '13:00', '10:00', '07:00')))).toMatchObject({ rally: 405, report: 405 })
    expect(rep(flight(['VL RALLY 07:45'], f('12:00', '13:00', '10:00', '07:00')))).toMatchObject({ rally: 420, report: 420 })
  })
  it('a box later than the take-off is the evening before (D503)', () => {
    expect(rep(flight([], f('01:30', '03:00', '23:10', '22:00')))).toMatchObject({ rally: -120, report: -120 })
  })
  it('a standalone wave carries no rally: a stray value there is never read', () => {
    const w: any = makeStandalone('sc'); w.formations[0].to = '08:00'; w.formations[0].rl = '05:00'
    expect(resolveReporting(w, w.formations[0], 480).rally).toBeNull()
  })
})

describe('RB1 — the R box reaches every reader of the report', () => {
  it('crew rest counts to the box: a flight ending 02:00 the night before and a 12:00 box is 10h; an empty box, 13h', () => {
    DAYS[0].waves = [flight([], { ...f('22:00', '00:00', '20:00'), aircraft: [{ p: 'bane', w: '', rmks: '', opts: {} }] })]
    DAYS[1].waves = [flight([], f('15:00', '16:00', '12:40', '12:00'))]
    let w = validate().all.find((x: any) => x.di === 1 && x.code === 'CREW_REST' && x.who.includes('bane'))
    expect(w, 'the box at 12:00 leaves 10h after the 02:00 debrief').toBeTruthy()
    expect(w.msg).toContain('only 10h00 rest')
    DAYS[1].waves[0].formations[0].rl = ''
    w = validate().all.find((x: any) => x.di === 1 && x.code === 'CREW_REST' && x.who.includes('bane'))
    expect(w, 'empty: the brief at 12:40 — 10h40, still short of 12h').toBeTruthy()
    expect(REST[1].bane, 'the report the crew rest counts to moves with the box').toBeDefined()
  })
  it('the long day / work span and OIL start at the box, exactly as a typed rally (D591, D592)', () => {
    const d = DAYS[0]; d.waves = [flight([], f())]
    const none = workSpan(eventDay(d))?.span, oilNone = dayOilSpans(d).bane
    d.waves[0].formations[0].rl = '07:00'
    expect(workSpan(eventDay(d))?.span, 'the work span starts at 07:00: 07:00 to landing 13:00 plus the 2h debrief').toBe(480)
    expect(none!, 'and was shorter with the box empty').toBeLessThan(480)
    expect(dayOilSpans(d).bane).toEqual([[420, oilNone![0]![1]]])
    d.waves[0].formations[0].rl = ''; d.waves[0].intimes = ['07:00 RALLY']
    expect(dayOilSpans(d).bane, 'the same as a typed rally at 07:00').toEqual([[420, oilNone![0]![1]]])
  })
  it('the wave’s report time (its header and its window) reads the box', () => {
    const w: any = flight([], f('12:00', '13:00', '10:00', '08:15'))
    expect(waveInTime(w)).toBe(495)
  })
  it('the order check names the box as the rally: a box after the brief is red, never blocking (D507, D509)', () => {
    const issues = reportingIssuesForWave(flight([], f('12:00', '13:00', '10:00', '10:30')))
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ code: 'REPORT_ORDER', blocking: true })
    expect(issues[0]!.msg).toBe('VL: rally 10:30 is later than brief 10:00.')
    expect(reportingIssuesForWave(flight([], f('12:00', '13:00', '10:00', '09:30')))).toEqual([])
  })
})

describe('the box is a time box like B, TO and LD', () => {
  it('takes a time or nothing, folded to hh:mm, through the one write path; a rally after take-off is the evening before, never refused', () => {
    expect(TIME_TXT.test('ff:0.0.0.rl')).toBe(true)
    DAYS[0].waves = [flight([], f('01:30', '03:00', '23:10'))]
    expect(txtSet('ff:0.0.0.rl', 'morning'), 'not a time').toBe(false)
    expect(txtGet('ff:0.0.0.rl')).toBe('')
    expect(txtSet('ff:0.0.0.rl', '2200')).toBe(true)
    expect(txtGet('ff:0.0.0.rl')).toBe('22:00')
    expect(txtSet('ff:0.0.0.rl', '')).toBe(true)
    expect(txtGet('ff:0.0.0.rl')).toBe('')
  })
  it('a take-off moved earlier leaves the box alone (only a brief after it is removed)', () => {
    DAYS[0].waves = [flight([], f('12:00', '13:00', '', '09:00'))]
    expect(txtSet('ff:0.0.0.to', '08:00')).toBe(true)
    expect(txtGet('ff:0.0.0.rl')).toBe('09:00')
  })
  it('the box has its own key in the day’s fingerprint, so a changed rally is a change on a published day (the amendment)', () => {
    DAYS[0].waves = [flight([], f())]
    const before = dayKeys(DAYS[0], 0)
    expect(before.get('ff:0.0.0.rl')).toBe('')
    DAYS[0].waves[0].formations[0].rl = '0700'
    expect(dayKeys(DAYS[0], 0).get('ff:0.0.0.rl'), 'folded as a time, like B').toBe('07:00')
  })
})
