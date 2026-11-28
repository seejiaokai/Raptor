// @vitest-environment jsdom
/* U2 FIX ROUND 4, PART 3 — A 149 ADMIN'S ROW HANDED TO ANOTHER SIGN-IN BY ONE WHO MAY NOT MAKE AN ADMIN OF 149 (Fable's
   proof 1 of the round 3 re-read, reproduced by the host; his D2806, D2903).

   The rule: only 149's own admins or a master admin may make a man 149's admin (D2806). D2903 opened Enable to whoever
   may manage 149's people, a Plan holder too. A re-link (the sign-in put on another MAN) was asked the make-an-admin
   question; its mirror — the admin row put on another SIGN-IN, by changing its sign-in name — was asked nothing: Hunter
   (142's admin, Plan of 149) changed a switched-off 149 admin's sign-in name to a mail of his choosing and pressed Enable,
   and whoever signed in with that mail was 149's own admin. Changing the sign-in of an admin of his home squadron hands
   that admin seat to someone new, so it is making an admin, under the same rule (the coordinator's reading, agreed):
   both doors (saveAccess, updateAccount), the gate (units-model.ts madeAdminsIn, the one helper — a rename, or the row
   deleted and re-made under another name, counts) and Undo / Redo (undo-wire.ts makeAdminStuck asks the same helper).

   Not changed: a member's rename (not an admin), who may Enable (D2903), the screen. The first five cases are Fable's
   proof as it was written (its premise and control kept); the rest are the host's. */
