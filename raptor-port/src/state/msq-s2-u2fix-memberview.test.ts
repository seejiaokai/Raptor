// @vitest-environment jsdom
/* U2 FIX ROUND 1, FIX 1 (opus1 F1 — the brief docs/superpowers/briefs/2026-11-27-msq-s2-u2fix-brief.md): the member view
   is not a lost right. An admin's own Plan or make-admin step, pressed in the member view, is answered by the app's
   "Switch back to the admin view to undo that." (D292 — undo/timeline.ts reverseRefusal), never blocked for good by U2's
   two stuck checks; back in the admin view, the step undoes. The stuck checks ask the ACCOUNT's own role
   (accounts.ts mayGivePlanByAccount), never the role in force; the apply still asks the role in force (mayGivePlanNow),
   after mayReverse has sent the member view away. Copied from opus1's proof-1, with a master admin's case added. */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, PID, ACCT } from '../test-support/msq-world'
import { accountsLoad, levelIn, saveAccess, mayGivePlanByAccount, mayGivePlanNow } from './accounts'
import { unitsLoad, todayIso, setGrant } from './units'
import { switchRoleView } from './store'
import { isAdmin } from './perms'
import { globalUndo } from '../undo/timeline'
import * as wire from './undo-wire'

withThird()

const reload = () => { unitsLoad(); accountsLoad() }
const SWITCH = 'Switch back to the admin view to undo that.'

describe('U2 fix 1 — the member view blocks no own Plan step for good', () => {
  it('Kestrel gives Mako Plan of 149, switches to the member view, presses Undo: told to switch back; back in the admin view, Undo works', async () => {
    signInAs('kestrel')
    expect(setGrant(ACCT.mako, 'u149', 'admin', PID.mako).ok, 'setup: Kestrel gives Mako Plan of 149').toBe(true)
    reload()
    expect(levelIn(ACCT.mako, 'u149', todayIso())).toBe('admin')
    await switchRoleView()
    expect(isAdmin(), 'setup: in the member view').toBe(false)
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason, 'the member view answers "switch back", never "blocked for good"').toBe(SWITCH)
    await switchRoleView()
    expect(isAdmin(), 'setup: back in the admin view').toBe(true)
    const r2 = globalUndo()
    expect(r2.ok, `back in the admin view his own step undoes: ${r2.reason}`).toBe(true)
    reload()
    expect(levelIn(ACCT.mako, 'u149', todayIso())).toBeNull()
  })
  it('Kestrel makes Osprey an admin then a member, switches to the member view, presses Undo: told to switch back, never D2807\'s sentence', async () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
    reload()
    expect(saveAccess(ACCT.osprey, { role: 'main' }), 'setup: Kestrel makes Osprey a member again').toBeNull()
    reload()
    await switchRoleView()
    expect(isAdmin()).toBe(false)
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).toBe(SWITCH)
    await switchRoleView()
    const r2 = globalUndo()
    expect(r2.ok, `back in the admin view his own step undoes: ${r2.reason}`).toBe(true)
  })
  it('blocked in the member view, the step is not lost: back in the admin view it undoes', async () => {
    signInAs('kestrel')
    expect(setGrant(ACCT.mako, 'u149', 'admin', PID.mako).ok).toBe(true)
    reload()
    await switchRoleView()
    globalUndo()
    await switchRoleView()
    expect(isAdmin()).toBe(true)
    const r = globalUndo()
    expect(r.ok, `his step, back in the admin view: ${r.reason}`).toBe(true)
  })
  it('a master admin: Saber gives Mako Plan of 149, member view, Undo says "Switch back…"; admin view, Undo goes through', async () => {
    signInAs('saber')
    expect(setGrant(ACCT.mako, 'u149', 'admin', PID.mako).ok, 'setup: Saber gives Mako Plan of 149').toBe(true)
    reload()
    expect(levelIn(ACCT.mako, 'u149', todayIso())).toBe('admin')
    await switchRoleView()
    expect(isAdmin(), 'setup: Saber in the member view').toBe(false)
    /* the two readers: the role in force gives nothing in the member view; the account's own role still may */
    expect(mayGivePlanNow('u149')).toBe(false)
    expect(mayGivePlanByAccount('u149')).toBe(true)
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).toBe(SWITCH)
    await switchRoleView()
    expect(isAdmin()).toBe(true)
    const r2 = globalUndo()
    expect(r2.ok, `back in the admin view his step undoes: ${r2.reason}`).toBe(true)
    reload()
    expect(levelIn(ACCT.mako, 'u149', todayIso())).toBeNull()
  })
  it('control: with U2\'s two checks off, the member view says "switch back" (as built before U2)', async () => {
    wire._planChecks(false)
    try {
      signInAs('kestrel')
      expect(setGrant(ACCT.mako, 'u149', 'admin', PID.mako).ok).toBe(true)
      reload()
      await switchRoleView()
      expect(globalUndo().reason).toBe(SWITCH)
    } finally { wire._planChecks(true) }
  })
})
