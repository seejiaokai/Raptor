// @vitest-environment jsdom
/* BRINGING AN ADMIN BACK IS NOT MAKING ONE (his D2903, 28 Nov 26 — U2 fix round 3's addendum,
   docs/superpowers/briefs/2026-11-28-msq-s2-u2fix3-addendum.md):
   "Switching a suspended, archived or posted-out admin back on is NOT making an admin." Enable, Restore, "Restore as",
   "Undo post out", a posting's date or outcome changed so that its archive or suspension is taken back, and the Undo of a
   Suspend or an Archive: whoever may manage that squadron's people may do it, and the man returns with the role he had.
   Making a MEMBER an admin stays with the squadron's own admins or a master admin (D2806), by every door and by Undo and
   Redo (D2807). So "made an admin" is ONE thing everywhere — a role newly an admin's of his squadron, whatever his
   sign-in's switch, his archive or his marks (units-model.ts madeAdminsIn, asked by the gate and by the Undo).

   His example, at the door and at the gate: Kestrel (149's admin) suspends Osprey (149's admin); Hunter (142's admin,
   Plan of 149) enables him — saved, Osprey an admin of 149 again, told on his own bell as he is today. Then the same for
   each other way back; then what is still refused, in D2806's and D2807's sentences.

   The world: three squadrons (withThird), Wed 15 Jul 26. Each door below saves through the commit gate, so a door that
   answers "saved" is the gate's yes too; the gate asked alone (a row written past the door) has its own cases. */
import { beforeEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, on, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, updateAccount, accountById, accountsLoad, adminsOf, levelIn, mayGivePlanNow, makeAdminUndoWords, signIn, sessionFor, ACCOUNT_PFX } from './accounts'
import { unitsLoad, todayIso } from './units'
import { enterSquadron } from './store'
import { archivePerson, restoreArchivedPerson, restoreProblem, restoreArchivedAs, postOut, postOutProblem, undoPostOut, undoPostOutProblem } from '../leavewar/sync'
import { commitSettingsIntent } from './people-settings-commit'
import { NOTICES, noticeWords, type Notice } from './notices'
import { setSession, setMe, SESSION } from './auth'
import { globalUndo } from '../undo/timeline'
import { store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'

withThird()
beforeEach(() => { NOTICES.length = 0 })

const MAKE = "Only 149's own admins or a master admin can make an admin of 149."
const reload = (): void => { unitsLoad(); accountsLoad() }
const asHunter = (): void => { on(15, 11); signInAs('hunter'); enterSquadron('u149'); reload() }
/* Osprey as the app reads him now: on the roster, his sign-in on, an admin of 149 who can sign in */
const osprey = () => ({
  archived: !!(PEOPLE as any)[PID.osprey]?.archived,
  on: accountById(ACCT.osprey)!.on,
  role: accountById(ACCT.osprey)!.role,
  admin: adminsOf('u149', todayIso()).includes(PID.osprey),
})
const BACK = { archived: false, on: true, role: 'admin', admin: true }
/* his own account's bell lines (never a squadron's Plan line), as "<what> · <who>" */
const isSq = (n: Notice): boolean => ((n.what || [])[0] as any)?.k === 'sqplan'
const ownBell = (pid: string): string[] => NOTICES.filter(n => String(n.to) === pid && !isSq(n)).map(n => { const w = noticeWords(n); return `${w.what}${w.who ? ` · ${w.who}` : ''}` })
/* another device: sign in there and act, the Undo list of the one held left as it stands */
const elsewhere = (name: string, pass: string, pid: string, fn: () => void): void => {
  const s = SESSION, me = s ? String(accountById(s.user)?.pid ?? '') : ''
  setSession(sessionFor(signIn(name, pass))); setMe(pid)
  try { fn() } finally { setSession(s); setMe(me); reload() }
}
/* 149 gets a second own admin, Osprey, made by its own admin */
function ospreyAdmin(): void {
  signInAs('kestrel'); enterSquadron('u149'); reload()
  expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
  reload()
}

describe('D2903 — his example: Kestrel suspends Osprey (149\'s admin), Hunter (Plan of 149) enables him', () => {
  function suspended(): void {
    ospreyAdmin()
    on(15, 10)
    expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Kestrel suspends Osprey').toBeNull()
    reload()
    expect(osprey(), 'setup: no admin of 149 who can sign in').toMatchObject({ on: false, role: 'admin', admin: false })
    NOTICES.length = 0
  }
  it('the door: saved — Osprey an admin of 149 again, with the role he had', () => {
    suspended()
    asHunter()
    expect(mayGivePlanNow('u149'), 'premise: Hunter may not make an admin of 149').toBe(false)
    expect(updateAccount(ACCT.osprey, { on: true })).toBeNull()
    reload()
    expect(osprey()).toEqual(BACK)
  })
  it('he is told on his own bell as he is today: the same line Kestrel\'s own Enable gives him, signed by who pressed', () => {
    suspended()
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(updateAccount(ACCT.osprey, { on: true }), 'the line as it is today: Kestrel\'s Enable').toBeNull()
    const today = ownBell(PID.osprey)
    expect(today, 'today\'s line').toEqual(['Enabled · Kestrel'])
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    reload()
    NOTICES.length = 0
    asHunter()
    expect(updateAccount(ACCT.osprey, { on: true })).toBeNull()
    expect(ownBell(PID.osprey)).toEqual(['Enabled · Hunter'])
  })
  it('the gate: the same Enable written past the door goes through (no role is newly an admin\'s)', () => {
    suspended()
    asHunter()
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    expect(row, 'setup: Osprey\'s stored account row').toBeTruthy()
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, on: true }) })
    reload()
    expect({ ok: r.ok !== false, ...osprey() }, `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: true, ...BACK })
  })
  it('Hunter\'s Undo of his OWN Suspend of Osprey goes through', () => {
    ospreyAdmin()
    asHunter()
    expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Hunter suspends Osprey').toBeNull()
    reload()
    expect(osprey().admin).toBe(false)
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, ...osprey() }, `the Undo answered: ${u.reason ?? 'ok'}`).toEqual({ ok: true, ...BACK })
  })
})

describe('D2903 — an archived admin brought back by a Plan holder', () => {
  function archived(): void {
    ospreyAdmin()
    on(15, 10)
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey').toBeNull()
    reload()
    expect(osprey(), 'setup: archived, no admin of 149 who can sign in').toMatchObject({ archived: true, role: 'admin', admin: false })
  }
  it('Restore: the door says nothing and it is saved — Osprey an admin of 149 again', () => {
    archived()
    asHunter()
    expect(restoreProblem(PID.osprey, todayIso())).toBeNull()
    expect(restoreArchivedPerson(PID.osprey, todayIso())).toBe(true)
    reload()
    expect(osprey()).toEqual(BACK)
  })
  it('"Restore as": saved — Osprey an admin of 149 again', () => {
    archived()
    asHunter()
    expect(restoreArchivedAs(PID.osprey, 'Osprey', todayIso())).toBeNull()
    reload()
    expect(osprey()).toEqual(BACK)
  })
  /* (the Undo button takes back no Archive in this build, for anyone — his D350: its own words send him to Restore. So
     "the Undo of an Archive" is the Restore, and it is never D2807's sentence he reads on the way) */
  it('Hunter\'s OWN Archive of Osprey taken back: the Undo button says its own words for an archive (D350), and his Restore goes through', () => {
    ospreyAdmin()
    asHunter()
    expect(archivePerson(PID.osprey).bad, 'setup: Hunter archives Osprey').toBeNull()
    reload()
    expect(osprey()).toMatchObject({ archived: true, admin: false })
    const u = globalUndo()
    expect({ ok: u.ok, d2807: String(u.reason ?? '').includes('make an admin') }, `the Undo answered: ${u.reason ?? 'ok'}`).toEqual({ ok: false, d2807: false })
    expect(String(u.reason ?? '')).toMatch(/^Adding, archiving or restoring a person, and a posting, aren’t undone here/)
    expect(restoreArchivedPerson(PID.osprey, todayIso())).toBe(true)
    reload()
    expect(osprey()).toEqual(BACK)
  })
})

describe('D2903 — a posted-out admin brought back by a Plan holder', () => {
  function postedOverseas(): void {
    ospreyAdmin()
    on(15, 10)
    expect(postOut(PID.osprey, todayIso(), 'overseas'), 'setup: Kestrel posts Osprey overseas from today, it runs at once').toBe(true)
    reload()
    expect(osprey(), 'setup: archived and suspended by the posting').toMatchObject({ archived: true, on: false, role: 'admin', admin: false })
  }
  it('"Undo post out": the sheet\'s door says nothing and it is saved — Osprey an admin of 149 again', () => {
    postedOverseas()
    asHunter()
    expect(undoPostOutProblem(PID.osprey)).toBeNull()
    expect(undoPostOut(PID.osprey)).toBe(true)
    reload()
    expect(osprey()).toEqual(BACK)
  })
  it('the posting moved to a later date (its archive and suspension taken back): saved — Osprey an admin of 149 again', () => {
    postedOverseas()
    asHunter()
    expect(postOutProblem(PID.osprey, 'overseas')).toBeNull()
    expect(postOut(PID.osprey, '2026-07-25', 'overseas')).toBe(true)
    reload()
    expect(osprey()).toEqual(BACK)
  })
  it('the posting\'s outcome changed to none from today: saved — Osprey an admin of 149 again', () => {
    postedOverseas()
    asHunter()
    expect(postOutProblem(PID.osprey, 'none')).toBeNull()
    expect(postOut(PID.osprey, todayIso(), 'none')).toBe(true)
    reload()
    expect(osprey()).toEqual(BACK)
  })
})

describe('still refused — making a MEMBER an admin (D2806, D2807)', () => {
  it('Hunter picks Admin for Osprey, a member: refused in D2806\'s sentence, by both doors, nothing saved', () => {
    asHunter()
    expect(updateAccount(ACCT.osprey, { role: 'admin' })).toBe(MAKE)
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBe(MAKE)
    reload()
    expect(levelIn(ACCT.osprey, 'u149', todayIso())).toBe('member')
  })
  it('the gate: Hunter writes an admin\'s role on Osprey, a member SWITCHED OFF — refused; Kestrel\'s Enable then brings back a member', () => {
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Kestrel suspends Osprey, a member').toBeNull()
    reload()
    asHunter()
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, role: 'admin', adminAt: Date.now() }) })
    reload()
    expect({ ok: r.ok !== false, role: accountById(ACCT.osprey)!.role }, `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: false, role: 'main' })
    expect(String(r.message ?? '')).toMatch(/a man made an admin of u149 by one who may not give its Plan/)
    expect(updateAccount(ACCT.osprey, { on: true }), 'Hunter may still enable him — as the member he is').toBeNull()
    reload()
    expect(levelIn(ACCT.osprey, 'u149', todayIso())).toBe('member')
  })
  it('the gate: Hunter writes an admin\'s role on Osprey, a member ARCHIVED — refused; restored, he is a member', () => {
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey, a member').toBeNull()
    reload()
    asHunter()
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, role: 'admin', adminAt: Date.now() }) })
    reload()
    expect({ ok: r.ok !== false, role: accountById(ACCT.osprey)!.role }, `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: false, role: 'main' })
    expect(restoreArchivedPerson(PID.osprey, todayIso()), 'Hunter may still restore him — as the member he is').toBe(true)
    reload()
    expect(levelIn(ACCT.osprey, 'u149', todayIso())).toBe('member')
  })
  it('Hunter\'s Undo of "made a member" (Osprey, an admin of 149 made a member by Hunter): refused in D2807\'s sentence, Osprey still a member', () => {
    asHunter()
    elsewhere('ad9', 'a9', PID.kestrel, () => {
      expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel, on another device, makes Osprey an admin of 149').toBeNull()
    })
    expect(saveAccess(ACCT.osprey, { role: 'main' }), 'setup: Hunter makes Osprey a member (D2250 lets him)').toBeNull()
    reload()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, words: String(u.reason ?? '').startsWith(makeAdminUndoWords('u149')), level: levelIn(ACCT.osprey, 'u149', todayIso()) }, `the Undo answered: ${u.reason ?? 'ok'}`)
      .toEqual({ ok: false, words: true, level: 'member' })
  })
})
