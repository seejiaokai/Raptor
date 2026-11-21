// @vitest-environment jsdom
/* THE INPUTS PAGE'S LISTS AND FILTER — three proofs of the full review, copied word for word from
   docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/ (c-c01-leave-across-move-lists, c-c02-own-input-after-move-vanishes,
   c-c11-inputs-filter-other-squadron), only the harness changed (test-support/msq-world.ts — the world boots itself, so
   each proof's `boot()` goes; its `at` sets the clock as before) and, where the proof stood for the page by a call the
   reshape replaces, that call (§9.1, §0): "the Inputs page's rows" is the page's own `inputsPageRows()` (it read
   `inputsFor(myUnit())`), and "the Person filter's people" its own `inputsFilterPeople()` (it read `rosterOptions()`).
   Every assertion stands word for word. Red on the page as it was (its rows `inputsFor(myUnit())`, its filter the unit
   in view's), green once the page lists `inputsListed(pageUnit('own'), me())` and its filter reads `pageUnit('own')`
   (the reshape plan §3.3 C1's list half, C2, C11). */
import { describe, expect, it } from 'vitest'
import { INPUTS, inputBelongs } from '../engine/inputs'
import { writeInputsBatch } from '../state/store'
import { setHome, homeOn } from '../state/units'
import { myUnit } from '../state/perms'
import { UNIT } from '../engine/unitview'
import { rosterOptions } from './inputedit'
import { inputsPageRows, inputsFilterPeople } from './InputsPage'
import { useMsqWorld as useWorld, at, signInAs } from '../test-support/msq-world'

useWorld()

describe('C1 — a leave across a move', () => {
  it("is on the Inputs list of the squadron it governs after the move (149's admin can find it)", () => {
    at('2026-07-12')
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(homeOn('bane', '2026-07-12')).toBe('u142')
    expect(homeOn('bane', '2026-07-14')).toBe('u149')
    const rec: any = { person: 'bane', date: 'Jul 10', endDate: 'Jul 20', yr: 2026, allday: true, type: 'LL', remarks: 'across', by: 'bane', at: Date.now(), iid: 'c01', ord: 99901 }
    INPUTS.push(rec)
    signInAs('ad9', 'a9')
    expect(myUnit()).toBe('u149')
    /* control: 149's schedule day reads it */
    expect(inputBelongs(rec, 'u149', '2026-07-14'), "149's Tuesday shows him away").toBe(true)
    /* the Inputs page's rows, its month and its Deleted group all read inputsFor(myUnit()) with no date */
    expect(inputsPageRows().some((r: any) => r.iid === 'c01'), "149's Inputs list shows the leave").toBe(true)
  })
})

describe('C2 — his own input after his move', () => {
  it('is on his own Inputs page the moment he files it', () => {
    at('2026-07-14')
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)          // 149's from 15 Jul
    signInAs('us', 'us')                                      // bane himself
    expect(myUnit()).toBe('u142')
    const ok = writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 20', endDate: 'Jul 21', yr: 2026, allday: true, type: 'LL', remarks: 'mine', by: 'bane', at: Date.now(), iid: 'c02', ord: 99902 } as any) })
    expect(ok, 'the gate lets him file it').toBeTruthy()
    expect(INPUTS.some((r: any) => r.iid === 'c02')).toBe(true)
    expect(inputsPageRows().some((r: any) => r.iid === 'c02'), 'his own Inputs page lists it').toBe(true)
  })
})

describe('C11 — the Person filter across the midnight of his move', () => {
  it("lists the same squadron's people as the rows", () => {
    at('2026-07-14', 22)
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)            // 149's from 15 Jul
    signInAs('us', 'us')                                      // bane, 22:00 on the 14th
    expect(UNIT).toBe('u142'); expect(myUnit()).toBe('u142')
    at('2026-07-15', 1)                                       // the page left open past midnight
    expect(myUnit(), 'the rows now read 149').toBe('u149')
    /* InputsPage.tsx: `people()` = rosterOptions() (default UNIT) for the filter; rows = inputsFor(myUnit()) */
    expect(inputsFilterPeople().sort(), "the filter's people").toEqual(rosterOptions(myUnit()).sort())
  })
})
