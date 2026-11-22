// @vitest-environment jsdom
/* PIECE B'S RESTORE LINES, THROUGH THE REAL UNDO AND REDO (the reshape plan
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §4.3 "At the restore", "A step the leave-out empties", "At the
   gate"; §4.4's re-link and guardrail-2 tests; §10's two-job tests — written by helper "undo & roles" at the commit that
   wires the leave-out). The core's one body (state/perms.ts restoreLeavesOut — its own table: state/piece-b-tables.test.ts)
   is asked by the timeline's leave-out with what the step recorded — the man and the link day of each grant row's account
   — and by the gate through its probe:
   1. a step that changed an account's man puts back no right (guardrail 1);
   2. no restore puts back a right whose man has moved since its start (guardrail 2), nor one on another man's sign-in;
   3. it never removes a right not stored;
   4. a Plan only by a master admin's restore (his D2250 — chat 129).
   A step the leave-out empties commits nothing and is blocked for good, in today's words. A re-link's Undo or Redo while a
   right given since stands on that sign-in is blocked for good, naming who gave it.
   The world: test-support/msq-world.ts (Wed 15 Jul 26; Saber the master, Hunter 142's plain admin, Ranger 142's member,
   Kestrel 149's admin). A move is written as his home rows (as leavewar/multi-sqn-fixread11.test.ts writes them), so it is
   no Undo step of anyone's. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, mem, PID, ACCT, on } from '../test-support/msq-world'
import { addUnit, setGrant, removeGrant, unitsLoad, unitRows, grantOfOn } from './units'
import { HOME_PFX, GRANT_PFX } from './units-model'
import { updateAccount, accountById, accountsLoad, levelIn, ACCOUNTS_LIST } from './accounts'
import { addRosterPerson } from './roster-add'
import { settingsStore } from './people-settings-commit'
import { store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { notify as raptorNotify } from './store'
import { commitAs } from '../command/commit'
import { globalUndo, globalRedo } from '../undo/timeline'

useMsqWorld()

/* a man's home rows, as state/units.ts setHome saves them: [unit, from] in order (the first covers every day before it) */
const homes = (pid: string, key: string, rows: [string, string][]) => {
  rows.forEach(([unit, from], i) => { mem['sqn142_' + HOME_PFX + key + i] = JSON.stringify({ id: key + i, pid, unit, from }) })
  unitsLoad()
}
/* the day moves on (the clock, and the rows read again) */
const day = (d: number) => { on(d); unitsLoad(); accountsLoad() }
const rowsOf = (acct: string) => unitRows().grants.filter(g => g.account === acct)
const holder = (acct: string) => { const a = accountById(acct)!; return { id: acct, pid: String(a.pid), pidFrom: a.pidFrom } }
const holds = (acct: string, unit: string) => grantOfOn(holder(acct), unit)
/* a new 142 man with no sign-in (Viper), added on 10 Jul — not an Undo step of the scenario's */
const viper = (): string => {
  expect(addRosterPerson({ cs: 'Viper', ini: '', seat: 'FCP', cat: 'C' } as any, '2026-07-10')).toBeNull()
  raptorNotify()
  return Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === 'Viper' && !(PEOPLE as any)[k].deleted)!
}
/* squadron 150, made by Saber on 13 Jul, Kestrel its first admin (a bystander first admin — §9.2, Piece C) */
let U150 = ''
const u150 = (): string => {
  const r: any = addUnit('150', 'p1', ACCT.kestrel)
  expect(r.ok, JSON.stringify(r)).toBe(true)
  U150 = String(r.id)
  return U150
}
/* another person's change to the settings, arriving from the shared store (a remote envelope — never a step of his) */
const KESTREL = { id: ACCT.kestrel, role: 'admin', personId: PID.kestrel, session: null } as any
const remote = (actor: any, type: string, fn: () => void) => {
  const r = commitAs({ type, scope: { module: 'settings' }, meta: null, apply: (txn: any) => { txn.enlist(settingsStore); fn() } } as any, { actor, origin: 'remote' })
  expect((r as any).ok, JSON.stringify(r)).not.toBe(false)
  unitsLoad(); accountsLoad()
}
const relinkRemote = (acct: string, pid: string, fromIso: string) =>
  remote({ id: ACCT.hunter, role: 'admin', personId: PID.hunter, session: null }, 'account.update', () => {
    /* (every account row written, as the list is saved — a lone first row would read the seeded others as gone) */
    for (const a of ACCOUNTS_LIST) store.set('account:' + a.id, a.id === acct ? { ...a, pid, pidFrom: fromIso } : { ...a })
  })
const BLOCKED = /^Something else changed this after your action — it can’t be undone now\./

