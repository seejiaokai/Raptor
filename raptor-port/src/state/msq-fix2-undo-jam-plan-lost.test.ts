// @vitest-environment jsdom
/* opus2 (blind read, share 2): a step whose squadron the actor can no longer reach — made as a Plan holder of 149, his Plan
   then taken by the master admin in another session — is it passed over or blocked for good (as A-v's and Fable's blind
   read 4's steps are), or does it refuse every press and jam his whole Undo list? */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT, mem, on } from '../test-support/msq-world'
import { setGrant, unitsLoad, unitRows, grantOfOn } from './units'
import { accountsLoad, accountById, updateAccount } from './accounts'
import { HOME_PFX } from './units-model'
import { settingsStore } from './people-settings-commit'
import { store } from '../engine/hooks'
import { commitAs } from '../command/commit'
import { globalUndo } from '../undo/timeline'

useMsqWorld()

const SABER = { id: ACCT.saber, role: 'admin', personId: PID.saber, session: null } as any
const holder = (acct: string) => { const a = accountById(acct)!; return { id: acct, pid: String(a.pid), pidFrom: a.pidFrom } }

describe('opus2 — Hunter loses his Plan of 149 while signed in', () => {
  it('his Undo of a step he made as 149\'s Plan holder does not jam the steps before it', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    unitsLoad(); accountsLoad()
    signInAs('hunter')
    /* an older step of his own, in his own squadron: View of 142 for Osprey */
    expect(setGrant(ACCT.osprey, 'u142', 'view', PID.osprey).ok).toBe(true)
    /* a step as 149's Plan holder: View of 149 for Ranger */
    expect(setGrant(ACCT.ranger, 'u149', 'view', PID.ranger).ok).toBe(true)
    unitsLoad()
    /* the master admin, in his own session, takes Hunter's Plan of 149 */
    const plan = unitRows().grants.find(g => g.account === ACCT.hunter && g.unit === 'u149')!
    const r = commitAs({ type: 'grant.remove', scope: { module: 'settings' }, meta: null, apply: (txn: any) => { txn.enlist(settingsStore); store.set('grant:' + plan.id, null) } } as any, { actor: SABER, origin: 'remote' })
    expect((r as any).ok, JSON.stringify(r)).not.toBe(false)
    unitsLoad(); accountsLoad()
    expect(grantOfOn(holder(ACCT.hunter), 'u149')).toBeUndefined()
    /* Undo, twice: the 149 step can no longer pass the save check (he is no admin of 149); the press after must take his
       own 142 step — never the same refusal again and again */
    const u1 = globalUndo()
    const u2 = globalUndo()
    const u3 = globalUndo()
    console.log('OPUS2', JSON.stringify([u1.ok, u1.reason, u2.ok, u2.reason, u3.ok, u3.reason]), JSON.stringify(unitRows().grants))
    const took142 = [u1, u2, u3].some(u => u.ok) && !grantOfOn(holder(ACCT.osprey), 'u142')
    expect({ u1: u1.reason, u2: u2.reason, u3: u3.reason, osprey142: !!grantOfOn(holder(ACCT.osprey), 'u142') }).toMatchObject({ osprey142: false })
    expect(took142).toBe(true)
  })

  it('variant: Hunter changes Ranger\'s sign-in name, Ranger moves to 149 at midnight, Hunter\'s Undo after it', () => {
    signInAs('hunter')
    expect(setGrant(ACCT.osprey, 'u142', 'view', PID.osprey).ok).toBe(true)          // an older step of his own
    expect(updateAccount(ACCT.ranger, { name: 'ranger2' })).toBeNull()
    /* his move, saved by another admin (written as his home rows, as msq-undo-rights.test.ts writes them) */
    mem['sqn142_' + HOME_PFX + 'hr0'] = JSON.stringify({ id: 'hr0', pid: PID.ranger, unit: 'u142', from: '2026-07-01' })
    mem['sqn142_' + HOME_PFX + 'hr1'] = JSON.stringify({ id: 'hr1', pid: PID.ranger, unit: 'u149', from: '2026-07-16' })
    on(16); unitsLoad(); accountsLoad()
    const u1 = globalUndo(), u2 = globalUndo(), u3 = globalUndo()
    console.log('OPUS2b', JSON.stringify([u1.ok, u1.reason, u2.ok, u2.reason, u3.ok, u3.reason]))
    expect(!!grantOfOn(holder(ACCT.osprey), 'u142'), 'his own 142 step taken by a later press').toBe(false)
  })
})
