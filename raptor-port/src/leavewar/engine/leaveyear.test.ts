// The leave year engine (M5a, the build spec §1). §1.5's worked table, row by row — every ruled example through the one
// formula — then the edges the spec's reads named: the snapshot, a period created later, a never-typed figure, an old
// bare-number opening that must not loop, the what-if, days taken.
import { describe, expect, it } from 'vitest'
import type { LeaveSource } from './charge'
import { AM, FULL, PM, type Contrib, type Win } from './dayview'
import type { Person } from './people'
import { addDays, buildDays, type Period } from './period'
import {
  annualUsedIn, daysTaken, gradeDaysOn, personFigures, sameSnapshot, snapshotOf, START_GRADES, startYear,
  type Balances, type DayRecs, type GradeHists, type LeaveYearWorld, type TypedBal,
} from './leaveyear'

const PID = 'r'
function period(year: number, tweak?: (p: Period) => void): LeaveSource {
  const p: Period = { id: `w${year}`, name: `${year}`, start: `${year}-01-01`, end: `${year}-12-31`, open: [], lastClosed: null, days: buildDays(`${year}-01-01`, `${year}-12-31`), bands: [] }
  tweak?.(p)
  return { grid: {}, states: {}, views: {}, period: p }
}
/* 2026, and 2027 with 1 Jan a public holiday (the table's world) */
const Y26 = period(2026)
const Y27 = period(2027, p => { p.days[0]!.ph = true })

let seq = 0
type Days = Map<string, Contrib[]>
function put(days: Days, from: string, to: string, make: (d: string) => Contrib): Days {
  for (let d = from; d <= to; d = addDays(d, 1)) days.set(d, [...(days.get(d) ?? []), make(d)])
  return days
}
const win = (half?: 'am' | 'pm'): Win => (half === 'am' ? AM : half === 'pm' ? PM : FULL)
const approved = (days: Days, code: string, from: string, to = from, half?: 'am' | 'pm') =>
  put(days, from, to, () => ({ id: `a${++seq}`, kind: 'absence', code, win: win(half), lw: true }))
const pending = (days: Days, code: string, from: string, to = from, half?: 'am' | 'pm') =>
  put(days, from, to, () => ({ id: `q${++seq}`, kind: 'request', code, win: win(half), state: 'pending' }))

function world(o: Partial<LeaveYearWorld> & { today: string }): LeaveYearWorld {
  return { wars: [Y26, Y27], ctx: { people: [] }, balances: {}, openings: {}, ledger: [], grades: START_GRADES, gradeHist: {}, ...o }
}
const lve = (amount: number, cf: number, day: string, snap: TypedBal['snap'] = []): Balances => ({ [PID]: { LVE: { amount, cf, day, by: 'saber', snap } } })
const junior: GradeHists = { [PID]: [{ id: 'jp', from: '2026-01-01' }] }
const LVE = (w: LeaveYearWorld, days: DayRecs) => personFigures(w, PID, days).kinds.LVE