describe('guardrail 2 — no restore puts back a right whose man has moved since its start', () => {
  it('Saber removes Ranger\'s View of 150; Ranger moves; Undo: nothing back, the step blocked in today\'s words, said once', () => {
    day(13); signInAs('saber'); u150()
    day(14)
    expect(setGrant(ACCT.ranger, U150, 'view', PID.ranger).ok).toBe(true)
    expect(removeGrant(ACCT.ranger, U150).ok).toBe(true)
    homes(PID.ranger, 'hr', [['u142', '2026-07-01'], ['u149', '2026-07-15']])
    day(16)
    const u = globalUndo()
    expect(u.ok).toBe(false)
    expect(u.reason).toMatch(BLOCKED)
    expect(u.reason, 'the next press named').toMatch(/Press Undo again for: /)
    expect(rowsOf(ACCT.ranger), 'nothing put back, not even ended').toEqual([])
    expect(holds(ACCT.ranger, U150)).toBeUndefined()
    /* the next press passes it over: it takes the step before it */
    const u2 = globalUndo()
    expect(u2.reason ?? '', 'never the same refusal again').not.toMatch(/^Something else changed this after your action — it can’t be undone now\. Press Undo again for: .*View/)
  })

  it('removal → Undo → his move → Redo → Undo: the Redo takes it off, its Undo never puts it back, nothing half done', () => {
    day(13); signInAs('saber'); u150()
    day(14)
    expect(setGrant(ACCT.ranger, U150, 'view', PID.ranger).ok).toBe(true)
    expect(removeGrant(ACCT.ranger, U150).ok).toBe(true)
    const u0 = globalUndo(); expect(u0.ok, JSON.stringify(u0.reason)).toBe(true)
    expect(holds(ACCT.ranger, U150)?.level, 'undone at once, no move: back').toBe('view')
    homes(PID.ranger, 'hr', [['u142', '2026-07-01'], ['u149', '2026-07-15']])
    day(16)
    const r = globalRedo(); expect(r.ok, JSON.stringify(r.reason)).toBe(true)
    expect(rowsOf(ACCT.ranger)).toEqual([])
    const u = globalUndo()
    expect(u.ok).toBe(false)
    expect(u.reason).toMatch(BLOCKED)
    expect(rowsOf(ACCT.ranger)).toEqual([])
  })

  it('on the day his move is saved, before it counts, the Undo of a removal still puts it back — and it ends at midnight', () => {
    day(13); signInAs('saber'); u150()
    day(15)
    expect(setGrant(ACCT.ranger, U150, 'view', PID.ranger).ok).toBe(true)
    expect(removeGrant(ACCT.ranger, U150).ok).toBe(true)
    homes(PID.ranger, 'hr', [['u142', '2026-07-01'], ['u149', '2026-07-16']])
    const u = globalUndo(); expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(holds(ACCT.ranger, U150)?.level).toBe('view')
    day(16)
    expect(holds(ACCT.ranger, U150), 'ended by his move').toBeUndefined()
  })

  it('a lowering (Plan to View) undone after his move: the Plan never comes back', () => {
    day(13); signInAs('saber'); u150()
    expect(setGrant(ACCT.hunter, U150, 'admin', PID.hunter).ok).toBe(true)
    day(14)
    expect(setGrant(ACCT.hunter, U150, 'view', PID.hunter).ok).toBe(true)
    homes(PID.hunter, 'hh', [['u142', '2026-07-01'], ['u149', '2026-07-15']])
    day(16)
    const u = globalUndo()
    expect(u.ok).toBe(false)
    expect(u.reason).toMatch(BLOCKED)
    expect(rowsOf(ACCT.hunter).map(g => g.level), 'the stored row stays as lowered').toEqual(['view'])
  })

  it('removal → a re-link of the sign-in to Viper the same day → the removal\'s Undo: nothing put on Viper\'s sign-in', () => {
    day(13); signInAs('saber'); u150(); const vp = viper()
    day(14)
    expect(setGrant(ACCT.ranger, U150, 'view', PID.ranger).ok).toBe(true)
    expect(removeGrant(ACCT.ranger, U150).ok).toBe(true)
    relinkRemote(ACCT.ranger, vp, '2026-07-14')
    const u = globalUndo()
    expect(u.ok).toBe(false)
    expect(u.reason).toMatch(BLOCKED)
    expect(rowsOf(ACCT.ranger), 'the step\'s recorded man was Ranger').toEqual([])
  })

  it('removal → the sign-in re-linked away and back to Ranger → Undo: the View back on Ranger, who has not moved', () => {
    day(13); signInAs('saber'); u150(); const vp = viper()
    day(14)
    expect(setGrant(ACCT.ranger, U150, 'view', PID.ranger).ok).toBe(true)
    expect(removeGrant(ACCT.ranger, U150).ok).toBe(true)
    relinkRemote(ACCT.ranger, vp, '2026-07-14')
    relinkRemote(ACCT.ranger, PID.ranger, '2026-07-14')
    const u = globalUndo(); expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(holds(ACCT.ranger, U150)?.level).toBe('view')
  })
})

