/* THE OVERHAUL'S M5a — EVERY READER OF A LEAVE BALANCE ON THE ONE ENGINE (the build spec §1.4, §1.6, §4 "Its readers";
   readings 14 and 24), the change history's new lines and their Undo lines (§3 "The change history", B6, reading 8), and
   the machine marks the person window reads back a leave someone else deleted, moved or re-typed by (§3, finding 12).

   One world, fed to every reader: the grid's two lines beside a name (MatrixRows nameFigures), My leave (myleave.ts),
   Approvals' LVE BAL and DAYS (approvals.ts figuresOf), the bid windows' "left" on a leave button and their below-zero
   ask (store.ts balanceAfterFill), and the engine's own answer (leaveFiguresOf) — they agree. The world is §1.5 row 10
   moved into the seed's 2026 period (June holds no holiday): a pilot, LL Mon 1 – Fri 12 Jun approved, then typed, then LL
   Sat 13 – Sun 21 Jun bid. The bid makes his run 21 days, so the run's weekends cost: the tile's Pending reads 11, while
   My leave's count and Approvals' DAYS count the request's own days, 5 — the one place the figures part (reading 24). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { ELOG } from '../engine/editlog'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { NOTICES } from '../state/notices'
import { noticeSeenLoad } from '../state/noticeseen'
import {
  addGrade, balanceAfterFill, clearCells, getState, initStore as lwInitStore, leaveFiguresOf, lwHistInit, moveRecords, rawState,
  setBalanceLock, setBidStates, setCell, setCellRange, setPeople, setPersonGrade, setTypedBalance,
} from './state/store'
import { memoryBackend } from './state/storage'
import { setMemberTodayForTests } from './engine'
import { projectPeople } from './state/raptorRoster'
import { warIdentityIfHidden, wireLeaveWarSync } from './sync'
import { figuresOf, linesOfWar, ownDays } from './approvals'
import { myLeaveOf } from './ui/myleave'
import { nameFigures, nameLines } from './ui/MatrixRows'
import { balanceLabel, belowZeroAsk, goesBelow } from './ui/belowzero'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
const TODAY = '2026-07-15'
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')        // the admin — person `stiff`
const ranger = () => signInAs('us', 'us')      // a member — person `bane`, a pilot
const days = (from: string, to: string) => { const out: string[] = []; for (let d = from; d <= to; d = new Date(Date.parse(d + 'T00:00:00Z') + 864e5).toISOString().slice(0, 10)) out.push(d); return out }
const cells = (pid: string, from: string, to: string) => days(from, to).map(date => ({ personId: pid, date }))
const lines = () => ELOG.rows.map(r => r as any)

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 8, 0, 0)); setMemberTodayForTests(TODAY)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  NOTICES.length = 0
  ELOG.rows.length = 0
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  saber()
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); resetSession(null); setMemberTodayForTests('2000-01-01') })

/* §1.5 row 10, in June 2026: his run approved, typed 20 after it was approved (so it takes nothing off), then the bid */
function row10(typed = 20): void {
  expect(setCellRange('bane', '2026-06-01', '2026-06-12', 'LL').written).toBe(12)
  expect(setBidStates(cells('bane', '2026-06-01', '2026-06-12'), 'approved').decided).toBe(12)
  expect(setTypedBalance('bane', 'LVE', typed, 0)).toBe(true)
  expect(setCellRange('bane', '2026-06-13', '2026-06-21', 'LL').written).toBe(9)
}
const lineOf = (pid: string) => linesOfWar(rawState().wars.find(w => w.period.id === 'y2026')!).find(l => l.personId === pid)!