describe('§1.5 the worked table', () => {
  it('row 1 — D1479: typed 17 incl. 4 on 5 Jan, LL 26–27 Jan approved after: 15 incl. 2; with 2.5 pending War bal 12.5', () => {
    const days = approved(new Map(), 'LL', '2027-01-26', '2027-01-27')
    pending(days, 'LL', '2027-01-28', '2027-01-29'); pending(days, 'LL', '2027-02-01', '2027-02-01', 'am')
    const f = LVE(world({ today: '2027-01-25', balances: lve(17, 4, '2027-01-05'), gradeHist: junior }), days)
    expect([f.app, f.cf, f.pending, f.war]).toEqual([15, 2, 2.5, 12.5])
  })
  it('row 2 — the same, the 2.5 approved: App bal 12.5, Pending gone, War bal 12.5', () => {
    const days = approved(new Map(), 'LL', '2027-01-26', '2027-01-29'); approved(days, 'LL', '2027-02-01', '2027-02-01', 'am')
    const f = LVE(world({ today: '2027-01-25', balances: lve(17, 4, '2027-01-05'), gradeHist: junior }), days)
    expect([f.app, f.pending, f.war]).toEqual([12.5, 0, 12.5])
  })
  it('row 3 — D1235: 37 left incl. 4, nothing since; on 1 Jan 66 incl. 33', () => {
    const f = LVE(world({ today: '2027-01-01', balances: lve(37, 4, '2026-12-01'), gradeHist: junior }), new Map())
    expect([f.app, f.cf]).toEqual([66, 33])
  })
  it('row 4 — D1474: the same with no grade: 33 incl. 33', () => {
    const f = LVE(world({ today: '2027-01-01', balances: lve(37, 4, '2026-12-01') }), new Map())
    expect([f.app, f.cf]).toEqual([33, 33])
  })
  it('row 5 — D1474: −2 left (incl. 0); on 1 Jan 31 incl. 0', () => {
    const f = LVE(world({ today: '2027-01-01', balances: lve(-2, 0, '2026-12-01'), gradeHist: junior }), new Map())
    expect([f.app, f.cf]).toEqual([31, 0])
  })
  it('row 6 — D1473 under D1479: 23 incl. 3, LL Thu 31 Dec – Mon 4 Jan approved on 20 Dec: 21/2, 21/2, 52/19, 52/19 (reading 21)', () => {
    const days = approved(new Map(), 'LL', '2026-12-31', '2027-01-04')
    const at = (today: string) => { const f = LVE(world({ today, balances: lve(23, 3, '2026-12-01'), gradeHist: junior }), days); return [f.app, f.cf] }
    expect(at('2026-12-20')).toEqual([21, 2])
    expect(at('2026-12-31')).toEqual([21, 2])
    expect(at('2027-01-01')).toEqual([52, 19])
    expect(at('2027-01-05')).toEqual([52, 19])
  })
  it('row 7 — the same leave approved only on 2 Jan: 23/3 on 31 Dec, 53/20 on 1 Jan, 52/19 on 2 Jan (reading 22)', () => {
    const asked = pending(new Map(), 'LL', '2026-12-31', '2027-01-04')
    const done = approved(new Map(), 'LL', '2026-12-31', '2027-01-04')
    const at = (today: string, days: Days) => { const f = LVE(world({ today, balances: lve(23, 3, '2026-12-01'), gradeHist: junior }), days); return [f.app, f.cf] }
    expect(at('2026-12-31', asked)).toEqual([23, 3])
    expect(at('2027-01-01', asked)).toEqual([53, 20])
    expect(at('2027-01-02', done)).toEqual([52, 19])
  })
  it('row 8 — D1474: 10 incl. 4, LL Tue 29 – Wed 30 Dec pending over 1 Jan: 28 Dec App 10 Pending 2 War 8; 1 Jan App 39, no pending, War 39 (reading 19)', () => {
    const days = pending(new Map(), 'LL', '2026-12-29', '2026-12-30')
    const at = (today: string) => { const f = LVE(world({ today, balances: lve(10, 4, '2026-12-01'), gradeHist: junior }), days); return [f.app, f.pending, f.war] }
    expect(at('2026-12-28')).toEqual([10, 2, 8])
    expect(at('2027-01-01')).toEqual([39, 0, 39])
  })
  it('row 9 — typed 20 incl. 0 in Nov 2026, LL 2–3 Feb 2027 approved before typing, the 2027 period created after: 20 either way (finding 2)', () => {
    const days = approved(new Map(), 'LL', '2027-02-02', '2027-02-03')
    const bal = lve(20, 0, '2026-11-10', snapshotOf(days, 'LVE'))
    expect(LVE(world({ today: '2026-11-10', wars: [Y26], balances: bal }), days).app).toBe(20)
    expect(LVE(world({ today: '2026-11-10', wars: [Y26, Y27], balances: bal }), days).app).toBe(20)
  })
  it('row 10 — a pilot: LL Mon 1 – Fri 12 Feb approved (10), LL Sat 13 – Sun 21 bid: App unchanged, Pending 11, War 11 lower (finding 1)', () => {
    const days = approved(new Map(), 'LL', '2027-02-01', '2027-02-12')
    const bal = lve(30, 0, '2027-01-25', snapshotOf(days, 'LVE'))
    pending(days, 'LL', '2027-02-13', '2027-02-21')
    const pilot = { id: PID, seat: 'pilot' } as Person
    const f = LVE(world({ today: '2027-01-25', ctx: { people: [pilot] }, balances: bal }), days)
    expect([f.app, f.pending, f.war]).toEqual([30, 11, 19])
  })
  it('row 11 — typed 23 incl. 3, a 2-day leave approved before typing then deleted: 25 incl. 3 (reading 18)', () => {
    const was = approved(new Map(), 'LL', '2026-11-03', '2026-11-04')
    const f = LVE(world({ today: '2026-11-10', balances: lve(23, 3, '2026-11-05', snapshotOf(was, 'LVE')) }), new Map())
    expect([f.app, f.cf]).toEqual([25, 3])
  })
})

