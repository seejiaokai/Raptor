// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U2, PASS A: WHO GIVES AND ENDS PLAN OF A SQUADRON, AND WHO MAKES ITS ADMINS, AT
   THE DOORS (the brief docs/superpowers/briefs/2026-11-27-msq-s2-u2-brief.md §3 R1, R2, R5 and §8's "Who gives and ends
   Plan, at the doors (V5, V5b)", "Q8 at the doors" and "The last-admin words (R5)").
   His rulings: D2626 — Plan of a squadron is given and ended by that squadron's own admins or a master admin, never by a
   Plan holder; D2730 Q8, D2806 — whoever may give Plan of a squadron is the only one who may make a man its admin; D2730
   Q10 — only admins who can still sign in; D2730 Q12 — the refused re-link's words; D2806, D2816 — the last-admin words.
   The world: three squadrons (withThird — his D2630; R9), Wed 15 Jul 26, 09:00. Hunter is 142's admin holding Plan of 149
   and View of 150; Kestrel 149's own admin; Mako 150's own admin; Saber the master admin; Ranger 142's member, View of
   149 and 150; Osprey 149's member. */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, signOut, moveMan, on, PID, ACCT, third } from '../test-support/msq-world'
import {
  saveAccess, updateAccount, addAccount, approveRequest, approveRequestNew, addPersonAndAccount, requestAccess,
  accountById, accountOfPid, accountsLoad, levelIn, lastAdminIfGone, ACCESS_REQS,
} from './accounts'
import { unitsLoad, todayIso, setGrant, removeGrant, addUnit, unitRows, homeOn, type UnitSave } from './units'
import { enterSquadron, switchRoleView } from './store'
import { setSession, SESSION } from './auth'
import { rosterOf } from '../engine/roster'
import { PEOPLE } from '../engine/people'
import { archivePerson, postOut } from '../leavewar/sync'

withThird()

const PLAN = (n: string) => `Only ${n}'s own admins or a master admin can give or end Plan of ${n}.`
const MAKE = (n: string) => `Only ${n}'s own admins or a master admin can make an admin of ${n}.`
const reload = () => { unitsLoad(); accountsLoad() }
const level = (acct: string, unit: string) => { reload(); return levelIn(acct, unit, todayIso()) }
const said = (r: UnitSave) => (r.ok ? null : r.message ?? 'refused')
const grants = () => { reload(); return JSON.stringify(unitRows().grants) }
/* a 149 man with no sign-in (the demo's 149 has several) */
const free149 = () => {
  const pid = rosterOf('u149', todayIso()).find(p => !accountOfPid(p) && !(PEOPLE as any)[p]?.special && !(PEOPLE as any)[p]?.archived)
  expect(pid, 'setup: a 149 man with no sign-in').toBeTruthy()
  return pid!
}
/* a session kept open while another admin acts on another device, then handed back (as ui/msq-guard-doors-bell does) */
const held = (who: Parameters<typeof signInAs>[0]) => { signInAs(who); return SESSION }

/* the targets in 149: Mako (nothing there — a give), Ranger made an admin of 142 by Saber (his View of 149 — a raise),
   Hunter's Plan (a lowering, an end) */
function targets(): void {
  signInAs('saber')
  expect(updateAccount(ACCT.ranger, { role: 'admin' }), 'setup: Saber makes Ranger an admin of 142').toBeNull()
  reload()
  expect(level(ACCT.ranger, 'u149')).toBe('view')
  expect(level(ACCT.mako, 'u149')).toBeNull()
  expect(level(ACCT.hunter, 'u149')).toBe('admin')
}
const doorOps = (): Array<[string, () => string | null]> => [
  ['setGrant — a give', () => said(setGrant(ACCT.mako, 'u149', 'admin', PID.mako))],
  ['setGrant — a raise', () => said(setGrant(ACCT.ranger, 'u149', 'admin', PID.ranger))],
  ['setGrant — a lowering', () => said(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter))],
  ['removeGrant — an end', () => said(removeGrant(ACCT.hunter, 'u149'))],
]
const saveOps = (skip: string[] = []): Array<[string, () => string | null]> => ([
  ['saveAccess — a give', ACCT.mako, () => saveAccess(ACCT.mako, { grants: { u149: 'plan' } })],
  ['saveAccess — a raise', ACCT.ranger, () => saveAccess(ACCT.ranger, { grants: { u149: 'plan' } })],
  ['saveAccess — a lowering', ACCT.hunter, () => saveAccess(ACCT.hunter, { grants: { u149: 'view' } })],
  ['saveAccess — an end', ACCT.hunter, () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } })],
] as Array<[string, string, () => string | null]>).filter(([, a]) => !skip.includes(a)).map(([n, , f]) => [n, f])
/* every door, each refused in the line's sentence with nothing changed */
function allRefused(ops: Array<[string, () => string | null]>, words = PLAN('149')): void {
  for (const [name, op] of ops) {
    const g0 = grants()
    expect(op(), name).toBe(words)
    expect(grants(), `${name}: nothing changed`).toBe(g0)
  }
}

