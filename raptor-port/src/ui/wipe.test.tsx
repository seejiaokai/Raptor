/* Pins for clearHistoryBefore — the Admin → Data "clear old data" sweep
   (owner, 25 Aug 26). The doctrine walk, each as an assertion:
   - deletion FAILS CLOSED: unreadable dates are kept, and a span touching or
     crossing the cutoff is kept whole;
   - the member gate holds at the write path, not just the page;
   - a dry run counts without deleting;
   - the inputs/pucks/titles sweep is ONE undo step;
   - a stashed past week is dropped, the cutoff's own week is kept. */
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, setSession, notify } from '../state/store'
import { INPUTS } from '../engine/inputs'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { stashPut, stashHas, stashClear } from '../engine/weekstash'
import { undo } from '../state/history'
import { clearHistoryBefore } from './inputedit'

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
