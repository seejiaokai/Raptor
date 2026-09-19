/* Pins for the Admin → Data sweeps (owner, 25 Aug 26). The doctrine walk,
   each as an assertion:
   - deletion FAILS CLOSED: unreadable dates are kept, and a span touching or
     crossing the period's edge is kept whole;
   - the member gate holds at the write path, not just the page;
   - a dry run counts without deleting;
   - the inputs/pucks/titles sweep is ONE undo step;
   - a stashed past week is dropped, a week the period's edge lands in is kept.
   Widened the same day to the full period grammar — 'before' a date, 'on' one
   date, a 'range' inclusive of both ends — and to the edit-history sweep,
   which clears by WHEN the edit was made and never touches the schedule. */
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, setSession, notify } from '../state/store'
import { INPUTS } from '../engine/inputs'
import { PLANPUCKS, DAYRMK, addPlanPuck } from '../state/plan'
import { stashPut, stashHas, stashClear } from '../engine/weekstash'
import { ELOG, elogClear } from '../engine/editlog'
import { undo } from '../state/history'
import { clearHistoryBefore, clearHistoryData, clearEditHistory } from './inputedit'

/* CLUTTER-ONLY (owner, 13 Sep 26 — [SYNC-INTEG] P4). "Clear old data" removes
   only past calendar pucks and day titles. It NEVER deletes a leave/medical/duty
   input (so a balance never moves), NEVER drops a stashed week, and NEVER touches
   the currently-loaded week. The loaded week after initStore() is 13/07/2026
   (Jul 13–19), so a puck/title on those days is excluded even when the window
   covers it. Pucks are built through addPlanPuck so they carry the real `date`
   field (SYNC-004: the old sweep read a `.iso` field real pucks never have). */
const seed = () => {
  INPUTS.length = 0
  INPUTS.push(
    { person: 'divot', type: 'LL', date: 'Jan 5', yr: 2026, remarks: '' },                      // past — MUST be kept (no input is ever cleared)
    { person: 'krait', type: 'LL', date: 'Feb 27', endDate: 'Mar 3', yr: 2026, remarks: '' },
    { person: 'ranger', type: 'MA', date: 'Jul 14', yr: 2026, remarks: '' },
    { person: 'outlaw', type: 'LL', date: 'garbled', yr: 2026, remarks: '' },
  )
  PLANPUCKS.length = 0
  addPlanPuck('2026-01-10', 'old note')       // past clutter — cleared
  addPlanPuck('2026-07-15', 'loaded-week note') // on the loaded week (Jul 13–19) — never touched
  addPlanPuck('2026-08-20', 'future note')    // after — kept
  for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  DAYRMK['2026-01-11'] = 'old title'          // past clutter — cleared
  DAYRMK['2026-07-16'] = 'loaded-week title'  // on the loaded week — never touched
  DAYRMK['2026-08-21'] = 'future title'       // after — kept
  stashClear()
  stashPut('05/01/2026', '{"d":[]}')   // a past stashed week — NEVER dropped by the clutter sweep
}

const puckAt = (iso: string) => PLANPUCKS.some((s: any) => s.date === iso)

beforeEach(() => {
  initStore()
  setSession({ user: 'a', role: 'admin' })
  seed()
  notify()
})

describe('clear old clutter before a date', () => {
  it('a member cannot clear anything, whatever the page shows', () => {
    setSession({ user: 'user', role: 'main' })
    expect(clearHistoryBefore('2026-03-01')).toBe(0)
    expect(PLANPUCKS.length).toBe(3)
  })

  it('a dry run counts only pucks + titles — never inputs or weeks', () => {
    const n = clearHistoryBefore('2026-03-01', true)
    expect(n).toBe(2) // the Jan puck + the Jan title; NOT the input, NOT the week
    expect(INPUTS.length).toBe(4)
    expect(PLANPUCKS.length).toBe(3)
    expect(stashHas('05/01/2026')).toBe(true)
  })

  it('clears past pucks and titles; never an input, a balance, or a stashed week', () => {
    expect(clearHistoryBefore('2026-03-01')).toBe(2)
    // gone: the January puck and title (SYNC-004: real .date pucks ARE selected)
    expect(puckAt('2026-01-10')).toBe(false)
    expect(DAYRMK['2026-01-11']).toBeUndefined()
    // KEPT: every input (no leave/medical/duty is ever cleared → no balance moves)
    expect(INPUTS.length).toBe(4)
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(true)
    // KEPT: the stashed past week is never dropped
    expect(stashHas('05/01/2026')).toBe(true)
    // KEPT: the future puck/title
    expect(puckAt('2026-08-20')).toBe(true)
    expect(DAYRMK['2026-08-21']).toBe('future title')
  })

  it('a malformed OR impossible date clears nothing (fails closed)', () => {
    expect(clearHistoryBefore('')).toBe(0)
    expect(clearHistoryBefore('01/03/2026')).toBe(0)   // wrong format
    expect(clearHistoryBefore('2026-02-31')).toBe(0)   // SYNC-006: impossible day
    expect(clearHistoryBefore('2026-13-01')).toBe(0)   // impossible month
    expect(clearHistoryBefore('2025-02-29')).toBe(0)   // 29 Feb, non-leap
    expect(PLANPUCKS.length).toBe(3)
  })

  it('one Undo brings the pucks and titles back', () => {
    clearHistoryBefore('2026-03-01')
    expect(puckAt('2026-01-10')).toBe(false)
    undo()
    expect(puckAt('2026-01-10')).toBe(true)
    expect(DAYRMK['2026-01-11']).toBe('old title')
  })
})

