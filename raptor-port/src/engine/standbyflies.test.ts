// [STANDBY-FLIES] — A STANDBY LINE THAT FLIES COUNTS AS A REAL FLIGHT (owner D1042–D1046, D1060–D1065, 19 Oct 26).
//
// "When time like brief and rally is typed it's treated like a jet that's flying" (D1045): an SC, AVALON or BB shift with
// its B or R typed flies whole, SPARE rows included (D1044); a row activated with nothing typed is ticked by hand and flies
// alone (D1061); a row that does not come in is cancelled with its own CX (D1046). A flying row is checked as an SC MAIN
// is — crew rest, clashes, availability with no standby carve-outs, currency — its day from the earliest of R, B and
// START to its END with nothing added (D1045); it counts in the day's flying count and Insights (a row with nobody seated
// does not — D1062) and earns OIL by default. Design note: docs/superpowers/specs/2026-10-19-standby-flies-design.md.

import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate, dayEvents, workSpan } from './validate'
import { makeStandalone, saFlies, saAnyFlies, saExempt, dayCount } from './waves'
import { dayOilWork } from './oil'
import { computeInsights } from './insights'
import { slotBar } from './avail'

const TUE = 1
const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
})
const h = (hh: number, mm = 0) => hh * 60 + mm
const blank = () => ({ dow: 'Saturday', waves: [] as any[], dutywaves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [] })
const tueWarns = (id: string, code?: string, gi?: number) => validate().all.filter((x: any) =>
  x.di === TUE && (x.who || []).includes(id) && (!code || x.code === code)
  && (gi == null || String(x.key || '').indexOf(`${TUE}.${gi}.`) === 0))
const addTue = (w: any) => { (DAYS[TUE] as any).waves.push(w); return (DAYS[TUE] as any).waves.length - 1 }

describe('SF1 SF2 SF3 — what flies (D1044, D1045, D1061, D1046)', () => {
  it('a B or an R typed flies every row of its shift, SPARE included; nothing typed, none', () => {
    const w: any = makeStandalone('sc'), f = w.formations[0]
    expect(f.aircraft.map((a: any) => saFlies(w, f, a))).toEqual([false, false, false, false])
    f.rl = '06:30'
    expect(f.aircraft.map((a: any) => saFlies(w, f, a))).toEqual([true, true, true, true])
    f.rl = ''; f.br = '0630'
    expect(f.aircraft.map((a: any) => saFlies(w, f, a))).toEqual([true, true, true, true])
    f.br = 'abc'
    expect(saAnyFlies(w, f), 'a box the app cannot read as a time flies nothing').toBe(false)
  })
  it('a hand tick flies its own row only, never the shift (D1061)', () => {
    const w: any = makeStandalone('avalon'), f = w.formations[0]
    f.aircraft[2].fly = true
    expect(f.aircraft.map((a: any) => saFlies(w, f, a))).toEqual([false, false, true, false])
    expect(saAnyFlies(w, f)).toBe(true)
  })
  it('a cancelled shift or row never flies (D1045, D1046)', () => {
    const w: any = makeStandalone('sc'), f = w.formations[0]
    f.rl = '06:30'; f.aircraft[1].cx = true
    expect(f.aircraft.map((a: any) => saFlies(w, f, a))).toEqual([true, false, true, true])
    f.cx = true
    expect(saAnyFlies(w, f)).toBe(false)
  })
  it('a flying row is checked: saExempt is false for it, true again for a row that only stands by', () => {
    const w: any = makeStandalone('bb'), f = w.formations[0]
    expect(saExempt(w, f, f.aircraft[0])).toBe(true)
    f.aircraft[0].fly = true
    expect(saExempt(w, f, f.aircraft[0])).toBe(false)
    expect(saExempt(w, f, f.aircraft[1])).toBe(true)
  })
  it('an ordinary flying line is never "a standby row that flies"', () => {
    const w: any = { label: 'W1', formations: [{ cs: 'VL', br: '08:00', aircraft: [{ p: 'bane', fly: true }] }] }
    expect(saFlies(w, w.formations[0], w.formations[0].aircraft[0])).toBe(false)
  })
})

