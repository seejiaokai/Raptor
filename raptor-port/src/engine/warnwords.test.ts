/* EVERY WARNING READS ON ITS OWN ([WARN-WORDS-STANDALONE] — owner D2045, D2048, D2058, D2068–D2071, 15–16 Nov 26).
   The approved words are the proposal's, docs/superpowers/specs/2026-11-15-warn-words-standalone.md, as its §3a–§3g
   overrule its earlier sections: "Conflict:" (D2070), "Tight turning" kept (D2068), the step or dekit end of a flight on a
   conflict line (D2058), "needs 12h" on crew rest (D2069). The double-turn line is left exactly as it is (D2050).
   Each family is staged on a small made-up week through the engine's own door (validate), and each line is asserted
   whole — a fragment would let a word drift. The "left as it is" halves were pinned first, before the words changed
   (the bug-check order §8 point 7). Harness: rulescheck-batch2.test.ts's (every day emptied, inputs cleared, the book
   reset, the roster restored). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { SCHED } from './publish'
import { VCONF } from './rules'
import { PEOPLE } from './people'
import { makeStandalone } from './waves'
import { validate, WCODE, crowdClashes } from './validate'
import { hideKey } from './warnhide'
import { hydrateRoles } from '../state/mission-roles'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF }, p: JSON.stringify(PEOPLE) }
const MON = 0, TUE = 1
const DT = ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19']
const day = (di: number): any => DAYS[di]
const add = (di: number, w: any) => { day(di).waves.push(w); return day(di).waves.length - 1 }
const ac = (p = '', w = '', rmks = '') => ({ p, w, rmks, area: '', opts: {} })
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [ac('bane')], ...o })
const wave = (forms: any[] = [form()], o: any = {}) => ({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: forms, ...o })
const ground = (di: number, who: string, str: string, end: string, prog = 'BRIEFING') => day(di).ground.push({ prog, str, end, who, more: [] })
const inp = (di: number, person: string, type: string, more: any = {}) => INPUTS.push({ person, date: DT[di], allday: false, type, remarks: '', mod: '', ...more } as any)
const all = () => validate().all
const warns = (di: number, code?: string | null, id?: string) => all().filter((x: any) => x.di === di
  && (!code || x.code === code) && (!id || (x.who || []).includes(id)))
const msgs = (di: number, code: string, id?: string) => warns(di, code, id).map((x: any) => String(x.msg))
/* an SC wave with its AM shift's first MAIN row crewed — `fly` types its R so the line flies (D1044) */
const scAm = (di: number, who = 'bane', o: any = {}) => {
  const sc: any = makeStandalone('sc'); const f = sc.formations[0]
  f.aircraft[0].p = who; Object.assign(f, o)
  return add(di, sc)
}

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720, maxRun: 6, tightTurn: 120 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, dayOK: {}, sign: {} })
})
afterEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
  const p0 = JSON.parse(saved.p); Object.keys(PEOPLE).forEach(k => { if (!(k in p0)) delete (PEOPLE as any)[k] }); Object.assign(PEOPLE, p0)
  hydrateRoles([])
})

/* ---- LEFT AS IT IS — pinned before the words changed (§8 point 7) ---- */
describe('left exactly as it is today', () => {
  it('D2050: the double-turn line keeps its one-line count of everyone double turning', () => {
    add(TUE, wave([form({ to: '09:00', ld: '10:00' }), form({ cs: 'RU', msn: 'AD', to: '14:00', ld: '15:00', aircraft: [ac('bane')] })]))
    expect(msgs(TUE, 'DT_SUM')).toEqual(['1 person is double turning: Ranger'])
  })
  it('D2060: two flights back to back, step and dekit overlapping but not their air times, stay the amber tight turn — never a conflict', () => {
    add(TUE, wave([form({ to: '12:00', ld: '13:00' }), form({ cs: 'RU', msn: 'AD', to: '13:30', ld: '14:30', aircraft: [ac('bane')] })]))
    expect(warns(TUE, 'TURN', 'bane').length).toBe(1)
    expect(warns(TUE, 'TURN', 'bane')[0].sev).toBe('adv')
    expect(warns(TUE, 'DOUBLE_BOOK', 'bane')).toEqual([])
  })
  it('D2061–D2065: a standby line that flies is compared on its START to END, no step or dekit added', () => {
    scAm(TUE, 'bane', { rl: '06:30' })          // R typed: the SC AM line flies (D1044)
    ground(TUE, 'bane', '13:10', '13:40', 'MEETING')   // inside where a dekit would sit, outside START→END
    ground(TUE, 'bane', '06:00', '06:30', 'SODB')      // inside where a step would sit
    expect(warns(TUE, 'DOUBLE_BOOK', 'bane')).toEqual([])
  })
  it('D2003/D2004: the two "Publish this day again…" lines keep his words', () => {
    // read off the engine's source table of codes: their words are his and are not reworded (proposal §3, "Left whole")
    expect(WCODE.OIL_STALE_DAY).toBe('Became a holiday after publishing — republish for its OIL')
  })
})

