// @vitest-environment jsdom
/* EVERY KIND OF SIGN-IN AGAINST THE SAVE CHECK ITSELF — hand-made commands, the cells that hold ([MSQ-FABLE-REVIEW], his
   D2259; the table: docs/superpowers/briefs/2026-11-21-msq-signin-kinds-table.md).

   The doors' own tests are signin-kinds-cells.test.ts. Here the save check (state/perms.ts ownershipViolation) is asked
   directly, with a change no screen offers, as each kind: a record of 149's Tracker, of 149's schedule settings and of a
   149 man's Quals row — so a control hidden on screen is shown to be refused underneath as well (the Leave War's doors
   are pressed for real in the cells file, with the war each kind is given).
   A View holder writes nothing (D2191, D2252, §11); a Plan holder and a master admin write as 149's admins (D2197,
   D2201); the member view is a member's (D292, D2253); a suspended account and a person waiting write nothing.

   Not pinned: a master admin in the member view (a finding — the save check still reads him as an admin of every
   squadron). The world: test-support/msq-world.ts. */
import { describe, it, expect, afterEach } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT, on, moveMan } from '../test-support/msq-world'
import { switchUnit, switchRoleView } from './store'
import { setGrant, unitsLoad } from './units'
import { updateAccount, accountsLoad } from './accounts'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { ownershipViolation, cmdAuthorize, setTrkUnitProbe } from './perms'
import { deriveActor } from '../command/actor'
import { PEOPLE } from '../engine/people'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); setTrkUnitProbe(null) })

const give = (who: 'hunter' | 'ranger', level: 'admin' | 'view') => { signInAs('saber'); expect(setGrant(ACCT[who], 'u149', level, PID[who]).ok).toBe(true) }
/* is a hand-made command of this type, carrying this one change, let through for whoever is signed in — the command's
   type first (cmdAuthorize), then what it changed (ownershipViolation) */
function passes(type: string, change: { collection: string; id: string; before?: unknown; after: unknown }): boolean {
  const actor = deriveActor()
  if (!cmdAuthorize(type, actor, null)) return false
  const env: any = { seq: -1, at: '', actor, origin: 'user', scope: { module: 'x' }, type, changes: [{ op: 'put', before: null, ...change }], emit: true }
  return ownershipViolation(env) == null
}
/* 149's records, each by the command that would carry it */
const osprey = () => ({ ...(PEOPLE as any)[PID.osprey] })
const CHANGES: Record<string, () => boolean> = {
  /* a mark on 149's Tracker (the Tracker says whose is open) */
  /* (setup only — fix read 2, 22 Nov 26: 149's Tracker is open because 149 is picked, as the app binds it; the page's own
     squadron is then 149 for a master admin and a Plan holder, his own for everyone else — the afterEach puts the pick back) */
  tracker: () => { setTrkUnitProbe(() => 'u149'); switchUnit('u149'); try { return passes('trk.marks', { collection: 'trk.marks', id: 'v3:c1:s1:marks', after: { x: 1 } }) } finally { setTrkUnitProbe(null) } },
  /* 149's Logic settings */
  logic: () => passes('settings.rules', { collection: 'settings', id: 'u149@rules', after: { crewRest: 13 } }),
  /* a 149 man's Quals row, naming no owner as a forged command would (his own row through the real door is the cells
     file's `qualsOwn`) */
  quals: () => passes('people.edit', { collection: 'people', id: PID.osprey, before: osprey(), after: { ...osprey(), ini: 'ZZ' } }),
}
const NAMES = Object.keys(CHANGES)
const run = () => Object.fromEntries(NAMES.map(n => [n, CHANGES[n]!()]))
const all = (v: boolean) => Object.fromEntries(NAMES.map(n => [n, v]))

describe('a change to 149\'s records, hand-made, by each kind of sign-in (D2259)', () => {
  it('149\'s own admin: every one', () => { signInAs('kestrel'); expect(run()).toEqual(all(true)) })
  it('149\'s own member: its Tracker only (everyone edits his squadron\'s Tracker, D121)', () => {
    signInAs('osprey'); expect(run()).toEqual({ ...all(false), tracker: true })
  })
  it('a master admin: every one (D2191, D2197)', () => { signInAs('saber'); expect(run()).toEqual(all(true)) })
  it('a 142 admin holding Plan of 149: every one (D2201, D2241)', () => { give('hunter', 'admin'); signInAs('hunter'); expect(run()).toEqual(all(true)) })
  it('a 142 admin holding nothing of 149: none (D2192)', () => { signInAs('hunter'); expect(run()).toEqual(all(false)) })
  it('a 142 admin holding View of 149: none — View writes nothing (D2191, D2252)', () => { give('hunter', 'view'); signInAs('hunter'); expect(run()).toEqual(all(false)) })
  it('a 142 member, and one holding View of 149: none, the Tracker included (D2252)', () => {
    signInAs('ranger'); expect(run()).toEqual(all(false))
    give('ranger', 'view'); signInAs('ranger'); expect(run()).toEqual(all(false))
  })
  it('a Plan holder in the member view: none (D292, D2253)', () => { give('hunter', 'admin'); signInAs('hunter'); switchRoleView(); expect(run()).toEqual(all(false)) })
  it('an admin the day his own move to 149 counts: his old squadron\'s Logic is no longer his to change (D2203, D2243)', () => {
    /* Hunter, 142's admin, moves to 149 from Thu 16 Jul: on that day 142's Logic is not his to change */
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    on(16); unitsLoad(); accountsLoad(); signInAs('hunter')
    expect(passes('settings.rules', { collection: 'settings', id: 'u142@rules', after: { crewRest: 13 } })).toBe(false)
  })
  it('a member the day his move counts: his old squadron\'s Tracker is closed to him, his new one\'s open (D2243)', () => {
    signInAs('saber'); expect(moveMan(PID.ranger, 'u149').ok).toBe(true)
    on(16); unitsLoad(); accountsLoad(); signInAs('ranger')
    const trk = (u: string) => { setTrkUnitProbe(() => u); try { return passes('trk.marks', { collection: 'trk.marks', id: 'v3:c1:s1:marks', after: { x: 1 } }) } finally { setTrkUnitProbe(null) } }
    expect([trk('u142'), trk('u149')]).toEqual([false, true])
  })
  it('a suspended account and a person waiting: none', () => {
    signInAs('saber'); expect(updateAccount(ACCT.osprey, { on: false })).toBeNull()
    signInAs('osprey'); expect(run()).toEqual(all(false))
    signInAs('stranger@kinds', 'pw'); expect(run()).toEqual(all(false))
  })
})
