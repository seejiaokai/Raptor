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
   4. The medical-detail rule (D211): every member reads a medical input in full; a
      guest (not a member) never does.

   The browser MIRRORS; the server will ENFORCE (data-model §11, "The server enforces,
   the browser mirrors"). These checks give the right answer on screen and refuse a
   hand-made call; they are not security against someone editing the page's code.

   "No session" (SESSION null) is the headless engine — a unit test, the boot, the
   parity harness — never a user: every question below answers it the way the gate it
   replaced did (stated per question), so no headless test changes meaning. */
import { SESSION, ME, setEffectiveRole } from './auth'
import { store } from '../engine/hooks'
import { INPUTS, inpMeta, typeGroup, isSansAvail, needsDoc, peopleOf, idsOf, leadOf, onlyNamed, holds, placeHeld, placeOf, namedOf, placeholderOf, inputAtIso } from '../engine/inputs'
import { voidedOil } from '../engine/oil'
/* the seeded accounts, read only by the posting pass's first-write rule below (accounts.ts imports this file; the call is
   made only when a command is judged, never as the module loads) */
import { seedAccounts, ACCOUNTS_LIST, isAdminAccount, isMasterAccount, accountBefore, readAccounts, type Account } from './accounts'
import { unitRowsBefore, levelBefore, homeBefore, todayIso, homeOn } from './units'
import { PEOPLE } from '../engine/people'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { unitOf, isUnitId, split } from '../storage/unitid'
import {
  UNIT_PFX, PLACE_PFX, UNITPLACE_PFX, GRANT_PFX, HOME_PFX, UNIT_ROW_PREFIXES, validUnit, validPlace, validUnitPlace, validGrant,
  validHome, unitIn, placeIn, placeIdOn, moveFrom, type UnitRows,
} from './units-model'
import { oilPlanOf } from './inputgate-hook'
import type { Actor, Change, CommitEnvelope } from '../command/types'

export type Act = 'C' | 'R' | 'U' | 'D'
export type Role = 'admin' | 'member' | 'guest' | 'pending'
export interface Cell { all: Act[]; own: Act[] }
export interface PermRow { admin: Cell; member: Cell; guest: Cell; pending: Cell; gaps: string[] }

const cell = (all: string, own = ''): Cell => ({
  all: all.split(' ').filter(Boolean) as Act[],
  own: own.split(' ').filter(Boolean) as Act[],
})
const NONE = cell('')
const row = (admin: Cell, member: Cell, guest: Cell = NONE, pending: Cell = NONE, gaps: string[] = []): PermRow =>
  ({ admin, member, guest, pending, gaps })

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
  [T.person]: row(cell('C R U D'), cell('R', 'U'), cell('R')),
  [T.qualification]: row(cell('C R U D'), cell('R')),
  [T.qualmark]: row(cell('C R U D'), cell('R', 'C U D')),
  [T.setting]: row(cell('C R U D'), cell('R')),
  [T.missionrole]: row(cell('C R U D'), cell('R'), cell('R')),
  [T.user]: row(cell('C R U D'), cell('', 'R')),
  [T.accessreq]: row(cell('R D'), NONE, NONE, cell('', 'C')),
  [T.reqseen]: row(cell('', 'C R U'), NONE),
  [T.sched]: row(cell('C R U D'), cell('R'), cell('R')),
  [T.amendment]: row(cell('C R'), cell('R'), cell('R')),
  /* a history line is written by whoever made the change, in its changeset (group A, phase 4.3; the final read's F1) */
  [T.editlog]: row(cell('C R D'), cell('C R')),
  [T.changebatch]: row(cell('C R'), cell('C R'), cell('R'), cell('C')),
  [T.seen]: row(cell('', 'C R U'), cell('', 'C R U')),
  /* a notice is written by whoever made the change, inside it, and read by the person it is addressed to; nobody
     rewrites one, and it is removed only by its maker's own Undo of that change */
  [T.notice]: row(cell('C R D'), cell('C', 'R D')),
  /* …and an ADMIN reads every person's (M4 9.3 — D1216): his Undo of a Leave War decision asks whether its member had read
     the line it takes back */
  [T.noticeseen]: row(cell('R', 'C R U'), cell('', 'C R U')),
  /* an admin's own row; a member has no Approvals (D1254) */
  [T.apprseen]: row(cell('', 'C R U'), NONE),
  [T.input]: row(cell('C R U D'), cell('R', 'C R U D'), cell('R')),
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
  [T.profile]: row(cell('C R U D'), cell('R')),
  [T.tracker]: row(cell('C R U D'), cell('C R U D')),
  /* the units (step 1): every signed-in person reads the units — a guest's and a pending person's view names theirs; only
     a MASTER makes one (MASTER_ONLY_COMMANDS below — §11 notes it in the cell); the place, a unit's place and a home are
     an admin's OF that unit (the commit gate reads the row's unit — unitRowViolation); a member reads his own rights */
  [T.unit]: row(cell('C R U D'), cell('R'), cell('R'), cell('R')),
  [T.place]: row(cell('C R U D'), cell('R')),
  [T.unitplace]: row(cell('C R U D'), cell('R')),
  [T.grant]: row(cell('C R U D'), cell('', 'R')),
  [T.home]: row(cell('C R U D'), cell('R')),
}

/* 4. WHO READS A MEDICAL INPUT IN FULL (D211, 26 Sep 26 — "Keep as today": every member;
   D213, the same day — "a guest should also see medical inputs": a guest too, on the
   published schedule he is shown). §11's Input row carries it in the Guest cell — a note
   "(no medical detail)" there would mean a guest is left out; perms.test.ts ties the two
   together. The question stays one place, so a later ruling moves one line. */
