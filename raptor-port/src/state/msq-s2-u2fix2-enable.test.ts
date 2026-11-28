// @vitest-environment jsdom
/* U2 FIX ROUND 2, FIX 1 (Astra 1, Fable 2, Opus F2 — the brief docs/superpowers/briefs/2026-11-28-msq-s2-u2fix2-brief.md):
   Enable and Restore ask the role IN FORCE, never the stored role. A man who moved into 149 stores "admin" on his account
   but is 149's member there (K3, D2160 — "he joins as a member"), so bringing him back makes no admin: a Plan holder of
   149 (Mako, or Hunter) may switch him on again or restore him as any member, where round 1's doors refused in D2806's
   make-an-admin sentence and the commit gate (madeAdminsIn) let the same write through. Copied from Astra's proof 1 (the
   three roads), Fable's proof 2 and the fresh Opus read's proof 3, renamed. Round 1's msq-s2-u2fix-enable.test.ts keeps
   the true admin's refusal. */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, moveMan, on, pastMidnight, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, updateAccount, accountById, accountsLoad, levelIn, mayGivePlanNow, adminNow, ACCOUNT_PFX } from './accounts'
import { homeOn, todayIso, unitsLoad } from './units'
import { enterSquadron } from './store'
import { archivePerson, restoreArchivedPerson, restoreArchivedAs, restoreProblem } from '../leavewar/sync'
import { PEOPLE } from '../engine/people'
import { commitSettingsIntent } from './people-settings-commit'
import { store } from '../engine/hooks'

withThird()

const reload = (): void => { unitsLoad(); accountsLoad() }

describe('Astra 1 — Hunter (142\'s admin) moved to 149 is a member there: Mako (Plan of 149) brings him back', () => {
  function movedMember(): void {
    signInAs('saber')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull()
    expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    on(16, 9)
    reload()
    expect(homeOn(PID.hunter, todayIso())).toBe('u149')
    expect(accountById(ACCT.hunter)!.role).toBe('admin')
    expect(levelIn(ACCT.hunter, 'u149', todayIso())).toBe('member')
    signInAs('kestrel')
    enterSquadron('u149')
  }

  it.each(['Enable', 'Restore', 'Restore as'] as const)('%s of a moved member does not need the right to make an admin', route => {
    movedMember()
    if (route === 'Enable') expect(updateAccount(ACCT.hunter, { on: false })).toBeNull()
    else expect(archivePerson(PID.hunter).bad).toBeNull()
    reload()
    expect(accountById(ACCT.hunter)!.on).toBe(false)

    signInAs('mako')
    enterSquadron('u149')
    reload()
    expect(mayGivePlanNow('u149')).toBe(false)
    expect(levelIn(ACCT.hunter, 'u149', todayIso())).toBe('member')

    const result = route === 'Enable'
      ? updateAccount(ACCT.hunter, { on: true })
      : route === 'Restore'
        ? restoreArchivedPerson(PID.hunter, todayIso())
        : restoreArchivedAs(PID.hunter, 'Hunter', todayIso())
    reload()
    expect({
      result,
      on: accountById(ACCT.hunter)!.on,
      archived: !!(PEOPLE as any)[PID.hunter].archived,
      role: levelIn(ACCT.hunter, 'u149', todayIso()),
    }).toEqual({ result: route === 'Restore' ? true : null, on: true, archived: false, role: 'member' })
  })
})

