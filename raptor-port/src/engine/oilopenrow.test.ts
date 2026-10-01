/* [ALLAVAIL-OPEN-ROW] — D360 (owner, 28 Sep 26: "ok, need to say something like no oil worked out due end time to the
   admin"). An ALL AVAIL on a row with a START and NO END showed no count at all: the crowd is recorded only by the credit
   walk, which rightly refuses a row with no written end (D31 — "display may guess; money may not"), so the count — a
   SCHEDULING fact on every seat the puck can land on (D27, D37) — inherited the credit's refusal and went silent.

   Now the membership is recorded for such a row over the length the rest of the schedule assumes for it (the Logic
   tab's `openEnd`; a sim its own `simLen`), and the CREDIT IS UNTOUCHED: nobody is credited a thing from it. One test
   per kind of row a placeholder lands on (a ground row, a duty desk, a sim seat, a Common Programme row), each asserting
   BOTH halves — the crowd written down, and nothing credited. Same harness as oilexpand.test.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED } from './publish'
import { VCONF } from './rules'
import { ensureRowIds } from './rowids'
import { rowItemKey, groundItemKey, openEndRows } from './oil'
import { oilEvidence, oilEarnedWork, oilDayWork } from './oilev'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
const CROWD = ['bane', 'stiff']
let asked: Array<[number, number]> = []
const openEnd = VCONF.openEnd, simLen = VCONF.simLen

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}
  Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  asked = []
  HOOKS.oilSentinel = (_iso: string, win: [number, number]) => { asked.push(win); return CROWD.slice() }
})
afterEach(() => {
  HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel
  VCONF.openEnd = openEnd; VCONF.simLen = simLen
})

const day = () => DAYS[SAT] as any
const ev = () => oilEvidence(SAT)
const paid = () => Object.keys(oilEarnedWork(day(), ev())).sort()
const worked = () => Object.keys(oilDayWork(day(), ev())).sort()

const KINDS: Array<[string, () => string, number]> = [
  ['a ground row', () => { day().ground = [{ prog: 'DINNER WITH CMD', str: '1830', end: '', who: 'allavail' }]; ensureRowIds(DAYS); return groundItemKey(day().ground[0]) }, 60],
  ['a duty desk', () => { day().dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SDO', id: 'allavail', str: '0700', end: '' }] }]; ensureRowIds(DAYS); return rowItemKey(day().dutywaves[0].rows[0].rid) }, 60],
  ['a sim seat (its own assumed length)', () => { day().sims = { amt: [{ str: '1300', end: '', p: 'allavail', w: '' }] }; ensureRowIds(DAYS); return rowItemKey(day().sims.amt[0].rid) }, 90],
  ['a Common Programme row', () => { day().allhands = [{ prog: 'OPS BRIEF', str: '1400', end: '', who: ['allavail'] }]; ensureRowIds(DAYS); return rowItemKey(day().allhands[0].rid) }, 60],
]

describe('a placeholder on a row with a start and no end is counted — and credits nobody (D360)', () => {
  for (const [what, build, len] of KINDS) {
    it(`${what}: the crowd is written down over the assumed ${len} minutes`, () => {
      const item = build()
      const e = ev()
      expect(e.sent[item], 'the day records who the puck stands for').toEqual(CROWD)
      expect(asked.length, 'asked once').toBe(1)
      expect(asked[0][1] - asked[0][0], 'over the length the schedule assumes for it').toBe(len)
    })
    it(`${what}: and nobody earns a thing from it — the money never guesses (D31)`, () => {
      build()
      expect(worked(), 'no work measured from the row').toEqual([])
      expect(paid(), 'no credit').toEqual([])
    })
  }

  it('the assumed length is the Logic tab\'s — change it and the window follows', () => {
    VCONF.openEnd = 120
    const item = KINDS[0][1]()
    expect(ev().sent[item]).toEqual(CROWD)
    expect(asked[0][1] - asked[0][0]).toBe(120)
  })

  it('a weekday is counted too — the count is a scheduling fact on every day (D27)', () => {
    HOOKS.oilEarningDay = () => false
    const item = KINDS[1][1]()
    const e = ev()
    expect(e.earns).toBe(false)
    expect(e.sent[item]).toEqual(CROWD)
  })
})

describe('what stays as it was', () => {
  it('a row with NO start counts nobody (its chip says why — oilmode)', () => {
    day().ground = [{ prog: 'DINNER', str: '', end: '2000', who: 'allavail' }]; ensureRowIds(DAYS)
    expect(ev().sent[groundItemKey(day().ground[0])]).toBeUndefined()
  })
  it('a row with no placeholder on it writes no entry — an ordinary day\'s record is unchanged', () => {
    day().dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SDO', id: 'rocky', str: '0700', end: '' }] }]; ensureRowIds(DAYS)
    expect(Object.keys(ev().sent)).toEqual([])
    expect(paid(), 'and the named man on it still earns nothing from an unwritten end').toEqual([])
  })
  it('a cancelled row and an ⓘ row are not listed, as the credit walk skips them', () => {
    day().ground = [{ prog: 'A', str: '1830', end: '', who: 'allavail', cx: true }, { prog: 'B', str: '1830', end: '', who: 'allavail', info: true }]
    ensureRowIds(DAYS)
    expect(openEndRows(day())).toEqual([])
  })
  it('a request\'s own row is not listed — its crowd has its own window (the request half)', () => {
    day().ground = [{ prog: 'LEAVE', str: '1830', end: '', who: 'allavail', src: 'x1' }]; ensureRowIds(DAYS)
    expect(openEndRows(day())).toEqual([])
  })
  it('a row with both times is counted by the walk as always, over its written window', () => {
    day().dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SDO', id: 'allavail', str: '0700', end: '1900' }] }]; ensureRowIds(DAYS)
    expect(ev().sent[rowItemKey(day().dutywaves[0].rows[0].rid)]).toEqual(CROWD)
    expect(asked[0]).toEqual([420, 1140])
    expect(paid(), 'and it credits, as before').toEqual(CROWD)
  })
})