describe('one world, every reader agrees (the build spec §1.6)', () => {
  it('the grid\'s figure, My leave, Approvals\' LVE BAL, a leave button\'s "left" and the engine read one War bal', () => {
    row10()
    const war = leaveFiguresOf('bane').kinds.LVE.war
    expect(war).toBe(9)                                                       // 20 − 11: the run's every day now costs
    const period = getState().period
    expect(nameFigures('bane', period.start, period.end).war).toBe(war)
    expect(nameLines('bane', period).top).toBe(war)
    expect(myLeaveOf(getState().wars, 'bane', TODAY).lve).toBe(war)
    const who = getState().people.find(p => p.id === 'bane')
    expect(figuresOf(lineOf('bane'), who).bal).toMatchObject({ counter: 'annual', label: '', value: war })
    expect(balanceAfterFill('bane', [], 'LL')).toEqual({ counter: 'annual', before: war, after: war })
  })

  it('§1.5 row 10 (reading 24): the tile\'s Pending reads 11, while My leave and Approvals\' DAYS count the bid alone, 5', () => {
    row10()
    const f = leaveFiguresOf('bane').kinds.LVE
    expect(f.app).toBe(20)                                                    // a pending bid never moves App bal
    expect(f.pending).toBe(11)                                                // 21 charged − the 10 already charged
    expect(myLeaveOf(getState().wars, 'bane', TODAY).pending).toBe(5)
    expect(figuresOf(lineOf('bane'), undefined).days).toBe(5)
    /* the grid's second line: his LL and OL days in the View period, approved and pending, as charged — the run's 21 */
    expect(nameFigures('bane', '2026-01-01', '2026-12-31').used).toBe(21)
  })

  it('a bid of weekend days only, completing a pilot\'s run, costs 0 by itself yet still asks before going below zero', () => {
    expect(setCellRange('bane', '2026-06-01', '2026-06-12', 'LL').written).toBe(12)
    expect(setBidStates(cells('bane', '2026-06-01', '2026-06-12'), 'approved').decided).toBe(12)
    expect(setTypedBalance('bane', 'LVE', 3, 0)).toBe(true)
    const weekends = ['2026-05-30', '2026-05-31', '2026-06-13', '2026-06-14']
    expect(ownDays('bane', weekends.map(date => ({ date, code: 'LL' })))).toBe(0)
    const r = balanceAfterFill('bane', weekends, 'LL')
    /* the run becomes 16 days, so all 16 cost: 16 − the 10 already charged = 6 more */
    expect(r).toEqual({ counter: 'annual', before: 3, after: -3 })
    expect(goesBelow(r)).toBe(true)
    expect(belowZeroAsk([{ callsign: 'Ranger', counter: r!.counter, after: r!.after }])).toBe('That takes Ranger to −3 LVE. Tap the same leave again to go ahead.')
  })

  it('a CCL bid reads its own kind\'s War bal on Approvals, labelled, and the leave button\'s "left" with a fill', () => {
    expect(setTypedBalance('bane', 'CCL', 3)).toBe(true)
    expect(balanceAfterFill('bane', ['2026-06-03'], 'CCL')).toEqual({ counter: 'ccl', before: 3, after: 2 })
    expect(setCell('bane', '2026-06-03', 'CCL')).toBe(true)
    expect(leaveFiguresOf('bane').kinds.CCL).toMatchObject({ app: 3, war: 2, pending: 1 })
    expect(figuresOf(lineOf('bane'), undefined).bal).toMatchObject({ counter: 'ccl', label: 'CCL', value: 2 })
    expect(myLeaveOf(getState().wars, 'bane', TODAY).pending).toBe(1)
    expect(balanceLabel('ccl')).toBe('CCL')
    expect(balanceLabel('annual')).toBe('LVE')
  })

  it('§1.5 row 10\'s Monday after the bid (walker D\'s FAIL 1): an LL there leaves War bal − 1 = 8, its afternoon 8.5', () => {
    row10()
    /* Mon 22 Jun is no part of the 21-day run's last day (Sun 21 Jun) — it lengthens the run to 22, every day already costing */
    expect(balanceAfterFill('bane', ['2026-06-22'], 'LL')).toEqual({ counter: 'annual', before: 9, after: 8 })
    expect(balanceAfterFill('bane', ['2026-06-22'], 'LL*')!.after).toBe(8.5)
  })

  it('a pilot with no row (SANS off the war): his 15-day bid counts every day in Approvals\' DAYS too, as on his tile (the code read\'s 5)', () => {
    const sans = Object.keys(PEOPLE).find(id => !getState().people.some(p => p.id === id) && warIdentityIfHidden(id)?.seat === 'pilot')
    expect(sans, 'the demo holds a SANS pilot the war shows no row for').toBeTruthy()
    const run = days('2026-06-01', '2026-06-15').map(date => ({ date, code: 'LL' }))        // Mon 1 – Mon 15 Jun: 15 days
    expect(ownDays(sans!, run)).toBe(15)
    const f0 = leaveFiguresOf(sans!).kinds.LVE.war
    expect(f0 - leaveFiguresOf(sans!, { dates: run.map(r => r.date), code: 'LL' }).kinds.LVE.war).toBe(15)
  })

  it('OIL stays the tracker\'s: the bid windows and Approvals read its ledger, never a typed figure', () => {
    const r = balanceAfterFill('bane', ['2026-06-03'], 'OIL')!
    expect(r.counter).toBe('oil')
    expect(myLeaveOf(getState().wars, 'bane', TODAY).oil).toBe(r.before)
  })
})

