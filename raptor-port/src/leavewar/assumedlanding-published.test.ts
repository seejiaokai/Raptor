// [WARN-WORDS-STANDALONE] piece B — A FLIGHT WITH NO LANDING TYPED EARNS OIL TO ITS ASSUMED LANDING, AND A PUBLISHED DAY
// KEEPS THE FLIGHT LENGTH IT WENT OUT WITH (owner D2046, D2047 — "every check that reads the landing"; D2053; the OIL
// reading is the agent's, flagged to him; D2044 — a published day's OIL keeps its values, a change reads pending).
//
// Bane on a published Saturday, take-off 10:00 and NO landing typed: report 07:00 (the nominal 3h lead) to the assumed
// landing 11:00 (+1h) plus the 2h debrief = 13:00, six hours — a half day under the 6h01 line. Raising the Logic flight
// length to 90 minutes would make it 13:30, a full day: the published day keeps its half day, reads one pending OIL
// change, and the next amendment takes the full day in. Driven through the real publish path and read where the OIL
// lands — the Leave War's own cell and record. Unit half: src/engine/assumedlanding.test.ts.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved, publishALDay, dayDelta, daySnapOf, dayCurVer } from '../engine/publish'
import { VCONF } from '../engine/rules'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { recsAt } from './engine/warrecs'
import { runOilPass } from './sync'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const RULES0 = { reportLead: VCONF.reportLead, debrief: VCONF.debrief, oilFullMin: VCONF.oilFullMin, fltLen: VCONF.fltLen }
const SAT = '2026-07-18'

beforeEach(() => {
  Object.assign(VCONF, RULES0)
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0
  JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
})
afterEach(() => Object.assign(VCONF, RULES0))

const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const sign = (di: number) => { const g = signOf(di); for (const [r, w] of FOUR) (g as any)[r] = w }
const publish = (di: number) => { sign(di); setDayApproved(di, true) }
const cellOf = (person: string, date: string) => getState().wars[0].grid[person]?.[date]
const worked = (person: string, date: string) =>
  recsAt(getState().wars[0].recs, person, date).filter((r: any) => r.oil === 'auto').map((r: any) => r.spans)
const jet = (p: string) => ({ p, w: '', area: '', rmks: '', opts: {} })
const build = (di: number, to: string, ld: string) => {
  Object.assign(DAYS[di], {
    waves: [{ label: 'WAVE 1', intimes: [], formations: [{ cs: 'VL', msn: 'X', to, ld, br: '', aircraft: [jet('bane')] }] }],
    dutywaves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [],
  })
}
const oilPending = (di: number) => dayDelta(di).filter((e: any) => e.kind === 'oil')
const keptOn = (di: number) => (daySnapOf(di, dayCurVer(di)) as any).d.oilev.rv

describe('a flight with no landing typed earns to its assumed landing (D2046, D2053)', () => {
  for (const ld of ['', 'TBD']) {
    it(`landing "${ld}": a half day, 07:00–13:00, credited (it used to earn nothing)`, () => {
      build(5, '10:00', ld)
      publish(5); runOilPass()
      expect(cellOf('bane', SAT)).toBe('HO')
      expect(worked('bane', SAT)).toEqual([[[420, 780]]])
    })
  }
  it('no take-off either: nothing to measure, nothing credited', () => {
    build(5, '', '')
    publish(5); runOilPass()
    expect(cellOf('bane', SAT) || '').not.toMatch(/FO|HO/)
  })
})

describe('a published day keeps the flight length it went out with (D2005, D2044)', () => {
  it('the version keeps 60 min with its other OIL values', () => {
    build(5, '10:00', '')
    publish(5)
    expect(keptOn(5).fltLen).toBe(60)
  })
  it('90 min on the Logic page: the published half day stays, one OIL change waits, the next amendment gives the full day', () => {
    build(5, '10:00', '')
    publish(5); runOilPass()
    expect(cellOf('bane', SAT)).toBe('HO')
    VCONF.fltLen = 90
    runOilPass()
    expect(cellOf('bane', SAT), 'the published day keeps what it went out with').toBe('HO')
    expect(oilPending(5)).toHaveLength(1)
    sign(5); publishALDay(5); runOilPass()
    expect(cellOf('bane', SAT)).toBe('FO')
    expect(worked('bane', SAT)).toEqual([[[420, 810]]])
    expect(oilPending(5)).toHaveLength(0)
  })
  it('a change that would move nobody\'s OIL reads nothing pending (a typed landing ignores the flight length)', () => {
    build(5, '10:00', '11:15')
    publish(5); runOilPass()
    VCONF.fltLen = 90
    expect(oilPending(5)).toHaveLength(0)
  })
  it('a version kept before the setting existed reads today\'s flight length and raises nothing (D56)', () => {
    build(5, '10:00', '')
    publish(5); runOilPass()
    delete keptOn(5).fltLen
    expect(oilPending(5)).toHaveLength(0)
    expect(cellOf('bane', SAT)).toBe('HO')
  })
})
