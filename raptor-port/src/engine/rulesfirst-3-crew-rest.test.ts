/* RULES-FIRST REVIEW, family 3 — crew rest, the run of days, the long work day and turns (W27–W39)
   ([ENGINE-RULES-REVIEW], D1983, 11 Nov 26). One test per worklist item, each led by the ruling's own words, on a small
   made-up day through the engine's own doors (validate, workSpan, dayOilSpans, WARN, lgChecks). Items whose ruled
   behaviour an existing test already holds whole are named in the review's results, not duplicated here. Harness: the
   same as rallybox.test.ts / rulesfirst-1-report-times.test.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { SCHED } from './publish'
import { VCONF } from './rules'
import { validate, workSpan, dayEvents, sevOf, chipOf, WARN } from './validate'
import { dayOilSpans } from './oil'
import { makeStandalone } from './waves'
import { lgChecks } from '../ui/logic-html'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF } }
const h = (hh: number, mm = 0) => hh * 60 + mm
const MON = 0, TUE = 1, WED = 2, THU = 3, FRI = 4
const DT = ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19']
const add = (di: number, w: any) => { (DAYS[di] as any).waves.push(w); return w }
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [{ p: 'bane', w: '', rmks: '', opts: {} }], ...o })
const wave = (lines: string[] = [], forms: any[] = [form()]) => ({ label: 'WAVE 1', intimes: lines, formations: forms })
const ground = (di: number, who: string, str: string, end: string, prog = 'BRIEFING') => (DAYS[di] as any).ground.push({ prog, str, end, who })
const inp = (di: number, person: string, type: string, s: number, e: number) => INPUTS.push({ person, date: DT[di], allday: false, s, e, type, remarks: '', mod: '' } as any)
const warns = (di: number, id: string | null, code?: string | RegExp) => validate().all.filter((x: any) => x.di === di
  && (id == null || (x.who || []).includes(id))
  && (!code || (typeof code === 'string' ? x.code === code : code.test(x.code))))
const allOf = (code: string) => validate().all.filter((x: any) => x.code === code)
const logicCheck = (id: string) => lgChecks().flatMap(g => g.items).find(c => c.id === id)!

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720, maxRun: 6, tightTurn: 60 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, dayOK: {}, sign: {} })
})
afterEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
})

describe('W27 — crew rest runs off the last commitment of ANY kind the day before, to a flying member\'s earliest in-time (D933; 21 Aug 26)', () => {
  it('a ground row, a typed Meeting input end the day before; Personal does not; exactly 12h is legal; an earlier event binds; a day with no flying asks nothing', () => {
    ground(MON, 'bane', '1000', '2130')                                // Monday ends 21:30 → clear 09:30
    const tue: any = add(TUE, wave(['09:00 IN TIME']))
    expect(warns(TUE, 'bane', 'CREW_REST').map((x: any) => x.sev), 'a ground row ends the day before').toEqual(['hard'])
    tue.intimes = ['09:30 IN TIME']
    expect(warns(TUE, 'bane', 'CREW_REST'), 'the equal-time edge: exactly 12h is legal').toEqual([])
    ;(DAYS[MON] as any).ground.splice(0); tue.intimes = ['09:00 IN TIME']
    inp(MON, 'bane', 'Personal', h(18), h(23))
    expect(warns(TUE, 'bane', 'CREW_REST'), '"do not include personal"').toEqual([])
    INPUTS.splice(0); inp(MON, 'bane', 'Meeting', h(18), h(23))
    expect(warns(TUE, 'bane', 'CREW_REST').length, 'a commitment input with typed times bears rest').toBe(1)
    INPUTS.splice(0); ground(MON, 'bane', '1000', '2000')            // clear 08:00; the 09:00 in-time is clear
    ground(TUE, 'bane', '0700', '0800', 'MTG')
    const cr = warns(TUE, 'bane', 'CREW_REST')
    expect(cr.length, 'the first event of the day binds, though the in-time is clear').toBe(1)
    expect(cr[0].msg).toContain('his day starts 07:00 (MTG) before the 09:00 report')
    ;(DAYS[TUE] as any).waves.splice(0)
    expect(warns(TUE, 'bane', 'CREW_REST'), '"the rule only exists when he FLIES that day"').toEqual([])
  })
  // UNCLEAR (the lead from family 1, my own read of D1032's full row): with nothing entered, crew rest is measured to
  // the suggested BRIEF while OIL and the long day start at the default rally; tapping the faint suggested rally then
  // turns a clean day red, though D1032 told him "OIL and crew rest move only once a time is typed or taken (an empty
  // box's default is today's nominal report)".
  it('as built: nothing entered — no red breach (09:40 brief clears), only the amber note; tapping the suggested 09:00 rally into R creates the red breach, while OIL and the work span do not move', () => {
    add(MON, wave([], [form({ to: '18:30', ld: '19:30' })]))           // Monday ends 21:30 → clear 09:30
    const tue: any = add(TUE, wave())                                  // take-off 12:00, nothing entered
    expect(warns(TUE, 'bane', 'CREW_REST'), 'as built: measured to the 09:40 suggested brief').toEqual([])
    expect(warns(TUE, 'bane', 'CREW_TIGHT').length, 'as built: the amber note reads the 09:00 default').toBe(1)
    const oil0 = dayOilSpans(DAYS[TUE]).bane![0]![0]; validate(); const ws0 = workSpan(dayEvents(TUE, 'bane'))!.s
    expect([oil0, ws0], 'OIL and the long day start at the default rally').toEqual([h(9), h(9)])
    tue.formations[0].rl = '09:00'                                     // the faint suggestion, one tap
    expect(warns(TUE, 'bane', 'CREW_REST').length, 'as built: the same time, now typed, is a red breach').toBe(1)
    validate()
    expect([dayOilSpans(DAYS[TUE]).bane![0]![0], workSpan(dayEvents(TUE, 'bane'))!.s], 'OIL and the long day did not move').toEqual([h(9), h(9)])
  })
})

describe('W29 — the checks read across the week\'s edge only for the run and Monday\'s crew rest; a flag lands on the day it breaks; the tight-turn note never draws the trace (settled, Aug–Sep 26)', () => {
  it('a breach lands on the day it breaks with its trace on the day before; a tight turn files its note and draws no trace', () => {
    add(MON, wave([], [form({ to: '18:30', ld: '19:30' })]))           // ends 21:30 → clear 09:30
    const tue: any = add(TUE, wave(['09:00 IN TIME']))
    validate()
    expect(WARN.all.filter((x: any) => x.code === 'CREW_REST').map((x: any) => x.di), 'the flag lands on Tuesday only').toEqual([TUE])
    expect(WARN.trace[MON]?.bane?.di, 'the trace on Monday points at Tuesday').toBe(TUE)
    tue.intimes = ['10:00 IN TIME']                                    // instructed clear; the 3h default (09:00) is not
    validate()
    expect(WARN.all.filter((x: any) => x.code === 'CREW_TIGHT').map((x: any) => x.di)).toEqual([TUE])
    expect(WARN.trace[MON]?.bane, '"the tight-turn note never draws the trace"').toBeUndefined()
  })
})

describe('W30 — the breach is also filed against the day that CAUSED it: one breach, one warning, a trace on the day before (6 Aug 26)', () => {
  it('Monday\'s late landing busts Tuesday: one CREW_REST warning in the week, on Tuesday; Monday carries the trace naming the late leg and the leave-by', () => {
    add(MON, wave([], [form({ to: '18:30', ld: '19:30' })]))
    add(TUE, wave(['09:00 IN TIME']))
    validate()
    const cr = WARN.all.filter((x: any) => x.code === 'CREW_REST')
    expect(cr.length, 'one breach, one warning').toBe(1)
    const t = WARN.trace[MON].bane
    expect([t.di, t.leaveBy, t.fromKey], 'the day of the breach, the leave-by, the leg on Monday that ran late').toEqual([TUE, '21:00', `${MON}.0.0.0.p`])
    expect(t.msg).toBe(cr[0].msg)
  })
})

describe('W31 — a sortie-caused breach spells out the debrief assumption; anything else ends at its written end with no tail (15 Aug 26; D1045)', () => {
  it('a sortie: "landed 19:30, +2h debrief assumed"; a flying SC line: "ended 19:00", no debrief; the long-day note likewise', () => {
    add(MON, wave([], [form({ to: '18:30', ld: '19:30' })]))
    add(TUE, wave(['09:00 IN TIME']))
    expect(warns(TUE, 'bane', 'CREW_REST')[0].msg).toContain('landed 19:30, +2h debrief assumed → ended 21:30 → crew rest clear at 09:30')
    ;(DAYS[MON] as any).waves.splice(0)
    const sc: any = makeStandalone('sc'); add(MON, sc)
    const pm = sc.formations[1]; pm.rl = '12:00'; pm.aircraft[2].p = 'bane'          // SC PM 13:00–19:00 flies, SPARE seated
    ;(DAYS[TUE] as any).waves[0].intimes = ['06:30 IN TIME']
    const msg = warns(TUE, 'bane', 'CREW_REST')[0].msg
    expect(msg, 'a flying standby line ends at END').toContain('ended 19:00 → crew rest clear at 07:00')
    expect(msg).not.toContain('debrief assumed')
    ground(MON, 'bane', '0500', '1100')                                // 05:00 → 19:00 = 14h, ended by the shift
    const ld = warns(MON, 'bane', 'LONGDAY')
    expect(ld.length).toBe(1)
    expect(ld[0].msg, 'a non-flying finish stays bare').not.toContain('debrief assumed')
  })
})

describe('W32 — tight turn needs max(tightTurn, dekit + step); a double turn is ONE amber line naming everyone; overlapping legs are a double booking, not a double turn (4 Aug, 21 Aug 26)', () => {
  it('a turn under 90 min is amber; two men double turning share one DT_SUM line; a man whose only pair overlaps is in no DT line', () => {
    add(TUE, wave([], [form({ to: '08:00', ld: '09:00' }), form({ cs: 'RG', to: '10:29', ld: '11:30' })]))
    ;(DAYS[TUE] as any).waves[0].formations[1].aircraft[0].p = 'bane'
    const turn = warns(TUE, 'bane', 'TURN')
    expect(turn.map((x: any) => x.sev), '89 min < max(60, 30 + 60)').toEqual(['adv'])
    ;(DAYS[TUE] as any).waves[0].formations[1].to = '10:30'
    expect(warns(TUE, 'bane', 'TURN'), 'exactly 90 min is enough').toEqual([])
    ;(DAYS[TUE] as any).waves[0].formations.forEach((f: any) => f.aircraft[0].w = 'split')
    const dt = allOf('DT_SUM').filter((x: any) => x.di === TUE)
    expect(dt.length, 'ONE line').toBe(1)
    expect([dt[0].sev, [...dt[0].who].sort()], 'amber, naming everyone').toEqual(['adv', ['bane', 'split']])
    ;(DAYS[TUE] as any).waves[0].formations[1].to = '08:30'; (DAYS[TUE] as any).waves[0].formations[1].ld = '09:30'
    expect(allOf('DT_SUM').filter((x: any) => x.di === TUE), 'airborne windows overlap: no double turn').toEqual([])
    expect(warns(TUE, 'bane', 'DOUBLE_BOOK').length, '…the hard clash speaks instead').toBeGreaterThan(0)
  })
  // UNCLEAR: D1042 "every warning an ordinary flying line gets" and D1045 "every row is a jet that flies … in the day's
  // flying count and Insights" against the turn rules, which read ordinary sorties only (byP filters out shifts).
  it('as built: a sortie and a flying SC SPARE row the same day are two sorties in Insights, but raise no double turn', () => {
    add(TUE, wave([], [form({ to: '06:00', ld: '07:00' })]))
    const sc: any = makeStandalone('sc'); add(TUE, sc)
    const pm = sc.formations[1]; pm.rl = '12:00'; pm.aircraft[2].p = 'bane'
    validate()
    expect(dayEvents(TUE, 'bane').map((e: any) => e.kind).sort(), 'two flights').toEqual(['fly', 'shift'])
    expect(allOf('DT_SUM').filter((x: any) => x.di === TUE), 'as built: no double turn').toEqual([])
  })
})

describe('W33 — a break day is due after maxRun consecutive days; any tasking counts, leave resets (Aug 26)', () => {
  it('timed rows on Tue–Fri with a limit of 3 break on Friday; a leave day resets the count', () => {
    VCONF.maxRun = 3
    ;[TUE, WED, THU, FRI].forEach(di => ground(di, 'bane', '0900', '1000'))
    const hit = allOf('DAYS_RUN').filter((x: any) => (x.who || []).includes('bane'))
    expect(hit.map((x: any) => [x.di, x.sev])).toEqual([[FRI, 'hard']])
    expect(chipOf(FRI, 'bane')).toBe('RUN')
  })
  // RULES-FIRST FINDING 3.1 (11 Nov 26, [ENGINE-RULES-REVIEW]), fixed by D1993 (11 Nov 26, [RULES-CHECK-FIXES]): "F2 as recommended. The app should flag." — a row with no times counts as a day on the programme for days in a row.
  it('a man on a ground row with no times yet on the fourth day is still on the programme that day — the break-day warning lands', () => {
    VCONF.maxRun = 3
    ;[TUE, WED, THU].forEach(di => ground(di, 'bane', '0900', '1000'))
    ground(FRI, 'bane', '', '')                                        // seated on a row whose times are not typed yet
    expect(allOf('DAYS_RUN').filter((x: any) => (x.who || []).includes('bane')).map((x: any) => x.di)).toEqual([FRI])
  })
  it('D1993, the edges: a duty desk, a sim box and a Common Programme row with no times count too, and the days before carry the dotted run mark; a cancelled one does not; a timeless row in the middle keeps the run going', () => {
    VCONF.maxRun = 3
    ;[TUE, WED, THU].forEach(di => ground(di, 'bane', '0900', '1000'))
    const fri: any = DAYS[FRI]
    fri.dutywaves.push({ label: 'DUTY', rows: [{ role: 'SDO', id: 'bane', str: '', end: '' }] })
    const hits = () => allOf('DAYS_RUN').filter((x: any) => (x.who || []).includes('bane')).map((x: any) => x.di)
    expect(hits(), 'a duty desk with no times').toEqual([FRI])
    validate()
    expect(WARN.trace[THU]?.bane?.run?.di, 'the day before carries the dotted run mark').toBe(FRI)
    fri.dutywaves[0].rows[0].cx = true
    expect(hits(), 'a cancelled desk is no day on the programme').toEqual([])
    fri.dutywaves.splice(0)
    fri.sims.oft.push({ label: 'EP-1', str: '', end: '', p: 'bane', w: '', rmks: '' })
    expect(hits(), 'a sim box with no start').toEqual([FRI])
    fri.sims.oft.splice(0)
    fri.allhands.push({ prog: 'BRIEFING', str: '', end: '', who: ['bane'] })
    expect(hits(), 'a Common Programme row with no times').toEqual([FRI])
    fri.allhands.splice(0)
    ;(DAYS[WED] as any).ground.splice(0); ground(WED, 'bane', '', '')    // the middle day timeless
    ground(FRI, 'bane', '0900', '1000')
    expect(hits(), 'a timeless day in the middle keeps the run: Tue, Wed (timeless), Thu, Fri').toEqual([FRI])
  })
  it('D1993 with D1998 (as built, kept): an AVALON desk with no times — standing by — is still no day on the programme', () => {
    VCONF.maxRun = 3
    ;[TUE, WED, THU].forEach(di => ground(di, 'bane', '0900', '1000'))
    ;(DAYS[FRI] as any).dutywaves.push({ label: 'AVALON', sa: 'avalon', noconf: true, rows: [{ role: 'SXO', id: 'bane', str: '', end: '' }] })
    expect(allOf('DAYS_RUN').filter((x: any) => (x.who || []).includes('bane')), 'standing by does not count').toEqual([])
  })
  it('as built (the control for 3.1): a flying line with no times yet DOES count, so the same day counts for a flyer and not for a ground row', () => {
    VCONF.maxRun = 3
    ;[TUE, WED, THU].forEach(di => ground(di, 'bane', '0900', '1000'))
    add(FRI, wave([], [form({ to: '', ld: '' })]))
    expect(allOf('DAYS_RUN').filter((x: any) => (x.who || []).includes('bane')).map((x: any) => x.di)).toEqual([FRI])
  })
  // UNCLEAR: no ruling says whether standing by (an SC SPARE that does not fly) is a day on the programme for the run.
  it('as built: four days standing SC SPARE (not flying) count as no days at all — the run never breaks', () => {
    VCONF.maxRun = 3
    ;[TUE, WED, THU, FRI].forEach(di => { const sc: any = makeStandalone('sc'); sc.formations[0].aircraft[2].p = 'bane'; add(di, sc) })
    expect(allOf('DAYS_RUN').filter((x: any) => (x.who || []).includes('bane')), 'as built').toEqual([])
  })
})

describe('W34 — the midnight tail: a window past midnight is checked against tomorrow in the same modality (11 Aug 26)', () => {
  it('a 22:00–00:30 sortie: its debrief tail meets a Tuesday 01:00 Meeting input; the long day runs to 02:30; Tuesday\'s rest counts from 02:30', () => {
    add(MON, wave([], [form({ to: '22:00', ld: '00:30' })]))
    inp(TUE, 'bane', 'Meeting', h(1), h(2))
    const mon = warns(MON, 'bane').map((x: any) => x.code)
    expect(mon, 'the tail is judged against tomorrow\'s input').toContain('DEBRIEF')
    validate()
    expect(workSpan(dayEvents(MON, 'bane'))!.e, 'the long day ends past minute 1440').toBe(1440 + h(2, 30))
    INPUTS.splice(0)
    add(TUE, wave(['14:29 IN TIME'], [form({ to: '17:00', ld: '18:00' })]))    // brief 14:40, after the in-time
    expect(warns(TUE, 'bane', 'CREW_REST').length, '02:30 + 12h = 14:30').toBe(1)
    ;(DAYS[TUE] as any).waves[0].intimes = ['14:30 IN TIME']
    expect(warns(TUE, 'bane', 'CREW_REST')).toEqual([])
  })
})

describe('W35 — a sortie with its take-off typed and its landing blank or "TBD" counts no hours and raises no long-day note (D1936)', () => {
  it('blank and TBD landings: no hours, no note; the same sortie with its landing typed makes a 16h day', () => {
    const vl: any = add(TUE, wave([], [form({ to: '06:00', ld: '07:00' })]))
    ground(TUE, 'bane', '1000', '1900')
    expect(warns(TUE, 'bane', 'LONGDAY').length, 'the control: 03:00 → 19:00').toBe(1)
    for (const ld of ['', 'TBD']) {
      vl.formations[0].ld = ld
      expect(warns(TUE, 'bane', 'LONGDAY'), `landing "${ld}": no long-day note`).toEqual([])
      expect(workSpan(dayEvents(TUE, 'bane'))!.s, `landing "${ld}": the sortie counts no hours`).toBe(h(10))
    }
  })
  // D1990 (11 Nov 26, [RULES-CHECK-FIXES]) over the as-built "a TBD landing ends nothing": a "TBD" landing ends the day
  // as a blank one does for tomorrow's crew rest — take-off plus the debrief. D1936 (hours, the long-day note) unchanged.
  it('D1990: a blank landing and a "TBD" landing both end the day for tomorrow\'s crew rest at take-off + debrief', () => {
    const vl: any = add(MON, wave([], [form({ to: '20:00', ld: '' })]))          // 20:00 + 2h → clear 10:00
    add(TUE, wave(['09:00 IN TIME']))
    const blank = warns(TUE, 'bane', 'CREW_REST')
    expect(blank.length, 'blank: the take-off is borrowed as the landing').toBe(1)
    for (const ld of ['TBD', 'tbd', ' TBD ']) {
      vl.formations[0].ld = ld
      const tbd = warns(TUE, 'bane', 'CREW_REST')
      expect(tbd.length, `"${ld}": ends the day as blank does`).toBe(1)
      expect(tbd[0].msg, `"${ld}": the same end, the same words as blank`).toBe(blank[0].msg)
      validate()
      expect(WARN.trace[MON]?.bane?.di, `"${ld}": the dotted mark on Monday points at Tuesday`).toBe(TUE)
    }
    Object.assign((DAYS[TUE] as any).waves[0].formations[0], { to: '13:00', ld: '14:00' })   // brief 10:40
    ;(DAYS[TUE] as any).waves[0].intimes = ['10:00 IN TIME']             // exactly 12h after 22:00: legal
    expect(warns(TUE, 'bane', 'CREW_REST'), 'TBD: the equal-time edge is legal, as for blank').toEqual([])
    vl.formations[0].to = ''                                           // no take-off either: nothing to borrow
    ;(DAYS[TUE] as any).waves[0].intimes = ['09:00 IN TIME']
    expect(warns(TUE, 'bane', 'CREW_REST'), 'TBD with no take-off: no end, as blank with no take-off').toEqual([])
    vl.formations[0].to = '20:00'; vl.formations[0].ld = 'TBD'
    expect(workSpan(dayEvents(MON, 'bane')), 'D1936 unchanged: the TBD sortie still counts no hours').toBeNull()
  })
})

describe('W36 — a long work day is grey wherever the app shows it, never amber (D751)', () => {
  it('the line is a note and the ring at rest is the note ring', () => {
    ground(TUE, 'bane', '0600', '1900')
    const ld = warns(TUE, 'bane', 'LONGDAY')
    expect(ld.map((x: any) => x.sev)).toEqual(['note'])
    expect([sevOf(TUE, 'bane'), chipOf(TUE, 'bane')]).toEqual(['note', 'LD'])
  })
})

describe('W37 — the three crew-rest rings: solid, dashed for a sanctioned late show, dotted on the day that causes tomorrow\'s breach (D94; 6 Aug 26)', () => {
  it('the engine publishes the dash only while rest clears by step, and the trace for the dotted ring', () => {
    add(MON, wave([], [form({ to: '18:30', ld: '19:30' })]))           // clear 09:30
    const tue: any = add(TUE, wave(['09:00 IN TIME'], [form({ to: '10:30', ld: '11:30', aircraft: [{ p: 'bane', w: '', rmks: 'LATE SHOW', opts: {} }] })]))
    validate()
    expect([WARN.sev[TUE].bane, !!WARN.dash[TUE]?.bane, !!WARN.trace[MON]?.bane], 'step 09:30 = clear 09:30: dashed').toEqual(['hard', true, true])
    tue.formations[0].to = '10:29'
    validate()
    expect(!!WARN.dash[TUE]?.bane, 'step 09:29, a minute before rest clears: solid').toBe(false)
  })
})

describe('W38 — every Logic line is correct for whatever the settings are; a check\'s key info said as his crew-rest example says it (D932, D928, D933)', () => {
  it('the crew-rest and long-day lines read their numbers from the settings', () => {
    VCONF.crewRest = 660; VCONF.longDay = 600
    expect(logicCheck('crewrest').line()).toContain('>11h<')
    expect(logicCheck('longday').line()).toContain('>10h<')
    expect(logicCheck('crewrest').line()).toMatch(/For a flying member: at least .* to his earliest in-time/)
  })
  // RULES-FIRST FINDING 3.2 (11 Nov 26, [ENGINE-RULES-REVIEW]): the Logic page's tight-turn line says it fires because "his typed in-time is later", but it fires with nothing typed at all; flip to it() when fixed.
  it.fails('the tight-turn line is true of the case it fires on: nothing typed, the suggested brief clears', () => {
    add(MON, wave([], [form({ to: '18:30', ld: '19:30' })]))
    add(TUE, wave())                                                   // nothing typed
    expect(warns(TUE, 'bane', 'CREW_TIGHT').length).toBe(1)
    expect(logicCheck('crewtight').line(), 'a line that names only a typed in-time is untrue here').not.toMatch(/his typed in-time is later/)
  })
  // RULES-FIRST FINDING 3.3 (11 Nov 26, [ENGINE-RULES-REVIEW]): the crew-rest fold says "An SC SPARE carries no crew rest either way", untrue since a flying SPARE bears it (D1044, D1045); flip to it() when fixed.
  it.fails('the crew-rest fold is true of a flying SC SPARE, which bears crew rest', () => {
    const sc: any = makeStandalone('sc'); add(MON, sc)
    const pm = sc.formations[1]; pm.rl = '12:00'; pm.aircraft[2].p = 'bane'
    add(TUE, wave(['06:30 IN TIME']))
    expect(warns(TUE, 'bane', 'CREW_REST').length, 'the engine: the flying SPARE ended 19:00, rest clears 07:00').toBe(1)
    expect(logicCheck('crewrest').how!().join(' ')).not.toMatch(/An SC SPARE carries no crew rest either way/)
  })
  // RULES-FIRST FINDING 3.4 (11 Nov 26, [ENGINE-RULES-REVIEW]): the crew-rest fold names "his in-time, his B where no in-time is typed" and never the rally, which counts for crew rest since D1032; flip to it() when fixed.
  it.fails('the crew-rest fold is true of a typed R box with no in-time: rest is measured to the rally, not to the B', () => {
    add(MON, wave([], [form({ to: '18:30', ld: '19:30' })]))           // clear 09:30
    add(TUE, wave([], [form({ rl: '09:00' })]))                        // R 09:00, no in-time, suggested B 09:40
    expect(warns(TUE, 'bane', 'CREW_REST')[0].msg, 'the engine measures to the rally').toContain('told to report 09:00')
    expect(logicCheck('crewrest').how!()[0], 'the fold\'s first line').toMatch(/rally/i)
  })
})

describe('W39 — the one work-span measure the long-day note shares with Insights and OIL (D483, D592, D1786)', () => {
  it('case for case, the long day and OIL start a sortie\'s day at the same clock: nothing entered, a later in-time, an evening-before rally, an earlier event; never negative', () => {
    const cases: [string[], any, (() => void) | null, number][] = [
      [[], {}, null, h(9)],
      [['10:30 IN TIME'], {}, null, h(10, 30)],
      [[], { rl: '22:00' }, null, h(22) - 1440],
      [[], {}, () => ground(TUE, 'bane', '0700', '0800'), h(7)],
    ]
    for (const [lines, f, extra, start] of cases) {
      ;(DAYS[TUE] as any).waves = [wave(lines, [form(f)])]; (DAYS[TUE] as any).ground = []
      if (extra) extra()
      validate()
      const ws = workSpan(dayEvents(TUE, 'bane'))!
      const oilStart = Math.min(...dayOilSpans(DAYS[TUE]).bane!.map(s => s[0]))   // OIL: first event to last end (D592 (5))
      expect([ws.s, oilStart], JSON.stringify([lines, f])).toEqual([start, start])
      expect(ws.span).toBeGreaterThan(0)
    }
  })
})