import { describe, expect, it } from 'vitest'
import { withThird, signInAs, on, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, updateAccount, addAccount, accountByName, accountById, accountOfPid, accountsLoad, mayGivePlanNow, levelIn, makeAdminUndoWords, setMaster, signIn, sessionFor, ACCOUNT_PFX } from './accounts'
import { unitsLoad, todayIso } from './units'
import { enterSquadron } from './store'
import { commitSettingsIntent } from './people-settings-commit'
import { setSession, setMe, SESSION } from './auth'
import { globalUndo, globalRedo } from '../undo/timeline'
import { store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'

withThird()
const reload = (): void => { unitsLoad(); accountsLoad() }
const MAKE = "Only 149's own admins or a master admin can make an admin of 149."
const SIGNIN = "Only 149's own admins or a master admin can change a 149 admin's sign-in."
const freeMan = (): string | undefined =>
  rosterOf('u149', todayIso()).find(p => !accountOfPid(p) && !(PEOPLE as any)[p]?.special && !(PEOPLE as any)[p]?.archived)

/* Kestrel, 149's own admin: gives a 149 man a sign-in as an admin, then suspends him (D2903's own example) */
function kestrelSuspendsA149Admin(): string {
  on(15, 9); signInAs('kestrel'); enterSquadron('u149'); reload()
  const free = freeMan()
  expect(free, 'setup: a 149 man with no sign-in').toBeTruthy()
  expect(addAccount('talon@mail', free!, 'admin'), 'setup: Kestrel gives him a sign-in, an admin').toBeNull()
  reload()
  const id = accountByName('talon@mail')!.id
  expect(updateAccount(id, { on: false }), 'setup: Kestrel suspends him').toBeNull()
  reload()
  return id
}
const asHunter = (): void => { on(15, 11); signInAs('hunter'); enterSquadron('u149'); reload() }
/* the row past the door: the stored account row changed by `fn` in one account command, as the actor signed in */
const pastDoor = (fn: () => void): { ok: boolean; message?: string } => commitSettingsIntent('account.update', null, fn) as any
/* another device: sign in there and act, the Undo list of the one held left as it stands */
const elsewhere = (name: string, pass: string, pid: string, fn: () => void): void => {
  const s = SESSION, me = s ? String(accountById(s.user)?.pid ?? '') : ''
  setSession(sessionFor(signIn(name, pass))); setMe(pid)
  try { fn() } finally { setSession(s); setMe(me); reload() }
}

describe('fable 1 — a 149 admin\'s row moved onto another sign-in by one who may not make an admin of 149', () => {
  it('premise: Hunter (Plan of 149) may not make an admin of 149 — the Role box and a re-link are refused him', () => {
    const id = kestrelSuspendsA149Admin()
    asHunter()
    expect(mayGivePlanNow('u149')).toBe(false)
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBe(MAKE)
    /* the sign-in put on another man (a re-link): refused in the same sentence */
    const other = freeMan()
    expect(other, 'setup: another 149 man with no sign-in').toBeTruthy()
    expect(updateAccount(id, { pid: other! })).toBe(MAKE)
  })
  it('the door: Hunter changes the suspended admin\'s sign-in name to a mail of his choosing — it must be refused', () => {
    const id = kestrelSuspendsA149Admin()
    asHunter()
    const said = saveAccess(id, { name: 'mate@mail' })
    reload()
    expect({ said, name: accountByName('mate@mail')?.id ?? null },
      'Hunter may not make an admin of 149, so he may not hand a 149 admin\'s row to another sign-in').toEqual({ said: expect.any(String), name: null })
  })
  it('…what it leaves: he enables it (D2903), "mate@mail" signs in — 149\'s own admin, who then makes Osprey an admin of 149', () => {
    const id = kestrelSuspendsA149Admin()
    asHunter()
    const r1 = saveAccess(id, { name: 'mate@mail' })
    reload()
    const r2 = updateAccount(id, { on: true })
    reload()
    const s = signInAs('mate@mail', 'anything'); enterSquadron('u149'); reload()
    const mayMake = mayGivePlanNow('u149')
    const r3 = saveAccess(ACCT.osprey, { role: 'admin' })
    reload()
    expect({ steps: [r1, r2], signedIn: s.kind, mayMakeAdminsOf149: mayMake, ospreyMade: r3 === null && levelIn(ACCT.osprey, 'u149', todayIso()) === 'admin' },
      'a person nobody entitled made an admin signs in as 149\'s own admin and makes its admins')
      .toMatchObject({ mayMakeAdminsOf149: false, ospreyMade: false })
  })
  it('the gate: the same rename written past the door by Hunter must be refused', () => {
    const id = kestrelSuspendsA149Admin()
    asHunter()
    const row: any = store.get(ACCOUNT_PFX + id, null)
    expect(row, 'setup: the stored row').toBeTruthy()
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + id, { ...row, name: 'mate@mail' }) })
    reload()
    expect({ ok: r.ok, name: accountByName('mate@mail')?.id ?? null }, `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: false, name: null })
  })
  it('control: Kestrel, 149\'s own admin, corrects the same sign-in name — it goes through', () => {
    const id = kestrelSuspendsA149Admin()
    expect(saveAccess(id, { name: 'talon2@mail' })).toBeNull()
    reload()
    expect(accountByName('talon2@mail')?.id).toBe(id)
  })
})

/* (his D2907, 28 Nov 26: a rename is refused in the sign-in's own sentence, the one the greyed sign-in box's grey line
   says — no longer Q8's, which a role change and a re-link keep, above) */
describe('a 149 admin\'s sign-in name: refused to Hunter in the sign-in\'s sentence at both doors, kept for 149\'s own admins and a master admin', () => {
  it('Hunter\'s rename by the Save (saveAccess): the sign-in\'s own sentence, nothing written', () => {
    const id = kestrelSuspendsA149Admin()
    asHunter()
    expect(saveAccess(id, { name: 'mate@mail' })).toBe(SIGNIN)
    reload()
    expect(accountById(id)?.name).toBe('talon@mail')
  })
  it('Hunter\'s rename by the account\'s own door (updateAccount): the same sentence, nothing written', () => {
    const id = kestrelSuspendsA149Admin()
    asHunter()
    expect(updateAccount(id, { name: 'mate@mail' })).toBe(SIGNIN)
    reload()
    expect(accountById(id)?.name).toBe('talon@mail')
  })
  it('Hunter\'s rename of 149\'s admin who is switched ON (Kestrel himself is not his to change; a second, signed-in admin): refused the same', () => {
    on(15, 9); signInAs('kestrel'); enterSquadron('u149'); reload()
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
    reload()
    asHunter()
    expect(saveAccess(ACCT.osprey, { name: 'mate@mail' })).toBe(SIGNIN)
    expect(updateAccount(ACCT.osprey, { name: 'mate@mail' })).toBe(SIGNIN)
    reload()
    expect(accountByName('mate@mail')).toBeUndefined()
  })
  it('Kestrel\'s rename by the account\'s own door: goes through', () => {
    const id = kestrelSuspendsA149Admin()
    expect(updateAccount(id, { name: 'talon2@mail' })).toBeNull()
    reload()
    expect(accountByName('talon2@mail')?.id).toBe(id)
  })
  it('a master admin (Saber) renames the 149 admin by either door: goes through', () => {
    const id = kestrelSuspendsA149Admin()
    on(15, 11); signInAs('saber'); enterSquadron('u149'); reload()
    expect(saveAccess(id, { name: 'talon2@mail' })).toBeNull()
    reload()
    expect(updateAccount(id, { name: 'talon3@mail' })).toBeNull()
    reload()
    expect(accountByName('talon3@mail')?.id).toBe(id)
  })
})

describe('a member\'s sign-in name stays as today: Hunter (Plan of 149) may change it', () => {
  it('Hunter renames Osprey (149\'s member) by either door: goes through', () => {
    asHunter()
    expect(saveAccess(ACCT.osprey, { name: 'osprey2@mail' })).toBeNull()
    reload()
    expect(accountById(ACCT.osprey)?.name).toBe('osprey2@mail')
    expect(updateAccount(ACCT.osprey, { name: 'osprey3@mail' })).toBeNull()
    reload()
    expect(accountById(ACCT.osprey)?.name).toBe('osprey3@mail')
  })
  it('the gate: the same rename written past the door by Hunter goes through', () => {
    asHunter()
    const row: any = store.get(ACCOUNT_PFX + ACCT.osprey, null) ?? { ...accountById(ACCT.osprey) }
    const r = pastDoor(() => { store.set(ACCOUNT_PFX + ACCT.osprey, { ...row, name: 'osprey2@mail' }) })
    reload()
    expect({ ok: r.ok !== false, name: accountById(ACCT.osprey)?.name }, `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: true, name: 'osprey2@mail' })
  })
})

