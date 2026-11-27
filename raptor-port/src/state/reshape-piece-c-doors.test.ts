// @vitest-environment jsdom
/* PIECE C AT EVERY DOOR (the reshape plan §5.2, §5.4): the one words table, and every door that can take a squadron's
   last admin away saying the lock in it — Suspend, Demote, Archive, Delete, the Undo of an account step, the removal and
   lowering of a right, "+ New squadron", a move of squadron, a re-link and a posting; and the commit gate holding the
   same for the new commands it now judges (a right, a squadron) when written past the door. The world: Wed 15 Jul 26,
   the seeded sign-ins (test-support/msq-world.ts). */
import { describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { updateAccount, deleteAccountProblem, lastAdminIfGone, accountsRestoreProblem, ACCOUNTS_LIST, accountOfPid, levelIn } from './accounts'
import { addUnit, removeGrant, setGrant, setHome, unitRows, unitsLoad, todayIso } from './units'
import { GRANT_PFX, UNIT_PFX, UNITPLACE_PFX } from './units-model'
import { archiveProblem, poHeldReason } from '../leavewar/sync'
import { commitSettingsIntent } from './people-settings-commit'
import { store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { globalUndo, globalRedo } from '../undo/timeline'
import { rosterToday } from '../engine/roster'

useMsqWorld()

/* 150 made by the master, Hunter its first admin (his Plan of it — its only admin) */
function plan150(): string {
  signInAs('saber')
  const r = addUnit('150', 'p1', ACCT.hunter)
  expect(r.ok, JSON.stringify(r)).toBe(true)
  return r.id!
}
const HUNTER_150 = "Hunter is 150's last admin. Make another admin of 150 first."

describe('the words table', () => {
  it('today — "Kestrel is 149\'s last admin. Make another admin of 149 first."', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.kestrel, { on: false })).toBe("Kestrel is 149's last admin. Make another admin of 149 first.")
  })
  it('a later date — the approved drawing\'s words, with the day and the move that makes it', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.osprey, { role: 'admin' })).toBeNull()
    expect(setHome(PID.osprey, 'u142').ok).toBe(true)
    expect(updateAccount(ACCT.kestrel, { on: false }))
      .toBe("Kestrel is 149's last admin from Thu 16 Jul, when Osprey moves to 142. Make another admin of 149 first.")
  })
  it("to one who cannot make an admin there (his D2246): Ranger, 142's admin, switching Hunter off — 150's only admin", () => {
    plan150()
    expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    signInAs('ranger')
    expect(levelIn(ACCT.ranger, unitRows().units.find(u => u.num === '150')!.id, rosterToday()), 'Ranger is no admin of 150').toBeNull()
    /* (RE-POINTED AT U2 — his D2816: 150 has no admin of its own, only Hunter's Plan, so only a master admin can make
       another; the words were "Only a master admin or an admin of 150 can make another.") */
    expect(updateAccount(ACCT.hunter, { on: false })).toBe("Hunter is 150's last admin. Only a master admin can make another.")
    expect(ACCOUNTS_LIST.find(a => a.id === ACCT.hunter)!.on, 'nothing saved').toBe(true)
  })
})

describe('every door says the lock — Hunter, the only admin of 150 (his Plan of it)', () => {
  it('Suspend', () => { plan150(); expect(updateAccount(ACCT.hunter, { on: false })).toBe(HUNTER_150) })
  it('Demote (his Plan goes with the demotion — R7)', () => { plan150(); expect(updateAccount(ACCT.hunter, { role: 'main' })).toBe(HUNTER_150) })
  it('Archive', () => { plan150(); expect(archiveProblem(PID.hunter)).toBe(HUNTER_150) })
  it('Delete', () => { plan150(); expect(deleteAccountProblem(PID.hunter)).toBe(HUNTER_150) })
  it('his Plan taken away', () => {
    const u = plan150()
    expect(removeGrant(ACCT.hunter, u)).toEqual({ ok: false, message: HUNTER_150 })
    expect(levelIn(ACCT.hunter, u, rosterToday())).toBe('admin')
  })
  it('his Plan lowered to View', () => {
    const u = plan150()
    expect(setGrant(ACCT.hunter, u, 'view', PID.hunter)).toEqual({ ok: false, message: HUNTER_150 })
    expect(levelIn(ACCT.hunter, u, rosterToday())).toBe('admin')
  })
  it('his sign-in re-linked to another man (every right dropped with the link — guardrail 1)', () => {
    plan150()
    const other = Object.keys(PEOPLE).find(pid => {
      const p = (PEOPLE as any)[pid]
      return p && !p.special && !p.archived && !p.deleted && !accountOfPid(pid) && pid !== PID.hunter
    })!
    expect(other, 'a man with no sign-in to link it to').toBeTruthy()
    expect(updateAccount(ACCT.hunter, { pid: other })).toBe(HUNTER_150)
  })
  it('a posting (Overseas Sqn) waits, in its own words', () => {
    plan150()
    expect(lastAdminIfGone(PID.hunter)).toBe(HUNTER_150)
    expect(poHeldReason(PID.hunter, 'overseas')).toBe("Hunter is 150's last admin. The posting waits until 150 has another admin.")
  })
  it('the Undo of an account step (the restore leaving his sign-in off)', () => {
    plan150()
    const list = ACCOUNTS_LIST.map(a => (a.id === ACCT.hunter ? { ...a, on: false } : a))
    expect(accountsRestoreProblem(list, null, PEOPLE as any)).toBe(HUNTER_150)
  })
  it('(control) another admin of 150 first — a second Plan, Kestrel\'s: Hunter\'s Plan then goes', () => {
    const u = plan150()
    expect(setGrant(ACCT.kestrel, u, 'admin', PID.kestrel).ok).toBe(true)
    expect(removeGrant(ACCT.hunter, u).ok).toBe(true)
  })
})