export const MEDICAL_DETAIL: Role[] = ['admin', 'member', 'guest']

/* ---- who is signed in ------------------------------------------------------ */
export type Who = Role | 'off' | null
/* null = no session (the headless engine). An account's member role is 'main'; the
   localhost probe bridge's raptorRole writes 'member' — both are a member. */
export function roleOf(s: any = SESSION): Who {
  if (!s) return null
  const r = s.role
  if (r === 'admin') return 'admin'
  if (r === 'guest' || r === 'pending' || r === 'off') return r
  return 'member'
}
const actorRole = (a: Actor): Who =>
  a.role === 'system' ? null : a.role === 'admin' || a.role === 'member' || a.role === 'guest' || a.role === 'pending' || a.role === 'off' ? a.role : null
/* was a committed change made by an admin? — the change history's Leave War lines say a request DELETED only when an
   admin took it away ([DRAFT-PENDING]; a member's own bid coming off is not a decision) */
export const actorIsAdmin = (a: Actor | null | undefined): boolean => !!a && actorRole(a) === 'admin'

/* whose own-row rule applies: a person's id for an admin or a member; a pending
   principal's sign-in name for his own access request; nobody for a guest or an
   account switched off */
function identityOf(who: Who, s: any = SESSION): string | null {
  if (who === 'admin' || who === 'member') return ME == null || ME === '' ? null : String(ME)
  if (who === 'pending') return s && s.name ? String(s.name) : null
  return null
}

/* the one rule under every question: does `who` hold `act` on `table`, for a record
   owned by `owner`? */
export function allows(who: Who, table: string, act: Act, owner?: string | null, identity?: string | null): boolean {
  if (who === 'off' || who === null) return false
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
   and member, never another person. A pending person, a guest, an account suspended, a member — no switch, and a
   hand-made call changes nothing. */
export function mayViewAsMember(): boolean {
  const w = roleOf()
  return !!SESSION && SESSION.acct === 'admin' && (w === 'admin' || w === 'member')
}
export function switchRoleInForce(next: any): boolean {
  if (next !== 'admin' && next !== 'main') return false
  if (!mayViewAsMember()) return false
  setEffectiveRole(next)
  return true
}

/* 2. THE NAMED QUESTIONS ------------------------------------------------------ */
export const isAdmin = (): boolean => roleOf() === 'admin'
/* a signed-in admin or member — someone with access to the app's pages */
export const isMember = (): boolean => { const w = roleOf(); return w === 'admin' || w === 'member' }
export const isGuest = (): boolean => roleOf() === 'guest'
/* the signed-in person (an admin or a member), or null — a guest, a pending person
   and an account switched off are nobody's person. Headless (no session) it is the
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
   guest, or a person with no home: the boot unit, as the unit in view starts (state/store.ts sessionUnit). */
export function myUnit(iso: string = todayIso()): string {
  const m = me()
  const h = m ? homeOn(m, iso) : null
  return h && isUnitId(h) ? h : BOOT_UNIT
}

/* the schedule: edit mode, the board, the week's writes. No session → false, as
   canEditSched always answered (its callers are render and edit-mode gates). */
export const mayEditSched = (): boolean => !!SESSION && may(T.sched, 'U', null, false)
/* the Leave War's person as the sync mirrors it: the signed-in person; for a guest,
   a pending person or an account switched off '' — which matches NO row (the war's
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
   already been refused asks this to choose its sentence. An admin, a guest and a headless context: never. */
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
export const membersFileOn = (): boolean => store.get('memberfile', null) !== false
/* a medical input's type, remarks and documents (D211; a guest too, D213 — he has no door to a document) */
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
  const u = homeOn(String(pid))
  const row: any = SESSION ? ACCOUNTS_LIST.find(x => x.id === SESSION!.user) : null
  if (!u || !row) return true
  return levelBefore({ id: row.id, pid: String(row.pid), role: 'admin', master: row.master === true }, u, todayIso(), unitRowsBefore([])) === 'admin'
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
  'qualcols', 'lookahead', 'secdefault', 'wavedefault', 'guestview', 'insights', 'sanscalendar', 'memberfile'] as const

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
  'account.update': op(T.user, 'U', 'never', [[T.accessreq, 'D']]),
  'guestview.set': op(T.setting, 'U'),
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
  'person.restore': op(T.person, 'U', 'never', [[T.user, 'U'], [T.profile, 'U']]),
  /* [ONE-DOOR] (D309, D310, D323): Archive on Admin → Users — the person archived, his account suspended, his war stint
     closed (leavewar/sync.ts archivePerson); the man's own "welcome back" seen — his OWN row only (D305) */
  'person.archive': op(T.person, 'U', 'never', [[T.user, 'U'], [T.profile, 'U']]),
  'person.backSeen': op(T.person, 'U', 'required'),
  /* a posting written with a take-back of what the posting made (its archive, its suspension, its SANS tick) — and its
     Undo, before or after it ran (leavewar/sync.ts takeBack, and restoreBody's undo mode on the posting's own archive) */
  /* …and its Undo takes back the posting's bell lines ([NOTICE-UNDO-RETRACT], D1693, D1699): each admin's line removed (D), and
     one he had read replaced by its "taken back" line (C) */
  'lw.postout': op(T.profile, 'U', 'never', [[T.person, 'U'], [T.user, 'U'], [T.notice, 'C'], [T.notice, 'D']]),
  /* the posting pass on its date — a reconciler (the system actor); every table an outcome writes is named (D200) */
  /* …and each admin's bell line saying it ran ([POSTOUT-RUN-NOTICE], D1547 — a Notice created; so too a posting made today,
     run inside `lw.postout` above) */
  'lw.postoutRun': op(T.profile, 'U', 'never', [[T.person, 'U'], [T.person, 'D'], [T.user, 'U'], [T.user, 'D'], [T.sched, 'U'], [T.amendment, 'C'], [T.input, 'D'], [T.input, 'U'], [T.bid, 'D'], [T.award, 'D'], [T.notice, 'C']]),
}
/* THE UNITS (multi-squadron batch 1, step 1 — state/units.ts; the master mark, state/accounts.ts setMaster). The type
   says only that an admin may run it; which unit's admin is the commit gate's, read from each row (unitRowViolation) */