describe('the change history: a typed figure, a grade, the grades list, the lock — and each Undo (§3, B6, reading 8)', () => {
  const last = () => lines()[lines().length - 1]
  it('"LVE balance 18 → 20" from the running figure, under Leave War · Ranger, who beside it; its Undo in its own words', () => {
    ranger()
    expect(setTypedBalance('bane', 'LVE', 18, 2)).toBe(true)
    /* a first typing reads from the running figure he saw (the spec §1.1 — the store works it out itself since the
       security read's finding 2), and, its carried-forward part moved, its own carried-forward line */
    expect(lines().map(r => r.lbl)).toEqual(['Leave War · Ranger · LVE balance', 'Leave War · Ranger · LVE carried fwd'])
    expect(lines()[0]).toMatchObject({ to: '18', sub: 'bane', sect: 'abs', fld: 'balance', itype: 'LVE', pid: 'bane' })
    expect(lines()[0]!.from).toBeTruthy()
    expect(lines()[1]).toMatchObject({ to: '2', sub: 'bane', fld: 'carried' })
    ELOG.rows.length = 0
    expect(setTypedBalance('bane', 'LVE', 20, 2, { amount: 18, cf: 2 })).toBe(true)
    expect(lines()).toHaveLength(1)
    expect(last()).toMatchObject({ lbl: 'Leave War · Ranger · LVE balance', from: '18', to: '20', sub: 'bane', fld: 'balance' })
    ELOG.rows.length = 0
    globalUndo()
    expect(lines().map(r => r.lbl)).toEqual(['Undo — LVE balance 18 → 20'])
  })
  it('a change of the carried-forward part alone is its own line, and its Undo says so', () => {
    expect(setTypedBalance('bane', 'LVE', 18, 2)).toBe(true)
    ELOG.rows.length = 0
    expect(setTypedBalance('bane', 'LVE', 18, 3, { amount: 18, cf: 2 })).toBe(true)
    expect(lines()).toHaveLength(1)
    expect(last()).toMatchObject({ lbl: 'Leave War · Ranger · LVE carried fwd', from: '2', to: '3', fld: 'carried' })
    ELOG.rows.length = 0
    globalUndo()
    expect(lines().map(r => r.lbl)).toEqual(['Undo — LVE carried fwd 2 → 3'])
  })
  it('a grade: "Grade No grade → Senior pilot"; its Undo names the man', () => {
    expect(setPersonGrade('bane', 'sp')).toBe(true)
    expect(last()).toMatchObject({ lbl: 'Leave War · Ranger · Grade', from: 'No grade', to: 'Senior pilot', sub: 'bane', fld: 'grade' })
    ELOG.rows.length = 0
    globalUndo()
    expect(lines().map(r => r.lbl)).toEqual(['Undo — Ranger’s grade'])
  })
  it('the lock and the grades list: one line each, under the day; and each Undo', () => {
    expect(setBalanceLock(true)).toBe(true)
    expect(last()).toMatchObject({ lbl: 'Balances locked for members', sect: 'day' })
    ELOG.rows.length = 0
    globalUndo()
    expect(lines().map(r => r.lbl)).toEqual(['Undo — the balance lock'])
    expect(setBalanceLock(true)).toBe(true)
    expect(setBalanceLock(false)).toBe(true)
    expect(last()).toMatchObject({ lbl: 'Balances unlocked for members' })
    expect(addGrade('Junior OPS', 10)).toBeTruthy()
    expect(last()).toMatchObject({ lbl: 'Leave grades · add Junior OPS', sect: 'day' })
    ELOG.rows.length = 0
    globalUndo()
    expect(lines().map(r => r.lbl)).toEqual(['Undo — the grades list'])
  })
})

