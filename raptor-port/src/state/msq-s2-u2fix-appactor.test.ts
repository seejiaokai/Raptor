// @vitest-environment jsdom
/* U2 FIX ROUND 1, FIX 5 (the security reader's S1, steps 1–2 — the brief docs/superpowers/briefs/2026-11-27-msq-s2-u2fix-brief.md;
   copied from his proof-2): with nobody signed in (or through the app's projection door), the commit gate lets ANYONE give Plan
   of a squadron and make a man an admin. His D2730 Q10: "every one of these answers no when it cannot read: nobody signed
   in". The doors do (accounts.ts mayGivePlanNow fails closed), and perms.ts planActorOf's own comment says the gate does
   too ("Fails closed: the app's own actor") — but:
   - command/actor.ts deriveActor() returns the SYSTEM actor whenever SESSION is null, so a public commit() made with
     nobody signed in runs as the app itself;
   - perms.ts unitRowViolation skips every WHO check for it (`if (sys) continue`, before the Plan who-check);
   - perms.ts madeAdminViolation returns null for it (`a.role === 'system'`).
   So a forged grant.set writes a Plan row, and a forged account.update makes Osprey 149's admin. */
import { describe, expect, it } from 'vitest'
import { withThird, signInAs, signOut, ACCT } from '../test-support/msq-world'
import { accountsLoad, stampMoments, levelIn, ACCOUNT_PFX } from './accounts'
import { unitsLoad, todayIso } from './units'
import { GRANT_PFX } from './units-model'
import { commitSettingsIntent, settingsStore } from './people-settings-commit'
import { commitProjection } from '../command'
import { store } from '../engine/hooks'

withThird()
const reload = () => { unitsLoad(); accountsLoad() }
const forge = (type: string, rows: Array<[string, unknown]>): any => {
  const r: any = commitSettingsIntent(type, null, () => { for (const [k, v] of rows) store.set(k, v) })
  reload()
  return r
}
const viaProjection = (type: string, rows: Array<[string, unknown]>): any => {
  const r: any = commitProjection({ type, scope: { module: 'settings' }, apply: (txn: any) => { txn.enlist(settingsStore); for (const [k, v] of rows) store.set(k, v) } } as any)
  reload()
  return r
}
const planRow = (id: string, account: string, unit: string) =>
  [GRANT_PFX + id, { id, account, unit, level: 'admin', from: todayIso(), fromAt: Date.now() }] as [string, unknown]

describe('U2 fix 5 — nobody signed in gives Plan and makes admins at the gate', () => {
  it('nobody signed in: a forged grant.set giving Mako Plan of 149 must be refused', () => {
    signInAs('kestrel'); signOut()
    const r = forge('grant.set', [planRow('gzs2a', ACCT.mako, 'u149')])
    expect({ ok: r.ok, mako149: levelIn(ACCT.mako, 'u149', todayIso()) }, 'nobody signed in gave Plan').toEqual({ ok: false, mako149: null })
  })
  it('nobody signed in: a forged account.update making Osprey (149\'s member) an admin must be refused', () => {
    signInAs('kestrel'); signOut()
    const prev: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    expect(prev, 'premise: Osprey has a stored account row').toBeTruthy()
    const r = forge('account.update', [[ACCOUNT_PFX + ACCT.osprey, stampMoments(prev, { ...prev, role: 'admin' })]])
    expect({ ok: r.ok, osprey149: levelIn(ACCT.osprey, 'u149', todayIso()) }, 'nobody signed in made an admin').toEqual({ ok: false, osprey149: 'member' })
  })
  it('the projection door, whoever is signed in (Osprey, a member): Plan of 149 given to Mako must be refused', () => {
    signInAs('osprey')
    const r = viaProjection('grant.set', [planRow('gzs2b', ACCT.mako, 'u149')])
    expect({ ok: r.ok, mako149: levelIn(ACCT.mako, 'u149', todayIso()) }, 'the projection door gave Plan').toEqual({ ok: false, mako149: null })
  })
  it('the projection door: Osprey, a member, makes HIMSELF 149\'s admin — must be refused', () => {
    signInAs('osprey')
    const prev: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    expect(prev, 'premise: Osprey has a stored account row').toBeTruthy()
    const r = viaProjection('account.update', [[ACCOUNT_PFX + ACCT.osprey, stampMoments(prev, { ...prev, role: 'admin' })]])
    expect({ ok: r.ok, osprey149: levelIn(ACCT.osprey, 'u149', todayIso()) }, 'a member made himself an admin').toEqual({ ok: false, osprey149: 'member' })
  })
  it('(contrast) Osprey signed in, the same forged grant.set: refused by the who-check', () => {
    signInAs('osprey')
    const r = forge('grant.set', [planRow('gzs2c', ACCT.mako, 'u149')])
    expect(r.ok).toBe(false)
  })
})
