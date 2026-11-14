/* The rules check's small batch ([RULES-CHECK-FIXES] batch 2, 14 Nov 26 — plan
   docs/superpowers/plans/2026-11-14-rules-check-batch2-plan.md). Parts 1 and 2, each led by the owner's ruling, on a
   small made-up week through the engine's own doors (validate, the Logic page's check names, the warning list).
   Harness: the same as rulesfirst-5-seats-quals.test.ts (every day emptied, the inputs cleared, the book reset, the
   roster restored). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { SCHED } from './publish'
import { VCONF } from './rules'
import { PEOPLE } from './people'
import { validate, WCODE, wlbl } from './validate'
import { lgChecks, lgChkName } from '../ui/logic-html'
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
const warns = (di: number, code?: string | null, id?: string) => validate().all.filter((x: any) => x.di === di
  && (!code || x.code === code) && (!id || (x.who || []).includes(id)))
const chk = (id: string) => lgChecks().flatMap(g => g.items).find(c => c.id === id)!

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720, maxRun: 6, tightTurn: 60 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, dayOK: {}, sign: {} })
})
afterEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
  const p0 = JSON.parse(saved.p); Object.keys(PEOPLE).forEach(k => { if (!(k in p0)) delete (PEOPLE as any)[k] }); Object.assign(PEOPLE, p0)
  hydrateRoles([])
})

describe('part 1 — D2009: the check is "On leave + planned" / "Downchit + planned", one name true on every row', () => {
  it('the Logic page names the two checks so', () => {
    expect(lgChkName(chk('leavefly'))).toBe('On leave + planned')
    expect(lgChkName(chk('dnif'))).toBe('Downchit + planned')
  })
  it('the warning list labels the line with the same name, and the day\'s own words stay as they are (D2009\'s reading)', () => {
    inp(TUE, 'bane', 'LL', { allday: true })
    ground(TUE, 'bane', '09:00', '10:00')
    const w = warns(TUE, 'LEAVE_FLY', 'bane')
    expect(w.length).toBe(1)
    expect(wlbl(WCODE[w[0].code], TUE)).toBe('On leave + planned')
    expect(w[0].msg).toMatch(/but tasked — BRIEFING/)
  })
  it('a downchit on a flight reads the twin name', () => {
    inp(TUE, 'bane', 'ATT C', { allday: true })
    add(TUE, wave([form()]))
    const w = warns(TUE, 'DNIF_FLY', 'bane')
    expect(w.length).toBeGreaterThan(0)
    expect(wlbl(WCODE[w[0].code], TUE)).toBe('Downchit + planned')
  })
})

describe('part 2 — D2010: a crew-rest warning never says "landed" at a take-off time', () => {
  /* Monday's VL takes off 12:00; Tuesday's take-off 04:00 briefs at 01:40, inside the rest that clears at 02:00 */
  const breach = (mondayLd: string) => {
    add(MON, wave([form({ to: '12:00', ld: mondayLd })]))
    add(TUE, wave([form({ to: '04:00', ld: '05:00' })]))
    const w = warns(TUE, 'CREW_REST', 'bane')
    expect(w.length).toBe(1)
    return String(w[0].msg)
  }
  it('a blank landing: "Mon took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00"', () => {
    const msg = breach('')
    expect(msg).toContain('Monday took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00')
    expect(msg).not.toMatch(/landed/)
  })
  it('a "TBD" landing reads the same (D1990)', () => {
    const msg = breach('TBD')
    expect(msg).toContain('Monday took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00')
    expect(msg).not.toMatch(/landed/)
  })
  it('left as it is: a typed landing still says "landed" (D2010 changes only the borrowed take-off)', () => {
    const msg = breach('12:30')
    expect(msg).toContain('Monday landed 12:30, +2h debrief assumed → ended 14:30 → crew rest clear at 02:30')
  })
})

describe('part 2b — D2010\'s reading carried to the debrief and the tight turn: a take-off is never called a landing', () => {
  /* the blind code reads of 15 Nov 26 (the Opus read's F2, Astra's (2)): with no landing typed the line's debrief window
     and its turn are measured from the take-off, so they say so — the check itself is kept */
  it('a blank landing: the debrief line says take-off, not land', () => {
    add(MON, wave([form({ to: '12:00', ld: '' })]))
    ground(MON, 'bane', '12:40', '13:00')
    const w = warns(MON, 'DEBRIEF', 'bane')
    expect(w.length).toBe(1)
    expect(String(w[0].msg)).toContain('BRIEFING sits inside 12:00–14:00 (take-off + 2h, no landing typed)')
    expect(String(w[0].msg)).not.toMatch(/\bland\b/)
  })
  it('a blank landing: the tight turn says take-off, not land', () => {
    add(MON, wave([form({ cs: 'VL', to: '09:00', ld: '' }), form({ cs: 'RU', to: '10:00', ld: '11:00' })]))
    const w = warns(MON, 'TURN', 'bane')
    expect(w.length).toBe(1)
    expect(String(w[0].msg)).toContain('60 min take-off→next T/O, no landing typed')
    expect(String(w[0].msg)).not.toMatch(/\bland\b/)
  })
  it('left as it is: a typed landing still says land, in both', () => {
    add(MON, wave([form({ cs: 'VL', to: '09:00', ld: '09:30' }), form({ cs: 'RU', to: '10:00', ld: '11:00' })]))
    ground(MON, 'bane', '09:40', '10:00')
    expect(String(warns(MON, 'DEBRIEF', 'bane')[0].msg)).toContain('(land + 2h)')
    expect(String(warns(MON, 'TURN', 'bane')[0].msg)).toContain('30 min land→next T/O')
  })
})
