// @vitest-environment jsdom
/* EVERY KIND OF SIGN-IN AGAINST THE DOORS — the cells that hold ([MSQ-FABLE-REVIEW], his D2259; the table written first
   from his rulings: docs/superpowers/briefs/2026-11-21-msq-signin-kinds-table.md).

   Each test signs in as one kind, in his own squadron or with the other squadron entered, and presses the real doors one
   after another — a Logic setting, the Inputs window's save, the Quals write, the Leave War's own writers, Admin → Users'
   account, rights and archive doors. A door "wrote" when a command was kept that changed a record. The list beside each
   kind is every door of the run that the rulings let him change there; every other door of the run must change nothing.

   The kinds: MA a master admin (Saber, 142); AD a squadron's admin at home (Hunter, 142); PL Hunter holding Plan of 149;
   VA Hunter holding View of 149; ME a member (Ranger, 142); VM Ranger holding View of 149; MV+ Ranger the day his move to
   149 counts; PLmv and MAmv a Plan holder and a master admin in the member view (D2253); OFF a suspended account; WA a
   person waiting for access.

   The cells that do NOT hold are not here: they are findings, their red proofs kept outside the project and quoted in
   the reader's report (a master admin in the member view naming another squadron's man; an admin who moves keeping his
   admin role; a squadron's own admin moving his own man; his own balance typed into another squadron's war).

   The world: test-support/msq-world.ts (Wed 15 Jul 26). */
import { describe, it, expect, afterEach } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT, on, moveMan } from '../test-support/msq-world'
import { switchUnit, enterSquadron, switchRoleView } from './store'
import { setGrant, setHome, unitsLoad, homeOn } from './units'
import { updateAccount, accountsLoad, setMaster } from './accounts'
import { store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { SESSION } from './auth'
import { roleOf, lwUnitNow, pageUnit, mayEditSched, mayManageAccounts, mayDecideBids, mayEditSettings } from './perms'
import { commitInput, draftOf } from '../ui/inputedit'
import { updatePersonField } from './quals-write'
import { onCommit } from '../command'
import { archivePerson } from '../leavewar/sync'
import * as lw from '../leavewar/state/store'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT) })

/* press a door; the records the kept commands changed */
function wrote(fn: () => unknown): string[] {
  const seen: string[] = []
  const off = onCommit(e => { for (const c of e.changes) seen.push(`${c.collection}/${c.id}`) })
  try { fn() } catch { /* a door that throws changed nothing it kept */ } finally { off() }
  return seen
}
const other = (u: string) => (u === 'u142' ? 'u149' : 'u142')
const give = (who: 'hunter' | 'ranger', level: 'admin' | 'view') => { signInAs('saber'); expect(setGrant(ACCT[who], 'u149', level, PID[who]).ok).toBe(true) }
/* bidding opened in both squadrons' wars, so a member's own bid has an open day */
const openBidding = () => { signInAs('saber'); lw.openDates('2026-07-16', '2026-08-31'); signInAs('kestrel'); lw.openDates('2026-07-16', '2026-08-31') }
const meId = () => String(SESSION?.pid ?? '')
/* a man of that squadron on 22 Jul who is none of the seeded sign-ins and not the person signed in */
const mateOf = (unit: string): string =>
  Object.keys(PEOPLE).find(k => { const p: any = (PEOPLE as any)[k]; return !p.archived && !p.deleted && !p.special && k !== meId() && !(Object.values(PID) as string[]).includes(k) && homeOn(k, '2026-07-22') === unit })!
const duty = (pid: string) => draftOf({ person: pid, type: 'Duty', date: 'Jul 22', yr: 2026, allday: false, s: 540, e: 720, remarks: 'kinds' })
const leave = (pid: string) => draftOf({ person: pid, type: 'OL', date: 'Jul 22', yr: 2026, allday: true, remarks: 'kinds' })
const warMate = () => lw.getState().people.find(p => p.id !== meId() && !(Object.values(PID) as string[]).includes(p.id))!.id