describe('clear old clutter on one date or in a range', () => {
  it('a specific date takes only the puck/title wholly on that date, never the input', () => {
    // The Jan 10 puck is on the 10th; the Jan 5 input stays (inputs are never cleared)
    expect(clearHistoryData('on', '2026-01-10')).toBe(1)
    expect(puckAt('2026-01-10')).toBe(false)
    expect(INPUTS.length).toBe(4)
    expect(stashHas('05/01/2026')).toBe(true)
  })

  it('a range clears its pucks + titles either way round, keeping inputs and weeks', () => {
    expect(clearHistoryData('range', '2026-01-15', '2026-01-01', true)).toBe(2)   // reversed dates swap
    expect(clearHistoryData('range', '2026-01-01', '2026-01-15')).toBe(2)
    expect(puckAt('2026-01-10')).toBe(false)
    expect(DAYRMK['2026-01-11']).toBeUndefined()
    expect(INPUTS.length).toBe(4)                 // inputs untouched
    expect(stashHas('05/01/2026')).toBe(true)     // stash untouched
  })

  it('NEVER touches the currently-loaded week, even when the window covers it', () => {
    // A wide range spanning the loaded week (Jul 13–19): its puck/title stay.
    const n = clearHistoryData('range', '2026-01-01', '2026-12-31')
    expect(puckAt('2026-07-15')).toBe(true)       // loaded-week puck kept
    expect(DAYRMK['2026-07-16']).toBe('loaded-week title')
    // …while past + future clutter outside the loaded week is cleared.
    expect(puckAt('2026-01-10')).toBe(false)
    expect(puckAt('2026-08-20')).toBe(false)
    expect(n).toBe(4)                             // Jan puck+title + Aug puck+title
    expect(INPUTS.length).toBe(4)                 // still no input touched
  })

  it('a range missing its second date clears nothing', () => {
    expect(clearHistoryData('range', '2026-01-01', '')).toBe(0)
    expect(PLANPUCKS.length).toBe(3)
  })

  it('the member gate holds for every mode', () => {
    setSession({ user: 'user', role: 'main' })
    expect(clearHistoryData('on', '2026-01-10')).toBe(0)
    expect(clearHistoryData('range', '2026-01-01', '2026-12-31')).toBe(0)
    expect(PLANPUCKS.length).toBe(3)
  })
})

describe('clear the edit history', () => {
  /* rows stamped at LOCAL noon, because the sweep works in local calendar
     days — the dates the History list prints */
  const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12).getTime()
  const row = (t: number, lbl: string) => ({ t, who: 'BANE', di: null, key: '', lbl, from: '', to: '' })
  beforeEach(() => {
    elogClear()
    ELOG.rows.push(row(at(2026, 1, 5), 'january'), row(at(2026, 3, 1), 'march'), row(at(2026, 7, 14), 'july'))
  })

  it('older-than clears strictly before the date, and logs the clearing', () => {
    expect(clearEditHistory('before', '2026-03-01')).toBe(1)
    const lbls = ELOG.rows.map(r => r.lbl)
    expect(lbls).not.toContain('january')
    expect(lbls).toContain('march')                 // made ON the date — not older than it
    expect(lbls.some(l => /^Edit history cleared — 1 entry/.test(l))).toBe(true)
  })

  it('a specific date clears just that day', () => {
    expect(clearEditHistory('on', '2026-03-01')).toBe(1)
    const lbls = ELOG.rows.map(r => r.lbl)
    expect(lbls).toContain('january')
    expect(lbls).not.toContain('march')
  })

  it('a range clears whole days, both ends inclusive', () => {
    expect(clearEditHistory('range', '2026-01-05', '2026-07-14')).toBe(3)
    expect(ELOG.rows.length).toBe(1)                // only the record of the clearing itself
    expect(ELOG.rows[0]!.lbl).toMatch(/^Edit history cleared — 3 entries/)
  })

  it('a dry run counts without deleting, and logs nothing', () => {
    expect(clearEditHistory('before', '2026-12-31', '', true)).toBe(3)
    expect(ELOG.rows.length).toBe(3)
  })

  it('a member cannot clear the log, and the schedule is never touched', () => {
    setSession({ user: 'user', role: 'main' })
    expect(clearEditHistory('before', '2026-12-31')).toBe(0)
    expect(ELOG.rows.length).toBe(3)
    setSession({ user: 'a', role: 'admin' })
    clearEditHistory('before', '2026-12-31')
    expect(INPUTS.length).toBe(4)                   // the data sweep's world, untouched
    expect(PLANPUCKS.length).toBe(3)
  })
})