describe('the other doors', () => {
  it('"+ New squadron" with no first admin', () => {
    signInAs('saber')
    expect(addUnit('150', 'p1')).toEqual({ ok: false, message: "Name the squadron's first admin." })
  })
  it("a move of squadron — Kestrel, 149's only admin, to 142", () => {
    signInAs('saber')
    expect(setHome(PID.kestrel, 'u142')).toEqual({ ok: false, message: "Kestrel is 149's last admin. Make another admin of 149 first." })
  })
})

describe('the Undo and Redo of "+ New squadron" and its first admin\'s right (§5.4)', () => {
  it('its Undo takes the squadron and his Plan away (a squadron removed whole is not judged); its Redo puts both back', () => {
    const u = plan150()
    const und = globalUndo() as any
    expect(und.ok, JSON.stringify(und)).toBe(true)
    unitsLoad()
    expect(unitRows().units.some(x => x.id === u), 'the squadron gone').toBe(false)
    expect(unitRows().grants.some(g => g.unit === u), 'his Plan gone with it').toBe(false)
    const red = globalRedo() as any
    expect(red.ok, JSON.stringify(red)).toBe(true)
    unitsLoad()
    expect(unitRows().units.some(x => x.id === u), 'the squadron back').toBe(true)
    expect(levelIn(ACCT.hunter, u, rosterToday()), 'its first admin back').toBe('admin')
  })
})

describe('the gate holds it past the door — the commands it now judges', () => {
  it("150's only Plan removed by a write past removeGrant: refused, the Plan kept", () => {
    const u = plan150()
    const g = unitRows().grants.find(x => x.unit === u && x.account === ACCT.hunter)!
    const r = commitSettingsIntent('grant.remove', null, () => { store.set(GRANT_PFX + g.id, null) }) as any
    expect(r.ok).toBe(false)
    unitsLoad()
    expect(levelIn(ACCT.hunter, u, rosterToday())).toBe('admin')
  })
  it("150's only Plan lowered to View past setGrant: refused", () => {
    const u = plan150()
    const g = unitRows().grants.find(x => x.unit === u && x.account === ACCT.hunter)!
    const r = commitSettingsIntent('grant.set', null, () => { store.set(GRANT_PFX + g.id, { ...g, level: 'view', from: todayIso() }) }) as any
    expect(r.ok).toBe(false)
    unitsLoad()
    expect(levelIn(ACCT.hunter, u, rosterToday())).toBe('admin')
  })
  it('a squadron made with no admin, past addUnit: refused', () => {
    signInAs('saber')
    const r = commitSettingsIntent('unit.add', null, () => {
      store.set(UNIT_PFX + 'ux1', { id: 'ux1', num: '151', kind: 'sqn' })
      store.set(UNITPLACE_PFX + 'upx1', { id: 'upx1', unit: 'ux1', place: 'p1', from: todayIso() })
    }) as any
    expect(r.ok).toBe(false)
    unitsLoad()
    expect(unitRows().units.some(u => u.id === 'ux1')).toBe(false)
  })
  it('(control) the same squadron with its first admin, past addUnit: saved', () => {
    signInAs('saber')
    const r = commitSettingsIntent('unit.add', null, () => {
      store.set(UNIT_PFX + 'ux2', { id: 'ux2', num: '152', kind: 'sqn' })
      store.set(UNITPLACE_PFX + 'upx2', { id: 'upx2', unit: 'ux2', place: 'p1', from: todayIso() })
      /* (its moment — batch 1's second half, §16 D1′: a Plan is dated now as well as today) */
      store.set(GRANT_PFX + 'gx2', { id: 'gx2', account: ACCT.hunter, unit: 'ux2', level: 'admin', from: todayIso(), fromAt: Date.now() })
    }) as any
    expect(r.ok, JSON.stringify(r)).toBe(true)
  })
})