describe('V5 — who gives and ends Plan of 149, at the doors (D2626)', () => {
  it('Kestrel, 149\'s own admin, ends Hunter\'s Plan of 149 and gives it again: saved', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } })).toBeNull()
    expect(level(ACCT.hunter, 'u149')).toBeNull()
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    expect(level(ACCT.hunter, 'u149')).toBe('admin')
    expect(said(removeGrant(ACCT.hunter, 'u149'))).toBeNull()
    expect(said(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter))).toBeNull()
    expect(level(ACCT.hunter, 'u149')).toBe('admin')
  })
  it('Mako, 150\'s own admin, raises Hunter\'s View of 150 to Plan: saved, and Hunter holds Plan of two (D2630)', () => {
    signInAs('mako')
    expect(saveAccess(ACCT.hunter, { grants: { [third.u150]: 'plan' } })).toBeNull()
    expect(level(ACCT.hunter, third.u150)).toBe('admin')
    expect(level(ACCT.hunter, 'u149')).toBe('admin')
  })
  it('Kestrel raises Hunter\'s View of 150: refused, in 150\'s sentence', () => {
    signInAs('kestrel')
    const g0 = grants()
    expect(saveAccess(ACCT.hunter, { grants: { [third.u150]: 'plan' } })).toBe(PLAN('150'))
    expect(said(setGrant(ACCT.hunter, third.u150, 'admin', PID.hunter))).toBe(PLAN('150'))
    expect(grants()).toBe(g0)
  })
  it('a squadron whose only admin is its unmoved first admin: only Saber gives; once moved in, the first admin gives and ends', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    const made = addUnit('151', 'p1', ACCT.ranger)
    expect(made.ok, JSON.stringify(made)).toBe(true)
    const u151 = String(made.id)
    reload()
    signInAs('ranger')
    expect(level(ACCT.ranger, u151), 'his first Plan of 151').toBe('admin')
    expect(said(setGrant(ACCT.kestrel, u151, 'admin', PID.kestrel)), 'not yet moved in: refused').toBe(PLAN('151'))
    signInAs('saber')
    expect(said(setGrant(ACCT.kestrel, u151, 'admin', PID.kestrel)), 'Saber gives').toBeNull()
    expect(said(removeGrant(ACCT.kestrel, u151)), 'Saber ends').toBeNull()
    expect(moveMan(PID.ranger, u151)).toMatchObject({ ok: true })
    on(16); reload()
    signInAs('ranger')
    expect(homeOn(PID.ranger, todayIso())).toBe(u151)
    expect(level(ACCT.ranger, u151), 'moved in: 151\'s own admin').toBe('admin')
    expect(said(setGrant(ACCT.kestrel, u151, 'admin', PID.kestrel)), 'he gives').toBeNull()
    expect(said(removeGrant(ACCT.kestrel, u151)), 'he ends').toBeNull()
  })
  it('pin: Hunter, a Plan holder of 149, still gives View of 149', () => {
    signInAs('hunter')
    expect(said(setGrant(ACCT.mako, 'u149', 'view', PID.mako))).toBeNull()
    expect(level(ACCT.mako, 'u149')).toBe('view')
  })
})