describe('the machine marks: a leave someone else deleted, moved or re-typed (§3, finding 12)', () => {
  /* the person window's own question, as the comment in state/changelines.ts tells it to ask */
  const othersOn = (pid: string) => lines().filter(r => r.sub === pid && ['deleted', 'moved', 'kind'].includes(r.fld) && String(r.pid) !== pid)
  it('a pending bid deleted, moved and re-typed by the admin each carry their mark, whose leave and its code', () => {
    expect(setCell('bane', '2026-06-03', 'LL')).toBe(true)
    expect(setCell('bane', '2026-06-04', 'LL')).toBe(true)
    expect(setCell('bane', '2026-06-08', 'LL')).toBe(true)
    ELOG.rows.length = 0
    expect(setCell('bane', '2026-06-03', '')).toBe(true)
    expect(setCell('bane', '2026-06-04', 'OL')).toBe(true)
    const id = rawState().wars.find(w => w.period.id === 'y2026')!.recs.bane!['2026-06-08']![0]!.id
    expect(moveRecords([{ personId: 'bane', date: '2026-06-08', id, kind: 'request' }], 2)).toBe('moved')
    const marks = othersOn('bane').map(r => ({ fld: r.fld, itype: r.itype, date: r.date, wdate: r.wdate, from: r.from, to: r.to }))
    expect(marks).toEqual([
      { fld: 'deleted', itype: 'LL', date: '2026-06-03', wdate: undefined, from: '', to: '' },
      { fld: 'kind', itype: 'OL', date: '2026-06-04', wdate: undefined, from: 'LL', to: 'OL' },
      { fld: 'moved', itype: 'LL', date: '2026-06-10', wdate: '2026-06-08', from: '', to: '' },
    ])
  })
  it('approved leave deleted on the war carries the mark too; his own bid withdrawn is no one else\'s change', () => {
    expect(setCell('bane', '2026-06-03', 'LL')).toBe(true)
    expect(setBidStates([{ personId: 'bane', date: '2026-06-03' }], 'approved').decided).toBe(1)
    ELOG.rows.length = 0
    expect(clearCells([{ personId: 'bane', date: '2026-06-03' }]).written).toBe(1)
    const gone = othersOn('bane')
    expect(gone.length, 'one line for the approved leave the admin deleted').toBeGreaterThan(0)
    expect(gone.every(r => r.fld === 'deleted' && r.itype === 'LL')).toBe(true)
    /* a member bids only on open days from today (D1177, D1211): the seed opens January to March */
    setMemberTodayForTests('2026-02-02')
    ranger()
    expect(setCell('bane', '2026-03-02', 'LL')).toBe(true)
    ELOG.rows.length = 0
    expect(setCell('bane', '2026-03-02', '')).toBe(true)
    expect(othersOn('bane')).toEqual([])
    expect(lines().some(r => r.fld === 'withdrawn')).toBe(true)
  })
})