/* ---- THE NEW WORDS ---- */
describe('the checks\' short names follow the new labels (proposal §3b, D2070: "Conflict" kept)', () => {
  it('each name', () => {
    expect(WCODE.DOUBLE_BOOK).toBe('Conflict')
    expect(WCODE.INPUT_FLY).toBe('Conflict with a request')
    expect(WCODE.NO_BRIEF).toBe('Misses flight brief')
    expect(WCODE.DEBRIEF).toBe('Misses flight debrief')
    // D2068: "Tight turning" keeps its name, never "Tight crew rest"; the table's "— crew rest" tail goes as the
    // other names lose theirs (§3b's table, as §3g reads it)
    expect(WCODE.CREW_TIGHT).toBe('Tight turning')
    expect(WCODE.SIM_BRIEF).toBe('Misses sim brief')
    expect(WCODE.SIM_DEBRIEF).toBe('Misses sim debrief')
    expect(WCODE.LONGDAY).toBe('Long day')
    expect(WCODE.DAYS_RUN).toBe('Days in a row')
    expect(WCODE.QUAL).toBe('Wrong seat')
    expect(WCODE.ILLEGAL_CREW).toBe('Crew not authorised')
    expect(WCODE.CO_APPROVAL).toBe('CO approval needed')
    expect(WCODE.OCU_NO_IP).toBe('OCU with no IP')
    expect(WCODE.NO_IR).toBe('IRT with no IR examiner')
    expect(WCODE.SHIFT_SOFT).toBe('Overlaps standby')
    expect(WCODE.SC_INTIME).toBe('Busy before a standby shift')
    // left as they were (not in the proposal's table)
    expect(WCODE.TURN).toBe('Tight turn')
    expect(WCODE.DNIF_FLY).toBe('Downchit + planned')
    expect(WCODE.LEAVE_FLY).toBe('On leave + planned')
    expect(WCODE.DT_SUM).toBe('Double turning')
  })
})

