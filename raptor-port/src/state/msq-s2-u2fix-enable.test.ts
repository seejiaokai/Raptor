// @vitest-environment jsdom
/* ENABLE AND RESTORE ARE NOT "MAKING AN ADMIN" (his D2903, 28 Nov 26: "switching a suspended, archived or posted-out
   admin back on is not making an admin" — whoever may manage that squadron's people may do it, and the man returns with
   the role he had).

   This file was U2 fix round 1's fix 4 (opus2 F1, security S3 — the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u2fix-brief.md), which read R2's "an admin in force" as covering both doors
   and refused them to a Plan holder in D2806's sentence: the agent's reading, never his ruling. His ruling replaced it
   (U2 fix round 3's addendum, docs/superpowers/briefs/2026-11-28-msq-s2-u2fix3-addendum.md), so every "refused to a Plan
   holder" case below now expects the Enable, the Restore and the Undo of his own Suspend to GO THROUGH, Osprey 149's
   admin again; the controls stand as they were. Making a MEMBER an admin is still refused to him (D2806, D2807) — its
   cases are state/msq-s2-u2fix3-d2903.test.ts and state/msq-s2-u2fix3-role-off.test.ts. */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, PID, ACCT, on } from '../test-support/msq-world'
import { saveAccess, updateAccount, accountById, accountsLoad, adminsOf, levelIn, isAdminAccount, ACCOUNT_PFX } from './accounts'
import { unitsLoad, todayIso } from './units'
import { enterSquadron } from './store'
import { archivePerson, restoreArchivedPerson, restoreProblem, restoreArchivedAs } from '../leavewar/sync'
import { PEOPLE } from '../engine/people'
import { globalUndo } from '../undo/timeline'
import { commitSettingsIntent } from './people-settings-commit'
import { store } from '../engine/hooks'

withThird()

const reload = () => { unitsLoad(); accountsLoad() }
const adminInForce = (): boolean => { const a = accountById(ACCT.osprey)!; return a.on && a.role === 'admin' && !(PEOPLE as any)[PID.osprey]?.archived && levelIn(ACCT.osprey, 'u149', todayIso()) === 'admin' }
/* 149 gets a second own admin, Osprey, made by its own admin (so the last-admin lock never answers first) */
function ospreyAdmin(): void {
  signInAs('kestrel')
  expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey 149\'s admin').toBeNull()
  reload()
}

describe('D2903 — Enable of a suspended admin is not making an admin', () => {
  it('Hunter (Plan of 149) switches Osprey (149 admin, switched off by Kestrel) on again: saved, Osprey 149\'s admin again', () => {
    ospreyAdmin()
    expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Kestrel switches Osprey off').toBeNull()
    reload()
    expect(adminsOf('u149', todayIso()), 'setup: Osprey is no admin of 149 who can sign in').not.toContain(PID.osprey)
    signInAs('hunter')
    enterSquadron('u149'); reload()
    const r = updateAccount(ACCT.osprey, { on: true })
    reload()
    expect({ r, on: accountById(ACCT.osprey)!.on, admins: adminsOf('u149', todayIso()).includes(PID.osprey) })
      .toEqual({ r: null, on: true, admins: true })
  })
  it('the same Enable written past the door passes the gate: the role is not newly an admin\'s', () => {
    ospreyAdmin()
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    reload()
    signInAs('hunter')
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    expect(row, 'setup: Osprey\'s stored account row').toBeTruthy()
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, on: true }) })
    reload()
    expect(r.ok, 'the gate let it through').toBe(true)
    expect(accountById(ACCT.osprey)!.on).toBe(true)
    expect(adminInForce()).toBe(true)
  })
  it('the Undo of Hunter\'s own Suspend of Osprey goes through, Osprey 149\'s admin again', () => {
    ospreyAdmin()
    on(15, 10)
    signInAs('hunter')
    enterSquadron('u149'); reload()
    expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Hunter (Plan of 149) suspends Osprey').toBeNull()
    reload()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, on: accountById(ACCT.osprey)!.on, inForce: adminInForce() }).toEqual({ ok: true, on: true, inForce: true })
  })
  it('control: Kestrel (149\'s own admin) switches Osprey on again: saved', () => {
    ospreyAdmin()
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    expect(updateAccount(ACCT.osprey, { on: true })).toBeNull()
    reload()
    expect(adminsOf('u149', todayIso())).toContain(PID.osprey)
  })
  it('control: Hunter (Plan of 149) switches a 149 MEMBER on again: saved, and he is still a member', () => {
    signInAs('kestrel')
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    signInAs('hunter')
    enterSquadron('u149'); reload()
    expect(updateAccount(ACCT.osprey, { on: true })).toBeNull()
    reload()
    expect(accountById(ACCT.osprey)!.on).toBe(true)
    expect(levelIn(ACCT.osprey, 'u149', todayIso())).toBe('member')
  })
})

describe('D2903 — Restore of an archived admin is not making an admin', () => {
  it('Hunter (Plan of 149) restores Osprey (149 admin, archived by Kestrel): he is back, 149\'s admin again', () => {
    ospreyAdmin()
    on(15, 10)
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey').toBeNull()
    reload()
    expect(adminsOf('u149', todayIso())).not.toContain(PID.osprey)
    on(15, 11)
    signInAs('hunter')
    enterSquadron('u149'); reload()
    expect(isAdminAccount(accountById(ACCT.osprey)!), 'premise: his account is still an admin\'s').toBe(true)
    expect(restoreProblem(PID.osprey, todayIso())).toBeNull()
    const ok = restoreArchivedPerson(PID.osprey, todayIso())
    reload()
    expect({ ok, archived: !!(PEOPLE as any)[PID.osprey]?.archived, inForce: adminInForce() }).toEqual({ ok: true, archived: false, inForce: true })
  })
  it('Hunter (Plan of 149) uses "Restore as" on the same man: he is back, 149\'s admin again', () => {
    ospreyAdmin()
    on(15, 10)
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey').toBeNull()
    reload()
    on(15, 11)
    signInAs('hunter')
    enterSquadron('u149'); reload()
    expect(restoreArchivedAs(PID.osprey, 'Osprey', todayIso())).toBeNull()
    reload()
    expect({ archived: !!(PEOPLE as any)[PID.osprey]?.archived, inForce: adminInForce() }).toEqual({ archived: false, inForce: true })
  })
  it('control — an overseas man\'s return: Kestrel archives Osprey (149 admin) and Kestrel restores him: he is 149\'s admin again', () => {
    ospreyAdmin()
    on(15, 10)
    expect(archivePerson(PID.osprey).bad).toBeNull()
    reload()
    on(15, 11)
    signInAs('kestrel')
    expect(restoreProblem(PID.osprey, todayIso())).toBeNull()
    expect(restoreArchivedPerson(PID.osprey, todayIso())).toBe(true)
    reload()
    expect(adminInForce()).toBe(true)
  })
  it('control: Hunter (Plan of 149) restores a 149 MEMBER: goes through', () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeNull()
    reload()
    on(15, 11)
    signInAs('hunter')
    enterSquadron('u149'); reload()
    expect(restoreProblem(PID.osprey, todayIso())).toBeNull()
    expect(restoreArchivedPerson(PID.osprey, todayIso())).toBe(true)
  })
})