describe('the rest of §1', () => {
  it('CCL comes down as its leave is approved and never rolls over on 1 Jan (D1489, reading 1)', () => {
    const days = approved(new Map(), 'CCL', '2026-11-16', '2026-11-17')
    pending(days, 'CCL', '2026-11-18')
    const bal: Balances = { [PID]: { CCL: { amount: 3, day: '2026-11-02', by: 'saber', snap: [] } } }
    const f = personFigures(world({ today: '2027-01-04', balances: bal, gradeHist: junior }), PID, days).kinds.CCL
    expect([f.app, f.pending, f.war]).toEqual([1, 1, 0])
  })
  it('a leave already approved when he typed never moves App bal; one lengthened afterwards takes only its new days (reading 2)', () => {
    const before = approved(new Map(), 'LL', '2026-11-16', '2026-11-17')
    const bal = lve(20, 0, '2026-11-10', snapshotOf(before, 'LVE'))
    expect(LVE(world({ today: '2026-11-10', balances: bal }), before).app).toBe(20)
    const longer = approved(new Map(), 'LL', '2026-11-16', '2026-11-19')
    expect(LVE(world({ today: '2026-11-10', balances: bal }), longer).app).toBe(18)
  })
  it('a holiday later found on a day of leave approved since gives that day back; on a day already in the snapshot it moves nothing (narrow read 7)', () => {
    const snapDays = approved(new Map(), 'LL', '2026-11-16')
    const bal = lve(20, 0, '2026-11-10', snapshotOf(snapDays, 'LVE'))
    const days = approved(new Map(snapDays), 'LL', '2026-11-18')
    const ph = (dates: string[]) => period(2026, p => { for (const d of p.days) if (dates.includes(d.date)) d.ph = true })
    expect(LVE(world({ today: '2026-11-10', wars: [Y26], balances: bal }), days).app).toBe(19)
    expect(LVE(world({ today: '2026-11-10', wars: [ph(['2026-11-18'])], balances: bal }), days).app).toBe(20)
    expect(LVE(world({ today: '2026-11-10', wars: [ph(['2026-11-16'])], balances: bal }), days).app).toBe(19)
  })
  it('a date no period covers is charged by the plain rule: a weekday 1, a half .5, the weekend 0 (reading 17)', () => {
    const days = approved(new Map(), 'LL', '2028-03-03', '2028-03-06')   // Fri – Mon, no 2028 period
    approved(days, 'LL', '2028-03-08', '2028-03-08', 'pm')
    const bal = lve(10, 0, '2028-02-01')
    expect(LVE(world({ today: '2028-02-01', balances: bal }), days).app).toBe(7.5)
  })
  it('a leave in a year after this one comes off the total only; this year\'s carried forward is untouched (D1218, D1473)', () => {
    const days = approved(new Map(), 'LL', '2027-02-02', '2027-02-03')
    const f = LVE(world({ today: '2026-11-10', balances: lve(20, 4, '2026-11-01') }), days)
    expect([f.app, f.cf]).toEqual([18, 4])
  })
  it('a grade changed after 1 Jan counts from the next 1 Jan (D1490); a deleted grade adds nothing from the day it went (reading 11)', () => {
    const w = world({ today: '2028-01-01', gradeHist: { [PID]: [{ id: 'jp', from: '2026-06-01' }, { id: 'sp', from: '2027-03-01' }] } })
    expect(gradeDaysOn(w, PID, 2027)).toBe(33)
    expect(gradeDaysOn(w, PID, 2028)).toBe(36)
    const gone = { ...w, grades: START_GRADES.map(g => (g.id === 'sp' ? { ...g, goneFrom: '2027-06-01' } : g)) }
    expect(gradeDaysOn(gone, PID, 2028)).toBe(0)
    expect(gradeDaysOn({ ...w, grades: START_GRADES.map(g => (g.id === 'jp' ? { ...g, days: [...g.days, { n: 40, from: '2027-02-01' }] } : g)) }, PID, 2027)).toBe(33)
  })
  it('never typed: 0 on 1 Jan of the war\'s first year, each 1 Jan since adding his grade, his approved leave since off (reading 4)', () => {
    const days = approved(new Map(), 'LL', '2026-03-02', '2026-03-03')
    const f = LVE(world({ today: '2027-02-01', gradeHist: junior }), days)
    /* 0 − 2 in 2026; on 1 Jan 2027 nothing carries forward and the overdrawn 2 come off the 33 (D1474) */
    expect([f.app, f.cf]).toEqual([31, 0])
    expect(startYear({ wars: [], today: '2030-05-05' })).toBe(2030)
  })
  it('an old bare-number opening is read as a never-typed figure and a far-off clock never loops from 1970 (finding 5)', () => {
    const t0 = Date.now()
    const f = LVE(world({ today: '2026-11-10', wars: [], openings: { [PID]: { annual: 12 } } }), new Map())
    expect(f.app).toBe(12)
    expect(Date.now() - t0).toBeLessThan(500)
  })
  it('the snapshot is a day or a half at a time and compares sorted', () => {
    const days = approved(new Map(), 'LL', '2026-11-16'); approved(days, 'OL', '2026-11-17', '2026-11-17', 'am'); approved(days, 'CCL', '2026-11-17', '2026-11-17', 'pm')
    pending(days, 'LL', '2026-11-20')
    expect(snapshotOf(days, 'LVE')).toEqual([['2026-11-16', 'day'], ['2026-11-17', 'am']])
    expect(snapshotOf(days, 'CCL')).toEqual([['2026-11-17', 'pm']])
    expect(sameSnapshot([['2026-11-17', 'am'], ['2026-11-16', 'day']], snapshotOf(days, 'LVE'))).toBe(true)
    expect(sameSnapshot([['2026-11-16', 'day']], snapshotOf(days, 'LVE'))).toBe(false)
  })
  it('the what-if adds a fill to his pending leave: War bal answers "what is left if I place this", App bal never moves', () => {
    const w = world({ today: '2026-11-10', balances: lve(10, 0, '2026-11-01') })
    const f = personFigures(w, PID, new Map(), { dates: ['2026-11-16', '2026-11-17'], code: 'LL' }).kinds.LVE
    expect([f.app, f.war]).toEqual([10, 8])
  })
  it('the LVE tile\'s taken counts approved LVE from 1 Jan up to today; MED counts medical calendar days this year', () => {
    const days = approved(new Map(), 'LL', '2027-01-19', '2027-01-21'); approved(days, 'LL', '2027-01-26', '2027-01-27')
    approved(days, 'HL', '2027-01-09', '2027-01-10'); approved(days, 'ATTC', '2027-01-12', '2027-01-12', 'am')
    const f = personFigures(world({ today: '2027-01-22' }), PID, days)
    expect([f.lveTaken, f.medTaken, f.cfTill]).toEqual([3, 2.5, '2027-12-31'])
  })
  it('days taken counts the View period up to today, approved only: leave as charged, MED / CSE / OD as calendar days (D1484, reading 20)', () => {
    const days = approved(new Map(), 'LL', '2026-03-06', '2026-03-09')   // Fri – Mon: 2 charged
    approved(days, 'CSE', '2026-04-06', '2026-04-19')                      // two weeks: 14
    pending(days, 'OL', '2026-05-04')
    approved(days, 'CL', '2026-12-01')                                     // after today
    const t = daysTaken(world({ today: '2026-11-10' }), PID, days, '2026-01-01', '2026-12-31')
    expect([t.LL, t.CSE, t.OL, t.CL]).toEqual([2, 14, 0, 0])
  })
  it('the grid\'s second line counts LL and OL in the range, approved and pending, as charged', () => {
    const days = approved(new Map(), 'LL', '2026-03-02', '2026-03-06'); pending(days, 'OL', '2026-03-09', '2026-03-11'); pending(days, 'OL', '2026-03-12', '2026-03-12', 'am')
    expect(annualUsedIn(world({ today: '2026-01-01' }), PID, days, '2026-01-01', '2026-12-31')).toBe(8.5)
  })
})