describe('Ranger\'s Friday — conflicts, the tight turn and the brief (proposal §2, §3b, §3c)', () => {
  const friday = () => {
    add(TUE, wave([form({ to: '12:00', ld: '13:00' }), form({ cs: 'RU', msn: 'AD', to: '13:00', ld: '14:00', aircraft: [ac('bane')] })]))
    ground(TUE, 'bane', '12:40', '13:00')
  }
  it('a conflict in the flight itself shows its T/O and landing; one in the step shows the step and T/O (D2058)', () => {
    friday()
    expect(msgs(TUE, 'DOUBLE_BOOK', 'bane').sort()).toEqual([
      'Conflict: RU AD (step 12:00, T/O 13:00) & BRIEFING 12:40–13:00',
      'Conflict: VL BFM (T/O 12:00, landing 13:00) & BRIEFING 12:40–13:00',
    ])
  })
  it('the tight turn names both times', () => {
    friday()
    expect(msgs(TUE, 'TURN', 'bane')).toEqual(['Tight turn: VL BFM → RU AD, 0 min (needs 120). VL BFM landing 13:00, RU AD T/O 13:00'])
  })
  it('the missed brief carries the window and the item\'s own times', () => {
    friday()
    expect(msgs(TUE, 'NO_BRIEF', 'bane')).toEqual(['Misses RU AD brief 10:40–13:00: BRIEFING 12:40–13:00'])
  })
  it('a conflict in the dekit shows the landing and the dekit (D2058)', () => {
    add(TUE, wave([form({ to: '12:00', ld: '13:00' })]))
    ground(TUE, 'bane', '13:10', '14:00', 'MEETING')
    expect(msgs(TUE, 'DOUBLE_BOOK', 'bane')).toEqual(['Conflict: VL BFM (landing 13:00, dekit to 13:30) & MEETING 13:10–14:00'])
  })
  it('an item spanning the step and the flight is shown with the step, where it starts (§3c, settled at the build)', () => {
    add(TUE, wave([form({ to: '12:00', ld: '13:00' })]))
    ground(TUE, 'bane', '11:30', '12:30', 'MEETING')
    expect(msgs(TUE, 'DOUBLE_BOOK', 'bane')).toEqual(['Conflict: VL BFM (step 11:00, T/O 12:00) & MEETING 11:30–12:30'])
  })
  it('two flights airborne at once show T/O and landing of both (§3c, settled at the build)', () => {
    add(TUE, wave([form({ to: '12:00', ld: '13:00' }), form({ cs: 'RU', msn: 'AD', to: '12:30', ld: '13:30', aircraft: [ac('bane')] })]))
    expect(msgs(TUE, 'DOUBLE_BOOK', 'bane')).toEqual(['Conflict: VL BFM (T/O 12:00, landing 13:00) & RU AD (T/O 12:30, landing 13:30)'])
  })
  it('two seats on one line, and two items both called the same', () => {
    add(TUE, wave([form({ aircraft: [ac('bane', 'bane')] })]))
    expect(msgs(TUE, 'DOUBLE_BOOK', 'bane')).toEqual(['Conflict: in two seats on VL BFM (T/O 12:00) at once'])
  })
  it('two items both called SODB', () => {
    ground(TUE, 'bane', '07:45', '08:00', 'SODB'); ground(TUE, 'bane', '07:50', '08:10', 'SODB')
    expect(msgs(TUE, 'DOUBLE_BOOK', 'bane')).toEqual(['Conflict: two items both called SODB, 07:45–08:00 & 07:50–08:10'])
  })
  it('a conflict\'s hide still follows its two items, not its times (D2001)', () => {
    add(TUE, wave([form({ to: '12:00', ld: '13:00' })]))
    ground(TUE, 'bane', '12:10', '12:40', 'MEETING')
    const k1 = hideKey(warns(TUE, 'DOUBLE_BOOK', 'bane')[0])
    day(TUE).ground[0].str = '12:20'
    const w2 = warns(TUE, 'DOUBLE_BOOK', 'bane')[0]
    expect(w2.msg).toBe('Conflict: VL BFM (T/O 12:00, landing 13:00) & MEETING 12:20–12:40')
    expect(hideKey(w2)).toBe(k1)
  })
})