describe('the gate: a 149 admin\'s row on another sign-in, written past the door', () => {
  it('Kestrel\'s rename past the door goes through', () => {
    const id = kestrelSuspendsA149Admin()
    const row: any = store.get(ACCOUNT_PFX + id, null)
    const r = pastDoor(() => { store.set(ACCOUNT_PFX + id, { ...row, name: 'talon2@mail' }) })
    reload()
    expect({ ok: r.ok !== false, name: accountByName('talon2@mail')?.id ?? null }, `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: true, name: id })
  })
  it('a master admin\'s (Saber\'s) rename past the door goes through', () => {
    const id = kestrelSuspendsA149Admin()
    on(15, 11); signInAs('saber'); enterSquadron('u149'); reload()
    const row: any = store.get(ACCOUNT_PFX + id, null)
    const r = pastDoor(() => { store.set(ACCOUNT_PFX + id, { ...row, name: 'talon2@mail' }) })
    reload()
    expect({ ok: r.ok !== false, name: accountByName('talon2@mail')?.id ?? null }, `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: true, name: id })
  })
  it('Hunter deletes the row and makes it again for the same man under another name, in one command: refused', () => {
    const id = kestrelSuspendsA149Admin()
    asHunter()
    const row: any = store.get(ACCOUNT_PFX + id, null)
    const pid = String(row.pid)
    const r = pastDoor(() => {
      store.set(ACCOUNT_PFX + id, null)
      /* (a new account's admin role dated now, as the gate's moments check asks of any new row — so only the rule under
         test can refuse it) */
      store.set(ACCOUNT_PFX + 'acmate', { ...row, id: 'acmate', name: 'mate@mail', adminAt: Date.now() })
    })
    reload()
    expect({ ok: r.ok, made: /made an admin of u149/.test(String(r.message ?? '')), name: accountByName('mate@mail')?.id ?? null, still: accountOfPid(pid)?.name },
      `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: false, made: true, name: null, still: 'talon@mail' })
  })
})

describe('Undo and Redo of a 149 admin\'s rename — judged as making an admin of 149', () => {
  it('Kestrel\'s rename: his Undo and his Redo go through', () => {
    const id = kestrelSuspendsA149Admin()
    expect(saveAccess(id, { name: 'talon2@mail' })).toBeNull()
    reload()
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, name: accountById(id)?.name }, `the Undo answered: ${u.reason ?? 'ok'}`).toEqual({ ok: true, name: 'talon@mail' })
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, name: accountById(id)?.name }, `the Redo answered: ${r.reason ?? 'ok'}`).toEqual({ ok: true, name: 'talon2@mail' })
  })
  /* Hunter renames the 149 admin while a master admin (allowed); on another device Saber takes his mark off and gives him
     Plan of 149 again — a Plan holder who may reach 149 but may not make its admins */
  function hunterRenamedAsMasterThenUnmarked(undoFirst: boolean): string {
    const id = kestrelSuspendsA149Admin()
    on(15, 10); signInAs('saber'); reload()
    expect(setMaster(ACCT.hunter, true).ok, 'setup: Saber makes Hunter a master admin').toBe(true)
    reload()
    asHunter()
    expect(saveAccess(id, { name: 'talon2@mail' }), 'setup: Hunter, a master admin, renames the 149 admin').toBeNull()
    reload()
    if (undoFirst) {
      const u = globalUndo()
      reload()
      expect(u.ok, `setup: Hunter undoes it while a master admin: ${u.reason ?? 'ok'}`).toBe(true)
      expect(accountById(id)?.name).toBe('talon@mail')
    }
    elsewhere('ad', 'a', PID.saber, () => {
      expect(setMaster(ACCT.hunter, false).ok, 'setup: Saber takes the mark off Hunter').toBe(true)
      reload()
      expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } }), 'setup: Saber gives Hunter Plan of 149 again').toBeNull()
    })
    expect(accountById(ACCT.hunter)?.master, 'Hunter no longer a master admin').not.toBe(true)
    expect(mayGivePlanNow('u149'), 'premise: Hunter may not make an admin of 149 now').toBe(false)
    return id
  }
  it('Hunter\'s Undo of his rename, pressed once he may no longer make an admin of 149: refused in D2807\'s sentence, the name kept', () => {
    const id = hunterRenamedAsMasterThenUnmarked(false)
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, words: String(u.reason ?? '').startsWith(makeAdminUndoWords('u149')), name: accountById(id)?.name },
      `the Undo answered: ${u.reason ?? 'ok'}`).toEqual({ ok: false, words: true, name: 'talon2@mail' })
  })
  it('Hunter\'s Redo of his rename, pressed once he may no longer make an admin of 149: refused, the name kept', () => {
    const id = hunterRenamedAsMasterThenUnmarked(true)
    const r = globalRedo()
    reload()
    expect({ ok: r.ok, name: accountById(id)?.name }, `the Redo answered: ${r.reason ?? 'ok'}`).toEqual({ ok: false, name: 'talon@mail' })
  })
})