describe('Fable 2 — a moved admin is a member: bringing him back makes no admin', () => {
  /* Hunter moved to 149 (a member there, his account still storing "admin"); Mako given Plan of 149 by its own admin */
  function hunterJoins149(): void {
    on(15, 9)
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149'), 'setup: Saber moves Hunter to 149').toMatchObject({ ok: true })
    pastMidnight(); reload()
    expect(homeOn(PID.hunter, todayIso()), 'setup: Hunter is at home in 149').toBe('u149')
    const a = accountById(ACCT.hunter)!
    expect({ stored: a.role, inForce: adminNow(a), level: levelIn(ACCT.hunter, 'u149', todayIso()) }, 'premise: he stores "admin" and is a member of 149 (K3)')
      .toEqual({ stored: 'admin', inForce: false, level: 'member' })
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: Kestrel gives Mako Plan of 149').toBeNull()
    reload()
  }

  it('premise: the commit gate lets a Plan holder of 149 switch him on again (no admin is made)', () => {
    hunterJoins149()
    expect(updateAccount(ACCT.hunter, { on: false }), 'setup: Kestrel suspends Hunter').toBeNull()
    reload()
    signInAs('mako'); enterSquadron('u149'); reload()
    const row: any = store.get(ACCOUNT_PFX + ACCT.hunter, null)
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.hunter, { ...row, on: true }) })
    reload()
    expect({ ok: r.ok !== false, on: accountById(ACCT.hunter)!.on, level: levelIn(ACCT.hunter, 'u149', todayIso()) }).toEqual({ ok: true, on: true, level: 'member' })
  })
  it('Mako (Plan of 149) presses Enable on Hunter, a suspended member of 149: it saves', () => {
    hunterJoins149()
    expect(updateAccount(ACCT.hunter, { on: false }), 'setup: Kestrel suspends Hunter').toBeNull()
    reload()
    signInAs('mako'); enterSquadron('u149'); reload()
    const r = updateAccount(ACCT.hunter, { on: true })
    reload()
    expect({ r, on: accountById(ACCT.hunter)!.on }).toEqual({ r: null, on: true })
  })
  it('Mako (Plan of 149) restores Hunter, an archived member of 149: no refusal in the make-an-admin sentence', () => {
    hunterJoins149()
    expect(archivePerson(PID.hunter).bad, 'setup: Kestrel archives Hunter').toBeNull()
    reload()
    on(16, 11)
    signInAs('mako'); enterSquadron('u149'); reload()
    expect(restoreProblem(PID.hunter, todayIso())).toBeNull()
  })
})

describe('Opus F2 — Ranger, made a 142 admin and moved to 149, comes back a member', () => {
  /* Saber makes Ranger a 142 admin, then moves him to 149 from tomorrow; the move day comes: Ranger is 149's member */
  function rangerMovedIn(): void {
    signInAs('saber')
    expect(saveAccess(ACCT.ranger, { role: 'admin' }), 'setup: Saber makes Ranger a 142 admin').toBeNull()
    reload()
    expect(moveMan(PID.ranger, 'u149'), 'setup: Saber moves Ranger to 149 from the 16th').toMatchObject({ ok: true })
    on(16); reload()
    expect({ home: homeOn(PID.ranger, todayIso()), role: accountById(ACCT.ranger)!.role, level: levelIn(ACCT.ranger, 'u149', todayIso()) },
      'premise: at home in 149, his account still an admin\'s, a member there (K3)').toEqual({ home: 'u149', role: 'admin', level: 'member' })
  }

  it('Kestrel switches Ranger off; Hunter (Plan of 149) switches him on: saved', () => {
    rangerMovedIn()
    signInAs('kestrel')
    expect(updateAccount(ACCT.ranger, { on: false }), 'setup: Kestrel switches Ranger off').toBeNull()
    reload()
    signInAs('hunter'); enterSquadron('u149'); reload()
    expect(updateAccount(ACCT.ranger, { on: true })).toBeNull()
  })
  it('Kestrel archives Ranger; Hunter (Plan of 149) restores him: no refusal', () => {
    rangerMovedIn()
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(archivePerson(PID.ranger).bad, 'setup: Kestrel archives Ranger').toBeNull()
    reload()
    on(17)
    signInAs('hunter'); enterSquadron('u149'); reload()
    expect(restoreProblem(PID.ranger, todayIso())).toBeNull()
  })
  it('control: the gate itself lets Hunter\'s Enable of Ranger through (no admin is made)', () => {
    rangerMovedIn()
    signInAs('kestrel')
    expect(updateAccount(ACCT.ranger, { on: false })).toBeNull()
    reload()
    signInAs('hunter'); enterSquadron('u149'); reload()
    const row: any = store.get(ACCOUNT_PFX + ACCT.ranger, null)
    expect(row, 'setup: Ranger\'s stored account row').toBeTruthy()
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.ranger, { ...row, on: true }) })
    reload()
    expect({ ok: r.ok, on: accountById(ACCT.ranger)!.on, level: levelIn(ACCT.ranger, 'u149', todayIso()) }, `the gate answered: ${r?.message ?? 'ok'}`)
      .toEqual({ ok: true, on: true, level: 'member' })
  })
})