describe('V5, V5b — each door called directly is refused in the line\'s sentence, nothing changed (D2626, D2730 Q10)', () => {
  it('Hunter (a Plan holder of 149)', () => { targets(); signInAs('hunter'); allRefused([...doorOps(), ...saveOps([ACCT.hunter])]) })
  it('Mako (150\'s own admin)', () => { targets(); signInAs('mako'); allRefused([...doorOps(), ...saveOps([ACCT.mako])]) })
  it('Ranger (142\'s admin, View of 149)', () => { targets(); signInAs('ranger'); allRefused([...doorOps(), ...saveOps([ACCT.ranger])]) })
  it('Osprey (149\'s member): the line\'s doors refused; saveAccess is an admin\'s', () => {
    targets(); signInAs('osprey')
    allRefused(doorOps())
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBe('Only an admin can change an account')
  })
  it('Saber in the member view: the line\'s doors refused; saveAccess is an admin\'s', async () => {
    targets(); signInAs('saber')
    await switchRoleView()
    allRefused(doorOps())
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBe('Only an admin can change an account')
  })
  it('nobody signed in: setGrant and removeGrant refused (they no longer leave it to the gate)', () => {
    targets(); signOut()
    allRefused(doorOps())
  })
  it.each(['switched off', 'archived', 'posted out overseas'] as const)('Kestrel %s, his session still open (Osprey made an admin first)', (how) => {
    targets()
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Osprey an admin of 149').toBeNull()
    const ks = SESSION
    signInAs('saber')
    if (how === 'switched off') expect(updateAccount(ACCT.kestrel, { on: false })).toBeNull()
    else if (how === 'archived') expect(archivePerson(PID.kestrel).bad).toBeNull()
    else { enterSquadron('u149'); expect(postOut(PID.kestrel, todayIso(), 'overseas')).toBe(true) }
    reload()
    expect(accountById(ACCT.kestrel)!.on, `setup: Kestrel ${how}`).toBe(false)
    setSession(ks)
    allRefused([...doorOps(), ...saveOps()])
  })
  it('V5b — Hunter moved to 149 and not re-made, his session still open: refused; re-made by Kestrel: saved', () => {
    const hs = held('hunter')
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    on(16); reload()
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: Kestrel gives Mako Plan of 149').toBeNull()
    expect(level(ACCT.hunter, 'u149'), 'Hunter is 149\'s member').toBe('member')
    setSession(hs)
    allRefused([
      ['setGrant — a lowering', () => said(setGrant(ACCT.mako, 'u149', 'view', PID.mako))],
      ['removeGrant — an end', () => said(removeGrant(ACCT.mako, 'u149'))],
      ['saveAccess — an end', () => saveAccess(ACCT.mako, { grants: { u149: 'none' } })],
    ])
    signInAs('kestrel')
    expect(saveAccess(ACCT.hunter, { role: 'admin' }), 'Kestrel re-makes him an admin of 149').toBeNull()
    signInAs('hunter')
    expect(level(ACCT.hunter, 'u149')).toBe('admin')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'view' } }), 're-made: he lowers it').toBeNull()
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 're-made: he gives it again').toBeNull()
  })
})

describe('the re-link door (D2730 Q12)', () => {
  it('Ranger, 142\'s admin, re-links Hunter\'s sign-in (Plan of 149) to another 142 man: refused in Q12\'s words', () => {
    /* (his View of 150 ended first by 150's admin, so the Plan is the one right the sign-in holds: the door names the first
       right it finds, in the rows' own order) */
    signInAs('mako'); expect(saveAccess(ACCT.hunter, { grants: { [third.u150]: 'none' } })).toBeNull()
    signInAs('saber'); expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    const other = rosterOf('u142', todayIso()).find(p => !accountOfPid(p) && !(PEOPLE as any)[p]?.special && !(PEOPLE as any)[p]?.archived)!
    signInAs('ranger')
    expect(updateAccount(ACCT.hunter, { pid: other })).toBe('This sign-in holds a right in 149. Only 149\'s own admins or a master admin can link it to another person.')
    expect(accountById(ACCT.hunter)!.pid).toBe(PID.hunter)
  })
  it('Saber re-links it: saved, the Plan dropped', () => {
    const other = rosterOf('u142', todayIso()).find(p => !accountOfPid(p) && !(PEOPLE as any)[p]?.special && !(PEOPLE as any)[p]?.archived)!
    signInAs('saber')
    expect(updateAccount(ACCT.hunter, { pid: other })).toBeNull()
    expect(level(ACCT.hunter, 'u149')).toBeNull()
  })
  it('Kestrel, 149\'s own admin holding Plan of 142, re-links it to a 149 man: saved', () => {
    /* (his View of 150 ended first: Kestrel is no admin of 150, and a View's case keeps its own refusal) */
    signInAs('mako'); expect(saveAccess(ACCT.hunter, { grants: { [third.u150]: 'none' } })).toBeNull()
    signInAs('saber'); expect(saveAccess(ACCT.kestrel, { grants: { u142: 'plan' } })).toBeNull()
    const to = free149()
    signInAs('kestrel')
    expect(updateAccount(ACCT.hunter, { pid: to })).toBeNull()
    expect(accountById(ACCT.hunter)!.pid).toBe(to)
  })
  it('pin: a sign-in holding only View reads as today', () => {
    const other = rosterOf('u142', todayIso()).find(p => !accountOfPid(p) && !(PEOPLE as any)[p]?.special && !(PEOPLE as any)[p]?.archived)!
    signInAs('hunter')
    expect(updateAccount(ACCT.ranger, { pid: other })).toBe('This sign-in holds a right in 150. Only a master admin or an admin of 150 can link it to another person.')
  })
})