describe('a request against a planned item (proposal §3, §3e)', () => {
  it('a request in the flight: Conflict, with the reason', () => {
    add(TUE, wave([form({ to: '12:00', ld: '13:30' })]))
    inp(TUE, 'bane', 'Appointment', { s: 750, e: 810, remarks: 'dental' })
    expect(msgs(TUE, 'INPUT_FLY', 'bane')).toEqual(['Conflict: VL BFM (T/O 12:00, landing 13:30) & Appointment 12:30–13:30. Reason: dental'])
  })
  it('a request in the dekit shows the landing and the dekit (redraw 4)', () => {
    add(TUE, wave([form({ to: '12:00', ld: '13:30' })]))
    inp(TUE, 'bane', 'Appointment', { s: 820, e: 870, remarks: 'dental' })
    expect(msgs(TUE, 'INPUT_FLY', 'bane')).toEqual(['Conflict: VL BFM (landing 13:30, dekit to 14:00) & Appointment 13:40–14:30. Reason: dental'])
    expect(msgs(TUE, 'DEBRIEF', 'bane')).toEqual(['Misses VL BFM debrief 13:30–15:30: Appointment 13:40–14:30'])
  })
  it('a request against a ground row', () => {
    ground(TUE, 'bane', '10:00', '11:30')
    inp(TUE, 'bane', 'Appointment', { s: 630, e: 690, remarks: 'dental' })
    expect(msgs(TUE, 'INPUT_FLY', 'bane')).toEqual(['Conflict: BRIEFING 10:00–11:30 & Appointment 10:30–11:30. Reason: dental'])
  })
  it('on leave and downchit, against a flight and a ground row', () => {
    add(TUE, wave([form()]))
    inp(TUE, 'bane', 'LL', { allday: true, remarks: 'family' })
    expect(msgs(TUE, 'LEAVE_FLY', 'bane')).toEqual(['On leave + planned: VL BFM (T/O 12:00). Reason: family'])
  })
  it('a downchit against a ground row', () => {
    ground(TUE, 'bane', '09:00', '10:00', 'LECTURE')
    inp(TUE, 'bane', 'ATT C', { allday: true, remarks: 'flu' })
    expect(msgs(TUE, 'DNIF_FLY', 'bane')).toEqual(['Downchit + planned: LECTURE 09:00–10:00. Reason: flu'])
  })
  it('a row with no times yet', () => {
    day(TUE).ground.push({ prog: '', str: '', end: '', who: 'bane', more: [] })
    inp(TUE, 'bane', 'LL', { allday: true })
    expect(msgs(TUE, 'LEAVE_FLY', 'bane')).toEqual(['On leave + planned: this ground row (no times yet)'])
  })
})

describe('standby (proposal §3a)', () => {
  it('an SC MAIN shift and a ground item: Overlaps standby, the other item first', () => {
    scAm(TUE)
    ground(TUE, 'bane', '09:00', '10:00', 'LECTURE')
    expect(msgs(TUE, 'SHIFT_SOFT', 'bane')).toEqual(['Overlaps standby: LECTURE 09:00–10:00 & SC AM 07:00–13:00'])
  })
  it('busy before the shift: between his in-time and the start', () => {
    scAm(TUE, 'bane', { br: '06:00' })
    ground(TUE, 'bane', '06:30', '07:00', 'MEETING')
    expect(msgs(TUE, 'SC_INTIME', 'bane')).toEqual(['Busy before SC AM: MEETING 06:30–07:00 is between his 06:00 in-time and the 07:00 start'])
  })
  it('an SC SPARE and an SC MAIN in the same hours (§3e: both places named the same way)', () => {
    const gi = scAm(TUE, 'bane')
    const f = day(TUE).waves[gi].formations[0]
    const spare = f.aircraft.findIndex((a: any) => a.spare); f.aircraft[spare].p = 'bane'
    expect(msgs(TUE, 'DOUBLE_BOOK', 'bane')).toEqual(['Conflict: SC AM SPARE 07:00–13:00 & SC AM MAIN 07:00–13:00'])
  })
})