type Where = 'own' | 'other'
type Kind = { name: string; home: string; setup: () => void }
/* the doors, in the order pressed; `unit` is the squadron the cell is about */
const DOORS: Record<string, (unit: string, k: Kind) => unknown> = {
  /* Edit Schedule's side: a setting of the schedule in view (the CX reasons list — Logic and the schedule settings) */
  logic: () => store.set('cxreasons', ['KINDS']),
  /* Inputs: his own; leave for another man of that squadron (never a member's, D655); a duty for another man of it */
  inputOwn: () => commitInput(null, draftOf({ person: meId(), type: 'OD', date: 'Jul 22', yr: 2026, allday: true, remarks: 'kinds' }), [meId()]),
  leaveForMate: (unit) => { const t = mateOf(unit); return commitInput(null, leave(t), [t]) },
  dutyForMate: (unit) => { const t = mateOf(unit); return commitInput(null, duty(t), [t]) },
  /* Quals: his own row; his own Scheduler tick (an admin's, D1651); another man's row */
  qualsOwn: () => updatePersonField(meId(), { initials: 'ZZ' }),
  qualsOwnSched: () => updatePersonField(meId(), { tick: 'sched' }),
  qualsMate: (unit) => updatePersonField(mateOf(unit), { initials: 'ZY' }),
  /* the Leave War loaded: another man's entry, the open dates, an OIL grant, another man's balance, the lock */
  lwMateBid: () => lw.setCell(warMate(), '2026-07-23', 'LL'),
  lwOpen: () => lw.openDates('2026-09-01', '2026-09-10'),
  lwGrantOil: () => lw.grantOil([warMate()], 1, '2026-07-14', 'kinds', 'X'),
  lwBalMate: () => lw.setTypedBalance(warMate(), 'CCL' as any, 5),
  lwLock: () => lw.setBalanceLock(true),
  /* Admin → Users: View of that squadron given to a man of the other; Plan of it given; a master admin made; a master
     admin's account; himself moved; a man's account suspended; a man archived */
  giveView: (unit) => { const t = unit === 'u142' ? 'osprey' : 'ranger'; return setGrant(ACCT[t], unit, 'view', PID[t]) },
  givePlan: (unit) => { const t = unit === 'u142' ? 'kestrel' : 'hunter'; return setGrant(ACCT[t], unit, 'admin', PID[t]) },
  makeMaster: () => setMaster(ACCT.kestrel, true),
  masterRow: () => updateAccount(ACCT.saber, { role: 'main' }),
  moveSelf: (_u, k) => setHome(meId(), other(k.home)),
  suspend: (unit) => updateAccount(unit === 'u142' ? ACCT.ranger : ACCT.osprey, { on: false }),
  archiveMate: (unit) => archivePerson(mateOf(unit)),
}
const ALL = Object.keys(DOORS)
const ADMIN_OWN = ['logic', 'inputOwn', 'leaveForMate', 'dutyForMate', 'qualsOwn', 'qualsOwnSched', 'qualsMate', 'lwMateBid', 'lwOpen', 'lwGrantOil', 'lwBalMate', 'lwLock', 'giveView', 'suspend', 'archiveMate']
const MEMBER_OWN = ['inputOwn', 'dutyForMate', 'qualsOwn']
/* in the other squadron, his own input and his own Quals row are still his own — they are his own squadron's records */
const SELF_ONLY = ['inputOwn', 'qualsOwn']
/* an admin with no Plan of the other squadron who enters it: the Leave War loaded stays HIS OWN squadron's (asserted in
   each test), so its doors still write his own squadron's war, as at home; of the other squadron he changes nothing */
const ADMIN_STAYS_HOME = [...SELF_ONLY, 'qualsOwnSched', 'lwMateBid', 'lwOpen', 'lwGrantOil', 'lwBalMate', 'lwLock']