describe('Q8 at the doors — Hunter, 149 picked, makes a 149 man an admin: refused in D2806\'s sentence, nothing saved', () => {
  const asHunter149 = () => { signInAs('hunter'); enterSquadron('u149'); reload() }
  const asKestrel = () => { signInAs('kestrel'); reload() }
  const asSaber149 = () => { signInAs('saber'); enterSquadron('u149'); reload() }
  const ask = (cs: string) => { signInAs(`${cs.toLowerCase()}@mail`); expect(requestAccess({ cs, ini: 'NV', seat: 'FCP', cat: 'C' } as any, 'u149')).toBeNull(); return ACCESS_REQS.find(r => r.cs === cs)!.id }
  const np = (cs: string) => ({ cs, ini: 'NV', seat: 'FCP', cat: 'C' }) as any

  it('saveAccess — the Role tick to Admin', () => {
    asHunter149()
    expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBe(MAKE('149'))
    expect(level(ACCT.osprey, 'u149')).toBe('member')
  })
  it('saveAccess — a moved admin re-made (the `remade` case)', () => {
    signInAs('saber'); expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
    expect(moveMan(PID.ranger, 'u149')).toMatchObject({ ok: true })
    on(16); reload()
    expect(level(ACCT.ranger, 'u149'), 'setup: Ranger 149\'s member, his account still storing admin').toBe('member')
    asHunter149()
    expect(saveAccess(ACCT.ranger, { role: 'admin' })).toBe(MAKE('149'))
    expect(level(ACCT.ranger, 'u149')).toBe('member')
    asKestrel()
    expect(saveAccess(ACCT.ranger, { role: 'admin' }), 'Kestrel: saved').toBeNull()
    expect(level(ACCT.ranger, 'u149')).toBe('admin')
  })
  it('updateAccount — a role change', () => {
    asHunter149()
    expect(updateAccount(ACCT.osprey, { role: 'admin' })).toBe(MAKE('149'))
    expect(accountById(ACCT.osprey)!.role).toBe('main')
  })
  it('updateAccount — a re-link that leaves a man an admin of 149', () => {
    const to = free149()
    asHunter149()
    expect(updateAccount(ACCT.kestrel, { pid: to })).toBe(MAKE('149'))
    expect(accountById(ACCT.kestrel)!.pid).toBe(PID.kestrel)
  })
  it('addAccount', () => {
    const to = free149()
    asHunter149()
    expect(addAccount('nova@mail', to, 'admin')).toBe(MAKE('149'))
    expect(accountOfPid(to)).toBeUndefined()
  })
  it('approveRequest', () => {
    const id = ask('Nova'), to = free149()
    asHunter149()
    expect(approveRequest(id, to, 'admin')).toBe(MAKE('149'))
    expect(accountOfPid(to)).toBeUndefined()
    expect(ACCESS_REQS.some(r => r.id === id)).toBe(true)
  })
  it('approveRequestNew', () => {
    const id = ask('Nova')
    asHunter149()
    const n0 = Object.keys(PEOPLE).length
    expect(approveRequestNew(id, np('Nova'), 'admin')).toBe(MAKE('149'))
    expect(Object.keys(PEOPLE).length).toBe(n0)
  })
  it('addPersonAndAccount', () => {
    asHunter149()
    const n0 = Object.keys(PEOPLE).length
    expect(addPersonAndAccount('nova@mail', np('Nova'), 'admin')).toBe(MAKE('149'))
    expect(Object.keys(PEOPLE).length).toBe(n0)
  })
  it('one Save sending a role, a rename and a line together: refused, nothing lands', () => {
    asHunter149()
    const g0 = grants(), a0 = JSON.stringify(accountById(ACCT.osprey))
    expect(saveAccess(ACCT.osprey, { role: 'admin', name: 'osprey@mail', grants: { u142: 'view' } })).toBe(MAKE('149'))
    expect(grants()).toBe(g0)
    expect(JSON.stringify(accountById(ACCT.osprey))).toBe(a0)
  })

  it.each([['Kestrel', asKestrel], ['Saber', asSaber149]] as const)('the same calls as %s: saved', (_n, as) => {
    as()
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'saveAccess').toBeNull()
    expect(updateAccount(ACCT.osprey, { role: 'main' }), 'updateAccount back to member').toBeNull()
    expect(updateAccount(ACCT.osprey, { role: 'admin' }), 'updateAccount').toBeNull()
    const to = free149()
    expect(addAccount('nova@mail', to, 'admin'), 'addAccount').toBeNull()
    const n0 = Object.keys(PEOPLE).length
    expect(addPersonAndAccount('blaze@mail', np('Blaze'), 'admin'), 'addPersonAndAccount').toBeNull()
    expect(Object.keys(PEOPLE).length).toBe(n0 + 1)
  })
  it.each([['Kestrel', asKestrel], ['Saber', asSaber149]] as const)('approving with role admin as %s: saved', (_n, as) => {
    const a = ask('Nova'), b = ask('Wren'), to = free149()
    as()
    expect(approveRequest(a, to, 'admin'), 'approveRequest').toBeNull()
    expect(approveRequestNew(b, np('Wren'), 'admin'), 'approveRequestNew').toBeNull()
  })
  it('pin: an admin kept an admin — Hunter renames Kestrel\'s sign-in, Admin left picked: saved', () => {
    asHunter149()
    expect(saveAccess(ACCT.kestrel, { role: 'admin', name: 'kes@mail' })).toBeNull()
    expect(accountById(ACCT.kestrel)!.name).toBe('kes@mail')
  })
  it('pin: an admin made a member by Hunter (D2250): saved', () => {
    asKestrel(); expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    asHunter149()
    expect(saveAccess(ACCT.osprey, { role: 'main' })).toBeNull()
    expect(level(ACCT.osprey, 'u149')).toBe('member')
  })
})