describe('crew rest and the tight turning note (proposal §3, §3a; D2069)', () => {
  it('a breach by the report', () => {
    add(MON, wave([form({ to: '20:00', ld: '21:30' })]))
    add(TUE, wave([form({ to: '11:00', ld: '12:00' })]))
    expect(msgs(TUE, 'CREW_REST', 'bane')).toEqual(['Crew rest: Monday landed 21:30 + 2h debrief (assumed) → ended 23:30 → clear 11:30. Report 08:40: 9h10 rest, needs 12h.'])
  })
  it('a breach by an earlier item the same day', () => {
    add(MON, wave([form({ to: '20:00', ld: '21:30' })]))
    add(TUE, wave([form({ to: '11:00', ld: '12:00' })]))
    ground(TUE, 'bane', '07:00', '07:30', 'MEETING')
    expect(msgs(TUE, 'CREW_REST', 'bane')).toEqual(['Crew rest: Monday landed 21:30 + 2h debrief (assumed) → ended 23:30 → clear 11:30. Day starts 07:00 (MEETING), before report 08:40: 7h30 rest, needs 12h.'])
  })
  it('a breach by a shift start, the day before ended on a duty', () => {
    ground(MON, 'bane', '08:00', '20:00', 'DUTY')
    scAm(TUE)
    expect(msgs(TUE, 'CREW_REST', 'bane')).toEqual(['Crew rest: Monday duty ended 20:00 → clear 08:00. SC AM starts 07:00: 11h rest, needs 12h.'])
  })
  it('a sanctioned late show', () => {
    add(MON, wave([form({ to: '20:00', ld: '21:30' })]))
    add(TUE, wave([form({ to: '13:00', ld: '14:00', aircraft: [ac('bane', '', 'late show')] })]))
    expect(msgs(TUE, 'CREW_REST', 'bane')).toEqual(['Crew rest: Monday landed 21:30 + 2h debrief (assumed) → ended 23:30 → clear 11:30. Report 10:40: 11h10 rest, needs 12h. Late show: still makes the 12:00 step.'])
  })
  it('a late show that does not help', () => {
    add(MON, wave([form({ to: '22:00', ld: '23:30' })]))
    add(TUE, wave([form({ to: '13:00', ld: '14:00', aircraft: [ac('bane', '', 'late show')] })]))
    expect(msgs(TUE, 'CREW_REST', 'bane')).toEqual(['Crew rest: Monday landed 23:30 + 2h debrief (assumed) → ended 01:30 → clear 13:30. Report 10:40: 9h10 rest, needs 12h. Late show doesn\'t help: the 12:00 step is before rest clears.'])
  })
  it('tight turning: the usual report is before rest clears', () => {
    add(MON, wave([form({ to: '18:00', ld: '19:30' })]))
    add(TUE, wave([form({ to: '12:00', ld: '13:00', br: '10:00' })]))
    expect(msgs(TUE, 'CREW_TIGHT', 'bane')).toEqual(['Tight turning: the usual report (T/O 12:00 − 3h = 09:00) is before clear 09:30. Monday landed 19:30 + 2h debrief (assumed) → ended 21:30 → clear 09:30.'])
  })
})

describe('the long day and days in a row', () => {
  it('a long day names its limit and the debrief it assumes', () => {
    ground(TUE, 'bane', '06:00', '07:00', 'SODB')
    add(TUE, wave([form({ to: '13:00', ld: '17:20' })]))
    expect(msgs(TUE, 'LONGDAY', 'bane')).toEqual(['Long day: 13h20 (limit 12h), 06:00 → 19:20 (last landing 17:20 + 2h debrief assumed)'])
  })
  it('days in a row', () => {
    for (let di = 0; di < 7; di++) ground(di, 'bane', '09:00', '10:00', 'SODB')
    expect(msgs(6, 'DAYS_RUN', 'bane')).toEqual(['Days in a row: 7 (limit 6). A break day is due.'])
  })
})

describe('who may fly with whom, and in which seat (proposal §3, §3a)', () => {
  it('crew solo, and the OCU with no IP', () => {
    add(TUE, wave([form({ aircraft: [ac('bapster', 'nick')] })]))
    expect(msgs(TUE, 'CREW_SOLO')).toEqual(['Crew solo: OCU pilot Wildcard & OCU WSO Tally on VL BFM (T/O 12:00). Only allowed under the Basic Course Syllabus.'])
    expect(msgs(TUE, 'OCU_NO_IP')).toEqual(['OCU with no IP: VL BFM (T/O 12:00)'])
  })
  it('a crew not authorised', () => {
    add(TUE, wave([form({ aircraft: [ac('bapster', 'rocky')] })]))
    expect(msgs(TUE, 'ILLEGAL_CREW')).toEqual(['Crew not authorised: OCU pilot Wildcard & CAT C WSO Hex on VL BFM (T/O 12:00). An OCU needs an instructor in the other seat.'])
  })
  it('CO approval', () => {
    add(TUE, wave([form({ aircraft: [ac('fantom', 'rocky')] })]))
    expect(msgs(TUE, 'CO_APPROVAL')).toEqual(['CO approval needed: CAT D pilot Diesel & CAT C WSO Hex on VL BFM (T/O 12:00)'])
  })
  it('an incentive passenger, and ground crew in the front seat', () => {
    add(TUE, wave([form({ aircraft: [ac('bane', 'torque')] }), form({ cs: 'RU', msn: 'AD', to: '15:00', ld: '16:00', aircraft: [ac('spanner')] })]))
    expect(msgs(TUE, 'PAX_CREW')).toEqual(['Approval needed: incentive passenger in the rear seat of VL BFM (T/O 12:00)'])
    expect(msgs(TUE, 'QUAL', 'spanner')).toEqual(['Wrong seat: ground crew in the front seat of RU AD (T/O 15:00)'])
  })
  it('a WSO in the front seat', () => {
    add(TUE, wave([form({ aircraft: [ac('rocky')] })]))
    expect(msgs(TUE, 'QUAL', 'rocky')).toEqual(['Wrong seat: a WSO in the front seat of VL BFM (T/O 12:00)'])
  })
  it('an IRT with no IR examiner', () => {
    add(TUE, wave([form({ msn: 'IRT', aircraft: [ac('bane', 'rocky')] })]))
    expect(msgs(TUE, 'NO_IR')).toEqual(['IRT with no IR examiner: VL IRT (T/O 12:00)'])
  })
})

