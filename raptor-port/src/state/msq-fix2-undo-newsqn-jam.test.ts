// @vitest-environment jsdom
/* fable2 — the Undo of "+ New squadron" once its first admin has moved in: can never pass; is it said once and passed over? */
import { describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT, on } from '../test-support/msq-world'
import { updateAccount, accountsLoad, accountById } from './accounts'
import { addUnit, setHome, unitsLoad, unitRows } from './units'
import { globalUndo, undoState } from '../undo/timeline'

useMsqWorld()

describe('fable2 — "+ New squadron" undone after its first admin has moved in', () => {
  it('Saber: suspends Ranger; + New squadron 150 (Hunter); moves Hunter in; next day presses Undo three times', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.ranger, { on: false })).toBeNull()
    const r = addUnit('150', 'p1', ACCT.hunter)
    expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(setHome(PID.hunter, r.id!)).toMatchObject({ ok: true })
    on(16); unitsLoad(); accountsLoad()
    const a = globalUndo() as any
    console.log('UNDO-A', JSON.stringify({ ok: a.ok, reason: a.reason }))
    const b = globalUndo() as any
    console.log('UNDO-B', JSON.stringify({ ok: b.ok, reason: b.reason }))
    const c = globalUndo() as any
    console.log('UNDO-C', JSON.stringify({ ok: c.ok, reason: c.reason }))
    console.log('STATE', JSON.stringify(undoState()))
    unitsLoad(); accountsLoad()
    expect(unitRows().units.some(x => x.id === r.id), 'the squadron stays — a man is at home in it').toBe(true)
    /* the third press reaches his older step (Ranger's suspension), as a step that can never pass is passed over */
    expect(accountById(ACCT.ranger)!.on, 'the older step is reached by the third press').toBe(true)
  })
})
