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
import { INPUTS, inpMeta, typeGroup, isSansAvail, needsDoc, peopleOf, idsOf, leadOf, onlyNamed, holds } from '../engine/inputs'
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
  /* the bell's notices (state/notices.ts — the one-rule build's step 7): one row a person told that an input he is in
     was changed; and what each person has read of them, his own row */
  notice: 'Notice',
  noticeseen: 'NoticeSeen',
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
  /* a notice is written by whoever made the change, inside it, and read by the person it is addressed to; nobody
     rewrites one, and it is removed only by its maker's own Undo of that change */
  [T.notice]: row(cell('C R D'), cell('C', 'R D')),
  [T.noticeseen]: row(cell('', 'C R U'), cell('', 'C R U')),
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
export const INPUT_FILER_NOTE = 'or — while the squadron\'s members-file-for-others setting is on — a Duty & other commitments input (not SANS Availability) that I FILED (`filedBy` = my person; D654, D655, D658), while everyone else in it was put in by me: I may create, change and delete it, change who is in it, and give its one OIL answer for everyone in it (D660, D762); my own one-person input that I add people to is one I filed from then on, whoever filed it for me; once a scheduler has put someone in it, changing it for everyone is the scheduler\'s (D755); from an input I am in I may always take myself out, and I add nobody to an input I did not file (D755, D763); the scheduler\'s marks on an input — cancelled with its reason, the red box, information only — are never mine to set or clear, on my own input too (D760); an input filed for ALL AVAIL / ALL counts as filed for another person — one of seven kinds, one day (D700, D711, D712, D713, D778)'
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
  /* opening or closing dates for bidding (D1177, 21 Oct 26 — the stages went; D352 narrowed): the admin's, as the stage
     always was (27 Aug 26) — the period's own record; its own type so Undo can name it ("Undid: opening bidding …") */
  'lw.open': op(T.war, 'U'),
  /* the Holidays list's three writers (leavewar/state/store.ts holidayAdd / holidayChange / holidayRemove — the Inputs /
     SANS redesign, plan §3.4): a public holiday or an Off day is the leave period's own record, an admin's to change */
  'lw.holiday.add': op(T.war, 'U'), 'lw.holiday.change': op(T.war, 'U'), 'lw.holiday.remove': op(T.war, 'U'),
  /* the Event sheet's Save and Delete, each one command (leavewar/state/store.ts saveEvent / deleteEvent — plan §3.12):
     a day's event is the leave period's own record too, an admin's to change */
  'lw.event.save': op(T.war, 'U'), 'lw.event.remove': op(T.war, 'U'),
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
  'person.add': op(T.person, 'C', 'never', [[T.profile, 'U']]),
  'account.addNew': op(T.user, 'C', 'never', [[T.person, 'C'], [T.accessreq, 'D'], [T.profile, 'U']]),
  'access.approveNew': op(T.accessreq, 'D', 'never', [[T.user, 'C'], [T.person, 'C'], [T.profile, 'U']]),
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
   open, as before. An Undo or Redo of his own step passes, image for image (the replay check, as the inputs'). */
type LwDayOpen = (cellId: string) => boolean
let LW_DAY_OPEN: LwDayOpen | null = null
export function setLwDayOpenProbe(fn: LwDayOpen | null): void { LW_DAY_OPEN = fn }
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
  { const mk = (x: any) => JSON.stringify(x ? [!!x.cx, x.cx ? String(x.cxr || '') : '', !!x.flag, !!x.info] : [false, '', false, false])
    const src = b || (env.changes.find(o => o !== c && isInputChange(o) && o.before != null && idsOf(f).some((p: any) => holds(o.before, p))) || {} as any).before || null
    if (mk(f) !== mk(src)) return `a scheduler's mark on an input` }
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
      /* A BELL'S NOTICE (state/notices.ts; the plan §4.10): a member's command may make one only as part of his OWN
         change to the input it names — the same command changes that input — naming himself as its maker and addressed
         to someone else; his own Undo of that change takes away the notices it made (a Redo puts them back the same
         way). Nobody rewrites a notice, and nobody removes another person's. */
      case 'notices': {
        const b: any = c.before, n: any = c.after
        const rides = (iid: any) => env.changes.some(x => x.collection === 'inputs' && x.id === String(iid))
        if (c.op === 'put' && b == null && n && String(n.by) === pid && String(n.to) !== pid && rides(n.iid)) break
        if (c.op === 'delete' && env.origin === 'restore' && b && String(b.by) === pid && rides(b.iid)) break
        return `a notice that is not his own change's (${where})`
      }
      case 'people': if (c.id !== pid) return `another person's row (${where})`; break
      case 'lw.cell': {
        const parts = c.id.split(':')
        if (parts[parts.length - 2] !== pid) return `another person's war row (${where})`
        /* …and his Undo of such a delete puts back exactly what it took (the walk's find, 22 Oct 26: the Undo was refused):
           a restore that only ADDS BACK pending bids of his — the same check, read the other way */
        const after = c.op === 'delete' ? [] : c.after
        if (LW_DAY_OPEN && !LW_DAY_OPEN(c.id) && !onlyTakesPending(c.before, after)
          && !(env.origin === 'restore' && onlyTakesPending(after, c.before))) {
          if (replayed === undefined) replayed = env.origin === 'restore' && REPLAY ? REPLAY(env) : null
          if (!(replayed && replayed(c))) return `a war day not open for bidding (${where})`
        }
        break
      }
      case 'lw.current': break
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
        return `an admin's record (${where})`
      case 'lw.war': case 'lw.ledger': case 'lw.opening': case 'lw.oilpolicy': case 'lw.postouts': case 'lw.label': case 'lw.config':
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
