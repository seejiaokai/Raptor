// @vitest-environment jsdom
/* THE FIXES OF THE SIGN-IN KINDS REVIEW (K1–K5; helper "kinds", 21 Nov 26) — their further cases, beside the reviewer's
   own proofs (signin-kinds-proof.test.ts). The world: test-support/msq-world.ts (Wed 15 Jul 26; Saber the master admin,
   Hunter 142's plain admin, Ranger 142's member, Kestrel 149's admin, Osprey 149's member). */
import { describe, it, expect, afterEach } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT, on, moveMan } from '../test-support/msq-world'
import { switchUnit, enterSquadron, switchRoleView, resetSession } from './store'
import { setGrant, setHome, unitsLoad, addUnit, places, units, unitRows, homeOn } from './units'
import { updateAccount, accountsLoad, accountById, levelIn, setMaster, isAdminAccount, adminsOf, sessionNow, isMasterAccount } from './accounts'
import { SESSION } from './auth'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { roleOf, ownershipViolation, pageUnit, adminOfPage, mayManageAccounts } from './perms'
import { deriveActor } from '../command/actor'
import { commitSettingsIntent } from './people-settings-commit'
import { store } from '../engine/hooks'
import { globalUndo } from '../undo/timeline'
import * as lw from '../leavewar/state/store'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT) })

const D15 = '2026-07-15', D16 = '2026-07-16'
const nextDay = () => { on(16); unitsLoad(); accountsLoad() }

describe('K1 — a master admin in the member view (D2253): a member at home, View elsewhere; in the admin view as before', () => {
  it('his level: admin everywhere as an admin; in the member view a member of 142 and no more than View of 149', () => {
    signInAs('saber')
    expect(levelIn(ACCT.saber, 'u149', D15)).toBe('admin')
    expect(adminOfPage('schedule')).toBe(true)
    enterSquadron('u149')
    expect(pageUnit('own'), 'the own pages follow his pick while an admin').toBe('u149')
    switchRoleView()
    expect(roleOf()).toBe('member')
    expect(pageUnit('own'), 'his own pages are his own squadron\'s in the member view').toBe('u142')
    expect(adminOfPage('schedule')).toBe(false)
    /* the save check: a setting of 149 written from the member view */
    const env = (id: string) => ({ seq: -1, at: '', actor: deriveActor(), origin: 'user', scope: { module: 'settings' }, type: 'settings.rules', changes: [{ collection: 'settings', id, op: 'put', before: null, after: { x: 1 } }], emit: true } as any)
    expect(ownershipViolation(env('u149@cxreasons'))).not.toBeNull()
    switchRoleView()
    expect(roleOf()).toBe('admin')
    expect(levelIn(ACCT.saber, 'u149', D15), 'a tap puts him back as he was').toBe('admin')
  })
  it('he still reads as an admin of 142 for the bell and the sign-off offers (adminsOf)', () => {
    expect(adminsOf('u142', D15)).toContain(PID.saber)
    expect(adminsOf('u149', D15)).not.toContain(PID.saber)
  })
})

describe('K2 — a master admin is never made a member while he holds the mark (his D2260)', () => {
  it('refused in his words, the callsign Saber\'s; nothing saved; the mark taken off first, it saves', () => {
    signInAs('saber'); expect(setMaster(ACCT.kestrel, true).ok).toBe(true)
    signInAs('kestrel')
    expect(updateAccount(ACCT.saber, { role: 'main' })).toBe('Saber is a master admin — take that off first')
    expect(accountById(ACCT.saber)).toMatchObject({ role: 'admin', master: true })
    /* a plain admin still hears that a master admin's account is a master admin's alone (D2205) */
    signInAs('hunter')
    expect(updateAccount(ACCT.saber, { role: 'main' })).toBe('Only a master admin can do that')
    /* the mark off first, then the role */
    signInAs('kestrel')
    expect(setMaster(ACCT.saber, false).ok).toBe(true)
    expect(updateAccount(ACCT.saber, { role: 'main' })).toBeNull()
    expect(accountById(ACCT.saber)).toMatchObject({ role: 'main' })
    expect(isMasterAccount(ACCT.saber)).toBe(false)
  })
  it('the gate: a hand-made command leaving a member\'s row with the mark is refused, whoever makes it', () => {
    signInAs('saber'); expect(setMaster(ACCT.kestrel, true).ok).toBe(true)
    signInAs('kestrel')
    const forged = commitSettingsIntent('account.update', null, () => {
      store.set('account:' + ACCT.saber, { id: ACCT.saber, name: 'ad', role: 'main', pid: PID.saber, on: true, master: true })
    })
    expect((forged as any).ok).toBe(false)
    accountsLoad()
    expect(accountById(ACCT.saber)).toMatchObject({ role: 'admin', master: true })
  })
  it('the mark is not given to a member (only an admin is a master admin)', () => {
    signInAs('saber')
    expect(setMaster(ACCT.osprey, true).ok).toBe(false)
    expect(isMasterAccount(ACCT.osprey)).toBe(false)
  })
})

