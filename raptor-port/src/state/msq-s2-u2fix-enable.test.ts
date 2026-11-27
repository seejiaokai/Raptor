// @vitest-environment jsdom
/* U2 FIX ROUND 1, FIX 4 (opus2 F1, security S3 — the brief docs/superpowers/briefs/2026-11-27-msq-s2-u2fix-brief.md):
   Enable and Restore are "making an admin". R2's own words — "wherever a command leaves a man an admin in force of
   `unit` who was not one before it" — with R1's list (an account switched off, a man archived: not in force) cover both
   doors; the agent's reading, said to the coordinator. A Plan holder of 149 (Hunter) may not bring a 149 admin back by
   Enable, by Restore from the archive, or by the Undo of his own Suspend; 149's own admin (Kestrel) still may, and the
   door's refusal is D2806's sentence. Copied from opus2's proof-1 and the security reader's proof-3, with the gate,
   the Undo and the controls added. */
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

const MAKE = (n: string) => `Only ${n}'s own admins or a master admin can make an admin of ${n}.`
const reload = () => { unitsLoad(); accountsLoad() }
const adminInForce = (): boolean => { const a = accountById(ACCT.osprey)!; return a.on && a.role === 'admin' && !(PEOPLE as any)[PID.osprey]?.archived && levelIn(ACCT.osprey, 'u149', todayIso()) === 'admin' }
/* 149 gets a second own admin, Osprey, made by its own admin (so the last-admin lock never answers first) */
function ospreyAdmin(): void {
  signInAs('kestrel')
  expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey 149\'s admin').toBeNull()
  reload()
}

describe('U2 fix 4 — Enable is making an admin', () => {
  it('Hunter (Plan of 149) switches Osprey (149 admin, switched off by Kestrel) on again: refused in D2806\'s sentence, nothing saved', () => {
    ospreyAdmin()
    expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Kestrel switches Osprey off').toBeNull()
    reload()
    expect(adminsOf('u149', todayIso()), 'setup: Osprey is no admin of 149 who can sign in').not.toContain(PID.osprey)
    signInAs('hunter')
    enterSquadron('u149'); reload()
    const r = updateAccount(ACCT.osprey, { on: true })
    reload()
    expect({ r, on: accountById(ACCT.osprey)!.on, admins: adminsOf('u149', todayIso()).includes(PID.osprey) })
      .toEqual({ r: MAKE('149'), on: false, admins: false })
  })
  it('the gate refuses the same Enable written past the door: "a man made an admin of 149 by one who may not give its Plan"', () => {
    ospreyAdmin()
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    reload()
    signInAs('hunter')
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    expect(row, 'setup: Osprey\'s stored account row').toBeTruthy()
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, on: true }) })
    reload()
    expect(r.ok, 'the gate refused it').toBe(false)
    expect(String(r?.message ?? '')).toMatch(/a man made an admin of u149 by one who may not give its Plan/)
    expect(accountById(ACCT.osprey)!.on).toBe(false)
  })
  it('the Undo of Hunter\'s own Suspend of Osprey is blocked in D2807\'s sentence, Osprey left switched off', () => {
    ospreyAdmin()
    on(15, 10)
    signInAs('hunter')
    enterSquadron('u149'); reload()
    expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Hunter (Plan of 149) suspends Osprey').toBeNull()
    reload()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, reason: u.reason, on: accountById(ACCT.osprey)!.on })
      /* (D2807's sentence, its apostrophes one kind — fix 9, Fable's word review) */
      .toEqual({ ok: false, reason: 'Only 149’s own admins or a master admin can make an admin of 149, so this can’t be undone.', on: false })
  })
  it('control: Kestrel (149\'s own admin) switches Osprey on again: saved', () => {
    ospreyAdmin()
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    expect(updateAccount(ACCT.osprey, { on: true })).toBeNull()
    reload()
    expect(adminsOf('u149', todayIso())).toContain(PID.osprey)
  })
  it('control: Hunter (Plan of 149) switches a 149 MEMBER on again: saved — only an admin\'s Enable is making an admin', () => {
    signInAs('kestrel')
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    signInAs('hunter')
    enterSquadron('u149'); reload()
    expect(updateAccount(ACCT.osprey, { on: true })).toBeNull()
    reload()
    expect(accountById(ACCT.osprey)!.on).toBe(true)
  })
})

describe('U2 fix 4 — Restore is making an admin', () => {
  it('Hunter (Plan of 149) restores Osprey (149 admin, archived by Kestrel): refused, he stays archived', () => {
    ospreyAdmin()
    on(15, 10)
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey').toBeNull()
    reload()
    expect(adminsOf('u149', todayIso())).not.toContain(PID.osprey)
    on(15, 11)
    signInAs('hunter')
    enterSquadron('u149'); reload()
    expect(restoreProblem(PID.osprey, todayIso())).toBe(MAKE('149'))
    expect(restoreArchivedAs(PID.osprey, 'Osprey', todayIso())).toBe(MAKE('149'))
    const ok = restoreArchivedPerson(PID.osprey, todayIso())
    reload()
    expect(isAdminAccount(accountById(ACCT.osprey)!), 'premise: his account is still an admin\'s').toBe(true)
    expect({ ok, archived: !!(PEOPLE as any)[PID.osprey]?.archived, inForce: adminInForce() }).toEqual({ ok: false, archived: true, inForce: false })
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