Object.assign(COMMAND_OPS, {
  'unit.add': op(T.unit, 'C', 'never', [[T.unitplace, 'C'], [T.grant, 'C']]),
  'unit.place': op(T.unitplace, 'C'),
  'place.set': op(T.place, 'U', 'never', [[T.place, 'C']]),
  'grant.set': op(T.grant, 'U', 'never', [[T.grant, 'C']]),
  'grant.remove': op(T.grant, 'D'),
  /* (a move drops every right the man held in another squadron — his D2203 — inside the same command) */
  'home.set': op(T.home, 'U', 'never', [[T.home, 'C'], [T.grant, 'D']]),
  'account.master': op(T.user, 'U'),
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
   A guest, a pending person and an account switched off change NOTHING, except a
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
const saysSame = (a: any, b: any, skip?: string): boolean => {
  const ks = new Set([...Object.keys(a), ...Object.keys(b)].filter(k => !NOT_SAID.has(k) && k !== skip))
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
  if ((without.by ?? null) === (byAfterLeaving(withHim, pid) ?? null)) return saysSame(before, after, 'by')
  return saysSame(before, after)
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
const WAR_LINE_KINDS = new Set(['lw', 'lwopen', 'lwback', 'oilhol', 'po', 'poback'])
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
    if ((r.decidedBy !== undefined || r.decidedAt !== undefined)
      && (!same || `${same.decidedBy ?? ''}|${same.decidedAt ?? ''}` !== `${r.decidedBy ?? ''}|${r.decidedAt ?? ''}`)) return `who decided a request`
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
  sans: ['san', 'quals', 'sanQ', 'sanBy'],
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
  for (const c of env.changes) {
    if (c.collection !== 'lw.postouts') continue
    const b: any = c.before, f: any = c.op === 'delete' ? null : c.after
    let date: string | null = null, outcome: string | undefined
    if (f && typeof f.to === 'string' && ISO_DAY.test(f.to) && f.poDone === isoAddDay(f.to) && (!b || b.poDone !== f.poDone)) { date = f.poDone; outcome = passOutcomeOf(f) }
    else if (!f && b && typeof b.to === 'string' && ISO_DAY.test(b.to) && passOutcomeOf(b) === 'delete') { date = isoAddDay(b.to); outcome = 'delete' }
    if (date && date <= today && outcome) { posted.set(String(c.id), outcome); postedOn.set(String(c.id), date) }
  }
  const refuse = (c: Change) => `the posting pass may change only the men it posts out, and only as their posting does (${c.collection}/${c.id})`
  /* …and only the men of the squadron whose Leave War it runs on (the second fix read — the security read's H2): a posting
     for another squadron's man in this war was never set by one of its admins (section 7b), so the pass does not carry it
     out. Judged by his home before the pass, where one is known (a shared store before its rows are made knows none). */
  const warU = lwUnitNow()
  if (warU && posted.size) {
    const rows = unitRowsBefore(env.changes)
    for (const pid of posted.keys()) {
      const h = homeBefore(pid, today, rows)
      if (h && h !== warU) return `the posting pass ran on ${warU}'s Leave War for another squadron's man (lw.postouts/${pid})`
    }
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
     Sqn), dated his posting date, about no input, addressed to an admin who can sign in and never to the man himself —
     one an admin a man. Any other line the pass makes is a Delete's: the lines its inputs owe the others in them
     (state/sched-commit.ts tellPass — the app's act, with no name, R12), each about an input this changeset changes and
     none of the war's or a posting's kinds. At the database step the pass's service account writes exactly these. */
  const admins = new Set(ACCOUNTS_LIST.filter(x => isAdminAccount(x) && x.on && x.pid != null).map(x => String(x.pid)))
  const told = new Set<string>()
  const deletes = [...posted.values()].includes('delete')
  const inputsChanged = new Set(env.changes.filter(c => c.collection === 'inputs').map(c => String(c.id)))
  for (const c of env.changes) {
    if (c.collection !== 'notices') continue
    const n: any = c.op === 'delete' ? null : c.after
    if (c.before != null || !n || n.by != null || !Array.isArray(n.what) || !n.what.length) return refuse(c)
    const parts: any[] = n.what
    if (parts.some(p => p && p.k === 'po')) {
      const p = parts[0], who = String(p.who)
      const ok = parts.length === 1 && p.k === 'po' && posted.has(who) && p.o === posted.get(who)
        && (p.acct === undefined || (p.acct === true && p.o === 'overseas'))
        && n.iid === '' && n.day === postedOn.get(who) && String(n.to) !== who && admins.has(String(n.to))
        && !told.has(`${n.to}|${who}`)
      if (!ok) return refuse(c)
      told.add(`${n.to}|${who}`)
    } else if (!deletes || parts.some(p => WAR_LINE_KINDS.has(String(p && p.k))) || !inputsChanged.has(String(n.iid))) return refuse(c)
  }
  /* the rest of the pass's settings rows: for a Delete, the request waiting under his account's sign-in name and his bell's
     row, both removed; nothing else */
  for (const c of env.changes) {
    if (c.collection !== 'settings' || String(c.id).startsWith('account:')) continue
    const b: any = c.before, id = String(c.id)
    const ok = c.op === 'delete' && (
      (id.startsWith('accessreq:') && !!b && [...accounts.values()].some(a => a.name === b.name))
      || (id.startsWith('reqseen:') && accounts.has(id.slice('reqseen:'.length))))
    if (!ok) return refuse(c)
  }
  return null
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
    if (!ok) return `a change to another unit's records (${u}) by one with ${lv ? `${lv} rights` : 'no rights'} there`
  }
  return null
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
    ? levelBefore({ id: row.id, pid: String(row.pid), role: String(a.role), master: row.master === true }, u, today, rows)
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
function inputUnitViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role === 'system') return null
  const ins = env.changes.filter(c => c.collection === 'inputs')
  if (!ins.length) return null
  const today = todayIso()
  const before = unitRowsBefore(env.changes)
  const named = (r: any): string[] => (r && typeof r === 'object' ? namedOf(r).map((e: any) => String(e.p)) : [])
  /* the days a man's home is read on: the input's first day and every saved move inside its span */
  const daysOf = (r: any): string[] => {
    const a = inputAtIso(r.date, r.yr) || today
    let b = r.endDate ? inputAtIso(r.endDate, r.yr) : undefined
    if (b && b < a && r.yr != null) b = inputAtIso(r.endDate, Number(r.yr) + 1)
    const out = new Set<string>([a])
    if (b && b > a) for (const h of before.homes) if (h.from > a && h.from <= b) out.add(h.from)
    return [...out]
  }
  const unitsOf = (r: any): string[] => {
    if (!r || typeof r !== 'object') return []
    const iso = inputAtIso(r.date, r.yr) || today
    const ids = named(r)
    if (ids.length) return daysOf(r).flatMap(d => ids.map(p => homeBefore(p, d, before))).filter(Boolean) as string[]
    const ph = placeholderOf(r)
    const by = ph && ph.by != null && ph.by !== '' ? ph.by : r.by
    const u = by == null || by === '' ? null : homeBefore(String(by), iso, before)
    return u ? [u] : []
  }
  for (const c of ins) {
    const was = c.before ?? null, is = c.op === 'delete' ? null : c.after ?? null
    if (JSON.stringify(was) === JSON.stringify(is)) continue
    /* (his own part only — the gate's `ownPart`: nothing but his entry differs, and the filer's handover with him (Astra
       3: the old test let him rewrite what was left for the other squadron's man in the same command). Forward, only as
       a take-out; back in, only as his own verified replay — his Undo of the take-out, which the squadron test refused
       before the replay check further down was reached.) */
    if (a.role !== 'admin' && was && is && a.personId != null && ownPart(String(a.personId), was, is)) {
      const me = String(a.personId)
      if (holds(was, me) && !holds(is, me)) continue
      if (!holds(was, me) && holds(is, me) && env.origin === 'restore' && REPLAY && REPLAY(env)?.(c)) continue
    }
    /* a man's own input — naming only him, before and after, no placeholder — is his whatever its squadron (F2). An
       admin's too (fix read 3, O1): the role test held it to members, so a 142 admin moved to 149 from tomorrow could not
       file his own leave for next week, nor change his own leave of a 142 day after the move, while a member in his
       place could — §11's "C R U D own" is everyone's. The role test stays only on the take-out branch above, a member's. */
    const onlyMe = (r: any) => r == null || (!placeholderOf(r) && named(r).length === 1 && named(r)[0] === String(a.personId))
    if (a.personId != null && onlyMe(was) && onlyMe(is)) {
      /* …BUT AS A MEMBER WHERE HE IS NOT ITS ADMIN (fix read 4, claim 1 — the Opus read's §1). For a member the own-input
         rules still ran after this (the member section's inputBreach); for an admin nothing did, since that section
         returns early for an admin — so Hunter, 142's admin moved to 149 from tomorrow, saved his own leave on 149's days
         with the war's approved mark or a scheduler's cancel mark, and cleared the cancel 149's admin had put on it (and
         the same after his move on 142's days). His own input passes as an admin's only where he is an admin of every
         squadron it touches, before and after; anywhere else the member's own-input rules hold him, and any breach
         refuses it. */
      if (a.role !== 'admin') continue
      const mine = new Set([...unitsOf(was), ...unitsOf(is)])
      if ([...mine].every(u => levelInForce(a, u, today, before) === 'admin')) continue
      const replayed = env.origin === 'restore' && !!REPLAY && !!REPLAY(env)?.(c)
      const bad = inputBreach(env, c, String(a.personId), replayed)
      if (bad) return `${bad} (inputs/${c.id})`
      continue
    }
    for (const u of new Set([...unitsOf(was), ...unitsOf(is)])) {
      const lv = levelInForce(a, u, today, before)
      const ok = a.role === 'admin' ? lv === 'admin' : lv === 'member' || lv === 'admin'
      if (!ok) return `an input of another squadron (${u}) changed by one with ${lv ? `${lv} rights` : 'no rights'} there (inputs/${c.id})`
    }
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
  return homeOn(String(a.personId))
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
/* Admin → Users' doors, the only commands that write the second store (leavewar/sync.ts foreignOf's callers: Archive,
   Restore and Restore as — one type — and Delete) */
const LWX_DOORS = new Set(['person.archive', 'person.restore', 'person.delete'])
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
    if (!LWX_DOORS.has(env.type)) return `another squadron's stored war written outside Admin → Users' doors, through the second store (${c.collection}/${c.id})`
    if (u && unitOf(String(c.id)) === u) return `the war loaded written through the second store (${c.collection}/${c.id})`
  }
  const lw = env.changes.filter(c => String(c.collection).startsWith('lw.') && c.collection !== 'lw.current')
  if (!lw.length && !fx.length) return null
  if (u && lw.length) {
    const lv = levelInForce(a, u, todayIso(), unitRowsBefore(env.changes))
    const ok = a.role === 'admin' ? lv === 'admin' : lv === 'member' || lv === 'admin'
    if (!ok) return `a change to another squadron's Leave War (${u}) by one with ${lv ? `${lv} rights` : 'no rights'} there`
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
   added by its storage door, tracker/storage.js, bound once to the signed-in person's own squadron), so the gate never knew
   whose Tracker a change was to. A doorway bound to another squadron's — the console's bindStorageUnit before the Tracker
   loads, as the Leave War's swap was for H2 — let 142's people change 149's. The Tracker tells the gate which squadron's
   is open (setTrkUnitProbe, installed by boot.ts from the doorway's own bound unit; none bound, nothing asked); every
   Tracker change then needs, there, admin from an admin in force and home or rights from a member — the same reading of
   the role in force as section 7. Everyone does everything inside his own Tracker (D121); the flex settings stay an
   admin's (below). Not asked of the app itself, nor of a guest or a pending person (refused everything below). */
let TRK_UNIT: LwUnit | null = null
export function setTrkUnitProbe(fn: LwUnit | null): void { TRK_UNIT = fn }
export const trkUnitNow = (): string | null => (TRK_UNIT ? TRK_UNIT() : null)
function trkUnitViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || (a.role !== 'admin' && a.role !== 'member')) return null
  if (!env.changes.some(c => String(c.collection).startsWith('trk.'))) return null
  const u = trkUnitNow()
  if (!u) return null
  const lv = levelInForce(a, u, todayIso(), unitRowsBefore(env.changes))
  const ok = a.role === 'admin' ? lv === 'admin' : lv === 'member' || lv === 'admin'
  return ok ? null : `a change to another squadron's Tracker (${u}) by one with ${lv ? `${lv} rights` : 'no rights'} there`
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
  const w: Worlds = {
    personB, personA,
    acctB: readAccounts([...rawB.values()], undefined, personB),
    acctA: readAccounts([...rawA.values()], undefined, personA),
    rawB, rawA,
    rowsB: unitRowsBefore(env.changes), rowsA: unitRowsBefore([]),
  }
  WORLDS.set(env, w)
  return w
}
/* the store keys of a side's rows the loader would NOT keep (a row it drops, or one whose id is not its key) — a deleted
   man's account aside, which every reading drops on purpose */
function droppedKeys(raw: Map<string, any>, kept: Account[], person: (pid: string) => any): Set<string> {
  const out = new Set<string>()
  for (const [k, x] of raw) {
    if (x && typeof x.pid === 'string' && person(x.pid) && person(x.pid).deleted) continue
    const a = x && kept.find(y => y.id === x.id)
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
function accountShapeAndMasterViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role === 'system') return null
  const w = worldsOf(env)
  if (!w) return null
  for (const c of env.changes) {
    if (c.collection !== 'settings' || !String(c.id).startsWith(ACCOUNT_ROW) || c.after == null) continue
    if (ACCOUNT_ROW + String((c.after as any).id) !== String(c.id)) return `an account row whose id is not its key (${c.id})`
  }
  const droppedB = droppedKeys(w.rawB, w.acctB, w.personB)
  for (const k of droppedKeys(w.rawA, w.acctA, w.personA)) if (!droppedB.has(k)) return `an account row the app would not load (${k})`
  const actorMaster = a.role === 'admin' && w.acctB.some(x => x.id === a.id && x.master === true)
  for (const m of w.acctB.filter(x => x.master === true)) {
    const now = w.acctA.find(x => x.id === m.id)
    const pb = w.personB(m.pid), pa = w.personA(m.pid)
    if (pb && !pb.deleted && pa && pa.deleted) return `a master admin's person deleted (people/${m.pid})`
    if (sameJson(m, now) && ACCOUNT_LIKE(pb) === ACCOUNT_LIKE(pa)) continue
    if (!actorMaster) return `a master admin's account changed by one who is not a master (${ACCOUNT_ROW}${m.id})`
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
   postingLock); this is the backstop. The app's other commands (none writes an account or a home) stay outside it. */
function lastAdminViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || (a.role === 'system' && env.type !== 'lw.postoutRun')) return null
  const w = worldsOf(env)
  if (!w) return null
  /* every date from today on that any home row, either side, starts — not only the rows this command changes: a move
     already saved for tomorrow (another admin's) is the date a demotion, a Suspend or an Archive today first harms (job
     2's reads: Astra 1, Opus F2, Fable F1) */
  const today = todayIso()
  const dates = new Set<string>([today])
  for (const h of [...w.rowsB.homes, ...w.rowsA.homes]) if (typeof h.from === 'string' && h.from >= today) dates.add(h.from)
  /* an archived man cannot sign in (accounts.ts refuses his session), so he is no admin who can (job 2, Astra 2) */
  const onRoster = (p: any) => !!p && !p.special && !p.deleted && !p.archived
  const able = (l: Account[], person: (pid: string) => any) => l.filter(x => x.role === 'admin' && x.on !== false && onRoster(person(x.pid)))
  const ableB = able(w.acctB, w.personB), ableA = able(w.acctA, w.personA)
  if (ableB.length && !ableA.length) return 'the last admin who can sign in switched off or removed'
  for (const d of [...dates].sort()) {
    const homesA = new Set(ableA.map(x => homeBefore(x.pid, d, w.rowsA)).filter(Boolean))
    for (const x of ableB) {
      const u = homeBefore(x.pid, d, w.rowsB)
      if (u && !homesA.has(u)) return `a squadron (${u}) left with no admin of its own who can sign in (on ${d})`
    }
  }
  return null
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
  /* the actor's account before the command — the row this command changed, put back; else the live list */
  let acct: { id: string; pid: string; role: string; master?: boolean } | null = null
  if (!sys) {
    const mine = env.changes.find(c => c.collection === 'settings' && c.id === ACCOUNT_ROW + a.id)
    const was: any = mine ? accountBefore(a.id, mine.before) : ACCOUNTS_LIST.find(x => x.id === a.id)
    acct = was ? { id: was.id, pid: String(was.pid), role: String(was.role), master: was.master === true }
      : { id: a.id, pid: String(a.personId ?? ''), role: a.role === 'admin' ? 'admin' : 'main' }
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
        if (after.grants.filter(g => g.account === n.account && g.unit === n.unit).length > 1) return `two rights for one account in one unit (${id})`
      }
    } else if (id.startsWith(UNIT_PFX) && !id.startsWith(UNITPLACE_PFX)) {
      if (after.unitplaces.some(x => x.unit === key) || after.homes.some(x => x.unit === key) || after.grants.some(x => x.unit === key)) return `a unit removed while still named (${id})`
    } else if (id.startsWith(PLACE_PFX)) {
      if (after.unitplaces.some(x => x.place === key)) return `a place removed while a unit is there (${id})`
    }
    /* WHO */
    if (sys) continue
    if (id.startsWith(UNITPLACE_PFX) || id.startsWith(GRANT_PFX) || id.startsWith(HOME_PFX)) {
      for (const img of [b, n]) if (img && !adminOf(String(img.unit))) return `not an admin of ${img.unit} (${id})`
    } else if (id.startsWith(UNIT_PFX)) {
      if (!master) return `only a master admin makes or changes a unit (${id})`
    } else if (id.startsWith(PLACE_PFX) && b != null && !master) {
      if (!before.units.some(u => placeIdOn(before, u.id, today) === key && adminOf(u.id))) return `not an admin of a unit at that place (${id})`
    }
  }

  if (masterMoved) {
    if (env.type !== 'account.master' && !(env.type === 'undo.restore' && env.origin === 'restore')) return 'the master mark changes only by its own command'
    if (!master) return 'only a master admin sets the master mark'
    for (const c of masterCh) {
      const img: any = c.after ?? c.before
      if (String(c.id) === ACCOUNT_ROW + a.id || (img && a.personId != null && String(img.pid) === String(a.personId))) return 'never his own master mark'
    }
    if (!(w ? w.acctA : readAccounts(accountImagesNow())).some(x => x.master === true)) return 'one master admin must be left'
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
  const acct = row
    ? { id: row.id, pid: String(row.pid), role: String(a.role), master: row.master === true }
    : { id: a.id, pid: String(a.personId ?? ''), role: 'admin' }
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
  /* A HOME IS JUDGED BY WHAT IT DOES, DAY BY DAY (the fix read, 18 Nov 26 — Astra 5, Opus 2 and 6): his squadron before
     the command against after it, on every date it could differ — today and every row's `from` in either image (a man's
     squadron changes only on those; his first row reaches back over every day before it, units-model.ts homeUnitOn).
     Judging a row only against TODAY let a forged row dated in the past take back days 149 had already lived, one dated
     the day after a move hand him back before 149's admin was asked, one of the same date win the tie, and a first row
     dated tomorrow move him today. Where his squadron differs on a date: never on a day already begun (D2119 — a man with
     no squadron yet may be placed from today: nothing of his is rewritten), and only by an admin of the squadron he
     leaves; the squadron he joins is section 6's. A row that only writes down the squadron he is in (units.ts setHome's
     baseline) changes no date and asks nothing. */
  const tomorrow = moveFrom(today)
  const moved = new Set<string>()
  for (const c of homes) for (const h of [c.before as any, c.after as any]) if (h && h.pid != null) moved.add(String(h.pid))
  for (const pid of moved) {
    if (made.has(pid)) continue   // a new man's first home — its unit is section 6's
    const dates = new Set<string>([today])
    for (const h of [...before.homes, ...after.homes]) if (String(h.pid) === pid && typeof h.from === 'string') dates.add(h.from)
    for (const d of [...dates].sort()) {
      const was = homeBefore(pid, d, before), now = homeBefore(pid, d, after)
      if (was === now) continue
      /* a man with no squadron is given one from TODAY, never from a day already gone (the second fix read, 18 Nov 26 —
         Opus F3: a forged first row dated last week passed on a shared store, where no man falls back to the demo's 142) */
      if (was == null) { if (d < today) return `a first home dated before today (home of ${pid} from ${d})`; continue }
      if (d < tomorrow) return `a home changed for a day already begun (home of ${pid} on ${d})`
      if (levelBefore(acct, was, today, before) !== 'admin') return `a man moved out of a squadron (${was}) by one who is not its admin (home of ${pid} from ${d})`
    }
  }
  return null
}

