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
import { INPUTS, inpMeta, typeGroup, isSansAvail, needsDoc } from '../engine/inputs'
import { voidedOil } from '../engine/oil'
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
  input: 'Input',
  attachment: 'Attachment, InputAttachment',
  war: 'LeaveWar',
  bid: 'LeaveBid',
  award: 'LeaveLedger (an OIL award: counter oil, amount above 0)',
  ledger: 'LeaveOpening, LeaveLedger, LeaveCounter',
  profile: 'LeavePersonProfile',
  tracker: 'Course, Syllabus, TrainingEvent, EventPrerequisite, Layout, CoursePlan, Enrolment, Attempt',
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
  [T.input]: row(cell('C R U D'), cell('R', 'C R U D'), cell('R')),
  [T.attachment]: row(cell('R'), cell('R', 'C R')),
  [T.war]: row(cell('C R U D'), cell('R')),
  [T.bid]: row(cell('C R U D'), cell('R', 'C U D')),
  /* [OIL-AWARD-IS-A-GRANT] (29 Sep 26): every hand-given OIL award is ONE kind of record — a positive OIL ledger entry —
     and keeps its OWN row: every member reads every man's (the grid draws every row, D402); the rest of the ledger stays
     his own only, the gap between that and what the app shows filed as [LEDGER-READ-ASK] (both plan reads) */
  [T.award]: row(cell('C R U D'), cell('R')),
  [T.ledger]: row(cell('C R U D'), cell('', 'R'), NONE, NONE, ['LEDGER-READ-ASK']),
  [T.profile]: row(cell('C R U D'), cell('R')),
  [T.tracker]: row(cell('C R U D'), cell('C R U D')),
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
export function filedForOther(pid: string, before: any, after: any): boolean {
  if (!before && !after) return false
  if (!pid || !membersFileOn()) return false
  if (before && after && String(before.person) !== String(after.person)) return false
  if (!filerOf(String(pid), before || after)) return false
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
  if (allows(who, T.input, act, row.person, identityOf(who))) return true  // an admin; the man himself, in full
  const pid = who === 'member' ? me() : null
  return pid != null && filedForOther(pid, row, row)
}
/* may he change / delete this input? An admin; the man; its filer, for a kind he may file for others, switch on. */
export const mayEditInput = (row: any): boolean => mayChangeInput(row, 'U')
export const mayDeleteInput = (row: any): boolean => mayChangeInput(row, 'D')
/* §11's own-row note for `Input`, word for word — perms.test.ts fails when docs/data-model.md says anything else
   (D200: "the server's rules at the database step are a translation of an agreed list") */
export const INPUT_FILER_NOTE = 'or — while the squadron\'s members-file-for-others setting is on — a Duty & other commitments input (not SANS Availability) that I FILED for him (`filedBy` or `groupFiledBy` = my person; D654, D655, D658): I may create, change and delete it, and answer its OIL question for him (D660); never move it to another person'
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
export const mayEditQualsOf = (pid: any): boolean => may(T.person, 'U', pid, true)
/* the callsign on his row is the admin's to change (D218, narrowing D149); no session → true */
export const mayRenameCallsign = (): boolean => roleOf() === null || isAdmin()
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
  'qualcols', 'lookahead', 'secdefault', 'wavedefault', 'guestview', 'insights', 'sanscalendar', 'flynames', 'memberfile'] as const

export const COMMAND_OPS: Record<string, CommandOp> = {
  'sans.day.set': op(T.setting, 'U'),
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
  'lw.approve': op(T.bid, 'U'),
  'lw.decideApproved': op(T.bid, 'U'),
  'lw.removeApproved': op(T.bid, 'U'),
  'lw.moveApproved': op(T.bid, 'U'),
  /* D352 (28 Sep 26): a stage move (Open for bidding / Bidding closed / Published) — the admin's, as the stage always was
     (27 Aug 26); its own type only so Undo can name it */
  'lw.stage': op(T.bid, 'U'),
  /* the Holidays list's three writers (leavewar/state/store.ts holidayAdd / holidayChange / holidayRemove — the Inputs /
     SANS redesign, plan §3.4): a public holiday or an Off day is the leave period's own record, an admin's to change */
  'lw.holiday.add': op(T.war, 'U'), 'lw.holiday.change': op(T.war, 'U'), 'lw.holiday.remove': op(T.war, 'U'),
  /* [OIL-AWARD-IS-A-GRANT] (Astra's round-2 read, R2-01): an OIL award is written under ITS row of the table, a ledger
     entry (another pool's credit, a correction) under the ledger's, and a clear that takes an award beside a bid names
     both — a member's clear takes no award and runs as `lw.edit` */
  'lw.award': op(T.award, 'U'),
  'lw.ledger': op(T.ledger, 'U'),
  'lw.clear': op(T.bid, 'U', 'optional', [[T.award, 'D']]),
  /* the Tracker: everyone with access edits it (D121) */
  'trk.marks': op(T.tracker, 'U'), 'trk.dates': op(T.tracker, 'U'), 'trk.roster': op(T.tracker, 'U'),
  'trk.layout': op(T.tracker, 'U'), 'trk.syls': op(T.tracker, 'U'), 'trk.plan': op(T.tracker, 'U'),
  'trk.pace': op(T.tracker, 'U'), 'trk.lulls': op(T.tracker, 'U'), 'trk.eventinfo': op(T.tracker, 'U'),
  'trk.catalogue': op(T.tracker, 'U'), 'trk.courses': op(T.tracker, 'U'), 'trk.gesture': op(T.tracker, 'U'),
  'trk.meta': op(T.tracker, 'U'),
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
  'person.add': op(T.person, 'C', 'never', [[T.profile, 'U']]),
  'account.addNew': op(T.user, 'C', 'never', [[T.person, 'C'], [T.accessreq, 'D'], [T.profile, 'U']]),
  'access.approveNew': op(T.accessreq, 'D', 'never', [[T.user, 'C'], [T.person, 'C'], [T.profile, 'U']]),
  /* his OWN row of the requests he has seen (AccessRequestSeen — [DB-READINESS] group A, phase 4.4) */
  'access.seen': op(T.reqseen, 'U', 'required'),
  /* [DRAFT-PENDING] (D170): "Mark all as seen" in the changes window — the signed-in person's OWN entry only */
  'changes.seen': op(T.seen, 'U', 'required'),
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
  'lw.postout': op(T.profile, 'U', 'never', [[T.person, 'U'], [T.user, 'U']]),
  /* the posting pass on its date — a reconciler (the system actor); every table an outcome writes is named (D200) */
  'lw.postoutRun': op(T.profile, 'U', 'never', [[T.person, 'U'], [T.person, 'D'], [T.user, 'U'], [T.user, 'D'], [T.sched, 'U'], [T.amendment, 'C'], [T.input, 'D'], [T.input, 'U'], [T.bid, 'D'], [T.award, 'D']]),
}
for (const k of SETTINGS_KEYS_ALL) COMMAND_OPS[`settings.${k}`] = op(T.setting, 'U')

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
const personOfInput = (v: any): string | null => (v && v.person != null ? String(v.person) : null)
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

