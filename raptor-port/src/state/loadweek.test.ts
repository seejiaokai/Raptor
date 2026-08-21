/* @vitest-environment jsdom */
/* THE WEEK SELECTOR ACTUALLY SWITCHES WEEKS (owner, 21 Aug 26). loadWeek swaps
   the whole loaded week — DAYS, DATES, INPUTS — and resets everything keyed to
   the old week (publish/AL state, history baseline). The two things that would
   be silent corruption if they regressed are pinned here: no per-day publish
   state may bleed from one week onto the next's identical indices, and Undo may
   not cross a week boundary. */
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, loadWeek } from './store'
import { DAYS } from '../engine/data'
import { DATES, INPUTS } from '../engine/inputs'
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
    // its own inputs travel with it — the Thu medical downchit
    expect(INPUTS.some((r: any) => r.person === 'bruise' && r.type === 'OML')).toBe(true)
  })

  it('a non-authored chip loads a blank, editable seven-day week', () => {
    loadWeek('29/06/2026')
    expect(DAYS.length).toBe(7)
    expect(DAYS[0].dt).toBe('Jun 29')
    expect(DAYS[6].dt).toBe('Jul 5')
    expect(DAYS.every((d: any) => (d.waves || []).length === 0)).toBe(true)
    expect(INPUTS.length).toBe(0)
  })

  it('the seed week reloads clean, its dates and inputs tracking it', () => {
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