describe('guardrail 1 — a re-link puts back no right, and its Undo is blocked while a right given since stands', () => {
  /* Saber gives Hunter Plan of 149 (it holds) and re-links Hunter's sign-in to Viper: the Plan goes in the re-link's own command */
  function relinked(): string {
    day(13); signInAs('saber'); u150(); const vp = viper()
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    day(15)
    expect(updateAccount(ACCT.hunter, { pid: vp })).toBeNull()
    accountsLoad(); unitsLoad()
    expect(rowsOf(ACCT.hunter), 'dropped in the re-link\'s own command').toEqual([])
    return vp
  }

  it('its Undo at once, then Redo, then Undo after Hunter moves: the sign-in back on Hunter, no right stored, nothing refused', () => {
    const vp = relinked()
    const u = globalUndo(); expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect([accountById(ACCT.hunter)!.pid, rowsOf(ACCT.hunter)]).toEqual([PID.hunter, []])
    const r = globalRedo(); expect(r.ok, JSON.stringify(r.reason)).toBe(true)
    expect([accountById(ACCT.hunter)!.pid, rowsOf(ACCT.hunter)], 'the Redo removes nothing').toEqual([vp, []])
    homes(PID.hunter, 'hh', [['u142', '2026-07-01'], [U150, '2026-07-16']])
    day(17)
    const u2 = globalUndo(); expect(u2.ok, JSON.stringify(u2.reason)).toBe(true)
    expect([accountById(ACCT.hunter)!.pid, rowsOf(ACCT.hunter)]).toEqual([PID.hunter, []])
    expect(levelIn(ACCT.hunter, 'u149', '2026-07-17'), 'no access to 149 came back').not.toBe('admin')
  })

  it('a right given since by Kestrel (150\'s admin): Saber\'s Undo is blocked for good, naming him; the next press names the step it takes', () => {
    relinked()
    remote(KESTREL, 'grant.set', () => { store.set(GRANT_PFX + 'gk1', { id: 'gk1', account: ACCT.hunter, unit: U150, level: 'view', from: '2026-07-15' }) })
    const u = globalUndo()
    expect(u.ok).toBe(false)
    expect(u.reason).toMatch(/^Kestrel changed this after your action — it can’t be undone now\. Press Undo again for: /)
    expect(rowsOf(ACCT.hunter).map(g => g.unit), 'the right given since stands, on Viper\'s sign-in').toEqual([U150])
    const u2 = globalUndo()
    expect(u2.reason ?? '').not.toMatch(/^Kestrel changed this/)
  })

  it('Saber\'s own giving since: undone first, then the re-link\'s Undo passes', () => {
    relinked()
    expect(setGrant(ACCT.hunter, U150, 'view', accountById(ACCT.hunter)!.pid).ok).toBe(true)
    const u1 = globalUndo(); expect(u1.ok, JSON.stringify(u1.reason)).toBe(true)
    const u2 = globalUndo(); expect(u2.ok, JSON.stringify(u2.reason)).toBe(true)
    expect([accountById(ACCT.hunter)!.pid, rowsOf(ACCT.hunter)]).toEqual([PID.hunter, []])
  })
})

describe("his D2250's Undo — a Plan put back only by a master admin's restore (rule 4)", () => {
  const plan149 = () => levelIn(ACCT.hunter, 'u149', '2026-07-15')
  function givePlan(): void {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    expect(updateAccount(ACCT.ranger, { role: 'admin' })).toBeNull()
  }
  it('Ranger makes Hunter a member and presses Undo: Hunter an admin of 142 again, no Plan of 149; Redo: a member again', () => {
    givePlan()
    signInAs('ranger')
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u)).toBe(true)
    accountsLoad(); unitsLoad()
    expect([accountById(ACCT.hunter)!.role, plan149(), rowsOf(ACCT.hunter)]).toEqual(['admin', null, []])
    const r = globalRedo()
    expect(r.ok, JSON.stringify(r)).toBe(true)
    accountsLoad(); unitsLoad()
    expect([accountById(ACCT.hunter)!.role, rowsOf(ACCT.hunter)]).toEqual(['main', []])
  })
  it('the same three by Saber: his Undo puts back the role and the Plan; his Redo takes both again', () => {
    givePlan()
    expect(updateAccount(ACCT.hunter, { role: 'main' })).toBeNull()
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u)).toBe(true)
    accountsLoad(); unitsLoad()
    expect([accountById(ACCT.hunter)!.role, plan149()]).toEqual(['admin', 'admin'])
    const r = globalRedo()
    expect(r.ok, JSON.stringify(r)).toBe(true)
    accountsLoad(); unitsLoad()
    expect([accountById(ACCT.hunter)!.role, rowsOf(ACCT.hunter)]).toEqual(['main', []])
  })
})