/* 7e. AN ADMIN'S BELL LINES AND READ RECORDS ARE HIS OWN SQUADRON'S PEOPLE'S (the second fix read, 18 Nov 26 — Fable's
   plan, still open 2; his D2194: no bell line about one squadron's own business reaches the other's people). A notice's
   id and a `seen:<pid>` / `noticeseen:<pid>` row name no squadron, and the admin branch below returns early, so 142's
   plain admin could write a bell line to a 149 man, take one of his away, or mark his history or his bell read. Now an
   admin's change to a notice (before or after) addressed to anyone but himself, or to another person's read record,
   needs him an admin of that person's squadron (his home today, as the rows stood before) — a master, or one given Plan
   of it, is. Kept crossing, as ruled: the holiday line (`oilhol`), which reaches every squadron at the place (D2184 R32 —
   until his D2195, holidays per own squadron, is built). `accessreq:` rows carry no squadron yet (Request access asking
   the squadron, D2111, is not built), so there is nothing to judge them by — filed.
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
  for (const c of env.changes) {
    if (c.collection !== 'inputs' || String(c.id) !== id) continue
    out ??= new Set<string>()
    for (const r of [c.before as any, c.after as any]) {
      if (!r || typeof r !== 'object') continue
      for (const e of namedOf(r)) out.add(String((e as any).p))
      if (r.by != null) out.add(String(r.by))
    }
  }
  return out
}
/* a line made wholly of holiday parts — the only kind kept crossing (one holiday part beside another part is no holiday
   line: SEC-2) */