describe('K3 — an admin who moves squadron joins as a member (D2160); the first admin of a new squadron arrives as its admin (D2191, D2247)', () => {
  it('Hunter keeps 142 until the date; on it he signs in as a member of 149, is no admin on any list, and is offered no admin control', () => {
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    expect(levelIn(ACCT.hunter, 'u142', D15), 'still 142\'s admin today').toBe('admin')
    expect(levelIn(ACCT.hunter, 'u149', D16)).toBe('member')
    signInAs('hunter')
    expect(roleOf(), 'today').toBe('admin')
    nextDay()
    expect(sessionNow(), 'a session open across midnight is made again').toMatchObject({ role: 'main', acct: 'main' })
    signInAs('hunter')
    expect([roleOf(), SESSION.acct, mayManageAccounts()]).toEqual(['member', 'main', false])
    expect(isAdminAccount(accountById(ACCT.hunter))).toBe(false)
    expect(adminsOf('u149', D16)).not.toContain(PID.hunter)
    expect(adminsOf('u142', D16)).not.toContain(PID.hunter)
    switchRoleView()
    expect(roleOf(), 'no way up through the name badge').toBe('member')
  })
  it('149\'s own admin makes him an admin of 149: recorded for 149 from that day, and it holds', () => {
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    nextDay()
    signInAs('kestrel')
    expect(updateAccount(ACCT.hunter, { role: 'admin' })).toBeNull()
    expect(accountById(ACCT.hunter)).toMatchObject({ role: 'admin', adminOf: 'u149', adminFrom: D16 })
    expect(levelIn(ACCT.hunter, 'u149', D16)).toBe('admin')
    signInAs('hunter'); expect(roleOf()).toBe('admin')
    /* …and Kestrel makes him a member again: the record goes with the role */
    signInAs('kestrel')
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
    expect(accountById(ACCT.hunter)).not.toHaveProperty('adminOf')
    expect(levelIn(ACCT.hunter, 'u149', D16)).toBe('member')
  })
  it('a rename or a suspension of the moved man never makes him an admin', () => {
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    nextDay()
    signInAs('kestrel')
    expect(updateAccount(ACCT.hunter, { name: 'hunter@mail' })).toBeNull()
    expect(levelIn(ACCT.hunter, 'u149', D16)).toBe('member')
    expect(accountById(ACCT.hunter)).not.toHaveProperty('adminOf')
  })
  it('moved back to 142 later, he is a member there too — the role that ended on the date never comes back by itself', () => {
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    nextDay()
    signInAs('saber'); expect(moveMan(PID.hunter, 'u142').ok).toBe(true)
    on(17); unitsLoad(); accountsLoad()
    expect(homeOn(PID.hunter, '2026-07-17')).toBe('u142')
    expect(levelIn(ACCT.hunter, 'u142', '2026-07-17')).toBe('member')
  })
  it('the Undo of his move, before its date, leaves him 142\'s admin as he was', () => {
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    expect(levelIn(ACCT.hunter, 'u149', D16)).toBe('member')
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    unitsLoad()
    expect(levelIn(ACCT.hunter, 'u142', D16)).toBe('admin')
  })
  it('the gate: nobody is recorded an admin of a squadron he is not in, to arrive there as one', () => {
    signInAs('hunter')
    const forge = (row: any) => (commitSettingsIntent('account.update', null, () => { store.set('account:' + ACCT.ranger, row) }) as any).ok
    expect(forge({ id: ACCT.ranger, name: 'us', role: 'admin', pid: PID.ranger, on: true, adminOf: 'u149', adminFrom: D15 }), 'a record naming 149 on a 142 man').toBe(false)
    expect(forge({ id: ACCT.ranger, name: 'us', role: 'admin', pid: PID.ranger, on: true, adminOf: 'u142', adminFrom: '2026-07-01' }), 'a record back-dated').toBe(false)
    expect(forge({ id: ACCT.ranger, name: 'us', role: 'main', pid: PID.ranger, on: true, adminOf: 'u142', adminFrom: D15 }), 'a record on a member\'s row').toBe(false)
    accountsLoad()
    expect(accountById(ACCT.ranger)).toMatchObject({ role: 'main' })
    /* control: his own squadron's admin makes Ranger an admin of 142 by the door */
    expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    expect(levelIn(ACCT.ranger, 'u142', D15)).toBe('admin')
  })
  it('the first admin named by "+ New squadron" moves into it as its admin', () => {
    signInAs('saber')
    const r = addUnit('150', places()[0]!.id, ACCT.hunter)
    expect(r.ok, JSON.stringify(r)).toBe(true)
    const u150 = units().find(u => u.num === '150')!.id
    expect(unitRows().grants.find(g => g.unit === u150)).toMatchObject({ account: ACCT.hunter, level: 'admin', first: true })
    expect(levelIn(ACCT.hunter, 'u142', D15), 'still 142\'s admin').toBe('admin')
    expect(levelIn(ACCT.hunter, u150, D15), 'Plan of the new squadron').toBe('admin')
    expect(moveMan(PID.hunter, u150).ok, 'the master admin moves him in').toBe(true)
    nextDay()
    expect(homeOn(PID.hunter, D16)).toBe(u150)
    expect(levelIn(ACCT.hunter, u150, D16), 'arrived as its admin').toBe('admin')
    expect(levelIn(ACCT.hunter, 'u142', D16)).toBeNull()
    signInAs('hunter'); expect(roleOf()).toBe('admin')
    expect(adminsOf(u150, D16)).toContain(PID.hunter)
  })
  it('…but an ordinary Plan holder who moves into the squadron he held Plan of joins as a member', () => {
    signInAs('saber'); expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    expect(levelIn(ACCT.hunter, 'u149', D15)).toBe('admin')
    expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    nextDay()
    expect(levelIn(ACCT.hunter, 'u149', D16)).toBe('member')
  })
  it('the last-admin rule never counts the moved man as an admin of the squadron he joined (D2184 Q10, D2247)', () => {
    /* the day before: Kestrel is 149's only admin from tomorrow too — Hunter arrives a member */
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    expect(updateAccount(ACCT.kestrel, { on: false }), 'the day before his move').toBe("Kestrel is 149's last admin. Make another admin of 149 first.")
    nextDay()
    signInAs('saber')
    expect(updateAccount(ACCT.kestrel, { on: false }), 'after it').toBe("Kestrel is 149's last admin. Make another admin of 149 first.")
    expect(accountById(ACCT.kestrel)!.on).toBe(true)
    /* the gate, by a hand-made command */
    const forged: any = commitSettingsIntent('account.update', null, () => { store.set('account:' + ACCT.kestrel, { id: ACCT.kestrel, name: 'ad9', role: 'admin', pid: PID.kestrel, on: false }) })
    expect(forged.ok).toBe(false)
    accountsLoad()
    /* made an admin of 149 by Kestrel, Hunter counts: Kestrel may then be suspended */
    signInAs('kestrel'); expect(updateAccount(ACCT.hunter, { role: 'admin' })).toBeNull()
    signInAs('saber'); expect(updateAccount(ACCT.kestrel, { on: false })).toBeNull()
  })
  it('…and 142 loses him on the date: its last other admin cannot go the day before', () => {
    signInAs('saber'); expect(setMaster(ACCT.kestrel, true).ok).toBe(true)
    expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    /* Saber is then 142's only admin from tomorrow: Kestrel, a master admin, cannot suspend him */
    signInAs('kestrel')
    expect(updateAccount(ACCT.saber, { on: false })).toMatch(/Saber is 142's last admin/)
  })
  it('a moved admin is given no Plan while he is a member (only an admin holds Plan — D2250)', () => {
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    nextDay()
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u142', 'admin', PID.hunter).ok).toBe(false)
  })
})

describe('K4 — a squadron\'s own admin moves his own man; the squadron joined is never asked (D2160)', () => {
  it('Hunter moves Ranger to 149: saved, from tomorrow; Ranger arrives a member', () => {
    signInAs('hunter')
    expect(setHome(PID.ranger, 'u149')).toMatchObject({ ok: true })
    unitsLoad()
    expect(homeOn(PID.ranger, D15)).toBe('u142')
    expect(homeOn(PID.ranger, D16)).toBe('u149')
    expect(levelIn(ACCT.ranger, 'u149', D16)).toBe('member')
  })
  it('…and takes it back before the date by his own Undo (D2160: Undo before the date cancels it)', () => {
    signInAs('hunter')
    expect(setHome(PID.ranger, 'u149').ok).toBe(true); unitsLoad()
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    unitsLoad()
    expect(homeOn(PID.ranger, D16)).toBe('u142')
  })
  it('a move the master admin saved is not 142\'s plain admin\'s to cancel (the full check\'s F2 stays)', () => {
    signInAs('saber'); expect(setHome(PID.ranger, 'u149').ok).toBe(true); unitsLoad()
    signInAs('hunter')
    expect(setHome(PID.ranger, 'u142').ok).toBe(false)
    unitsLoad()
    expect(homeOn(PID.ranger, D16)).toBe('u149')
  })
  it('149\'s admin never takes back or redirects a 142 man\'s move into 149 before he arrives', () => {
    signInAs('hunter')
    expect(setHome(PID.ranger, 'u149').ok).toBe(true); unitsLoad()
    signInAs('kestrel')
    expect(setHome(PID.ranger, 'u142').ok, 'he is 142\'s today').toBe(false)
    unitsLoad()
    expect(homeOn(PID.ranger, D16)).toBe('u149')
  })
  it('he cannot move a 149 man — told whose he is, never the gate\'s words; nor pull one into 142', () => {
    signInAs('hunter')
    expect(setHome(PID.osprey, 'u142')).toEqual({ ok: false, message: 'He is 149\'s. Only an admin of 149 can change him.' })
    unitsLoad()
    expect(homeOn(PID.osprey, D16)).toBe('u149')
  })
  it('the gate: a hand-made home row pulling a 149 man into 142 is still refused (the squadron he leaves is asked)', () => {
    signInAs('hunter')
    const r: any = commitSettingsIntent('home.set', null, () => {
      store.set('home:hk1', { id: 'hk1', pid: PID.osprey, unit: 'u142', from: D16 })
    })
    expect(r.ok).toBe(false)
    unitsLoad()
    expect(homeOn(PID.osprey, D16)).toBe('u149')
  })
  it('a member moves nobody; Kestrel, 149\'s admin, moves his own man to 142', () => {
    signInAs('ranger')
    expect(setHome(PID.hunter, 'u149').ok).toBe(false)
    signInAs('kestrel')
    expect(setHome(PID.osprey, 'u142')).toMatchObject({ ok: true })
  })
})

describe('K5 — a balance is typed only for a man of the war loaded (D1695, D2197)', () => {
  const plan149 = () => { signInAs('saber'); expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true); signInAs('hunter'); enterSquadron('u149'); expect(lw.worldUnit()).toBe('u149') }
  it('the door says why; a 149 man\'s figure is still typed by the Plan holder', () => {
    plan149()
    expect(lw.balanceProblem(PID.hunter, 'CCL', 5)).toBe('That person is not on the Leave War')
    expect(lw.setTypedBalance(PID.osprey, 'CCL' as any, 5), 'control: Osprey, 149\'s man').toBe(true)
  })
  it('at home, his own figure in his own war is typed as before', () => {
    signInAs('hunter')
    expect(lw.worldUnit()).toBe('u142')
    expect(lw.setTypedBalance(PID.hunter, 'CCL' as any, 5)).toBe(true)
  })
  it('the gate: a hand-made balance row for a 142 man in 149\'s war is refused', () => {
    plan149()
    const env = { seq: -1, at: '', actor: deriveActor(), origin: 'user', scope: { module: 'lw' }, type: 'lw.balance',
      changes: [{ collection: 'lw.balance', id: `${PID.hunter}:CCL`, op: 'put', before: null, after: { amount: 5, day: D15, by: PID.hunter, snap: [] } }], emit: true } as any
    expect(ownershipViolation(env)).toMatch(/not this war's squadron's/)
    const ok = { ...env, changes: [{ ...env.changes[0], id: `${PID.osprey}:CCL` }] }
    expect(ownershipViolation(ok), 'control: a 149 man').toBeNull()
  })
})

/* (kept last: it ends the session by hand) */
describe('K3 — the session of a man with no account behind it is untouched', () => {
  it('a probe\'s admin session with no account keeps its role', () => {
    resetSession({ user: 'probe', role: 'admin', pid: PID.ranger, name: 'probe' })
    expect(roleOf()).toBe('admin')
    expect(sessionNow()).toBeUndefined()
  })
})
