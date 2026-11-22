// @vitest-environment jsdom
/* fable2 — the Undo of a right GIVEN is a right taken away: does it say the lock's words, and does it jam the list? */
import { describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT, on } from '../test-support/msq-world'
import { updateAccount, levelIn, accountsLoad } from './accounts'
import { addUnit, setGrant, removeGrant, setHome, unitRows, unitsLoad, todayIso } from './units'
import { archivePerson } from '../leavewar/sync'
import { globalUndo, globalRedo, undoState } from '../undo/timeline'

useMsqWorld()

describe('fable2 — Undo of a giving that would leave a squadron no admin', () => {
  it('Saber gives Kestrel Plan of 150, archives Hunter (its first admin), presses Undo', () => {
    signInAs('saber')
    /* an older step of his, to see whether the list is jammed behind the refused one */
    expect(updateAccount(ACCT.ranger, { on: false })).toBeNull()
    const r = addUnit('150', 'p1', ACCT.hunter)
    expect(r.ok, JSON.stringify(r)).toBe(true)
    const u = r.id!
    expect(setGrant(ACCT.kestrel, u, 'admin', PID.kestrel).ok).toBe(true)
    const arch = archivePerson(PID.hunter)
    expect(arch.bad, JSON.stringify(arch)).toBeNull()
    unitsLoad(); accountsLoad()
    expect(levelIn(ACCT.kestrel, u, todayIso())).toBe('admin')
    const und1 = globalUndo() as any
    console.log('UNDO1', JSON.stringify({ ok: und1.ok, reason: und1.reason }))
    unitsLoad()
    expect(levelIn(ACCT.kestrel, u, todayIso()), 'Kestrel keeps Plan — 150 must keep an admin').toBe('admin')
    const und2 = globalUndo() as any
    console.log('UNDO2', JSON.stringify({ ok: und2.ok, reason: und2.reason }))
    console.log('STATE', JSON.stringify(undoState()))
    expect(und1.reason, 'the lock’s words').toMatch(/Kestrel is 150's last admin/)
  })
  it('Redo of a removal that has since become the last: Saber removes Hunter’s Plan (Kestrel holds one), Undo, archives Kestrel… Redo', () => {
    signInAs('saber')
    const r = addUnit('150', 'p1', ACCT.hunter)
    const u = r.id!
    expect(setGrant(ACCT.kestrel, u, 'admin', PID.kestrel).ok).toBe(true)
    expect(removeGrant(ACCT.hunter, u).ok).toBe(true)
    expect((globalUndo() as any).ok).toBe(true)
    unitsLoad()
    /* Kestrel's Plan taken (Hunter holds one again) — a new step, on another record */
    expect(removeGrant(ACCT.kestrel, u).ok).toBe(true)
    const red = globalRedo() as any
    console.log('REDO', JSON.stringify({ ok: red.ok, reason: red.reason }))
    unitsLoad()
    expect(levelIn(ACCT.hunter, u, todayIso())).toBe('admin')
    expect(red.reason).toMatch(/Hunter is 150's last admin/)
  })
})