const holidayLine = (n: any): boolean => Array.isArray(n?.what) && n.what.length > 0 && n.what.every((p: any) => p && p.k === 'oilhol')
/* A POSTING TAKEN BACK REACHES EVERY LINE IT MADE (fix read 3, Astra's 2 — D1693, D1699, D1710): "Undo post out", or a
   change of a posting that has run (its date moved, another outcome), takes back the lines its run put in each admin's
   bell — an unread one goes, a read one is replaced by one "taken back" line — whatever squadron that admin is in now.
   The one crossing into another squadron's bell this allows (D2194), each part checked against the posting record the
   same command changes: the line is about the man whose posting this is; the posting had RUN (`poDone` its date, the day
   after `to`) and is no longer as it ran (gone, another date or another outcome); the line is of that date and outcome;
   - a posting line (`po`) only DELETED, a line the app wrote (`by` none), and every posting line this command deletes of
     him of one moment — one run's lines (sync.ts postingLinesOf takes the newest run's);
   - a "taken back" line (`poback`) only ADDED, by the actor, of the same man, date and outcome, to a man whose own
     posting line of that run this same command deletes.
   Anything else on another squadron's bell is judged as before. */
function postingTakeBack(env: CommitEnvelope, c: Change, n: any, self: string | null): boolean {
  if (env.type !== 'lw.postout') return false
  const p: any = Array.isArray(n?.what) && n.what.length === 1 ? n.what[0] : null
  if (!p || (p.k !== 'po' && p.k !== 'poback') || p.who == null) return false
  const who = String(p.who)
  const pc = env.changes.find(x => x.collection === 'lw.postouts' && String(x.id) === who)
  const b: any = pc?.before
  if (!pc || !b || typeof b.to !== 'string' || !ISO_DAY.test(b.to)) return false
  const ran = isoAddDay(b.to)
  if (b.poDone !== ran) return false
  const f: any = pc.op === 'delete' ? null : pc.after
  if (f && f.to === b.to && f.poDone === b.poDone && passOutcomeOf(f) === passOutcomeOf(b)) return false
  const sameRun = (x: any): boolean => { const q = x?.what?.[0]; return !!q && String(q.who) === who && x.day === ran && q.o === passOutcomeOf(b) }
  if (!sameRun(n)) return false
  const poDeletes = env.changes.filter(x => x.collection === 'notices' && x.op === 'delete' && (x.before as any)?.what?.[0]?.k === 'po' && String((x.before as any).what[0].who) === who)
  if (p.k === 'po') {
    if (c.op !== 'delete' || c.before !== n || (n.by != null && n.by !== '')) return false
    return poDeletes.every(x => (x.before as any).at === n.at)
  }
  if (c.before != null || c.op === 'delete' || c.after !== n || self == null || String(n.by ?? '') !== self) return false
  return poDeletes.some(x => String((x.before as any).to) === String(n.to) && sameRun(x.before) && (x.before as any).by == null)
}
function adminOwnerViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role !== 'admin') return null
  const self = a.personId == null ? null : String(a.personId)
  let today: string | null = null, rows: UnitRows | null = null
  const ownsHim = (pid: string): boolean => {
    if (today == null) { today = todayIso(); rows = unitRowsBefore(env.changes) }
    const u = homeBefore(pid, today, rows!) ?? BOOT_UNIT
    return levelInForce(a, u, today, rows!) === 'admin'
  }
  const changedInputs = new Set(env.changes.filter(c => c.collection === 'inputs').map(c => String(c.id)))
  let replayed: ((c: Change) => boolean) | null | undefined
  for (const c of env.changes) {
    const where = `${c.collection}/${c.id}`
    if (c.collection === 'notices') {
      for (const n of [c.before as any, c.op === 'delete' ? null : (c.after as any)]) {
        if (!n || typeof n !== 'object' || n.to == null) continue
        if (holidayLine(n)) continue
        const to = String(n.to)
        if (n.iid && changedInputs.has(String(n.iid)) && toldBy(env, n.iid)?.has(to)) continue
        /* HIS OWN STEP, PUT BACK (fix read 3, O2 — D148: an Undo is refused only where the change itself would be). The
           war's lines carry no input (`iid: ''`), so a man told by the admin's Open for bidding, closing or decision who
           has since moved squadron made the top bar's Undo of that step a write to another squadron's bell, refused
           whole. Passed over ONLY for the restore the timeline is applying of this same admin's own step, the line image
           for image what that step recorded (undo/timeline.ts verifiedReplay), and a line he himself made (`by`). */
        if (to !== self && env.origin === 'restore' && self != null && String(n.by ?? '') === self) {
          if (replayed === undefined) replayed = REPLAY ? REPLAY(env) : null
          if (replayed && replayed(c)) continue
        }
        if (to !== self && postingTakeBack(env, c, n, self)) continue
        if (to !== self && !ownsHim(to)) return `a bell line of another squadron's man (${where})`
      }
      continue
    }
    if (c.collection !== 'settings') continue
    const id = String(c.id)
    /* (job 2, 19 Nov 26 — the security read's SEC-1: an admin's Approvals moment, `apprseen:<pid>`, and his record of
       the access requests he has seen, `reqseen:<account>`, are read records too — 142's plain admin set 149's admin's) */
    const pfx = id.startsWith('seen:') ? 'seen:' : id.startsWith('noticeseen:') ? 'noticeseen:' : id.startsWith('apprseen:') ? 'apprseen:' : id.startsWith('reqseen:') ? 'reqseen:' : null
    if (!pfx) continue
    const pid = pfx === 'reqseen:' ? String(ACCOUNTS_LIST.find(x => x.id === id.slice(pfx.length))?.pid ?? '') : id.slice(pfx.length)
    if (!pid) continue                                  // (an account with no person names no squadron to judge by)
    if (pid !== self && !ownsHim(pid)) return `another squadron's man's read record (${where})`
  }
  return null
}

