// @vitest-environment jsdom
/* U2 FIX ROUND 3 — THE SECURITY READER'S S1, CLOSED AT THE ROLE WRITE (his D2903, 28 Nov 26; the addendum
   docs/superpowers/briefs/2026-11-28-msq-s2-u2fix3-addendum.md, which wins over the round's brief).

   The reader's proof 5: a Plan holder of 149 made a man 149's admin in three writes that each passed the gate — his
   person marked a placeholder, his account made an admin's (no admin IN FORCE while a placeholder, so nobody was "made"),
   the mark taken off. The brief's fix 1 would have had the gate watch the marks. His ruling made that unnecessary and it
   is NOT built: "made an admin" is now one thing — a role newly an admin's of his squadron, whatever his switch, his
   archive or his marks (units-model.ts madeAdminsIn) — so step 2 is refused where it stands, and no mark is watched, by
   the gate (perms.ts madeAdminViolation) or by the Undo (undo-wire.ts makeAdminStuck).

   Kept from the reader's proof 5: its premise and its first case, which must still end refused. DROPPED: its "Enable
   twin" (Osprey, 149's admin switched off by Kestrel, marked a placeholder, switched on, the mark taken off) — by D2903
   Hunter may simply Enable him, so the twin proves nothing wrong any more (the Enable itself: state/msq-s2-u2fix3-d2903).
   Added: the Undo of a mark alone, which goes through for a Plan holder — the man was an admin all along. */
import { describe, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, on, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, updateAccount, addAccount, accountById, accountOfPid, accountsLoad, levelIn, mayGivePlanNow, adminNow, adminLineAudience, signIn, sessionFor, ACCOUNT_PFX } from './accounts'
import { unitsLoad, todayIso } from './units'
import { enterSquadron } from './store'
import { commitSettingsIntent, commitPeopleIntent } from './people-settings-commit'
import { store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { setSession, setMe, SESSION } from './auth'
import { globalUndo } from '../undo/timeline'
import { rosterOf } from '../engine/roster'

withThird()
const reload = (): void => { unitsLoad(); accountsLoad() }
const asHunter = (): void => { on(15, 11); signInAs('hunter'); enterSquadron('u149'); reload() }
const inForce = () => {
  const a = accountById(ACCT.osprey)!
  const p: any = (PEOPLE as any)[PID.osprey]
  return {
    role: a.role, on: a.on, placeholder: !!p.special,
    adminOf149: adminNow(a) && a.on && !p.special && !p.archived && levelIn(ACCT.osprey, 'u149', todayIso()) === 'admin',
    told: adminLineAudience('u149').includes(PID.osprey),
  }
}
const mark = (special: boolean): any => commitPeopleIntent('people.edit', { owner: PID.osprey }, () => {
  if (special) (PEOPLE as any)[PID.osprey].special = true
  else delete (PEOPLE as any)[PID.osprey].special
})

describe('security 5 — a Plan holder of 149 makes a man 149\'s admin through the placeholder mark', () => {
  it('premise: Hunter may not make an admin of 149, and the plain forged write is refused', () => {
    asHunter()
    expect(mayGivePlanNow('u149')).toBe(false)
    expect(updateAccount(ACCT.osprey, { role: 'admin' })).toBe("Only 149's own admins or a master admin can make an admin of 149.")
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null) ?? { id: ACCT.osprey, name: 'us9', role: 'main', pid: PID.osprey, on: true }
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, role: 'admin', adminAt: Date.now() }) })
    reload()
    expect({ ok: r.ok, role: accountById(ACCT.osprey)!.role }).toEqual({ ok: false, role: 'main' })
  })
  it('Osprey, 149\'s member: marked a placeholder, made an admin, the mark taken off — he must not end 149\'s admin', () => {
    asHunter()
    const r1 = mark(true)
    reload()
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    expect(row, 'setup: Osprey\'s stored account row').toBeTruthy()
    const r2: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, role: 'admin', adminAt: Date.now() }) })
    reload()
    const r3 = mark(false)
    reload()
    expect({ steps: [r1.ok !== false, r2.ok !== false, r3.ok !== false], ...inForce() },
      `the gate answered: 1 ${(r1 as any).message ?? 'ok'} · 2 ${r2.message ?? 'ok'} · 3 ${(r3 as any).message ?? 'ok'}`)
      .toMatchObject({ role: 'main', adminOf149: false, told: false })
  })
  it('…and it is the ROLE write that is refused, behind the mark as in front of it: the two mark writes go through', () => {
    asHunter()
    const r1 = mark(true)
    reload()
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null)
    const r2: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, role: 'admin', adminAt: Date.now() }) })
    reload()
    const r3 = mark(false)
    reload()
    expect([r1.ok !== false, r2.ok !== false, r3.ok !== false]).toEqual([true, false, true])
    expect(String(r2.message ?? '')).toMatch(/a man made an admin of u149 by one who may not give its Plan/)
  })
})

/* ---- NO MARK IS WATCHED (the addendum's 5 and 6): a step that changes a man's mark and no account row makes no role
   newly an admin's, so its Undo is nobody's "making an admin" — whoever may manage the squadron's people may press it,
   and the man returns with the role he had (D2903). ---- */
describe('the Undo of a mark alone that puts an admin back in force', () => {
  /* another device: sign in there and act, the Undo list of the one held left as it stands */
  const elsewhere = (name: string, pass: string, pid: string, fn: () => void): void => {
    const s = SESSION, me = s ? String(accountById(s.user)?.pid ?? '') : ''
    setSession(sessionFor(signIn(name, pass))); setMe(pid)
    try { fn() } finally { setSession(s); setMe(me); reload() }
  }
  /* Kestrel, 149's own admin: Osprey made an admin, then marked a placeholder (a people-only step, the top of his list) */
  function kestrelMarksOsprey(): void {
    signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
    reload()
    expect(mark(true).ok !== false, 'setup: Kestrel marks Osprey a placeholder').toBe(true)
    reload()
    expect(inForce()).toMatchObject({ role: 'admin', placeholder: true, adminOf149: false })
  }
  it('pressed by Kestrel, moved to 142 and holding only Plan of 149: it goes through — Osprey was 149\'s admin all along', () => {
    kestrelMarksOsprey()
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
    expect(mayGivePlanNow('u149'), 'a Plan holder of 149, not its own admin').toBe(false)
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, ...inForce() }, `the Undo answered: ${u.reason ?? 'ok'}`).toMatchObject({ ok: true, placeholder: false, adminOf149: true })
  })
  it('control: pressed by Kestrel while still 149\'s own admin, the same Undo goes through — Osprey 149\'s admin in force again', () => {
    kestrelMarksOsprey()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, ...inForce() }, `the Undo answered: ${u.reason ?? 'ok'}`).toMatchObject({ ok: true, placeholder: false, adminOf149: true })
  })
})
