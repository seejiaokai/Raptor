/* @vitest-environment jsdom */
/* THE WEEK SELECTOR ACTUALLY SWITCHES WEEKS (owner, 21 Aug 26). loadWeek swaps
   the loaded week's DAYS and DATES and resets everything keyed to the old week
   (publish/AL state, history baseline). The two things that would be silent
   corruption if they regressed are pinned here: no per-day publish state may
   bleed from one week onto the next's identical indices, and Undo may not cross
   a week boundary.
   INPUTS is GLOBAL since 22 Aug 26 (owner — "show all inputs regardless of which
   week I am selected on"): it is NOT swapped with the week, so every week's
   inputs stay present; each week's SCHEDULE still shows only its own because the
   day builders match by date. That global-ness is pinned below too. */
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, loadWeek } from './store'
import { DAYS } from '../engine/data'
import { DATES, INPUTS, inputCoversDate } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { HIST } from './history'

beforeEach(() => { initStore(); loadWeek('13/07/2026') })

describe('loadWeek', () => {
  it('loads the authored second week (Jul 20)', () => {
    loadWeek('20/07/2026')
    expect(DAYS.length).toBe(7)
    expect(DAYS[0].dt).toBe('Jul 20')
    expect(DATES[0]).toBe('Jul 20')
    expect(DATES[6]).toBe('Jul 26')
    // week-2's own inputs land on it — the Thu medical downchit
    expect(INPUTS.some((r: any) => r.person === 'bruise' && r.type === 'OML')).toBe(true)
  })

  it('a non-authored chip loads a blank, editable seven-day week', () => {
    loadWeek('29/06/2026')
    expect(DAYS.length).toBe(7)
    expect(DAYS[0].dt).toBe('Jun 29')
    expect(DAYS[6].dt).toBe('Jul 5')
    expect(DAYS.every((d: any) => (d.waves || []).length === 0)).toBe(true)
    // INPUTS is global, so it is NOT emptied — but none of its rows fall on this
    // blank week's dates, so the week itself shows no personal input
    expect(INPUTS.length).toBeGreaterThan(0)
    expect(INPUTS.some((r: any) => DATES.some((dt: any) => inputCoversDate(r, dt)))).toBe(false)
  })

  it('personal inputs are GLOBAL — every week\'s inputs are present whichever week is loaded', () => {
    // week 1's divot and week 2's Vapor both sit in INPUTS on the seed week…
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(true)
    expect(INPUTS.some((r: any) => r.person === 'vegas')).toBe(true)
    // …and still both after switching to week 2 and to a blank week
    loadWeek('20/07/2026')
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(true)
    expect(INPUTS.some((r: any) => r.person === 'vegas')).toBe(true)
    loadWeek('29/06/2026')
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(true)
    expect(INPUTS.some((r: any) => r.person === 'vegas')).toBe(true)
  })

  it('the seed week reloads clean, its dates tracking it', () => {
    loadWeek('20/07/2026')
    loadWeek('13/07/2026')
    expect(DAYS[0].dt).toBe('Jul 13')
    expect(DATES[0]).toBe('Jul 13')
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(true)   // a seed-week row
  })

  it('no publish state bleeds across a switch (day-index keyed)', () => {
    loadWeek('20/07/2026')
    SCHED.dayOK[0] = true            // approve Monday on week 2
    SCHED.pending['x'] = 1
    loadWeek('13/07/2026')
    expect(SCHED.dayOK[0]).toBeFalsy()
    expect(Object.keys(SCHED.pending).length).toBe(0)
    expect(SCHED.als.length).toBe(0)
  })

  it('history re-baselines on a switch — Undo cannot cross weeks', () => {
    loadWeek('20/07/2026')
    expect(HIST.stack.length).toBe(1)
    expect(HIST.ix).toBe(0)
  })
})
