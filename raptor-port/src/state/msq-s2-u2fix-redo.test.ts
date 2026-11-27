// @vitest-environment jsdom
/* U2 FIX ROUND 1, FIX 2 (opus1 F2, opus2 F2, security S4 — one fault; the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u2fix-brief.md): a Redo is refused whole, never halved. The Redo of ONE Save
   "make Ranger an admin and give him Plan of 149", pressed by one who may make a 142 admin but may NOT give Plan of 149
   today (Saber, his master mark taken off by Hunter since), went through as half the step: Ranger made an admin, the
   Plan silently left out. The one put-back left out rather than refused is the Undo of "made a member" (R3 (c)); its Redo
   drops the Plan under the member's drop (D2250). state/undo-wire.ts planRestoreStuck now asks whether the step itself
   was "made a member" (its forward images) before either skip. Copied from the three readers' proofs; the last two
   cases hold the make-member pair as it was. */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, PID, ACCT } from '../test-support/msq-world'
import { signIn, sessionFor, saveAccess, setMaster, accountById, accountsLoad, levelIn } from './accounts'
import { unitsLoad, todayIso, unitRows } from './units'
import { setSession, setMe, SESSION } from './auth'
import { globalUndo, globalRedo } from '../undo/timeline'
import { NOTICES } from './notices'

withThird()

const reload = () => { unitsLoad(); accountsLoad() }
const level = (acct: string, unit: string) => { reload(); return levelIn(acct, unit, todayIso()) }

/* Saber (master) makes Hunter a second master admin; Saber's one Save makes Ranger an admin with Plan of 149; Saber
   undoes it; Hunter, on another device, takes Saber's mark off; back on Saber's device */
function saberUnmarkedAfterUndo(): void {
  signInAs('saber')
  expect(setMaster(ACCT.hunter, true).ok, 'setup: Saber makes Hunter a second master admin').toBe(true)
  reload()
  expect(saveAccess(ACCT.ranger, { role: 'admin', grants: { u149: 'plan' } }), 'setup: one Save, Admin and Plan of 149').toBeNull()
  expect(level(ACCT.ranger, 'u149')).toBe('admin')
  const u = globalUndo()
  expect(u.ok, `setup: Saber undoes it: ${u.reason}`).toBe(true)
  expect(accountById(ACCT.ranger)?.role).toBe('main')
  const sab = SESSION
  setSession(sessionFor(signIn('ad2', 'a2'))); setMe(PID.hunter)
  expect(setMaster(ACCT.saber, false).ok, 'setup: Hunter takes the mark off Saber').toBe(true)
  setSession(sab); setMe(PID.saber); reload()
  expect(accountById(ACCT.saber)?.master, 'Saber no longer a master admin').not.toBe(true)
}

describe('U2 fix 2 — the Redo of "made an admin and given Plan" is refused whole', () => {
  it('Saber, no longer a master admin, presses Redo: refused whole — nothing written, no line of a Plan not given', () => {
    saberUnmarkedAfterUndo()
    const g0 = JSON.stringify(unitRows().grants)
    const r = globalRedo()
    reload()
    const told = NOTICES.filter(n => (n.what || []).some((p: any) => (p.k === 'sqplan' && p.c === 'given' && p.who === PID.ranger) || (p.k === 'acct' && p.c === 'plan' && String(n.to) === PID.ranger)))
      .map(n => `${n.to}: ${JSON.stringify(n.what)}`)
    expect({ ok: r.ok, role: accountById(ACCT.ranger)?.role, plan149: levelIn(ACCT.ranger, 'u149', todayIso()), grantsSame: JSON.stringify(unitRows().grants) === g0, told },
      `the Redo answered: ${r.reason ?? 'ok'}`).toEqual({ ok: false, role: 'main', plan149: 'view', grantsSame: true, told: [] })
  })
  it('control: the Undo of the same Save, pressed by Saber unmarked, is refused whole too', () => {
    signInAs('saber')
    const sab = SESSION
    expect(setMaster(ACCT.hunter, true)).toEqual({ ok: true })
    reload()
    expect(saveAccess(ACCT.ranger, { role: 'admin', grants: { u149: 'plan' } })).toBeNull()
    setSession(sessionFor(signIn('ad2', 'a2'))); setMe(PID.hunter)
    expect(setMaster(ACCT.saber, false)).toEqual({ ok: true })
    setSession(sab); setMe(PID.saber); reload()
    const r = globalUndo()
    reload()
    expect({ ok: r.ok, role: accountById(ACCT.ranger)?.role, plan149: levelIn(ACCT.ranger, 'u149', todayIso()) },
      `the Undo answered: ${r.reason ?? 'ok'}`).toEqual({ ok: false, role: 'admin', plan149: 'admin' })
  })
})

describe('U2 fix 2 — the make-member pair keeps its leave-outs (R3 (c), D2250)', () => {
  it('Ranger (a plain 142 admin) makes Hunter (Plan of 149) a member, his Plan ends; Ranger\'s Undo puts the role back with the Plan left out; his Redo drops it again', () => {
    /* Saber makes a plain 142 admin, Ranger, who may not give Plan of 149 but may make Hunter a member and back */
    signInAs('saber')
    expect(saveAccess(ACCT.ranger, { role: 'admin' }), 'setup: Saber makes Ranger a 142 admin').toBeNull()
    reload()
    signInAs('ranger')
    expect(level(ACCT.hunter, 'u149'), 'setup: Hunter holds Plan of 149').toBe('admin')
    expect(saveAccess(ACCT.hunter, { role: 'main' }), 'Ranger makes Hunter a member — his Plan of 149 ends (D2250)').toBeNull()
    reload()
    expect(accountById(ACCT.hunter)?.role).toBe('main')
    expect(levelIn(ACCT.hunter, 'u149', todayIso())).not.toBe('admin')
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, role: accountById(ACCT.hunter)?.role, plan: levelIn(ACCT.hunter, 'u149', todayIso()) === 'admin' },
      `the Undo answered: ${u.reason ?? 'ok'}`).toEqual({ ok: true, role: 'admin', plan: false })
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, role: accountById(ACCT.hunter)?.role, plan: levelIn(ACCT.hunter, 'u149', todayIso()) === 'admin' },
      `the Redo answered: ${r.reason ?? 'ok'}`).toEqual({ ok: true, role: 'main', plan: false })
  })
})
