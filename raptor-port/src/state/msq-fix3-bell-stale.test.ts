// @vitest-environment jsdom
/* R1 OF THE SECOND HALF'S FINAL READS (docs/superpowers/briefs/2026-11-23-msq-b1-final-read-opus.md finding 1): the bell's
   "Show" switch could go dead for good. Saber makes 150 and switches it on in his bell; Undo takes "+ New squadron" back
   (a bell switch is no Undo step); every later press — 149 off, say — was refused ("a bell switch that will not read"),
   because the writer (state/bellsqn.ts setBellSquadron) carried 150's id over and the gate (state/perms.ts
   bellSqnRowViolation) refuses an id not in the store. Now the writer drops the ids of squadrons no longer in the store
   (the press's silence: ui/msq-fix3-bell-refused.test.tsx). Red first: the save was refused. */
import { describe, it, expect } from 'vitest'
import { act } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'
import { addUnit, placeOfOn, todayIso, units, unitsLoad } from './units'
import { setBellSquadron, bellShows, bellChoices } from './bellsqn'
import { globalUndo } from '../undo/timeline'

useMsqWorld()

describe('the bell switch after the squadron it named is undone away (R1)', () => {
  it('still saves, and the undone squadron\'s id leaves his row', async () => {
    signInAs('saber')
    const r: any = addUnit('150', placeOfOn('u142', todayIso())!.id, ACCT.hunter)
    expect(r.ok).toBe(true)
    expect(setBellSquadron(r.id, true)).toBe(true)
    await act(async () => { expect(globalUndo().ok).toBe(true) })
    unitsLoad()
    expect(units().some(u => u.id === r.id)).toBe(false)
    expect(setBellSquadron('u149', false)).toBe(true)
    expect(bellShows(PID.saber, 'u149')).toBe(false)
    expect(Object.keys(bellChoices(PID.saber))).not.toContain(r.id)
  })
})
