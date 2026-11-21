/* R1's AND R7's REFUSAL WORDS — his D2248 and D2249 (21 Nov 26, "As proposed", to chat 128's questions page
   docs/mock/2026-11-21-msq-r1-r7/). The rules themselves were built by the reshape's Piece B (the reshape plan §19b R1, R7;
   their tests in state/piece-b-tables.test.ts); until his answer each door refused in the generic "This change could not
   be saved.". Red on the generic words, green with his. */
import { describe, expect, it } from 'vitest'
import { useMsqWorld, PID, ACCT, signInAs } from '../test-support/msq-world'
import { setGrant, setHome } from './units'
import { updateAccount } from './accounts'

useMsqWorld()

describe("R7 — a Plan holder made a member by an admin who is not a master admin (D2248)", () => {
  it("Ranger, a plain admin of 142, makes Hunter (Plan of 149) a member: refused in his words", () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    signInAs('ranger')
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBe('Hunter holds Plan of 149. Only a master admin can make him a member.')
  })
  it('(control) Saber, the master admin, makes him a member: it goes through', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
  })
})

describe('R1 — moving yourself, or a master admin, to another squadron (D2249)', () => {
  it('Hunter moves himself to 149: refused in his words', () => {
    signInAs('hunter')
    expect(setHome(PID.hunter, 'u149')).toMatchObject({ ok: false, message: "You can't move yourself to another squadron — ask another admin" })
  })
  it('(control) Hunter moves Saber, the master admin: the existing "Only a master admin can do that"', () => {
    signInAs('hunter')
    expect(setHome(PID.saber, 'u149')).toMatchObject({ ok: false, message: 'Only a master admin can do that' })
  })
})
