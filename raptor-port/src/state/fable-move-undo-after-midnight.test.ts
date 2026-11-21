// @vitest-environment jsdom
/* FABLE F4 — once a move's day has begun its Undo can never pass (D2119), but it is refused on EVERY press in the
   "try again" words and never passed over, so every older step of his is out of reach for good (D148 — his history is
   kept). Saber gives Kestrel View of 142 (step 1), then moves Ranger to 149 (step 2), both on 15 Jul. On 17 Jul he
   presses Undo twice. Correct: the first press says the move can't be undone now and names the step the next press
   takes (timeline.ts sayBlocked, as every step that can never pass); the second undoes step 1. RED while stuck. */
import { describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT, on } from '../test-support/msq-world'
import { levelIn } from './accounts'
import { setGrant, setHome, unitsLoad } from './units'
import { globalUndo } from '../undo/timeline'
import { rosterToday } from '../engine/roster'

useMsqWorld()
describe('F4 — the Undo of a move after its day has begun', () => {
  it('is passed over after being said once; the older step is then undone', () => {
    signInAs('saber')
    expect(setGrant(ACCT.kestrel, 'u142', 'view', PID.kestrel).ok).toBe(true)
    expect(setHome(PID.ranger, 'u149').ok).toBe(true)
    unitsLoad()
    on(17)
    const first = globalUndo() as any
    expect(first.ok).toBe(false)
    expect(first.reason, 'never the "just now" words for a step that can never pass').not.toMatch(/just now/)
    const second = globalUndo() as any
    unitsLoad()
    expect(second.ok, JSON.stringify({ ok: second.ok, reason: second.reason })).toBe(true)
    expect(levelIn(ACCT.kestrel, 'u142', rosterToday()), 'step 1 undone: the View of 142 Kestrel held is gone').toBeNull()
  })
  it('(control) the same day, Undo takes the move back', () => {
    signInAs('saber')
    expect(setHome(PID.ranger, 'u149').ok).toBe(true)
    expect((globalUndo() as any).ok).toBe(true)
  })
})
