/* THE ONE PLACE THAT ANSWERS "MAY THIS PERSON DO THIS?" ([ACCOUNTS], D200 (3), 26 Sep 26).

   Owner, D200: "one place in the app answers 'may this person do this?', mirroring that
   table, with a test that fails when they disagree — so the server's rules at the
   database step are a translation of an agreed list, not a hunt."

   Four parts, all here:
   1. PERMS — docs/data-model.md §11 as data. perms.test.ts reads §11 from disk and
      fails when a row, a letter, a column or a named gap differs. Edit the two TOGETHER.
   2. The named questions every gate asks (isAdmin, me, mayEditSched, mayEditInputOf …),
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
import type { Actor, CommitEnvelope } from '../command/types'

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
  user: 'User',
  accessreq: 'AccessRequest',
  sched: 'ScheduleWeek family, DayDraft, RowPerson',
  amendment: 'Amendment, Signoff',
  editlog: 'EditLog',
  input: 'Input',
  attachment: 'Attachment, InputAttachment',
  war: 'LeaveWar',
  bid: 'LeaveBid',
  award: 'LeaveBid (a hand-typed OIL award)',
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
  [T.user]: row(cell('C R U D'), cell('', 'R')),
  [T.accessreq]: row(cell('R U D'), NONE, NONE, cell('', 'C')),
  [T.sched]: row(cell('C R U D'), cell('R'), cell('R')),
  [T.amendment]: row(cell('C R'), cell('R'), cell('R')),
  [T.editlog]: row(cell('R'), cell('R'), NONE, NONE, ['DRAFT-PENDING']),
  [T.input]: row(cell('C R U D'), cell('R', 'C R U D'), cell('R')),
  [T.attachment]: row(cell('R'), cell('R', 'C R')),
  [T.war]: row(cell('C R U D'), cell('R')),
  [T.bid]: row(cell('C R U D'), cell('R', 'C U D')),
  [T.award]: row(cell('C R U D'), cell('R'), NONE, NONE, ['OIL-AWARD-IS-A-GRANT']),
  [T.ledger]: row(cell('C R U D'), cell('', 'R')),
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

/* personal inputs (the member-own rule, 27 Aug 26). No session → true: "a sessionless
   test/boot context is not a member and is not gated" (the gates these replace). */
export const mayFileInputFor = (pid: any): boolean => may(T.input, 'C', pid, true)
export const mayEditInputOf = (pid: any): boolean => may(T.input, 'U', pid, true)
export const mayDeleteInputOf = (pid: any): boolean => may(T.input, 'D', pid, true)
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
   canEditRow, the input writers' mayEditInputOf). THE INPUT COMMANDS NAME NO OWNER (Fable's
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
  'qualcols', 'lookahead', 'secdefault', 'wavedefault', 'accounts', 'accessreqs', 'guestview'] as const

