/* R1's AND R7's REFUSAL WORDS — his D2248 (R7's, replaced by D2250 the same day) and D2249 (21 Nov 26, "As proposed", to chat 128's questions page
   docs/mock/2026-11-21-msq-r1-r7/). The rules themselves were built by the reshape's Piece B (the reshape plan §19b R1, R7;
   their tests in state/piece-b-tables.test.ts); until his answer each door refused in the generic "This change could not
   be saved.". Red on the generic words, green with his. */
import { describe, expect, it } from 'vitest'
import { useMsqWorld, PID, ACCT, signInAs } from '../test-support/msq-world'
import { setGrant, setHome } from './units'
import { updateAccount } from './accounts'

useMsqWorld()

/* his D2250 (21 Nov 26) replaced D2248 the same day: R7's refusal and its words are gone — his own squadron's admin is not
   refused; another squadron's admin keeps the words every account change of another squadron gets */
describe("R7 — a Plan holder made a member (D2250, replacing D2248's words)", () => {
  it("Ranger, a plain admin of 142, makes Hunter (Plan of 149) a member: no refusal", () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    signInAs('ranger')
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
  })
  it("(control) Kestrel, 149's admin: the other squadron's words", () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    signInAs('kestrel')
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBe("He is 142's. Only an admin of 142 can change his account.")
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