const KINDS: Array<Kind & { own: string[]; other: string[]; war: Record<Where, string> }> = [
  /* a master admin: every page of every squadron (D2191, D2197); the only giver of Plan and maker of a master admin */
  { name: 'MA — a master admin', home: 'u142', setup: () => signInAs('saber'),
    own: [...ADMIN_OWN, 'givePlan', 'makeMaster'], other: [...ADMIN_OWN, 'givePlan', 'makeMaster'], war: { own: 'u142', other: 'u149' } },
  /* a squadron's admin: his own squadron whole — Plan of it too, since U2 (his D2626: Plan of a squadron is given by its
     own admins or a master admin; RE-POINTED from "never Plan"); nothing of the other (D2192) — its pick does not stand */
  { name: 'AD — a squadron\'s admin', home: 'u142', setup: () => signInAs('hunter'),
    own: [...ADMIN_OWN, 'givePlan'], other: ADMIN_STAYS_HOME, war: { own: 'u142', other: 'u142' } },
  /* Plan of 149: everything its own admins have (D2201, D2211, D2241) — never Plan OF 149, never a master admin (D2626,
     D2205); at home he is 142's own admin, so gives Plan of 142 (U2, as above) */
  { name: 'PL — an admin holding Plan of 149', home: 'u142', setup: () => { give('hunter', 'admin'); signInAs('hunter') },
    own: [...ADMIN_OWN, 'givePlan'], other: ADMIN_OWN, war: { own: 'u142', other: 'u149' } },
  /* View of 149: its schedule and Logic read only; View writes nothing (D2191, D2252); at home, as AD */
  { name: 'VA — an admin holding View of 149', home: 'u142', setup: () => { give('hunter', 'view'); signInAs('hunter') },
    own: [...ADMIN_OWN, 'givePlan'], other: ADMIN_STAYS_HOME, war: { own: 'u142', other: 'u142' } },
  { name: 'ME — a member', home: 'u142', setup: () => signInAs('ranger'),
    own: MEMBER_OWN, other: SELF_ONLY, war: { own: 'u142', other: 'u142' } },
  { name: 'VM — a member holding View of 149', home: 'u142', setup: () => { give('ranger', 'view'); signInAs('ranger') },
    own: MEMBER_OWN, other: SELF_ONLY, war: { own: 'u142', other: 'u142' } },
  /* the day his move counts he is 149's member and nothing in 142 (D2203, D2243) */
  { name: 'MV+ — a member the day his move to 149 counts', home: 'u149',
    setup: () => { signInAs('saber'); expect(moveMan(PID.ranger, 'u149').ok).toBe(true); on(16); unitsLoad(); accountsLoad(); signInAs('ranger') },
    own: MEMBER_OWN, other: SELF_ONLY, war: { own: 'u149', other: 'u149' } },
  /* in the member view a Plan holder is a member of his own squadron (D292, D2253) */
  { name: 'PLmv — a Plan holder in the member view', home: 'u142', setup: () => { give('hunter', 'admin'); signInAs('hunter'); switchRoleView() },
    own: MEMBER_OWN, other: SELF_ONLY, war: { own: 'u142', other: 'u142' } },
  /* …and so is a master admin, in his own squadron (the other squadron's cells are a finding — not pinned here) */
  { name: 'MAmv — a master admin in the member view', home: 'u142', setup: () => { signInAs('saber'); switchRoleView() },
    own: MEMBER_OWN, other: [], war: { own: 'u142', other: 'u142' } },
  /* an account switched off reads and writes nothing (D280, §11) */
  { name: 'OFF — a suspended account', home: 'u142', setup: () => { signInAs('saber'); expect(updateAccount(ACCT.ranger, { on: false })).toBeNull(); signInAs('ranger') },
    own: [], other: [], war: { own: 'u142', other: 'u142' } },
  /* a person waiting sees only the waiting screen (D2239) */
  { name: 'WA — a person waiting for access', home: 'u142', setup: () => { signInAs('stranger@kinds', 'pw') },
    own: [], other: [], war: { own: 'u142', other: 'u142' } },
]

describe('every kind of sign-in against the doors — the cells that hold (D2259)', () => {
  for (const k of KINDS) for (const where of ['own', 'other'] as const) {
    if (k.name.startsWith('MAmv') && where === 'other') continue
    it(`${k.name}, in ${where === 'own' ? 'his own squadron' : 'the other squadron'}`, () => {
      openBidding()
      k.setup()
      const unit = where === 'own' ? k.home : other(k.home)
      if (where === 'other') enterSquadron(unit)
      /* whose Leave War is loaded: the other squadron's only for a master admin or a Plan holder (D2197, D2201, D2252) */
      expect(lwUnitNow(), 'the Leave War loaded').toBe(k.war[where])
      expect(pageUnit('own'), 'his own pages').toBe(k.war[where])
      const may = where === 'own' ? k.own : k.other
      const got: Record<string, boolean> = {}, want: Record<string, boolean> = {}
      for (const d of ALL) { got[d] = wrote(() => DOORS[d]!(unit, k)).length > 0; want[d] = may.includes(d) }
      expect(got).toEqual(want)
    })
  }
})

describe('what each kind is offered — the questions the screens ask', () => {
  const offered = () => ({ sched: mayEditSched(), accounts: mayManageAccounts(), bids: mayDecideBids(), settings: mayEditSettings() })
  const NONE = { sched: false, accounts: false, bids: false, settings: false }
  it('a member, a member with View, a Plan holder and a master admin in the member view, a suspended account and a person waiting are offered no admin control', () => {
    signInAs('ranger'); expect(offered()).toEqual(NONE)
    give('ranger', 'view'); signInAs('ranger'); enterSquadron('u149'); expect(offered()).toEqual(NONE); switchUnit('u142')
    give('hunter', 'admin'); signInAs('hunter'); switchRoleView(); expect([roleOf(), offered()]).toEqual(['member', NONE])
    signInAs('saber'); switchRoleView(); expect([roleOf(), offered()]).toEqual(['member', NONE])
    signInAs('saber'); expect(updateAccount(ACCT.ranger, { on: false })).toBeNull()
    signInAs('ranger'); expect([roleOf(), offered()]).toEqual(['off', NONE])
    signInAs('stranger@kinds', 'pw'); expect([roleOf(), offered()]).toEqual(['pending', NONE])
  })
})