export function ownershipViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  const unitBad = unitRowViolation(env)
  if (unitBad) return unitBad
  /* the one guardrail over people, accounts and homes, before against after (the second fix read — Fable's plan G0–G3:
     G0 and G1 here, G2 in homeUnitViolation, G3 the lock) */
  const shapeBad = accountShapeAndMasterViolation(env)
  if (shapeBad) return shapeBad
  const lockBad = lastAdminViolation(env)
  if (lockBad) return lockBad
  const unitRec = unitRecordViolation(env)
  if (unitRec) return unitRec
  const homeBad = homeUnitViolation(env)
  if (homeBad) return homeBad
  const inputBad = inputUnitViolation(env)
  if (inputBad) return inputBad
  /* WHEN A PERSON LAST OPENED HIS OWN WINDOW (M5a — the security read's finding 4): his own row, by its one command,
     for an ADMIN too — an admin who changed a man's leave could otherwise set that man's moment to now and wipe the dots
     that tell him (§11: "C R U own" for every role) */
  if (a && a.role !== 'system') {
    for (const c of env.changes) {
      if (c.collection !== 'settings' || !String(c.id).startsWith('lwseen:')) continue
      if (env.type !== 'lw.seen' || a.personId == null || c.id !== `lwseen:${a.personId}`) return `another person's last visit (${c.collection}/${c.id})`
    }
  }
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
     men's accounts (and, for a Delete, the request and bell row that go with his account). */
  if (a && a.role === 'system' && env.type === 'lw.postoutRun') {
    const bad = postingPassViolation(env)
    if (bad) return bad
  }
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
        /* WHO PLACED A LEAVE THE WAR APPROVED (the overhaul's M4, 8.6 — the security read's question, the spec §3): the
           request's placer rides on its Input as `lwBy` / `lwAt`, written only by an admin's approval; a member's own
           command keeps them as they were or drops them, never writes them (his Undo or Redo puts back the image it took) */
        /* (his Undo or Redo puts back the image it took — ONLY the one the timeline is applying, record for record; a
           change that merely calls itself a restore is judged as any other: the security read's finding 1) */
        if (!(replayed && replayed(c)) && c.op === 'put' && c.after) {
          const f: any = c.after
          /* (a piece cut from a leave — a medical splitting it — is a new record carrying its parent's stamp: any before-image
             of this command's own vouches for it) */
          const stamp = `${f.lwBy ?? ''}|${f.lwAt ?? ''}`
          if ((f.lwBy !== undefined || f.lwAt !== undefined)
            && !env.changes.some(x => x.collection === 'inputs' && x.before && `${(x.before as any).lwBy ?? ''}|${(x.before as any).lwAt ?? ''}` === stamp))
            return `who placed a leave on the war (${where})`
        }
        break
      }
      /* A BELL'S NOTICE (state/notices.ts; the plan §4.10): a member's command may make one only as part of his OWN
         change to the input it names — the same command changes that input — naming himself as its maker and addressed
         to someone else; his own Undo of that change takes away the notices it made (a Redo puts them back the same
         way). Nobody rewrites a notice, and nobody removes another person's. */
      case 'notices': {
        const b: any = c.before, n: any = c.after
        const rides = (iid: any) => env.changes.some(x => x.collection === 'inputs' && x.id === String(iid))
        /* A LEAVE WAR LINE IS NEVER A MEMBER'S (M4; the security read's finding 4): "Your leave · LL refused", bidding
           opened or closed, "… taken back" are written only by an admin's war command (state/notices.ts noticeWar, the
           `lw.notice` follow-up) — a member's notice riding his own input may carry none of them */
        const warLine = (x: any) => Array.isArray(x?.what) && x.what.some((p: any) => WAR_LINE_KINDS.has(String(p?.k)))
        if (c.op === 'put' && warLine(n)) return `a notice that is not his own change's (${where})`
        /* …and only to someone that change tells — named in the input, before or after, or its filer (toldBy, SEC-3) */
        if (c.op === 'put' && b == null && n && String(n.by) === pid && String(n.to) !== pid && rides(n.iid) && toldBy(env, n.iid)?.has(String(n.to))) break
        if (c.op === 'delete' && env.origin === 'restore' && b && String(b.by) === pid && rides(b.iid) && toldBy(env, b.iid)?.has(String(b.to))) break
        return `a notice that is not his own change's (${where})`
      }
      case 'people': {
        if (c.id !== pid) return `another person's row (${where})`
        /* his own row, but never what the admin owns on it (D218, D1510); a delete or a new row of his own is neither
           his to make, so an absent side reads as an empty person */
        const b: any = c.before ?? {}, n: any = c.op === 'delete' ? {} : (c.after ?? {})
        for (const [what, read] of OWN_ROW_ADMIN_ONLY) if (read(b) !== read(n)) return `${what} (${where})`
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
