/* RULES-FIRST REVIEW, family 1 — report times: in-times, rallies, briefs and where a day starts (W1–W13)
   ([ENGINE-RULES-REVIEW], D1983, 11 Nov 26). One test per worklist item, each led by the ruling's own words, on a small
   made-up day through the engine's own doors (resolveReporting, reportingIssuesForWave, buildDay, workSpan, dayOilSpans,
   validate). Items whose ruled behaviour an existing test already holds whole are named in the review's results, not
   duplicated here. Harness: the same as rallybox.test.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { SCHED } from './publish'
import { VCONF } from './rules'
import { buildDay } from './events'
import { dayOilSpans } from './oil'
import { validate, workSpan } from './validate'
import { resolveReporting, reportingIssuesForWave } from './reporting'
import { makeStandalone } from './waves'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF } }
const h = (hh: number, mm = 0) => hh * 60 + mm
const toMin = (s: string) => Number.parseInt(s) * 60 + +s.slice(3)
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [{ p: 'bane', w: '', rmks: '', opts: {} }], ...o })
const wave = (lines: string[] = [], forms: any[] = [form()]) => ({ label: 'WAVE 1', intimes: lines, formations: forms })
const rep = (w: any, f = w.formations[0]) => resolveReporting(w, f, toMin(f.to))
const evs = (d: any, id = 'bane') => buildDay(d, 0, undefined, undefined).events.filter((e: any) => e.id === id)
const day = (waves: any[]) => ({ dow: 'Mon', dt: 'Jul 13', waves, dutywaves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [] })

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, dayOK: {}, sign: {} })
})
afterEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
})

describe('W1 — in-time, rally, brief, take-off, landing, never the other way (D497, D502, D507, D509, D1026)', () => {
  it('rally only starts the report; in-time then rally is in order; a rally may share the brief time (D507); a rally after the brief is a wrong pair', () => {
    expect(rep(wave(['08:30 RALLY']))).toMatchObject({ inTime: null, rally: h(8, 30), report: h(8, 30) })
    expect(reportingIssuesForWave(wave(['08:00 IN TIME', '08:30 RALLY']))).toEqual([])
    // the sharpest edge: equal is allowed, no new gap demanded — rally 09:40 with the suggested brief 09:40
    expect(reportingIssuesForWave(wave(['09:40 RALLY']))).toEqual([])
    expect(reportingIssuesForWave(wave([], [form({ rl: '10:00', br: '10:00' })]))).toEqual([])
    const late = reportingIssuesForWave(wave([], [form({ rl: '10:01', br: '10:00' })]))
    expect(late.map(i => i.msg)).toEqual(['VL: rally 10:01 is later than brief 10:00.'])
    // never the other way: an in-time after the rally is a wrong pair too
    expect(reportingIssuesForWave(wave(['09:00 IN TIME', '08:30 RALLY'])).map(i => i.msg)).toEqual(['VL: in-time 09:00 is later than rally 08:30.'])
  })
})

describe('W2 — the earliest applicable entered time is the report start, whatever the line order (D498, D506, D592, D501)', () => {
  it('two VL in-time lines 09:00 and 08:00, either order, report 08:00 for the reader, OIL and the work span; across midnight the day is resolved first', () => {
    for (const lines of [['VL IN TIME 09:00', 'VL IN TIME 08:00'], ['VL IN TIME 08:00', 'VL IN TIME 09:00']]) {
      const d = day([wave(lines)])
      expect(rep(d.waves[0]).report, lines.join(' / ')).toBe(h(8))
      expect(dayOilSpans(d).bane![0]![0]).toBe(h(8))
      expect(workSpan(evs(d))!.s).toBe(h(8))
    }
    // D506: "clock numbers alone do not decide across midnight" — 23:30 the evening before beats 00:15
    expect(rep(wave(['VL IN TIME 00:15', 'VL IN TIME 23:30'], [form({ to: '02:00', ld: '03:00' })])).report).toBe(-30)
  })
  it('a person\'s own earlier event starts his day sooner (D498): an 06:00–07:00 sortie before an 08:00 in-time', () => {
    const early = { label: 'WAVE 0', intimes: ['05:00 IN TIME'], formations: [form({ cs: 'VK', to: '06:00', ld: '07:00' })] }
    const d = day([early, wave(['08:00 IN TIME'])])
    expect(workSpan(evs(d))!.s).toBe(h(5))
  })
})

describe('W3 — a formation\'s own instruction replaces the whole-wave one of the same activity only (D505)', () => {
  it('whole-wave in-time 08:00 and VL\'s rally 08:30: VL reports 08:00; whole-wave rally 07:00 and VL\'s in-time 07:30: the rally still counts', () => {
    expect(rep(wave(['08:00 IN TIME', 'VL RALLY 08:30']))).toMatchObject({ inTime: h(8), rally: h(8, 30), report: h(8) })
    expect(rep(wave(['07:00 RALLY', 'VL IN TIME 07:30']))).toMatchObject({ inTime: h(7, 30), rally: h(7), report: h(7) })
    // …and within one activity the formation's own line does replace the whole-wave one, even when later
    expect(rep(wave(['06:00 IN TIME', 'VL IN TIME 07:00']))).toMatchObject({ inTime: h(7), report: h(7) })
  })
})

describe('W4 — a line applies to the formation it names (this wave\'s, any case, in remarks too) or the whole wave, never to a person (D500, D501, D504, D1034)', () => {
  it('names read case-insensitively and inside remarks; a person\'s name or another wave\'s callsign leaves it whole-wave; a typed RALLY line stays a rally', () => {
    const two = (lines: string[]) => wave(lines, [form(), form({ cs: 'VK', aircraft: [{ p: 'stiff', w: '', rmks: '', opts: {} }] })])
    let w = two(['vl in time 0715'])
    expect(rep(w, w.formations[0]).inTime).toBe(h(7, 15))
    expect(rep(w, w.formations[1]).inTime, 'VK is not named').toBeNull()
    w = two(['08:00 IN TIME + WX, brief with Vl lead'])
    expect([rep(w, w.formations[0]).inTime, rep(w, w.formations[1]).inTime]).toEqual([h(8), null])
    w = two(['08:00 IN TIME for bane'])                  // a person, never a target (D504)
    expect([rep(w, w.formations[0]).inTime, rep(w, w.formations[1]).inTime]).toEqual([h(8), h(8)])
    w = two(['08:00 IN TIME VIPER'])                     // VIPER is not this wave's formation
    expect([rep(w, w.formations[0]).inTime, rep(w, w.formations[1]).inTime]).toEqual([h(8), h(8)])
    // D1034: whole-wave in-time 06:00 and a typed "VL RALLY 07:00" — everyone, VL included, reports 06:00
    w = two(['06:00 IN TIME', 'VL RALLY 07:00'])
    expect(rep(w, w.formations[0])).toMatchObject({ inTime: h(6), rally: h(7), report: h(6) })
  })
})

describe('W5 — a formation\'s R box counts exactly as a typed rally did (D1032, D1027, D1034)', () => {
  it('the box is the report with no in-time; an own typed in-time line with the callsign replaces the whole-wave in-time; an earlier event of his own starts his day sooner', () => {
    expect(rep(wave([], [form({ rl: '08:30' })]))).toMatchObject({ inTime: null, rally: h(8, 30), report: h(8, 30) })
    // the same as a typed VL RALLY line, for OIL and the work span
    const box = day([wave([], [form({ rl: '08:30' })])]), typed = day([wave(['VL RALLY 08:30'])])
    expect(dayOilSpans(box).bane).toEqual(dayOilSpans(typed).bane)
    expect(workSpan(evs(box))!.s).toBe(workSpan(evs(typed))!.s)
    // whole-wave in-time 06:00 is every formation's, except one whose own typed in-time line carries its callsign
    const w = wave(['06:00 IN TIME', 'VL IN TIME 07:00'], [form({ rl: '07:30' }), form({ cs: 'VK', rl: '07:30' })])
    expect(rep(w, w.formations[0])).toMatchObject({ inTime: h(7), rally: h(7, 30), report: h(7) })
    expect(rep(w, w.formations[1])).toMatchObject({ inTime: h(6), rally: h(7, 30), report: h(6) })
    // "where it is the man's first event": an earlier sortie of his own starts the day sooner than the box
    const early = { label: 'WAVE 0', intimes: [], formations: [form({ cs: 'VK', to: '07:00', ld: '07:45', rl: '06:00' })] }
    expect(workSpan(evs(day([early, wave([], [form({ rl: '08:30' })])])))!.s).toBe(h(6))
  })
})

describe('W6 — an empty R box\'s default counts only where nothing is entered (D1031, D1786; crew rest UNCLEAR)', () => {
  it('as built: nothing entered — OIL and the work span start at T/O less the default rally (09:00); crew rest is measured to the suggested brief (09:40), not to 09:00', () => {
    const d = day([wave()])
    expect(dayOilSpans(d).bane![0]![0]).toBe(h(9))
    expect(workSpan(evs(d))!.s).toBe(h(9))
    // Sunday flight ends (landing 19:30 + 2h debrief) 21:30 → 12h rest clears at 09:30, between the default rally and the brief
    DAYS[0].waves = [wave([], [form({ to: '18:30', ld: '19:30' })])]
    DAYS[1].waves = [wave()]
    const all = validate().all.filter((x: any) => x.di === 1 && (x.who || []).includes('bane'))
    expect(all.find((x: any) => x.code === 'CREW_REST'), 'as built: no crew-rest breach — the 09:40 suggested brief clears').toBeUndefined()
    expect(all.find((x: any) => x.code === 'CREW_TIGHT'), 'as built: the amber tight-turn advisory reads the 09:00 default instead').toBeTruthy()
  })
})

describe('W7 — no timing-order problem blocks publishing; a blank brief is checked as the suggested brief (D509, D502)', () => {
  it('in-time 10:00 against a blank brief: a red warning naming the "suggested brief"', () => {
    DAYS[0].waves = [wave(['10:00 IN TIME'])]
    const w = validate().all.find((x: any) => x.di === 0 && x.code === 'REPORT_ORDER')
    expect(w).toBeTruthy()
    expect(w.sev).toBe('hard')                                      // red, in the warning list
    expect(w.msg).toBe('VL: in-time 10:00 is later than suggested brief 09:40.')
  })
})

describe('W8 — a clock later than its take-off is the evening before, never more than one day back (D503)', () => {
  it('23:00 against a 01:00 take-off is −60; a clock equal to the take-off stays the same day; nothing goes back two days', () => {
    expect(rep(wave(['23:00 IN TIME'], [form({ to: '01:00', ld: '02:00' })])).report).toBe(-60)
    expect(rep(wave(['12:00 IN TIME'])).report, 'equal is not "later than"').toBe(h(12))
    expect(rep(wave(['23:59 IN TIME'], [form({ to: '00:00', ld: '01:00' })])).report).toBe(-1)
    for (const c of ['00:01', '12:00', '23:59']) expect(rep(wave([`${c} IN TIME`], [form({ to: '00:00', ld: '01:00' })])).report!).toBeGreaterThan(-1440)
  })
})

describe('W9 — "+ In-time" fills the first line; the words it writes are free text (D510, D511, D600; D1026 vs D1034 UNCLEAR)', () => {
  it('as built: a line minted with the Logic words "RALLY" is read as a whole-wave RALLY, so a formation\'s R box replaces it', () => {
    // the button mints "09:00H: " + VCONF.reportText; with the text set to RALLY (D511's own example)
    const minted = '09:00H: RALLY'
    const w = wave([minted], [form({ rl: '10:00' })])
    // read as a rally (D1034 "a typed line saying RALLY stays a rally"): the box replaces it, VL reports 10:00
    // read as an in-time (D1026: "the word RALLY in this text no longer makes a rally"): VL would report 09:00
    expect(rep(w)).toMatchObject({ inTime: null, rally: h(10), report: h(10) })
  })
})

describe('W11 — on SC, AVALON and BB an empty R or B counts for nothing (D1037, D1039, D1065)', () => {
  it('an SC MAIN line with both boxes empty starts at its START; AVALON with both empty is not a flight', () => {
    const sc: any = makeStandalone('sc'); Object.assign(sc.formations[0], { to: '07:00', ld: '13:00', br: '', rl: '' }); sc.formations[0].aircraft[0].p = 'bane'; sc.formations.length = 1
    const e = evs(day([sc]))
    expect(e).toHaveLength(1)
    expect(workSpan(e)!.s, 'no worked-out rally or brief moves it').toBe(h(7))
    const av: any = makeStandalone('avalon'); Object.assign(av.formations[0], { to: '07:00', ld: '19:00', br: '', rl: '' }); av.formations[0].aircraft[0].p = 'bane'; av.formations.length = 1
    expect(evs(day([av])), 'an AVALON with nothing typed stands by — no event').toHaveLength(0)
  })
})

describe('W12 — an SC line\'s B is the crew\'s in-time; blank changes nothing (settled 24 Aug 26)', () => {
  it('an early B starts an SC MAIN\'s day; a B later than START never shortens it; blank leaves START', () => {
    const sc = (br: string) => { const w: any = makeStandalone('sc'); Object.assign(w.formations[0], { to: '07:00', ld: '13:00', br, rl: '' }); w.formations[0].aircraft[0].p = 'bane'; w.formations.length = 1; return day([w]) }
    expect(workSpan(evs(sc('05:30')))!.s).toBe(h(5, 30))
    expect(workSpan(evs(sc('08:00')))!.s).toBe(h(7))
    expect(workSpan(evs(sc('')))!.s).toBe(h(7))
  })
  it('as built (UNCLEAR — "both on a MAIN only" against D1044/D1045): the amber in-time advisory now also fires for an SC SPARE on a line whose B is typed', () => {
    const sc: any = makeStandalone('sc'); Object.assign(sc.formations[0], { to: '07:00', ld: '13:00', br: '05:00', rl: '' }); sc.formations.length = 1
    const rows = sc.formations[0].aircraft
    rows[0].p = 'bane'; rows[rows.length - 1].p = 'stiff'
    expect(rows[rows.length - 1].spare).toBe(true)
    // a short 05:30 sortie (occupied 04:30–06:00) cuts into the 05:00–07:00 in-time window, not the 07:00 shift
    const early = (who: string) => ({ label: 'WAVE 0', intimes: [], formations: [form({ cs: 'VK', to: '05:30', ld: '05:45', br: '05:20', aircraft: [{ p: who, w: '', rmks: '', opts: {} }] })] })
    const intimeAdv = () => validate().all.filter((x: any) => x.di === 0 && x.code === 'SC_INTIME').map((x: any) => x.who.join())
    DAYS[0].waves = [early('bane'), sc]
    expect(intimeAdv(), 'the MAIN: as the 24 Aug rule says').toEqual(['bane'])
    DAYS[0].waves = [early('stiff'), sc]
    expect(intimeAdv(), 'the SPARE: as built it fires too').toEqual(['stiff'])
  })
})

describe('W13 — a rally on an SC MAIN starts the day as its B does; a B or R on any standby line flies the whole line (D1036, D1041, D1044, D1045)', () => {
  it('SC MAIN: the earlier of B and R; AVALON with R typed flies every row, its SPARE row too, ending at END', () => {
    const sc: any = makeStandalone('sc'); Object.assign(sc.formations[0], { to: '07:00', ld: '13:00', br: '06:00', rl: '05:15' }); sc.formations[0].aircraft[0].p = 'bane'; sc.formations.length = 1
    expect(workSpan(evs(day([sc])))!.s).toBe(h(5, 15))
    const av: any = makeStandalone('avalon'); Object.assign(av.formations[0], { to: '07:00', ld: '19:00', br: '', rl: '06:00' }); av.formations.length = 1
    const rows = av.formations[0].aircraft
    rows[0].p = 'bane'; rows[rows.length - 1].p = 'stiff'
    const d = day([av])
    for (const id of ['bane', 'stiff']) {
      const s = workSpan(evs(d, id))
      expect(s, id).toBeTruthy()
      expect([s!.s, s!.e], id).toEqual([h(6), h(19)])
    }
  })
})