describe('a line\'s own times (proposal §3, the redraw\'s whole lines)', () => {
  it('a flight that takes off and lands at the same time', () => {
    add(TUE, wave([form({ to: '12:00', ld: '12:00' })]))
    expect(msgs(TUE, 'FLT_NO_LEN')).toEqual(['Times look wrong: VL T/O and landing are both 12:00. The day still earns OIL from the report and debrief.'])
  })
})

describe('the ALL AVAIL window says the list\'s own words, with the item\'s times (crowdClashes)', () => {
  it('an event inside a man\'s debrief', () => {
    add(TUE, wave([form({ to: '12:00', ld: '15:00' })]))
    validate()
    expect(crowdClashes(TUE, 'bane', 920, 960, 'OPS BRIEF').map(x => x.msg)).toEqual(['Misses VL BFM debrief 15:00–17:00: OPS BRIEF 15:20–16:00'])
  })
})

/* The seed week's own lines, listed in full: the parity test excises the words on both sides (the original's are the
   old ones), so this is the positive half — every line the demo week shows, as the scheduler reads it. */
describe('the seed week, every line (the parity test\'s positive half)', () => {
  it('reads as approved', () => {
    DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
    Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
    expect(all().map((x: any) => `${x.di} ${x.code} | ${x.msg}`)).toEqual([
      '0 DOUBLE_BOOK | Conflict: OPS SHARING + NAV SYS BRIEF 17:55–18:55 & VL BFM (step 18:45, T/O 19:45)',
      '0 DOUBLE_BOOK | Conflict: VL BFM (step 11:40, T/O 12:40) & Sim EP-4 12:00–13:30',
      '0 DOUBLE_BOOK | Conflict: RU BFM (step 12:40, T/O 13:40) & STANDARDISATION MEETING 13:30–14:30',
      '0 DNIF_FLY | Downchit + planned: RU BFM (T/O 13:40). Reason: Medical leave 13 Jul',
      '0 INPUT_FLY | Conflict: Sim BOX 11:30–12:30 & Attach (all day). Reason: Keen for any wave',
      '0 DNIF_FLY | Downchit + planned: Sim EP-6N 17:00–18:30. Reason: Medically down till 17 Jul',
      '0 NO_BRIEF | Misses VL BFM brief 17:25–19:45: OPS SHARING + NAV SYS BRIEF 17:55–18:55',
      '0 NO_BRIEF | Misses VL BFM brief 10:20–12:40: Sim EP-4 12:00–13:30',
      '0 NO_BRIEF | Misses RU BFM brief 11:20–13:40: STANDARDISATION MEETING 13:30–14:30',
      '0 SIM_BRIEF | Misses OFT EP-4 brief 11:30–12:00: VL BFM (step 11:40, T/O 12:40)',
      '0 SIM_DEBRIEF | Misses OFT EP-4 debrief 13:30–14:00: VL BFM (T/O 12:40, landing 14:05)',
      '0 DT_SUM | 4 people are double turning: Saber, Echo, Piston, Relay',
      '0 LONGDAY | Long day: 15h10 (limit 12h), 08:00 → 23:10 (last landing 21:10 + 2h debrief assumed)',
      '0 LONGDAY | Long day: 13h30 (limit 12h), 09:40 → 23:10 (last landing 21:10 + 2h debrief assumed)',
      '0 LONGDAY | Long day: 12h05 (limit 12h), 10:40 → 22:45 (last landing 20:45 + 2h debrief assumed)',
      '0 LONGDAY | Long day: 12h05 (limit 12h), 10:40 → 22:45 (last landing 20:45 + 2h debrief assumed)',
      '0 CREW_SOLO | Crew solo: OCU pilot Wildcard & OCU WSO Tally on VL BFM (T/O 19:45). Only allowed under the Basic Course Syllabus.',
      '1 INPUT_FLY | Conflict: VL SAT (step 13:40, T/O 14:40) & Appointment 14:00–16:00. Reason: Dental appt',
      '1 NO_BRIEF | Misses VL SAT brief 12:20–14:40: Appointment 14:00–16:00',
      '1 LONGDAY | Long day: 13h05 (limit 12h), 05:00 → 18:05 (last landing 16:05 + 2h debrief assumed)',
      '1 CREW_REST | Crew rest: Monday landed 20:45 + 2h debrief (assumed) → ended 22:45 → clear 10:45. Report 06:00: 7h15 rest, needs 12h.',
      '2 TURN | Tight turn: VL ACM → VL BFM, 60 min (needs 120). VL ACM landing 12:00, VL BFM T/O 13:00',
      '2 TURN | Tight turn: VL ACM → VL BFM, 60 min (needs 120). VL ACM landing 12:00, VL BFM T/O 13:00',
      '2 INPUT_FLY | Conflict: RU BFM (T/O 13:00, landing 14:25) & OD (all day). Reason: Overseas duty — exercise, off island',
      '2 DT_SUM | 2 people are double turning: Trident, Relay',
      '2 CO_APPROVAL | CO approval needed: CAT D pilot Kraken & CAT D WSO Otter on RU ACM (T/O 10:35)',
      '2 CO_APPROVAL | CO approval needed: CAT C pilot Nomad & CAT D WSO Pixel on RU BFM (T/O 13:00)',
      '3 DOUBLE_BOOK | Conflict: HQ ENGAGEMENT 08:45–16:30 & RU AD (T/O 12:45, landing 14:10)',
      '3 INPUT_FLY | Conflict: RU BFM (T/O 16:45, landing 18:10) & Appointment 17:00–18:30. Reason: Medical / PHA',
      '3 NO_BRIEF | Misses RU AD brief 10:25–12:45: HQ ENGAGEMENT 08:45–16:30',
      '3 DEBRIEF | Misses RU AD debrief 14:10–16:10: HQ ENGAGEMENT 08:45–16:30',
      '3 DEBRIEF | Misses RU BFM debrief 18:10–20:10: Appointment 17:00–18:30',
      '3 ILLEGAL_CREW | Crew not authorised: OCU pilot Wildcard & CAT D WSO Pixel on RU AD (T/O 12:45). An OCU needs an instructor in the other seat.',
    ])
  })
})

/* A time range never breaks across lines (the proposal's §3b build note): every place that draws a warning's sentence
   prints it through escMsg, which wraps each "HH:MM–HH:MM" in a no-wrap span, escaping first so that span is the only
   markup. The phone measure is the last block of e2e/warnhide.spec.ts. */
describe('a time range is kept on one line (escMsg)', () => {
  it('wraps every range, escapes the rest, leaves a lone time alone', async () => {
    const { escMsg } = await import('../state/view')
    expect(escMsg('Conflict: OFT 1 10:00–11:30 & <b> 12:00')).toBe(
      'Conflict: OFT 1 <span class="tr-nw">10:00–11:30</span> &amp; &lt;b&gt; 12:00')
    expect(escMsg('A 07:00–13:00 B 19:00–07:00')).toBe(
      'A <span class="tr-nw">07:00–13:00</span> B <span class="tr-nw">19:00–07:00</span>')
  })
})
