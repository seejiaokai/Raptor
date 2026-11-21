// @vitest-environment jsdom
/* FABLE F2 — the master mark's door lets through what the last-admin gate refuses (the B3 shape; Piece C).
   150 is new, Hunter its only admin (his Plan). Saber makes Hunter a master admin. The one rule never counts a master
   admin as a Plan holder (lastadmin.ts), so the gate refuses the step as leaving 150 with no admin — but setMaster never
   asks the lock, so the screen says "That did not save". RED while the door does not say the lock's words. */
import { describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import { setMaster, updateAccount } from './accounts'
import { addUnit } from './units'

useMsqWorld()
describe('F2 — Saber makes Hunter, the only admin of 150 (by Plan), a master admin', () => {
  it('the door and the gate agree: saved, or refused in the lock\'s own words — never "That did not save"', () => {
    signInAs('saber')
    expect(addUnit('150', 'p1', ACCT.hunter).ok).toBe(true)
    const lockWords = updateAccount(ACCT.hunter, { on: false })   // the words every other door says for this lock
    expect(lockWords).toBe("Hunter is 150's last admin. Make another admin of 150 first.")
    const r = setMaster(ACCT.hunter, true)
    expect(r.ok || r.message === lockWords, JSON.stringify(r)).toBe(true)
  })
  it('(control) with no squadron resting on his Plan, the mark is given', () => {
    signInAs('saber')
    expect(setMaster(ACCT.hunter, true)).toEqual({ ok: true })
  })
})
