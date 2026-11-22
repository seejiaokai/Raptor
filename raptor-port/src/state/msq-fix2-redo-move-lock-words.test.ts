// @vitest-environment jsdom
/* opus2 (blind read, share 2): an Undo / Redo of a step that writes only unit rows (a move) and would leave a squadron
   with no admin — is it said in the lock's words (D2184 Q10, the one words table), or does the gate's refusal reach the
   screen as the generic words? */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { setHome, unitsLoad, homeOn } from './units'
import { updateAccount, accountsLoad } from './accounts'
import { globalUndo, globalRedo } from '../undo/timeline'

useMsqWorld()

describe('opus2 — the Redo of a move that would leave 149 with no admin', () => {
  it('is refused in the lock\'s words, as the move\'s own door says them', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.osprey, { role: 'admin' })).toBeNull()        // 149 has two own admins
    accountsLoad()
    const mv = setHome(PID.kestrel, 'u142'); unitsLoad()
    expect(mv.ok, JSON.stringify(mv)).toBe(true)
    const u = globalUndo(); expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    unitsLoad()
    expect(homeOn(PID.kestrel, '2026-07-16')).toBe('u149')
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()             // Kestrel is 149's last admin now
    accountsLoad()
    /* the move's own door, pressed now, says the lock's words */
    const door = setHome(PID.kestrel, 'u142')
    expect(door.ok).toBe(false)
    expect(door.message).toMatch(/149's last admin/)
    /* the Redo of the very same move */
    const r = globalRedo()
    expect(r.ok).toBe(false)
    expect(homeOn(PID.kestrel, '2026-07-16')).toBe('u149')
    expect(r.reason).toMatch(/149's last admin/)
  })
})
