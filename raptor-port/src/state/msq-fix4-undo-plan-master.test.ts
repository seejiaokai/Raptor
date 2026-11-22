// @vitest-environment jsdom
/* A1 OF THE FIX READ (docs/superpowers/briefs/2026-11-23-msq-b1-fixread-astra.md finding 1 — high): an Undo put a Plan row
   back onto an account that had since been made a master admin. Saber gives Hunter Plan of 149 and takes it away; another
   master admin (Kestrel, made one by Saber) makes Hunter a master admin; Saber undoes his taking-away. The gate let a
   restore put a right back on a master admin's account, and its "made a master admin" check ran only for a command that
   set the mark — so the Plan came back hidden under "Full access", and stood again once the mark came off.
   §15 D14: no right stands on a master admin's account after ANY command, an Undo and a Redo included. The Undo is now
   refused before anything moves, in the words the app has for "someone has since changed it" (D148), and the gate
   refuses the same restore whatever door sends it. Red first: the Undo went through and the Plan held. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { setGrant, removeGrant, unitsLoad, grantOfOn, todayIso } from './units'
import { accountById, accountsLoad, setMaster } from './accounts'
import { settingsStore } from './people-settings-commit'
import { store } from '../engine/hooks'
import { commitAs } from '../command/commit'
import { globalUndo, globalRedo } from '../undo/timeline'

useMsqWorld()

const holder = (acct: string) => { const a = accountById(acct)!; return { id: acct, pid: String(a.pid), pidFrom: a.pidFrom } }
const holds = (acct: string, unit: string) => { unitsLoad(); return grantOfOn(holder(acct), unit) }
const KESTREL = { id: ACCT.kestrel, role: 'admin', personId: PID.kestrel, session: null } as any
/* another master admin's change, arriving from the shared store (a remote envelope — never a step of Saber's) */
const remote = (actor: any, type: string, fn: () => void) => {
  const r = commitAs({ type, scope: { module: 'settings' }, meta: null, apply: (txn: any) => { txn.enlist(settingsStore); fn() } } as any, { actor, origin: 'remote' })
  expect((r as any).ok, JSON.stringify(r)).not.toBe(false)
  unitsLoad(); accountsLoad()
}
const OUT_OF_BAND = /^Something else changed this after your action — it can’t be undone now\./
function hunterMadeMasterElsewhere(): void {
  remote(KESTREL, 'account.master', () => {
    const key = 'account:' + ACCT.hunter
    store.set(key, { ...store.get(key, null), master: true, masterFrom: todayIso(), masterAt: Date.now() })
  })
  expect(accountById(ACCT.hunter)!.master).toBe(true)
}

describe('no Undo or Redo puts a right back on a master admin\'s account (A1, §15 D14)', () => {
  it('Saber\'s Undo of taking Hunter\'s Plan away, after another master admin made Hunter one: refused, nothing back', () => {
    signInAs('saber')
    expect(setMaster(ACCT.kestrel, true).ok).toBe(true)
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    expect(removeGrant(ACCT.hunter, 'u149').ok).toBe(true)
    hunterMadeMasterElsewhere()
    const u = globalUndo()
    accountsLoad(); unitsLoad()
    expect(u.ok).toBe(false)
    expect(u.reason).toMatch(OUT_OF_BAND)
    expect(accountById(ACCT.hunter)!.master).toBe(true)
    expect(holds(ACCT.hunter, 'u149'), 'no Plan under "Full access"').toBeUndefined()
  })
  it('…and a View the same way', () => {
    signInAs('saber')
    expect(setMaster(ACCT.kestrel, true).ok).toBe(true)
    expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter).ok).toBe(true)
    expect(removeGrant(ACCT.hunter, 'u149').ok).toBe(true)
    hunterMadeMasterElsewhere()
    expect(globalUndo().ok).toBe(false)
    expect(holds(ACCT.hunter, 'u149')).toBeUndefined()
  })
  it('a Redo of giving Hunter Plan, after another master admin made him one: refused, nothing given', () => {
    signInAs('saber')
    expect(setMaster(ACCT.kestrel, true).ok).toBe(true)
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(holds(ACCT.hunter, 'u149')).toBeUndefined()
    hunterMadeMasterElsewhere()
    const r = globalRedo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(OUT_OF_BAND)
    expect(holds(ACCT.hunter, 'u149')).toBeUndefined()
  })
  it('the Undo still goes through where nobody made him a master admin since', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    expect(removeGrant(ACCT.hunter, 'u149').ok).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(holds(ACCT.hunter, 'u149')?.level).toBe('admin')
  })
})