describe('SF5 — the day\'s flying count (D1045, D1062)', () => {
  const seated = (w: any, li: number, ais: number[]) => ais.forEach(ai => { w.formations[li].aircraft[ai].p = 'p' + li + ai })
  it('nothing typed: the badge reads as before — standby after the slash, MAIN rows only', () => {
    const d: any = blank(), w: any = makeStandalone('sc'); d.waves.push(w); seated(w, 0, [0, 1, 2, 3])
    expect(dayCount(d)).toBe('0 / 2')
  })
  it('SC AM with its R typed and all four rows seated: four jets flying', () => {
    const d: any = blank(), w: any = makeStandalone('sc'); d.waves.push(w); seated(w, 0, [0, 1, 2, 3])
    w.formations[0].rl = '06:30'
    expect(dayCount(d)).toBe('4 / 2')   // PM, nothing typed, still stands by: its two MAIN rows after the slash
  })
  it('his case: R typed, both SPARE rows empty — 2 jets, not 4 (D1062)', () => {
    const d: any = blank(), w: any = makeStandalone('sc'); d.waves.push(w); seated(w, 0, [0, 1])
    w.formations[0].rl = '06:30'
    expect(dayCount(d)).toBe('2 / 2')
  })
  it('a flying wave beside it, and one SPARE ticked by hand on PM: its own term, one jet', () => {
    const d: any = blank(), w: any = makeStandalone('sc')
    d.waves.push({ label: 'W1', formations: [{ cs: 'VL', aircraft: [{ p: 'x' }, { p: 'y' }] }] }, w)
    seated(w, 1, [2]); w.formations[1].aircraft[2].fly = true
    expect(dayCount(d)).toBe('2 X 1 / 2')
  })
})

describe('SF5 — Insights counts a flying standby row as a sortie (D1042, D1062)', () => {
  it('each seated flying row a sortie, its shift one formation; an empty row and a standing-by row nothing', () => {
    const before = computeInsights()
    const w: any = makeStandalone('sc'); addTue(w)
    const f = w.formations[0]; f.rl = '06:30'; f.aircraft[0].p = 'split'; f.aircraft[2].p = 'stuff'
    w.formations[1].aircraft[0].p = 'bullet'                  // PM, nothing typed: stands by
    const after = computeInsights()
    expect(after.sorties - before.sorties).toBe(2)
    expect(after.forms - before.forms).toBe(1)
    const n = (I: any, id: string) => (I.flyers.find((x: any) => x.id === id) || { n: 0 }).n
    expect(n(after, 'stuff') - n(before, 'stuff')).toBe(1)
    expect(n(after, 'bullet') - n(before, 'bullet')).toBe(0)
  })
})

describe('SF4 — a flying AVALON / BB row is checked as an SC MAIN is', () => {
  it('its men are on shift — an event from the R to END, with nothing added after END (D1045)', () => {
    const w: any = makeStandalone('avalon'); const gi = addTue(w)
    const f = w.formations[0]; f.rl = '18:30'; f.aircraft[0].p = 'split'; f.aircraft[2].p = 'stuff'
    validate()
    const ev = dayEvents(TUE, 'stuff').filter((e: any) => e.kind === 'shift')
    expect(ev.length).toBe(1)
    expect(ev[0]).toMatchObject({ report: h(18, 30), s: h(19), e: h(31) })
    expect(workSpan(ev)).toMatchObject({ s: h(18, 30), e: h(31) })
    expect(gi).toBeGreaterThan(0)
  })
  it('a row that only stands by stays out of the events (the standby look only)', () => {
    const w: any = makeStandalone('avalon'); addTue(w)
    const f = w.formations[0]; f.aircraft[0].p = 'split'; f.aircraft[1].p = 'stuff'; f.aircraft[0].fly = true
    validate()
    expect(dayEvents(TUE, 'split').some((e: any) => e.kind === 'shift')).toBe(true)
    expect(dayEvents(TUE, 'stuff').some((e: any) => e.kind === 'shift')).toBe(false)
  })
  it('local leave no longer passes on a flying row — one warning, not two; on a standing-by row it still passes', () => {
    const w: any = makeStandalone('avalon'); const gi = addTue(w)
    const f = w.formations[0]; f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'LL', remarks: '' })
    expect(tueWarns('split', undefined, gi).filter((x: any) => x.sev === 'hard'), 'standing by: local leave may stand').toEqual([])
    f.rl = '18:30'
    const hard = tueWarns('split', undefined, gi).filter((x: any) => /LEAVE_FLY|INPUT_FLY/.test(x.code))
    expect(hard.length, JSON.stringify(hard)).toBe(1)
  })
  it('overseas on a flying row: one warning, not two (the standby look does not ask it again)', () => {
    const w: any = makeStandalone('avalon'); const gi = addTue(w)
    const f = w.formations[0]; f.aircraft[0].p = 'split'; f.rl = '18:30'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '' })
    expect(tueWarns('split', 'LEAVE_FLY', gi).length).toBe(1)
  })
  it('SC NIGHT currency is still asked of a flying AVALON row — once', () => {
    const w: any = makeStandalone('avalon'); const gi = addTue(w)
    const f = w.formations[0]; f.aircraft[0].p = 'ignite'; f.rl = '18:30'
    expect(tueWarns('ignite', 'SC_QUAL', gi).length).toBe(1)
  })
  it('the crew list judges the flying seat as the warnings do: local leave is struck there too', () => {
    const w: any = makeStandalone('avalon'); const gi = addTue(w)
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'LL', remarks: '' })
    const key = `${TUE}.${gi}.0.0.p`
    validate()
    expect(slotBar('split', key), 'standing by').toBe('')
    w.formations[0].rl = '18:30'
    validate()
    expect(slotBar('split', key), 'flying').not.toBe('')
  })
})

