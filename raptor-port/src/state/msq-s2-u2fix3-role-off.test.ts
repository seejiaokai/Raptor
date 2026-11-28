// @vitest-environment jsdom
/* U2 FIX ROUND 3, FIX 2 (the security reader's S2 — the brief docs/superpowers/briefs/2026-11-28-msq-s2-u2fix3-brief.md):
   a role newly an admin's is "made" whatever his switch or archive (units-model.ts madeAdminsIn) — since his D2903
   (28 Nov 26, the round's addendum) the WHOLE rule, at the gate and at the Undo: bringing an admin back is not making
   one, writing an admin's role is. The reader's proof 6, copied whole; then his unproven lead built as a test of its
   own (the Redo, under it), and the honest roads the brief names that no older file holds. The reader's words (written
   while round 1's fix 4 still stood, which is why they speak of "in force"):
   SECURITY READ OF U2 FIX ROUND 2 — PROOF 6: THE DOOR AND THE GATE ANSWER DIFFERENTLY ON A ROLE WRITTEN WHILE THE MAN IS NOT
   IN FORCE. The door (accounts.ts updateAccount, Q8) asks "would he be an admin of his squadron" of the row it leaves,
   whatever its switch (adminNow reads no switch), and refuses a Plan holder. The gate (units-model.ts madeAdminsIn) counts
   a man as made an admin only where he is IN FORCE after the command — so the same role change on a sign-in that is
   switched off, or whose man is archived, makes nobody an admin and goes through for anyone who may change the account,
   a Plan holder of his squadron among them. What it leaves is an admin's sign-in nobody entitled ever made: the next
   Enable or Restore by 149's own admin — who suspended or archived a MEMBER — brings back an admin. */
import { describe, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, on, PID, ACCT } from '../test-support/msq-world'
import { updateAccount, saveAccess, addAccount, accountById, accountOfPid, accountsLoad, levelIn, mayGivePlanNow, signIn, sessionFor, ACCOUNT_PFX } from './accounts'
import { unitsLoad, todayIso } from './units'
import { enterSquadron } from './store'
import { commitSettingsIntent } from './people-settings-commit'
import { archivePerson, restoreArchivedPerson } from '../leavewar/sync'
import { store } from '../engine/hooks'
import { setSession, setMe, SESSION } from './auth'
import { globalUndo, globalRedo } from '../undo/timeline'
import { rosterOf } from '../engine/roster'
import { PEOPLE } from '../engine/people'

withThird()
const reload = (): void => { unitsLoad(); accountsLoad() }
const asHunter = (): void => { on(15, 11); signInAs('hunter'); enterSquadron('u149'); reload() }
const MAKE = "Only 149's own admins or a master admin can make an admin of 149."