const same = (a: any, b: any): boolean => (a ?? null) === (b ?? null)
const filed = (x: any, y: any): boolean => same(x.by, y.by) && same(x.at, y.at) && same(x.grp, y.grp) && same(x.grpBy, y.grpBy)
const isInputChange = (c: Change): boolean => c.collection === 'inputs' && c.id !== INPUT_ORDER
function inputBreach(env: CommitEnvelope, c: Change, pid: string, replayed: boolean): string | null {
  const b: any = c.before ?? null, f: any = c.op === 'delete' ? null : (c.after ?? null)
  const own = (b == null || personOfInput(b) === pid) && (f == null || personOfInput(f) === pid)
  if (!own && !filedForOther(pid, b, f)) return `another person's input`
  if (replayed || !f) return null
  if (!b) {
    /* a piece the app cut from a record of the same man this command changed or deleted */
    const piece = env.changes.some(o => o !== c && isInputChange(o) && o.before != null
      && personOfInput(o.before) === personOfInput(f) && filed(o.before, f))
    if (!piece) {
      if (own ? (f.by != null && String(f.by) !== pid) : String(f.by ?? '') !== pid) return `an input placed in another person's name`
      const g = f.grp ?? null, gb = f.grpBy ?? null
      if ((g == null) !== (gb == null)) return `a shared input without its filer`
      if (g != null && String(gb) !== pid && !groupStood(env, g, gb)) return `a shared input filed in another person's name`
    }
  } else {
    if (!same(b.by, f.by) || !same(b.at, f.at)) return `who placed an input`
    if (!same(b.grp, f.grp) || !same(b.grpBy, f.grpBy)) {
      const made = b.grp == null && b.grpBy == null && f.grp != null && f.grp !== '' && String(f.grpBy ?? '') === pid
      if (!made) return `who filed a shared input`
    }
  }
  if (own) return null
  const oil = f.oil
  if (oil == null) return null
  if (typeof oil !== 'object' || Array.isArray(oil)) return `an OIL answer for another person`
  const kept: Record<string, number> = (b ? voidedOil(b, f) : undefined) || {}
  let plan: Map<string, number> | null = null
  for (const k of Object.keys(oil)) {
    if (k in kept && kept[k] === oil[k]) continue
    if (!plan) plan = new Map(oilPlanOf(f).map(p => [p.iso, p.amt] as [string, number]))
    const amt = plan.get(k)
    if (amt == null || (oil[k] !== 0 && oil[k] !== amt)) return `an OIL answer the input's days and hours do not give`
  }
  return null
}
/* did this group stand, with this filer, BEFORE the command — a record of it the command did not create? */
function groupStood(env: CommitEnvelope, grp: any, grpBy: any): boolean {
  const made = new Set<string>()
  for (const o of env.changes) {
    if (!isInputChange(o)) continue
    if (o.before == null) { made.add(o.id); continue }
    const was: any = o.before
    if (same(was.grp, grp) && same(was.grpBy, grpBy)) return true
  }
  return (INPUTS as any[]).some(r => r && r.iid && !made.has(String(r.iid)) && same(r.grp, grp) && same(r.grpBy, grpBy))
}

export function ownershipViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role === 'system' || a.role === 'admin') return null
  let replayed: ((c: Change) => boolean) | null | undefined
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
        break
      }
      case 'people': if (c.id !== pid) return `another person's row (${where})`; break
      case 'lw.cell': { const parts = c.id.split(':'); if (parts[parts.length - 2] !== pid) return `another person's war row (${where})`; break }
      case 'lw.current': break
      /* [DRAFT-PENDING] (D170): "Mark all as seen" — a member writes his OWN seen row and no other (EditLogSeen, own row
         — one row per person since [DB-READINESS] group A, phase 4.3) */
      case 'settings':
        if (c.id.startsWith('seen:') && env.type === 'changes.seen') {
          if (c.id !== `seen:${pid}`) return `another person's seen record (${where})`
          break
        }
        return `an admin's record (${where})`
      case 'lw.war': case 'lw.ledger': case 'lw.opening': case 'lw.oilpolicy': case 'lw.postouts': case 'lw.label': case 'lw.config':
      case 'plan':
      case 'insights.role':
        return `an admin's record (${where})`
      default: break                       // the Tracker (the schedule and the week stash are refused above)
    }
  }
  return null
}