export const COMMAND_OPS: Record<string, CommandOp> = {
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
  'sched.discard': op(T.sched, 'U'),
  'sched.unpublish': op(T.amendment, 'C'),
  'sched.stores': op(T.sched, 'U'),
  'sched.sign': op(T.amendment, 'C'),
  'sched.signClear': op(T.amendment, 'C'),
  'sched.warnMute': op(T.sched, 'U'),
  'sched.oil': op(T.sched, 'U'),
  'sched.draft.rename': op(T.sched, 'U'),
  'sched.draft.delete': op(T.sched, 'U'),
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
  /* the Tracker: everyone with access edits it (D121) */
  'trk.marks': op(T.tracker, 'U'), 'trk.dates': op(T.tracker, 'U'), 'trk.roster': op(T.tracker, 'U'),
  'trk.layout': op(T.tracker, 'U'), 'trk.syls': op(T.tracker, 'U'), 'trk.plan': op(T.tracker, 'U'),
  'trk.pace': op(T.tracker, 'U'), 'trk.lulls': op(T.tracker, 'U'), 'trk.eventinfo': op(T.tracker, 'U'),
  'trk.catalogue': op(T.tracker, 'U'), 'trk.courses': op(T.tracker, 'U'), 'trk.gesture': op(T.tracker, 'U'),
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
  'person.add': op(T.person, 'C'),
  'account.addNew': op(T.user, 'C', 'never', [[T.person, 'C'], [T.accessreq, 'D']]),
  'access.approveNew': op(T.accessreq, 'D', 'never', [[T.user, 'C'], [T.person, 'C']]),
  'access.seen': op(T.accessreq, 'U'),
  /* a delete ([POST-OUT-OUTCOMES], D287, D290, D297, D299): the person marked (the hidden mark — D is the soft delete),
     his account removed, and on every day from its cutoff he is taken off — the working copy, the stashed weeks, the
     parked plans, the planning calendar (the schedule family), his sign-off boxes cleared (as the sign-clear command),
     and his inputs from that day deleted or ended the day before. Every table it writes is named (D200). The Leave War
     half (his records, his posting) joins in Part B with LeavePersonProfile. */
  'person.delete': op(T.person, 'D', 'never', [[T.user, 'D'], [T.accessreq, 'D'], [T.sched, 'U'], [T.amendment, 'C'], [T.input, 'D'], [T.input, 'U'], [T.profile, 'U'], [T.bid, 'D']]),
  /* he's back — Restore on Quals, Undo post out, Restore under another callsign (D284, D286, D295): the person restored
     (and renamed), the account the posting suspended enabled, the posting cleared; never a member's own-row write */
  'person.restore': op(T.person, 'U', 'never', [[T.user, 'U'], [T.profile, 'U']]),
  /* a posting written with a take-back of what the posting made (its archive, its suspension, its SANS tick) */
  'lw.postout': op(T.profile, 'U', 'never', [[T.person, 'U'], [T.user, 'U']]),
  /* the posting pass on its date — a reconciler (the system actor); every table an outcome writes is named (D200) */
  'lw.postoutRun': op(T.profile, 'U', 'never', [[T.person, 'U'], [T.person, 'D'], [T.user, 'U'], [T.user, 'D'], [T.sched, 'U'], [T.amendment, 'C'], [T.input, 'D'], [T.input, 'U'], [T.bid, 'D']]),
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
   - `inputs`   every changed input is his (its person before AND after); the input
                order record rides along;
   - `people`   only his own row (D149);
   - `lw.cell`  only his own war row (id `war:person:date`); `lw.current` (which war is
                shown) is his own view; every other war record — the war itself, the
                ledger, balances, OIL policy, postings, config — is the admin's;
   - `settings` and `plan` (the planning calendar) — none;
   - the schedule's records and the week stash — only as the landing of his own input,
                a child of his authorised input command (16 Sep 26: it lands a row on a
                published day's working copy); never by a top-level `sched.mutate`;
   - the Tracker — everyone's (D121).
   A guest, a pending person and an account switched off change NOTHING, except a
   pending person's own access request (the `accessreqs` settings record). */
const INPUT_ORDER = '__order'
const personOfInput = (v: any): string | null => (v && v.person != null ? String(v.person) : null)
/* THE SCHEDULE'S OWN RECORDS. A member's change to them is legitimate only as the landing
   of his own input — which runs INSIDE his authorised input command (a joined child). The
   bare "the schedule changed" command (`sched.mutate`, the afterSchedMutate backstop) is the
   one schedule command a member's actor can open, so as a TOP-LEVEL command it changes none
   of these for him (Fable's and Astra's code reads, 26 Sep 26: the second, write-path guard
   the UI gates stand in front of; §11 — members read the schedule only). A refusal rolls
   the schedule back to its last committed state. */
const SCHEDULE_RECORDS = new Set(['days', 'sched.book', 'sched.mutes', 'sched.orig', 'sched.als', 'sched.retired', 'weekstash'])
export function ownershipViolation(env: CommitEnvelope): string | null {
  const a = env.actor
  if (!a || a.role === 'system' || a.role === 'admin') return null
  for (const c of env.changes) {
    const where = `${c.collection}/${c.id}`
    if (a.role !== 'member') {
      if (a.role === 'pending' && env.type === 'access.request' && c.collection === 'settings' && c.id === 'accessreqs') continue
      return `${a.role} may not change ${where}`
    }
    const pid = a.personId == null ? null : String(a.personId)
    if (!pid) return `no person to own ${where}`
    if (env.type === 'sched.mutate' && SCHEDULE_RECORDS.has(c.collection)) return `the schedule (${where})`
    switch (c.collection) {
      case 'inputs': {
        if (c.id === INPUT_ORDER) break
        const b = personOfInput(c.before), f = personOfInput(c.after)
        if ((b != null && b !== pid) || (f != null && f !== pid)) return `another person's input (${where})`
        break
      }
      case 'people': if (c.id !== pid) return `another person's row (${where})`; break
      case 'lw.cell': { const parts = c.id.split(':'); if (parts[parts.length - 2] !== pid) return `another person's war row (${where})`; break }
      case 'lw.current': break
      case 'lw.bid': case 'lw.war': case 'lw.ledger': case 'lw.balances': case 'lw.oilpolicy': case 'lw.postouts': case 'lw.config':
      case 'settings': case 'plan':
        return `an admin's record (${where})`
      default: break                       // the schedule, the week stash, the Tracker
    }
  }
  return null
}