describe('security 6 — a Plan holder of 149 writes an admin\'s role onto a 149 sign-in that is not in force', () => {
  it('Osprey, 149\'s member, switched off by Kestrel: the door refuses Hunter the role; the gate must refuse the same write', () => {
    signInAs('kestrel')
    expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Kestrel switches Osprey, a member, off').toBeNull()
    reload()
    asHunter()
    expect(mayGivePlanNow('u149')).toBe(false)
    expect(updateAccount(ACCT.osprey, { role: 'admin' }), 'the door').toBe(MAKE)
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, role: 'admin', adminAt: Date.now() }) })
    reload()
    expect({ ok: r.ok !== false, role: accountById(ACCT.osprey)!.role }, `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: false, role: 'main' })
  })
  it('…and what it leaves: Kestrel switches the "member" he suspended back on, and 149 has an admin its own admins never made', () => {
    signInAs('kestrel')
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    reload()
    asHunter()
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, role: 'admin', adminAt: Date.now() }) })
    reload()
    on(15, 12); signInAs('kestrel'); reload()
    expect(updateAccount(ACCT.osprey, { on: true }), 'Kestrel\'s Enable').toBeNull()
    reload()
    expect(levelIn(ACCT.osprey, 'u149', todayIso()), 'Osprey was a member when Kestrel switched him off').toBe('member')
  })
  it('Osprey, 149\'s member, archived by Kestrel: the gate must refuse Hunter an admin\'s role on his sign-in', () => {
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey, a member').toBeNull()
    reload()
    asHunter()
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, role: 'admin', adminAt: Date.now() }) })
    reload()
    on(16, 9); signInAs('kestrel'); enterSquadron('u149'); reload()
    const back = restoreArchivedPerson(PID.osprey, todayIso())
    reload()
    expect({ gate: r.ok !== false, restored: back, level: levelIn(ACCT.osprey, 'u149', todayIso()) }, `the gate answered: ${r.message ?? 'ok'}`)
      .toEqual({ gate: false, restored: true, level: 'member' })
  })
})

/* ---- THE READER'S LEAD, BUILT (U2 fix round 3, fix 2): the same gap reached from the screen by a Redo. Kestrel, 149's
   own admin, suspends Osprey (a member), makes him an admin and undoes it; later Kestrel holds only Plan of 149 — moved
   to 142 by Saber, re-made 142's admin and given Plan of 149 (the road state/msq-s2-u2-replay.test.ts uses) — and presses
   Redo. The Undo's own check (undo-wire.ts makeAdminStuck) asks the one helper the gate asks, so before the fix the Redo
   went through: Osprey's sign-in, still switched off, stored an admin's role its own admins had taken back. ---- */
const OUT_OF_BAND = 'Something else changed this after your action — it can’t be undone now.'
/* another device: sign in there and act, the Undo list of the one held left as it stands (signInAs would start a fresh one) */
const elsewhere = (name: string, pass: string, pid: string, fn: () => void): void => {
  const s = SESSION, me = s ? String(accountById(s.user)?.pid ?? '') : ''
  setSession(sessionFor(signIn(name, pass))); setMe(pid)
  try { fn() } finally { setSession(s); setMe(me); reload() }
}
const ospreyRow = (): string => JSON.stringify(store.get(ACCOUNT_PFX + ACCT.osprey, null))

describe('U2 fix 3, fix 2 — the Redo of "made an admin" of a switched-off sign-in, pressed by one who now holds only Plan of 149', () => {
  it('Kestrel suspends Osprey, makes him an admin, undoes it; moved to 142 and given Plan of 149 he presses Redo: refused in the Redo\'s out-of-band words, nothing written', () => {
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Kestrel switches Osprey, a member, off').toBeNull()
    reload()
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel, 149\'s own admin, makes the suspended man an admin (he may)').toBeNull()
    reload()
    expect({ role: accountById(ACCT.osprey)!.role, on: accountById(ACCT.osprey)!.on }).toEqual({ role: 'admin', on: false })
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, role: accountById(ACCT.osprey)!.role }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, role: 'main' })
    /* Saber, elsewhere: an extra admin of 149's own (so Kestrel's move is not its last admin's), then Kestrel moved to 142
       from the 16th */
    elsewhere('ad', 'a', PID.saber, () => {
      enterSquadron('u149'); reload()
      const free = rosterOf('u149', todayIso()).find(p => !accountOfPid(p) && !(PEOPLE as any)[p]?.special && !(PEOPLE as any)[p]?.archived)
      expect(free, 'setup: a 149 man with no sign-in').toBeTruthy()
      expect(addAccount('extra@mail', free!, 'admin'), 'setup: Saber adds an extra 149 admin').toBeNull()
      expect(moveMan(PID.kestrel, 'u142'), 'setup: Saber moves Kestrel to 142 from the 16th').toMatchObject({ ok: true })
    })
    on(16, 9); reload()
    elsewhere('ad', 'a', PID.saber, () => {
      enterSquadron('u142'); reload()
      expect(saveAccess(ACCT.kestrel, { role: 'admin', grants: { u149: 'plan' } }), 'setup: Saber re-makes him 142\'s admin with Plan of 149').toBeNull()
    })
    enterSquadron('u149'); reload()
    expect({ level: levelIn(ACCT.kestrel, 'u149', todayIso()), mayMake: mayGivePlanNow('u149') }, 'a Plan holder of 149, not its own admin')
      .toEqual({ level: 'admin', mayMake: false })
    const row0 = ospreyRow()
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, words: String(r.reason ?? '').startsWith(OUT_OF_BAND), role: accountById(ACCT.osprey)!.role, on: accountById(ACCT.osprey)!.on, rowSame: ospreyRow() === row0 },
      `the Redo answered: ${r.reason ?? 'ok'}`).toEqual({ ok: false, words: true, role: 'main', on: false, rowSame: true })
  })
  it('control: the same Redo pressed by Kestrel while still 149\'s own admin goes through — Osprey an admin again, still switched off', () => {
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    reload()
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    reload()
    expect(globalUndo().ok).toBe(true)
    reload()
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, role: accountById(ACCT.osprey)!.role, on: accountById(ACCT.osprey)!.on }, `the Redo answered: ${r.reason ?? 'ok'}`)
      .toEqual({ ok: true, role: 'admin', on: false })
  })
})

/* ---- THE HONEST ROADS STILL GO THROUGH (the brief's list; the older suites hold the rest — Restore and Enable by one who
   may, the posting pass, a first admin arriving by a move, the Undo of "made a member" by one who may) ---- */
describe('U2 fix 3, fix 2 — 149\'s own admin still makes a man who is out of force an admin', () => {
  it('Kestrel makes Osprey, switched off, an admin written past the door; and his Enable brings back the admin he made', () => {
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    reload()
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, role: 'admin', adminAt: Date.now() }) })
    reload()
    expect({ ok: r.ok !== false, role: accountById(ACCT.osprey)!.role }, `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: true, role: 'admin' })
    expect(updateAccount(ACCT.osprey, { on: true }), 'Kestrel\'s Enable').toBeNull()
    reload()
    expect(levelIn(ACCT.osprey, 'u149', todayIso())).toBe('admin')
  })
  it('Kestrel makes Osprey, archived, an admin written past the door: the gate lets 149\'s own admin', () => {
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey, a member').toBeNull()
    reload()
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, role: 'admin', adminAt: Date.now() }) })
    reload()
    expect({ ok: r.ok !== false, role: accountById(ACCT.osprey)!.role }, `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: true, role: 'admin' })
  })
  it('Hunter (Plan of 149) still makes a 149 member\'s plain changes: a Suspend and an Enable of Osprey, a member, go through', () => {
    asHunter()
    expect(updateAccount(ACCT.osprey, { on: false }), 'Hunter suspends a member').toBeNull()
    reload()
    expect(updateAccount(ACCT.osprey, { on: true }), 'Hunter enables a member').toBeNull()
    reload()
    expect({ on: accountById(ACCT.osprey)!.on, level: levelIn(ACCT.osprey, 'u149', todayIso()) }).toEqual({ on: true, level: 'member' })
  })
})
