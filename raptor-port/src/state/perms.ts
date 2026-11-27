/* THE ONE PLACE THAT ANSWERS "MAY THIS PERSON DO THIS?" ([ACCOUNTS], D200 (3), 26 Sep 26).

   Owner, D200: "one place in the app answers 'may this person do this?', mirroring that
   table, with a test that fails when they disagree — so the server's rules at the
   database step are a translation of an agreed list, not a hunt."

   Four parts, all here:
   1. PERMS — docs/data-model.md §11 as data. perms.test.ts reads §11 from disk and
      fails when a row, a letter, a column or a named gap differs. Edit the two TOGETHER.
   2. The named questions every gate asks (isAdmin, me, mayEditSched, mayEditInput …),
      one-line wrappers over `allows`. A gate that reads SESSION.role, LOGINROLE or
      compares a person with ME directly is a finding — perms-scan.test.ts fails on it.
   3. COMMAND_OPS + cmdAuthorize — the command gate. Every registered command type maps
      to a row of PERMS; state/store.ts installs cmdAuthorize as the command layer's
      resolver at boot, so the command layer's authority IS this table. A type with no
      row is refused.
   4. The medical-detail rule (D211): every member reads a medical input in full; nobody
      else is shown the schedule (the guest role went with the guest view, D2239).

   The browser MIRRORS; the server will ENFORCE (data-model §11, "The server enforces,
   the browser mirrors"). These checks give the right answer on screen and refuse a
   hand-made call; they are not security against someone editing the page's code.

   "No session" (SESSION null) is the headless engine — a unit test, the boot, the
   parity harness — never a user: every question below answers it the way the gate it
   replaced did (stated per question), so no headless test changes meaning. */
import { SESSION, ME, setEffectiveRole } from './auth'
import { checkEntry } from './guard'
import { store, unitSetting } from '../engine/hooks'
import { INPUTS, inpMeta, typeGroup, isSansAvail, needsDoc, peopleOf, idsOf, leadOf, onlyNamed, holds, placeHeld, placeOf, namedOf, placeholderOf, inputSpanIso, inputSquadrons, inputUnitOf, sansNewDayProblem } from '../engine/inputs'
import { dayNamedIds } from '../engine/publish'
import { dayIso } from '../engine/verid'
import { deriveActor } from '../command/actor'
import { voidedOil } from '../engine/oil'
/* the seeded accounts, read only by the posting pass's first-write rule below (accounts.ts imports this file; the call is
   made only when a command is judged, never as the module loads) */
import { seedAccounts, ACCOUNTS_LIST, isMasterAccount, accountBefore, levelAcct, readAccounts, adminLineAudience, type Account } from './accounts'
import { unitRowsBefore, unitRowsAfter, levelBefore, homeBefore, homeChangesBefore, todayIso, homeOn, levelOfAccount, setNewHomeUnit, grantBefore, grantRowHolds, datedBreach, lockBreach, everOfBefore, units as storeUnits, unitById as storeUnitById, mayGivePlanOn, madeAdminsNow } from './units'
import { PEOPLE, sansStart, sansStop } from '../engine/people'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { unitOf, isUnitId, split } from '../storage/unitid'
import {
  UNIT_PFX, PLACE_PFX, UNITPLACE_PFX, GRANT_PFX, HOME_PFX, UNIT_ROW_PREFIXES, validUnit, validPlace, validUnitPlace, validGrant,
  validHome, unitIn, placeIn, placeIdOn, moveFrom, grantStart, unitsAtPlace, squadronOrder, type UnitRows, type LevelAccount,
  type GrantHolder,
} from './units-model'
import { oilPlanOf } from './inputgate-hook'
import type { Actor, Change, CommitEnvelope } from '../command/types'
import { deepEqual } from '../command/util'
/* (notices.ts reads this module too — mayEditSched; each side calls the other only at run time, never at load) */
import { noticeAboutHim, noticeLeftBell, filerTold, filerVia, foldedInto, joinFilerImgs, dayOfAt, changeFiler, APP_ACTS, passMade, warMade, holMade, shareMade, AT_SLACK_MS, NOTICES, isAcctNotice, poFailedLineId } from './notices'
import { accessIn, accessParts, movedParts, acctByApp, movedLineId, MOVES_TOLD_DAYS, type AcctPart } from './acctlines'
import { addDays } from './flyplan-model'

export type Act = 'C' | 'R' | 'U' | 'D'
/* THE ROLES A SESSION HOLDS. The guest role is gone (his D2239, 20 Nov 26: the guest view is removed — a person who asked
   sees only the waiting screen until an admin of his squadron approves him). */
export type Role = 'admin' | 'member' | 'pending'
/* §11'S COLUMNS ARE THE ROLES: the table's Guest column went with §11's own (docs/data-model.md, the reshape's phase 3 —
   D2239), the two changed in one commit as perms.test.ts holds them one table. */
export interface Cell { all: Act[]; own: Act[] }
export interface PermRow { admin: Cell; member: Cell; pending: Cell; gaps: string[] }

const cell = (all: string, own = ''): Cell => ({
  all: all.split(' ').filter(Boolean) as Act[],
  own: own.split(' ').filter(Boolean) as Act[],
})
const NONE = cell('')
const row = (admin: Cell, member: Cell, pending: Cell = NONE, gaps: string[] = []): PermRow =>
  ({ admin, member, pending, gaps })

/* the §11 table names, exactly as its first column reads with the backticks taken off */
export const T = {
  person: 'Person',
  qualification: 'Qualification',
  qualmark: 'QualMark',
  setting: 'Setting, SchemaVersion',
  missionrole: 'MissionRoleAnswer',
  user: 'User',
  accessreq: 'AccessRequest',
  /* [DB-READINESS] group A, phase 4.4 (R3-04): each admin's own record of the requests he has had on screen — out of the
     request row, where every admin's bell shared one list */
  reqseen: 'AccessRequestSeen',
  sched: 'ScheduleWeek family, DayDraft, RowPerson',
  amendment: 'Amendment, Signoff',
  editlog: 'EditLog',
  /* [DB-READINESS] group A, phase 4.1: one row per saved group, written by the store with every change (state/changebatch.ts) */
  changebatch: 'ChangeBatch',
  seen: 'EditLogSeen',
  /* the bell's notices (state/notices.ts — the one-rule build's step 7): one row a person told that an input he is in
     was changed; and what each person has read of them, his own row */
  notice: 'Notice',
  noticeseen: 'NoticeSeen',
  /* each admin's own moment of opening the Leave War's Approvals (M4 8.4 — state/apprseen.ts) */
  apprseen: 'LeaveApprovalsSeen',
  input: 'Input',
  attachment: 'Attachment, InputAttachment',
  war: 'LeaveWar',
  bid: 'LeaveBid',
  award: 'LeaveLedger (an OIL award: counter oil, amount above 0)',
  ledger: 'LeaveOpening, LeaveLedger, LeaveCounter',
  /* M5a (the build spec §3): a figure typed from the official leave app, one row per person and kind; a person's leave
     grade; when a person last opened his own person window (the new-since-his-last-visit dots) */
  balance: 'LeaveBalance',
  grade: 'LeaveGrade',
  lwseen: 'LeaveSeen',
  /* which squadrons' lines a person's bell shows (state/bellsqn.ts — batch 1's second half §7 item 3): his own row */
  bellsqn: 'BellSquadrons',
  profile: 'LeavePersonProfile',
  tracker: 'Course, Syllabus, TrainingEvent, EventPrerequisite, Layout, CoursePlan, Enrolment, Attempt',
  /* multi-squadron batch 1, step 1 (state/units.ts): the units, the places they are at (and when), a right in a unit
     that is not the account's home, and each person's home unit (and from when) */
  unit: 'Unit',
  place: 'Place',
  unitplace: 'UnitPlace',
  grant: 'UnitGrant',
  home: 'PersonHome',
} as const

/* 1. THE MATRIX — data-model.md §11, row for row. */
export const PERMS: Record<string, PermRow> = {
  [T.person]: row(cell('C R U D'), cell('R', 'U')),
  [T.qualification]: row(cell('C R U D'), cell('R')),
  [T.qualmark]: row(cell('C R U D'), cell('R', 'C U D')),
  [T.setting]: row(cell('C R U D'), cell('R')),
  [T.missionrole]: row(cell('C R U D'), cell('R')),
  [T.user]: row(cell('C R U D'), cell('', 'R')),
  [T.accessreq]: row(cell('R D'), NONE, cell('', 'C')),
  [T.reqseen]: row(cell('', 'C R U'), NONE),
  [T.sched]: row(cell('C R U D'), cell('R')),
  [T.amendment]: row(cell('C R'), cell('R')),
  /* a history line is written by whoever made the change, in its changeset (group A, phase 4.3; the final read's F1) */
  [T.editlog]: row(cell('C R D'), cell('C R')),
  [T.changebatch]: row(cell('C R'), cell('C R'), cell('C')),
  [T.seen]: row(cell('', 'C R U'), cell('', 'C R U')),
  /* a notice is written by whoever made the change, inside it, and read by the person it is addressed to; nobody
     rewrites one, and it is removed only by its maker's own Undo of that change */
  [T.notice]: row(cell('C R D'), cell('C', 'R D')),
  /* …and an ADMIN reads every person's (M4 9.3 — D1216): his Undo of a Leave War decision asks whether its member had read
     the line it takes back */
  [T.noticeseen]: row(cell('R', 'C R U'), cell('', 'C R U')),
  /* an admin's own row; a member has no Approvals (D1254) */
  [T.apprseen]: row(cell('', 'C R U'), NONE),
  [T.input]: row(cell('C R U D'), cell('R', 'C R U D')),
  [T.attachment]: row(cell('R'), cell('R', 'C R')),
  [T.war]: row(cell('C R U D'), cell('R')),
  [T.bid]: row(cell('C R U D'), cell('R', 'C U D')),
  /* [OIL-AWARD-IS-A-GRANT] (29 Sep 26): every hand-given OIL award is ONE kind of record — a positive OIL ledger entry —
     and keeps its OWN row: every member reads every man's (the grid draws every row, D402). The rest of the ledger was
     his own only, with the gap to what the app shows filed as [LEDGER-READ-ASK]; D1008 (18 Oct 26, "as recommended")
     closed it the other way — every member reads every man's entries, figures and grants with their reasons, as the OIL
     tracker and the figure breakdown have always shown; writing stays the admin's */
  [T.award]: row(cell('C R U D'), cell('R')),
  [T.ledger]: row(cell('C R U D'), cell('R')),
  /* every member reads every man's figures (D1242); he types his own while they are unlocked (D1203, D1220) — his first
     typing creates the row and his Undo of it deletes it (narrow read 5); the lock, what he may write and what the gate
     recomputes are `ownershipViolation`'s */
  [T.balance]: row(cell('C R U D'), cell('R', 'C U D')),
  [T.grade]: row(cell('C R U D'), cell('R')),
  [T.lwseen]: row(cell('', 'C R U'), cell('', 'C R U')),
  [T.bellsqn]: row(cell('', 'C R U'), cell('', 'C R U')),
  [T.profile]: row(cell('C R U D'), cell('R')),
  [T.tracker]: row(cell('C R U D'), cell('C R U D')),
  /* the units (step 1): every signed-in person reads the units — a pending person's view names theirs; only
     a MASTER makes one (MASTER_ONLY_COMMANDS below — §11 notes it in the cell); the place, a unit's place and a home are
     an admin's OF that unit (the commit gate reads the row's unit — unitRowViolation); a member reads his own rights */
  [T.unit]: row(cell('C R U D'), cell('R'), cell('R')),
  [T.place]: row(cell('C R U D'), cell('R')),
  [T.unitplace]: row(cell('C R U D'), cell('R')),
  [T.grant]: row(cell('C R U D'), cell('', 'R')),
  [T.home]: row(cell('C R U D'), cell('R')),
}

/* 4. WHO READS A MEDICAL INPUT IN FULL (D211, 26 Sep 26 — "Keep as today": every member).
   D213's guest, who read it too, went with the guest view (D2239 replaces D213): an admin
   and a member are the only readers the schedule is shown to. The question stays one
   place, so a later ruling moves one line. */
export const MEDICAL_DETAIL: Role[] = ['admin', 'member']

/* ---- who is signed in ------------------------------------------------------ */
export type Who = Role | 'off' | null
/* null = no session (the headless engine). An account's member role is 'main'; the
   localhost probe bridge's raptorRole writes 'member' — both are a member. */
export function roleOf(s: any = SESSION): Who {
  if (!s) return null
  const r = s.role
  if (r === 'admin') return 'admin'
  if (r === 'pending' || r === 'off') return r
  /* no sign-in gives the guest role since D2239 (the guest view removed); a session still carrying it — hand-made, it
     cannot be signed into — holds nothing: an account switched off, never a member */
  if (r === 'guest') return 'off'
  return 'member'
}
/* an actor's role as the gate reads it: null is the system actor alone; a role no actor is given — the guest role since
   D2239 among them, on a hand-made actor (command/actor.ts gives a session still carrying it 'off') — holds nothing,
   never read as the system actor (which the gate lets through) */
const actorRole = (a: Actor): Who =>
  a.role === 'system' ? null : a.role === 'admin' || a.role === 'member' || a.role === 'pending' || a.role === 'off' ? a.role : 'off'
/* was a committed change made by an admin? — the change history's Leave War lines say a request DELETED only when an
   admin took it away ([DRAFT-PENDING]; a member's own bid coming off is not a decision) */
export const actorIsAdmin = (a: Actor | null | undefined): boolean => !!a && actorRole(a) === 'admin'

/* whose own-row rule applies: a person's id for an admin or a member; a pending
   principal's sign-in name for his own access request; nobody for an account switched
   off */
function identityOf(who: Who, s: any = SESSION): string | null {
  if (who === 'admin' || who === 'member') return ME == null || ME === '' ? null : String(ME)
  if (who === 'pending') return s && s.name ? String(s.name) : null
  return null
}

/* the one rule under every question: does `who` hold `act` on `table`, for a record
   owned by `owner`? */
export function allows(who: Who, table: string, act: Act, owner?: string | null, identity?: string | null): boolean {
  /* only a session's role holds anything — the retired guest role holds nothing (D2239), whatever a hand-made call
     passes */
  if (who !== 'admin' && who !== 'member' && who !== 'pending') return false
  const r = PERMS[table]
  if (!r) throw new Error(`perms: no row "${table}" in the permissions matrix`)
  const c = r[who]
  if (c.all.includes(act)) return true
  if (!c.own.includes(act)) return false
  return owner != null && owner !== '' && identity != null && identity !== '' && String(owner) === identity
}
/* the signed-in session's answer; headless (no session) answers `headless` */
function may(table: string, act: Act, owner: string | null | undefined, headless: boolean): boolean {
  const who = roleOf()
  if (who === null) return headless
  return allows(who, table, act, owner, identityOf(who))
}

/* THE ADMIN'S MEMBER VIEW (owner D292, 27 Sep 26 — "6. yes"; it replaces D166 (3)'s "no preview as a member"). An
   admin taps his name badge and the app behaves exactly as for a member; a tap switches back; every sign-in starts as
   admin (the session's role is the account's, set by resetSession). THE ROLE IN FORCE IS THE SESSION'S ROLE — roleOf,
   every question below, the command actor (command/actor.ts) and the ownership check read it, so the switch reaches all
   of them with no second switch. Who may switch is the session's ACCOUNT role (`acct`, set at sign-in by
   accounts.ts sessionFor and never changed by the switch — Astra's plan read A6): only a real admin, only between admin
   and member, never another person. A pending person, an account suspended, a member — no switch, and a
   hand-made call changes nothing. */
export function mayViewAsMember(): boolean {
  const w = roleOf()
  return !!SESSION && SESSION.acct === 'admin' && (w === 'admin' || w === 'member')
}
export function switchRoleInForce(next: any): boolean {
  if (next !== 'admin' && next !== 'main') return false
  if (!mayViewAsMember()) return false
  /* the role switch: the test set-ups' entry checker asks the guard again first (the guard rail's plan §3.4 — step K7;
     a no-op in the app) */
  checkEntry('switch', next)
  setEffectiveRole(next)
  return true
}

/* 2. THE NAMED QUESTIONS ------------------------------------------------------ */
export const isAdmin = (): boolean => roleOf() === 'admin'
/* a signed-in admin or member — someone with access to the app's pages */
export const isMember = (): boolean => { const w = roleOf(); return w === 'admin' || w === 'member' }
/* (isGuest went with the guest view, D2239 — its readers, the view page's guest branches, with it) */
/* the signed-in person (an admin or a member), or null — a pending person and an
   account switched off are nobody's person. Headless (no session) it is the
   headless default person (auth.ts DEFAULT_ME), exactly as the ME every gate read
   before [ACCOUNTS] — so no sessionless unit test changes meaning. */
export function me(): string | null {
  const w = roleOf()
  if (w !== null && w !== 'admin' && w !== 'member') return null
  return ME == null || ME === '' ? null : String(ME)
}
/* "is this the signed-in person?" — the own-row test and the "this is you" display */
export function isMe(pid: any): boolean { const m = me(); return m != null && pid != null && String(pid) === m }
/* HIS OWN SQUADRON (multi-squadron step 3 — plan §3.4, D2132): the signed-in person's home unit on `iso` (today unless
   named). The pages that stay on his own squadron whatever schedule is in view — the Inputs page and its calendars,
   Quals — list its people (engine/roster.ts rosterOf) and its inputs (engine/inputs.ts inputsFor). Nobody signed in, a
   person waiting, or a person with no home: the boot unit, as the unit in view starts (state/store.ts sessionUnit). */
export function myUnit(iso: string): string {
  const m = me()
  const h = m ? homeOn(m, iso) : null
  return h && isUnitId(h) ? h : BOOT_UNIT
}

/* THE PAGE'S SQUADRON (the reshape plan §3.2 A-ii; the Plan audit, D2242). 'schedule' — Edit Schedule, View-only Sched,
   the Board, Logic: the squadron picked (engine/unitview.ts UNIT). 'own' — Inputs and its calendar, Medical, the SANS
   calendar and day, Quals, the OIL answer list, the Leave War, the Tracker, Admin → Users: the pick for an admin in force
   who is a master admin, or who holds Plan of the pick ON THAT DAY (D2197, D2201) — never a View holder (D2191: View
   follows the pick on the schedule pages and Logic only) and never in the member view (R5: an admin switched to the
   member view is a member — D292); anyone else his own squadron that day; nobody signed in the boot unit. Today the pick
   is everyone's home (switchUnit has one caller, sign-in), so this answers what each page answers now; it goes live with
   step 5's menu (P3). */
export function pageUnit(kind: 'schedule' | 'own', iso: string = todayIso()): string {
  if (kind === 'schedule') return UNIT
  const m = me()
  if (!SESSION || !m || roleOf() !== 'admin') return myUnit(iso)
  const acct: any = ACCOUNTS_LIST.find(a => a.id === SESSION.user)
  if (acct && UNIT !== homeOn(m, iso) && (acct.master === true || levelOfAccount(levelAcct(acct), UNIT, iso) === 'admin')) return UNIT
  return myUnit(iso)
}
/* COULD HIS OWN PAGES BE `u`'s (batch 1's second half §7 item 5, R9 — the bell's tap on a line of another squadron): the
   squadron pageUnit('own') would answer were `u` picked — his home that day, or, the role in force admin, a squadron he
   is admin of by a Plan or the master mark (pageUnit's own test, above). A View holder's own pages are always his home,
   so a View of `u` answers false. */
export function ownPageMayBe(u: string, iso: string = todayIso()): boolean {
  if (!SESSION || !me() || !u) return false
  if (u === myUnit(iso)) return true
  if (roleOf() !== 'admin') return false
  const acct: any = ACCOUNTS_LIST.find(a => a.id === SESSION.user)
  return !!acct && (acct.master === true || levelOfAccount(levelAcct(acct), u, iso) === 'admin')
}
/* HIS OWN PAGES' SQUADRON WERE `u` PICKED (§16 D2′ — the pick's question for unsaved Tracker edits asks it before the pick):
   `u` where pageUnit('own') would follow the pick (ownPageMayBe), else his own squadron that day. */
export function ownPageIfPicked(u: string, iso: string = todayIso()): string {
  return ownPageMayBe(u, iso) ? u : myUnit(iso)
}
/* THE TRACKER IN THE MEMBER VIEW (his D2395, which took away D2318's read-only and hidden bands; D2253): the Tracker
   follows his own pages' squadron (tracker/app/core.js followUnit), so it stands on another (trkUnitNow — its bound
   squadron) only where the door is held for chart work. This says whether the MEMBER VIEW is why: the role in force is a
   member's and, read from the ACCOUNT, he is an admin of that squadron by any road — a Plan of it, the master mark, his
   home's admin role — so leaving the member view opens it. Anything else (bound = own, nothing bound, nobody signed in, a
   right lowered or taken): null. The gate's 7f clause still judges every Tracker write by the role in force
   (trkUnitViolation, below). */
export type TrkCoverKind = { kind: 'member'; bound: string; own: string } | null
export function trackerCoverKind(iso: string = todayIso()): TrkCoverKind {
  const bound = trkUnitNow()
  if (!bound || !SESSION || !me() || roleOf() === 'admin') return null
  const own = pageUnit('own', iso)
  if (bound === own) return null
  const acct: any = ACCOUNTS_LIST.find(a => a.id === SESSION.user)
  const adminThere = !!acct && acct.role === 'admin' && (acct.master === true || levelOfAccount(levelAcct(acct), bound, iso) === 'admin')
  return adminThere ? { kind: 'member', bound, own } : null
}
/* A WINDOW THE MEMBER VIEW HOLDS (his D2389, D2400; state/typing-hold.ts memberViewBand): he is an admin in the member view,
   and the window's squadron is the one in view, not his home, and one he is an admin of by a Plan or the master mark — read
   from the ACCOUNT, as trackerCoverKind's 'member' is — so the switch back really gives him the window: the band tells him
   so only where that is true. A right lowered or taken meanwhile, or a window on another squadron than the one in view
   (a pick's, D2323), is not this. */
export function heldByMemberView(world: string, iso: string = todayIso()): boolean {
  if (!SESSION || !me() || roleOf() === 'admin' || !mayViewAsMember()) return false
  if (world !== UNIT || world === myUnit(iso)) return false
  const acct: any = ACCOUNTS_LIST.find(a => a.id === SESSION.user)
  return !!acct && acct.role === 'admin' && (acct.master === true || levelOfAccount(levelAcct(acct), world, iso) === 'admin')
}
/* DOES THE PICK STILL STAND ON `iso` (the blind read's R6, its pick half — the reshape plan §19b; A-iv widened, dormant
   until P1/P3): the squadron picked (engine/unitview.ts UNIT) is one the signed-in person can read that day — his home
   there, a View or Plan of it that holds that day (units-model.ts levelFrom, the reading rule), or a master admin's
   anywhere. Nobody signed in: the boot unit only. state/store.ts notify() re-enters his own squadron when it does not.
   One body with the menu's rows (§15 D9). */
export function pickStandsOn(iso: string): boolean {
  return readableUnits(iso).includes(UNIT)
}
/* THE SQUADRONS HE MAY READ ON `iso` — the Schedules menu's rows (the second-half plan §3 item 1) and the pick's test
   above, one body (§15 D9): his home that day; each squadron a View or Plan of his holds that day (units-model.ts
   levelFrom, read from the ACCOUNT'S own role, so a Plan holder or master admin in the member view keeps them — "View
   only", D2253); every squadron in the store for a master admin. Nobody signed in, or a sign-in with no person: the boot
   unit only. In the one order (his D2730 Q1 — inSquadronOrder below): his home first, then by number; a squadron undone
   away is in none. */
export function readableUnits(iso: string = todayIso()): string[] {
  if (!SESSION) return [BOOT_UNIT]
  const m = me()
  if (!m) return [BOOT_UNIT]
  const home = homeOn(m, iso)
  const acct: any = ACCOUNTS_LIST.find(a => a.id === SESSION.user)
  const out: string[] = []
  for (const u of storeUnits()) {
    if (u.id === home) { out.push(u.id); continue }
    if (acct && (acct.master === true || levelOfAccount(levelAcct(acct), u.id, iso) != null)) out.push(u.id)
  }
  /* (a home the store does not list still reads as his, as before this reader) */
  if (home && !out.includes(home)) out.unshift(home)
  /* (the store keeps its rows by id, in no order a person reads) */
  return inSquadronOrder(out, iso)
}
/* HIS HOME SQUADRON ON `iso`, FOR ORDERING A LIST (his D2730 Q1 — "his" is the signed-in person's home that day): read as
   every page reads it, homeOn(me(), iso). Nobody signed in, a person waiting, or no home: null, so a list stays by number.
   Unlike myUnit it never falls back to the boot unit, which would stand first a squadron that is nobody's home. */
export function myHomeOn(iso: string = todayIso()): string | null {
  if (!SESSION) return null
  const m = me()
  return m ? homeOn(m, iso) : null
}
/* A LIST OF SQUADRON IDS IN THE ONE ORDER (his D2730 Q1: "home squadron first, then the rest by number, in every list of
   squadrons — one order everywhere"): units-model.ts squadronOrder with his home that day (myHomeOn) and each id's number
   from the store. A list of squadron ids a screen draws calls this, never a sort of its own. */
export function inSquadronOrder(ids: readonly string[], iso: string = todayIso()): string[] {
  return squadronOrder(ids, myHomeOn(iso), id => id, id => String(storeUnitById(id)?.num ?? id))
}
/* THE SCHEDULES MENU'S ROWS (M1/M2 — his D2301): each squadron he may read, its number and its short grey label — "Your
   squadron" his home that day; "Full access" where the role in force is admin and he is admin there by a Plan or the
   master mark; "View only" otherwise — a View, or a Plan or master admin's squadron while he is in the member view
   (D2253). One row only: no menu (D2132). */
export type MenuLabel = 'Your squadron' | 'Full access' | 'View only'
export function menuSquadrons(iso: string = todayIso()): { id: string; num: string; label: MenuLabel }[] {
  const m = me()
  const home = m ? homeOn(m, iso) : null
  const acct: any = SESSION ? ACCOUNTS_LIST.find(a => a.id === SESSION.user) : null
  const adminNow = roleOf() === 'admin'
  return readableUnits(iso).map(id => ({
    id, num: String(storeUnitById(id)?.num ?? id),
    label: id === home ? 'Your squadron'
      : adminNow && acct && (acct.master === true || levelOfAccount(levelAcct(acct), id, iso) === 'admin') ? 'Full access'
        : 'View only',
  }))
}
/* A SQUADRON HE ONLY VIEWS IS PICKED (his D2381, "View only and help"): the squadron in view is one the Schedules menu
   labels "View only" — a View of it, or a Plan of it or the master mark while he is in the member view (D2253). Then its
   View-only Sched and Help alone are offered: the top bar's tabs and the ☰ menu (pageOffered), and state/store.ts's
   standing check lands him there or brings his own squadron back (landOnOfferedPage). Nobody signed in: false. */
export const VIEW_ONLY_PAGES: readonly string[] = ['viewsched', 'help']
export function viewOnlyPick(iso: string = todayIso()): boolean {
  if (!SESSION || !me()) return false
  return menuSquadrons(iso).find(r => r.id === UNIT)?.label === 'View only'
}
export const pageOffered = (page: string): boolean => VIEW_ONLY_PAGES.includes(page) || !viewOnlyPick()
/* AN ADMIN OF THE PAGE'S SQUADRON (the Plan audit's PE1 as the blind read's R5 rewrote it): the role in force is admin AND
   his level in the page's squadron that day is admin — so a View holder picking another squadron is never offered its
   edit controls, and the member view is never an admin's (O3). mayEditSched keeps its body for its ~160 other readers;
   the schedule pages' call sites move onto this with step 5's menu (P3). Today the same answer as mayEditSched. */
export function adminOfPage(kind: 'schedule' | 'own', iso: string = todayIso()): boolean {
  if (!SESSION || roleOf() !== 'admin') return false
  const acct: any = ACCOUNTS_LIST.find(a => a.id === SESSION.user)
  if (!acct) return pageUnit(kind, iso) === UNIT
  return levelOfAccount(asAdminInForce(acct), pageUnit(kind, iso), iso) === 'admin'
}
/* THE ACCOUNT READ WITH THE ROLE IN FORCE, ADMIN — for the two edit-rights questions below and above, each asked only once
   the role in force is admin. In the app the role in force is never above the account's own (only an admin switches to
   the member view and back — switchRoleInForce), so this is the account's own level; the localhost bridge's
   raptorRole('admin') — a member given the admin role in place, the world unchanged (bug-check order §7.7) — keeps the
   meaning it had before step A: an admin of his own squadron, his rows elsewhere as they stand (found by GitHub's run of
   22 Nov 26: the changes window's and the Leave War Days window's browser tests). The gate judges every save by the role
   in force all the same. */
const asAdminInForce = (acct: any) => levelAcct(acct, 'admin')
export const maySchedEditPage = (iso?: string): boolean => mayEditSched() && adminOfPage('schedule', iso)
/* STEP A's FOUR KINDS OF "MAY HE EDIT" (the second-half plan §2 item 1; the inventory in docs/data-schema.md §Edit rights
   by squadron, held by state/edit-rights-readers.test.ts):
   - schedule — a control on the schedule in view (Edit Schedule, the board, View-only Sched, Logic, the templates, the
     saved plans, the changes window, Admin → Squadron config — D2317, Admin → Data's clears): maySchedEditPage, read
     through auth.ts canEditSched / lgCanEdit / HOOKS.editMode;
   - own — a control on his own squadron's page (Inputs, Medical, SANS, Quals, the OIL list, the Leave War, the Tracker,
     Admin → Users): mayEditOwnPage (auth.ts canEditOwn) — for a View holder his home, so a pick of 149 changes nothing
     there; for a Plan holder or a master admin the squadron picked (pageUnit('own'));
   - named squadron — a control acting on a squadron of its own (the Inputs, SANS and Calendar settings windows, the
     late cut-off, the OIL list): adminOfUnit(u);
   - role — a question about the person, not a squadron (the member-view switch, a tab's visibility): isAdmin, kept. */
export const mayEditOwnPage = (iso?: string): boolean => mayEditSched() && adminOfPage('own', iso)
/* AN ADMIN OF THAT SQUADRON, THE ROLE IN FORCE (D2336: its own admins, a Plan holder of it, a master admin; the member
   view is never an admin's, D292). A session with no account behind it (a hand-made test session) answers for the
   page's own squadron only, as adminOfPage does. */
export function adminOfUnit(unit: string, iso: string = todayIso()): boolean {
  if (!mayEditSched()) return false
  const acct: any = ACCOUNTS_LIST.find(a => a.id === SESSION.user)
  return acct ? levelOfAccount(asAdminInForce(acct), unit, iso) === 'admin' : unit === pageUnit('own', iso)
}
/* PD1 (the Plan audit — dormant until step 5): a person added by the signed-in admin is made the page's squadron's
   (Admin → Users follows the pick for a master admin or a Plan holder), else his own — handed to units.ts putNewHome,
   which imports nothing of this file */
setNewHomeUnit((adderPid) => (adderPid != null && adderPid === me() ? pageUnit('own') : null))

/* the schedule: edit mode, the board, the week's writes. No session → false, as
   canEditSched always answered (its callers are render and edit-mode gates). */
export const mayEditSched = (): boolean => !!SESSION && may(T.sched, 'U', null, false)
/* the Leave War's person as the sync mirrors it: the signed-in person; for a pending
   person or an account switched off '' — which matches NO row (the war's
   canEditRow reads null as "unscoped", so it must never be null for a session). No
   session → the headless default person, exactly as the ME the sync mirrored before
   [ACCOUNTS] (nothing is drawn before sign-in; the headless tests keep their scope). */
export function viewerId(): string | null { return SESSION ? (me() ?? '') : (ME == null ? null : String(ME)) }

/* PERSONAL INPUTS. The member-own rule (27 Aug 26) — and, since the group input (owner D654, D655, D658, D660 —
   7 Oct 26; the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13), a SECOND kind of
   "mine" for a member: a Duty & other commitments input he FILED for another man, while the members' switch is on.
   The questions take the RECORD now, since the answer depends on who filed it and its kind. They are what the doors
   and the screens ask; what a member's command really changed is held by ownershipViolation below, which asks the
   same rule of every changed record. No session → true: "a sessionless test/boot context is not a member and is not
   gated" (the gates these replace).

   WHICH KINDS A MEMBER MAY FILE FOR OTHERS: the type dropdown's "Duty & other commitments" group (his D655, reading 5
   — engine/inputs.ts typeGroup 'other'), and NOT SANS Availability (his D658: a SANS member files his own only; an
   admin files it for one SANS man or several) — with the switch on or off. Never a leave, a medical or an upchit. A
   kind the app does not know is not a duty: typeGroup answers 'other' for it, so the known-kind test comes first. */
export const memberFilesForOthers = (type: any): boolean => !!inpMeta(type) && typeGroup(type) === 'other' && !isSansAvail(type)
/* is he the record's filer — who placed THIS man's record (`by`), or who filed the entry it belongs to (`grpBy`)?
   A record with neither (filed before 7 Oct 26) has no filer: the man and an admin only (D56). */
const filerOf = (pid: string, row: any): boolean =>
  !!row && ((row.by != null && String(row.by) === pid) || (row.grpBy != null && String(row.grpBy) === pid))
/* THE ONE TEST OF "HE FILED IT FOR ANOTHER MAN", on a record as it was (`before`) and as it is (`after`) — a filing
   has no before, a deletion no after. The switch is on; the record stays the same man's (he never moves it to another
   person — that stays a scheduler's); he is its filer, read from the record as it WAS on a change or a delete, as it
   IS on a filing; and its kind on both sides is one he may file for others. The commit gate asks it of what a command
   changed; Undo asks it of a step's recorded images, under the switch and the kinds as they stand NOW. */
/* EVERY ENTRY OF ITS LIST WAS PUT IN BY THIS PERSON (the one-rule build, step 2 (f) — owner D755 (3): "changing it for
   everyone, once the scheduler has added others, is the scheduler's"; the plan §4.9). An entry with no `by` of its own
   is the filing's (a record rewritten from the old shape; a filing's first people).
   HIS OWN ENTRY IS NOT ASKED (12 Oct 26, found re-expressing the Leave War's tests): a man whose own input a scheduler
   filed for him, and who then adds people to it himself, is who filed THAT (takesOn, below) — his own entry still says
   the scheduler put him in, and it must not cost him the input he made. The rule is about the OTHERS in it. */
const allPutBy = (pid: string, x: any): boolean => peopleOf(x).every((e: any) => !!e && (String(e.p) === pid || String(e.by ?? x.by ?? '') === pid))
/* HE MAKES HIS OWN ONE-PERSON INPUT AN INPUT OF SEVERAL (the plan §4.9: the only named person changes it in full —
   "its fields, its people, its OIL answer" — whoever filed it; D763 reading 2). As before the build ("a record with no
   group may take one, with HIM as its filer"), who filed the input of several is HE — so `by` passes to him in the same
   change, and he can go on changing who is in it. For the kinds a member may file for others, switch on (filedForOther). */
const takesOn = (pid: string, before: any, after: any): boolean =>
  !!before && !!after && idsOf(before).length === 1 && String(onlyNamed(before) ?? '') === pid
  && idsOf(after).length > 1 && holds(after, pid) && String(after.by ?? '') === pid
/** did whoever filed it put in everyone who is in it — is it still wholly its filer's? (for the screens' words) */
export const filedWhole = (row: any): boolean => !!row && row.by != null && allPutBy(String(row.by), row)
/* WHO FILED IT ONCE THIS PERSON HAS LEFT IT (Fable's read of the one-rule plan, F13; the plan §4.5 "By Saber"): unchanged
   unless he is its filer; then whoever put in the NEWEST entry that is not his own — so "who may change it" and the
   bell's OIL question go to someone still involved. Where every entry left is his own filing, it stays his: he filed
   it for others and may still change it. ONE body for the writer (ui/inputedit.tsx commitInput) and the check on what
   a member's command changed (ownPart, below). */
export function byAfterLeaving(rec: any, pid: string): any {
  if (!rec || String(rec.by ?? '') !== String(pid)) return rec ? rec.by : undefined
  let pick: any = null
  for (const e of peopleOf(rec)) {
    if (!e || String(e.p) === String(pid) || e.by == null || String(e.by) === String(pid)) continue
    if (!pick || Number(e.at || 0) >= Number(pick.at || 0)) pick = e
  }
  return pick ? pick.by : rec.by
}
export function filedForOther(pid: string, before: any, after: any): boolean {
  if (!before && !after) return false
  if (!pid || !membersFileOn()) return false
  /* (a record in the OLD shape — one `person` — stays the same man's; one that carries its PEOPLE is its filer's to
     re-people, and what he may do to the list is the list's own test, inputBreach below) */
  if (before && after && !Array.isArray(before.people) && !Array.isArray(after.people) && String(before.person) !== String(after.person)) return false
  const took = takesOn(String(pid), before, after)
  if (!took && !filerOf(String(pid), before || after)) return false
  /* …and, for a record that carries its people, every entry of the list AS IT WAS (as it IS, on a filing) was put in
     by him: once a scheduler has put someone in, changing it for everyone is the scheduler's (D755 (3)) */
  if (!took && Array.isArray((before || after).people) && !allPutBy(String(pid), before || after)) return false
  return (!before || memberFilesForOthers(before.type)) && (!after || memberFilesForOthers(after.type))
}
/* may he file an input of this kind for this man? An admin: anyone, any kind. A member: himself, any kind, as
   always; another man only while the switch is on and the kind is one he may file for others. */
export function mayFileInputFor(pid: any, type?: any): boolean {
  const who = roleOf()
  if (who === null) return true
  if (allows(who, T.input, 'C', pid, identityOf(who))) return true        // an admin; a member for himself
  if (who !== 'member' || pid == null || pid === '' || me() == null) return false
  return membersFileOn() && memberFilesForOthers(type)
}
/* may he file ONE input of this kind for SEVERAL people? An admin: any kind but the medical ones and the upchit —
   each man's needs his own document (D655, reading 4). A member: a kind he may file for others, while the switch is on. */
export function mayFileGroup(type: any): boolean {
  const who = roleOf()
  if (who === null) return true
  if (who === 'admin') return !needsDoc(type)
  return who === 'member' && me() != null && membersFileOn() && memberFilesForOthers(type)
}
function mayChangeInput(row: any, act: Act): boolean {
  const who = roleOf()
  if (who === null) return true
  if (!row) return false
  /* an admin; the man himself, in full — "himself" is the input's ONLY NAMED PERSON, whoever filed it (owner D655, D762
     reading 1; Fable's read of the one-rule plan, F4): an input for several people, or for ALL AVAIL, is nobody's own */
  if (allows(who, T.input, act, onlyNamed(row), identityOf(who))) return true
  const pid = who === 'member' ? me() : null
  return pid != null && filedForOther(pid, row, row)
}
/* may he change / delete this input? An admin; the man; its filer, for a kind he may file for others, switch on. */
export const mayEditInput = (row: any): boolean => mayChangeInput(row, 'U')
export const mayDeleteInput = (row: any): boolean => mayChangeInput(row, 'D')
/* MAY HE CHANGE WHERE IT STANDS — its Goes to, or a retype that would land it elsewhere? (his D1388, 26 Oct 26 — "Once a
   scheduler has moved a member's Other, should only a scheduler be able to change where it goes? … yes — otherwise the
   member could quietly move it back".) A scheduler, always; anyone else only while no scheduler has moved it
   (engine/inputs.ts placeHeld). The window's Goes to and the save ask it; the commit gate (inputBreach) holds every
   member's command to it. No session → true, as every question here. */
export const mayMovePlace = (row: any): boolean => roleOf() === null || mayEditSched() || !placeHeld(row)
/* WHY THE FILER MAY NOT, for the screens' words (owner D731 (8), 10 Oct 26). With the members' switch off, the member
   who FILED a shared input was told "Only Ranger — who filed it — or an admin can change this" — and he is Ranger. This
   answers one thing: is the signed-in member this input's filer, kept from it by the switch alone? It grants and
   refuses NOTHING — `mayEditInput` / `mayDeleteInput` above are the rule, asked first by every door; a door that has
   already been refused asks this to choose its sentence. An admin, a person without access and a headless context: never. */
export function filerSwitchedOff(rows: readonly any[]): boolean {
  const pid = roleOf() === 'member' ? me() : null
  if (pid == null || membersFileOn() || !rows || !rows.length) return false
  return rows.some(r => filerOf(String(pid), r)) && rows.every(r => !!r && memberFilesForOthers(r.type))
}
/* §11's own-row note for `Input`, word for word — perms.test.ts fails when docs/data-model.md says anything else
   (D200: "the server's rules at the database step are a translation of an agreed list") */
export const INPUT_FILER_NOTE = 'or — while the squadron\'s members-file-for-others setting is on — a Duty & other commitments input (not SANS Availability) that I FILED (`filedBy` = my person; D654, D655, D658), while everyone else in it was put in by me: I may create, change and delete it, change who is in it, and give its one OIL answer for everyone in it (D660, D762); my own one-person input that I add people to is one I filed from then on, whoever filed it for me; once a scheduler has put someone in it, changing it for everyone is the scheduler\'s (D755); from an input I am in I may always take myself out, and I add nobody to an input I did not file (D755, D763); the scheduler\'s marks on an input — cancelled with its reason, the red box, information only, its LATE mark dropped (`lateMarkDropped`, D1586) — are never mine to set or clear, on my own input too (D760), save that my own later change of it takes a dropped LATE mark off (D1620); where an input stands — on the Ground Programme, under Unavailable or rejected — is never mine to change once a scheduler has moved it (`movedByScheduler`), by its Goes to or by changing its kind, on my own input too, and that mark is never mine to set or clear (D1388); an input filed for ALL AVAIL / ALL counts as filed for another person — one of seven kinds, one day (D700, D711, D712, D713, D778)'
/* THE MEMBERS' SWITCH (owner D654 — "allow both admin and members (for now)"; D655, reading 6: "one switch puts it back
   to admins only"). One squadron setting, `memberfile`: absent = ON, `false` = OFF — anything else stored reads as ON.
   Written only by its admin command (`settings.memberfile`, state/memberfile.ts). Read live, never cached: a rollback
   or an Undo of the switch is in force at the very next question. */
/* (B4 — the reshape plan §3.2 A-ii: his own squadron's switch, read on the page's squadron, never the pick's — a member
   with View of 149 who picks 149 still files as 142's rule says; state/memberfile.ts writes the same key) */
export const membersFileOn = (): boolean => unitSetting(pageUnit('own'), 'memberfile', null) !== false
/* a medical input's type, remarks and documents (D211 — every admin and member; D213's guest went with D2239) */
export function mayReadMedicalOf(_pid?: any): boolean {
  const who = roleOf()
  if (who === null) return true
  return who !== 'off' && (MEDICAL_DETAIL as string[]).includes(who)
}

/* the Quals page (D149): his OWN row, every column. No session → true (the headless
   page tests, as before). */
export const mayEditQualsOf = (pid: any): boolean => may(T.person, 'U', pid, true) && ofMySquadron(pid)
/* an admin changes a man's row only as an admin of the man's own squadron (D2191; the commit gate's section 8,
   homeUnitViolation, holds the same for every door): his home's admin role, an admin grant there, or the master mark.
   A member is held to his own row by the table above; no session, or a man with no squadron at all → true */
function ofMySquadron(pid: any): boolean {
  if (!isAdmin() || pid == null) return true
  const u = homeOn(String(pid), todayIso())
  const row: any = SESSION ? ACCOUNTS_LIST.find(x => x.id === SESSION!.user) : null
  if (!u || !row) return true
  return levelBefore(levelAcct(row, 'admin'), u, todayIso(), unitRowsBefore([])) === 'admin'
}
/* the callsign on his row is the admin's to change (D218, narrowing D149); no session → true */
export const mayRenameCallsign = (): boolean => roleOf() === null || isAdmin()
/* the Management tick on his row is the admin's too (D1510, narrowing D149 as D218 did): the Leave War draws its Management
   group, first on the war, from this tick (D1502). No session → true */
export const mayTickManagement = (): boolean => roleOf() === null || isAdmin()
/* …and the Scheduler tick (D1651, 5 Nov 26, narrowing D1510 and D149): it decides who may sign SKED CK, PLANNED BY and
   APPROVED BY, and a scheduler is always an admin (D785) — a member unticking his own blanked his signatures. No session → true */
export const mayTickScheduler = (): boolean => roleOf() === null || isAdmin()
/* what a member's own Quals row may not change, read by the commit gate below (data-model.md §11, the Person row):
   the callsign (D218 — compared whole, so another shape that prints the same is still a change), the Management tick
   (D1510 — truthy, as the Leave War reads it), the Scheduler tick (D1651 — truthy, as the sign-off lists read it), the archive and placeholder marks, and — the security read of 29 Oct 26 —
   the delete mark and its date, and how, when and by whom he was archived: archiving and deleting a person are the admin's.
   (`sanBy` and `ord` are not here: his own SANS tick drops `sanBy` by design, and §11 does not name his place in the order) */
const OWN_ROW_ADMIN_ONLY: [string, (p: any) => any][] = [
  ['his callsign', p => JSON.stringify(p?.cs ?? null)],
  ['his Management tick', p => !!p?.quals?.mgmt],
  ['his Scheduler tick', p => !!p?.quals?.sched],   // D1651 — truthy, as isScheduler reads it
  /* (…and the squadron and day it was given in — core line 4, D2160: units-model.ts schedTickHolds reads them) */
  ['where his Scheduler tick was given', p => JSON.stringify([p?.schedOf ?? null, p?.schedFrom ?? null])],
  ['his archive mark', p => !!p?.archived],
  ['who archived him', p => JSON.stringify([p?.archivedBy ?? null, p?.archivedOn ?? null, p?.archivedWho ?? null])],
  ['his delete mark', p => JSON.stringify([!!p?.deleted, p?.deletedFrom ?? null])],
  ['his placeholder mark', p => !!p?.special],
]
/* adding, archiving, restoring a person; the LoX column list. No session → true (the
   write-path backstops these replace passed a sessionless call). */
export const mayManageRoster = (): boolean => may(T.person, 'C', null, true) && may(T.person, 'D', null, true)
export const mayEditQualColumns = (): boolean => may(T.qualification, 'U', null, true)

/* accounts (D166, D204). No session → false: nothing headless manages accounts. */
export const mayManageAccounts = (): boolean => may(T.user, 'U', null, false)
/* a delete — a man who leaves flying for good: his account and his person ([POST-OUT-OUTCOMES], D280, D287, D290 — the
   person kept underneath as a hidden mark). No session → false: nothing headless deletes anyone (the posting pass runs
   the mutation as a reconciler, never through this door — Fable F4). */
export const mayDeletePerson = (): boolean => may(T.person, 'D', null, false) && may(T.user, 'D', null, false)
export function mayRequestAccess(): boolean {
  const who = roleOf()
  return who === 'pending' && allows(who, T.accessreq, 'C', SESSION && SESSION.name, identityOf(who))
}
/* the admin-only settings (Logic's rules, templates, Admin's pages). No session →
   true, as the write paths these replace. */
export const mayEditSettings = (): boolean => may(T.setting, 'U', null, true)

/* the Leave War — the war keeps its own role checks (a second app); these are what
   the Raptor side asks of it, and what the parity test holds the war to */
export const mayDecideBids = (): boolean => may(T.bid, 'U', null, false)
export const mayAwardOil = (): boolean => may(T.award, 'C', null, false)

/* 3. THE COMMAND GATE ---------------------------------------------------------- */
/* how a command's own-row rule reads its meta: 'never' — only a role that holds the
   letter outright; 'required' — the command must name its owner (meta.owner /
   meta.owners) and the actor must be him (the Quals write names its row); 'optional' — an
   owner named must be him, none named leaves it to the writer's own check (the Leave War's
   canEditRow, the input writers' mayEditInput). THE INPUT COMMANDS NAME NO OWNER (Fable's
   code read, 26 Sep 26): what holds a member to his own inputs is the ownership invariant
   below, which reads the people on every input the command actually changed — stronger than
   an owner a caller claims (pinned through the real input route: accounts.test.ts AC7) */
type OwnRule = 'never' | 'optional' | 'required'
/* `more` — every OTHER table the command writes, each letter the actor must hold outright
   too ([ACCOUNTS-NEW-PERSON], Astra's plan read 1): a command that makes a person, his
   account and answers his request names all three, so the database's security at the
   translation step reads one honest list (D200 — "a translation of an agreed list") */
export interface CommandOp { table: string; act: Act; own: OwnRule; more?: [string, Act][] }
const op = (table: string, act: Act, own: OwnRule = 'never', more?: [string, Act][]): CommandOp =>
  (more ? { table, act, own, more } : { table, act, own })

const SETTINGS_KEYS_ALL = ['rules', 'stores', 'cxreasons', 'daytpl', 'dutytpl', 'wavetpl', 'wavehide',
  'qualcols', 'lookahead', 'secdefault', 'wavedefault', 'insights', 'sanscalendar', 'memberfile'] as const
/* (`guestview`, the guest switch, left this list with the guest view — D2239; its `settings.guestview` command with it) */

export const COMMAND_OPS: Record<string, CommandOp> = {
  /* the flying plan (state/flyplan.ts — the Inputs / SANS redesign, plan §3.2): a day's class and required figures,
     a weekday's rule, a running figure — the admin's, like every setting */
  'fly.day.set': op(T.setting, 'U'), 'fly.rule.set': op(T.setting, 'U'), 'fly.rule.remove': op(T.setting, 'U'),
  'fly.run.set': op(T.setting, 'U'),
  'insights.role.set': op(T.missionrole, 'U'),
  'insights.role.copy': op(T.missionrole, 'C'),
  /* the scheduler — its writes are the scheduler's (admin); a joined child command is
     never re-authorised, so a member's own input landing a row on a published day's
     working copy runs inside the authorised inputs.write and is unaffected */
  'sched.slot': op(T.sched, 'U'),
  'sched.fill': op(T.sched, 'U'),
  'sched.text': op(T.sched, 'U'),
  'sched.delete': op(T.sched, 'U'),
  'sched.section.move': op(T.sched, 'U'),
  'sched.section.reorder': op(T.sched, 'U'),
  'sched.approve': op(T.amendment, 'C'),
  'sched.publishAL': op(T.amendment, 'C'),
  'sched.unpublish': op(T.amendment, 'C'),
  'sched.stores': op(T.sched, 'U'),
  'sched.sign': op(T.amendment, 'C'),
  'sched.signClear': op(T.amendment, 'C'),
  'sched.warnMute': op(T.sched, 'U'),
  'sched.notePub': op(T.sched, 'U'),
  'sched.oil': op(T.sched, 'U'),
  'sched.draft.rename': op(T.sched, 'U'),
  'sched.draft.delete': op(T.sched, 'U'),
  /* a week load's landing on a week already saved ([DB-READINESS] group A, phase 1.3) — run by the app itself (the
     system actor, which the gate never asks); the row is here so every registered type has one */
  'sched.load': op(T.sched, 'U'),
  /* the afterSchedMutate backstop: the one schedule command a member's actor can open (a
     board epilogue raised outside a command lands here, whoever raised it). At the gate it
     rides the input rule; the ownership invariant below then refuses any change it makes to
     the schedule's own records for a member, so his schedule changes happen only as his own
     input's landing, inside his input command (the accounts check, 26 Sep 26) */
  'sched.mutate': op(T.input, 'U', 'optional'),
  'inputs.write': op(T.input, 'U', 'optional'),
  'inputs.batch': op(T.input, 'U', 'optional'),
  /* a LATE mark dropped or brought back (D1586): a scheduler's, on any input — the old session-only set was admin-gated
     at its write path; the command keeps it so. It writes the INPUT, so it names the Input table (the security read of
     3 Nov 26: the database's rules are built from this list), and 'never' keeps a member out even on his own row */
  'inputs.lateOff': op(T.input, 'U'),
  /* the roster: the Quals write names its row (D149); add / archive / restore name none */
  'people.edit': op(T.person, 'U', 'required'),
  /* undo: mayReverse (undo/timeline.ts) decides whose change; this keeps non-members out */
  'undo.restore': op(T.input, 'U', 'optional'),
  /* the Leave War (a second app): a member's own bid rides its canEditRow; deciding and
     approved-leave moves are the admin's */
  'lw.edit': op(T.bid, 'U', 'optional'),
  'lw.move': op(T.bid, 'U', 'optional'),
  'lw.ack': op(T.bid, 'U', 'optional'),
  'lw.decide': op(T.bid, 'U'),
  /* an admin places leave and approves it in one step (D1147 — "Approve what I enter", M3 5.5): one command, one Undo */
  'lw.placeApproved': op(T.bid, 'U'),
  /* a course or an overseas duty filed on the war straight as the INPUT it is (round 2 — D1318): no bid, no approval; it writes Inputs only, so it is asked as an Inputs-page filing is — his own, an admin any */
  'lw.file': op(T.input, 'U', 'optional'),
  /* a request's own words and papers — its remarks, till tick, documents (M3 5.9, 5.10; D1210, D1150): his own row, as
     lw.edit; on a day closed for him the commit lets exactly this through (onlyChangesWords) */
  'lw.reqmeta': op(T.bid, 'U', 'optional'),
  'lw.approve': op(T.bid, 'U'),
  'lw.decideApproved': op(T.bid, 'U'),
  'lw.removeApproved': op(T.bid, 'U'),
  'lw.moveApproved': op(T.bid, 'U'),
  /* opening or closing dates for bidding (D1177, 21 Oct 26 — the stages went; D352 narrowed): the admin's, as the stage
     always was (27 Aug 26) — the period's own record; its own type so Undo can name it ("Undid: opening bidding …") */
  'lw.open': op(T.war, 'U'),
  /* the bell's "taken back" line after an admin's Undo or Redo of a Leave War decision (M4 9.3 — D1216): a notice of its
     own command, written by the admin whose Undo it was; never a member's */
  'lw.notice': op(T.notice, 'C'),
  /* he opens Approvals: his OWN row of when (M4 8.4) */
  'lw.apprseen': op(T.apprseen, 'U', 'required'),
  /* the Holidays list's three writers (leavewar/state/store.ts holidayAdd / holidayChange / holidayRemove — the Inputs /
     SANS redesign, plan §3.4): a public holiday or an Off day is the leave period's own record, an admin's to change */
  'lw.holiday.add': op(T.war, 'U'), 'lw.holiday.change': op(T.war, 'U'), 'lw.holiday.remove': op(T.war, 'U'), 'lw.holiday.import': op(T.war, 'U'),
  /* the Event sheet's Save and Delete, each one command (leavewar/state/store.ts saveEvent / deleteEvent — plan §3.12):
     a day's event is the leave period's own record too, an admin's to change */
  'lw.event.save': op(T.war, 'U'), 'lw.event.remove': op(T.war, 'U'),
  /* the Manning block's settings (the Leave War overhaul, batch 3): an Available row's Save — its name, who it counts and
     its amber and red points (D1190, D1191, D1202) — and a Required row's name (D1193); both kept in the war's settings
     (`manningdefs`, `reqnames`), a Setting, the admin's like every other */
  'lw.availrow': op(T.setting, 'U'), 'lw.reqname': op(T.setting, 'U'),
  /* [OIL-AWARD-IS-A-GRANT] (Astra's round-2 read, R2-01): an OIL award is written under ITS row of the table, a ledger
     entry (another pool's credit, a correction) under the ledger's, and a clear that takes an award beside a bid names
     both — a member's clear takes no award and runs as `lw.edit` */
  'lw.award': op(T.award, 'U'),
  'lw.ledger': op(T.ledger, 'U'),
  /* M5a: a typed figure — an admin's on any row, a member's on his own while unlocked (ownershipViolation); a person's
     grade, the grades list and the lock — the admin's */
  'lw.balance': op(T.balance, 'U', 'optional'),
  'lw.grade': op(T.grade, 'U'),
  'lw.grades': op(T.setting, 'U'),
  'lw.balLock': op(T.setting, 'U'),
  'lw.seen': op(T.lwseen, 'U', 'required'),
  /* a press of one of his bell's squadron buttons (state/bellsqn.ts): the signed-in person's OWN row only */
  'bell.squadrons': op(T.bellsqn, 'U', 'required'),
  'lw.clear': op(T.bid, 'U', 'optional', [[T.award, 'D']]),
  /* the Tracker: everyone with access edits it (D121) */
  'trk.marks': op(T.tracker, 'U'), 'trk.dates': op(T.tracker, 'U'), 'trk.roster': op(T.tracker, 'U'),
  'trk.layout': op(T.tracker, 'U'), 'trk.syls': op(T.tracker, 'U'), 'trk.plan': op(T.tracker, 'U'),
  'trk.pace': op(T.tracker, 'U'), 'trk.lulls': op(T.tracker, 'U'), 'trk.eventinfo': op(T.tracker, 'U'),
  'trk.catalogue': op(T.tracker, 'U'), 'trk.courses': op(T.tracker, 'U'), 'trk.gesture': op(T.tracker, 'U'),
  'trk.meta': op(T.tracker, 'U'),
  /* …except the flex settings (D1006, D1014 — 18 Oct 26, narrowing D121): one record for the whole Tracker, its figures
     and its on / off switch — a Setting, the admin's alone, like every other */
  'trk.flex': op(T.setting, 'U'),
  /* the Tracker's own Undo / Redo, each one restore command ([DB-READINESS] group A, phase 4.1 — P4.1-TRACKER-RESTORE) */
  'tracker.undo': op(T.tracker, 'U'), 'tracker.redo': op(T.tracker, 'U'),
  /* accounts (D166, D204): one intent per command, each writing every key it needs — and
     naming every table it writes ([ACCOUNTS-NEW-PERSON]: an account added or renamed onto a
     waiting sign-in name answers — deletes — its request; approving creates the User) */
  'access.request': op(T.accessreq, 'C', 'required'),
  'access.decline': op(T.accessreq, 'D'),
  'access.approve': op(T.accessreq, 'D', 'never', [[T.user, 'C']]),
  'account.add': op(T.user, 'C', 'never', [[T.accessreq, 'D']]),
  /* (…and every door that changes a man's access tells him, a Notice created in the same command — batch 1's second half
     §7 item 6, his D2251, state/acctlines.ts; the gate's acctLineViolation judges each line) */
  'account.update': op(T.user, 'U', 'never', [[T.accessreq, 'D'], [T.notice, 'C']]),
  /* (`guestview.set`, the guest switch's command, went with the guest view — D2239: no row, so the gate refuses it) */
  /* a new person ([ACCOUNTS-NEW-PERSON], D214, D217) — made only on Admin → Users: alone (a
     blank sign-in), with his account, or by approving his sign-up; and the admins' bell's
     "seen" (D216, D227) */
  /* [ONE-DOOR] (D308): each also writes his post-in date on the war — the LeavePersonProfile, named (round 1, Fable F11 /
     Astra 6) */
  /* …each of the three writes the new man's home unit in the same command since multi-squadron batch 1, step 1 (D2094) */
  'person.add': op(T.person, 'C', 'never', [[T.profile, 'U'], [T.home, 'C']]),
  'account.addNew': op(T.user, 'C', 'never', [[T.person, 'C'], [T.accessreq, 'D'], [T.profile, 'U'], [T.home, 'C']]),
  'access.approveNew': op(T.accessreq, 'D', 'never', [[T.user, 'C'], [T.person, 'C'], [T.profile, 'U'], [T.home, 'C']]),
  /* his OWN row of the requests he has seen (AccessRequestSeen — [DB-READINESS] group A, phase 4.4) */
  'access.seen': op(T.reqseen, 'U', 'required'),
  /* [DRAFT-PENDING] (D170): "Mark all as seen" in the changes window — the signed-in person's OWN entry only */
  'changes.seen': op(T.seen, 'U', 'required'),
  /* the bell's "Mark all read" and a tap on a line (the one-rule build's step 7): the signed-in person's OWN row only */
  'notices.seen': op(T.noticeseen, 'U', 'required'),
  /* Admin → Data "Clear edit history…" (D351): deletes exact history lines, run as the admin who asked — the batch names
     him (the group-A final read, Fable F1; state/store.ts setElogDoor). The idle `elog.line` is the app's own act. */
  'elog.sweep': op(T.editlog, 'D'),
  /* a delete ([POST-OUT-OUTCOMES], D287, D290, D297, D299): the person marked (the hidden mark — D is the soft delete),
     his account removed, and on every day from its cutoff he is taken off — the working copy, the stashed weeks, the
     parked plans, the planning calendar (the schedule family), his sign-off boxes cleared (as the sign-clear command),
     and his inputs from that day deleted or ended the day before. Every table it writes is named (D200). The Leave War
     half (his records, his posting) joins in Part B with LeavePersonProfile. */
  'person.delete': op(T.person, 'D', 'never', [[T.user, 'D'], [T.accessreq, 'D'], [T.sched, 'U'], [T.amendment, 'C'], [T.input, 'D'], [T.input, 'U'], [T.profile, 'U'], [T.bid, 'D'], [T.award, 'D']]),
  /* he's back — Restore (Admin → Users, D310), Restore under another callsign (D284, D286, D295): the person restored (and
     renamed), his sign-in enabled, a new stint opened; never a member's own-row write. (Undo post out on the posting's own
     archive runs the same body as the POSTING command, `lw.postout` below — [DRAFT-PENDING], Astra's read of the fixes, 02) */
  'person.restore': op(T.person, 'U', 'never', [[T.user, 'U'], [T.profile, 'U'], [T.notice, 'C']]),
  /* [ONE-DOOR] (D309, D310, D323): Archive on Admin → Users — the person archived, his account suspended, his war stint
     closed (leavewar/sync.ts archivePerson); the man's own "welcome back" seen — his OWN row only (D305) */
  /* (…and every View and Plan his sign-in holds dropped in the same command — his D2311; so too an Overseas Sqn posting,
     run at once or by the pass, below) */
  'person.archive': op(T.person, 'U', 'never', [[T.user, 'U'], [T.profile, 'U'], [T.grant, 'D'], [T.notice, 'C']]),
  'person.backSeen': op(T.person, 'U', 'required'),
  /* a posting written with a take-back of what the posting made (its archive, its suspension, its SANS tick) — and its
     Undo, before or after it ran (leavewar/sync.ts takeBack, and restoreBody's undo mode on the posting's own archive) */
  /* …and its Undo takes back the posting's bell lines ([NOTICE-UNDO-RETRACT], D1693, D1699): each admin's line removed (D), and
     one he had read replaced by its "taken back" line (C) */
  'lw.postout': op(T.profile, 'U', 'never', [[T.person, 'U'], [T.user, 'U'], [T.notice, 'C'], [T.notice, 'D'], [T.grant, 'D']]),
  /* the posting pass on its date — a reconciler (the system actor); every table an outcome writes is named (D200) */
  /* …and each admin's bell line saying it ran ([POSTOUT-RUN-NOTICE], D1547 — a Notice created; so too a posting made today,
     run inside `lw.postout` above) */
  'lw.postoutRun': op(T.profile, 'U', 'never', [[T.person, 'U'], [T.person, 'D'], [T.user, 'U'], [T.user, 'D'], [T.sched, 'U'], [T.amendment, 'C'], [T.input, 'D'], [T.input, 'U'], [T.bid, 'D'], [T.award, 'D'], [T.notice, 'C'], [T.grant, 'D']]),
}
/* THE UNITS (multi-squadron batch 1, step 1 — state/units.ts; the master mark, state/accounts.ts setMaster). The type
   says only that an admin may run it; which unit's admin is the commit gate's, read from each row (unitRowViolation) */
Object.assign(COMMAND_OPS, {
  /* (…with a new place made in the same command — "+ New place…" inside the form, one Undo step: batch 1's second half
     §6 items 2 and 4, R-O8b) */
  'unit.add': op(T.unit, 'C', 'never', [[T.unitplace, 'C'], [T.grant, 'C'], [T.place, 'C'], [T.notice, 'C']]),
  'unit.place': op(T.unitplace, 'C', 'never', [[T.place, 'C']]),
  'place.set': op(T.place, 'U', 'never', [[T.place, 'C']]),
  'grant.set': op(T.grant, 'U', 'never', [[T.grant, 'C'], [T.notice, 'C']]),
  'grant.remove': op(T.grant, 'D', 'never', [[T.notice, 'C']]),
  /* (a move drops every right the man held in another squadron — his D2203 — inside the same command) */
  'home.set': op(T.home, 'U', 'never', [[T.home, 'C'], [T.grant, 'D']]),
  'account.master': op(T.user, 'U', 'never', [[T.notice, 'C']]),
  /* Admin → Users' one Save (batch 1's second half, plan §4 item 5 — accounts.ts saveAccess): the account row (role, master
     mark) and the rights of that account in other squadrons, given, changed or taken — and, made a master admin, every
     right he held dropped (R-O10). Which squadron's admin may write each row is unitRowViolation's, as for grant.set.
     The sign-in name rides in it too (the final reads, R4), and a rename onto a waiting request answers it, as
     account.update's does — the request row deleted (who may: requestRowViolation, §15 D12) */
  'account.access': op(T.user, 'U', 'never', [[T.grant, 'C'], [T.grant, 'U'], [T.grant, 'D'], [T.accessreq, 'D'], [T.notice, 'C']]),
  /* the app's own line that a move has taken effect (batch 1's second half §15 D11, §16 D11′ — leavewar/sync.ts
     runMoveLines): the system actor, a Notice created, nothing else (acctLineViolation's own section) */
  'account.told': op(T.notice, 'C'),
  /* the app's own line that a posting could not run (batch 1's second half §7 item 7, §15 D10, §16 D10′ — leavewar/sync.ts
     tellPostingFailed): the system actor, a Notice created to each of his squadron's admins, nothing else
     (postingFailedViolation's own section) */
  'posting.failed': op(T.notice, 'C'),
} satisfies Record<string, CommandOp>)
for (const k of SETTINGS_KEYS_ALL) COMMAND_OPS[`settings.${k}`] = op(T.setting, 'U')
/* COMMANDS ONLY AN ADMIN RUNS, though the table they write grants a member the same letter for his own change: the war's
   follow-up notice (`lw.notice` — "… taken back" / "… again" after an admin's Undo or Redo of a war decision, M4 9.3,
   D1216). A member's Notice C is a line riding his own input change (the commit's notices case); this command rides none,
   and a member never runs it (the security read's finding 4, 27 Oct 26) */
const ADMIN_ONLY_COMMANDS = new Set(['lw.notice'])
/* COMMANDS ONLY A MASTER RUNS (D2191 — 'only a master admin makes another'; he makes the squadrons): an admin whose
   account carries the mark (state/accounts.ts isMasterAccount, read from the live list by the actor's account id — the
   session carries nothing of it). §11 notes it in the cell's parentheses. */
const MASTER_ONLY_COMMANDS = new Set(['unit.add', 'account.master'])

function owners(meta: any): string[] | null {
  if (!meta) return null
  if (Array.isArray(meta.owners)) return meta.owners.map(String)
  if (meta.owner != null) return [String(meta.owner)]
  return null
}
/* the command layer's resolver (command/permissions.ts setPermissionResolver) */
export function cmdAuthorize(type: string, actor: Actor, meta?: any): boolean {
  const o = COMMAND_OPS[type]
  if (!o) return false                                   // unmapped: refused (fail closed)
  const who = actorRole(actor)
  if (who === null) return true                          // the system actor (authorize short-circuits it first anyway)
  if (who === 'off') return false
  if (ADMIN_ONLY_COMMANDS.has(type) && who !== 'admin') return false
  if (MASTER_ONLY_COMMANDS.has(type) && (who !== 'admin' || !isMasterAccount(actor.id))) return false
  /* the base op with its own-row rule, then every `more` op held outright — ALL must allow
     (no early success before the last is asked) */
  if (!opAllows(who, o.table, o.act, o.own, actor, meta)) return false
  return (o.more || []).every(([t, a]) => opAllows(who, t, a, 'never', actor, meta))
}
function opAllows(who: Role, table: string, act: Act, own: OwnRule, actor: Actor, meta: any): boolean {
  const c = PERMS[table][who]
  if (c.all.includes(act)) return true
  if (!c.own.includes(act) || own === 'never') return false
  const identity = who === 'pending' ? (actor.principal ?? null) : (actor.personId ?? null)
  if (identity == null || identity === '') return false
  const named = owners(meta)
  if (!named || !named.length) return own === 'optional'
  return named.every(x => x === String(identity))
}

/* 5. WHAT A MEMBER'S COMMAND MAY ACTUALLY CHANGE — checked on the command's REAL changes,
   after it ran and before it is kept (a HARD invariant at the commit gate, so a breach
   rolls the whole command back). The command gate above reads a command's TYPE; this
   reads what it DID — so a member's write can never touch another person's record,
   whatever door reached it and whatever owner a caller claimed (Astra R3-1/2/3, Fable
   R2-5). An admin and the system actor are not limited here. For a member:
   - `inputs`   every changed input is his (its person before AND after) — or one he FILED for another man, a
                duty or commitment, while the members' switch is on; who placed a record is never forged; another
                man's OIL answers only as the record's days and hours give (inputBreach below — the three tests);
                the input order record rides along;
   - `people`   only his own row (D149);
   - `lw.cell`  only his own war row (id `war:person:date`); `lw.current` (which war is
                shown) is his own view; every other war record — the war itself, the
                ledger, opening balances, OIL policy, postings, labels, config — is the admin's;
   - `settings` and `plan` (the planning calendar) — none;
   - the schedule's records and the week stash — NONE, since [DB-READINESS] group A, phase 6 (c) (1 Oct 26): the
                landing of his own input (16 Sep 26: it lands a row on a published day's working copy) is worked out
                after his command, on read (state/holderbase.ts), and is nobody's change — the one exception §11
                carried, "until phase 6 (c)", is gone (D450: a day is saved only by the scheduler holding it);
   - the Tracker — everyone's (D121).
   A pending person and an account switched off change NOTHING, except a
   pending person's own access request — ONE new `accessreq:<id>` row under his own sign-in name
   ([DB-READINESS] group A, phase 4.4: the requests are one row each, so his command may add his and touch no other). */
const INPUT_ORDER = '__order'
const personOfInput = (v: any): string | null => { const p = v ? leadOf(v) : null; return p != null ? String(p) : null }
/* IS THIS CHANGE "HIS OWN PART" OF AN INPUT — ONE predicate ([ALL-AVAIL-AS-MEMBER] step 2 (a), 12 Oct 26; Fable's read of
   the one-rule plan, F5; the plan §4.9). True when
     (i)  both images, where present, are an input whose only person is he — his own request, as always; or
     (ii) the two images differ ONLY in his own entry standing in one list and not in the other: he took himself out
          (owner D755 (3): "he may always withdraw himself") — or his own Undo is putting him back.
   Three bodies decided ownership by a record's one `person` and would have refused a member's Undo of his own "take me
   out": the commit gate below, Undo's "may he reverse it" (undo/timeline.ts, through state/undo-wire.ts) and the owner
   of a change (undo/derive.ts). What a save stamps beside the list — who last changed it and when — is no part of the
   comparison; everything the input SAYS is. */
const NOT_SAID = new Set(['people', 'modBy', 'modAt', 'hand', 'leftAt'])
/* …NOR IS THE LANDING MARK (`acc: 'g'`): it is worked out on read, after the command (state/holderbase.ts), and a
   restore strips it from the image it puts back (sched-commit.ts schedWriteRecords) — so 'g' on one side and nothing
   on the other is the same input. Read as said, a member's Undo of his own "Take me out" was refused wherever the
   input had a row on the week on screen ("That couldn't be completed just now"): the gate saw another person's input
   changed. Left by step 2 of the one-rule build; found by the older tests re-expressed after step 7, 12 Oct 26. The
   real filings ('u' under Unavailable, 'r' off the programme) are still said. `undo/timeline.ts landed` reads the mark
   the same way. */
const said = (x: any, k: string): unknown => (k === 'acc' && x[k] === 'g' ? null : (x[k] ?? null))
const saysSame = (a: any, b: any, ...skip: string[]): boolean => {
  const left = new Set(skip)
  const ks = new Set([...Object.keys(a), ...Object.keys(b)].filter(k => !NOT_SAID.has(k) && !left.has(k)))
  for (const k of ks) if (JSON.stringify(said(a, k)) !== JSON.stringify(said(b, k))) return false
  return true
}
export function ownPart(pid: string, before: any, after: any): boolean {
  if (!pid || (!before && !after)) return false
  const alone = (x: any) => x == null || (idsOf(x).length === 1 && String(onlyNamed(x) ?? '') === String(pid))
  if (alone(before) && alone(after)) return true
  if (!before || !after) return false
  const a = peopleOf(before), b = peopleOf(after)
  const [more, less] = a.length > b.length ? [a, b] : [b, a]
  if (more.length !== less.length + 1) return false
  const rest = more.filter((e: any) => !(e && String(e.p) === String(pid)))
  if (rest.length !== less.length || JSON.stringify(rest) !== JSON.stringify(less)) return false
  /* who filed it may have passed on with him (byAfterLeaving): that, and nothing else, may differ */
  const withHim = a.length > b.length ? before : after, without = withHim === before ? after : before
  const skip: string[] = []
  if ((without.by ?? null) === (byAfterLeaving(withHim, pid) ?? null)) skip.push('by')
  /* …and THE SQUADRON STAMP OF AN INPUT LEFT NAMING NOBODY (C3, his D2243 Q1 — an ALL AVAIL meeting stays on the squadron
     it was filed on). With him in it the input was placed by the man it names and carried no stamp; left with ALL AVAIL /
     ALL alone it carries the squadron it stood on with him in it (ui/inputedit.tsx commitInput's settleStamp) — or it
     would be read by its filer's home and change schedule: the master admin's 149 meeting landed on 142's when a 149 man
     took himself out. That one stamp passes, in his take-out and in his Undo of it: only where the side without him
     names nobody, the side with him carries none, and it is exactly the squadron the input is read as with him in it
     (engine/inputs.ts inputUnitOf — the body the save asks). Any other stamp is a difference like any other: refused. */
  if (without.u != null && withHim.u == null && !namedOf(without).length && without.u === inputUnitOf(withHim)) skip.push('u')
  return saysSame(before, after, ...skip)
}
/* THE SCHEDULE'S OWN RECORDS. A member changes none of them, by any command ([DB-READINESS] group A, phase 6 (c), 1 Oct 26 —
   data-model.md §11; D450: a day is saved only by the scheduler holding it). They were his to change as the landing of his
   own input, inside his input command; that landing is now worked out after the command, on read (state/holderbase.ts),
   and no command records it. Before phase 6 (c) only the bare "the schedule changed" command (`sched.mutate`) was refused
   him (Fable's and Astra's code reads, 26 Sep 26 — the second, write-path guard the UI gates stand in front of; §11 —
   members read the schedule only). A refusal rolls the schedule back to its last committed state. */
const SCHEDULE_RECORDS = new Set(['days', 'sched.book', 'sched.mutes', 'sched.week', 'sched.issuance', 'sched.retraction', 'weekstash'])
/* ---- WHAT A MEMBER'S COMMAND MAY DO TO AN INPUT (the group input — the plan §3.13, "The commit gate") ----------------
   THREE tests, each on every input the command changed:

   2. WHOSE RECORD (asked first — it decides which of the others apply). EITHER his own — its person before and after
      is him, as always — OR one he FILED for another man (filedForOther above: the switch on, the same man before and
      after, he its filer, a kind he may file for others on both sides). Anything else is another person's input.
   1. WHO PLACED IT IS NEVER FORGED — on his OWN records too, with the switch on or off (both plan readers' finding
      G2: without it a member could name another man as the filer of his own input, and so hand him a right over it).
      A record he CREATES names him as its filer; on his own record the name may be absent (a record with no filer
      gives nobody a right), for another man it may not (who filed an input for a man is shown to him — D629). The one
      exception is a PIECE the app cuts from a record of the same man that the same command changed or deleted (a
      split, a trim, a leave cut by sick leave): it carries that record's filer, moment and group. A record he CHANGES
      keeps who placed it and when, its group and its group's filer — except that a record with no group may take one,
      with HIM as its filer, when he makes it a group. A new group names him its filer; a man added to an entry that
      was there before the command takes that entry's filer.
   3. ANOTHER MAN'S OIL ANSWERS — the filer writes them (his D660: "that person filing should answer for all"), and
      only a well-formed answer: an answer he did not write is exactly what the app's own voiding rule leaves standing
      (engine/oil.ts voidedOil); one he writes is for a day the record covers that asks the question, and is 0 or
      exactly what the record's hours price — he can claim OIL for a man or decline it, never invent an amount. Which
      days ask is the Leave War's to say (inputgate-hook.ts oilPlanOf); with no war wired nothing asks, so nothing new
      can be written.

   UNDO AND REDO. The restore must put back what was there — a record someone else placed, another man's answer the
   step had voided — which tests 1 and 3 would call forgery. They are passed over ONLY for a record the timeline
   verifies as a replay: the envelope is its own restore of a step this same person made, and the record is, image
   for image, what that step recorded (undo/timeline.ts verifiedReplay, installed by state/undo-wire.ts). Test 2 still
   applies to it. A command that merely calls itself `undo.restore` gains nothing: it is judged as any other. */
type ReplayCheck = (env: CommitEnvelope) => ((c: Change) => boolean) | null
let REPLAY: ReplayCheck | null = null
export function setInputReplayCheck(fn: ReplayCheck | null): void { REPLAY = fn }

/* THE OPEN DAYS JOIN THE WAR'S PERMISSION (the red team's B8, 22 Oct 26; D1177, D1211, D1225). A member's war record —
   `lw.cell`, id `war:person:date` — may change on a day OPEN for him (the period holding it has the day open, and it is
   not before today); on any other day his command may only TAKE AWAY his own pending (live) bids there (D1225: "a
   member may delete his own pending bid on a day that has since closed") or a replaced-bid notice he has seen — never
   add or change a record. Whether a day is open is the Leave War's to say (its store installs the probe: the pure rule
   `leavewar/engine/access.ts canEditCell`, asked of the period holding the date); with no war wired every day reads
   open, as before. Undo and Redo: D1263, below. */
type LwDayOpen = (cellId: string) => boolean
let LW_DAY_OPEN: LwDayOpen | null = null
export function setLwDayOpenProbe(fn: LwDayOpen | null): void { LW_DAY_OPEN = fn }
/* D1263 (22 Oct 26, his "no" — [LW-REDO-ONTO-CLOSED]): a member's Undo or Redo never puts a bid of his back on a day closed
   for him since; the one exception is his Undo of a step he made on that day while it was ALREADY closed — deleting his
   own pending bid there (D1225, the walk's B-F1), or an Inputs-page half day that cut his bid there (D1166). The timeline
   vouches for such a restore, record by record (undo/timeline.ts verifiedWarRestore, installed by state/undo-wire.ts);
   anything else that would add or change a war record on a closed day is refused, whatever calls itself a restore.
   `lwClosedKeys` is what the timeline keeps on each step as it is recorded: the war records a member's step changed on a
   day not open for him at that moment. */
let LW_RESTORE: ReplayCheck | null = null
export function setLwRestoreCheck(fn: ReplayCheck | null): void { LW_RESTORE = fn }
/* A MEMBER'S TYPED FIGURE (M5a — the build spec §3, B6, finding 9). What the Leave War's store answers for the gate,
   installed with the open-days probe (leavewar/sync.ts installAbsenceDoor): whether the admin's lock is on as it stands
   NOW — read when the change is SAVED, so a box open while the admin locks, and his Undo or Redo after it, are refused
   alike; the app's today; and whether a snapshot is the one the store itself builds from his approved leave at this
   moment. With no war wired a member's balance write is refused. */
export interface LwBalanceProbe {
  locked(): boolean; today(): string; sameSnap(snap: unknown[], pid: string, kind: string): boolean
  /** the one exact shape of a typed figure (engine/leaveyear.ts readTypedBalShape — the security read's finding 1): true
   *  when the row is exactly it, no other field, every snapshot entry a [date, half] pair, the figure within ±999 */
  wellFormed(row: unknown, kind: string): boolean
}
let LW_BAL: LwBalanceProbe | null = null
export function setLwBalanceProbe(fn: LwBalanceProbe | null): void { LW_BAL = fn }
const TYPED_KINDS = new Set(['LVE', 'CCL', 'FCL', 'PL', 'EL', 'CL'])
const isHalfNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && Number.isInteger(n * 2)
export function lwClosedKeys(changes: Change[], actor: CommitEnvelope['actor'] | null | undefined): string[] {
  if (!LW_DAY_OPEN || !actor || actor.role !== 'member') return []
  const out: string[] = []
  for (const c of changes) if (c.collection === 'lw.cell' && !LW_DAY_OPEN(c.id)) out.push(`${c.collection}/${c.id}`)
  return out
}
/* HIS OWN PENDING REQUEST'S WORDS AND PAPERS CHANGE ON A CLOSED DAY (owner D1150 — "added or seen at any time, even after
   its dates are locked"; D1210; M3 5.10). Only that: the same records, in the same order, each the same but for the
   `remarks`, `till` and `docIds` of an undecided request. A code, a state, a record added or taken is not this. Whatever
   the command calls itself — his Undo or Redo of such a change is the same change, and a Redo that would put a bid back
   is not one (D1263's check still answers it). */
function onlyChangesWords(before: unknown, after: unknown): boolean {
  const b: any[] = Array.isArray(before) ? before : []
  const a: any[] = Array.isArray(after) ? after : []
  if (!b.length || a.length !== b.length) return false
  const bare = (r: any) => { const { remarks: _r, till: _t, docIds: _d, ...rest } = r ?? {}; return JSON.stringify(rest) }
  let changed = false
  for (let i = 0; i < b.length; i++) {
    const was = b[i], now = a[i]
    if (JSON.stringify(was) === JSON.stringify(now)) continue
    if (was?.kind !== 'request' || (was.state !== 'pending' && was.state !== 'acknowledged')) return false
    if (bare(was) !== bare(now)) return false
    changed = true
  }
  return changed
}
/* WHO PLACED A REQUEST AND WHO DECIDED IT — VOUCHED BY THE RECORD IT CAME FROM (M4 8.6; the security read's finding 2,
   27 Oct 26: a stamp vouched by ANY before-image let a new bid borrow another record's stamp, and a new bid with none
   jumped the Approvals queue and dodged "New"). A request a member's command leaves on a cell is one of three:
   · THE SAME RECORD (its id in a before-image of this command — a move to another day of his row, a whole day cut to one
     half): exactly that record's stamps, absent only where they were absent (a bid saved before M4);
   · A RE-TYPED KIND (a new id where this cell's before-image held requests it replaces — leavewar/state/store.ts setCell):
     the stamp of the first of those that has one, as the store gives it; where none had one, placed by him now;
   · NEW: placed by him, now — never stampless, never another man's name, never dated ahead.
   "Now" is this minute behind and a few seconds ahead (the lower note: a time ahead put his bid after later ones); at the
   database step the server sets the time itself. Who decided one is never his to write: only as the same record had it. */
const STAMP_SKEW_MS = 5 * 60_000
const STAMP_AHEAD_MS = 5_000
/* the kinds of a bell line only a Leave War command of an admin's writes (state/notices.ts NoticeWhat: `lw`, `lwopen`,
   `lwback`) — a member's notice carries none (the notices case below); nor a posting's line (`po`, [POSTOUT-RUN-NOTICE] —
   written only by the posting pass, the app's own act) */
const WAR_LINE_KINDS = new Set(['lw', 'lwopen', 'lwback', 'oilhol', 'po', 'poback', 'sansback'])   // (sansback: D2338's struck SANS-days line, by the posting's take-back)
const placedOf = (r: any): string => `${r?.placedBy ?? ''}|${r?.placedAt ?? ''}`
/* the halves a request's code takes — "*LL" the morning, "LL*" the afternoon, "LL" both (the war's notation, read here
   without reaching into the war's engine) */
const halvesOfCode = (code: unknown): string[] => {
  const s = String(code ?? '')
  return s.startsWith('*') ? ['am'] : s.endsWith('*') ? ['pm'] : ['am', 'pm']
}
function stampForged(env: CommitEnvelope, c: Change, after: unknown, pid: string): string | null {
  const a: any[] = Array.isArray(after) ? after : []
  let byId: Map<string, any> | null = null
  /* in how many of this command's cells each request id stands AFTER it — a record moved stands in one; a copy in two */
  let afterCount: Map<string, number> | null = null
  const was = (id: string) => {
    if (!byId) {
      byId = new Map()
      afterCount = new Map()
      for (const x of env.changes) {
        if (x.collection !== 'lw.cell') continue
        if (Array.isArray(x.before)) for (const r of x.before as any[]) if (r?.kind === 'request') byId.set(String(r.id), r)
        if (Array.isArray(x.after)) for (const i of new Set((x.after as any[]).filter(r => r?.kind === 'request').map(r => String(r.id)))) afterCount.set(i, (afterCount.get(i) ?? 0) + 1)
      }
    }
    /* THE SAME RECORD only where it LEFT its old place (the fixes' M10 — the Opus read's 7): a request kept where it was
       and copied, same id, onto another day of his row is a new bid there, placed by him now — never one carrying the
       original's stamp to the top of Approvals */
    return (afterCount!.get(id) ?? 0) > 1 ? undefined : byId.get(id)
  }
  const kept = new Set(a.map(r => String(r?.id)))
  /* A RE-TYPED KIND keeps the stamp of a LIVE bid on the half it replaces, as the store's setCell gives it (M10): a refused
     request of months ago, or the other half's bid, dropped beside a new one is not what it was re-typed from */
  const replaced = (Array.isArray(c.before) ? c.before as any[] : []).filter(r => r?.kind === 'request' && r.state !== 'refused' && !kept.has(String(r.id)))
  const firstFor = (r: any) => {
    const mine = new Set(halvesOfCode(r.code))
    return replaced.filter(x => typeof x.placedAt === 'number' && halvesOfCode(x.code).some(h => mine.has(h))).sort((x, y) => x.placedAt - y.placedAt)[0]
  }
  for (const r of a) {
    if (r?.kind !== 'request') continue
    const same = was(String(r.id))
    const first = same ? undefined : firstFor(r)
    if (same) {
      if (placedOf(same) !== placedOf(r)) return `who placed a request`
    } else if (first) {
      if (placedOf(first) !== placedOf(r)) return `who placed a request`
    } else {
      const age = typeof r.placedAt === 'number' ? Date.now() - r.placedAt : NaN
      if (String(r.placedBy) !== pid || !(age <= STAMP_SKEW_MS && age >= -STAMP_AHEAD_MS)) return `who placed a request`
    }
    /* (IN BOTH DIRECTIONS — the reshape plan §7 R6, Astra 4: the decision was compared only where the image after carried
       one, so his refused bid kept refused with BOTH its maker and its time deleted read as "no decision written" — who
       refused it and when gone. The same record keeps exactly the stamps it had; a re-typed or new bid carries none. A
       verified replay is skipped before this, and a lawful move keeps the same record, stamps and all.) */
    const decision = (x: any) => `${x?.decidedBy ?? ''}|${x?.decidedAt ?? ''}`
    if (same ? decision(same) !== decision(r) : (r.decidedBy !== undefined || r.decidedAt !== undefined)) return `who decided a request`
    /* …AND ITS STATE (fix read 16 — the security reader's S16-2): the decision fields alone were compared, so his refused
       bid put back to pending with both deleted read as "no decision written" — the refusal gone, the bid back in
       Approvals with its first place in the queue. The state is the decision: the same record keeps it, the bid it was
       re-typed from gives it, a new bid is pending (his own Undo / Redo is a verified replay, skipped before this) */
    const st = (x: any) => String(x?.state ?? 'pending')
    if (st(r) !== (same ? st(same) : first ? st(first) : 'pending')) return `who decided a request`
  }
  return null
}
function onlyTakesPending(before: unknown, after: unknown): boolean {
  const b: any[] = Array.isArray(before) ? before : []
  const a: any[] = Array.isArray(after) ? after : []
  const was = new Map(b.map(r => [String(r?.id), JSON.stringify(r)] as const))
  const old = new Map(b.map(r => [String(r?.id), r] as const))
  for (const r of a) {
    if (was.get(String(r?.id)) === JSON.stringify(r)) continue
    if (narrowed(old.get(String(r?.id)), r)) continue                                    // his whole-day bid cut to one half
    return false                                                                          // nothing added or changed
  }
  const kept = new Set(a.map(r => String(r?.id)))
  for (const r of b) {
    if (kept.has(String(r?.id))) continue
    /* his UNDECIDED bid, taken (D1225 — "his own pending bid"): named as the two undecided states rather than "not
       refused", so a state added to a war record later is never taken by default (the break tests' 17b case — a war
       record cannot be approved today: approved leave is an input) */
    if (r?.kind === 'request' && (r.state === 'pending' || r.state === 'acknowledged')) continue
    if (r?.kind === 'notice') continue                                                    // a notice he has seen
    return false
  }
  return true
}

/* HIS WHOLE-DAY PENDING BID CUT TO ONE HALF IS A TAKE, NOT A CHANGE (M1's code read — both readers, H1 / F1). Leave or a
   medical he files on the Inputs page for a morning or an afternoon of a day where his whole-day bid waits cuts the bid to
   the half the input leaves free (`leavewar/inputgate.ts replaceClashingBids`: the same record, `LL` → `LL*` or `*LL`),
   inside his own command. On a closed day, or a day before today, that read as a change and refused his whole filing —
   and D1166 says the Inputs page is never stopped by the closed dates. Only that one cut passes: the same record, a
   request not refused, its state unchanged, a whole-day code become exactly one of its halves, every other field equal. */
function narrowed(was: any, now: any): boolean {
  if (!was || !now || was.kind !== 'request' || now.kind !== 'request') return false
  if ((was.state !== 'pending' && was.state !== 'acknowledged') || was.state !== now.state) return false
  const code = String(was.code ?? '')
  if (!code || code.includes('*')) return false
  if (now.code !== `${code}*` && now.code !== `*${code}`) return false
  return JSON.stringify({ ...was, code: '' }) === JSON.stringify({ ...now, code: '' })
}

const same = (a: any, b: any): boolean => (a ?? null) === (b ?? null)
const filed = (x: any, y: any): boolean => same(x.by, y.by) && same(x.at, y.at) && same(x.grp, y.grp) && same(x.grpBy, y.grpBy)
const isInputChange = (c: Change): boolean => c.collection === 'inputs' && c.id !== INPUT_ORDER
/* WHO PLACED A LEAVE THE WAR APPROVED (the overhaul's M4, 8.6 — the security read's question, the spec §3): the request's
   placer rides on its Input as `lwBy` / `lwAt`, written only by an admin's approval of his own squadron's war; a person's
   own command keeps them as they were or drops them, never writes them. The caller skips it for the restore the timeline
   is applying (record for record — a change that merely calls itself a restore is judged as any other: the security
   read's finding 1). One test for both callers — the member section and an admin's own input outside his squadrons
   (fix read 5's FR5-SEC-1) — so a member rule added later is not missed again. */
function warPlacerForged(env: CommitEnvelope, c: Change): boolean {
  if (c.op !== 'put' || !c.after) return false
  const f: any = c.after
  if (f.lwBy === undefined && f.lwAt === undefined && f.lwU === undefined) return false
  /* (a piece cut from a leave — a medical splitting it — is a new record carrying its parent's stamp: any before-image
     of this command's own vouches for it)
     (`lwU` — the squadron whose war approved it, leavewar/sync.ts doorApprove — is part of the stamp: each war holds only
     its own leave, so a person's own command never writes or changes it either — core line 1, 22 Nov 26) */
  const stamp = `${f.lwBy ?? ''}|${f.lwAt ?? ''}|${f.lwU ?? ''}`
  return !env.changes.some(x => x.collection === 'inputs' && x.before && `${(x.before as any).lwBy ?? ''}|${(x.before as any).lwAt ?? ''}|${(x.before as any).lwU ?? ''}` === stamp)
}
function inputBreach(env: CommitEnvelope, c: Change, pid: string, replayed: boolean): string | null {
  const b: any = c.before ?? null, f: any = c.op === 'delete' ? null : (c.after ?? null)
  /* his own part — asked FIRST, before the filer's rule, in the forward and the replayed path alike (F5) */
  const own = ownPart(pid, b, f)
  if (!own && !filedForOther(pid, b, f)) return `another person's input`
  if (replayed || !f) return null
  /* THE SCHEDULER'S MARKS ARE NEVER A MEMBER'S TO SET (step 4 of the one-rule build — owner D760 reading 2: "only a
     scheduler puts a CX on or takes it off — the member sees it and is told, he does not set it"). The cancel mark with
     its reason, the red box and "information only" ride an input he may otherwise change in full: a record he changes
     keeps them exactly; one he creates carries none — unless it is a piece the app cut from a record this same command
     changed (one man split out of a cancelled input), which carries that record's. */
  /* …and a LATE mark a scheduler dropped (D1586 — §11's note: "never mine to set or clear"; the bug check of 3 Nov 26:
     the drop rides the input now, and this list did not carry it) */
  /* A record he creates takes marks only from the record it is a PIECE of — the one it was cut from, which hands it its
     filer and its filing time (engine/inputown.ts pieceOf, ui/inputedit.tsx's tail and medical pieces). Any other record of
     his the command changed is not its source (the security read of 3 Nov 26: his own MC, filed over a leave whose LATE
     mark a scheduler had dropped, was compared with the leave's marks and refused; and a new filing could borrow another
     input's cancel or drop). */
  { const mk = (x: any) => JSON.stringify(x ? [!!x.cx, x.cx ? String(x.cxr || '') : '', !!x.flag, !!x.info] : [false, '', false, false])
    const src = b || (env.changes.find(o => o !== c && isInputChange(o) && o.before != null && same((o.before as any).by, f.by) && same((o.before as any).at, f.at)
      && idsOf(f).some((p: any) => holds(o.before, p))) || {} as any).before || null
    if (mk(f) !== mk(src)) return `a scheduler's mark on an input`
    /* THE LATE DROP: never his to put on; his own later change takes it off (owner D1620, 3 Nov 26 — "as recommended": a new
       late change brings the mark back) — so he may clear it only in a save that stamps his input anew: its change date or
       change time (`mod`, `modAt` — the same day is a new change too), or a person's own date in an input of several,
       matched by the person; and never in a save that is nothing but his own leaving (the fix round's read: leaving is
       no change of the input for the others) — a filer's hand-over, or a change made as he leaves, is a change of it (the
       second fix round's read: the wider test refused those, which the app allows him — D660). */
    if (!!f.lateOff && !(src && src.lateOff)) return `a scheduler's mark on an input`
    if (!f.lateOff && src && src.lateOff) {
      const dateOf = (x: any) => new Map<string, unknown>(peopleOf(x).map((e: any) => [String(e && e.p), (e && e.mod) ?? null] as [string, unknown]))
      const was = dateOf(src)
      const anew = !same(f.mod, src.mod) || !same(f.modAt, src.modAt)
        || [...dateOf(f)].some(([p, d]) => d != null && (!was.has(p) || was.get(p) !== d))
      if (!anew || (holds(src, pid) && !holds(f, pid) && ownPart(pid, src, { ...f, lateOff: src.lateOff }))) return `a scheduler's mark on an input`
    }
    /* …AND SO IS WHERE A SCHEDULER PUT IT (his D1388): the mark that he moved it is his to set and clear, and while it
       stands — or his Reject does — a member's change leaves it where it is: under Unavailable, parked, or on the
       Ground Programme. Asked of WHERE IT STANDS (engine/inputs.ts placeOf — the one answer the save keeps), never of the
       stored marks: a leave stands under Unavailable by its kind with no mark, an overseas duty retyped out of one leaves
       its Ground mark behind, and the programme's own 'g' comes and goes with the week — none of those moves it (the code
       read's F1, 26 Oct 26: comparing the marks rolled back a retype that left it where it was). */
    if (!!(src && src.schedPlaced) !== !!f.schedPlaced) return `a scheduler's move of an input`
    if (b && placeHeld(b) && placeOf(b) !== placeOf(f)) return `where a scheduler put an input` }
  /* "APPROVED BY THE WAR" IS NEVER A MEMBER'S TO SET (the overhaul's M4 — the security read's finding 3, 27 Oct 26). `lw`
     (the war that approved it) and `lwMoved` (the days a move on the war carried) are written by an admin's approval and
     move; M4 trusts them ("Also since you last looked" and Approvals read `lw` as war-approved leave). A member's change
     keeps them as they were or drops them (his own re-dated or re-typed leave goes back to "filed on the Inputs page",
     19 Sep 26); a record he creates carries them only as a piece the app cut from a record of the same man this command
     changed (a medical cutting his war-approved leave): that record's `lw`, and of its moved days only its own. */
  { const mark = (x: any) => (x && x.lw ? x.lw : null)
    const moved = (x: any): Record<string, unknown> => (x && x.lwMoved && typeof x.lwMoved === 'object' ? x.lwMoved : {})
    if (mark(f) != null || Object.keys(moved(f)).length) {
      const man = personOfInput(f)
      const from = b ? [b] : env.changes.filter(o => o !== c && isInputChange(o) && o.before != null && man != null && holds(o.before, man)).map(o => o.before)
      const ok = from.some((s: any) => mark(s) != null && (mark(f) == null || JSON.stringify(mark(f)) === JSON.stringify(mark(s)))
        && Object.entries(moved(f)).every(([d, v]) => moved(s)[d] === v))
      if (!ok) return `a mark that it was approved on the war`
    } }
  /* HIS OWN PART is taking himself OUT (D755 (3)). Putting himself INTO an input that holds others is adding a person
     to it — its filer's or a scheduler's (owner D763) — except as his own Undo putting him back, which is a replay. */
  if (own && b && idsOf(f).length > 1 && !holds(b, pid) && holds(f, pid) && !filedForOther(pid, b, f)) return `a person added to another person's input`
  /* NOBODY'S ENTRY IS FORGED: one he puts in names him as who put it in; one that was there is left exactly as it was */
  { const was = new Map<string, any>(peopleOf(b).map((e: any) => [String(e && e.p), e] as [string, any]))
    for (const e of (Array.isArray(f.people) ? f.people : [])) {
      if (!e) continue
      const old = was.get(String(e.p))
      if (b && Array.isArray(b.people) && old) { if (JSON.stringify(old) !== JSON.stringify(e)) return `who put a person in an input`; continue }
      if (old) continue                                        // the record's first rewrite with its list: his entry is the old filing's
      const piece = env.changes.some(o => o !== c && isInputChange(o) && o.before != null && peopleOf(o.before).some((x: any) => x && JSON.stringify(x) === JSON.stringify(e)))
      if (!piece && e.by != null && String(e.by) !== pid) return `a person put in an input in another person's name`
      if (!piece && e.by == null && !own) return `a person put in an input with no name to it`
    } }
  if (!b) {
    /* a piece the app cut from a record of the same man this command changed or deleted */
    const piece = env.changes.some(o => o !== c && isInputChange(o) && o.before != null
      && personOfInput(f) != null && holds(o.before, personOfInput(f)) && filed(o.before, f))
    if (!piece) {
      if (own ? (f.by != null && String(f.by) !== pid) : String(f.by ?? '') !== pid) return `an input placed in another person's name`
      const g = f.grp ?? null, gb = f.grpBy ?? null
      if ((g == null) !== (gb == null)) return `a shared input without its filer`
      /* (the old group fields are written by no door any more; a hand-made record carrying them names its maker as the
         filer or is refused — "it joins a group that already stood" went with D763: a person in a shared input he did
         not file adds nobody) */
      if (g != null && String(gb) !== pid) return `a shared input filed in another person's name`
    }
  } else {
    /* (who filed it passes on when its filer takes himself out — byAfterLeaving, the one body) */
    const passed = own && holds(b, pid) && !holds(f, pid) && same(f.by, byAfterLeaving(b, pid))
    /* (…and to the one person of an input who makes it an input of several — takesOn, above) */
    if ((!same(b.by, f.by) && !passed && !takesOn(pid, b, f)) || !same(b.at, f.at)) return `who placed an input`
    if (!same(b.grp, f.grp) || !same(b.grpBy, f.grpBy)) {
      const made = b.grp == null && b.grpBy == null && f.grp != null && f.grp !== '' && String(f.grpBy ?? '') === pid
      /* …or the record was rewritten with its PEOPLE, where the old group fields go (engine/inputown.ts toPeople) */
      const listed = Array.isArray(f.people) && f.grp == null && f.grpBy == null
      if (!made && !listed) return `who filed a shared input`
    }
  }
  if (own) return null
  const oil = f.oil
  if (oil == null) return null
  if (typeof oil !== 'object' || Array.isArray(oil)) return `an OIL answer for another person`
  /* (a HAND-OVER — the one person of an input replaced by another — keeps no answer, as the save has it
     (ui/inputedit.tsx commitInputEdit); a record that carries its people has no `person` for voidedOil to compare) */
  const handedOver = !!b && idsOf(b).length === 1 && idsOf(f).length === 1 && String(leadOf(b)) !== String(leadOf(f))
  const kept: Record<string, number> = (b && !handedOver ? voidedOil(b, f) : undefined) || {}
  let plan: Map<string, number> | null = null
  for (const k of Object.keys(oil)) {
    if (k in kept && kept[k] === oil[k]) continue
    if (!plan) plan = new Map(oilPlanOf(f).map(p => [p.iso, p.amt] as [string, number]))
    const amt = plan.get(k)
    if (amt == null || (oil[k] !== 0 && oil[k] !== amt)) return `an OIL answer the input's days and hours do not give`
  }
  return null
}
/* WHAT A POSTING'S RUN MAY CHANGE ([SYSTEM-PASS-SAVES-ROSTER], the security read's 1(a)) — read off the envelope alone, so the
   database step can hold the same rule on the changeset. The fields each outcome writes, from the code that writes them:
   Overseas Sqn (leavewar/sync.ts runPoOutcomes) archived, archivedBy 'po', archivedOn; SANS (the same) san, quals.san,
   sanQ, sanBy 'po'; Delete (state/person-delete.ts applyDelete) deleted, deletedFrom, archived, archivedBy 'del'. A
   posting with no outcome runs nothing, and 'transfer' is not an outcome yet (D281). The settings rows: Overseas suspends
   his account (state/accounts.ts suspendForPosting); Delete removes it, a request waiting under its sign-in name and his
   bell's row (dropAccountOfPid). */
const PASS_FIELDS: Record<string, string[]> = {
  overseas: ['archived', 'archivedBy', 'archivedOn'],
  sans: ['san', 'quals', 'sanQ', 'sanBy', 'sanFrom', 'sanWas'],   // …and the day it counts from (D2313 — engine/people.ts sansStart)
  delete: ['deleted', 'deletedFrom', 'archived', 'archivedBy'],
}
const passOutcomeOf = (p: any): string | undefined =>
  !p ? undefined : typeof p.poOutcome === 'string' ? p.poOutcome : p.poArchive === true ? 'overseas' : p.poArchive === false ? 'none' : undefined
const isoAddDay = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(Date.UTC(y!, m! - 1, d! + 1))
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`
}
const localIsoToday = (): string => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/
export function postingPassViolation(env: CommitEnvelope): string | null {
  const today = localIsoToday()
  /* each man whose posting this pass carries out, with its outcome: his posting record's change is its done mark — `poDone`
     set, from anything else, to the posting's own date (the day after his last day in, `to`), a date already come — or, for
     a Delete of a man who never arrived, his record removed (store.ts forgetPersonFrom) on a date already come */
  const posted = new Map<string, string>()
  const postedOn = new Map<string, string>()   // each posted man's posting date (the bell lines' check, below)
  const postedIn = new Map<string, string>()   // each man posted through the second store → the squadron whose war holds it
  const refuse = (c: Change) => `the posting pass may change only the men it posts out, and only as their posting does (${c.collection}/${c.id})`
  const warU = lwUnitNow()
  /* A POSTING THE PASS CARRIES OUT IS ONE THAT WAS SAVED (fix read 13, item B — SEC13-1): its record's change starts from a
     before-image — never from none — and that image is the war's SAVED posting row (the probe), its date (`to`) and
     outcome the same after; a Delete of a man who never arrived removes a record that is the saved one. A posting made up
     or rewritten in memory outside every command, by whoever's browser runs the pass, is refused here, whatever its date.
     THE PASS OVER EVERY SQUADRON (the reshape plan §6.2 A5, step 7): another squadron's posting, run through the second
     store (`lwx.profile/<unit>@<pid>` — leavewar/state/foreign.ts), is judged the same way against THAT squadron's saved
     row (its own probe, above), never for the war loaded (that one is `lw.postouts`), one posting a man a pass. */
  for (const c of env.changes) {
    if (c.collection !== 'lw.postouts' && c.collection !== 'lwx.profile') continue
    const fx = c.collection === 'lwx.profile'
    const at = fx ? split(String(c.id)) : null
    const pid = at ? at.local : String(c.id)
    const b: any = c.before, f: any = c.op === 'delete' ? null : c.after
    if (!b || typeof b !== 'object') return refuse(c)
    if (at) {
      if (!at.unit || !pid || at.unit === warU) return refuse(c)
      if (STORED && !(LWX_POSTING && LWX_POSTING(at.unit, pid, b))) return refuse(c)
    } else if (LW_POSTING && STORED && !LW_POSTING(pid, b)) return refuse(c)
    if (f ? f.to !== b.to || passOutcomeOf(f) !== passOutcomeOf(b) : passOutcomeOf(b) !== 'delete') return refuse(c)
    let date: string | null = null, outcome: string | undefined
    if (f && typeof f.to === 'string' && ISO_DAY.test(f.to) && f.poDone === isoAddDay(f.to) && b.poDone !== f.poDone) { date = f.poDone; outcome = passOutcomeOf(f) }
    else if (!f && typeof b.to === 'string' && ISO_DAY.test(b.to)) { date = isoAddDay(b.to); outcome = 'delete' }
    if (date && date <= today && outcome) {
      if (posted.has(pid)) return refuse(c)
      posted.set(pid, outcome); postedOn.set(pid, date)
      if (at) postedIn.set(pid, at.unit!)
    } else if (at) return refuse(c)   // (a second store's posting row changes in a pass only as its done mark)
  }
  /* …and only the men of the squadron whose Leave War it runs on (the second fix read — the security read's H2): a posting
     for another squadron's man in this war was never set by one of its admins (section 7b), so the pass does not carry it
     out. Judged by his home before the pass, where one is known (a shared store before its rows are made knows none). A
     posting run through the second store is that squadron's man's, his home before the pass that squadron — always known
     there (step 7). */
  const rows = unitRowsBefore(env.changes)
  for (const pid of posted.keys()) {
    const h = homeBefore(pid, today, rows), fu = postedIn.get(pid)
    if (fu ? h !== fu : warU && h && h !== warU) return `the posting pass ran on ${fu ?? warU}'s Leave War for another squadron's man (${fu ? 'lwx.profile' : 'lw.postouts'}/${pid})`
  }
  /* THE SQUADRON EACH POSTING IS OF — the bell lines' audience (step 6): the second store's, the war loaded's, or (one war
     on the page, no world door) his home's */
  const postUnit = (pid: string): string => postedIn.get(pid) ?? warU ?? homeBefore(pid, today, rows) ?? UNIT
  /* THE REST OF THE SECOND STORE IN A PASS — a Delete's war half on that squadron's stored war (sync.ts deleteOnForeign):
     his war records and ledger entries from his cutoff (his person's `deletedFrom` in this pass), removed, nothing else */
  const cutOf = (pid: string): string | null => {
    const pc = env.changes.find(x => x.collection === 'people' && String(x.id) === pid)
    const pf: any = pc && pc.op !== 'delete' ? pc.after : null
    return pf && typeof pf.deletedFrom === 'string' ? pf.deletedFrom : null
  }
  for (const c of env.changes) {
    if (c.collection !== 'lwx.rec' && c.collection !== 'lwx.ledger') continue
    const { unit } = split(String(c.id)), b: any = c.before
    const who = b && typeof b === 'object' ? String(c.collection === 'lwx.rec' ? b.pid : b.personId) : ''
    const cut = who ? cutOf(who) : null
    const ok = !!unit && (c.op === 'delete' || c.after == null) && posted.get(who) === 'delete' && postedIn.get(who) === unit
      && !!cut && typeof b.date === 'string' && b.date >= cut
    if (!ok) return refuse(c)
  }
  const accounts = new Map<string, any>()   // account id → its row before, for each posted man's account the pass changes
  /* THE FIRST WRITE OF THE ACCOUNTS STORES THE WHOLE LIST (state/accounts.ts writeAccounts — a store that has never written
     them holds the seeded list in memory, and the loader reads "no rows" as the seeded list, so the first write puts every
     row). A row put where none was stored is allowed only on that first write — no account row in the changeset stored
     before — and only as the SEEDED list's own row (accounts.ts seedAccounts): its id, name, role and owner the seed's; the
     posted man's suspended (on off, offBy 'po'), every other man's as seeded. Decided from the changeset alone it let a pass
     create any account at any role (the narrow read of 63e1660d6, `docs/handpass/parts/lw-rr1031/read-fix1.md` 1). On a
     shared store there are no seeds (seedAccounts is empty), so the allowance does not exist there. */
  const acctRows = env.changes.filter(c => c.collection === 'settings' && String(c.id).startsWith('account:'))
  const firstStore = acctRows.length > 0 && acctRows.every(c => c.before == null)
  const seeds = firstStore ? seedAccounts() : []
  /* a Delete on that first write leaves his seeded account out of the list it stores: his request and bell rows go with it */
  for (const a of seeds) if (posted.get(String(a.pid)) === 'delete') accounts.set(String(a.id), a)
  for (const c of env.changes) {
    if (c.collection === 'people') {
      const outcome = posted.get(String(c.id))
      /* only the three outcomes the app writes have a list: an outcome is any string its posting record carries, and one
         named as something every object has ("toString", "constructor") found a function on the plain object, not a list
         — the check threw instead of refusing (the reads of 8 Nov 26, `docs/handpass/parts/rss1108/read-security.md`) */
      const fields = outcome && Object.prototype.hasOwnProperty.call(PASS_FIELDS, outcome) ? PASS_FIELDS[outcome] : undefined
      const b: any = c.before, f: any = c.op === 'delete' ? null : c.after
      if (!fields || !b || !f) return refuse(c)
      const may = new Set(fields)
      for (const k of new Set([...Object.keys(b), ...Object.keys(f)])) {
        if (JSON.stringify(b[k]) === JSON.stringify(f[k])) continue
        if (!may.has(k)) return refuse(c)
      }
      if (outcome === 'sans') {
        const qb = b.quals || {}, qf = f.quals || {}
        for (const k of new Set([...Object.keys(qb), ...Object.keys(qf)])) if (k !== 'san' && JSON.stringify(qb[k]) !== JSON.stringify(qf[k])) return refuse(c)
      }
      const marked = outcome === 'overseas' ? f.archived === true && f.archivedBy === 'po'
        : outcome === 'sans' ? f.san === true && f.sanBy === 'po'
          : f.deleted === true && f.archived === true && f.archivedBy === 'del'
      if (!marked) return refuse(c)
    } else if (c.collection === 'settings' && String(c.id).startsWith('account:')) {
      const b: any = c.before, f: any = c.op === 'delete' ? null : c.after
      const rowId = String(c.id).slice('account:'.length)
      if (!b) {
        const seed: any = f && c.op === 'put' ? seeds.find(a => String(a.id) === rowId) : null
        if (!seed) return refuse(c)
        /* the master mark (multi-squadron batch 1, step 1) rides on the seeded row as the seed has it, never set or cleared */
        const keys = ['id', 'name', 'role', 'pid', 'on', 'offBy', 'master']
        if (Object.keys(f).some(k => !keys.includes(k))) return refuse(c)
        if (!['id', 'name', 'role', 'pid', 'master'].every(k => JSON.stringify(f[k]) === JSON.stringify(seed[k]))) return refuse(c)
        /* only an Overseas Sqn posting suspends his account; a SANS man keeps his as seeded (the fix read of multi-squadron
           batch 1's full check, 18 Nov 26: a SANS posting due beside an Overseas Sqn one on a first write was refused,
           and ran only on the pass's own retry, which Opus 1's loop break ended) */
        const ok = posted.get(String(seed.pid)) === 'overseas' ? f.on === false && f.offBy === 'po' : f.on === seed.on && f.offBy == null
        if (!ok) return refuse(c)
        continue
      }
      if (!posted.has(String(b.pid ?? ''))) return refuse(c)
      if (f && (String(f.pid) !== String(b.pid) || f.role !== b.role || f.name !== b.name || !!f.master !== !!b.master)) return refuse(c)
      accounts.set(rowId, b)
    }
  }
  /* THE PASS'S BELL LINES ([POSTOUT-RUN-NOTICE] — D1547; tightened by the build's security read, 5 Nov 26): only NEW
     lines, the app's own (nobody named as their maker), never one rewritten or taken away. A posting's line (`po`) is a
     line of that one part, about a man this very pass posts out, saying the outcome that ran (`acct` only for an Overseas
     Sqn), dated his posting date, about no input, addressed to one of that posting's squadron's admins (step 7, below) and never to the man himself —
     one an admin a man. Any other line the pass makes is a Delete's: the lines its inputs owe the others in them
     (state/sched-commit.ts tellPass — the app's act, with no name, R12), each about an input this changeset changes and
     none of the war's or a posting's kinds. At the database step the pass's service account writes exactly these. */
  /* …addressed to one of that posting's squadron's admins on the run's day, read after the outcomes (the reshape plan §6.2
     step 6 — accounts.ts adminLineAudience since §7 item 2: at home there, a plain admin holding Plan of it, or a master admin; an
     admin archived by this very pass not told), whichever war holds the posting (step 7) */
  const audience = new Map<string, Set<string>>()
  const adminOfPosting = (who: string, to: string): boolean => {
    const u = postUnit(who)
    let s = audience.get(u)
    /* (…and every master admin who can sign in — the one audience, accounts.ts adminLineAudience, §7 item 2) */
    if (!s) { s = new Set(adminLineAudience(u, today)); audience.set(u, s) }
    return s.has(to)
  }
  const told = new Set<string>()
  const deletes = [...posted.values()].includes('delete')
  const inputsChanged = new Set(env.changes.filter(c => c.collection === 'inputs').map(c => String(c.id)))
  for (const c of env.changes) {
    /* (his own account's line — judged whole by acctLineViolation, asked right after this) */
    if (c.collection !== 'notices' || acctChange(c)) continue
    const n: any = c.op === 'delete' ? null : c.after
    if (c.before != null || !n || n.by != null || !Array.isArray(n.what) || !n.what.length) return refuse(c)
    const parts: any[] = n.what
    if (parts.some(p => p && p.k === 'po')) {
      const p = parts[0], who = String(p.who)
      const ok = parts.length === 1 && p.k === 'po' && posted.has(who) && p.o === posted.get(who)
        && (p.acct === undefined || (p.acct === true && p.o === 'overseas'))
        && n.iid === '' && n.day === postedOn.get(who) && String(n.to) !== who && adminOfPosting(who, String(n.to))
        /* (stamped with the posting's squadron — §7 item 1) */
        && n.u === postUnit(who)
        && !told.has(`${n.to}|${who}`)
      if (!ok) return refuse(c)
      told.add(`${n.to}|${who}`)
    } else if (!deletes || parts.some(p => WAR_LINE_KINDS.has(String(p && p.k)) || NEVER_STORED.has(String(p && p.k))) || !inputsChanged.has(String(n.iid))) return refuse(c)
  }
  /* THE SIGN-INS THIS PASS TAKES AWAY (fix read 12, fault A — Opus O12-2, Fable F12-1): a posted man's account whose
     outcome is Delete and whose row this pass removes — or, on the accounts' very first write, his seeded row the stored
     list simply leaves out (no change of that row at all) */
  const gone = new Set<string>()
  for (const [rowId, b] of accounts) {
    if (posted.get(String(b.pid ?? '')) !== 'delete') continue
    const ch = acctRows.find(c => String(c.id) === 'account:' + rowId)
    if (ch ? ch.op === 'delete' || ch.after == null : firstStore) gone.add(rowId)
  }
  /* the rest of the pass's settings rows: for a Delete, the request waiting under his account's sign-in name, his bell's
     row and every right his sign-in holds in another squadron (the delete's own body drops them — units.ts
     dropGrantsOfAccount, fix read 11's E — and a right left naming a sign-in gone is G5's), all removed; nothing else */
  /* …and for an Overseas Sqn posting, which archives him, every View and Plan his sign-in holds in another squadron, removed
     (his D2311 — batch 1's second half, plan §4 item 8, R-O1, R-A4: archived or posted overseas, View and Plan end; the
     pass drops them, accounts.ts endRightsOfArchived), whether or not this pass changes his account row (an account
     suspended by hand before keeps its row) — the posted man read from the verified posting above, his sign-in from the
     list before the command */
  const wB = worldsOf(env)
  const overseasAcct = new Set<string>()
  for (const [pid, o] of posted) {
    if (o !== 'overseas') continue
    for (const x of (wB ? wB.acctB : ACCOUNTS_LIST)) if (String(x.pid) === pid) overseasAcct.add(x.id)
  }
  for (const c of env.changes) {
    if (c.collection !== 'settings' || String(c.id).startsWith('account:')) continue
    const b: any = c.before, id = String(c.id)
    const ok = (c.op === 'delete' && (
      (id.startsWith('accessreq:') && !!b && [...accounts.values()].some(a => a.name === b.name))
      || (id.startsWith('reqseen:') && accounts.has(id.slice('reqseen:'.length)))))
      || (id.startsWith(GRANT_PFX) && !!b && (c.op === 'delete' || c.after == null) && (gone.has(String(b.account)) || overseasAcct.has(String(b.account))))
    if (!ok) return refuse(c)
  }
  /* G5 holds for the pass too (fix read 12, fault A (2)): no account row goes while a right still names it */
  const w = worldsOf(env)
  return w ? rightOutlivesAccount(env, w) : null
}

/* 6. THE UNITS' ROWS AND THE MASTER MARK AT THE COMMIT GATE (multi-squadron batch 1, step 1 — state/units.ts).
   The command gate above reads a command's TYPE ("an admin may"); this reads its ROWS ("an admin OF the unit each names"),
   for every actor and every door — a typed command, a forged one, an Undo or a Redo. Run first in ownershipViolation, so
   an admin is held too (the member rules below stop at an admin).
   - WHO: judged over the rows and the actor's account as they stood BEFORE the command (unitRowsBefore), so a command
     never lends its author the right it is giving — a grant of admin in 149 to himself is refused like any other.
     A unit row is a master's alone; a place's row is new by any admin, changed only by a master or an admin of a unit
     at it today; a unit's place, a right and a home need an admin of the unit named, in the image before AND after.
     An actor with no account behind him (a probe's or a test's session) is read as the role in force at ME's home.
   - WHAT: every row written passes its own check and names a unit and a place that exist; a grant names an account,
     is never in that account's own home unit, and is the one grant for that account and unit; a unit or a place is
     removed only when nothing names it.
   - THE MASTER MARK: changed only by `account.master` (or the Undo of one), only by a master, never on his own account,
     and one master always left. */
const isUnitRow = (id: string) => UNIT_ROW_PREFIXES.some(p => id.startsWith(p))
const ACCOUNT_ROW = 'account:'

/* 7. A UNIT'S OWN RECORDS ARE CHANGED ONLY BY ONE WHO HOLDS RIGHTS IN THAT UNIT (multi-squadron batch 1, step 2).
   Every record a unit owns names it in its id — a schedule day `days/u149@13/07/2026#2`, a setting `settings/u149@rules`,
   a planning row `plan/u149@pp:…` (storage/unitid.ts) — so the gate reads the unit off each change, whatever door wrote
   it (a typed command, a raw settings write, an Undo or a Redo). The command TYPE still decides "may an admin do this"
   (COMMAND_OPS, cmdAuthorize); this asks the second half, "in THAT unit": an admin in force must be an admin there (his
   home unit's admin role, an admin grant, or the master mark — units-model.ts levelFrom, the one answer, read over the
   rows as they stood before the command); a member must be at home there — a View right writes nothing (D2094). So 142's
   admin cannot change 149's Logic, schedule or calendar, though `settings.rules` is an admin's command. An actor with no
   account behind him (a test's or a probe's session — never a sign-in, which always has one) is read as the role in
   force in the unit in view only. The app itself (a system command) is not asked, as nowhere else. */
function unitRecordViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role === 'system') return null
  const units = new Set<string>()
  for (const c of env.changes) { const u = unitOf(String(c.id)); if (u) units.add(u) }
  if (!units.size) return null
  const today = todayIso()
  const rows = unitRowsBefore(env.changes)
  for (const u of units) {
    const lv = levelInForce(a, u, today, rows)
    const ok = a.role === 'admin' ? lv === 'admin' : lv === 'member' || lv === 'admin'
    if (!ok && !(a.role === 'admin' && deleteStripsOnly(env, a, u, today, rows))) return `a change to another unit's records (${u}) by one with ${lv ? `${lv} rights` : 'no rights'} there`
  }
  return null
}
/* 7a. A SCHEDULE DAY NEVER NEWLY NAMES A MAN WHO IS ANOTHER SQUADRON'S THAT DAY (core line 2, 22 Nov 26 — the reshape
   walk's W4-F2 at the save check; his D2243 Q2: on a day he is not the squadron's he is not offered). The door was closed
   by ui/drag.ts applyDrop; this is the same question asked of the write itself, whatever door or hand-made command made
   it: of each day's record (`days/<unit>@<week>#<day>`), every person its content names after the change and did not
   name before (engine/publish.ts dayNamedIds — the person slots, never free text, the placeholders left out) must not be
   another squadron's on that day, his home read over the rows as they stood before the command. For everyone but the app
   itself — a master admin and a Plan holder too: the rule is about the man, not the actor's rights.
   What it leaves alone: a line that named him before (a move set ahead keeps the old squadron's lines naming him — the
   transfer's "its lines keep him", D2160, D2147), changed around him, his re-seating within such a day, his taking off;
   a man with no squadron that day. Picking another squadron's man on purpose — borrowing (D2091, D2098) — is design
   only: when it is built its own writer is let through here by name.
   An Undo or Redo that would put him back on such a day is judged as any other change (the timeline vouches for no day
   record — undo/timeline.ts verifiedReplay), as the Undo of leave onto such a day is refused (D2243 Q3). */
function schedDayNamesViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role === 'system') return null
  let rows: UnitRows | null = null
  for (const c of env.changes) {
    if (c.collection !== 'days' || c.op !== 'put' || !c.after) continue
    const { unit, local } = split(String(c.id))
    if (!unit) continue
    const at = local.lastIndexOf('#'), di = +local.slice(at + 1)
    if (at < 0 || !Number.isInteger(di) || di < 0 || di > 6) continue
    const iso = dayIso(local.slice(0, at), di)
    if (!ISO_DAY.test(iso)) continue
    const was = new Set(c.before ? dayNamedIds(c.before) : [])
    for (const pid of dayNamedIds(c.after)) {
      if (was.has(pid)) continue
      const home = homeBefore(pid, iso, rows ??= unitRowsBefore(env.changes))
      if (home && home !== unit) return `a schedule day newly naming a man who is another squadron's that day (${pid}, ${home}'s on ${iso} — days/${c.id})`
    }
  }
  return null
}
/* A DELETE REACHES EVERY SQUADRON'S PLANNING CALENDAR (the reshape plan §6.2 B1 — the gate line, core, phase 1; the
   writer is state/plan-foreign.ts, helper "session"). A man deleted goes off every calendar note naming him from his
   cutoff, whichever squadron's calendar it is — so his delete may change a planning row of a squadron its admin holds no
   right in, and only so: (a) this same command deletes that man (personDeletedHere — the admin an admin of HIS
   squadron); (b) every change of that squadron's records is a note or pucks row (`pp:`) that stood before, dated on or
   after his cutoff, its after-image its before-image with his id blanked (the first place it stands) and the trailing
   blanks trimmed — or the row removed where that leaves it neither words nor people (person-delete.ts step 3c's own
   rule). Nothing else of any row may change: its words, its day, its order, another man (fix read 12's fault B). */
function deleteStripsOnly(env: CommitEnvelope, a: Actor, u: string, today: string, rows: UnitRows): boolean {
  const adminOfHome = (h: string) => levelInForce(a, h, today, rows) === 'admin'
  const men: [string, string][] = []
  for (const c of env.changes) {
    if (c.collection !== 'people') continue
    const f: any = c.op === 'delete' ? null : c.after
    if (f && typeof f.deletedFrom === 'string' && ISO_DAY.test(f.deletedFrom) && personDeletedHere(env, String(c.id), adminOfHome, rows)) men.push([String(c.id), f.deletedFrom])
  }
  if (!men.length) return false
  for (const c of env.changes) {
    if (unitOf(String(c.id)) !== u) continue
    if (c.collection !== 'plan' || !split(String(c.id)).local.startsWith('pp:')) return false
    const b: any = c.before, f: any = c.op === 'delete' ? null : c.after ?? null
    if (!b || typeof b !== 'object' || typeof b.date !== 'string' || !Array.isArray(b.ids)) return false
    const ids = [...b.ids]
    let hit = false
    for (const [pid, cut] of men) {
      if (b.date < cut) continue
      const ix = ids.indexOf(pid)
      if (ix < 0) continue
      ids[ix] = ''
      while (ids.length && !ids[ids.length - 1]) ids.pop()
      hit = true
    }
    if (!hit) return false
    const gone = !ids.length && !String(b.text == null ? '' : b.text).trim()
    if (gone ? f != null : !f || !deepEqual(f, { ...b, ids })) return false
  }
  return true
}
/* an actor's level in a unit, as section 7 reads it. The level in his HOME unit is the role IN FORCE (the session's), as
   every other check of this gate reads it — not the stored account's: the two agree on a sign-in, and where they part
   (the developer bridge's raptorRole, the browser tests' "the role only, not the world") the stored row refused every
   write of a member raised to admin in his own squadron (found by GitHub's browser run on step 2: the changes window's
   and the Leave War's Required-row tests). Another unit's level still comes only from a grant or the master mark. An
   actor with no account is read as the role in force in the unit in view only. */
function levelInForce(a: NonNullable<CommitEnvelope['actor']>, u: string, today: string, rows: UnitRows): string | null {
  const row: any = ACCOUNTS_LIST.find(x => x.id === a.id)
  return row
    ? levelBefore(levelAcct(row, String(a.role)), u, today, rows)
    : (u === UNIT ? (a.role === 'admin' ? 'admin' : 'member') : null)
}

/* 7c. A MAN'S INPUTS ARE HIS OWN SQUADRON'S (the fix read's Opus 7, put back by the second fix read, 18 Nov 26 — Fable's
   plan §3). An input's id names no unit, so section 7 never saw one, and section 8 holds a man's person, account and
   home, never his inputs: 142's plain admin could rewrite a 149 man's leave or its remarks by a forged write (no screen
   offers it — Inputs stay on his own squadron, D2132). Each input is judged by the squadrons of the people it names —
   each one's home on the input's own date, as the rows stood before the command — before and after: an admin in force
   must be an admin of every one of them, a member at home in every one (a member may name only people of his own
   squadron — the plan's still-open 1). An input naming nobody (ALL / ALL AVAIL) is its filer's squadron's. Strict for
   every actor but the app itself: the test worlds that emptied INPUTS outside a command were put right instead
   (test-support/world.ts settleWorld), with no flag here.
   One case kept open for a member (his D755 — "the member may always take himself out"): a change that only takes him
   out of an input, adding no one, is not judged by the others' squadrons.
   ON EVERY DAY IT COVERS (job 2, 19 Nov 26 — the security read's SEC-4): a man's home is read on the input's first day
   and on every saved move inside its span (each home row's `from` there), so 142's admin cannot put a leave on a man
   that runs on into the days he is 149's. The actor's rights are still read today — rights held in a squadron once
   are not kept after he has left it (D2203). And a man's input naming only himself (an admin's too — fix read 3, O1), before and after, with no
   placeholder, is his whatever its squadron (§11, "C R U D own" — Fable's F2: across a saved move he was refused his
   own input on either side of it). An input that spans a man's move is then changed only by a master or by the man
   himself — no screen can save a move yet; who else may, filed for the Transfer batch. */
/* WHOM MAY HE FILE THIS INPUT FOR — 7c's who-rule as ONE BODY (the reshape plan §3.3 C6 — Astra 5, Opus M5 of round 2).
   A day is not enough: Ranger is 142's on a draft's first day and 149's after it, so a first-day picker offered him to
   Hunter, 142's plain admin, and the save was refused (this gate reads every day). The gate, the Inputs window's people
   picker (a man is offered where the draft with him added passes), its save door (before the gate) and an existing
   input's save all ask this one body, again whenever the draft's dates or people change.
   `before` / `after` — the input as it stood and as it would stand (null: made, or deleted). Read over `rows` (the unit
   rows the gate judges by — before the command; the doors' live rows). Returns null where it passes, else the first man
   (null for an input naming nobody) and squadron that refuse it, with the actor's level there; `own` — his own input
   (naming only him, no placeholder, before and after) that he is not an admin of every squadron of: the gate then judges
   it by the member's own-input rules instead of refusing (fix read 4, claim 1), and a door offers it.
   Today's exceptions kept: his own take-out of an input he is in (a member's, D755); his own input whatever its
   squadron (F2, §11 "C R U D own" — an admin's as an admin only where he is an admin of all it touches, fix read 3, O1);
   a member's filing for others (judged by the member section after this). D2221 as built, D2240's reading: a span across
   a move is changed only by the man, or by an admin of every squadron it touches — at home there, by Plan of it, or a
   master admin. */
export interface InputWho { pid: string | null; unit: string; level: string | null; own?: true }
export function inputWhoProblem(a: Actor, rows: UnitRows, before: any, after: any, today: string = todayIso(), replayed = false): InputWho | null {
  if (!a || a.role === 'system') return null
  const was = before ?? null, is = after ?? null
  if (JSON.stringify(was) === JSON.stringify(is)) return null
  const me = a.personId != null ? String(a.personId) : null
  const named = (r: any): string[] => (r && typeof r === 'object' ? namedOf(r).map((e: any) => String(e.p)) : [])
  /* an input's squadron stamp, as engine/inputs.ts reads it: a non-empty string, else none */
  const stampOf = (r: any): string | null => (r && typeof r === 'object' && typeof r.u === 'string' && r.u ? r.u : null)
  /* the rows' own handle: each man's squadron on a day, and the days it changes — never the live rows */
  const home = { on: (p: string, d: string) => homeBefore(p, d, rows), changesIn: (p: string, x: string, y: string) => homeChangesBefore(p, x, y, rows) }
  /* every (man, squadron) the input touches — an input with no readable date is judged on today */
  const touched = (r: any): Array<{ pid: string | null; unit: string }> => {
    if (!r || typeof r !== 'object') return []
    const sp = inputSpanIso(r) ?? [today, today]
    const ids = named(r)
    if (!ids.length) return inputSquadrons(r, home, today).map(unit => ({ pid: null, unit }))
    const out: Array<{ pid: string | null; unit: string }> = []
    /* A SQUADRON STAMP IS JUDGED WHILE MEN ARE NAMED TOO (fix read 2 — Opus 1's F2, the security read's 1): an input's
       squadrons are read off its named men first, so a stamp written onto one was never judged — and once its last man
       took himself out the meeting was that stamp's squadron's. A placeholder meeting keeps its stamp while men are named
       (D2243 Q1 — engine/inputs.ts settleStamp), so the stamp is not refused: it is one more squadron the actor must hold
       the input's rights in, before and after. */
    const st = stampOf(r)
    if (st) out.push({ pid: null, unit: st })
    for (const p of ids) {
      const u0 = home.on(p, sp[0]); if (u0) out.push({ pid: p, unit: u0 })
      for (const d of home.changesIn(p, sp[0], sp[1])) { const u = home.on(p, d); if (u) out.push({ pid: p, unit: u }) }
    }
    return out
  }
  /* WHO FILED IT IS NOT REWRITTEN ONTO ANOTHER SQUADRON'S MAN (fix read 2 — the security read's 1, route C): an input left
     naming nobody with no stamp is read by its filer's squadron (the placeholder entry's `by`, else the record's), so a
     filer written onto it — 149's Kestrel on 142's meeting — then a bare take-out, landed it on 149's schedule. A changed
     `by`, or placeholder's `by`, on an input that stood before is one more squadron the actor must hold rights in: the
     new filer's, on the input's first day. Not judged: the actor himself; the handover the take-out door writes when its
     filer leaves (byAfterLeaving — the one body); a restore's verified replay, which puts back what its step recorded. */
  const newFilerUnits = (): Array<{ pid: string | null; unit: string }> => {
    if (!was || !is || typeof was !== 'object' || typeof is !== 'object' || replayed) return []
    const d0 = (inputSpanIso(is) ?? [today, today])[0]
    const str = (x: any): string => (x == null ? '' : String(x))
    const stays = new Set(idsOf(is).map(String))
    const gone = idsOf(was).map(String).filter(p => !stays.has(p))
    const handed = new Set(gone.map(p => str(byAfterLeaving(was, p))))
    const out: Array<{ pid: string | null; unit: string }> = []
    const judge = (by: string, free: boolean) => {
      if (!by || by === me || free) return
      const u = home.on(by, d0)
      if (u) out.push({ pid: null, unit: u })
    }
    if (str(is.by) !== str(was.by)) judge(str(is.by), handed.has(str(is.by)))
    const pb = str(placeholderOf(is)?.by), pw = str(placeholderOf(was)?.by)
    if (pb !== pw) judge(pb, false)
    return out
  }
  /* (his own part only — the gate's `ownPart`: nothing but his entry differs, and the filer's handover with him. Forward,
     only as a take-out; back in, only as his own verified replay, which the gate judges before asking this body) */
  const lvOf = (u: string) => levelInForce(a, u, today, rows)
  const mayIn = (u: string): boolean => { const lv = lvOf(u); return a.role === 'admin' ? lv === 'admin' : lv === 'member' || lv === 'admin' }
  if (a.role !== 'admin' && was && is && me != null && ownPart(me, was, is) && holds(was, me) && !holds(is, me)) {
    /* …AND HIS TAKE-OUT LEAVES THE INPUT ON THE SQUADRON IT STOOD ON (fix read 2 — the security read's 1; his D2243 Q1): the
       exemption judged nothing of what it left, so a stamp forged while he was named, or an input left naming nobody and
       read by its filer's squadron, rode his "Take me out" onto another squadron's schedule. The stamp after is the stamp
       before — or, where there was none, the squadron it stood on with him in it (its first named man's that day, over
       the rows before: what the door's settleStamp writes); and an input left naming nobody is read as that squadron's,
       by its stamp or by its filer. Else the take-out is judged as any other change, below. */
    const d0 = (inputSpanIso(was) ?? [today, today])[0]
    const stoodOn = stampOf(was) ?? (named(was)[0] != null ? home.on(named(was)[0]!, d0) : null)
    const stampKept = stampOf(is) === stampOf(was) || (stampOf(was) == null && stampOf(is) === stoodOn)
    const left = named(is).length ? null : inputSquadrons(is, home, today)
    if (stampKept && (!left || left.every(u => u === stoodOn))) return null
  }
  /* (a squadron stamp is judged too, on an input that names people as on one that names nobody — touched, above) */
  const both = [...touched(was), ...touched(is), ...newFilerUnits()]
  const onlyMe = (r: any) => r == null || (!placeholderOf(r) && named(r).length === 1 && named(r)[0] === me)
  if (me != null && onlyMe(was) && onlyMe(is)) {
    /* (his own input carries no stamp; one written onto it is judged as any stamp is) */
    const st = stampOf(is)
    if (st && st !== stampOf(was) && !mayIn(st)) return { pid: null, unit: st, level: lvOf(st) }
    if (a.role !== 'admin') return null
    const bad = both.find(t => lvOf(t.unit) !== 'admin')
    return bad ? { pid: bad.pid, unit: bad.unit, level: lvOf(bad.unit), own: true } : null
  }
  for (const t of both) {
    const lv = lvOf(t.unit)
    const ok = a.role === 'admin' ? lv === 'admin' : lv === 'member' || lv === 'admin'
    if (!ok) return { pid: t.pid, unit: t.unit, level: lv }
  }
  return null
}
/* the same question asked by a door, for the person signed in, over the live rows (the picker, the save door) */
export const inputWhoProblemNow = (before: any, after: any): InputWho | null =>
  inputWhoProblem(deriveActor(), unitRowsBefore([]), before, after)

function inputUnitViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role === 'system') return null
  const ins = env.changes.filter(c => c.collection === 'inputs')
  if (!ins.length) return null
  const today = todayIso()
  const before = unitRowsBefore(env.changes)
  for (const c of ins) {
    const was = c.before ?? null, is = c.op === 'delete' ? null : c.after ?? null
    if (JSON.stringify(was) === JSON.stringify(is)) continue
    /* back into an input he was taken out of — only as his own verified replay (his Undo of the take-out) */
    if (a.role !== 'admin' && was && is && a.personId != null && ownPart(String(a.personId), was, is)) {
      const me = String(a.personId)
      if (!holds(was, me) && holds(is, me) && env.origin === 'restore' && REPLAY && REPLAY(env)?.(c)) continue
    }
    const who = inputWhoProblem(a, before, was, is, today, env.origin === 'restore' && !!REPLAY && !!REPLAY(env)?.(c))
    if (!who) continue
    if (who.own) {
      /* HIS OWN INPUT, AS A MEMBER WHERE HE IS NOT ITS ADMIN (fix read 4, claim 1 — the Opus read's §1): the member's
         own-input rules hold him, and any breach refuses it — so Hunter, 142's admin moved to 149 from tomorrow, can no
         longer save his own leave on 149's days with the war's approved mark or a scheduler's cancel mark */
      const replayed = env.origin === 'restore' && !!REPLAY && !!REPLAY(env)?.(c)
      const bad = inputBreach(env, c, String(a.personId), replayed)
      if (bad) return `${bad} (inputs/${c.id})`
      /* (and the member's second own-input rule, who placed a leave on the war — fix read 5's security read, FR5-SEC-1) */
      if (!replayed && warPlacerForged(env, c)) return `who placed a leave on the war (inputs/${c.id})`
      continue
    }
    return `an input of another squadron (${who.unit}) changed by one with ${who.level ? `${who.level} rights` : 'no rights'} there (inputs/${c.id})`
  }
  return null
}

/* 7d. A SQUADRON'S CHANGE HISTORY IS WRITTEN AND SWEPT ONLY BY ITS OWN PEOPLE (the second fix read, 18 Nov 26 — the
   security read's H5). A history line's squadron is a field of its value (`u`, engine/editlog.ts push), its id
   `elog:<line>` names none, and the permission row (member C R, admin C R D) never read it: a 142 member filed a line
   in 149's history (`logAction(…, {unit:'u149'})`), and 142's plain admin deleted a 149 line by a forged `elog.sweep`.
   NOT AT THE GATE (Fable's plan and the security read both said "judge the elog: row at the gate"): a history line is a
   RAW settings write, never a record of the settings store (state/people-settings-commit.ts), so a command's changes
   never carry it and the gate never sees one — the forged sweep commits with no change at all. Two doors instead:
   - elogUnitAllowed — asked by engine/editlog.ts push (HOOKS.elogUnitOk, installed by state/store.ts) before a line
     takes a squadron other than the unit in view, by its `unit` or by its man's home: a line the actor may not file
     there is filed in the unit in view, as every other line is. Kept lines are written later by the app (the
     projection door), so the actor is read here, at the moment the line is given.
   - elogWriteProblem — asked by the settings write hook for every `elog:` write made inside a command by a person: the
     line kept, rewritten (the key-space remap) or deleted (the sweep, the cap's trim) is judged by its `u` (a saved
     line with none is the boot squadron's — only the demo's stored data, D56): an admin in force must be an admin
     there, anyone else at home or holding rights there (a member's own command trims his squadron's oldest line); a
     rewrite keeps its squadron. (Who a line names as its author is not judged: a line is named by the person signed in on
     the device that keeps it, which a remote change's actor is not — state/sched-dayrecords.test.ts's remote envelope.)
   The app itself is not asked. A raw write outside every command is the raw store's, as for every raw key; the
   database's own row rights take that over. */
const lineOk = (a: Actor, u: string): boolean => {
  if (a.role !== 'admin' && a.role !== 'member') return u === UNIT
  const lv = levelInForce(a, u, todayIso(), unitRowsBefore([]))
  return a.role === 'admin' ? lv === 'admin' : lv === 'member' || lv === 'admin'
}
/* (job 2, 19 Nov 26 — Astra's 5: the squadron in view is asked too; a 142 member with View of 149 and 149 in view filed
   a line in 149's history, a View right writing nothing — D2094) */
export function elogUnitAllowed(a: Actor | null | undefined, u: string): boolean {
  if (!a || a.role === 'system' || !u) return true
  return lineOk(a, u)
}
/* the squadron a line naming nobody goes to when its giver may not file it in the squadron in view: an admin's or a
   member's own home today; nobody else has one (job 2's fix read, 1 — editlog.ts push, HOOKS.elogOwnUnit) */
export function elogOwnUnit(a: Actor | null | undefined): string | null {
  if (!a || (a.role !== 'admin' && a.role !== 'member') || a.personId == null) return null
  return homeOn(String(a.personId), todayIso())
}
export function elogWriteProblem(a: Actor | null | undefined, key: string, v: unknown): string | null {
  if (!a || a.role === 'system') return null
  const unitOfLine = (x: any): string => (x && typeof x === 'object' && typeof x.u === 'string' && x.u ? x.u : BOOT_UNIT)
  const was: any = store.get(key, null), is: any = v ?? null
  if (!was && !is) return null
  if (was && is && unitOfLine(was) !== unitOfLine(is)) return `a history line moved to another squadron (${key})`
  const u = unitOfLine(is || was)
  if (!lineOk(a, u)) return `a history line of another squadron (${u}) ${is ? 'written' : 'deleted'} by one without rights there (${key})`
  return null
}

/* 7b. A SQUADRON'S LEAVE WAR IS CHANGED ONLY BY ONE WHO HOLDS RIGHTS IN THAT SQUADRON (the second fix read, 18 Nov 26 —
   the security read's H2; Fable's plan C3). Each squadron has a Leave War world of its own (leavewar/sync.ts
   swapWarWorld), but a war record's id carries no unit — the storage door adds it — so section 7 never saw one, and the
   admin branch below returns early: 142's plain admin who loaded 149's world (the app's own swap, reachable from the
   console) set a posting for 149's Osprey, and the posting pass archived or deleted him the next day. The Leave War tells
   the gate which squadron's world is loaded (setLwUnitProbe, installed by leavewar/sync.ts with the open-days probe,
   answering only while each squadron has a world of its own — with no world door there is one war, shared, as before);
   every war change but the period on screen (`lw.current`) then needs an admin of that squadron from an admin in force,
   a member at home there from a member — the same reading of the role in force as section 7. The app itself is not
   asked, as nowhere else.
   ALSO: a posting that would suspend or delete a master admin. Only a master changes a master's account (his D2205), and
   the posting pass, which runs as the app, carries out what the posting says — so the posting itself is held: a Delete
   posting for a master by no one (a master is never deleted — accounts.ts masterDeleteProblem), an Overseas Sqn
   posting (archive and suspend) only by a master. Taking such a posting away is allowed. */
type LwUnit = () => string | null
let LW_UNIT: LwUnit | null = null
export function setLwUnitProbe(fn: LwUnit | null): void { LW_UNIT = fn }
export const lwUnitNow = (): string | null => (LW_UNIT ? LW_UNIT() : null)
/* WHAT A MAN'S POSTING IS AS SAVED (fix read 13, item B — SEC13-1): is this posting record (null: none) his posting exactly
   as the war's stored profile row holds it? Installed by leavewar/sync.ts beside the unit probe; asked only while the
   saved copy is wired too (the stored-row probe below, as on every built site) — a test without saved rows, which judges
   an envelope by hand or after its pass has landed, asks nothing, as setStoredRowProbe */
type LwPostingSaved = (pid: string, p: unknown) => boolean
let LW_POSTING: LwPostingSaved | null = null
export function setLwPostingProbe(fn: LwPostingSaved | null): void { LW_POSTING = fn }
/* HAS THIS MAN'S POSTING FAILED NOW (batch 1's second half §16 D10′ — R3-O11, R3-F7): the runner's own record — its
   command refused after its retry alone, or held for any reason but the last-admin lock (leavewar/sync.ts
   postingFailedNow) — with his squadron and the posting's key; null where it would run, is not due, or ran. Installed by
   leavewar/sync.ts; none installed, no posting-failed line passes */
type PostingFailed = (pid: string) => { unit: string; key: string } | null
let PO_FAILED: PostingFailed | null = null
export function setPostingFailedProbe(fn: PostingFailed | null): void { PO_FAILED = fn }
/* …AND IN ANOTHER SQUADRON'S STORED WAR (the reshape plan §6.2 A5, step 7 — core, phase 1): is this posting record his
   posting exactly as THAT squadron's stored profile row holds it? Installed by leavewar/sync.ts with the pass over every
   squadron (helper "war"). On a built site (the saved copy wired) a posting run through the second store is refused
   until it is installed: the gate never takes a posting it cannot check against the squadron that saved it. */
type LwxPostingSaved = (unit: string, pid: string, p: unknown) => boolean
let LWX_POSTING: LwxPostingSaved | null = null
export function setLwxPostingProbe(fn: LwxPostingSaved | null): void { LWX_POSTING = fn }
/* A7 — A WAR TAKES A MAN'S DAY ONLY WHERE THAT DAY IS ITS SQUADRON'S (the reshape plan §6.2 A7; his D2243: refused for
   everyone, master admins and Plan holders included; a removal never refused). The war's own door refuses such a day
   (helper "war", with A1); this is the gate's backstop, judging a record's CONTENTS before and after: a war cell holds a
   list (`lw.cell`, id `<period>:<pid>:<date>`), so taking one entry of two off is a put of the shorter list. A change
   about man P on day d where d is not this war's squadron's (his home on d, over the rows before the command) passes only
   where it removes and changes nothing else — a delete, or a list whose every entry left is one that stood, unchanged, in
   the same order. Any addition or change there is refused. So a 142 admin's Undo of his own earlier entry on a day now
   149's still works (Opus L3 of round 1; D148), and an Undo that would put leave back on such a day is refused (its words,
   "Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War.", are helper "war"'s, wired by "undo &
   roles"; until then the refusal reads as today's). THE PROBE: leavewar/sync.ts reads `(pid, iso)` off a war change — the
   war's own records, which only it knows; installed by helper "war" with A1, as one tested change. Until it is, this line
   judges nothing. The app itself is not asked, as nowhere else in 7b. */
export type LwManDay = (c: Change) => { pid: string; iso: string } | null
let LW_MAN_DAY: LwManDay | null = null
export function setLwManDayProbe(fn: LwManDay | null): void { LW_MAN_DAY = fn }
/* …AND THE LEAVE A WAR APPROVED, WHICH IS AN INPUT (the fix read of the reshape — opus-3 F2, F4; fable-3 F2; astra-3 F2;
   helper "warA7"). Leave approved on the war is stored as an Input carrying `lw` (and `lwU`, the squadron whose war approved
   it), so the line below, which reads war records, never judged it: approved leave slid onto a day now another squadron's,
   or put back there by an Undo, stood in the old war for anyone the Inputs rules let write it. THE PROBE: leavewar/sync.ts
   warLeaveAdds answers, over the WHOLE command, each (man, day) such leave covers after that it did not before — a medical
   splitting a leave, or a day taken off it, adds none — with the squadron stamped on it (`unit`; null, of before the stamp:
   the war loaded's). A day added whose squadron (his home on it, over the rows before the command) is not that war's is
   refused, whoever writes it, an Undo or Redo included — as the line below refuses a war cell's (D2243 Q3). Until the probe
   is installed this judges nothing. The app itself is not asked, as nowhere else in 7b. */
export type LwLeaveAdds = (changes: readonly Change[]) => ReadonlyArray<{ pid: string; iso: string; unit: string | null; id: string }>
let LW_LEAVE_ADDS: LwLeaveAdds | null = null
export function setLwLeaveAddsProbe(fn: LwLeaveAdds | null): void { LW_LEAVE_ADDS = fn }
function removesOnly(c: Change): boolean {
  const b: any = c.before ?? null, f: any = c.op === 'delete' ? null : c.after ?? null
  if (f == null || deepEqual(b, f)) return true
  if (!Array.isArray(b) || !Array.isArray(f)) return false
  let i = 0
  for (const x of f) {
    while (i < b.length && !deepEqual(b[i], x)) i++
    if (i === b.length) return false
    i++
  }
  return true
}
/* Admin → Users' doors, the only commands that write the second store (leavewar/sync.ts foreignOf's callers: Archive,
   Restore and Restore as — one type — and Delete) */
const LWX_DOORS = new Set(['person.archive', 'person.restore', 'person.delete'])
/* …and the three adds (batch 1's second half §4 item 7 — R-A3: the Home squadron Add a person names), which write there
   only the FIRST window of the man the command makes, in the squadron his new home names — never another man's, never
   a record beside it. Who may add to that squadron is homeUnitViolation's (an admin of the new man's home). */
const LWX_ADDS = new Set(['person.add', 'account.addNew', 'access.approveNew'])
function newManFirstWindow(env: CommitEnvelope, c: Change): boolean {
  if (c.collection !== 'lwx.profile' || c.before != null || c.op === 'delete' || c.after == null) return false
  const { unit, local } = split(String(c.id))
  const made = env.changes.some(p => p.collection === 'people' && p.before == null && String(p.id) === local)
  return made && !!unit && homeBefore(local, todayIso(), unitRowsBefore([])) === unit
}
function warUnitViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role === 'system') return null
  /* the second store's rows (`lwx.*`, A3 — leavewar/state/foreign.ts): another squadron's stored war, written by Admin →
     Users' three doors alone and never for the war loaded (job 2's security read, SEC-5: 142's plain admin wrote an
     Overseas Sqn posting for the master into 142's stored war through it, a posting 7b refuses on `lw.postouts`). Its
     posting window is judged below exactly as the war's own. */
  const fx = env.changes.filter(c => String(c.collection).startsWith('lwx.'))
  const u = lwUnitNow()
  /* (a member is refused every `lwx` row by section 7 — an admin's record — and is told so there) */
  for (const c of a.role === 'admin' ? fx : []) {
    const door = LWX_DOORS.has(env.type) || (LWX_ADDS.has(env.type) && newManFirstWindow(env, c))
    if (!door) return `another squadron's stored war written outside Admin → Users' doors, through the second store (${c.collection}/${c.id})`
    if (u && unitOf(String(c.id)) === u) return `the war loaded written through the second store (${c.collection}/${c.id})`
  }
  /* A7 — leave a war approved goes onto no day that is not that war's squadron's (the probe above) */
  if (u && LW_LEAVE_ADDS && env.changes.some(c => c.collection === 'inputs')) {
    const rows = unitRowsBefore(env.changes)
    for (const x of LW_LEAVE_ADDS(env.changes)) {
      const h = homeBefore(x.pid, x.iso, rows), w = x.unit ?? u
      if (h && h !== w) return `${x.pid}'s ${x.iso} is ${h}'s, not ${w}'s: its Leave War takes no leave there (inputs/${x.id})`
    }
  }
  const lw = env.changes.filter(c => String(c.collection).startsWith('lw.') && c.collection !== 'lw.current')
  if (!lw.length && !fx.length) return null
  if (u && lw.length) {
    const rows = unitRowsBefore(env.changes)
    const lv = levelInForce(a, u, todayIso(), rows)
    const ok = a.role === 'admin' ? lv === 'admin' : lv === 'member' || lv === 'admin'
    if (!ok) return `a change to another squadron's Leave War (${u}) by one with ${lv ? `${lv} rights` : 'no rights'} there`
    /* K5 — A TYPED FIGURE IS A MAN OF THIS WAR'S (the sign-in kinds review — D1695, D2197: his own leave figures stay in
       his own squadron): a balance written for a man who has a squadron and was never this war's squadron's — no stint in
       it, on any day, over the rows before the command — is refused, whoever types it (the war's own door says "That
       person is not on the Leave War", leavewar/state/store.ts balanceProblem). A removal is never refused. */
    for (const c of lw) {
      if (c.collection !== 'lw.balance' || c.op === 'delete' || c.after == null) continue
      const id = String(c.id), bpid = id.slice(0, id.lastIndexOf(':'))
      if (homeBefore(bpid, todayIso(), rows) && !everOfBefore(bpid, u, rows)) return `a balance typed for a man who is not this war's squadron's (${c.collection}/${c.id})`
    }
    /* A7 — a man's day that is not this war's squadron's only loses entries here (below) — a war cell's, and since the fix
       read of the reshape an OIL award's or any other ledger entry's (`lw.ledger`, read by the same probe: taking one away
       passes, giving or changing one does not — opus-3 F5, fable-3 F5) */
    if (LW_MAN_DAY) {
      for (const c of lw) {
        const at = LW_MAN_DAY(c)
        if (!at) continue
        const h = homeBefore(at.pid, at.iso, rows)
        if (h && h !== u && !removesOnly(c)) return `${at.pid}'s ${at.iso} is ${h}'s, not ${u}'s: its Leave War there only loses entries (${c.collection}/${c.id})`
      }
    }
  }
  const w = worldsOf(env)
  const before = w ? w.acctB : ACCOUNTS_LIST
  const masters = new Set(before.filter(x => x.master === true).map(x => String(x.pid)))
  if (!masters.size) return null
  const actorMaster = a.role === 'admin' && before.some(x => x.id === a.id && x.master === true)
  for (const c of [...lw, ...fx]) {
    const pid = c.collection === 'lwx.profile' ? split(String(c.id)).local : String(c.id)
    if ((c.collection !== 'lw.postouts' && c.collection !== 'lwx.profile') || !masters.has(pid)) continue
    const f: any = c.op === 'delete' ? null : c.after
    if (!f || JSON.stringify(c.before) === JSON.stringify(f)) continue
    const out = passOutcomeOf(f)
    if (out === 'delete') return `a Delete posting for a master admin (${c.collection}/${c.id})`
    if (out === 'overseas' && !actorMaster) return `an Overseas Sqn posting for a master admin by one who is not a master (${c.collection}/${c.id})`
  }
  return null
}
/* 7f. A SQUADRON'S TRACKER IS CHANGED ONLY BY ITS OWN PEOPLE (the second fix read, 18 Nov 26 — Fable's plan, still open 3).
   Each squadron keeps a Tracker of its own (D2167), but its record ids name none (`v3:<course>:<syllabus>:…` — the unit is
   added by its storage door, tracker/storage.js, on the squadron of his own pages), so the gate never knew
   whose Tracker a change was to. A doorway bound to another squadron's — the console's bindStorageUnit before the Tracker
   loads, as the Leave War's swap was for H2 — let 142's people change 149's. The Tracker tells the gate which squadron's
   is open (setTrkUnitProbe, installed by boot.ts from the doorway's own bound unit; none bound, nothing asked); every
   Tracker change then needs, there, admin from an admin in force and home or rights from a member — the same reading of
   the role in force as section 7. Everyone does everything inside his own Tracker (D121); the flex settings stay an
   admin's (below). Not asked of the app itself, nor of a pending person (refused everything below). */
let TRK_UNIT: LwUnit | null = null
export function setTrkUnitProbe(fn: LwUnit | null): void { TRK_UNIT = fn }
export const trkUnitNow = (): string | null => (TRK_UNIT ? TRK_UNIT() : null)
/* was a recorded step made in the admin's role (state/undo-wire.ts stepStuck asks — a role is read here, D200 (3)) */
export const madeAsAdmin = (actor: { role?: unknown } | null | undefined): boolean => !!actor && actor.role === 'admin'
function trkUnitViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || (a.role !== 'admin' && a.role !== 'member')) return null
  if (!env.changes.some(c => String(c.collection).startsWith('trk.'))) return null
  const u = trkUnitNow()
  if (!u) return null
  const lv = levelInForce(a, u, todayIso(), unitRowsBefore(env.changes))
  const ok = a.role === 'admin' ? lv === 'admin' : lv === 'member' || lv === 'admin'
  if (!ok) return `a change to another squadron's Tracker (${u}) by one with ${lv ? `${lv} rights` : 'no rights'} there`
  /* A TRACKER THAT IS NOT THE PAGE'S OWN SQUADRON TAKES NOTHING (fix read 2 — Astra 3's F3; his D2243 Q7, "nothing typed
     saved into either squadron"): the Tracker follows his pages (D2395), but stands on its old squadron while a move is
     running or chart work holds it (tracker/app/core.js followUnit; the midnight band says "This can't be saved in 142's
     Tracker") — and a moved MASTER admin is an admin of 142 still, so the line above let his changes into it under that
     band. A change by the person signed in on this page is refused while the Tracker bound is not the page's own squadron
     today (pageUnit('own') — the very test the band is drawn by, store.ts publishBands), master admins included: nothing
     still running on the squadron being left can write once the pick is made. A Tracker on the page's own squadron (the
     pick of a master admin or a Plan holder — D2197) passes. Another session's change arriving here is not this page's and
     is not asked. */
  if (SESSION && a.id === SESSION.user && env.origin !== 'remote' && u !== pageUnit('own', todayIso()))
    return `a change to a Tracker (${u}) that is not the page's own squadron today (${pageUnit('own', todayIso())})`
  return null
}
/* the stored accounts after the command, as the loader would read them — none stored is the seeded list */
function accountImagesNow(): any[] {
  const out: any[] = []
  for (const k of store.keys(ACCOUNT_ROW)) { const v = store.get(k, null); if (v) out.push(v) }
  return out.length ? out : seedAccounts()
}
/* an account row's image AFTER a command, read as the loader reads it. A row the command removed is the account GONE —
   unless no account row is left at all, when the loader reads the seeded list again (the Undo of the very first account
   write). Reading every removed row as its seed (accountBefore's rule for a row never written) let a plain admin's
   Delete take the master's account away unseen by the master check: the full check's security read, 18 Nov 26, F6. */
function accountAfter(id: string, c: Change): any {
  if (c.after != null) return c.after
  /* (a seeded account never stored, removed by the list's very first write, is gone too: before and after both empty) */
  const anyLeft = store.keys(ACCOUNT_ROW).some(k => store.get(k, null) != null)
  return anyLeft ? null : accountBefore(id, null)
}
/* does this command take the account row of `aid` away — there before it, gone after it (fix read 11, fault H) */
function accountGoesHere(env: CommitEnvelope, aid: string): boolean {
  const c = env.changes.find(x => x.collection === 'settings' && String(x.id) === ACCOUNT_ROW + aid)
  if (c) return accountBefore(aid, c.before) != null && accountAfter(aid, c) == null
  /* no change of that row (fix read 12, fault C — Fable F12-3): the accounts' very first write stores every seeded row it
     keeps and simply leaves out the one it drops, so the two lists are read as the loader reads them, as section 8 does —
     in the list before, not in the list after */
  const w = worldsOf(env)
  return !!w && w.acctB.some(x => x.id === aid) && !w.acctA.some(x => x.id === aid)
}
/* the person a sign-in belonged to before this command: its row's before-image, else the list as the loader read it */
function accountPidBefore(env: CommitEnvelope, aid: string): string | null {
  const c = env.changes.find(x => x.collection === 'settings' && String(x.id) === ACCOUNT_ROW + aid)
  const was: any = c ? accountBefore(aid, c.before) : worldsOf(env)?.acctB.find(x => x.id === aid)
  return was && was.pid != null ? String(was.pid) : null
}
/* DOES THIS COMMAND ITSELF DELETE THAT PERSON (fix read 12, fault A's immediate route — Astra 1 — and fault B): its own
   people change of him, there before and deleted after as the delete marks a man (person-delete.ts applyDelete: deleted,
   archived by 'del'); no sign-in left naming him after it; and the one who does it an admin of his squadron, as section 8
   reads it (his home today over the rows before; no home known — a shared store before its rows — nothing to judge). Read
   from the command's own records, never from its label: the Admin → Users Delete and a posting's Delete, run at once or
   by the pass, are the same act. */
function personDeletedHere(env: CommitEnvelope, pid: string | null, adminOfHome: (unit: string) => boolean, rows: UnitRows): boolean {
  if (!pid) return false
  const c = env.changes.find(x => x.collection === 'people' && String(x.id) === pid)
  if (!c) return false
  const b: any = c.before, f: any = c.op === 'delete' ? null : c.after
  if (!b || b.deleted === true || !f || f.deleted !== true || f.archived !== true || f.archivedBy !== 'del') return false
  const w = worldsOf(env)
  if (!w || [...w.rawA.values()].some(x => x && String(x.pid) === pid)) return false
  const u = homeBefore(pid, todayIso(), rows)
  return !u || adminOfHome(u)
}
/* DOES THIS COMMAND ITSELF ARCHIVE THAT PERSON (his D2311 — batch 1's second half, plan §4 item 8, R-O1, R-A4): its own
   people change of him, not archived before and archived after (Archive on Admin → Users, or an Overseas Sqn posting run
   at once inside the posting command), made by an admin of his squadron as section 8 reads it (his home today over the
   rows before; no home known — nothing to judge). Read from the command's own records, never its label. */
function personArchivedHere(env: CommitEnvelope, pid: string | null, adminOfHome: (unit: string) => boolean, rows: UnitRows): boolean {
  if (!pid) return false
  const c = env.changes.find(x => x.collection === 'people' && String(x.id) === pid)
  if (!c) return false
  const b: any = c.before, f: any = c.op === 'delete' ? null : c.after
  /* (a delete marks him archived too — its rights are judged by personDeletedHere alone, which also asks that no sign-in
     is left naming him: the archive's exception let fix read 12's forged delete with a new sign-in through) */
  if (!b || b.archived === true || !f || f.archived !== true || f.deleted === true || b.deleted === true) return false
  const u = homeBefore(pid, todayIso(), rows)
  return !u || adminOfHome(u)
}
/* THE TWO WORLDS OF A COMMAND — the people, the accounts and the unit rows BEFORE it against AFTER it, the accounts read
   by the loader's own reading (accounts.ts readAccounts: oldest first, one account an id, a sign-in name and a person, a
   deleted man's never) over the people of the same side (the second fix read, 18 Nov 26 — Fable's plan §1, C1/C2: the
   gate judged the rows a command wrote, raw, keyed by store key, while the loader kept other rows than it compared — a
   re-keyed row or a clashing sign-in name made a plain admin's write change Osprey, Kestrel or Saber unseen; and the
   last-admin lock and the master guard ran only when an account row was written, so a person-only delete or a home move
   went past both). Built once a command, whenever it changes a person, an account or a home. */
type Worlds = {
  personB: (pid: string) => any; personA: (pid: string) => any
  acctB: Account[]; acctA: Account[]
  rawB: Map<string, any>; rawA: Map<string, any>
  rowsB: UnitRows; rowsA: UnitRows
}
const WORLDS = new WeakMap<CommitEnvelope, Worlds | null>()
function worldsOf(env: CommitEnvelope): Worlds | null {
  if (WORLDS.has(env)) return WORLDS.get(env)!
  const people = env.changes.filter(c => c.collection === 'people')
  const touches = people.length > 0 || env.changes.some(c => c.collection === 'settings'
    && (String(c.id).startsWith(ACCOUNT_ROW) || String(c.id).startsWith(HOME_PFX)))
  if (!touches) { WORLDS.set(env, null); return null }
  const w = buildWorlds(env)
  WORLDS.set(env, w)
  return w
}
/* the two worlds, built for any command — worldsOf above builds them only for a command that changes a person, an
   account or a home; the last-admin lock (G3) asks them for a command that changes a right or adds a squadron too */
function buildWorlds(env: CommitEnvelope): Worlds {
  const people = env.changes.filter(c => c.collection === 'people')
  const was = new Map<string, any>(), is = new Map<string, any>()
  for (const c of people) {
    if (!was.has(String(c.id))) was.set(String(c.id), c.before ?? null)
    is.set(String(c.id), c.op === 'delete' ? null : c.after ?? null)
  }
  const personB = (pid: string) => (was.has(pid) ? was.get(pid) : (PEOPLE as any)[pid])
  const personA = (pid: string) => (is.has(pid) ? is.get(pid) : (PEOPLE as any)[pid])
  /* the stored rows on each side, by store key — none stored is the seeded list, keyed as the loader would write it */
  const m = new Map<string, any>()
  for (const k of store.keys(ACCOUNT_ROW)) { const v = store.get(k, null); if (v) m.set(k, v) }
  const mine = env.changes.filter(c => c.collection === 'settings' && String(c.id).startsWith(ACCOUNT_ROW))
  for (const c of mine) { if (c.before == null) m.delete(String(c.id)); else m.set(String(c.id), c.before) }
  const seeded = () => new Map<string, any>(seedAccounts().map(x => [ACCOUNT_ROW + x.id, x]))
  const rawB = m.size ? new Map(m) : seeded()
  for (const c of mine) { if (c.after == null) m.delete(String(c.id)); else m.set(String(c.id), c.after) }
  const rawA = m.size ? m : seeded()
  return {
    personB, personA,
    acctB: readAccounts([...rawB.values()], undefined, personB),
    acctA: readAccounts([...rawA.values()], undefined, personA),
    rawB, rawA,
    rowsB: unitRowsBefore(env.changes), rowsA: unitRowsAfter(env.changes),
  }
}
/* the store keys of a side's rows the loader would NOT keep (a row it drops, or one whose id is not its key) — a deleted
   man's account aside, which every reading drops on purpose */
function droppedKeys(raw: Map<string, any>, kept: Account[], person: (pid: string) => any): Set<string> {
  const out = new Set<string>()
  /* (each kept account by its id, the first of an id as `find` read it) */
  const byId = new Map<string, Account>()
  for (const y of kept) if (!byId.has(y.id)) byId.set(y.id, y)
  for (const [k, x] of raw) {
    if (x && typeof x.pid === 'string' && person(x.pid) && person(x.pid).deleted) continue
    const a = x && byId.get(x.id)
    if (!a || a.pid !== x.pid || a.name !== String(x.name ?? '').trim().toLowerCase() || k !== ACCOUNT_ROW + String(x.id)) out.add(k)
  }
  return out
}
const sameJson = (x: unknown, y: unknown) => JSON.stringify(x ?? null) === JSON.stringify(y ?? null)
/* the fields of a man's PERSON that make his account what it is — his callsign (his name on every sign-in line), and
   whether he is on the roster at all. D2205 rules a master's ACCOUNT a master's alone; his qualifications, CAT and the
   rest of his Quals row stay any admin of his squadron's, as every man's are (D218) — the builder's reading, said in the
   evidence sheet: Fable's plan read every field of his person as the master's alone */
const ACCOUNT_LIKE = (p: any) => JSON.stringify(p == null ? null : [p.cs, !!p.archived, !!p.deleted, !!p.special])

/* G0 — THE ROWS' SHAPE: an account row's id is its key, and every row the command leaves is one the loader keeps (the second
   fix read — security H1, Astra 2: a row put under Ranger's key carrying Osprey's id made Osprey 149's admin; a sign-in
   name renamed onto Kestrel's dropped Kestrel's account on the next load). G1 — A MASTER'S ACCOUNT IS A MASTER'S ALONE
   (his D2205, 18 Nov 26; security H4): a master's account as the loader reads it — changed, gone, or his person renamed,
   archived, deleted or made a placeholder — only by a master; his person deleted by nobody. The mark itself keeps its
   own rules in section 6. Every actor but the app itself. */
/* A RIGHT'S DAY — ONE RULE FOR A COMMAND AND FOR AN UNDO OR REDO (fix read 9, fault A — Fable 1, the fresh Opus read's
   O9-2; his D2218, D2223). The bell's move-day test counts a grant from its `from` and the master mark from its
   `masterFrom` (notices.ts adminThen): a man moved squadron loses the lines of a squadron he held no right in on his move
   day. A right turned ON is a right given today, whoever turns it on — a command, or an Undo or Redo pressed after the
   move putting back a right taken off before it (the recorded day brought the retired line back). A right that stands
   unchanged keeps its day. These two say "unchanged"; the gate (unitRowViolation, accountShapeAndMasterViolation) and the
   restore's own writing (restoreRedated) both ask them, so the restore never writes what the gate refuses. */
/* (fix read 9, fault C — the security read's SEC9-1): "unchanged" is the SAME right in the same hands — a grant's account,
   unit and level all as before, the mark's row still naming the same person. A 142 admin re-pointing Kestrel's Plan of
   142 (dated 15 Jul) to a moved Hunter on 18 Jul, same level, had kept the 15 Jul day and brought his retired line back;
   a right that changes hands is a right given today. */
export const grantKept = (b: any, n: any): boolean => b != null && n != null && b.account === n.account && b.unit === n.unit && b.level === n.level
export const masterKept = (was: any, is: any): boolean => !!was && !!is && was.master === true && is.master === true && String(was.pid) === String(is.pid)
/* A RIGHT'S MOMENT (batch 1's second half, plan §16 D1′): a moment written now — the clock's slack the bell lines' own
   (notices.ts AT_SLACK_MS) */
const momentNow = (x: unknown): boolean => typeof x === 'number' && Number.isFinite(x) && Math.abs(x - Date.now()) <= AT_SLACK_MS
const keptKey = (k: unknown): string => (k && typeof k === 'object' ? JSON.stringify(Object.entries(k).sort(([x], [y]) => (x < y ? -1 : 1))) : '')
/* the moments of one account row a command writes (G2c, in accountShapeAndMasterViolation): the reason it is refused, or
   null. `was` the row before (none: a new account), `relinked` the row now naming another man (a right that changes hands
   is a right begun now) */
function momentsViolation(was: any, is: any, relinked: boolean, env: CommitEnvelope): string | null {
  const adminBegun = !was || relinked || was.role !== 'admin' || was.adminOf !== is.adminOf || was.adminFrom !== is.adminFrom
  if (is.role !== 'admin') { if (is.adminAt !== undefined) return "an admin role's moment on an account that is not an admin's" }
  else if (adminBegun) { if (!momentNow(is.adminAt)) return 'an admin role not dated now' }
  else if (is.adminAt !== was.adminAt) return "an admin role's moment changed"
  if (is.master !== true) {
    if (is.masterAt !== undefined || is.kept !== undefined) return "the master mark's moment without the mark"
    return null
  }
  if (!was || relinked || was.master !== true) {
    if (!momentNow(is.masterAt)) return 'the master mark not dated now'
    if (is.kept === undefined) return null
    if (!is.kept || typeof is.kept !== 'object' || Array.isArray(is.kept) || !Object.keys(is.kept).length) return 'kept squadrons that will not read'
    /* each one a squadron he held Plan of before this command, with that Plan's own moment (0: one from before moments) */
    const rows = unitRowsBefore(env.changes), today = todayIso()
    const holder = accountHolder(env, String(is.id), 'b')
    for (const [u, v] of Object.entries(is.kept)) {
      const g = grantBefore(holder, u, today, rows)
      if (!g || g.level !== 'admin' || v !== (Number.isFinite(g.fromAt) ? g.fromAt : 0)) return 'a squadron kept that he held no Plan of'
    }
    return null
  }
  if (is.masterAt !== was.masterAt) return "the master mark's moment changed"
  if (keptKey(is.kept) !== keptKey(was.kept)) return 'kept squadrons changed'
  return null
}
/* …and the restore writes it so: an Undo or Redo whose image turns a right on dates it today (installed in
   undo-wire.ts as the timeline's `redate` hook, before the restore is named for verifiedReplay, so the image the
   timeline vouches for IS the one written); one that leaves a right standing keeps the day it has now. */
/* …save a right put back where none stands whose man has not moved squadron since it went off (fix read 10, fault E —
   the fresh Opus read's O10-1, Fable's F10-5): a mark or Plan taken off by mistake after a move and undone at once is
   the world as it was, so it keeps its recorded day and the line it kept on the move day; a move between the day it
   went off and today makes it a right given today (fix read 9's F1, F1b, O9-2). `offAt`: an Undo's step moment, a Redo's
   Undo moment (undo/timeline.ts restoreOffAt); none — today. The gate asks the same of the restore it judges. */
type OffAtProbe = (env: CommitEnvelope) => number | undefined
let OFFAT: OffAtProbe | null = null
export function setRestoreOffAt(fn: OffAtProbe | null): void { OFFAT = fn }
/* (fix read 11, fault G): which way the restore being judged runs (undo/timeline.ts restoreDir) */
type DirProbe = (env: CommitEnvelope) => 'undo' | 'redo' | undefined
let RDIR: DirProbe | null = null
export function setRestoreDir(fn: DirProbe | null): void { RDIR = fn }
function restoredDayHolds(pid: unknown, offAt: number | undefined, homes = unitRowsBefore([]).homes): boolean {
  if (offAt == null || pid == null || pid === '') return false
  const off = dayOfAt(offAt), today = todayIso()
  /* no move of his since it was taken off — the home handle's second question (the reshape plan §3.2 A-i): a change is
     his resolved squadron differing from the day before, never a row's date as such (the baseline row setHome writes for
     a demo man with none is no move) */
  return !homeChangesBefore(String(pid), off, today, { units: [], places: [], unitplaces: [], grants: [], homes }).length
}
const pidOfAccount = (id: unknown): string | undefined => ACCOUNTS_LIST.find(x => x.id === String(id))?.pid
/* GUARDRAIL 2's question (the reshape plan §4.3): has this account's man changed squadron since a right of his started on
   `from` (the later of it and the account's link day) — over the rows as they stand */
function movedSinceStart(account: unknown, from: unknown, rows: UnitRows = unitRowsBefore([])): boolean {
  const a: any = ACCOUNTS_LIST.find(x => x.id === String(account))
  if (!a || a.pid == null) return false
  return homeChangesBefore(String(a.pid), grantStart({ from: typeof from === 'string' ? from : undefined }, a.pidFrom), todayIso(), rows).length > 0
}
/* the master mark put back on the same person's account, off since `offAt`, with no move of his since */
const markBackHolds = (was: any, is: any, offAt: number | undefined, homes?: Parameters<typeof restoredDayHolds>[2]): boolean =>
  !!was && was.master !== true && !!is && is.master === true && String(was.pid) === String(is.pid) && restoredDayHolds(is.pid, offAt, homes)
/* (fix read 11, fault G — F11-5b): a right put back where none stands — or the same account's right in the same squadron
   put back from below admin to admin (Plan turned to View, then undone) — off since `offAt`, its man not moved since */
const grantBackHolds = (b: any, n: any, offAt: number | undefined, homes?: Parameters<typeof restoredDayHolds>[2]): boolean =>
  (b == null || (b.account === n.account && b.unit === n.unit && b.level !== 'admin' && n.level === 'admin'))
  && restoredDayHolds(pidOfAccount(n.account), offAt, homes)
/* (fix read 11, fault G — F11-6): an UNDO putting an account back on the person its recorded image names (a re-link by
   mistake, undone), that man not moved since the step — it keeps the link's and the mark's recorded days. Not a Redo:
   a Redo of a re-link makes the re-link again, dated today (fix read 10's F10-4) */
const relinkBackHolds = (was: any, is: any, offAt: number | undefined, dir: 'undo' | 'redo' | undefined, homes?: Parameters<typeof restoredDayHolds>[2]): boolean =>
  dir === 'undo' && !!was && !!is && String(was.pid) !== String(is.pid) && restoredDayHolds(is.pid, offAt, homes)
/* (fix read 12, fault E — Astra 2): A REPEATED UNDO / REDO. The day kept above is the image's, recorded when the step was
   made; but an earlier restore may have given the right a LATER day (a move fell while it was off: dated that restore's
   today), and a Redo then took it away again. The restore reversing that Redo — or that Undo — is handed the right as it
   stood just before (`stood`, undo/timeline.ts stoodBefore), and where the day is kept it puts back THAT day, for the
   same right only: a grant of the same account, squadron and level; the mark or the link on the same person. A move
   while it was off still dates it today (restoredDayHolds), and a Redo of a re-link stays today (relinkBackHolds). */
const stoodGrant = (s: any, n: any): any => (s && s.account === n.account && s.unit === n.unit && s.level === n.level ? s : null)
const stoodOnSame = (s: any, n: any): any => (s && String(s.pid) === String(n.pid) ? s : null)
/* what a restore of `c` would take away or change, as it stands now: a right's or a sign-in's row (the timeline keeps it
   for the restore that reverses this one) */
export function restoreStood(c: Change): unknown {
  if (c.collection !== 'settings') return undefined
  const id = String(c.id)
  if (!id.startsWith(GRANT_PFX) && !id.startsWith(ACCOUNT_ROW)) return undefined
  const v: any = store.get(id, null)
  return id.startsWith(ACCOUNT_ROW) ? accountBefore(id.slice(ACCOUNT_ROW.length), v) ?? null : v ?? null
}
export function restoreRedated(c: Change, offAt?: number, dir?: 'undo' | 'redo', stood?: unknown): Change {
  if (c.collection !== 'settings' || c.op !== 'put' || c.after == null) return c
  const id = String(c.id), n: any = c.after, today = todayIso()
  if (id.startsWith(GRANT_PFX)) {
    const b: any = store.get(id, null)
    const recorded = stoodGrant(stood, n)?.from ?? n.from
    /* GUARDRAIL 2 (the reshape plan §4.3): a right whose man has moved since it went off is never re-dated today — that
       would restart a right his move ended. It keeps its recorded day, so it holds nothing (units-model.ts grantOn); the
       leave-out (restoreLeavesOut, wired by helper "undo & roles") takes it out of the restore and blocks the step. */
    const from = grantKept(b, n) ? b.from : grantBackHolds(b, n, offAt) || movedSinceStart(n.account, recorded) ? recorded : today
    return n.from === from ? c : { ...c, after: { ...n, from } }
  }
  if (id.startsWith(ACCOUNT_ROW)) {
    const was: any = accountBefore(id.slice(ACCOUNT_ROW.length), store.get(id, null))
    let out: any = n
    const back = relinkBackHolds(was, n, offAt, dir)
    const prior = stoodOnSame(stood, n)
    /* (fix read 12, fault E): the re-link undone again after a Redo — the link's day as the earlier Undo gave it */
    if (back && prior && out.pidFrom !== prior.pidFrom) {
      const { pidFrom: _drop, ...rest } = out
      out = prior.pidFrom === undefined ? rest : { ...rest, pidFrom: prior.pidFrom }
    }
    /* (fix read 10, fault D): a row put back linked to another person than the stored row names is linked today —
       save one put back on its recorded man with no move of his since (fix read 11, fault G), which keeps its image */
    if (!back && was && String(was.pid) !== String(n.pid) && n.pidFrom !== today) out = { ...out, pidFrom: today }
    /* (fix read 11, fault F — F11-4): …and one put back on the same person keeps the link's day as it STANDS — an older
       step's image (a rename made before a re-link and its Undo) put back its own older day, or none, and a line the
       man's move had retired came back */
    else if (was && String(was.pid) === String(n.pid) && n.pidFrom !== was.pidFrom) {
      const { pidFrom: _drop, ...rest } = out
      out = was.pidFrom === undefined ? rest : { ...rest, pidFrom: was.pidFrom }
    }
    if (n.master === true) {
      const masterFrom = masterKept(was, n) ? was.masterFrom
        : markBackHolds(was, n, offAt) || back ? (prior?.master === true ? prior.masterFrom : n.masterFrom) : today
      if (out.masterFrom !== masterFrom) out = { ...out, masterFrom }
    }
    return out === n ? c : { ...c, after: out }
  }
  return c
}
/* AN ACCOUNT AS THE READING RULE TAKES IT, BEFORE OR AFTER A COMMAND (the reshape plan §4.3): its row as this command
   changed it — before-image or after-image, read as the loader reads them — else the stored list; its man and its link
   day. An account that is gone has no man: a right naming it holds for nobody a person can use. */
function accountHolder(env: CommitEnvelope, id: string, side: 'b' | 'a'): GrantHolder {
  const c = env.changes.find(x => x.collection === 'settings' && String(x.id) === ACCOUNT_ROW + id)
  const x: any = c ? (side === 'b' ? accountBefore(id, c.before) : accountAfter(id, c)) : accountImagesNow().find(y => y && y.id === id)
  return { id, pid: x && x.pid != null ? String(x.pid) : '', pidFrom: x?.pidFrom }
}
/* DOES THIS COMMAND CHANGE THAT ACCOUNT'S MAN — G4's own test (fix read 10, fault D; fix read 11, fault E): its row there
   before and after naming another person, or a new row under an id a right standing before still names */
function accountRelinked(env: CommitEnvelope, id: string): boolean {
  const c = env.changes.find(x => x.collection === 'settings' && String(x.id) === ACCOUNT_ROW + id)
  if (!c) return false
  const was: any = accountBefore(id, c.before), is: any = accountAfter(id, c)
  if (!is) return false
  return was ? String(was.pid) !== String(is.pid) : unitRowsBefore(env.changes).grants.some(g => g.account === id)
}
/* the command makes an admin's account a member's, the same man kept (his D2250 — the member's drop, unitRowViolation) */
function accountMadeMember(env: CommitEnvelope, id: string): boolean {
  const c = env.changes.find(x => x.collection === 'settings' && String(x.id) === ACCOUNT_ROW + id)
  if (!c) return false
  const was: any = accountBefore(id, c.before), is: any = accountAfter(id, c)
  return !!was && !!is && String(was.pid) === String(is.pid) && was.role === 'admin' && is.role !== 'admin'
}
/* GUARDRAIL 2 — NO RESTORE EVER PUTS BACK A RIGHT WHOSE MAN HAS MOVED SINCE ITS START, AND A RE-LINK PUTS BACK NO RIGHT
   (the reshape plan §4.3 — the host's decisions after round 3; Fable 1, Astra 1, Opus M3 of round 2; Astra 1, Fable 7 of
   round 3). ONE BODY, asked by the restore (the timeline's `leaveOut` hook — wired by helper "undo & roles", which keeps on
   each step the man and the link day of each grant row's account as it was recorded) and by the gate of the restore it
   judges. True: leave this change OUT of the restore. In an Undo or a Redo:
   1. a step that changed an account's man (a re-link, its Undo, its Redo) puts back NO grant row — the link only
      (guardrail 1);
   2. any other grant row is put back only where its account still names the man it named when the step was made
      (`holder`, recorded on the step), and that man's squadron has not changed since the row's START — the row judged as
      it stood when it was taken off (`stood`, the timeline's stoodBefore, else the step's image) and the account's link day
      as it stood at the step. A move is on a day already begun and never changes, so the answer never changes either, in
      any order of Undo and Redo;
   3. it never removes a grant row not stored;
   4. a Plan row (level `admin`) is put back only where the restore's maker may give Plan of that row's squadron as he
      stands today (`mayPlan` — asked by the gate and the timeline's hook, for that row's squadron: its own admins or a
      master admin, his D2626 — U2, replacing "only a master admin's restore"). It FAILS CLOSED: not handed in reads as
      "may not". The one put-back this leaves out rather than refuses (the plan §19.2's replay rule (c); the security
      check's F1): the Plan row in the Undo of a "made a member", where the presser may make the man an admin again but may
      not give that Plan — the role comes back, the Plan does not (his D2250; chat 129's reading, told him). Every other
      Plan put-back by one who may not is refused whole before it reaches here (state/undo-wire.ts planRestoreStuck).
   Not a grant row: never left out here. `stored` — whether the row is stored now (the caller's; read from the store when
   not handed in). */
export interface RestoreGrantCtx { relink: boolean; holder?: GrantHolder; stood?: unknown; stored?: boolean; mayPlan?: boolean }
export function restoreLeavesOut(c: Change, ctx: RestoreGrantCtx, rows: UnitRows = unitRowsBefore([]), today: string = todayIso()): boolean {
  if (c.collection !== 'settings' || !String(c.id).startsWith(GRANT_PFX)) return false
  if (!(c.op === 'put' && c.after != null)) return !(ctx.stored ?? store.get(String(c.id), null) != null)
  if (ctx.relink) return true
  if (ctx.mayPlan !== true && (c.after as any).level === 'admin') return true
  const n: any = c.after
  const s: any = stoodGrant(ctx.stood, n) ?? n
  const now: any = accountImagesNow().find(y => y && y.id === String(n.account))
  const h = ctx.holder ?? (now ? { id: String(n.account), pid: String(now.pid), pidFrom: now.pidFrom } : undefined)
  if (!h || !now || String(now.pid) !== h.pid) return true
  return homeChangesBefore(h.pid, grantStart(s, h.pidFrom), today, rows).length > 0
}
/* WHAT THE GATE KNOWS OF A RESTORE'S STEP (helper "undo & roles" installs it with the leave-out's wiring: the step's
   recorded holders and the row as it stood). Until then the gate reads the restore alone — whether it changes the
   account's man, and the account as it stands — and the row's start as the restore writes it (restoreRedated keeps the
   recorded day for a right whose man has moved, so a move since its start is seen). */
type RestoreCtxProbe = (env: CommitEnvelope, c: Change) => RestoreGrantCtx | null
let RESTORE_CTX: RestoreCtxProbe | null = null
export function setRestoreGrantCtx(fn: RestoreCtxProbe | null): void { RESTORE_CTX = fn }
function restoreGrantCtx(env: CommitEnvelope, c: Change): RestoreGrantCtx {
  const got = RESTORE_CTX ? RESTORE_CTX(env, c) : null
  if (got) return got
  const acc = String((c.after as any)?.account ?? (c.before as any)?.account ?? '')
  return { relink: !!acc && accountRelinked(env, acc), stored: true }
}
/* a NEW account row (none stood under its id) whose id a right standing before the command still names (fix read 11,
   fault E — SEC11-5) */
const rightNamesNew = (w: Worlds, c: Change, was: any): boolean => {
  if (was || c.after == null) return false
  const id = String(c.id).slice(ACCOUNT_ROW.length)
  return w.rowsB.grants.some(g => g.account === id)
}
/* A DELETE IS FINAL (fix read 13, item D (1) — Astra's lead: "a command can revive a deleted person"; his D350: no Undo
   takes a delete back; D290, D297: his row stays, marked deleted, never erased). No screen brings a deleted man back
   (Restore refuses him, the Undo button skips his delete), but nothing in the gate held it: 149's admin who deleted a
   149 man, or any admin of his squadron, a master too, raised a person command that cleared the mark, and the man was
   back on the roster, free to be given a new sign-in. So a person row deleted before the command keeps its mark and its
   date after it, and is never removed — for every actor, the app's own pass included.
   (fix read 14, item D — Astra A3): the delete writes four marks (person-delete.ts deletePerson: `deleted`, `deletedFrom`,
   `archived`, `archivedBy: 'del'`), and every roster filter that hides him — Quals among them (ui/QualsPage.tsx lists every
   man not archived) — reads `archived`, not `deleted`. Holding only the first two let a people edit clear his archive mark
   and put him back on Quals. So all four stand as they were before the command. */
const DELETE_MARKS = ['deletedFrom', 'archived', 'archivedBy'] as const
function deletedPersonViolation(env: CommitEnvelope): string | null {
  for (const c of env.changes) {
    if (c.collection !== 'people') continue
    const b: any = c.before
    if (!b || typeof b !== 'object' || b.deleted !== true) continue
    const f: any = c.op === 'delete' ? null : c.after
    if (!f || typeof f !== 'object' || f.deleted !== true || DELETE_MARKS.some(k => JSON.stringify(f[k] ?? null) !== JSON.stringify(b[k] ?? null))) return `a deleted person brought back (people/${c.id})`
  }
  return null
}
/* WHERE A SCHEDULER TICK WAS GIVEN IS WRITTEN ONLY AS IT IS (fix read 2 — Opus 2's F2, Fable 2's F3, the security read's 2;
   his D2160: the tick ends in the old squadron on the move's date, and the squadron joined ticks him anew). The record
   (`schedOf`, `schedFrom` — units-model.ts schedTickHolds) was held only against a member's own row, so 142's admin
   moved his man to 149 from tomorrow and wrote his tick as "given in 149, from the move day": he arrived carrying 149's
   Scheduler tick that no admin of 149 gave. Held as K3 holds the admin role's record, for every actor but the app: the
   record is a ticked person's alone; it stands unchanged, or is absent (the plain reading: his first squadron, while he
   has never moved), or names the squadron he is in TODAY, from today (state/quals-write.ts writes it so). The Undo of an
   untick puts back the record its step took away: the timeline's own restore of his own step (REPLAY answers only then —
   this check asks only that a replay is under way, not whether it vouches for the row — which since chat 155 it can, image
   for image, for the member's own SANS days) may write an earlier day, never a later one, with the squadron he was
   in on that day — a record of a squadron he has left since holds nothing by the reading rule. */
function schedRecordViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role === 'system') return null
  const today = todayIso()
  const takeBack = env.origin === 'restore' && !!REPLAY && REPLAY(env) != null
  const rec = (x: any) => JSON.stringify([x?.schedOf ?? null, x?.schedFrom ?? null])
  for (const c of env.changes) {
    if (c.collection !== 'people' || c.op === 'delete' || c.after == null || typeof c.after !== 'object') continue
    const was: any = c.before, is: any = c.after
    if (is.schedOf == null && is.schedFrom == null) continue
    if (was && typeof was === 'object' && rec(was) === rec(is) && !!was.quals?.sched === !!is.quals?.sched) continue
    if (!is.quals?.sched) return `where a Scheduler tick was given, on a person with no tick (people/${c.id})`
    if (is.schedOf == null) return `a Scheduler tick's day with no squadron (people/${c.id})`
    const from = is.schedFrom
    const dayOk = typeof from === 'string' && ISO_DAY.test(from) && (takeBack ? from <= today : from === today)
    /* (a man this command makes is read over the rows it leaves, as K3 reads him) */
    const rows = unitRowsBefore(was == null ? [] : env.changes)
    if (!dayOk || is.schedOf !== homeBefore(String(c.id), from, rows)) return `a Scheduler tick recorded as given in a squadron he is not in today, or on another day (people/${c.id})`
  }
  return null
}
function accountShapeAndMasterViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role === 'system') return null
  const w = worldsOf(env)
  if (!w) return null
  for (const c of env.changes) {
    if (c.collection !== 'settings' || !String(c.id).startsWith(ACCOUNT_ROW) || c.after == null) continue
    if (ACCOUNT_ROW + String((c.after as any).id) !== String(c.id)) return `an account row whose id is not its key (${c.id})`
  }
  /* G2 — THE MASTER MARK'S DAY IS THE DAY IT WAS SET (fix read 8, fault G — Fable's 1 step 2, the security read's SEC8-3,
     the fresh Opus read's 3): the bell's move-day test counts the mark from its day (notices.ts adminThen, his D2218,
     D2223), and nothing checked the day a command wrote, so a mark back-dated brought back a line a man's move had
     retired. Set now: dated today; off: no day; otherwise the day it had. A restore's verified replay puts back the
     very image its step recorded. */
  const today = todayIso()
  for (const c of env.changes) {
    if (c.collection !== 'settings' || !String(c.id).startsWith(ACCOUNT_ROW) || c.after == null) continue
    const was: any = c.before != null ? c.before : accountBefore(String(c.id).slice(ACCOUNT_ROW.length), null)
    const is: any = c.after
    /* K2 — ONLY AN ADMIN CARRIES THE MASTER MARK (his D2260, 21 Nov 26): no command, whoever makes it, leaves an account
       whose role is not admin carrying the mark — a master admin made a member reached every squadron still, and counted
       as a master admin left. The mark comes off first, by its own command (accounts.ts setMaster, updateAccount). */
    if (is.master === true && is.role !== 'admin') return `the master mark on an account that is not an admin's (${c.id})`
    /* K3 — WHERE AN ADMIN ROLE WAS GIVEN IS WRITTEN ONLY AS IT IS (his D2160 — a man who moves squadron joins as a member;
       units-model.ts adminRoleHolds): the record is an admin's row's alone; it stands unchanged on the same man, or is
       absent (the plain reading: his first squadron, while he has never moved), or names the squadron he is in TODAY, from
       today — so nobody is made an admin of a squadron he is not in, to arrive there as one by a move (K4: the squadron
       joined is never asked). A restore's verified replay puts back the image its step recorded: a record of a squadron
       he has left since holds nothing by the reading rule. */
    {
      const rec = (x: any) => (x && x.role === 'admin' && x.adminOf != null ? JSON.stringify([x.adminOf, x.adminFrom ?? null]) : '')
      if (is.role !== 'admin' && (is.adminOf != null || is.adminFrom != null)) return `where an admin role was given, on an account that is not an admin's (${c.id})`
      if (is.role === 'admin' && is.adminOf == null && is.adminFrom != null) return `an admin role's day with no squadron (${c.id})`
      const keptRec = !!was && String(was.pid) === String(is.pid) && rec(was) === rec(is)
      if (rec(is) && !keptRec && !(env.origin === 'restore' && REPLAY != null && !!REPLAY(env)?.(c))) {
        const pid = String(is.pid)
        const homeNow = homeBefore(pid, today, w.personB(pid) == null ? w.rowsA : w.rowsB)
        if (is.adminFrom !== today || is.adminOf !== homeNow) return `an admin role recorded as given in a squadron he is not in today, or on another day (${c.id})`
      }
    }
    /* (fix read 9, fault A — Fable 1, Opus O9-2): the day is kept only where the mark stood before and after
       (masterKept). A mark turned on, by a command or by an Undo or Redo, is dated today: an Undo or Redo pressed after a
       move putting back the recorded day brought back a line the move had retired (D2218, D2223). So the replay
       exemption holds only where the mark stands unchanged; the restore itself writes today's day (restoreRedated), so
       it is never refused. */
    const kept = masterKept(was, is)
    /* G2b — THE LINK'S DAY IS THE DAY IT WAS MADE (fix read 10, fault D — O10-4, F10-4): a right held through the account
       counts from the day the account was linked to its person (notices.ts adminThen), so a re-link is dated today and a
       link unchanged keeps its day; a new account, linked to nobody before, may carry today's day or none (D56: a row
       with no day counts from always). A restore's verified replay that keeps the link puts back its recorded image. */
    /* (fix read 11, fault E — SEC11-5): a NEW account row under an id a standing right still names is a re-link too —
       the right would pass to the person it names now — so it is dated today, never "from always" */
    const relinked = (!!was && String(was.pid) !== String(is.pid)) || rightNamesNew(w, c, was)
    const replayed = env.origin === 'restore' && REPLAY != null && !!REPLAY(env)?.(c)
    /* (fix read 11, fault F — F11-4): a restore's replay is held to this too — the restore writes the day as it stands
       (restoreRedated), so an older step's image never puts back an older day */
    /* (fix read 11, fault G — F11-6): save the verified replay putting the account back on the man its recorded image
       names, with no move of his since the step — it keeps that image's link and mark days, as the restore writes them */
    const back = replayed && relinkBackHolds(was, is, OFFAT?.(env), RDIR?.(env), w.rowsB.homes)
    if (!back) {
      const wantLink = relinked ? today : !was ? (is.pidFrom === undefined ? undefined : today) : was.pidFrom
      if (is.pidFrom !== wantLink) return `an account's link to its person not dated today (${c.id})`
    }
    /* G2c — THE MOMENTS ARE THE MOMENTS THE RIGHTS BEGAN (batch 1's second half, plan §16 D1′, D1′a — his D2310, D2218,
       D2198): the bell shows a squadron's admin line only where the right its reader holds there began no later than the
       line (notices.ts rightStart), so a back-dated moment would bring back the lines of a right taken away. The home
       admin role begun now (made an admin, its record written anew, a re-link, a new admin account) carries now; unchanged,
       its moment; not an admin, none. The mark the same. `kept` only with the mark: written with the mark set now, each
       entry one squadron he held Plan of before this command, with that Plan's own moment; the mark unchanged, as it
       was. A restore's verified replay puts back its image whole (an Undo of the take-away brings the lines back). Asked
       last, after the days, so a row refused for its days is refused in those words first. */
    const moments = replayed ? null : momentsViolation(was, is, relinked, env)
    /* (fix read 10, fault E): a mark put back on the same person, off since a moment with no move of his since, keeps its
       recorded day — the restore writes it so (restoreRedated); the gate asks the same of the same moment */
    if (replayed && (is.master !== true || kept || back || markBackHolds(was, is, OFFAT?.(env), w.rowsB.homes))) continue
    const want = is.master !== true ? undefined : kept ? was.masterFrom : today
    if (is.masterFrom !== want) return `the master mark not dated today (${c.id})`
    if (moments) return `${moments} (${c.id})`
  }
  const droppedB = droppedKeys(w.rawB, w.acctB, w.personB)
  for (const k of droppedKeys(w.rawA, w.acctA, w.personA)) if (!droppedB.has(k)) return `an account row the app would not load (${k})`
  const actorMaster = a.role === 'admin' && w.acctB.some(x => x.id === a.id && x.master === true)
  const afterById = new Map<string, Account>()
  for (const x of w.acctA) if (!afterById.has(x.id)) afterById.set(x.id, x)
  for (const m of w.acctB.filter(x => x.master === true)) {
    const now = afterById.get(m.id)
    const pb = w.personB(m.pid), pa = w.personA(m.pid)
    if (pb && !pb.deleted && pa && pa.deleted) return `a master admin's person deleted (people/${m.pid})`
    /* (the blind read's R1 — D2205): a master admin's squadron is his account's too — his home rows compared, before and
       after */
    const homesOfM = (r: UnitRows) => JSON.stringify(r.homes.filter(h => String(h.pid) === String(m.pid)).map(h => [h.id, h.unit, h.from]).sort())
    if (sameJson(m, now) && ACCOUNT_LIKE(pb) === ACCOUNT_LIKE(pa) && homesOfM(w.rowsB) === homesOfM(w.rowsA)) continue
    if (!actorMaster) return `a master admin's account changed by one who is not a master (${ACCOUNT_ROW}${m.id})`
  }
  /* G4 — A RIGHT IN ANOTHER SQUADRON CHANGES HANDS ONLY BY A MASTER (fix read 10, fault D — the agent's reading of D2094 /
     D2199, "an admin of a squadron is made only by its own admins or a master admin"): re-linking an account that holds a
     grant in a squadron the actor is no admin of hands that right to another person, so only a master does it (Kestrel,
     149's admin, re-linking Osprey's account holding Plan of 142 to Hunter made Hunter 142's admin). accounts.ts
     relinkRightsProblem says the same at the door. */
  /* (the reshape plan §4.3, guardrail 1, refined by the Plan audit's PA3 — D2199, D2201, D2241): only rights HOLDING today
     on the rows before decide; a sign-in holding a Plan is re-linked only by a master admin (the drop takes it, and taking
     Plan is a master admin's alone); one holding a View, by an admin of that squadron — at home or by Plan — or a master
     admin. accounts.ts relinkRightsProblem says the same at the door. */
  /* (U2 — his D2626, D2730 Q12): the re-link drops the Plan, and ending Plan of a squadron is its own admins' or a master
     admin's — so a sign-in holding a Plan is re-linked by one who may give that Plan (the one rule, mayGivePlanOf, as the
     actor stood before the command), no longer a master admin alone. The View case is unchanged. */
  if (!actorMaster) {
    for (const c of env.changes) {
      if (c.collection !== 'settings' || !String(c.id).startsWith(ACCOUNT_ROW) || c.after == null) continue
      const id = String(c.id).slice(ACCOUNT_ROW.length)
      const was: any = c.before != null ? c.before : accountBefore(id, null)
      /* (fix read 11, fault E): only the same person kept is no re-link — a new row under an id a right still names is
         one (Kestrel deleting his man who held Plan of 142, then a new account under that id for another 149 man) */
      if (was ? String(was.pid) === String((c.after as any).pid) : !rightNamesNew(w, c, was)) continue
      const holder = accountHolder(env, id, 'b')
      for (const g of w.rowsB.grants) {
        if (g.account !== id || !grantRowHolds(holder, g, today, w.rowsB)) continue
        if (g.level === 'admin' ? !mayGivePlanOf(g.unit, planActorOf(env), w.rowsB, today) : levelInForce(a, g.unit, today, w.rowsB) !== 'admin') return `a sign-in holding a right in another squadron re-linked by one who may not end it (${c.id})`
      }
    }
  }
  /* THE RE-LINK LINE — A SIGN-IN LINKED TO ANOTHER PERSON CARRIES NO RIGHT (guardrail 1, the reshape plan §4.3 — the host's
     decision after round 3): a command that changes an account's man (G4's own test) leaves no grant row naming that
     account stored after it, whoever makes it, a master admin included. The man now on the sign-in is given what he needs
     anew. A restore is held to it once the leave-out is wired (RESTORE_CTX — helper "undo & roles": an Undo or Redo of a
     re-link puts back the link only); until then a restore keeps the rules before Piece B. */
  if (!(env.origin === 'restore' && !RESTORE_CTX)) {
    for (const c of env.changes) {
      if (c.collection !== 'settings' || !String(c.id).startsWith(ACCOUNT_ROW)) continue
      const id = String(c.id).slice(ACCOUNT_ROW.length)
      if (accountRelinked(env, id) && w.rowsA.grants.some(g => g.account === id)) return `a sign-in linked to another person while a right still names it (${c.id})`
    }
  }
  /* PLAN IS AN ADMIN'S — MAKING A PLAN HOLDER A MEMBER (the Plan audit's PA2; his D2250, replacing the blind read's R7 and
     its D2248 — whoever may change his account may make him a member, his own squadron's admin or a master admin, the
     account-row line below holding who): no Plan in force holds on a member's account after it — his Plan rows go in the
     same command. Read on the loader's own reading of both lists. */
  const acctAById = new Map<string, Account>()
  for (const z of w.acctA) if (!acctAById.has(z.id)) acctAById.set(z.id, z)
  for (const x of w.acctB) {
    if (x.role !== 'admin') continue
    const y = acctAById.get(x.id)
    if (!y || y.role === 'admin' || String(y.pid) !== String(x.pid)) continue
    const ha = { id: y.id, pid: String(y.pid), pidFrom: y.pidFrom }
    if (w.rowsA.grants.some(g => g.account === y.id && g.level === 'admin' && grantRowHolds(ha, g, today, w.rowsA))) return `Plan left on an account made a member (${ACCOUNT_ROW}${y.id})`
  }
  /* G5 — NO RIGHT LEFT NAMING A SIGN-IN THAT IS GONE (fix read 11, fault E — SEC11-5): a right outliving its account
     passed to whoever got a new account under that id next. An account row is taken away only with every right naming
     it, in the same command (the person delete does so — units.ts dropGrantsOfAccount), whoever takes it, a master too. */
  return rightOutlivesAccount(env, w)
}
/* G5's check, for every actor that writes accounts — the app's posting pass too (fix read 12, fault A (2)): an account row
   the command takes away, and — read whole, as the loader reads the two lists — a seeded row the accounts' very first
   write simply leaves out (no change of that row is recorded at all: accounts.ts writeAccounts) */
function rightOutlivesAccount(env: CommitEnvelope, w: Worlds): string | null {
  for (const c of env.changes) {
    if (c.collection !== 'settings' || !String(c.id).startsWith(ACCOUNT_ROW)) continue
    const id = String(c.id).slice(ACCOUNT_ROW.length)
    if (accountBefore(id, c.before) == null || accountAfter(id, c) != null) continue
    if (w.rowsA.grants.some(g => g.account === id)) return `an account row taken away while a right still names it (${c.id})`
  }
  for (const k of w.rawB.keys()) {
    if (w.rawA.has(k)) continue
    const id = k.slice(ACCOUNT_ROW.length)
    if (w.rowsA.grants.some(g => g.account === id)) return `an account row taken away while a right still names it (${k})`
  }
  return null
}

/* G3 — NEVER A SQUADRON LEFT WITH NO ADMIN OF ITS OWN WHO CAN SIGN IN (D2184 Q10; the lock's words are accounts.ts
   lockProblem's), judged before against after on every date the command can change it: today, and every home row's
   `from` (either side) of a man whose home rows it changes (the second fix read — Astra 1, Opus F1, security H3: the lock
   ran only when an account row was written, and on today only, so Saber deleting or making a placeholder of Kestrel by
   a people-only command, or moving him to 142 from tomorrow, left 149 with no admin). Every actor — the app's own posting
   pass too (fix read 3, Astra's 1: it was passed over here, and its preflight read today only and counted an archived
   admin, so an Overseas Sqn or Delete posting ran the day before another admin's saved move and left his squadron none).
   The pass holds such a posting whole first (leavewar/sync.ts poHeldReason, the same calculation — accounts.ts
   postingLock); this is the backstop.
   ONE BODY WITH THE DOORS (the reshape plan §5.2, Piece C — B3, B6): the rule, its dates (today and every home row's and
   right's `from` from today on, either side), who counts and the squadron made or removed whole are state/lastadmin.ts's,
   which every door asks too — so a door never lets through what this refuses. It now runs for a command that changes a
   right or adds a squadron as well (a squadron's only Plan taken away, "+ New squadron" with no admin — B6). The app's
   other commands (none writes an account, a home, a right or a squadron) stay outside it. */
function lastAdminViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || (a.role === 'system' && env.type !== 'lw.postoutRun')) return null
  const w = worldsOf(env) ?? (env.changes.some(c => c.collection === 'settings'
    && (String(c.id).startsWith(GRANT_PFX) || String(c.id).startsWith(UNIT_PFX))) ? buildWorlds(env) : null)
  if (!w) return null
  const b = lockBreach({ rowsB: w.rowsB, rowsA: w.rowsA, acctB: w.acctB, acctA: w.acctA, personB: w.personB, personA: w.personA, today: todayIso() })
  if (!b) return null
  if (b === 'app') return 'the last admin who can sign in switched off or removed'
  return `a squadron (${b.unit}) left with no admin of its own who can sign in (on ${b.date})`
}

/* WHO MAY GIVE OR END PLAN OF A SQUADRON, AND MAKE ITS ADMINS — THE GATE'S READER (his D2626; D2730 Q8, Q10; D2806 — the
   brief docs/superpowers/briefs/2026-11-27-msq-s2-u2-brief.md R1; the plan §19.2's point 4): the one body (units-model.ts
   mayGivePlanAt, through units.ts mayGivePlanOn), over the actor's account AS IT STOOD BEFORE THE COMMAND — the row this
   command changed, put back; else the live list — as unitRowViolation builds its own `acct`, with his person before the
   command and the rows before it (unitRowsBefore(env.changes)): so one command can never make its own actor an admin of a
   squadron and give Plan of it. Never `worldsOf`, which is null for a command of rights only (every setGrant). An admin's
   role only where the role in force and the account's are both an admin's. Fails closed: the app's own actor, an actor with
   no account (a hand-made session), an account switched off, a man archived, deleted or a placeholder — no. */
export interface PlanActor { acct: (LevelAccount & { on?: boolean }) | null; person: any }
const PLAN_ACTOR = new WeakMap<CommitEnvelope, PlanActor>()
function planActorOf(env: CommitEnvelope): PlanActor {
  const got = PLAN_ACTOR.get(env)
  if (got) return got
  const a = env.actor
  let out: PlanActor = { acct: null, person: null }
  if (a && a.role !== 'system') {
    const mine = env.changes.find(c => c.collection === 'settings' && c.id === ACCOUNT_ROW + a.id)
    const was: any = mine ? accountBefore(a.id, mine.before) : ACCOUNTS_LIST.find(x => x.id === a.id)
    if (was && was.pid != null) {
      const role = a.role === 'admin' && String(was.role) === 'admin' ? 'admin' : 'main'
      const pc = env.changes.find(c => c.collection === 'people' && String(c.id) === String(was.pid))
      out = { acct: { ...levelAcct(was, role), on: was.on !== false }, person: pc ? pc.before : (PEOPLE as any)[String(was.pid)] }
    }
  }
  PLAN_ACTOR.set(env, out)
  return out
}
export function mayGivePlanOf(unit: string, actor: PlanActor, rows: UnitRows, today: string): boolean {
  return mayGivePlanOn(actor.acct, actor.person, unit, today, rows)
}

function unitRowViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  const unitCh = env.changes.filter(c => c.collection === 'settings' && isUnitRow(String(c.id)))
  const masterCh = env.changes.filter(c => {
    if (c.collection !== 'settings' || !String(c.id).startsWith(ACCOUNT_ROW)) return false
    /* both sides read as the loader reads them: an Undo of the very first account write takes every stored row away,
       and a seeded account with no row is its seed again — Saber's mark is not changed by that, so it is no change */
    const id = String(c.id).slice(ACCOUNT_ROW.length)
    const was = accountBefore(id, c.before), is = accountAfter(id, c)
    return !!(was && was.master) !== !!(is && is.master)
  })
  /* …and read whole: the masters before the command against the masters after it, as the loader reads each. The very
     first write of the account list stores every seeded account it keeps and simply leaves out one it drops — no change
     of that row is recorded at all — so a plain admin's Delete of the one master went past the row-by-row check above
     (the full check's security read, 18 Nov 26, F6) */
  /* (both lists as the loader reads them, over the people of each side — the second fix read, Fable's plan G1: a raw list
     kept a row the loader drops, so a clashing name could strip the mark unseen) */
  let masterMoved = masterCh.length > 0
  const w = worldsOf(env)
  if (w && !masterMoved) {
    const ids = (l: Account[]) => l.filter(x => x.master === true).map(x => x.id).sort().join(',')
    masterMoved = ids(w.acctB) !== ids(w.acctA)
  }
  if (!unitCh.length && !masterMoved) return null
  const sys = !a || a.role === 'system'
  const today = todayIso()
  const before = unitRowsBefore(env.changes)
  const after = unitRowsBefore([])
  /* each account as the reading rule takes it, before and after the command (accountHolder) */
  const holderB = (id: string) => accountHolder(env, id, 'b'), holderA = (id: string) => accountHolder(env, id, 'a')
  /* the actor's account before the command — the row this command changed, put back; else the live list */
  let acct: LevelAccount | null = null
  if (!sys) {
    const mine = env.changes.find(c => c.collection === 'settings' && c.id === ACCOUNT_ROW + a.id)
    const was: any = mine ? accountBefore(a.id, mine.before) : ACCOUNTS_LIST.find(x => x.id === a.id)
    acct = was ? levelAcct(was, String(was.role))
      : { id: a.id, pid: String(a.personId ?? ''), pidFrom: undefined, role: a.role === 'admin' ? 'admin' : 'main' }
  }
  /* an admin of a unit: the role IN FORCE is an admin's (an admin viewing as a member holds nothing), and his level
     there before the command is admin */
  const adminOf = (unit: string) => !sys && a.role === 'admin' && levelBefore(acct, unit, today, before) === 'admin'
  const master = !sys && a.role === 'admin' && !!acct?.master
  const exists = (r: UnitRows, unit: unknown, place?: unknown) =>
    !!unitIn(r, String(unit)) && (place === undefined || !!placeIn(r, String(place)))

  for (const c of unitCh) {
    const id = String(c.id), b: any = c.before, n: any = c.after
    const key = id.slice(id.indexOf(':') + 1)
    /* WHAT */
    if (n != null) {
      const ok = id.startsWith(UNITPLACE_PFX) ? validUnitPlace(n, key) : id.startsWith(UNIT_PFX) ? validUnit(n, key)
        : id.startsWith(PLACE_PFX) ? validPlace(n, key) : id.startsWith(GRANT_PFX) ? validGrant(n, key) : validHome(n, key)
      if (!ok) return `a unit row that is not one (${id})`
      if (id.startsWith(UNITPLACE_PFX) && !exists(after, n.unit, n.place)) return `a unit's place naming what is not there (${id})`
      if (id.startsWith(HOME_PFX) && !exists(after, n.unit)) return `a home in a unit that is not there (${id})`
      if (id.startsWith(GRANT_PFX)) {
        const who = accountImagesNow().find(x => x && x.id === n.account)
        if (!who || !exists(after, n.unit)) return `a right naming what is not there (${id})`
        if (homeBefore(String(who.pid), today, after) === n.unit) return `a right in his own home unit (${id})`
        /* (the reshape plan §4.3: an ended row stays stored beside a new one, so "two rights" is two HOLDING on one day) */
        const hA = holderA(String(n.account))
        if (after.grants.filter(g => g.account === n.account && g.unit === n.unit && grantRowHolds(hA, g, today, after)).length > 1) return `two rights holding for one account in one unit (${id})`
        /* PLAN IS AN ADMIN'S (the Plan audit's PA2 — D2201, D785): never on an account whose role is not admin */
        if (n.level === 'admin' && String(who.role) !== 'admin') return `Plan on an account that is not an admin's (${id})`
        /* …READ BY THE ROLE IN FORCE, AFTER THE COMMAND (U2 — the plan §19.2 "Who may hold it", the security check's F6): once
           every squadron's own admins write Plan rows, a forged give to a moved "admin" — a member where he stands, his
           account still storing "admin" (K3, D2160) — would make him an admin of that squadron. A Plan that holds is on an
           account that is an admin in force of the squadron he is at home in that day (a master admin's is refused below;
           no home at all — a shared store before its rows — by his role alone, as accounts.ts adminNow reads it). Saber's one
           Save "make Ranger an admin and give him Plan of 149" passes: the receiver is read after it. */
        if (n.level === 'admin' && grantRowHolds(holderA(String(n.account)), n, today, after) && who.master !== true) {
          const hW = homeBefore(String(who.pid), today, after)
          if (hW != null && levelBefore(levelAcct(who, 'admin'), hW, today, after) !== 'admin') return `Plan on an account that is not an admin's (${id})`
        }
        /* NO RIGHT GIVEN ON A MASTER ADMIN'S ACCOUNT (batch 1's second half, plan §15 D14 — R2-O14): he acts in every
           squadron, his row reads "Full access" with no buttons (R4), so a row given him would be hidden and come back when
           the mark comes off. Units.ts setGrant and accounts.ts saveAccess refuse it at the door. A restore too (the fix
           read's A1): an Undo of a right taken away, or a Redo of one given, after another master admin made that man
           one since, put it back hidden — no right stands on a master admin's account after ANY command (§15 D14); the
           Undo's own check refuses it first, naming who wrote what blocks it (D148 — state/undo-wire.ts
           masterRightRefusal, over accounts.ts masterRightLeft) */
        if (who.master === true && grantRowHolds(hA, n, today, after)) return `a right on a master admin's account (${id})`
        /* ITS DAY IS THE DAY IT WAS GIVEN (fix read 8, fault G — Fable's 1, the security read's SEC8-3, the fresh Opus
           read's 3): the bell's move-day test counts a grant from its `from` (notices.ts adminThen, his D2218, D2223),
           and a grant with no day, or back-dated, put by a plain admin brought back a line a man's move had retired. A
           new grant, or one whose level changes, is dated today (as setGrant writes it); one of the same level keeps its
           day. A restore's verified replay puts back the very image its step recorded (undo/timeline.ts verifiedReplay).
           units-model.ts validGrant's leniency stays the loader's (a row from before the day was kept, D56). */
        /* (fix read 9, fault A — Fable 1, Opus O9-2): the day is kept only for a right that stands unchanged
           (grantKept). A grant put back by an Undo or Redo where none stands, or at another level, is a right given
           today: keeping its recorded day brought back a line his move had retired (D2218, D2223). So the replay
           exemption holds only for a right unchanged; the restore itself writes today's day (restoreRedated), so an Undo
           or Redo is never refused for it. */
        const kept = grantKept(b, n)
        /* (fix read 10, fault E): …and for a right put back where none stands whose man has not moved since it went off
           — the restore keeps its recorded day then (restoreRedated), and the gate asks the same of the same moment */
        /* (fix read 11, fault G — F11-5b): or put back from below admin to admin, the same account in the same squadron */
        /* (guardrail 2 — the reshape plan §4.3): or put back after its man's move with its recorded day, which holds nothing
           (restoreRedated writes it so) */
        const back = grantBackHolds(b, n, OFFAT?.(env), before.homes) || movedSinceStart(n.account, n.from, before)
        /* NOT BETWEEN A MOVE SAVED AND ITS DAY (Fable's sample review, 1 — his D2203; the reshape plan §4.3, Fable 4, Opus
           L3): a right ends at the start of his move day, so one GIVEN or RAISED in the rest of the day the move is saved
           would last that day only. A lowering passes, and a verified replay — whatever either leaves ends at midnight by
           the rule (units.ts setGrant says the same) */
        const replay = env.origin === 'restore' && !!REPLAY && !!REPLAY(env)?.(c)
        const hb = grantBefore(holderB(String(n.account)), String(n.unit), today, before)
        const gives = !kept && (!hb || (hb.level !== 'admin' && n.level === 'admin'))
        if (gives && !replay && homeBefore(String(who.pid), moveFrom(today), after) !== homeBefore(String(who.pid), today, after)) return `a right given the day before his move (${id})`
        if (!((kept || back) && replay)) {
          const want = kept ? b.from : today
          if (n.from !== want) return `a right not dated today (${id})`
        }
      }
    } else if (id.startsWith(UNIT_PFX) && !id.startsWith(UNITPLACE_PFX)) {
      /* (the reshape plan §4.3 — Fable 6: a right that holds nothing on today names nothing a person can use, and no door
         removes one, so it never blocks the Undo of "+ New squadron") */
      if (after.unitplaces.some(x => x.unit === key) || after.homes.some(x => x.unit === key)
        || after.grants.some(x => x.unit === key && grantRowHolds(holderA(x.account), x, today, after))
        /* (and a request waiting to join it — §5 item 4, R-O11) */
        || requestsNaming(key)) return `a unit removed while still named (${id})`
    } else if (id.startsWith(PLACE_PFX)) {
      if (after.unitplaces.some(x => x.place === key)) return `a place removed while a unit is there (${id})`
    }
    /* WHO */
    if (sys) continue
    if (id.startsWith(UNITPLACE_PFX) || id.startsWith(GRANT_PFX) || id.startsWith(HOME_PFX)) {
      /* A PERSON DELETE TAKES EVERY RIGHT HIS SIGN-IN HOLDS, WHATEVER THE SQUADRON (fix read 11, fault H — the host's
         decision, his D2203 read for a delete: a move clears every View and Plan a man holds of other squadrons,
         whoever moves him; a delete is a fuller leaving, and taking a right away is the safe direction). Fault E made
         the delete drop his rights in its own command (units.ts dropGrantsOfAccount) but judged each dropped right by
         its squadron, so 149's admin could not delete his own man once 142 had given him Plan of 142 — "That did not
         save". A right's removal passes here only inside a person delete whose same command takes that sign-in's row
         away (section 8 judges the delete itself: an admin of the man's own squadron); a bare removal, or one beside an
         account row kept, is still an admin's of that squadron. */
      /* (fix read 12, fault A — Astra 1): a posting's Delete run at once (lw.postout, the pass joining that command) is the
         same delete — so the command's own records decide, personDeletedHere; (fault B — O12-1, F12-2, SEC12-1) and only
         they: the label "person.delete" on a command that deleted nobody stripped 142's Plan from a 149 man who stays */
      if (id.startsWith(GRANT_PFX) && b && n == null && accountGoesHere(env, String(b.account))
        && personDeletedHere(env, accountPidBefore(env, String(b.account)), adminOf, before)) continue
      /* (the "a move takes them" exemption is gone with Piece B — the reshape plan §4.3: a move writes no right, so a right
         removed beside a move is an ordinary removal, an admin of its squadron's) */
      /* THE RE-LINK'S DROP (guardrail 1, §4.3): a right that holds nothing on today, in the rows before, gives nothing, so
         its removal is no act for its squadron — it passes whoever makes the command, where the same command changes that
         account's person (G4 and the re-link line below judge the re-link itself). A right that holds is an ordinary
         removal: an admin of its squadron — at home or by Plan — or a master admin. */
      if (id.startsWith(GRANT_PFX) && b && n == null && accountRelinked(env, String(b.account))
        && !grantRowHolds(holderB(String(b.account)), b, today, before)) continue
      /* THE MEMBER'S DROP (his D2250, replacing R7's D2248 — "Yes let the admin downgrade"): making a Plan holder a member
         takes his Plan in the same command (accounts.ts updateAccount), as only an admin holds Plan — a removal that passes
         whoever makes it, where the same command makes that account, the same man kept, no admin; section 8 judges who may
         change the account itself (an admin of his own squadron, at home or by Plan, or a master admin), the last-admin
         lock the squadron he held it of (D2247) */
      if (id.startsWith(GRANT_PFX) && b && n == null && b.level === 'admin' && accountMadeMember(env, String(b.account))) continue
      /* ARCHIVED, HIS VIEW AND PLAN END (his D2311 — batch 1's second half, plan §4 item 8, R-O1, R-A4): Archive, or an
         Overseas Sqn posting run at once, drops every right his sign-in holds in the same command (accounts.ts
         endRightsOfArchived) — a removal that passes where the command's own records archive that account's man, made by
         an admin of his own squadron (personArchivedHere); a forged removal beside an unrelated archive stays refused */
      if (id.startsWith(GRANT_PFX) && b && n == null && personArchivedHere(env, accountPidBefore(env, String(b.account)), adminOf, before)) continue
      /* PLAN IS GIVEN, RAISED, LOWERED AND TAKEN BY THAT SQUADRON'S OWN ADMINS OR A MASTER ADMIN (his D2626, replacing the
         Plan audit's PA1 — a master admin's alone; D2730 Q10): a grant row whose level is `admin` on either side — and that
         holds there (a row holding nothing is no Plan a person can use) — needs one who may give Plan of THAT ROW'S
         squadron (mayGivePlanOf, over his account and the rows before the command). The removal exceptions above (a
         delete's, a re-link's dropping a right that holds nothing, the member's drop, an archive's) stay removal-only. A
         verified replay is NOT excepted any more (U2 — the plan §19.2's replay rule (a); Astra 1, Fable 3, security S4 of the
         third read): an Undo or Redo is asked of its maker as he stands today, in every direction — a put-back, a removal and
         a lowering alike, D2730 Q11 */
      if (id.startsWith(GRANT_PFX)) {
        const pa = planActorOf(env)
        const planB = !!b && b.level === 'admin' && grantRowHolds(holderB(String(b.account)), b, today, before)
        const planA = !!n && n.level === 'admin' && grantRowHolds(holderA(String(n.account)), n, today, after)
        if ((planB && !mayGivePlanOf(String(b.unit), pa, before, today)) || (planA && !mayGivePlanOf(String(n.unit), pa, before, today))) return `Plan given, changed or taken by one who may not give it (${id})`
      }
      /* THE FIRST ADMIN'S MARK IS A MASTER ADMIN'S "+ NEW SQUADRON" ALONE (U2 — the plan §19.2 "The `first` mark"; the
         security check's F3): `first` makes its holder the squadron's own admin the day he moves in (units-model.ts
         adminRoleHolds), so a Plan row carrying it written anywhere else — Kestrel's forged give to Hunter, or Saber's give
         by the row — would make an admin of 149 at none of the places that make one (K3, K4). A grant row whose after-image
         carries `first` passes only where it carried `first` before (same account, same squadron, still Plan), or where it
         is a master admin's `unit.add` making that very squadron in this command — or that command's verified replay (the
         Redo of "+ New squadron") */
      if (id.startsWith(GRANT_PFX) && n && n.first === true) {
        const keptFirst = !!b && b.first === true && String(b.account) === String(n.account) && String(b.unit) === String(n.unit) && b.level === 'admin' && n.level === 'admin'
        const madeHere = env.changes.some(x => x.collection === 'settings' && String(x.id) === UNIT_PFX + String(n.unit) && x.before == null && x.after != null)
        const byAdd = master && madeHere && env.type === 'unit.add'
        /* (an Undo or Redo the timeline vouches for, record by record, puts back the very row a step recorded — the Undo of
           the first admin's Plan taken away, the Redo of "+ New squadron": "the row carried `first` before". Who may put
           that Plan back at all is the who-check's above, asked of the presser as he stands today — the agent's reading of
           the plan §19.2, named in the U2 report) */
        const byReplay = env.origin === 'restore' && !!REPLAY && !!REPLAY(env)?.(c)
        const firsts = env.changes.filter(x => x.collection === 'settings' && String(x.id).startsWith(GRANT_PFX) && (x.after as any)?.first === true && String((x.after as any)?.unit) === String(n.unit))
        if (!keptFirst && !byReplay && !(byAdd && firsts.length === 1)) return `a squadron's first-admin mark written outside "+ New squadron" (${id})`
      }
      /* A PLAN'S MOMENT IS THE MOMENT IT BECAME PLAN (batch 1's second half, plan §16 D1′ — his D2310, D2218): the bell
         shows a squadron's admin line only where the right began no later than the line (notices.ts rightStart), so a
         back-dated moment would bring back the lines of a right taken away. Plan unchanged keeps its moment; Plan given or
         raised now carries now; a View row carries none. A restore's verified replay puts back the row whole, its moment
         with it (an Undo of the take-away brings the lines back — D1′). Asked after who may change it, so a plain admin's
         Plan is refused in those words first. */
      if (id.startsWith(GRANT_PFX) && n && !(env.origin === 'restore' && REPLAY && REPLAY(env)?.(c))) {
        if (n.level !== 'admin') { if (n.fromAt !== undefined) return `a moment on a right that is not Plan (${id})` }
        else if (grantKept(b, n)) { if (n.fromAt !== b.fromAt) return `a Plan's moment changed (${id})` }
        else if (!momentNow(n.fromAt)) return `a Plan not dated now (${id})`
      }
      /* K4 — A MOVE NEVER ASKS THE SQUADRON JOINED (his D2160, the transfer: "both squadrons' admins told when it is set and
         on the date, the new one never asked"): a home row of a man who has a squadron today is judged by the one check
         below alone — an admin of the squadron he LEAVES on each day his squadron changes (datedBreach, "leaves"), never
         himself, never a day already begun. Only a FIRST placing — a man with no squadron at all today, or one this command
         makes — still needs an admin of the squadron its row names. Safe since K3: he joins as a member, so 142's admin
         plants no admin in 149 by moving his own man there. */
      const moved = id.startsWith(HOME_PFX) && [b, n].every(img => !img || (img.pid != null && homeBefore(String(img.pid), today, before) != null
        && !env.changes.some(x => x.collection === 'people' && String(x.id) === String(img.pid) && x.before == null)))
      if (!moved) for (const img of [b, n]) if (img && !adminOf(String(img.unit))) return `not an admin of ${img.unit} (${id})`
    } else if (id.startsWith(UNIT_PFX)) {
      if (!master) return `only a master admin makes or changes a unit (${id})`
    } else if (id.startsWith(PLACE_PFX) && !master) {
      /* A PLACE'S SQUADRONS, TODAY OR LATER (batch 1's second half §6 item 3 — D2196, D2336, PG1; §15 D13, §16 D13′): an
         existing place changed (or removed) needs an admin of EVERY squadron at it — today or from a later day, as the rows
         stood before the command and after it (units-model.ts unitsAtPlace, the door's one body) — and one no squadron is
         at, a master admin. A NEW place passes only where the same command writes a squadron's place row naming it (+ New
         squadron, a squadron's move — one command each); alone, it is a master admin's. ("Or by the admin who made it" is
         dropped — a place row keeps no maker.) */
      /* (an existing place is one the rows before hold — a seeded place has no stored row, so `b` alone cannot say) */
      if (b != null || placeIn(before, key)) {
        const at = new Set([...unitsAtPlace(before, key, today), ...unitsAtPlace(after, key, today)])
        if (!at.size) return `a place no squadron is at, changed by one who is not a master admin (${id})`
        for (const u of at) if (!adminOf(u)) return `not an admin of every unit at that place (${u} — ${id})`
      } else if (n != null) {
        const named = env.changes.some(x => x.collection === 'settings' && String(x.id).startsWith(UNITPLACE_PFX)
          && x.op !== 'delete' && (x.after as any)?.place === key)
        if (!named) return `a new place made alone by one who is not a master admin (${id})`
      }
    }
  }

  /* AN ENDED RIGHT NEVER COMES BACK (the reshape plan §4.3 — Opus M3 of round 2; guardrail 2 — Astra 1, Fable 7 of round
     3), judged before against after, the backstop: for each account and squadron a grant row of this command names, a
     right that holds nothing on today before it — none stored, or stored and ended — holds after it only where the command
     puts it DATED TODAY (a giving, judged above by the who-rule), or where a verified restore puts it back with its recorded
     day and the one body (restoreLeavesOut) lets it through. A verified restore that puts back a row the body leaves out is
     refused outright, so "never" holds here as well as at the restore. */
  const pairs = new Map<string, [string, string]>()
  for (const c of unitCh) {
    if (!String(c.id).startsWith(GRANT_PFX)) continue
    for (const g of [c.before as any, c.after as any]) if (g && g.account != null && g.unit != null) pairs.set(`${g.account}\u0000${g.unit}`, [String(g.account), String(g.unit)])
  }
  for (const [acc, u] of pairs.values()) {
    if (grantBefore(holderB(acc), u, today, before)) continue
    const now = grantBefore(holderA(acc), u, today, after)
    if (!now) continue
    const c = unitCh.find(x => String(x.id) === GRANT_PFX + now.id)
    if (c && env.origin === 'restore' && REPLAY && REPLAY(env)?.(c)) continue
    if (!c || now.from !== today) return `an ended right brought back (${GRANT_PFX}${now.id})`
  }
  /* …and a verified restore's grant row the one body leaves out, refused outright — once the step's record is wired
     (RESTORE_CTX: helper "undo & roles" installs it with the leave-out itself, so an honest restore never brings one
     here). Until then a restore is judged as before Piece B, and restoreRedated keeps the recorded day of a right whose
     man has moved since it went off, so it holds nothing (the reading rule) — nothing comes back. */
  if (RESTORE_CTX && env.origin === 'restore' && REPLAY) {
    const replayed = REPLAY(env)
    for (const c of unitCh) {
      if (!String(c.id).startsWith(GRANT_PFX) || !replayed?.(c)) continue
      /* (`mayPlan` — the restore's maker, as he stands today, for that row's squadron: U2, replacing "is he a master admin";
         the app's own actor hands nothing in, which reads as "may not") */
      const gu = String((c.after as any)?.unit ?? (c.before as any)?.unit ?? '')
      if (restoreLeavesOut(c, { ...restoreGrantCtx(env, c), mayPlan: sys ? undefined : mayGivePlanOf(gu, planActorOf(env), before, today) }, after, today)) return `a right put back that its man's move or a re-link has ended, or a Plan put back by one who may not give it (${c.id})`
    }
  }

  /* HOMES AND PLACES BY ONE CHECK (the reshape plan §4.3 — units-model.ts datedRowsBreach, in place of section 8's home
     loop and with a squadron's place row's day, K1): never a day already begun; a man moved out only by an admin of the
     squadron he leaves; nobody moves himself (R1). The squadron each row names is judged above (an admin of it). */
  if (!sys) {
    const made = new Set(env.changes.filter(c => c.collection === 'people' && c.before == null).map(c => String(c.id)))
    const pids: string[] = [], unitsTouched: string[] = []
    for (const c of unitCh) {
      const id = String(c.id)
      for (const r of [c.before as any, c.after as any]) {
        if (!r) continue
        if (id.startsWith(HOME_PFX) && r.pid != null) pids.push(String(r.pid))
        else if (id.startsWith(UNITPLACE_PFX) && r.unit != null) unitsTouched.push(String(r.unit))
      }
    }
    /* (the Undo of his own move, K4: the timeline's own restore of a step of this actor's, which it is applying now —
       undo/timeline.ts verifiedReplay answers only then; it vouches for no home row image by image, so this asks only
       that the restore is the timeline's, of his own step) */
    const takeBack = env.origin === 'restore' && !!REPLAY && REPLAY(env) != null
    const br = datedBreach(before, after, today, { pids, units: unitsTouched, made, self: a.personId != null ? String(a.personId) : null, adminOn: adminOf, takeBack })
    if (br) {
      if (br.code === 'begun') return br.kind === 'home' ? `a home changed for a day already begun (home of ${br.who} on ${br.date})` : `a squadron's place changed for a day already begun (${br.who} on ${br.date})`
      if (br.code === 'first-past') return br.kind === 'home' ? `a first home dated before today (home of ${br.who} from ${br.date})` : `a squadron's first place dated before today (${br.who} from ${br.date})`
      if (br.code === 'self') return `his own squadron changed by himself (home of ${br.who} from ${br.date})`
      return `a man moved out of a squadron (${br.unit}) by one who is not its admin (home of ${br.who} from ${br.date})`
    }
  }

  if (masterMoved) {
    /* (…or Admin → Users' one Save, which carries the role, the mark and the squadron lines together — batch 1's second
       half, plan §4 item 5, R-O3, R-A5; accounts.ts saveAccess) */
    if (env.type !== 'account.master' && env.type !== 'account.access' && !(env.type === 'undo.restore' && env.origin === 'restore')) return 'the master mark changes only by its own command'
    if (!master) return 'only a master admin sets the master mark'
    for (const c of masterCh) {
      const img: any = c.after ?? c.before
      if (String(c.id) === ACCOUNT_ROW + a.id || (img && a.personId != null && String(img.pid) === String(a.personId))) return 'never his own master mark'
      /* MADE A MASTER ADMIN, HE KEEPS NO RIGHT (R-O10): every View and Plan he holds goes in the same command — a kept row
         would be hidden behind "Full access" and come back when the mark comes off. Whichever command sets the mark — the
         one Save, the mark's own `account.master`, an Undo or Redo (§15 D14; the second half's final reads, R3: it was
         asked of the one Save only, and the mark's own command kept a Plan) */
      if (c.after != null && (c.after as any).master === true) {
        const id = String(c.id).slice(ACCOUNT_ROW.length), h = holderA(id)
        if (after.grants.some(g => g.account === id && grantRowHolds(h, g, today, after))) return `a right left on an account made a master admin (${c.id})`
      }
    }
    /* (only an admin's account counts as a master admin left — D2260) */
    if (!(w ? w.acctA : readAccounts(accountImagesNow())).some(x => x.master === true && x.role === 'admin')) return 'one master admin must be left'
  }
  return null
}

/* 8. A PERSON, HIS ACCOUNT AND HIS HOME ARE AN ADMIN'S OF HIS OWN SQUADRON (the full check of batch 1, 18 Nov 26 — the
   blind reads' cross-squadron finding: 142's plain admin could rename, re-category or delete a 149 man, change any 149
   account — make a 149 man an admin there, switch 149's only admin off — and pull a man of 149 into 142, since a home
   row was judged only by the unit it names). D2191: Admin → Users lists an admin's own squadron's people; a man of the
   other squadron is given View, "nothing else of his row changeable". The person's row, his account's row and his home
   carry no unit in their ids (they are the community's, D288 — one callsign list), so section 7 cannot see them; this
   reads the unit off the PERSON: his home today, over the rows as they stood before the command (a man made by this
   very command, by the home it gives him). An admin in force must be an admin there — his home squadron's role, an
   admin grant or the master mark (levelBefore, the one answer). A home row is held twice: its unit (section 6) and the
   squadron he LEAVES (here); and only from tomorrow on for a man who already has one (D2119 — never rewriting today).
   A row this command writes unchanged (an account list's first write stores every seeded row) asks nothing. The
   member rules below still hold a member to his own row; the app itself is not asked. */
function homeUnitViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role !== 'admin') return null
  const people = env.changes.filter(c => c.collection === 'people')
  const accts = env.changes.filter(c => c.collection === 'settings' && String(c.id).startsWith(ACCOUNT_ROW))
  const homes = env.changes.filter(c => c.collection === 'settings' && String(c.id).startsWith(HOME_PFX))
  if (!people.length && !accts.length && !homes.length) return null
  const today = todayIso()
  const before = unitRowsBefore(env.changes)
  const after = unitRowsBefore([])
  const row: any = ACCOUNTS_LIST.find(x => x.id === a.id)
  const acct: LevelAccount = row
    ? levelAcct(row, String(a.role))
    : { id: a.id, pid: String(a.personId ?? ''), pidFrom: undefined, role: 'admin' }
  /* a man this command makes: his people row is new here */
  const made = new Set(people.filter(c => c.before == null).map(c => String(c.id)))
  const unitOfMan = (pid: string) => homeBefore(pid, today, made.has(pid) ? after : before)
  const adminThere = (pid: string): string | null => {
    const u = unitOfMan(pid)
    /* no home at all (a shared store before its rows exist) — nothing to judge, as section 6 */
    if (!u) return null
    return levelBefore(acct, u, today, before) === 'admin' ? null : u
  }
  for (const c of people) {
    if (JSON.stringify(c.before ?? null) === JSON.stringify(c.op === 'delete' ? null : c.after ?? null)) continue
    const u = adminThere(String(c.id))
    if (u) return `a person of another squadron (${u}) changed by one who is not its admin (people/${c.id})`
  }
  /* EVERY ACCOUNT THE COMMAND CHANGES, READ WHOLE: the list before against the list after, each as the loader reads it
     (none stored is the seeded list), every account in either — not only the rows the command wrote. The very first write
     of the list stores each seeded account it keeps and simply leaves out one it drops, so no change of that row is
     recorded at all: a forged first write without Osprey's account took 149's account away unseen (the fix read, 18 Nov
     26 — Astra 1). The Undo of that first write takes every stored row away, and the list read is the seeded one again:
     only what really moved is judged. His own account too: the own-account guards (accounts.ts ownAccount) stand only on
     the write path, so a forged write moving his own account onto a 149 man made a 142 admin 149's admin (the fix's blind
     read, 18 Nov 26, F1); his ordinary writes to his own row pass, his own squadron being his */
  /* (since the second fix read — Fable's plan G2 — both lists are the loader's own reading, worldsOf: a raw row the loader
     would drop is G0's to refuse, and a row it keeps under another key is judged by the account it loads as) */
  const w = accts.length ? worldsOf(env) : null
  if (w) {
    const was = new Map<string, any>(w.acctB.map(x => [x.id, x]))
    const is = new Map<string, any>(w.acctA.map(x => [x.id, x]))
    for (const id of new Set([...was.keys(), ...is.keys()])) {
      const b = was.get(id) ?? null, n = is.get(id) ?? null
      if (JSON.stringify(b) === JSON.stringify(n)) continue
      for (const x of [b, n]) {
        if (!x || x.pid == null) continue
        const u = adminThere(String(x.pid))
        if (u) return `an account of another squadron (${u}) changed by one who is not its admin (${ACCOUNT_ROW}${id})`
      }
    }
    /* NEVER A SQUADRON LEFT WITH NO ADMIN OF ITS OWN — lastAdminViolation (G3), run for every command that changes a
       person, an account or a home, on every date it can change (D2184 Q10) */
  }
  /* A HOME IS JUDGED BY WHAT IT DOES, DAY BY DAY (the fix read, 18 Nov 26 — Astra 5, Opus 2 and 6): moved whole into the one
     check for homes and places, units-model.ts datedRowsBreach, called by section 6 (unitRowViolation) — the reshape plan
     §4.3, Piece B. Its rules there: never a day already begun (a man with no squadron yet placed from today), only by an
     admin of the squadron he leaves, nobody moving himself (R1). */
  return null
}

/* WHO MAKES AN ADMIN OF A SQUADRON (his D2626, D2730 Q8, D2806 — "an admin of a squadron is made only by its own admins or
   a master admin"; the brief docs/superpowers/briefs/2026-11-27-msq-s2-u2-brief.md R2): for every man the command makes an
   admin in force of the squadron he is at home in today (units-model.ts madeAdminsIn — the one helper the Undo's own check
   asks too, state/undo-wire.ts makeAdminStuck), the actor must be one who may give that squadron's Plan, as he stood
   before the command (mayGivePlanOf — the same rule as Plan's). Before this, a Plan holder of 142 passed the account-row
   check by his Plan and could make a 142 man 142's admin. Asked only of a command that changes an account or makes a
   person — never of a home row alone (a move counts from tomorrow, D2119), nor of the app's own pass or the seed. An Undo
   or Redo is judged here too: the Undo of "made a member" is the same act (his D2807). */
function madeAdminViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role === 'system' || env.origin === 'seed') return null
  const accts = env.changes.some(c => c.collection === 'settings' && String(c.id).startsWith(ACCOUNT_ROW))
  const madePerson = env.changes.some(c => c.collection === 'people' && c.before == null && c.op !== 'delete' && c.after != null)
  if (!accts && !madePerson) return null
  const w = worldsOf(env) ?? buildWorlds(env)
  const today = todayIso()
  const made = madeAdminsNow({ acctB: w.acctB.map(x => levelAcct(x)), acctA: w.acctA.map(x => levelAcct(x)), rowsB: w.rowsB, rowsA: w.rowsA, today })
  for (const m of made) {
    if (!mayGivePlanOf(m.unit, planActorOf(env), w.rowsB, today)) return `a man made an admin of ${m.unit} by one who may not give its Plan (${ACCOUNT_ROW}${m.account})`
  }
  return null
}

/* 7e. AN ADMIN'S BELL LINES AND READ RECORDS ARE HIS OWN SQUADRON'S PEOPLE'S (the second fix read, 18 Nov 26 — Fable's
   plan, still open 2; his D2194: no bell line about one squadron's own business reaches the other's people). A notice's
   id and a `seen:<pid>` / `noticeseen:<pid>` row name no squadron, and the admin branch below returns early, so 142's
   plain admin could write a bell line to a 149 man, take one of his away, or mark his history or his bell read. Now an
   admin's change to a notice (before or after) addressed to anyone but himself, or to another person's read record,
   needs him an admin of that person's squadron (his home today, as the rows stood before) — a master, or one given Plan
   of it, is. THE HOLIDAY LINE (`oilhol`) CROSSES NO MORE (his D2195 — a holiday is its own squadron's, its line to its own
   squadron's schedulers only; the reshape plan §7, A4, with the Plan audit's PB3): it was kept crossing while a holiday
   reached every squadron at the place (D2184 R32), skipping these checks; it now takes them as any admin line does — to his
   own squadron's people, or to a reader in adminsOf of a squadron he is an admin of (PC1, below) — and the war-line check
   below asks it is the holiday's own. `accessreq:` rows name their squadron since batch 1's second half §5 (D2111) and
   are judged by it in their own section (8b, requestRowViolation).
   ONE LINE IS NOT JUDGED BY ITS READER'S SQUADRON: the telling of an input this very command changed (state/sched-commit.ts
   tellPass — whoever is in it and whoever filed it is told). That input is judged by its own people's squadrons
   (7c above), and its filer may be of another squadron (a master who filed for a 149 man, who is then told when 149's
   own admin changes it) — refusing the change for its telling would refuse a change the gate allows. A line naming an
   input the command did not change is judged as any other. */
/* WHO A CHANGED INPUT'S TELLING MAY REACH (job 2, 19 Nov 26 — Astra 6, the security read's SEC-2 and SEC-3): the notice
   pass (state/notices.ts noticePass) tells the people named in the input before and after the change and its filer
   before and after, and no one else — a man split out of a shared input is told under his new one, where he is named.
   A bell line riding that change to anyone outside this set is not its telling, and is judged as any other line. Null:
   the command does not change that input. */
function toldBy(env: CommitEnvelope, iid: unknown): Set<string> | null {
  const id = String(iid ?? '')
  if (!id) return null
  let out: Set<string> | null = null
  const imgs: any[] = []
  for (const c of env.changes) {
    if (c.collection !== 'inputs' || String(c.id) !== id) continue
    out ??= new Set<string>()
    for (const r of [c.before as any, c.after as any]) {
      if (!r || typeof r !== 'object') continue
      imgs.push(r)
      for (const e of namedOf(r)) out.add(String((e as any).p))
    }
  }
  /* its filer only while he is still told of it (his D2223 — state/notices.ts filerTold, the pass's own test): a filer
     since moved away from the men it names is no longer told, so a line to him is no telling of this change; one who
     never moved is, for the input's days still his squadron's (his D2225 — fix read 7, fault Q: the named men's homes
     read on the input's own days, in that one body) */
  /* …AND ONLY THE FILER THE INPUT HAD BEFORE (fix read 6, fault A — the security read's SEC6-A (2)): the after-image's
     `by` is the command's to write, so 142's plain admin set it to 149's Osprey and rode a line to him on it; on a new
     input, only the actor himself (state/notices.ts changeFiler — the pass's own list) */
  const self = env.actor && env.actor.personId != null ? String(env.actor.personId) : null
  /* …AND THE FILER OF EACH LEAVE THIS COMMAND FOLDED INTO IT (fix read 15 — Astra 1; state/notices.ts foldedInto, the
     pass's own body): its words are told on the leave that stands, judged over the same images as the pass */
  const folded = out ? foldedFor(env, id) : []
  for (const x of folded) { imgs.push(x); for (const e of namedOf(x)) out!.add(String((e as any).p)) }
  for (const c of env.changes) {
    if (c.collection !== 'inputs' || String(c.id) !== id) continue
    const f = changeFiler(c.before ?? null, c.op === 'delete' ? null : c.after ?? null, self)
    if (f && filerTold(f, imgs)) out!.add(f)
  }
  /* (a folded leave's filer judged on its own days alone — fix read 16, Fable's 2: notices.ts noticePass, the same) */
  for (const x of folded) { const f = changeFiler(x, null, self); if (f && filerTold(f, [x])) out!.add(f) }
  return out
}
/* the before-images of the leaves this command removed that it folded into input `id` as it stands after the command
   (state/notices.ts foldedInto — fix read 15, Astra 1; the survivor's own before-image too — fix read 16, all four readers:
   only days it grew over in this command) */
function foldedFor(env: CommitEnvelope, id: string): any[] {
  let after: any = null
  let before: any = null
  for (const c of env.changes) if (c.collection === 'inputs' && String(c.id) === id) { after = c.op === 'delete' ? null : c.after ?? null; if (before == null) before = c.before ?? null }
  if (!after || !before) return []
  const removed: any[] = []
  for (const c of env.changes) {
    if (c.collection !== 'inputs' || String(c.id) === id || c.before == null || (c.op !== 'delete' && c.after != null)) continue
    removed.push(c.before)
  }
  return foldedInto(after, removed, before)
}
/* A FILER-ONLY LINE CARRIES ITS MARK (fix read 6, fault C — the fresh Opus read's F2 and F3, Astra's 2): the line a
   change writes to someone it tells only as the input's filer — named in it neither before nor after — says so
   (state/notices.ts Notice.fu: the squadrons his telling was judged by), and his move retires it by that mark alone
   (noticeLeftBell). A forger who left the mark off would make such a line permanent, one with the wrong squadrons would
   keep it on a man since moved away. So a line riding the telling door must carry exactly what the pass writes: no mark
   to a man named in the input, the mark with the squadrons filerVia gives to anyone else. Only a line the command
   puts; a restore's verified replay puts back the image it took away, judged when it was first written. */
function filerMarkOk(env: CommitEnvelope, c: Change, n: any): boolean {
  if (c.op !== 'put' || n !== c.after) return true
  const id = String(n.iid ?? '')
  const imgs: any[] = []
  const named = new Set<string>()
  for (const x of env.changes) {
    if (x.collection !== 'inputs' || String(x.id) !== id) continue
    for (const r of [x.before as any, x.after as any]) {
      if (!r || typeof r !== 'object') continue
      imgs.push(r)
      for (const e of namedOf(r)) named.add(String((e as any).p))
    }
  }
  /* (and the leaves folded into it — fix read 15, Astra 1: the pass's images, toldBy's) */
  const folded = foldedFor(env, id)
  for (const x of folded) { imgs.push(x); for (const e of namedOf(x)) named.add(String((e as any).p)) }
  const fu = n.fu
  if (named.has(String(n.to))) return fu === undefined
  if (env.origin === 'restore' && REPLAY && REPLAY(env)?.(c)) return true
  if (!Array.isArray(fu) || !fu.every((u: unknown) => typeof u === 'string')) return false
  /* (the squadrons the pass marks it with: those he was told THROUGH — fix read 8, fault R, notices.ts filerVia; over
     the images the pass judged him by — a folded leave's filer over its own alone, fix read 16, Fable's 2) */
  let own: any[] = imgs
  if (folded.length) {
    const self = env.actor && env.actor.personId != null ? String(env.actor.personId) : null
    const ch = env.changes.find(x => x.collection === 'inputs' && String(x.id) === id)
    own = joinFilerImgs(String(n.to), ch?.before ?? null, ch && ch.op !== 'delete' ? ch.after ?? null : null, folded, self) ?? imgs
  }
  const want = filerVia(String(n.to), own)
  if (!want) return false
  const have = new Set<string>(fu)
  return fu.length === want.length && have.size === want.length && want.every(u => have.has(u))
}
/* AN INPUT LINE IS PUT ONLY AS THE PASS WRITES IT (fix read 7, fault M — the security read's SEC7-1, Astra's A1, the Opus
   read's residual 3). `filerMarkOk` was asked only at the telling door; a line that failed it fell through to the
   own-man fallback, so on the day before a man's move an admin could put any line to him — unmarked, or naming an input
   the command never touched — or rewrite the honest line's mark, and since fault C an unmarked line stays on his bell for
   good (noticeAboutHim), the old squadron deciding what follows him (his D2218, D2223). The pass (state/notices.ts
   noticePass) is the one writer of a line with an input, so: a line a command puts naming an input must be one the pass
   wrote in this command (`passMade` - its before-image is the inputs as last committed, so it may also tell of a bare
   write the command's resync took up), or name an input this command changes and carry the mark the pass would; and nobody
   rewrites a line already written — its reader, input, time and mark stay as they were. A restore's verified replay
   (`replayed`) puts back the image it took away, judged when it was first written. Both sections of the gate ask it:
   `lineRewritten` before every door, `inputLineUnlike` where a line would otherwise pass as one to the admin's own man
   (a line to another squadron's man keeps that refusal's words). */
function lineRewritten(c: Change, replayed: ((c: Change) => boolean) | null): boolean {
  const b: any = c.before, n: any = c.after
  if (c.op !== 'put' || !b || typeof b !== 'object' || !n || typeof n !== 'object') return false
  if (replayed && replayed(c)) return false
  /* (…nor its squadron's stamp — §7 item 1) */
  return String(b.to) !== String(n.to) || String(b.iid ?? '') !== String(n.iid ?? '') || b.at !== n.at || !deepEqual(b.fu, n.fu) || !deepEqual(b.u, n.u)
}
/* A NEW LINE'S STAMP IS THE SQUADRON THE COMMAND ACTS IN (batch 1's second half, plan §7 item 1 — state/notices.ts
   Notice.u): an input's line its input's squadron as this command leaves it (engine/inputs.ts inputUnitOf — the body the
   pass stamps with), a holiday's its holiday part's, a posting's or its take-back's the man's home before the command, a
   war line the war loaded's. The bell's switch, its grey mark and its tap read the stamp, so a line stamped with another
   squadron would hide from the switch it belongs to, or land a tap elsewhere. A line the command cannot be judged by (an
   input it does not change, a war line with no war door) is left to the checks that judge it; a restore's verified replay
   puts back its own. Both sections ask it. */
function lineStampOwed(env: CommitEnvelope, n: any): string | null | undefined {
  if (n.iid) {
    const ch = env.changes.find(x => x.collection === 'inputs' && String(x.id) === String(n.iid))
    const img: any = !ch ? null : ch.op === 'delete' ? ch.before : (ch.after ?? ch.before)
    return img ? inputUnitOf(img) : undefined
  }
  const p: any = Array.isArray(n.what) ? n.what[0] : null
  const k = String(p?.k)
  if (k === 'oilhol') return typeof p.u === 'string' && p.u ? p.u : null
  if (k === 'po' || k === 'poback') return p.who != null ? homeBefore(String(p.who), todayIso(), unitRowsBefore(env.changes)) ?? null : undefined
  if (k === 'lw' || k === 'lwopen' || k === 'lwback') return lwUnitNow() ?? undefined
  return undefined
}
function lineStampWrong(env: CommitEnvelope, c: Change, replayed: ((c: Change) => boolean) | null): boolean {
  const n: any = c.after
  if (c.op !== 'put' || c.before != null || !n || typeof n !== 'object') return false
  if (replayed && replayed(c)) return false
  const want = lineStampOwed(env, n)
  return want !== undefined && (typeof n.u === 'string' ? n.u : null) !== want
}
/* A NEW LINE IS DATED NOW (fix read 7, fault T — the security read's SEC7-2). A line leaves a moved man's bell from the
   first move day after the day it was written (state/notices.ts noticeLeftBell), so a line dated in 2099 was never
   "written yet" and stayed on his bell for good, the old squadron deciding what follows him (his D2218); dated long ago it
   would read as written before a move it came after. The app writes every line at the moment of its change, so a new line
   (no before-image: a line already written keeps its time — lineRewritten) must carry a time within a few minutes of now —
   but for a restore's verified replay, which puts back the image it took away, its own time with it. Both sections ask
   it.
   NOR ON A LATER DAY (fix read 8, fault N — the security read's SEC8-1): at 23:57 on the day before a man's move, a line
   dated 00:01 on the move day itself was within the few minutes, but its day was the move day, so no move ever came
   after it and it never left his bell (D2218). A new line's day (notices.ts dayOfAt, the day noticeLeftBell reads) is
   never later than today; a few minutes in the past stays allowed. */
function lineNotNow(c: Change, replayed: ((c: Change) => boolean) | null): boolean {
  const n: any = c.after
  if (c.op !== 'put' || c.before != null || !n || typeof n !== 'object') return false
  if (replayed && replayed(c)) return false
  return !(typeof n.at === 'number' && Number.isFinite(n.at) && Math.abs(n.at - Date.now()) <= AT_SLACK_MS && dayOfAt(n.at) <= todayIso())
}
function inputLineUnlike(env: CommitEnvelope, c: Change, changed: ReadonlySet<string>, replayed: ((c: Change) => boolean) | null): boolean {
  const n: any = c.after
  if (c.op !== 'put' || !n || typeof n !== 'object') return false
  if (replayed && replayed(c)) return false
  const iid = String(n.iid ?? '')
  /* the pass's own word vouches only for a line about an input this command changes (fix read 8, fault W — the security
     read's SEC8-5): the pass compares the inputs before the command with the list as it stands, so an input written
     outside every command was told by the next one to run, as that command's change, with no change of it in the
     envelope. A line about an input the command does not change is no line the pass owes, whoever says it wrote it. */
  if (passMade(env)?.has(String(n.id)) && (!iid || changed.has(iid))) return false
  return !!iid && !(changed.has(iid) && filerMarkOk(env, c, n))
}
/* a line made wholly of holiday parts — the holiday's own line, judged by the war-line check below (one holiday part beside
   another part is no holiday line: SEC-2) */
const holidayLine = (n: any): boolean => Array.isArray(n?.what) && n.what.length > 0 && n.what.every((p: any) => p && p.k === 'oilhol')
/* (fix read 3's A2 exception — the posting command reaching a posting line on the bell of an admin since moved to
   another squadron — is GONE, by his D2218 (19 Nov 26): "On the day a person moves squadron the old squadron's bell lines
   leave his bell, read or unread, never later struck 'taken back' … So a moved admin gets nothing when his old squadron
   undoes a posting." The line left his bell on the day he moved (state/notices.ts noticeLeftBell), the take-back tells
   only who would be told today (leavewar/sync.ts postingLinesOf), and a 142 command touching a 149 man's bell is refused
   like any other — Astra's fix read 4 §1, a forged delete of an older run's line from his bell, with it.) */
/* A RESTORE'S "TAKEN BACK" / "AGAIN" LINE (his D2222): one part — `lwback` (an Undo: the line it names went) or an `lw`
   marked `again` (a Redo: the line it names came back) — naming by `ref` a line about the same man, of the same kind of
   change, that this restore's own verified replay (`replayed`) removed or put back. */
/* …AND ONLY THE LINE THAT RESTORE OWES, ONCE (fix read 6, fault B — the security read's SEC6-B, Astra's 1): this checked
   the part's kind, its `ref` and its reader, never what the line said, its name, day or input, nor how many named one
   line — so a genuine Undo of Kestrel's refusal of Osprey's LL of 15 Jul carried "OL 1–31 Dec 2027 approved · taken back"
   onto his bell, and any number of copies beside the real one. Now the line must be, field for field (what it says, its
   name, day, input and reader), one the follow-up writer itself would write for the line it names
   (leavewar/sync.ts followUpsFor, handed in by its probe — no probe, no follow-up), and the caller lets one through a
   named line (`refs`). Answers the `ref` it follows up, or null. */
/* …AND ONLY ONE IT OWES (fix read 7, fault F — Astra's A3): the probe is leavewar/sync.ts followUpsOwed — what the line
   says AND whether the restore owes it (his read of the line, a "taken back" a Redo answers), judged on the bell as it
   stood before this command (noticesBefore) and his read record as saved — the one body the writer asks too. */
type FollowUpsProbe = (changes: ReadonlyArray<Change>, dir: 'undo' | 'redo', notices: readonly any[]) => ReadonlyArray<{ of: any; to: string; name: string; day: string; iid: string; what: readonly any[] }>
let FOLLOWUPS: FollowUpsProbe | null = null
export function setFollowUpsProbe(fn: FollowUpsProbe | null): void { FOLLOWUPS = fn }
/* WHICH WAR LINES A COMMAND OWES (fix read 10, fault A — the security read's SEC10-1, Fable F10-1, F10-2, Astra): the war's
   writers (notices.ts noticeWar, noticePosting, noticePostingBack) are plain functions, so "minted by one of them in this
   command" (warMade) vouched for whoever called them — an admin's ordinary input command called noticeWar and put a
   made-up "your leave refused" on his own man's bell, which followed him to his new squadron (D2218, D2222). Now a war
   line is also owed by the command's own change of the war — a leave cell or war-approved leave of that man, a period
   opened or closed, a posting record (leavewar/sync.ts warLinesOwed, handed in here). No probe installed: nothing is owed,
   so no war line is let through but a verified replay. */
type WarLinesOwedProbe = (changes: ReadonlyArray<Change>, line: any) => boolean
let WAR_OWED: WarLinesOwedProbe | null = null
export function setWarLinesOwed(fn: WarLinesOwedProbe | null): void { WAR_OWED = fn }
/* WHICH HOLIDAY LINES A COMMAND OWES (fix read 11, fault C — Fable's F11-1, the security read's SEC11-4): noticeHoliday is
   a plain function too, so "minted by it in this command, signed by the actor" (holMade) let 142's admin call it in his
   own input command and put a made-up "holiday" line of his own words on 149's bells with no holiday made. A new holiday
   line is now also owed by the command's own change of the war that makes a working day a holiday — exactly that
   holiday, its own name, to the schedulers its maker's door tells (leavewar/sync.ts holidayLinesOwed, handed in here).
   No probe installed: nothing is owed, so no new holiday line passes as the holiday's own. */
let HOL_OWED: WarLinesOwedProbe | null = null
export function setHolidayLinesOwed(fn: WarLinesOwedProbe | null): void { HOL_OWED = fn }
/* (the holiday's maker is an admin where it is made: of the squadron whose war is loaded, as section 7b reads it; with no
   world door, one war shared, an admin in force) */
function holidayMakerAdmin(env: CommitEnvelope): boolean {
  const a = env.actor
  if (!a || a.role !== 'admin') return false
  const u = lwUnitNow()
  return !u || levelInForce(a, u, todayIso(), unitRowsBefore(env.changes)) === 'admin'
}
/* (signed as its writer signs it: a posting's own line by no one, every other war line by the actor's own person — none
   where the actor has no person, as me() then gives the writer — fix read 11, fault D) */
const warSignedBy = (n: any, self: string | null): boolean => (Array.isArray(n?.what) ? n.what : []).every((p: any) => {
  const k = String(p?.k)
  if (!WAR_LINE_KINDS.has(k) || k === 'oilhol') return true
  return k === 'po' ? n.by == null : (n.by == null ? null : String(n.by)) === self
})
/* (a line with a war part — the kinds only the war's own writers write) */
const warPart = (n: any): boolean => Array.isArray(n?.what) && n.what.some((p: any) => WAR_LINE_KINDS.has(String(p?.k)))
/* A KIND THE APP NEVER STORES (chat 147's two code reads — D2338; docs/data-model.md §11, the Notice row): his SANS-days
   line (`sansdue`) is only ever worked out on his bell (leavewar/sansunfiled.ts sansUnfiledLines), never written. Being no
   war kind, a stored one was judged as an input's line, so an admin's input command — or a member's, to the admin who
   filed for him — put "Your SANS availability · Planned, no availability filed" on a bell, reading as the app's own (no
   name), never going. A put of a line carrying one is refused in both sections, before every door — a verified replay
   too: no step of the app ever wrote one. */
const NEVER_STORED = new Set(['sansdue'])
const neverStored = (n: any): boolean => Array.isArray(n?.what) && n.what.some((p: any) => NEVER_STORED.has(String(p?.k)))
/* (a SANS-days part's days as its writer gives them: a list of ISO date strings — notices.ts reads them so too; ISO_DAY
   is this file's own, above) */
const isoDays = (d: unknown): boolean => Array.isArray(d) && d.every(x => typeof x === 'string' && ISO_DAY.test(x))
/* A LINE THAT READS AS ONE (fix read 10, fault A (d) — Fable F10-1): every line the app writes carries at least one part,
   each an object naming its kind. A line with no parts read as "about him" (noticeAboutHim) and followed a moved man;
   one whose part was null broke the bell's words. */
const lineMalformed = (n: any): boolean => !n || typeof n !== 'object' || !Array.isArray(n.what) || !n.what.length
  || n.what.some((p: any) => !p || typeof p !== 'object' || Array.isArray(p) || typeof p.k !== 'string'
    /* (…and a SANS-days part whose days are not a list of ISO dates — chat 147's reads: `days: 'Sat'` or `[5, 6]` broke
       the bell's words for its reader, who could not remove the line) */
    || ((p.k === 'sansdue' || p.k === 'sansback') && !isoDays(p.days))
    /* (…and a taken-back line's hidden days the same — D2341) */
    || (p.k === 'sansback' && p.hid !== undefined && !isoDays(p.hid)))
/* A RESTORE'S FOLLOW-UP TO HIS OWN MAN (fix read 10, fault A (b)): followUpOf below judges the one about a man of another
   squadron; a follow-up on his own man's bell — a "taken back" of bidding opened, an "again" — passed by warMade alone.
   Now it too must be one the restore owes (the probe, field for field), each owed line once (`used`). */
function restoreFollowUpOwed(env: CommitEnvelope, n: any, replayed: ((c: Change) => boolean) | null, used: Set<string>): boolean {
  if (!replayed || !FOLLOWUPS) return false
  const before = noticesBefore(env)
  for (const dir of ['undo', 'redo'] as const) {
    const src = env.changes.filter(x => x.collection === 'notices' && x.op === (dir === 'undo' ? 'delete' : 'put') && replayed(x))
    if (!src.length) continue
    const owed = FOLLOWUPS(src, dir, before)
    for (let i = 0; i < owed.length; i++) {
      const f = owed[i]!, key = `${dir}:${String(f.of?.id)}:${i}`
      if (used.has(key)) continue
      if (String(f.to) === String(n.to) && deepEqual(f.what, n.what) && deepEqual(f.name, n.name) && deepEqual(f.day, n.day) && deepEqual(f.iid, n.iid)) {
        used.add(key)
        return true
      }
    }
  }
  return false
}
/* the bell as it stood before this command: today's lines with every line the command touched put back as it was */
function noticesBefore(env: CommitEnvelope): any[] {
  const touched = new Map<string, Change>()
  for (const c of env.changes) if (c.collection === 'notices') touched.set(String(c.id), c)
  const out: any[] = NOTICES.filter(n => !touched.has(String(n.id)))
  for (const c of touched.values()) if (c.before && typeof c.before === 'object') out.push(c.before)
  return out
}
function followUpOf(env: CommitEnvelope, n: any, replayed: (c: Change) => boolean): string | null {
  const p: any = Array.isArray(n?.what) && n.what.length === 1 ? n.what[0] : null
  if (!p || typeof p.ref !== 'string' || !p.ref) return null
  const back = p.k === 'lwback' && p.d !== 'open' && p.d !== 'close'
  const again = p.k === 'lw' && p.again === true
  if ((!back && !again) || !FOLLOWUPS) return null
  /* the line it names, as this restore verifiably took it away (an Undo) or put it back (a Redo) */
  const src = env.changes.filter(x => x.collection === 'notices' && String(x.id) === p.ref && replayed(x) && x.op === (back ? 'delete' : 'put'))
  const owed = FOLLOWUPS(src, back ? 'undo' : 'redo', noticesBefore(env)).some(f => {
    const was = f.of, q: any = was && Array.isArray(was.what) ? was.what[0] : null
    return !!q && q.k === 'lw' && noticeAboutHim(was) && String(f.to) === String(n.to)
      && deepEqual(f.what, n.what) && deepEqual(f.name, n.name) && deepEqual(f.day, n.day) && deepEqual(f.iid, n.iid)
  })
  return owed ? p.ref : null
}
function adminOwnerViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role !== 'admin') return null
  const self = a.personId == null ? null : String(a.personId)
  let today: string | null = null, rows: UnitRows | null = null
  /* HIS OWN SQUADRON'S MAN: an admin of the person's home today, over the rows before the command. The read records
     (`seen:`, `apprseen:`, `reqseen:` — the bell's own, `noticeseen:`, is its owner's alone since round 4's SEC-R4-1,
     ownershipChecks) and every bell line ask this alone — but for the one audience line
     below (fix read 2 — the security read's 3: the audience half was asked of every line and all four read records, so
     once Hunter, 142's admin, held Plan of 149, 149's admin rewrote his read records and took 142's lines off his bell). */
  const ownsHome = (pid: string): boolean => {
    if (today == null) { today = todayIso(); rows = unitRowsBefore(env.changes) }
    const u = homeBefore(pid, today, rows!) ?? BOOT_UNIT
    return levelInForce(a, u, today, rows!) === 'admin'
  }
  /* …OR, FOR A SQUADRON'S OWN ADMIN LINE, ONE OF ITS ADMINS (the Plan audit's PC1 — the reshape plan §19, §6.2 step 6;
     D2202): a squadron's admin lines go to its admins at home AND its non-master Plan holders (accounts.ts adminsOf), so
     Kestrel's 149 posting line to Hunter, 142's admin holding Plan of 149, is his to write. Only for a line whose EVERY
     part is a war kind of that one squadron — a holiday's (`oilhol`, its `u`), a posting's or its take-back's (`po`,
     `poback`: the squadron of the man posted, his home today) — of which the actor is an admin and the reader one of its
     admins. Read over the rows before the command, on today, as the passes read it. */
  const lineSquadron = (n: any): string | null => {
    const parts: any[] = Array.isArray(n?.what) ? n.what : []
    if (!parts.length) return null
    let x: string | null = null
    for (const p of parts) {
      const k = String(p?.k)
      const u = k === 'oilhol' ? (typeof p.u === 'string' && p.u ? p.u : null)
        : (k === 'po' || k === 'poback') && p.who != null ? homeBefore(String(p.who), today!, rows!) : null
      if (!u || (x != null && x !== u)) return null
      x = u
    }
    return x
  }
  const ownsLine = (n: any, pid: string): boolean => {
    if (ownsHome(pid)) return true
    const x = lineSquadron(n)
    /* (the one audience — a master admin among them, §7 item 2) */
    return !!x && levelInForce(a, x, today!, rows!) === 'admin' && adminLineAudience(x, today!, rows!).includes(pid)
  }
  const changedInputs = new Set(env.changes.filter(c => c.collection === 'inputs').map(c => String(c.id)))
  let replayed: ((c: Change) => boolean) | null | undefined
  const followed = new Set<string>()
  const ownFollowed = new Set<string>()
  const sansBacks = new Set<string>()
  for (const c of env.changes) {
    const where = `${c.collection}/${c.id}`
    if (c.collection === 'notices') {
      /* (his own account's line — judged whole, first, by acctLineViolation: §16 D6′) */
      if (acctChange(c)) continue
      /* (fault M: no line already written is rewritten — before every door below) */
      if (c.op === 'put') {
        if (replayed === undefined) replayed = env.origin === 'restore' && REPLAY ? REPLAY(env) : null
        if (lineRewritten(c, replayed)) return `a bell line not as the pass writes it (${where})`
        /* (fix read 10, fault A (d): a line that reads as one — before every door) */
        if (lineMalformed(c.after) && !(replayed && replayed(c))) return `a bell line that will not read (${where})`
        /* (chat 147: a kind the app never stores — before the telling doors, a verified replay too) */
        if (neverStored(c.after)) return `a bell line the app only works out (${where})`
      }
      for (const n of [c.before as any, c.op === 'delete' ? null : (c.after as any)]) {
        if (!n || typeof n !== 'object' || n.to == null) continue
        /* (THE HOLIDAY LINE'S CROSSING SKIP IS GONE — his D2195, the reshape plan §7, A4 with PB3: a new line of holiday
           parts minted and owed here, or the verified replay of one, skipped every check below, so it could reach any
           squadron's bell. A holiday is now its own squadron's, its line to that squadron's admins (leavewar/sync.ts
           holidayTodo — accounts.ts adminsOf), so it takes the ordinary checks: the squadron door just below, then the
           war-line check, which keeps fix reads 8 to 11's holiday rules — no input named, no filer's mark, minted by
           noticeHoliday in this command, signed by the actor, owed by this command's own holiday, by an admin where it is
           made.) */
        const to = String(n.to)
        /* (…written as the pass writes it: by the actor himself, or with no maker in the app's own acts — fix read 6, fault
           A: the security read's SEC6-A (3), a line riding the change signed `kes9`, posing as 149's admin. The member
           section's door below has always asked it.) */
        /* (…and with no maker only where the pass itself wrote it in this command — fix read 7, fault S: the security
           read's SEC7-3, an admin labelling his own command `lw.postout` rode an unsigned line to another squadron's man;
           a command's type is only a label, so the app's own act is known by the lines its pass minted — notices.ts
           passMade, written only by sched-commit.ts tellPass) */
        const signed = (self != null && String(n.by ?? '') === self) || (n.by == null && APP_ACTS.has(env.type) && !!passMade(env)?.has(String(n.id)))
        /* (…and never a war part riding it, as the member section's door below has always refused — fix read 10, fault A
           (c), Fable F10-2: an `lw` part on a line naming the input the command changes passed here, before the war check) */
        if (signed && n.iid && changedInputs.has(String(n.iid)) && toldBy(env, n.iid)?.has(to) && filerMarkOk(env, c, n) && !warPart(n)) continue
        /* HIS OWN STEP, PUT BACK (fix read 3, O2 — D148: an Undo is refused only where the change itself would be). The
           war's lines carry no input (`iid: ''`), so a man told by the admin's Open for bidding, closing or decision who
           has since moved squadron made the top bar's Undo of that step a write to another squadron's bell, refused
           whole. Passed over ONLY for the restore the timeline is applying of this same admin's own step, the line image
           for image what that step recorded (undo/timeline.ts verifiedReplay), and a line he himself made (`by`). */
        /* …AND ONLY TAKING A LINE AWAY (fix read 4, claim 2 — the Opus read's §2; his D2218): a Redo passed here too and put
           149's "Bidding open" back on Osprey, 142's since his move — a line the action itself would not write that day.
           A line put back on a man whose bell it has left is left out of the restore before it reaches here (state/
           undo-wire.ts leaveOut); one put on another squadron's man for any other reason is judged as any write. */
        /* …OR PUTTING BACK A LINE ABOUT ITS ADDRESSEE HIMSELF (fix read 5 — the Opus read's 1 and 2, Astra's 2; his D2222,
           19 Nov 26: "A bell line about a moved man's own leave follows him … and its Redo puts the line back"). A decision
           on Osprey's own leave stays on his bell after his move (state/notices.ts noticeAboutHim, so undo-wire's leaveOut
           keeps it in the restore), and the delete-only pass above refused Kestrel's Redo whole. Only a line about its
           addressee, only as the verified replay of this admin's own step, image for image — a squadron-business line
           (bidding open or closed) is still left out of the restore before it reaches here, and judged as any write. */
        if (to !== self && env.origin === 'restore' && self != null && String(n.by ?? '') === self
          && (c.op === 'delete' || (c.before == null && noticeAboutHim(n)))) {
          if (replayed === undefined) replayed = REPLAY ? REPLAY(env) : null
          if (replayed && replayed(c)) continue
          /* …AND ITS "TAKEN BACK" OR "AGAIN" FOLLOW-UP (D2222 with D1693, D1699): written inside that same restore (the
             undo's `reversed` hook — leavewar/sync.ts warNoticesReversed — joins the restore's envelope), a fresh line by
             this admin naming (`ref`) a line about the same man that this very restore verifiably took away (an Undo) or
             put back (a Redo). Nothing else in the envelope vouches for it: a forged restore gets no replay at all. */
          if (replayed && c.op === 'put') {
            const ref = followUpOf(env, n, replayed)
            /* (one follow-up a line it names, in one command — fix read 6, fault B (2): an exact copy of the real line
               rode beside it) */
            if (ref && !followed.has(ref)) { followed.add(ref); continue }
          }
        }
        /* A POSTING'S LINE TAKEN AWAY WITH ITS POSTING, SHOWN OR HIDDEN (batch 1's second half, plan §16 D1′c — R3-O7):
           "Undo post out" takes every stored line of the run, a line its reader's bell now hides among them (he lost the
           Plan that brought it — notices.ts rightHolds), so a later Undo giving the right back shows none about a posting
           taken back. Only a removal, only of a posting line stamped with a squadron the actor is an admin of in force,
           only where this command takes that man's posting back — his posting record changed, not merely re-saved as it
           ran (and so owed by the war, warLinesOwed) — and never a line that has left a moved man's bell (his D2218: no
           squadron's command touches another's bell; fix read 4, Astra §1). */
        const poRec = n === c.before && Array.isArray(n.what) && n.what.length === 1 && n.what[0]?.k === 'po'
          ? env.changes.find(x => x.collection === 'lw.postouts' && String(x.id) === String(n.what[0].who)) : undefined
        if (to !== self && poRec && poRec.before != null && !deepEqual(poRec.before, poRec.op === 'delete' ? null : poRec.after)
          && (c.op === 'delete' || c.after == null) && typeof n.u === 'string' && n.u && !noticeLeftBell(n) && !!WAR_OWED?.(env.changes, n)) {
          if (today == null) { today = todayIso(); rows = unitRowsBefore(env.changes) }
          if (levelInForce(a, n.u, today, rows!) === 'admin') continue
        }
        if (to !== self && !ownsLine(n, to)) return `a bell line of another squadron's man (${where})`
        /* (fault M: the own-man fallback no longer lets through an input line the pass would not write) */
        if (n === c.after && inputLineUnlike(env, c, changedInputs, replayed ?? null)) return `a bell line not as the pass writes it (${where})`
        /* A WAR LINE ONLY FROM THE WAR'S OWN WRITERS (fix read 9, fault D — the security read's SEC9-2; docs/data-model.md
           §11): noticeWar, noticePosting and noticePostingBack alone write a line with a war part (WAR_LINE_KINDS), each
           recording the ids it mints in the running command (notices.ts warMade). A 142 admin's ordinary input command put
           `{to:'prowler', iid:'', what:[{k:'lw', …}]}` in his own words on his own man's bell; the own-man door above let it
           through, and being about him it followed Hunter to 149 for good (D2218, D2222). Asked after that door and fault
           M's, so a line they refuse keeps their words: a put of such a line passes only as one of those writers minted it
           here, or as the verified replay of a step (undo/timeline.ts verifiedReplay) — a restore's follow-up passed above
           already. noticeHoliday's own new line was skipped before this loop's checks. */
        /* …AND ONLY ONE THE COMMAND'S OWN CHANGE OF THE WAR OWES (fix read 10, fault A (a), (b) — the security read's
           SEC10-1, Astra): warMade vouched for whoever called the writer, and they are plain functions, so an ordinary
           input command called noticeWar or noticePosting itself. Now such a line passes only as a verified replay, or
           minted here AND owed — by this command's own change of that man's leave, of the period's open stretches or of
           that posting (WAR_OWED: leavewar/sync.ts warLinesOwed), or, in a restore, as the "taken back" or "again" line
           it owes (restoreFollowUpOwed). */
        if (n === c.after && warPart(n)) {
          if (replayed === undefined) replayed = env.origin === 'restore' && REPLAY ? REPLAY(env) : null
          if (!(replayed && replayed(c)) && holidayLine(n)) {
            /* THE HOLIDAY'S OWN LINE (its rules moved here whole from the crossing skip, his D2195): only as noticeHoliday
               writes it — naming no input and carrying no filer's mark (fix read 8, fault H: a marked or input-naming one
               outlived a man's move, D2218) — and only as it minted it in this command (fix read 10, fault B: holMade,
               written only by noticeHoliday); signed by the admin himself, as tellHoliday writes it (noticeHoliday is a
               plain function, so its registry alone would vouch for a line it was called to sign as another); and owed by
               this command's own holiday, by one who is an admin of the war's squadron (fix read 11, fault C: HOL_OWED) */
            if (n.iid || n.fu !== undefined || !holMade(env)?.has(String(n.id))) return `a war line no war command wrote (${where})`
            if (self == null || String(n.by ?? '') !== self) return `a war line not signed as its writer signs it (${where})`
            if (!(HOL_OWED && HOL_OWED(env.changes, n)) || !holidayMakerAdmin(env)) return `a war line no change of the war owes (${where})`
          } else if (!(replayed && replayed(c))) {
            if (!warMade(env)?.has(String(n.id))) return `a war line no war command wrote (${where})`
            /* (…in its writer's own hand — fix read 11, fault D, Fable's F11-2: noticeWar signs with whatever it is given, so
               142's admin's line on his man's bell read "refused · Saber". The war's writers sign as the war's doors do: a
               decision, bidding opened or closed, a "taken back" or "again" and a posting's "taken back" by the admin who
               made the change (leavewar/sync.ts tellWar, tellBidding, the restore's follow-ups, retractPostingLines — each
               me()); a posting's own line by no one, the posting acting (noticePosting)) */
            if (!warSignedBy(n, self)) return `a war line not signed as its writer signs it (${where})`
            if (!(WAR_OWED && WAR_OWED(env.changes, n)) && !restoreFollowUpOwed(env, n, replayed, ownFollowed)
              /* (…or the "taken back" a Redo owes the line its step's Undo wrote — sansUndoToldOwed, below) */
              && !(env.origin === 'restore' && SANS_UNDO_TOLD && SANS_UNDO_TOLD(env, c))) return `a war line no change of the war owes (${where})`
            /* (one struck SANS-days line a man and posting, in one command — chat 147's reads: one take-back owes one line,
               as restoreFollowUpOwed's `used`; 25 copies rode one posting command) */
            const sb = (n.what as any[]).find((p: any) => p && p.k === 'sansback')
            if (sb) {
              const key = `${String(n.to)}|${String(n.day)}`
              if (sansBacks.has(key)) return `a war line no change of the war owes (${where})`
              sansBacks.add(key)
            }
          }
        }
        /* A LINE NAMING NO INPUT (fix read 10, fault A (d) — Fable F10-1): only the war's lines (above), the holiday's
           (skipped before this loop's checks — fault B) and a verified replay name no input. Any other was a line in the
           admin's own words, about nothing, that followed a moved man (noticeAboutHim read a line with no part as his). */
        if (n === c.after && c.op === 'put' && !n.iid && !warPart(n)) {
          if (replayed === undefined) replayed = env.origin === 'restore' && REPLAY ? REPLAY(env) : null
          if (!(replayed && replayed(c))) return `a bell line about nothing the command changed (${where})`
        }
      }
      /* (fault T: a new line is dated now — asked last, so a line refused on another count keeps its own words) */
      if (lineNotNow(c, replayed ?? null)) return `a bell line not dated now (${where})`
      /* (§7 item 1: its squadron's stamp — after the date, so a line refused on another count keeps its own words) */
      if (lineStampWrong(env, c, replayed ?? null)) return `a bell line not as the pass writes it (${where})`
      continue
    }
    if (c.collection !== 'settings') continue
    /* the name with its squadron split off (§15 D14): the Approvals moment is a row of the war's squadron since R2,
       `u149@apprseen:<pid>` (state/apprseen.ts) — read as its plain name, it is judged as every read record is */
    const id = split(String(c.id)).local
    /* (job 2, 19 Nov 26 — the security read's SEC-1: an admin's Approvals moment, `apprseen:<pid>`, and his record of
       the access requests he has seen, `reqseen:<account>`, are read records too — 142's plain admin set 149's admin's) */
    /* (a bell's read record, `noticeseen:<pid>`, is no longer asked here: it is its owner's alone whoever writes, asked
       of every actor before this check — ownershipChecks, round 4's SEC-R4-1 — so only an admin's own row reaches here) */
    const pfx = id.startsWith('seen:') ? 'seen:' : id.startsWith('apprseen:') ? 'apprseen:' : id.startsWith('reqseen:') ? 'reqseen:' : null
    if (!pfx) continue
    const pid = pfx === 'reqseen:' ? String(ACCOUNTS_LIST.find(x => x.id === id.slice(pfx.length))?.pid ?? '') : id.slice(pfx.length)
    if (!pid) continue                                  // (an account with no person names no squadron to judge by)
    if (pid !== self && !ownsHome(pid)) return `another squadron's man's read record (${where})`
  }
  return null
}

/* A RECORD ALREADY WRITTEN IS NEVER WRITTEN AGAIN AS NEW (fix read 10, fault C — the security read's SEC10-2): every
   check of a change reads its before-image, and the scheduler store takes its before-image from memory, which a write
   outside every command can blank — drop a line or an input from memory, and the next command's resync takes the drop
   up, never saved. A "new" record under the same id then went out as a put with no before-image: a 142 admin rewrote
   149's holiday line, put any line of another bell on his own, or replaced 149's man's leave request with his own input,
   each overwriting the STORED row. So a put with no before-image of a request or a bell line whose id already has a
   stored row (the saved copy — the whiteboard, through its probe, never memory) is refused. A remote or seed change is
   not a person's; it is not asked. No probe (a test without saved rows): nothing is asked. (A week load's landing raises
   no command since 1 Oct 26 — sched-commit.ts SCHED_TYPES.load, retired; it was passed over here by its label, and any
   command could carry that label — fix read 11, fault B, below: no longer.) */
/* (the probe answers the stored row itself, as saved — or null where none is: fix read 11, fault A) */
type StoredRowProbe = (collection: 'inputs' | 'notices', id: string) => string | null
let STORED: StoredRowProbe | null = null
export function setStoredRowProbe(fn: StoredRowProbe | null): void { STORED = fn }
const storedRow = (collection: 'inputs' | 'notices', id: string): string | null => (STORED ? STORED(collection, id) ?? null : null)
function writtenAsNewViolation(env: CommitEnvelope): string | null {
  if (!STORED || env.origin === 'remote' || env.origin === 'seed') return null
  for (const c of env.changes) {
    if (c.op !== 'put' || c.before != null || (c.collection !== 'inputs' && c.collection !== 'notices')) continue
    if (c.collection === 'inputs' && c.id === INPUT_ORDER) continue
    if (storedRow(c.collection, String(c.id)) != null) return `a record already written (${c.collection}/${c.id})`
  }
  return null
}
/* A SAVED RECORD IS JUDGED AS SAVED, NOT AS MEMORY HOLDS IT (fix read 11, fault A — the fresh Opus read's O11-1, the
   security read's SEC11-1, SEC11-2): the scheduler store takes a change's before-image from memory, and memory can be
   REWRITTEN outside every command as well as blanked (fault C of fix read 10, above) — 142's Outlaw renamed 149's man's
   saved request to his own man in memory, then edited or deleted "his" request; or re-addressed a line on 149's admin's
   bell to himself, then cleared it: each command was judged against the rewritten image, so the gate let it through and
   the STORED 149 record was overwritten or deleted. So every change of a request or a bell line — put or delete — whose
   id has a stored row is judged a second time, by the same checks, on a copy of the command whose before-image is that
   stored row; either failing refuses it. Never the rows compared whole: a week load's landing marks change memory on
   purpose and are never saved (persist.ts wireRows), and the checks already read a landing as none. Not the inputs'
   order row (it names no one), not a remote or seed change (not a person's), and not where no probe is installed (a test
   without saved rows). The no-before-image rule above stands. */
/* …AND A RECORD NEVER SAVED IS JUDGED AS NEW (fix read 12, fault D — the security read's SEC12-2, the missing half of fix
   read 11's A): a before-image made up in memory for a record no saved row holds — Ranger's own leave "filed by Kestrel"
   a month ago, a line on Hunter's own man's bell dated 2099 — was judged as an edit of that made-up record, so the rules
   for a NEW one (a member's request filed by himself, now; a line dated now; a war or holiday line its writer minted)
   were never asked. So a put of a request or a bell line whose id has NO saved row, though the change carries a
   before-image, is judged a second time with no before-image. Honest paths, each checked (fix read 12's tests):
   - the seeded records of a saved copy not yet started: a store that has not started holds the seed in memory until
     persist.ts writeSeedRows writes it (wirePersist, at boot) — so this is asked only once the saved copy is WHOLE
     (`setStoredRowsWhole`: seeded or hydrated), never on a whiteboard merely wired;
   - a record that came by a remote change, never written locally (rowmap.ts: a remote change applies silently): its ids
     are noted as they land and not asked;
   - an Undo or Redo (origin `restore`, raised only by the app's own timeline — the command layer derives a person's
     command as `user`, never a caller) puts back images its step recorded, and that step was judged here when it was
     made, so a restore is not asked;
   - a tried save (store.ts tryInputsBatch) is thrown away inside its body and never reaches this gate. */
let STORED_WHOLE = false
export function setStoredRowsWhole(on: boolean): void { STORED_WHOLE = on }
const REMOTE_ONLY = new Set<string>()
let SECOND_PASS = false
/* …AND A COMMAND THAT STANDS CARRIES THE SAVED IMAGES (fix read 13, item A — the fresh Opus read's O13-1, Fable's F13-1,
   the security read's SEC13-2). Two doors were left: (a) a REMOVAL of a record no saved row holds (a delete, or a put
   that leaves nothing) was never asked — judged as the removal of the made-up record, so Ranger's own leave "filed by"
   Hunter, made up in memory and deleted, put a saved line on Hunter's bell about a request that never existed; it is
   refused now, under the same exemptions as the put above (not whole, a restore, a remote record). (b) The Undo step of
   a command records the change's before-image and puts it back as a restore, which none of these checks asks — so a
   saved request rewritten in memory, then deleted (judged, rightly, as the delete of the SAVED row), came back on Undo as
   the rewrite. A command judged against the saved rows therefore leaves this gate carrying them: each such removal's
   before-image becomes the saved row, the image it was judged by, and the step records that. Handed back as the changes to carry once every check has passed (ownershipViolation, below); a restore keeps the
   images its step recorded. */
function storedRowViolation(env: CommitEnvelope): string | Change[] | null {
  if (env.origin === 'remote') {
    for (const c of env.changes) if (c.collection === 'inputs' || c.collection === 'notices') REMOTE_ONLY.add(`${c.collection}/${c.id}`)
    return null
  }
  if (!STORED || SECOND_PASS || env.origin === 'seed') return null
  let moved: string | null = null
  let unsaved: string | null = null
  let gone: string | null = null
  const changes = env.changes.map(c => {
    if ((c.collection !== 'inputs' && c.collection !== 'notices') || (c.collection === 'inputs' && c.id === INPUT_ORDER)) return c
    const raw = storedRow(c.collection, String(c.id))
    if (raw == null) {
      if (!STORED_WHOLE || env.origin === 'restore' || c.before == null || REMOTE_ONLY.has(`${c.collection}/${c.id}`)) return c
      /* (fix read 13, item A (a): a removal of it — a delete, or a put that leaves nothing — has no record to remove) */
      if (c.op === 'delete' || c.after == null) { gone ??= `${c.collection}/${c.id}`; return c }
      unsaved ??= `${c.collection}/${c.id}`
      return { ...c, before: null }
    }
    let saved: unknown
    try { saved = JSON.parse(raw) } catch { return c }
    if (sameJson(saved, c.before)) return c
    moved ??= `${c.collection}/${c.id}`
    return { ...c, before: saved }
  })
  if (gone) return `a record never saved, taken away as if it were (${gone})`
  if (!moved && !unsaved) return null
  SECOND_PASS = true
  try {
    /* the copy vouches for exactly the lines this command minted (notices.ts shareMade) */
    const copy: CommitEnvelope = { ...env, changes }
    shareMade(env, copy)
    const why = ownershipViolation(copy)
    if (why) return moved ? `a saved record changed outside the app's doors (${moved}): ${why}` : `a record never saved, changed as if it were (${unsaved}): ${why}`
  } finally { SECOND_PASS = false }
  /* (b) a removal's image is carried whole: its after is nothing, so its Undo puts back exactly what is carried here.
     …AND A PUT'S TOO (fix read 14, item A — the security read's SEC14-1): only a removal's was carried, so a put kept
     memory's before-image, the Undo step recorded it and its restore put it back unasked — Ranger set `lw` on his own saved
     leave in memory, saved an honest edit that dropped it (a member may drop `lw`) and pressed Undo: the saved row read
     "approved on the war". A put now carries the saved row too, keeping from memory only what a week load's landing
     writes there and never saves (withLanding, below — the filing mark 'g' alone), so the timeline's line reads no
     landing as a change of its own; a put of a record never saved carries no before-image, so its Undo takes the record
     away rather than putting back the made-up one. A bell line's put carries the saved row whole.
     …AS A CREATE, ITS BEFORE-IMAGE ABSENT (fix read 15 — Astra 2): it was carried as `before: null`, but Undo reads a
     create only where the before-image is absent (undo/derive.ts invertChange: `before === undefined`), so it built a
     put of null and the Undo failed whole. The second pass above judges it with `null`, as every check reads either. */
  if (env.origin === 'restore') return null
  const carry = env.changes.map((c, i) => {
    const j = changes[i]!
    if (j !== c && c.op !== 'delete' && c.after != null && j.before === null && c.before != null) { const { before: _gone, ...create } = j; return create }
    if (j === c || c.op === 'delete' || c.after == null || j.before == null || c.collection !== 'inputs') return j
    return { ...j, before: withLanding(j.before, c.before) }
  })
  return carry.some((c, i) => c !== env.changes[i]) ? carry : null
}
/* what a week load's landing writes in memory and never saves — the filing mark 'g' alone (engine/holderbase.ts and the
   day's reconcile write 'g' or nothing, skipping 'u' and 'r'; `said` above and sched-commit.ts's restore strip read it the
   same way) — taken from memory's image onto the saved one, present or absent as memory has it.
   ONLY 'g' (fix read 15 — the security reader's SEC15-1, the fresh Opus reader's O15-1, Fable's 1): fix read 14 took
   memory's `acc` and `odGround` whatever their values, but 'u' (filed under Unavailable) and 'r' (Remove — the
   scheduler's, D1388) are saved filings, and `odGround` is written only inside a command. So Ranger cleared the Remove on
   his own leave in memory, saved an honest edit putting it back with new words, and Undo saved the leave with no Remove.
   Now a filing that is 'u' or 'r' on either side is the saved row's, and `odGround` always is. */
function withLanding(saved: unknown, mem: unknown): unknown {
  if (!saved || typeof saved !== 'object' || !mem || typeof mem !== 'object') return saved
  const s = (saved as any).acc, m = (mem as any).acc
  const landing = (v: unknown) => v === 'g' || v == null
  if (!landing(s) || !landing(m) || s === m) return saved
  const out: any = { ...(saved as any) }
  if (m === 'g') out.acc = 'g'; else delete out.acc
  return out
}

/* A LABEL NO DOOR WEARS IS REFUSED (fix read 11, fault B — Fable's F11-3, the security read's SEC11-3): the week load's
   own command, `sched.load`, is retired (sched-commit.ts SCHED_TYPES.load: nothing raises it), yet the gate still passed
   a command so labelled over its "already written" check — and a command's label is whatever its caller passes
   (commitInputs, commitSchedValue take any type). So 142's Outlaw replayed fix read 10's SEC10-2 under that label, and
   149's stored line was overwritten. A person's command of that type is refused outright. */
const RETIRED_TYPES = new Set(['sched.load'])

/* SANS AVAILABILITY ONLY ON HIS SANS DAYS, AT THE FINAL SAVE (owner D2340 — Astra's read #3 = the fresh Opus read's F8,
   chat 152): the windows refuse a day before his SANS date (ui/inputedit.tsx sansRefusal), and this holds the same rule
   for every command and every role — a hand-made batch, a paste, an admin's save — before against after
   (engine/inputs.ts sansNewDayProblem), so a stored record a later posting change hid still saves as it stands. His Undo
   or Redo, the step the timeline vouches for, puts back what it took (the record's days hide again by themselves). */
/* A MAN'S OWN PART OF A SHARED RECORD, SPLIT OFF IN THE SAME COMMAND (Astra's fix re-read #4, chat 154): deleting Hex
   keeps his past part of a shared offer as a record of its own (engine/inputown.ts ownInputOf — D299), a new row with no
   before-image, so the check above read his days in it as new and, Hex being hidden that day (D2341), refused the delete.
   Such a row is judged against the record it came from: one of this command's own SANS records whose before held him
   and whose after no longer does — so only days or people that record did not already hold are asked. A delete may take
   him out of several shared records at once (the fresh Opus re-read 2's F4, chat 155), so EVERY such record is a
   candidate, and the row passes where any one of them already held all of it. */
/* …and a candidate must BE that record's copy (Astra's fix re-read 2, #2, chat 155: two fresh records of a member's own,
   each "borrowing" the one offer he took himself out of, both saved): the copy the delete makes (engine/inputown.ts
   ownInputOf) keeps the record's kind, first day, filing stamp (`by`, `at`) and his own entry as they were — only its id,
   its end, its printed till and its change stamps move — and each record vouches for one copy only (`used`). */
type InputChange = CommitEnvelope['changes'][number]
function splitSourcesOf(env: CommitEnvelope, c: InputChange): InputChange[] {
  if (c.before != null || !c.after) return []
  const ids = namedOf(c.after).map((e: any) => String(e.p))
  if (ids.length !== 1) return []
  const p = ids[0]
  // any: an input record is untyped (a verbatim port, src/engine/inputs.ts)
  const a: any = c.after
  const mine = (r: any) => (Array.isArray(r.people) ? r.people : []).find((e: any) => e && String(e.p) === p)
  const out: InputChange[] = []
  for (const s of env.changes) {
    if (s === c || s.collection !== 'inputs' || s.op !== 'put' || !s.before || !s.after) continue
    const b: any = s.before
    if (!isSansAvail(b.type) || !holds(b, p) || holds(s.after, p)) continue
    /* (the first day compared as a day, not as text — a door that re-states it under the week in view writes the same day
       another way: the fresh Opus re-read 3's F2) */
    const sb = inputSpanIso(b), sa = inputSpanIso(a)
    if (b.type !== a.type || !sb || !sa || sb[0] !== sa[0] || b.by !== a.by || b.at !== a.at) continue
    if (!Array.isArray(a.people) || a.people.length !== 1 || !deepEqual(mine(b), a.people[0])) continue
    out.push(s)
  }
  return out
}
function sansDayViolation(env: CommitEnvelope): string | null {
  const used = new Set<InputChange>()
  for (const c of env.changes) {
    if (c.collection !== 'inputs' || c.op !== 'put' || !c.after) continue
    let bad = sansNewDayProblem(c.before, c.after)
    if (bad) for (const s of splitSourcesOf(env, c)) {
      if (used.has(s)) continue
      const b = sansNewDayProblem(s.before, c.after)
      if (!b) { used.add(s); bad = null; break }
    }
    if (!bad) continue
    if (env.origin === 'restore' && REPLAY && REPLAY(env)?.(c)) continue
    return `SANS availability for ${bad[0]} on ${bad[1]}, not one of his SANS days (inputs/${c.id})`
  }
  return null
}
/* HIS SANS CHANGE LINE IS TAKEN AWAY ONLY BY THE UNDO OR REDO OF THE STEP THAT HOLDS IT (Astra's read #2, chat 152 — D2341,
   D2338; narrowed by the four reads of 0eaacc411 — the security read's SEC156-3, the Opus read's F3): a delete has no
   after-image, so an ordinary input command of an admin's took it off his bell. It used to pass in a command that changed
   that man's posting too — but since D2391 no writer takes a stored SANS line away (the live reminder is worked out, never
   stored; a line a later one replaces is hidden by its `over`, never deleted), so that door was used by nothing honest,
   and a hand-made posting command took his "You're no longer SANS." away with it. Now only the verified replay of a step
   (undo/timeline.ts verifiedReplay) passes. A rewrite is lineRewritten's. */
/* …OR THE REDO THAT FOLLOWS THE UNDO WHICH WROTE IT (round 2 of the reads of f73602f9f — Astra's F1, the Opus read's R2, Fable's
   F2): an admin's Undo of a SANS tick he put on, or of a SANS posting, tells the man (leavewar/sync.ts warNoticesReversed) —
   a line no step holds, so the Redo after it could not take it back, and "You're no longer SANS." stood on the bell of a man
   SANS again. The Redo now takes it back as every bell line is (D1693, D1699): gone where he had not read it, struck "taken
   back" where he had. Only for that relationship, vouched for by the war's side (leavewar/sansunfiled.ts installs it): the
   restore the timeline is applying right now is a Redo of that same person's step, the line is one that step's Undo wrote,
   and the change is exactly its retraction — none installed, none passes. */
type SansUndoToldProbe = (env: CommitEnvelope, c: Change) => boolean
let SANS_UNDO_TOLD: SansUndoToldProbe | null = null
export function setSansUndoTold(fn: SansUndoToldProbe | null): void { SANS_UNDO_TOLD = fn }
function sansBackEraseViolation(env: CommitEnvelope): string | null {
  for (const c of env.changes) {
    if (c.collection !== 'notices' || c.op !== 'delete') continue
    const b: any = c.before
    if (!b || !Array.isArray(b.what) || !b.what.some((p: any) => p && p.k === 'sansback')) continue
    if (env.origin === 'restore' && REPLAY && REPLAY(env)?.(c)) continue
    if (env.origin === 'restore' && SANS_UNDO_TOLD && SANS_UNDO_TOLD(env, c)) continue
    return `his SANS-days line taken away by no Undo or Redo of its own step (notices/${c.id})`
  }
  return null
}
/* NO HIDDEN PLANNING MARK, AND SO NO CHECK OF ONE (his D2560, 24 Nov 26; docs/data-model.md §11 — together, D200): a SANS
   man's reminder once lit again by a stamp on each day he was newly put on, `settings/sansplan:<pid>:<iso>`, written by
   a projection this gate vouched for by the command that caused it. Three rounds of blind reads found faults there —
   round 3's: a member lit another man's reminder by naming a finished planning as his projection's cause (Astra F1), and
   the stamp could be frozen so nobody was told again (the security read's SEC-R3-1, SEC-R3-2). The reminder now lights
   again only for a day not in it when he read it, read from his own read record (leavewar/sansunfiled.ts readOf), which
   only he writes — true of every actor only since round 4's security read (SEC-R4-1): the app's own projection and an
   admin's command wrote it until then (the `noticeseen:` block in ownershipChecks, before every role's early return; a
   member's own command type, below). Nothing reads a `sansplan:` row any more. */
export function ownershipViolation(env: CommitEnvelope): string | null {
  if (env.origin === 'user' && RETIRED_TYPES.has(env.type)) return `a retired command type (${env.type}) — no door raises it`
  const stored = storedRowViolation(env)
  if (typeof stored === 'string') return stored
  const why = ownershipChecks(env)
  /* (item A (b), above: a command that stands carries the images it was judged by) */
  if (!why && stored) env.changes = stored
  return why
}
/* 8b. A WAITING REQUEST IS ITS SQUADRON'S (batch 1's second half §5 — D2111, D2094; §15 D12, his D2324). A request
   (`accessreq:<id>`) names the squadron he asks to join: a row written must name a squadron in the store; and a change
   of one by an admin — answering it (approve, decline, an account added or renamed under its name, a delete taking his
   account) or putting it back (an Undo) — needs him an admin of that squadron (its own admin, a Plan holder of it, a
   master admin), as the rows stood before the command; a row moved to another squadron needs both. The pending
   person's own request is held by its own rule (section 7, below); the app's own posting pass, which runs as the app,
   is not asked. A row of before §5 has no squadron and reads as the boot squadron's (D56 — accounts.ts reqsLoad). */
const REQ_ROW = 'accessreq:'
const reqUnit = (v: any): string => (v && typeof v.unit === 'string' && v.unit ? v.unit : BOOT_UNIT)
/* …AND AN ACCOUNT ADDED OR RENAMED ONTO A WAITING REQUEST'S NAME ANSWERS IT, its row touched or not (the second half's
   final reads, R5 — the security read's 1): the loader drops a request whose sign-in name has an account (accounts.ts),
   so a hand-made `account.add`, `account.addNew` or `account.update` rename under a 149 requester's name, the request row
   left alone, answered it — the newcomer in as a 142 admin of the 142 admin's choosing. So every account row a command
   writes under a name it did not carry before, where a request waited under that name before the command, needs an
   admin of that request's squadron, as the rows stood before the command (§15 D12, "whatever path"). An admin actor only,
   as above. */
function requestAnsweredByAccount(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role !== 'admin') return null
  const accts = env.changes.filter(c => c.collection === 'settings' && String(c.id).startsWith(ACCOUNT_ROW) && c.op !== 'delete' && c.after != null)
  if (!accts.length) return null
  const nm = (s: unknown): string => String(s ?? '').trim().toLowerCase()
  /* the requests waiting BEFORE the command: those stored now, with each this command changed put back as it stood */
  const waiting = new Map<string, any>()
  for (const k of store.keys(REQ_ROW)) { const v: any = store.get(k, null); if (v) waiting.set(k, v) }
  for (const c of env.changes) {
    if (c.collection !== 'settings' || !String(c.id).startsWith(REQ_ROW)) continue
    if (c.before == null) waiting.delete(String(c.id)); else waiting.set(String(c.id), c.before)
  }
  if (!waiting.size) return null
  const unitOfName = new Map<string, string>()
  for (const v of waiting.values()) if (v && v.name) unitOfName.set(nm(v.name), reqUnit(v))
  const before = unitRowsBefore(env.changes), today = todayIso()
  for (const c of accts) {
    const id = String(c.id).slice(ACCOUNT_ROW.length)
    const was: any = accountBefore(id, c.before), name = nm((c.after as any).name)
    if (!name || (was && nm(was.name) === name)) continue
    const u = unitOfName.get(name)
    if (u && levelInForce(a, u, today, before) !== 'admin') return `a request to join ${u} answered by one who is not its admin (${c.collection}/${c.id})`
  }
  return null
}
function requestRowViolation(env: CommitEnvelope): string | null {
  const answered = requestAnsweredByAccount(env)
  if (answered) return answered
  const reqs = env.changes.filter(c => c.collection === 'settings' && String(c.id).startsWith(REQ_ROW))
  if (!reqs.length) return null
  const after = unitRowsBefore([])
  for (const c of reqs) {
    const n: any = c.op === 'delete' ? null : c.after
    if (n != null && JSON.stringify(c.before ?? null) !== JSON.stringify(n)
      && (typeof n.unit !== 'string' || !after.units.some(u => u.id === n.unit))) return `a request naming no squadron in the store (${c.collection}/${c.id})`
  }
  const a = env.actor
  if (!a || a.role !== 'admin') return null
  const before = unitRowsBefore(env.changes), today = todayIso()
  for (const c of reqs) {
    const b: any = c.before ?? null, n: any = c.op === 'delete' ? null : c.after ?? null
    if (JSON.stringify(b) === JSON.stringify(n)) continue
    for (const u of new Set([b, n].filter(Boolean).map(reqUnit))) {
      if (levelInForce(a, u, today, before) !== 'admin') return `a request to join ${u} answered by one who is not its admin (${c.collection}/${c.id})`
    }
  }
  return null
}
/* the squadrons the waiting requests name, as stored after the command (the gate reads the store once the command has
   written it) — a squadron one names is never removed under it (§5 item 4, R-O11) */
function requestsNaming(unit: string): boolean {
  for (const k of store.keys(REQ_ROW)) { const v: any = store.get(k, null); if (v && reqUnit(v) === unit) return true }
  return false
}
const BELL_ROW = 'bellsqn:'
function bellSqnRowViolation(env: CommitEnvelope): string | null {
  const rows = env.changes.filter(c => c.collection === 'settings' && String(c.id).startsWith(BELL_ROW))
  if (!rows.length) return null
  const a = env.actor
  const units = new Set(unitRowsBefore([]).units.map(u => u.id))
  for (const c of rows) {
    const where = `${c.collection}/${c.id}`
    if (env.type !== 'bell.squadrons' || !a || a.role === 'system' || a.personId == null || c.id !== `${BELL_ROW}${a.personId}`) return `another person's bell switch (${where})`
    const n: any = c.op === 'delete' ? null : c.after
    if (n == null) return `a bell switch removed (${where})`
    if (typeof n !== 'object' || Array.isArray(n) || Object.entries(n).some(([k, v]) => !units.has(k) || typeof v !== 'boolean')) return `a bell switch that will not read (${where})`
  }
  return null
}
/* HIS OWN ACCOUNT'S LINES (batch 1's second half, plan §7 item 6, §15 D5, D7, D11, §16 D6′, D7′, D11′ — his D2251, D2309,
   D2319): a line of the `acct` kind reaches only the man whose access the command changed, in words matching the change
   exactly — part for part what state/acctlines.ts accessParts owes over this command's own rows before and after (the
   one body the doors' writer asks), each owed part once; signed by the actor, or by no one where the app did it
   (acctByApp — an archive's ended right, an Overseas posting's suspension); dated today, now; about no input, with no
   squadron stamp or filer's mark. An Undo or Redo is judged the same over the rows it restores (§16 D7′): the step's
   own line taken away or put back by its verified replay, and its opposite line — or a Redo's fresh one — owed by the
   restore's own change. The app's own writer (`account.told`, the system actor) has a section of its own (D11, D11′):
   a move's line, its fixed id, on the day his squadron changed, for a right held the day before and not that day. A
   line refused here never reaches the checks below; one passed here is skipped by them (ownsLine, "a bell line about
   nothing the command changed", the posting pass's own). Asked first, as §16 D6′ places it. */
export const acctChange = (c: Change): boolean =>
  c.collection === 'notices' && (isAcctNotice(c.before) || (c.op !== 'delete' && isAcctNotice(c.after)))
function acctLineViolation(env: CommitEnvelope): string | null {
  const ch = env.changes.filter(acctChange)
  if (!ch.length) return null
  const a = env.actor
  const today = todayIso(), now = Date.now()
  let replayed: ((c: Change) => boolean) | null | undefined
  const shape = (n: any): boolean => !lineMalformed(n) && n.what.length === 1 && n.what[0].k === 'acct' && n.iid === ''
    && n.u === undefined && n.fu === undefined && typeof n.to === 'string' && Number.isFinite(n.at) && Math.abs(n.at - now) <= AT_SLACK_MS
    && String(n.name) === String((PEOPLE as any)[String(n.to)]?.cs ?? n.to)
  if (env.type === 'account.told') {
    if (!a || a.role !== 'system' || env.changes.some(c => !acctChange(c))) return 'an account line the app did not owe (account.told)'
    const rows = unitRowsAfter(env.changes)
    for (const c of ch) {
      const n: any = c.op === 'delete' ? null : c.after
      const where = `${c.collection}/${c.id}`
      if (c.before != null || !n || !shape(n) || n.by != null || String(n.id) !== String(c.id)) return `an account line the app did not owe (${where})`
      const p: AcctPart = n.what[0], d = String(n.day)
      const acct = ACCOUNTS_LIST.find(x => String(x.pid) === String(n.to))
      if (!acct || p.why !== 'moved' || !(d <= today && d > addDays(today, -MOVES_TOLD_DAYS)) || movedLineId(acct.id, d, p) !== String(n.id)
        // eslint-disable-next-line react-doctor/js-set-map-lookups -- one look in a list worked out afresh for this line's own man and day, never the same list twice
        || !homeChangesBefore(String(n.to), addDays(d, -1), d, rows).includes(d)
        || !movedParts(accessIn(acct, rows, addDays(d, -1)), accessIn(acct, rows, d)).some(x => deepEqual(x, p))) return `an account line the app did not owe (${where})`
    }
    return null
  }
  const self = a?.personId == null ? null : String(a.personId)
  /* what this command's own change owes each man, part by part — each once */
  const w = buildWorlds(env)
  const owed = new Map<string, Array<{ p: AcctPart; app: boolean } | null>>()
  /* (each account by its id, before and after — the first row of an id, as find gave it) */
  const byId = (rows: typeof w.acctB): Map<string, (typeof w.acctB)[number]> => {
    const m = new Map<string, (typeof w.acctB)[number]>()
    for (const x of rows) if (!m.has(x.id)) m.set(x.id, x)
    return m
  }
  const acctB = byId(w.acctB), acctA = byId(w.acctA)
  for (const id of new Set([...acctB.keys(), ...acctA.keys()])) {
    const b = acctB.get(id), f = acctA.get(id)
    if (!b || !f) continue
    const pid = String(f.pid)
    const why = w.personB(pid)?.archived !== true && w.personA(pid)?.archived === true ? 'archived' as const : undefined
    const parts = accessParts(accessIn(b, w.rowsB, today), accessIn(f, w.rowsA, today), why)
    if (parts.length) owed.set(pid, [...(owed.get(pid) ?? []), ...parts.map(p => ({ p, app: acctByApp(p, f) }))])
  }
  for (const c of ch) {
    const where = `${c.collection}/${c.id}`
    if (replayed === undefined) replayed = env.origin === 'restore' && REPLAY ? REPLAY(env) : null
    /* (the step's own line, taken away by its Undo or put back by its Redo, image for image) */
    if (replayed && replayed(c)) continue
    const n: any = c.op === 'delete' ? null : c.after
    if (c.before != null || !n) return `an account line no change of his access owes (${where})`
    if (!shape(n) || String(n.day) !== today) return `a bell line not as the pass writes it (${where})`
    const list = owed.get(String(n.to)) ?? []
    const i = list.findIndex(x => !!x && deepEqual(x.p, n.what[0]) && (n.by ?? null) === (x.app ? null : self))
    if (i < 0) return `an account line no change of his access owes (${where})`
    list[i] = null
  }
  return null
}
/* A POSTING THAT COULD NOT RUN — ITS LINE ONLY WHERE IT DID NOT (batch 1's second half, plan §7 item 7, §15 D10, §16 D10′
   — his D2214): a line of the `pofail` kind is written only by the app's own `posting.failed` command, which writes nothing
   else; each line new, from the app (no one's name), about no input, dated the posting's day, stamped with the squadron the
   runner's record names, to an admin of that squadron today (the one audience, accounts.ts adminLineAudience) but never the
   man himself, its id the posting's and that admin's (notices.ts poFailedLineId) — and only where the posting has failed
   NOW by the runner's own record (setPostingFailedProbe: refused after its retry alone, or held for a reason other than
   the last-admin lock). A correctly shaped line for a posting that would run, or ran, is refused. Any other command that
   writes one is refused: the line is never a person's to write. */
const poFailChange = (c: Change): boolean => c.collection === 'notices' && c.op !== 'delete'
  && Array.isArray((c.after as any)?.what) && (c.after as any).what.some((p: any) => p && p.k === 'pofail')
function postingFailedViolation(env: CommitEnvelope): string | null {
  const mine = env.type === 'posting.failed'
  if (!mine) {
    const c = env.changes.find(poFailChange)
    return c ? `a posting-failed line only the app writes (${c.collection}/${c.id})` : null
  }
  const a = env.actor
  if (!a || a.role !== 'system') return 'a posting-failed line only the app writes (posting.failed)'
  const today = todayIso(), now = Date.now()
  for (const c of env.changes) {
    const where = `${c.collection}/${c.id}`
    const n: any = c.op === 'delete' ? null : c.after
    if (!poFailChange(c) || c.before != null || !n) return `a posting-failed line not as the app writes it (${where})`
    const p: any = n.what[0]
    if (n.what.length !== 1 || n.by != null || n.iid !== '' || n.fu !== undefined || typeof n.to !== 'string' || String(n.id) !== String(c.id)
      || !Number.isFinite(n.at) || Math.abs(n.at - now) > AT_SLACK_MS || typeof p.who !== 'string' || String(n.to) === String(p.who)
      || String(n.name) !== String((PEOPLE as any)[String(p.who)]?.cs ?? p.who)) return `a posting-failed line not as the app writes it (${where})`
    const f = PO_FAILED ? PO_FAILED(String(p.who)) : null
    const key = `${p.who}@${n.day}:${p.o}`
    if (!f || f.key !== key || n.u !== f.unit || String(n.id) !== poFailedLineId(key, String(n.to))
      // eslint-disable-next-line react-doctor/js-set-map-lookups -- one look in the audience of this line's own squadron, worked out afresh for it
      || !adminLineAudience(f.unit, today).includes(String(n.to))) return `a posting-failed line for a posting that did not fail (${where})`
  }
  return null
}
function ownershipChecks(env: CommitEnvelope): string | null {
  const a = env.actor
  const asNew = writtenAsNewViolation(env)
  if (asNew) return asNew
  const unitBad = unitRowViolation(env)
  if (unitBad) return unitBad
  /* the one guardrail over people, accounts and homes, before against after (the second fix read — Fable's plan G0–G3:
     G0 and G1 here, G2 in homeUnitViolation, G3 the lock) */
  const shapeBad = accountShapeAndMasterViolation(env)
  if (shapeBad) return shapeBad
  /* (and where a Scheduler tick was given — fix read 2, beside K3) */
  const tickBad = schedRecordViolation(env)
  if (tickBad) return tickBad
  /* (a delete is final — item D (1), above) */
  const revived = deletedPersonViolation(env)
  if (revived) return revived
  const lockBad = lastAdminViolation(env)
  if (lockBad) return lockBad
  const unitRec = unitRecordViolation(env)
  if (unitRec) return unitRec
  const dayBad = schedDayNamesViolation(env)
  if (dayBad) return dayBad
  const homeBad = homeUnitViolation(env)
  if (homeBad) return homeBad
  /* (who makes an admin of a squadron — U2's Q8, beside the account-row check above) */
  const madeBad = madeAdminViolation(env)
  if (madeBad) return madeBad
  const reqBad = requestRowViolation(env)
  if (reqBad) return reqBad
  const inputBad = inputUnitViolation(env)
  if (inputBad) return inputBad
  const sansDayBad = sansDayViolation(env)
  if (sansDayBad) return sansDayBad
  const sansBackBad = sansBackEraseViolation(env)
  if (sansBackBad) return sansBackBad
  /* A READ RECORD IS ITS OWNER'S ALONE, WHOEVER WRITES (round 4's security read, SEC-R4-1, and Astra's same case, 24 Nov
     26; docs/data-model.md §11 NoticeSeen — together, D200): since his D2560 a man's read record alone decides whether his
     read SANS reminder lights again. This gate asked nothing of the app's own actor, and of an admin only that the man
     was his own squadron's — so the app's projection door (command commitProjection, open to any code of the page) wrote
     anyone's record, and an admin's command of any type his man's: a member put another man's reminder out, read days
     ahead for him so a later planning never told him, or emptied his record and lit it with nothing planned. Asked here,
     before every role's early return, of every actor. The one honest writer is state/noticeseen.ts write — the person
     signed in, his own row, by his own `notices.seen` (a tap, "Mark all read", forgetRead after his Undo post out has
     landed); the posting pass never writes one (postingPassViolation). Another device's change and a seed are not asked:
     each carries what was judged where it was made. */
  for (const c of env.changes) {
    if (c.collection !== 'settings' || !String(c.id).startsWith('noticeseen:')) continue
    if (env.origin === 'remote' || env.origin === 'seed') continue
    const own = !!a && (a.role === 'admin' || a.role === 'member') && a.personId != null && String(c.id) === `noticeseen:${a.personId}`
    if (!own) return `another person's read record (${c.collection}/${c.id})`
  }
  /* WHEN A PERSON LAST OPENED HIS OWN WINDOW (M5a — the security read's finding 4): his own row, by its one command,
     for an ADMIN too — an admin who changed a man's leave could otherwise set that man's moment to now and wipe the dots
     that tell him (§11: "C R U own" for every role) */
  if (a && a.role !== 'system') {
    for (const c of env.changes) {
      if (c.collection !== 'settings' || !String(c.id).startsWith('lwseen:')) continue
      if (env.type !== 'lw.seen' || a.personId == null || c.id !== `lwseen:${a.personId}`) return `another person's last visit (${c.collection}/${c.id})`
    }
  }
  /* WHICH SQUADRONS' LINES HIS BELL SHOWS (batch 1's second half §7 item 3, §15 D6 — R2-O12): his own row, by its one
     command, for every role — no admin sets another man's switch, nor the app; the row only squadron ids of the store
     against on / off (state/bellsqn.ts) */
  const bellBad = bellSqnRowViolation(env)
  if (bellBad) return bellBad
  /* THE POSTING PASS CHANGES ONLY THE MEN IT POSTS OUT — its rows, judged here before the account lines (below, where its
     story is), so a pass refused for its own change keeps that refusal's words, as the next comment asks */
  if (a && a.role === 'system' && env.type === 'lw.postoutRun') {
    const bad = postingPassViolation(env)
    if (bad) return bad
  }
  /* A POSTING THAT COULD NOT RUN (§7 item 7): its line only where it did not, and only the app's (above) */
  const failBad = postingFailedViolation(env)
  if (failBad) return failBad
  if (env.type === 'posting.failed') return null
  /* HIS OWN ACCOUNT'S LINES (§16 D6′): before ownsLine and "a bell line about nothing" (adminOwnerViolation), after every
     check of the rows themselves, so a command refused for its own change keeps that refusal's words */
  const acctBad = acctLineViolation(env)
  if (acctBad) return acctBad
  /* 7e. an admin's bell lines and read records only for his own squadron's people (below) */
  const ownerBad = adminOwnerViolation(env)
  if (ownerBad) return ownerBad
  /* 7b. a squadron's Leave War by its own people only, and a master's posting by a master (above) */
  const warBad = warUnitViolation(env)
  if (warBad) return warBad
  /* 7f. a squadron's Tracker by its own people only (above) */
  const trkBad = trkUnitViolation(env)
  if (trkBad) return trkBad
  /* THE POSTING PASS CHANGES ONLY THE MEN IT POSTS OUT ([SYSTEM-PASS-SAVES-ROSTER], D1510's security read, 29 Oct 26 —
     built 31 Oct 26). The pass runs as the app itself, which nothing below asks, so its own command is held here: a change
     to a person rides in it only beside that man's posting record (every outcome — Overseas Sqn, SANS, Delete — writes his
     posting as it runs: its done mark, or a delete's closed window). A change to anyone else is a change the pass never
     made — a person changed in memory outside every command — and the whole pass is refused (it runs again on the next
     pass, after leavewar/sync.ts runPoOutcomes has put the roster back to what is saved). The database step translates
     this as: the pass's service account updates a Person only in the changeset that carries out his posting. */
  /* …TIGHTENED BY THE SECURITY READ OF 7d0c12b24 (`docs/handpass/parts/lw-rr1031/read-security.md` 1(a)): matched by id
     alone, ANY change to a man's posting record vouched for ANY change to his person, and the pass's account rows were not
     asked at all. Now (postingPassViolation): the posting change must be that posting's own done mark, its date come; his
     person may differ only in that outcome's own fields, its marks set; and the pass's settings rows are only the posted
     men's accounts (and, for a Delete, the request and bell row that go with his account). Asked above, just before the
     account lines (batch 1's second half). */
  if (!a || a.role === 'system' || a.role === 'admin') return null
  let replayed: ((c: Change) => boolean) | null | undefined
  let warRestore: ((c: Change) => boolean) | null | undefined
  for (const c of env.changes) {
    const where = `${c.collection}/${c.id}`
    if (a.role !== 'member') {
      if (a.role === 'pending' && env.type === 'access.request' && c.collection === 'settings' && c.id.startsWith('accessreq:')
        && c.op === 'put' && c.before == null && String((c.after as any)?.name ?? '') === String(a.principal ?? '').trim().toLowerCase()) continue
      return `${a.role} may not change ${where}`
    }
    const pid = a.personId == null ? null : String(a.personId)
    if (!pid) return `no person to own ${where}`
    if (SCHEDULE_RECORDS.has(c.collection)) return `the schedule (${where})`
    switch (c.collection) {
      case 'inputs': {
        if (c.id === INPUT_ORDER) break
        if (replayed === undefined) replayed = env.origin === 'restore' && REPLAY ? REPLAY(env) : null
        const bad = inputBreach(env, c, pid, !!replayed && replayed(c))
        if (bad) return `${bad} (${where})`
        if (!(replayed && replayed(c)) && warPlacerForged(env, c)) return `who placed a leave on the war (${where})`
        break
      }
      /* A BELL'S NOTICE (state/notices.ts; the plan §4.10): a member's command may make one only as part of his OWN
         change to the input it names — the same command changes that input — naming himself as its maker and addressed
         to someone else; his own Undo of that change takes away the notices it made (a Redo puts them back the same
         way). Nobody rewrites a notice, and nobody removes another person's. */
      case 'notices': {
        /* (his own account's line — judged whole by acctLineViolation, before this section) */
        if (acctChange(c)) break
        const b: any = c.before, n: any = c.after
        const rides =(iid: any) => env.changes.some(x => x.collection === 'inputs' && x.id === String(iid))
        /* A LEAVE WAR LINE IS NEVER A MEMBER'S (M4; the security read's finding 4): "Your leave · LL refused", bidding
           opened or closed, "… taken back" are written only by an admin's war command (state/notices.ts noticeWar, the
           `lw.notice` follow-up) — a member's notice riding his own input may carry none of them */
        if (c.op === 'put' && warPart(n)) return `a notice that is not his own change's (${where})`
        /* (chat 147: nor a kind the app never stores — before the telling door, a verified replay too) */
        if (c.op === 'put' && neverStored(n)) return `a bell line the app only works out (${where})`
        /* (fix read 10, fault A (d): a line that reads as one, in this section too) */
        if (c.op === 'put' && lineMalformed(n)) {
          if (replayed === undefined) replayed = env.origin === 'restore' && REPLAY ? REPLAY(env) : null
          if (!(replayed && replayed(c))) return `a bell line that will not read (${where})`
        }
        /* (fix read 7, fault M — the admin section's lineRewritten and inputLineUnlike: this section already holds both,
           since the one door below that puts a line takes only a new one (`b == null`), riding his change of the input
           it names (`rides`), with the pass's mark (`filerMarkOk`); every other put is refused under it) */
        /* …and only to someone that change tells — named in the input, before or after, or its filer (toldBy, SEC-3) */
        if (c.op === 'put' && b == null && n && String(n.by) === pid && String(n.to) !== pid && rides(n.iid) && toldBy(env, n.iid)?.has(String(n.to)) && filerMarkOk(env, c, n)) {
          /* (fix read 7, fault T: dated now — lineNotNow above; his Redo's verified replay puts back its own time) */
          if (replayed === undefined) replayed = env.origin === 'restore' && REPLAY ? REPLAY(env) : null
          if (lineNotNow(c, replayed)) return `a bell line not dated now (${where})`
          /* (§7 item 1: stamped with the input's squadron, as the pass stamps it) */
          if (lineStampWrong(env, c, replayed)) return `a bell line not as the pass writes it (${where})`
          break
        }
        /* FIX READ 7, FAULT U: his Undo of his own step takes his own line with it. Judged afresh, the restore's images
           are not the step's — undoing a delete re-creates the input, so `toldBy` read HIM as its filer and his line to
           Hunter (the real filer) looked untold; and once Hunter has moved squadron he is no longer told at all — so the
           Undo was refused, his Redo with it. A line the timeline itself vouches for (the verified replay, the same check
           the input above passes on) is his own step's line coming back out, whoever is told today (D2225's "his own
           Undo of that change takes away the notices it made"); a restore the timeline does not vouch for keeps the old
           test, so a forged restore still cannot take a line away. */
        if (c.op === 'delete' && env.origin === 'restore' && b && String(b.by) === pid && rides(b.iid)) {
          if (replayed === undefined) replayed = REPLAY ? REPLAY(env) : null
          if (toldBy(env, b.iid)?.has(String(b.to)) || (replayed && replayed(c))) break
        }
        return `a notice that is not his own change's (${where})`
      }
      case 'people': {
        if (c.id !== pid) return `another person's row (${where})`
        /* his own row, but never what the admin owns on it (D218, D1510); a delete or a new row of his own is neither
           his to make, so an absent side reads as an empty person */
        const b: any = c.before ?? {}, n: any = c.op === 'delete' ? {} : (c.after ?? {})
        for (const [what, read] of OWN_ROW_ADMIN_ONLY) if (read(b) !== read(n)) return `${what} (${where})`
        /* HIS SANS DAYS CHANGE ONLY AS HIS QUALS TICK WRITES THEM — TODAY (the security read's S3, chat 152; D2313: "a tick by
           hand counts from the day it is made", state/quals-write.ts). Since D2340 / D2341 his SANS days decide which days
           he may be filed for and which of his filings show, so a hand-made own-row command setting `sanFrom` back to
           1 Jan, or an ended stretch (`sanWas`) over last week, let him file days before his SANS date and bring hidden
           ones back. The one change allowed is the tick's own: put on from today, or taken off today — worked out from the
           before-image here; his Undo / Redo of a tick, the step the timeline vouches for, puts back what it took. */
        const sanSig = (p: any) => JSON.stringify([!!p?.san, p?.sanFrom ?? null, p?.sanWas ?? null])
        if (sanSig(b) !== sanSig(n)) {
          const want: any = { san: b.san, sanFrom: b.sanFrom, sanWas: Array.isArray(b.sanWas) ? b.sanWas.map((s: any) => Array.isArray(s) ? s.slice() : s) : b.sanWas }
          if (want.sanFrom === undefined) delete want.sanFrom
          if (want.sanWas === undefined) delete want.sanWas
          if (!!n.san !== !!b.san) { if (n.san) sansStart(want, todayIso()); else sansStop(want, todayIso()) }
          if (sanSig(want) !== sanSig(n)) {
            if (replayed === undefined) replayed = env.origin === 'restore' && REPLAY ? REPLAY(env) : null
            if (!(replayed && replayed(c))) return `his SANS days (${where})`
          }
        }
        break
      }
      case 'lw.cell': {
        const parts = c.id.split(':')
        if (parts[parts.length - 2] !== pid) return `another person's war row (${where})`
        /* …and his Undo of such a step puts back exactly what it took (the walk's B-F1, 22 Oct 26: the Undo was refused) —
           but ONLY that (D1263): an Undo the timeline vouches for, of his own step made on the day already closed, image
           for image. A Redo, the Undo of a step made while the day was open, or a command that only calls itself a
           restore puts nothing back on a closed day. (Taking his own pending bid away passes above, Undo or not.) */
        const after = c.op === 'delete' ? [] : c.after
        /* WHO PLACED A REQUEST AND WHO DECIDED IT (M4 8.6 — the security read's question: a forged "placed by"): a request a
           member writes is placed by HIM, now — or keeps the stamp it already had (a re-typed kind keeps the first; a move
           carries it to another day of his row, so any of this command's own before-images vouches); nor does he ever
           write who decided one. His Undo or Redo writes back the images it took. */
        /* (…and only the Undo or Redo the timeline is applying writes back the images it took, record for record — a change
           that merely calls itself a restore is judged as any other: the security read's finding 1, 27 Oct 26) */
        if (replayed === undefined) replayed = env.origin === 'restore' && REPLAY ? REPLAY(env) : null
        if (!(replayed && replayed(c))) { const bad = stampForged(env, c, after, pid); if (bad) return `${bad} (${where})` }
        if (LW_DAY_OPEN && !LW_DAY_OPEN(c.id) && !onlyTakesPending(c.before, after) && !onlyChangesWords(c.before, after)) {
          if (warRestore === undefined) warRestore = env.origin === 'restore' && LW_RESTORE ? LW_RESTORE(env) : null
          if (!(warRestore && warRestore(c))) return `a war day not open for bidding (${where})`
        }
        break
      }
      case 'lw.current': break
      /* HIS OWN TYPED FIGURE (M5a, B6, finding 9): only his own row, only while unlocked as it stands when saved; never
         OIL; halves only, carried forward only on LVE and within the figure; and — on a forward write — typed BY HIM,
         TODAY, with the snapshot the store builds from his approved leave now, so he cannot type 20 with a snapshot that
         shows 120, back-date it before a 1 Jan, or name another man as its typist. His own Undo or Redo of it, which the
         timeline vouches for image for image, puts back the earlier row with its older day and snapshot (narrow read 1);
         the lock still applies to it. */
      case 'lw.balance': {
        const i = c.id.lastIndexOf(':'), bpid = c.id.slice(0, i), kind = c.id.slice(i + 1)
        if (bpid !== pid) return `another person's balance (${where})`
        if (!LW_BAL) return `a balance with no Leave War to check it (${where})`
        if (LW_BAL.locked()) return `balances locked by admin (${where})`
        if (!TYPED_KINDS.has(kind)) return `a figure that is not typed (${where})`
        if (c.op === 'delete') break
        if (replayed === undefined) replayed = env.origin === 'restore' && REPLAY ? REPLAY(env) : null
        if (replayed && replayed(c)) break
        const v: any = c.after
        if (!v || typeof v !== 'object' || Array.isArray(v) || !LW_BAL.wellFormed(v, kind)) return `a balance that will not read (${where})`
        if (String(v.by) !== pid) return `who typed a balance (${where})`
        if (v.day !== LW_BAL.today()) return `the day a balance was typed (${where})`
        if (!isHalfNum(v.amount)) return `a balance that is not a half (${where})`
        if (v.cf !== undefined && (kind !== 'LVE' || !isHalfNum(v.cf) || v.cf < 0 || v.cf > Math.max(v.amount, 0))) return `a carried forward outside its figure (${where})`
        if (!Array.isArray(v.snap) || !LW_BAL.sameSnap(v.snap, pid, kind)) return `a balance's snapshot (${where})`
        break
      }
      /* [DRAFT-PENDING] (D170): "Mark all as seen" — a member writes his OWN seen row and no other (EditLogSeen, own row
         — one row per person since [DB-READINESS] group A, phase 4.3) */
      case 'settings':
        if (c.id.startsWith('seen:') && env.type === 'changes.seen') {
          if (c.id !== `seen:${pid}`) return `another person's seen record (${where})`
          break
        }
        /* what he has read of his bell's notices — his OWN row, by its one command */
        if (c.id.startsWith('noticeseen:') && env.type === 'notices.seen') {
          if (c.id !== `noticeseen:${pid}`) return `another person's read record (${where})`
          break
        }
        /* when he last opened his own person window on the Leave War (M5a, finding 10c) — his OWN row, by its one command */
        if (c.id.startsWith('lwseen:') && env.type === 'lw.seen') {
          if (c.id !== `lwseen:${pid}`) return `another person's last visit (${where})`
          break
        }
        /* which squadrons' lines his bell shows (batch 1's second half §7 item 3) — his OWN row, by its one command
           (bellSqnRowViolation, before this section, holds the rest) */
        if (c.id.startsWith('bellsqn:') && env.type === 'bell.squadrons') {
          if (c.id !== `bellsqn:${pid}`) return `another person's bell switch (${where})`
          break
        }
        return `an admin's record (${where})`
      /* (a person's grade is an admin's record too — without its case the `default` below would let a member write it:
         finding 7) */
      case 'lw.war': case 'lw.ledger': case 'lw.opening': case 'lw.grade': case 'lw.oilpolicy': case 'lw.postouts': case 'lw.label': case 'lw.config':
      /* another squadron's stored war, written only by Admin → Users' four doors (A3 — leavewar/state/foreign.ts): an
         admin's, as the war's own posting window and ledger are (the `default` below would let a member write it) */
      case 'lwx.profile': case 'lwx.rec': case 'lwx.ledger':
      case 'plan':
      /* the Tracker's flex settings (D1014): the one Tracker record a member never writes, whichever command carries it */
      case 'trk.flex':
      case 'insights.role':
        return `an admin's record (${where})`
      default: break                       // the Tracker (the schedule and the week stash are refused above)
    }
  }
  return null
}
