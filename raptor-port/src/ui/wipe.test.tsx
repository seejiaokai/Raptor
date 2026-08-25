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
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { stashPut, stashHas, stashClear } from '../engine/weekstash'
import { ELOG, elogClear } from '../engine/editlog'
import { undo } from '../state/history'
import { clearHistoryBefore, clearHistoryData, clearEditHistory } from './inputedit'

const seed = () => {
  INPUTS.length = 0
  INPUTS.push(
    { person: 'divot', type: 'LL', date: 'Jan 5', yr: 2026, remarks: '' },                      // wholly before
    { person: 'krait', type: 'LL', date: 'Feb 27', endDate: 'Mar 3', yr: 2026, remarks: '' },   // crosses the cutoff — kept
    { person: 'ranger', type: 'MA', date: 'Jul 14', yr: 2026, remarks: '' },                    // after — kept
    { person: 'outlaw', type: 'LL', date: 'garbled', yr: 2026, remarks: '' },                   // unreadable — kept
  )
  PLANPUCKS.length = 0
  PLANPUCKS.push({ id: 'pp_a', iso: '2026-01-10', text: 'old note' }, { id: 'pp_b', iso: '2026-07-15', text: 'new note' })
  for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  DAYRMK['2026-01-11'] = 'old title'
  DAYRMK['2026-07-16'] = 'new title'
  stashClear()
  stashPut('05/01/2026', '{}')   // week ends Jan 11 — before the cutoff
  stashPut('02/03/2026', '{}')   // week of the cutoff (Mar 1) — kept whole
}

beforeEach(() => {
  initStore()
  setSession({ user: 'a', role: 'admin' })
  seed()
  notify()
})

describe('clear history before a date', () => {
  it('a member cannot clear anything, whatever the page shows', () => {
    setSession({ user: 'user', role: 'main' })
    expect(clearHistoryBefore('2026-03-01')).toBe(0)
    expect(INPUTS.length).toBe(4)
  })

  it('a dry run counts without deleting', () => {
    const n = clearHistoryBefore('2026-03-01', true)
    expect(n).toBe(4) // 1 input + 1 puck + 1 title + 1 stashed week
    expect(INPUTS.length).toBe(4)
    expect(PLANPUCKS.length).toBe(2)
    expect(stashHas('05/01/2026')).toBe(true)
  })

  it('the sweep takes only what is wholly past, and fails closed on bad dates', () => {
    expect(clearHistoryBefore('2026-03-01')).toBe(4)
    // gone: the January input, puck, title, and the January week's memory
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(false)
    expect(PLANPUCKS.some((s: any) => s.id === 'pp_a')).toBe(false)
    expect(DAYRMK['2026-01-11']).toBeUndefined()
    expect(stashHas('05/01/2026')).toBe(false)
    // kept: the span crossing the cutoff, the future rows, the unreadable date,
    // and the cutoff's own week
    expect(INPUTS.some((r: any) => r.person === 'krait')).toBe(true)
    expect(INPUTS.some((r: any) => r.person === 'ranger')).toBe(true)
    expect(INPUTS.some((r: any) => r.person === 'outlaw')).toBe(true)
    expect(PLANPUCKS.some((s: any) => s.id === 'pp_b')).toBe(true)
    expect(DAYRMK['2026-07-16']).toBe('new title')
    expect(stashHas('02/03/2026')).toBe(true)
  })

  it('a malformed or missing date clears nothing', () => {
    expect(clearHistoryBefore('')).toBe(0)
    expect(clearHistoryBefore('01/03/2026')).toBe(0)
    expect(INPUTS.length).toBe(4)
  })

  it('one Undo brings the inputs, pucks and titles back', () => {
    clearHistoryBefore('2026-03-01')
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(false)
    undo()
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(true)
    expect(PLANPUCKS.some((s: any) => s.id === 'pp_a')).toBe(true)
    expect(DAYRMK['2026-01-11']).toBe('old title')
  })
})

describe('clear data on one date or in a range', () => {
  it('a specific date takes only what sits wholly on that date', () => {
    // divot is Jan 5; the Jan 5 stashed WEEK spans Jan 5–11, so it stays
    expect(clearHistoryData('on', '2026-01-05')).toBe(1)
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(false)
    expect(PLANPUCKS.length).toBe(2)
    expect(stashHas('05/01/2026')).toBe(true)
  })

  it('a range takes what is wholly inside, either way round', () => {
    // Jan 1–15 holds: divot (Jan 5), pp_a (Jan 10), the Jan 11 title, and
    // the whole Jan 5–11 stashed week
    expect(clearHistoryData('range', '2026-01-15', '2026-01-01', true)).toBe(4)   // reversed dates swap
    expect(clearHistoryData('range', '2026-01-01', '2026-01-15')).toBe(4)
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(false)
    expect(PLANPUCKS.some((s: any) => s.id === 'pp_a')).toBe(false)
    expect(DAYRMK['2026-01-11']).toBeUndefined()
    expect(stashHas('05/01/2026')).toBe(false)
    expect(stashHas('02/03/2026')).toBe(true)
  })

  it('a span crossing the range edge is kept whole', () => {
    // krait runs Feb 27 – Mar 3, across the range's lower edge — kept; the
    // one thing wholly inside March is the stashed week of Mar 2–8, which goes
    expect(clearHistoryData('range', '2026-03-01', '2026-03-31')).toBe(1)
    expect(INPUTS.some((r: any) => r.person === 'krait')).toBe(true)
    expect(stashHas('02/03/2026')).toBe(false)
  })

  it('a range missing its second date clears nothing', () => {
    expect(clearHistoryData('range', '2026-01-01', '')).toBe(0)
    expect(INPUTS.length).toBe(4)
  })

  it('the member gate holds for every mode', () => {
    setSession({ user: 'user', role: 'main' })
    expect(clearHistoryData('on', '2026-01-05')).toBe(0)
    expect(clearHistoryData('range', '2026-01-01', '2026-12-31')).toBe(0)
    expect(INPUTS.length).toBe(4)
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
    expect(PLANPUCKS.length).toBe(2)
  })
})
