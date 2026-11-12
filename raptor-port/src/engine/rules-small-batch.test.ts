/* [RULES-CHECK-FIXES]'s SMALL BATCH (13 Nov 26) — two of his four rulings of that day, through the engine's own doors
   (validate, the warning list's names, the Logic page's list, the crew picker's question).
     · D2009 — the Logic page's check "On leave + flying" is named "On leave + planned", its twin "Downchit + flying"
       "Downchit + planned": one name, true on every row, since a row such as a briefing is not a flight. The day's own
       warning ("On leave but tasked — BRIEFING") stays as it is.
     · D2010 — where a day's last flight has no landing typed (blank, or "TBD" — D1990), the crew-rest warning reads
       "Mon took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00", never
       "landed" at the take-off time. A landing that IS typed — the same minute as the take-off included (D49) — still
       says "landed".
   The "left as it is" halves are pinned beside the changed ones. Harness: rulesfirst-3-crew-rest.test.ts's. The other
   two rulings: src/ui/logic.test.tsx (D2015, the Logic page's note) and src/leavewar/oil-fullday-published.test.ts
   (D2014, a published day's OIL and "Full day of OIL"). Evidence: docs/handpass/2026-11-13-rules-check-small-batch.md. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { SCHED } from './publish'
import { VCONF } from './rules'
import { validate, WCODE, wlbl, restIfPlaced } from './validate'
import { lgChecks, lgChkName } from '../ui/logic-html'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF } }
const h = (hh: number, mm = 0) => hh * 60 + mm
const MON = 0, TUE = 1
const DT = ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19']
const jet = (p: string) => ({ p, w: '', rmks: '', opts: {} })
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [jet('bane')], ...o })
const wave = (lines: string[] = [], forms: any[] = [form()]) => ({ label: 'WAVE 1', intimes: lines, formations: forms })
const add = (di: number, w: any) => { (DAYS[di] as any).waves.push(w); return w }
const ground = (di: number, who: string, str: string, end: string, prog = 'BRIEFING') => (DAYS[di] as any).ground.push({ prog, str, end, who })
const inp = (di: number, person: string, type: string, s: number, e: number) => INPUTS.push({ person, date: DT[di], allday: false, s, e, type, remarks: '', mod: '' } as any)
const warns = (di: number, id: string | null, code?: string) => validate().all.filter((x: any) => x.di === di
  && (id == null || (x.who || []).includes(id)) && (!code || x.code === code))
const restMsg = (di: number, id = 'bane') => { const w = warns(di, id, 'CREW_REST'); expect(w.length, 'one crew-rest warning').toBe(1); return String(w[0].msg) }
const logicName = (id: string) => lgChkName(lgChecks().flatMap(g => g.items).find(c => c.id === id)!)

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720, maxRun: 6, tightTurn: 60 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, dayOK: {}, sign: {} })
})
afterEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
})

describe('D2009 — the two checks are named for what they catch: a man on leave or down who is PLANNED, not only flown', () => {
  it('the Logic page lists "On leave + planned" and "Downchit + planned"; the old names are gone', () => {
    expect(logicName('leavefly')).toBe('On leave + planned')
    expect(logicName('dnif')).toBe('Downchit + planned')
    const all = lgChecks().flatMap(g => g.items).map(lgChkName).join(' | ')
    expect(all).not.toMatch(/\+ flying/)
  })
  it('the warning list\'s bold label is the same one name (the Logic page reads it from there); the day\'s own words stay', () => {
    inp(TUE, 'bane', 'LL', h(8), h(17))
    ground(TUE, 'bane', '0900', '1000')                          // a BRIEFING row — not a flight
    const lv = warns(TUE, 'bane', 'LEAVE_FLY')
    expect(lv.length).toBe(1)
    expect(wlbl(WCODE[lv[0].code], TUE), 'the bold label, as the warning list prints it').toBe('On leave + planned')
    expect(lv[0].msg, 'the day\'s own warning is left as it is').toBe('On leave but tasked — BRIEFING')
    INPUTS.splice(0); inp(TUE, 'bane', 'HL', h(8), h(17))
    const dn = warns(TUE, 'bane', 'DNIF_FLY')
    expect(dn.length).toBe(1)
    expect(wlbl(WCODE[dn[0].code], TUE)).toBe('Downchit + planned')
    expect(dn[0].msg).toBe('Downchit but tasked — BRIEFING')
  })
  it('on a flying line the day still says "planned to fly" — only the check\'s name changed', () => {
    inp(TUE, 'bane', 'LL', h(8), h(17))
    add(TUE, wave())
    const lv = warns(TUE, 'bane', 'LEAVE_FLY')
    expect(lv.length).toBe(1)
    expect(lv[0].msg).toMatch(/^On leave but planned to fly /)
  })
  it('the third check of the group keeps its name', () => {
    expect(logicName('inputfly')).toBe(wlbl(WCODE.INPUT_FLY))
    expect(WCODE.INPUT_FLY).toBe('Personal input clash')
  })
})

describe('D2010 — a last flight with no landing typed is said as a take-off, never as a landing', () => {
  /* Monday's VL, take-off 12:00; Tuesday he reports at 01:00 — short of the 02:00 clearance whatever Monday's words */
  const monday = (ld: string, to = '12:00') => add(MON, wave([], [form({ to, ld })]))
  const tuesday = () => add(TUE, wave(['01:00 IN TIME'], [form({ to: '04:00', ld: '05:00' })]))

  it('a blank landing: "Monday took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00"', () => {
    monday(''); tuesday()
    const m = restMsg(TUE)
    expect(m).toContain('Monday took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00')
    expect(m).not.toContain('landed')
  })
  it('a "TBD" landing reads the same (D1990)', () => {
    monday('TBD'); tuesday()
    const m = restMsg(TUE)
    expect(m).toContain('Monday took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00')
    expect(m).not.toContain('landed')
  })
  it('other words in the landing box ("late", "?") read the same — anything not a clock time is not a landing', () => {
    for (const ld of ['late', '?', 'tbd']) {
      DAYS.forEach((d: any) => { d.waves = [] })
      monday(ld); tuesday()
      expect(restMsg(TUE), ld).toContain('Monday took off 12:00 with no landing typed')
    }
  })
  it('LEFT AS IT IS: a typed landing still says "landed" — 13:00, and the same minute as the take-off (D49)', () => {
    monday('13:00'); tuesday()
    expect(restMsg(TUE)).toContain('Monday landed 13:00, +2h debrief assumed → ended 15:00 → crew rest clear at 03:00')
    DAYS.forEach((d: any) => { d.waves = [] })
    monday('12:00'); tuesday()
    const m = restMsg(TUE)
    expect(m, 'a typed landing equal to the take-off IS typed').toContain('Monday landed 12:00, +2h debrief assumed → ended 14:00')
    expect(m).not.toContain('no landing typed')
  })
  it('an overnight take-off with no landing: the take-off time, the debrief past midnight', () => {
    monday('', '23:30')
    add(TUE, wave(['11:00 IN TIME'], [form({ to: '13:00', ld: '14:00' })]))   // clear at 13:30 — 11:00 is short
    expect(restMsg(TUE)).toContain('Monday took off 23:30 with no landing typed, +2h debrief assumed → ended 01:30 → crew rest clear at 13:30')
  })
  it('the LAST end decides: a later flight with a typed landing says "landed"; a later one with none says "took off"', () => {
    add(MON, wave([], [form({ to: '12:00', ld: '' }), form({ cs: 'VK', to: '13:00', ld: '15:00' })]))
    tuesday()
    expect(restMsg(TUE)).toContain('Monday landed 15:00, +2h debrief assumed → ended 17:00')
    DAYS.forEach((d: any) => { d.waves = [] })
    add(MON, wave([], [form({ to: '08:00', ld: '09:00' }), form({ cs: 'VK', to: '12:00', ld: '' })]))
    tuesday()
    expect(restMsg(TUE)).toContain('Monday took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00')
  })
  it('LEFT AS IT IS: a ground row that ends the day after the flight says "ended", with no landing at all', () => {
    monday('')
    ground(MON, 'bane', '1500', '2000')
    add(TUE, wave(['07:00 IN TIME'], [form({ to: '10:00', ld: '11:00' })]))
    const m = restMsg(TUE)
    expect(m).toContain('Monday ended 20:00 → crew rest clear at 08:00')
    expect(m).not.toContain('landed'); expect(m).not.toContain('took off')
  })
  it('the debrief named is the setting\'s own: 1h30 → "+1h30 debrief assumed"', () => {
    VCONF.debrief = 90
    monday(''); tuesday()
    expect(restMsg(TUE)).toContain('Monday took off 12:00 with no landing typed, +1h30 debrief assumed → ended 13:30')
  })
  it('the crew list\'s question before a drop says the same words as the day after it', () => {
    monday('')
    add(TUE, wave(['01:00 IN TIME'], [form({ to: '04:00', ld: '05:00', aircraft: [jet('stiff'), jet('')] })]))
    validate()
    const ask = restIfPlaced('bane', `${TUE}.0.0.1.p`)
    expect(ask && ask.msg).toContain('Monday took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00')
  })
  it('the amber "Tight turning" reminder carries the same tail (Astra\'s scenario 14)', () => {
    monday('', '18:00')                                          // ends 20:00 → clear 08:00
    add(TUE, wave([], [form({ to: '10:30', ld: '11:30', br: '08:10' })]))   // nominal report 07:30, the B clears
    validate()
    const t = warns(TUE, 'bane', 'CREW_TIGHT')
    expect(t.length).toBe(1)
    expect(t[0].msg).toContain('Monday took off 18:00 with no landing typed, +2h debrief assumed → ended 20:00 → crew rest clear at 08:00')
    expect(warns(TUE, 'bane', 'CREW_REST'), 'no hard breach added').toEqual([])
  })
  it('LEFT AS IT IS: a landing typed at midnight is a landing — "landed 00:00" (Astra\'s scenario 16)', () => {
    monday('00:00', '20:00')
    add(TUE, wave(['12:40 IN TIME'], [form({ to: '15:00', ld: '16:00' })]))
    expect(restMsg(TUE)).toContain('Monday landed 00:00, +2h debrief assumed → ended 02:00 → crew rest clear at 14:00')
  })
  it('a later typed landing beats an earlier sortie\'s assumed end: "landed 23:00" (Astra\'s scenario 12)', () => {
    add(MON, wave([], [form({ to: '19:00', ld: '23:00' }), form({ cs: 'VK', to: '20:00', ld: '' })]))
    add(TUE, wave(['11:40 IN TIME'], [form({ to: '14:00', ld: '15:00' })]))
    expect(restMsg(TUE)).toContain('Monday landed 23:00, +2h debrief assumed → ended 01:00 → crew rest clear at 13:00')
  })
  it('LEFT AS IT IS: no landing typed still raises no long-day note on the day itself (D1936)', () => {
    monday('')
    ground(MON, 'bane', '0000', '0100')
    expect(warns(MON, 'bane', 'LONGDAY')).toEqual([])
  })
})