describe('SF9 — a flying BB shift with no START or END says so (the agent\'s call, told with the drawing)', () => {
  it('an advisory naming the line, anchored on its START box; none once both times are typed, none while it stands by', () => {
    const w: any = makeStandalone('bb'); const gi = addTue(w)
    const f = w.formations[0]; f.aircraft[0].p = 'split'
    const mine = () => validate().all.filter((x: any) => x.code === 'SA_FLY_NO_TIME' && x.di === TUE)
    expect(mine()).toEqual([])
    f.aircraft[0].fly = true
    const a = mine()
    expect(a.length).toBe(1)
    expect(a[0].sev).toBe('adv')
    expect(a[0].key).toBe(`ff:${TUE}.${gi}.0.to`)
    expect(a[0].msg).toMatch(/BB .*flies but has no START or END/)
    f.to = '08:00'; f.ld = '12:00'
    expect(mine()).toEqual([])
  })
})

describe('SF6 — OIL: a flying row earns by default (D1042)', () => {
  it('a SPARE ticked by hand earns by default on the written window; its neighbour standing by stays off', () => {
    const w: any = makeStandalone('bb'), f = w.formations[0]
    f.to = '08:00'; f.ld = '16:00'; f.aircraft[2].p = 'bane'; f.aircraft[3].p = 'stiff'; f.aircraft[2].fly = true
    const d: any = blank(); d.waves.push(w)
    const work = dayOilWork(d, { expandAll: () => [] })
    expect(work.bane.map((x: any) => [x.s, x.e, x.dflt])).toEqual([[h(8), h(16), true]])
    expect(work.stiff.map((x: any) => [x.s, x.e, x.dflt])).toEqual([[h(8), h(16), false]])
  })
})

/* THE FRESH READ'S FINDINGS (19 Oct 26 — docs/handpass/parts/standby-flies/read.md), each red before its fix */
describe('SF4 — the fresh read: a flying AVALON row in the crew list and the warning words', () => {
  it('F2: the crew list bars a man already on another place of the same flying AVALON shift', () => {
    const w: any = makeStandalone('avalon'); const gi = addTue(w)
    w.formations[0].rl = '18:30'; w.formations[0].aircraft[0].p = 'split'
    validate()
    expect(slotBar('split', `${TUE}.${gi}.0.1.p`)).toMatch(/already on/)
  })
  it('F4: a flying AVALON row is named "AVALON NIGHT" in its warnings, never the board\'s short "AV"', () => {
    const w: any = makeStandalone('avalon'); const gi = addTue(w)
    w.formations[0].rl = '18:30'; w.formations[0].aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '' })
    const ws = tueWarns('split', 'LEAVE_FLY', gi)
    expect(ws.length).toBe(1)
    expect(ws[0].msg).toMatch(/AVALON NIGHT/)
    expect(ws[0].msg).not.toMatch(/\bAV NIGHT/)
  })
})

describe('SF4 — the narrow read: a flying AVALON row\'s formation warnings name it in full (N3)', () => {
  it('SC NIGHT currency for a flying AVALON row says "AVALON NIGHT", never "AV NIGHT"', () => {
    const w: any = makeStandalone('avalon'); const gi = addTue(w)
    w.formations[0].rl = '18:30'; w.formations[0].aircraft[0].p = 'ignite'
    const ws = tueWarns('ignite', 'SC_QUAL', gi)
    expect(ws.length).toBe(1)
    expect(ws[0].msg).toMatch(/AVALON NIGHT/)
    expect(ws[0].msg).not.toMatch(/\bAV NIGHT/)
  })
})
