/* A wave's In-time / Rally lines dragged into order on the Scheduler Board, and ordered by Auto sort and Sort all
   (owner D593, D594, 5 Oct 26). The lines are one stored list behind one text key (`it:di.gi`), so a move is that
   key's own change: a published day reads it pending, and dragging back to the issued order nets to nothing. The
   order moves nothing worked out (D506). */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { SCHED, signOf, setDayApproved, dayDelta, dayHasChanges } from './publish'
import { applyMove, moveInTime, sortInTimes, sortDay } from './reorder'
import { reportingSortKeys, resolveReporting } from './reporting'
import { parseHM } from './time'
import { ridKey } from './rowids'
import { elogClear, elogRows } from './editlog'
const rk = (k: string) => ridKey(k, DAYS)

const D0 = JSON.parse(JSON.stringify(DAYS[0]))
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
beforeEach(() => {
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}
  DAYS[0] = JSON.parse(JSON.stringify(D0))
})
const wave = (intimes: string[], formations: any[] = [{ cs: 'VIPER', msn: 'BFM', to: '09:00', ld: '10:00', aircraft: [{ p: '', w: '' }] }]) => {
  DAYS[0].waves = [{ label: 'WAVE 1', intimes, traffic: [], formations }]
  return DAYS[0].waves[0]
}

describe('dragging an In-time / Rally line (D593)', () => {
  it('a move inside one wave reorders its lines and marks the wave’s line list', () => {
    const w = wave(['07:00H: IN TIME + WX/NOTAMS', '07:30H: RALLY'])
    expect(applyMove('mv:it.0.0.1', 'mv:it.0.0.0')).toBe(true)
    expect(w.intimes).toEqual(['07:30H: RALLY', '07:00H: IN TIME + WX/NOTAMS'])
    expect(SCHED.pending[rk('it:0.0')], 'the list is marked as one field').toBeTruthy()
  })
  it('a drop on another wave or another day is refused, and nothing moves', () => {
    const w = wave(['07:00H: IN TIME', '07:30H: RALLY'])
    DAYS[0].waves.push({ label: 'WAVE 2', intimes: ['12:00H: IN TIME'], traffic: [], formations: [] })
    expect(applyMove('mv:it.0.0.1', 'mv:it.0.1.0')).toBe(false)
    expect(applyMove('mv:it.0.0.1', 'mv:it.1.0.0')).toBe(false)
    expect(moveInTime(0, 0, 0, 5), 'past the end').toBe(false)
    expect(w.intimes).toEqual(['07:00H: IN TIME', '07:30H: RALLY'])
    expect(SCHED.pending[rk('it:0.0')]).toBeFalsy()
  })
  it('D506: the order changes nothing worked out — the same report time either way', () => {
    const w = wave(['07:30H: RALLY', '07:00H: IN TIME'])
    const before = resolveReporting(w, w.formations[0], parseHM('09:00')!)
    moveInTime(0, 0, 1, 0)
    const after = resolveReporting(w, w.formations[0], parseHM('09:00')!)
    expect([after.inTime, after.rally, after.report]).toEqual([before.inTime, before.rally, before.report])
  })
  it('on a published day the new order is a pending change, and dragging back nets to nothing (D594)', () => {
    wave(['07:00H: IN TIME', '07:30H: RALLY'])
    sign(0); setDayApproved(0, true)
    expect(dayHasChanges(0), 'published clean').toBe(false)
    moveInTime(0, 0, 1, 0)
    expect(dayDelta(0).some((e: any) => String(e.addr || e.key || '').startsWith('it:0.0')), 'pending on its own list').toBe(true)
    expect(dayHasChanges(0)).toBe(true)
    moveInTime(0, 0, 1, 0)
    expect(dayHasChanges(0), 'back to the issued order').toBe(false)
  })
})

describe('Auto sort and Sort all order the lines by time (D594)', () => {
  it('earliest first, an evening-before clock before the same day’s, a line with no clock last', () => {
    const w = wave(['07:00H: IN TIME', 'RALLY AFTER IN TIME', '06:30H: RALLY', '22:30H: IN TIME VIPER'],
      [{ cs: 'VIPER', msn: 'BFM', to: '01:00', ld: '02:00', aircraft: [{ p: '', w: '' }] }])
    /* to 01:00 — 22:30 is the evening before; 06:30 and 07:00 are later than the take-off, so they too read as the
       evening before by the same reader (D503), and keep their order by clock */
    expect(reportingSortKeys(w)).toEqual([420 - 1440, null, 390 - 1440, 1350 - 1440])
    expect(sortInTimes(0, 0)).toBe(true)
    expect(w.intimes).toEqual(['06:30H: RALLY', '07:00H: IN TIME', '22:30H: IN TIME VIPER', 'RALLY AFTER IN TIME'])
  })
  it('a morning wave: the evening-before line first, then the morning clocks, no clock last', () => {
    const w = wave(['07:30H: RALLY', 'NOTE ONLY', '21:00H: IN TIME', '07:00H: IN TIME'])
    expect(sortInTimes(0, 0)).toBe(true)
    expect(w.intimes).toEqual(['21:00H: IN TIME', '07:00H: IN TIME', '07:30H: RALLY', 'NOTE ONLY'])
    expect(SCHED.pending[rk('it:0.0')]).toBeTruthy()
  })
  it('a wave already in order is left alone and marks nothing; one line has nothing to order', () => {
    wave(['07:00H: IN TIME', '07:30H: RALLY'])
    expect(sortInTimes(0, 0)).toBe(false)
    expect(SCHED.pending[rk('it:0.0')]).toBeFalsy()
    wave(['07:00H: IN TIME'])
    expect(sortInTimes(0, 0)).toBe(false)
  })
  it('Sort all (sortDay) orders the lines with the rest of the day', () => {
    const w = wave(['07:30H: RALLY', '07:00H: IN TIME'])
    expect(sortDay(0)).toBe(true)
    expect(w.intimes).toEqual(['07:00H: IN TIME', '07:30H: RALLY'])
  })
  /* the batch's check (19 Oct 26 — the scenario designer's S1-08): Sort all writes ONE history line for the day
     ("Every section on … sorted", ui/board.ts sortAllCommit), its sorters marking without a line — the In-time sort
     wrote one of its own beside it */
  it('a sort writes no history line of its own — the sort that called it says what it did', () => {
    wave(['07:30H: RALLY', '07:00H: IN TIME'])
    elogClear()
    expect(sortDay(0)).toBe(true)
    expect(elogRows(0).length, 'no line from the sorters').toBe(0)
    expect(SCHED.pending[rk('it:0.0')], 'the list is still marked (a published day reads it pending)').toBeTruthy()
  })
  it('a line naming a formation reads its clock against that formation’s own take-off', () => {
    const w = wave(['21:00H: IN TIME LATE', '05:00H: IN TIME EARLY'],
      [{ cs: 'EARLY', to: '07:00', ld: '08:00', aircraft: [] }, { cs: 'LATE', to: '23:00', ld: '23:50', aircraft: [] }])
    /* 21:00 is before LATE's 23:00 take-off — the same day, after EARLY's 05:00 */
    expect(reportingSortKeys(w)).toEqual([1260, 300])
    expect(sortInTimes(0, 0)).toBe(true)
    expect(w.intimes).toEqual(['05:00H: IN TIME EARLY', '21:00H: IN TIME LATE'])
  })
})