describe('R5 — the last-admin words (D2806, D2816; D2184 Q10 kept)', () => {
  it('Hunter making Kestrel a member reads D2806\'s words', () => {
    signInAs('hunter'); enterSquadron('u149')
    expect(saveAccess(ACCT.kestrel, { role: 'main' })).toBe("Kestrel is 149's last admin. Only 149's own admins or a master admin can make another.")
  })
  it.each(['kestrel', 'saber'] as const)('read by %s: "Make another admin of 149 first."', (who) => {
    signInAs(who)
    expect(lastAdminIfGone(PID.kestrel)).toBe("Kestrel is 149's last admin. Make another admin of 149 first.")
  })
  it('a new squadron 151 whose only admin is Kestrel holding Plan: Hunter and Mako read D2816\'s words, Saber "Make another"', () => {
    signInAs('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: 149 keeps an admin of its own').toBeNull()
    signInAs('saber')
    const made = addUnit('151', 'p1', ACCT.kestrel)
    expect(made.ok, JSON.stringify(made)).toBe(true)
    reload()
    for (const who of ['hunter', 'mako'] as const) {
      signInAs(who)
      expect(lastAdminIfGone(PID.kestrel), who).toBe("Kestrel is 151's last admin. Only a master admin can make another.")
    }
    signInAs('saber')
    expect(lastAdminIfGone(PID.kestrel)).toBe("Kestrel is 151's last admin. Make another admin of 151 first.")
  })
  it('the dated form, with a saved move, reads each tail', () => {
    signInAs('kestrel'); expect(saveAccess(ACCT.osprey, { role: 'admin' })).toBeNull()
    signInAs('saber'); expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    reload()
    const dated = (tail: string) => `Kestrel is 149's last admin from Thu 16 Jul, when Osprey moves to 142. ${tail}`
    signInAs('hunter')
    expect(lastAdminIfGone(PID.kestrel)).toBe(dated("Only 149's own admins or a master admin can make another."))
    signInAs('kestrel')
    expect(lastAdminIfGone(PID.kestrel)).toBe(dated('Make another admin of 149 first.'))
    signInAs('saber')
    expect(lastAdminIfGone(PID.kestrel)).toBe(dated('Make another admin of 149 first.'))
  })
  it('Archive\'s words read the same', () => {
    signInAs('hunter'); enterSquadron('u149')
    expect(archivePerson(PID.kestrel).bad).toBe("Kestrel is 149's last admin. Only 149's own admins or a master admin can make another.")
  })
})
