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
import { autoAcceptInput, unacceptInput, inpKey } from '../engine'
import { stashClear } from '../engine/weekstash'
import { SCHED } from '../engine/publish'
import { HIST } from './history'

/* is this input's ground row currently sitting on some day of the loaded week? */
const landed = (inp: any) =>
  DAYS.some((d: any) => ((d && d.ground) || []).some((g: any) => g.src === inpKey(inp)))

/* INPUTS and the week stash are BOTH module-level session state, and neither
   initStore nor loadWeek wipes them — a real reload discards the module, which
   a test can't. Clear the stash and drop any rows a prior test pushed so each
   test starts from the true first-boot state, not a neighbour's leftovers. */
beforeEach(() => {
  stashClear()
  for (let i = INPUTS.length - 1; i >= 0; i--) if ((INPUTS[i] as any)._t) INPUTS.splice(i, 1)
  initStore()
  loadWeek('13/07/2026')
})

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

  /* A DELIBERATELY UNACCEPTED INPUT STAYS OFF THE GROUND ACROSS A WEEK ROUND-TRIP
     (review fix, 24 Aug 26). A personal activity input auto-lands; a scheduler
     may unaccept it. INPUTS is global and not stashed, so the return-to-week
     auto-land pass used to silently re-land exactly what was removed. The stash
     now remembers which in-week personal rows were left unaccepted and the
     restore skips them. */
  it('an unaccepted personal input does not reappear after leaving the week and coming back', () => {
    // a fresh personal (activity) input on the seed week's Monday, landed on ground
    const inp: any = { person: 'divot', date: 'Jul 13', type: 'Training', allday: false, s: 540, e: 660, _t: true }
    INPUTS.push(inp)
    expect(autoAcceptInput(inp)).toBe(true)
    expect(landed(inp)).toBe(true)
    // the scheduler removes it from the ground programme
    unacceptInput(0, inp)
    expect(landed(inp)).toBe(false)
    // leave the week and come back
    loadWeek('20/07/2026')
    loadWeek('13/07/2026')
    // it must STILL be off the ground — the removal survived the round-trip
    expect(landed(inp), 'the unaccepted row must not be silently re-landed').toBe(false)
    // and the row itself is still a personal input (it was removed from the ground, not deleted)
    expect(INPUTS.some((r: any) => r.person === 'divot' && r.type === 'Training')).toBe(true)
  })

  /* the same round-trip must still LAND a personal input that is brand new since
     the week was last open — the fix skips only rows that were unaccepted here,
     never a row that never had the chance to be. */
  it('a personal input added while away still lands when its week loads', () => {
    // dirty the seed week first so leaving it stashes it — forces the RESTORE
    // path (not the pure-seed path) on return, where the un-guard actually runs
    const kept: any = { person: 'divot', date: 'Jul 13', type: 'Training', allday: false, s: 540, e: 660, _t: true }
    INPUTS.push(kept); autoAcceptInput(kept)
    expect(landed(kept)).toBe(true)
    loadWeek('20/07/2026')                       // leave — week 13 is now stashed
    const inp: any = { person: 'divot', date: 'Jul 13', type: 'Meeting', allday: false, s: 600, e: 720, _t: true }
    INPUTS.push(inp)                             // added while on a different week
    loadWeek('13/07/2026')                       // return via the restore path
    expect(landed(inp), 'a never-unaccepted new input lands on return').toBe(true)
    expect(landed(kept), 'the input already landed here stays landed').toBe(true)
  })
})
