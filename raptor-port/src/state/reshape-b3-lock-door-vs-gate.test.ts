// @vitest-environment jsdom
/* B3 (Fable 3, Opus B4): the last-admin lock is judged for TODAY by the door (accounts.ts lockProblem) and for every
   saved date by the gate (perms.ts lastAdminViolation), so a correct refusal reaches the screen as "That did not save".
   D2184 Q10: "refused at once on the sheet — 'Ranger is 142's last admin. Make another admin of 142 first.'"
   Copied word for word from docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/b-b03-lock-door-vs-gate.test.ts.txt —
   only the harness changed (test-support/msq-world.ts, the same world). Red on the core before Piece C, green after. */
import { describe, expect, it } from 'vitest'
import { useMsqWorld as useWorld, signInAs } from '../test-support/msq-world'
import { updateAccount, accountById, deleteAccountProblem } from '../state/accounts'
import { setHome } from '../state/units'
import { archiveProblem } from '../leavewar/sync'

useWorld()

function setup() {
  signInAs('ad', 'a')                                          // Saber, master
  expect(updateAccount('acus9', { role: 'admin' })).toBeNull() // Osprey a second 149 admin
  expect(setHome('osp9', 'u142').ok).toBe(true)                // Osprey moves to 142 from tomorrow
}

describe('B3 — the lock said in its own words, whatever date it bites on', () => {
  it('Suspend Kestrel (149 has Osprey today, none from tomorrow): the lock sentence, not "That did not save"', () => {
    setup()
    const r = updateAccount('acad9', { on: false })
    expect(accountById('acad9')!.on, 'nothing half-saved').toBe(true)
    expect(r).toMatch(/Kestrel is 149's last admin/)
  })
  it('Demote Kestrel: the lock sentence', () => {
    setup()
    expect(updateAccount('acad9', { role: 'main' })).toMatch(/Kestrel is 149's last admin/)
  })
  it('(control) Archive Kestrel: the lock sentence (archiveProblem asks every date)', () => {
    setup()
    expect(archiveProblem('kes9')).toMatch(/Kestrel is 149's last admin/)
  })
  it("(the delete door, the brief's filed family) Delete Kestrel: the lock sentence", () => {
    setup()
    expect(String(deleteAccountProblem('kes9')), 'null = the door lets it through to the gate').toMatch(/Kestrel is 149's last admin/)
  })
})
