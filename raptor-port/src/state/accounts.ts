/* ACCOUNTS — who can sign in, and as whom ([ACCOUNTS], 26 Sep 26).

   Owner, D166 (25 Sep 26): "leave war should not be tagged to view as, it should be
   tagged to callsigns which is tagged to defence mails … There isint a need for preview
   as a member" · "Currently the user login and password is simulating that the user is
   logging in with their defence mail". D165: the admin creates each person and ties them
   to their defence mail. D204 (26 Sep 26): a new user joins either way — the admin adds
   him first, or he signs in, finds he is on no list and asks; the admin approves, sets
   member or admin and links him to a puck (a typed callsign never claims one); while
   waiting he sees a waiting screen, and an admin switch (off by default) lets people
   waiting see the programme read-only as a guest.

   THE RECORDS (the Shell's `User`, `AccessRequest` and `AccessRequestSeen`, and one `Setting` —
   data-model §3, §11), durable settings rows written ONLY here, through intent commands
   (commitSettingsIntent — one command per intent, every row it needs inside it). ONE ROW PER THING
   since [DB-READINESS] group A, phase 4.4 (plan §2.5's matrix): `account:<id>`, `accessreq:<id>`,
   `reqseen:<accountId>` — two admins adding accounts, or marking requests seen, at once each write
   their own rows, never a shared list. A write changes EXACTLY the rows its own list edit changed
   (the list before this command against the list after — never against storage, so a client that
   has not yet read someone else's new account can never remove it):
   - `account:<id>` { id, name, role, pid, on, offBy?, seenFrom?, createdAt? }. `name` is the sign-in name,
                  which stands for the defence mail address; `pid` the person it belongs
                  to (one person, one account); `on` false = suspended (D285; `offBy: 'po'`
                  when a posting out suspended it). Removed only with its person, by a delete
                  ([POST-OUT-OUTCOMES], D287 — state/person-delete.ts). `createdAt` (ms) — two
                  accounts stored for ONE person (two admins at once, before the database's unique
                  `personId` refuses the second — group B): the older is kept, the other dropped
                  on load with a logged line (a seeded account, with none, is the oldest).
                  NO ROWS AT ALL = the seeded list, in memory (as a missing record was): the first
                  write then stores every account of the list it leaves, so none is lost.
   - `accessreq:<id>` { id, name, cs, ini, seat, cat, at }: the
                  signed-in principal who asked (from the session, never a typed field);
                  what he typed — the displayed callsign/name, initials, pilot / WSO /
                  personnel, CAT (text only: approving with New person makes the person
                  from it, with the admin's corrections — [ACCOUNTS-NEW-PERSON], D214);
                  when.
   - `reqseen:<accountId>` { userId, seenRequestIds } — which requests that admin has had on
                  screen (the bell — D216, D227); his own row, removed with his account. In
                  memory each request still carries `seenBy` (every admin who has seen it), read
                  from these rows at load — never stored on the request (design corrected, R3-04).
   - `guestview`  boolean — the guest switch, OFF by default.

   PASSWORDS — NONE STORED (data-model §3: "no password is ever stored in this model";
   Astra R1-7). At the database step Microsoft checks the password and the authenticator
   and tells the app who signed in. Today the sign-in's password box stands for that
   check: an account the admin adds takes any non-empty password, and so does a name on
   no list (which then lands on "Request access"). The two sign-ins every test and the
   owner already use keep their old passwords (24 Aug 26 — `ad`/`a`, `us`/`us`, a wrong
   one still refused) in SEED_PASS below — code only, never in a stored record. The
   consequence, on his look card: until Microsoft's sign-in, anyone who knows an added
   account's sign-in name can sign in as it (as anyone could pick anyone in "View as"
   before). NONE of this is security; the app sits behind his hosting sign-in.

   THE GUARDS (each refusal says why on screen): at least one account ON and admin, whose
   person exists, always remains; an admin never changes his own account; one person one
   account; one sign-in name one account; adding an account for a name that has asked
   answers the request. A person ARCHIVED under an account keeps it (posting out archives
   automatically — leavewar/sync.ts runPoArchive — so refusing sign-in would lock out
   whoever it catches); the Admin list marks it. [ONE-DOOR] (D310, D322, 27 Sep 26): an
   archived man keeps his account but it is SUSPENDED — Archive suspends it, an overseas
   posting suspends it, Enable is refused while he is archived, and Restore enables it
   whatever suspended it; his row sits in Admin → Users' Archived group. */
import { elogNow, type LinePos } from '../engine/editlog'
import { store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { SESSION } from './auth'
import { isAdmin, mayManageAccounts, mayManageRoster, mayRequestAccess, me, roleOf } from './perms'
import { commitSettingsIntent, commitPeopleSettingsIntent, commitPeopleIntent } from './people-settings-commit'
import {
  MAX_CS, MAX_INITIALS, SEATS, catsFor, seatLabel, tidyPerson, newPersonProblem, putNewPerson, addRosterPerson, saidOf,
  postInProblem, type NewPerson,
} from './roster-add'
import { HOOKS } from '../engine/hooks'
import { putNewHome, levelOfAccount, todayIso, homeOn, units, unitById, unitRows } from './units'
import type { UnitLevel } from './units-model'
import { validIso } from './flyplan-model'

export type AccountRole = 'admin' | 'main'
/* `offBy: 'po'` — the account was SUSPENDED BY A POSTING OUT ([POST-OUT-OUTCOMES], D280 — the overseas outcome suspends
   it on the date), so "he's back" (Restore, Undo post out) enables exactly that suspension and never one an admin made
   by hand; any Enable or Suspend by hand drops it (the plan's Round 1, Astra A5 — a hand change is never undone) */
/* `seenFrom` ([DRAFT-PENDING], Fable F6, 28 Sep 26): where the change history stood when the account was made — a
   POSITION in its order, (at, lineId), since [DB-READINESS] group A, phase 4.3 (Fable F2-02) — someone given access
   later starts with nothing new; the lines before it are the squadron's past, not news to him (state/changes.ts).
   Absent on the seeded accounts (the demo history starts empty). `createdAt` — see the header. */
/* `masterFrom` (fix read 7, fault P — Astra's A2, Fable's 2): the day the master mark was set, written by setMaster only.
   A bell line his move retired asks whether he was still told on that day (state/notices.ts adminThen); a mark given after
   it must not bring the line back. Absent on a mark set before it was kept (the demo's seeded master — D56): counts from
   always. It rides with `master` and goes with it. */
export interface Account { id: string; name: string; role: AccountRole; pid: string; on: boolean; offBy?: 'po'; seenFrom?: LinePos; createdAt?: number; master?: true; masterFrom?: string }
/* the master mark as a row keeps it — the mark, and its day where it has one */
const masterOf = (x: { master?: true; masterFrom?: string }) => (x.master ? { master: true as const, ...(x.masterFrom ? { masterFrom: x.masterFrom } : {}) } : {})
/* `seat` 'FCP' | 'RCP' | 'GND' (never '' on a request made now — the card refuses it; an
   old stored one reads '' and the admin picks at approval); `cat` '' for personnel */
export interface AccessRequest { id: string; name: string; cs: string; ini: string; seat: string; cat: string; at: number; seenBy: string[] }

/* the intent commands (perms.ts COMMAND_OPS decides who may run each) */
export const ACCOUNT_TYPES = ['access.request', 'access.decline', 'access.approve', 'account.add', 'account.update', 'guestview.set',
  /* [ACCOUNTS-NEW-PERSON]: a person alone, a person and his account, approving with a new
     person, and the admins' bell's "seen" */
  'person.add', 'account.addNew', 'access.approveNew', 'access.seen',
  /* [POST-OUT-OUTCOMES]: a delete — his account and his person (D287, D290; state/person-delete.ts); he's back —
     Restore (leavewar/sync.ts restoreBody); a posting write, or its Undo, that takes back what the posting made (sync.ts
     takeBack, and restoreBody's undo mode — the posting command since [DRAFT-PENDING]); the posting pass on its date
     (sync.ts runPoOutcomes — a reconciler) */
  'person.delete', 'person.restore', 'lw.postout', 'lw.postoutRun',
  /* [ONE-DOOR]: Archive on Admin → Users (leavewar/sync.ts archivePerson); the man's own "welcome back" seen (D305) */
  'person.archive', 'person.backSeen',
  /* multi-squadron batch 1, step 1: the master mark set or cleared (setMaster below) — a master's alone */
  'account.master'] as const

/* ---- the seeds (demo data, D56 — wiped with everything else before the database) ----
   `us` stays Ranger (bane), as "View as" left every member test before; `ad` is Saber
   (stiff) because one person holds one account; `outlaw` and `hex` are members NOT
   posted out in the demo world. */
const SEED: readonly Account[] = Object.freeze([
  { id: 'acad', name: 'ad', role: 'admin', pid: 'stiff', on: true, master: true },   // the demo's master (step 1)
  { id: 'acus', name: 'us', role: 'main', pid: 'bane', on: true },
  { id: 'acoutlaw', name: 'outlaw', role: 'main', pid: 'casper', on: true },
  { id: 'achex', name: 'hex', role: 'main', pid: 'rocky', on: true },
  /* multi-squadron batch 1, step 4: the second demo squadron's admin (Kestrel) and member (Osprey), and a second 142
     admin (Hunter) — so a walk can sign in on each side and see both squadrons' admins told of one change */
  { id: 'acad9', name: 'ad9', role: 'admin', pid: 'kes9', on: true },
  { id: 'acus9', name: 'us9', role: 'main', pid: 'osp9', on: true },
  { id: 'acad2', name: 'ad2', role: 'admin', pid: 'prowler', on: true },
].map(a => Object.freeze(a as Account)))
/* code only — never written to a stored record (see the header) */
const SEED_PASS: Record<string, string> = { acad: 'a', acus: 'us', acad9: 'a9', acus9: 'us9', acad2: 'a2' }

/* THE SEEDS ARE THE DEMO'S ([DB-READINESS] group A, phase 5.3 — plan §3 phase 5.3). On a SHARED store (the boot
   policy's `seedDemo` false — src/bootpolicy.ts, set at every boot by state/seeds.ts) there are none: no account rows
   read as NO accounts (never the seeded list), a list with no admin who can sign in is left as it is (never the seed
   admin added — at the database step the environment's own administrator restores access), and the store's first admin
   is made at its first boot from the build's configuration (src/boot.ts bootstrapFirstAdmin). On by default. */
let SEEDS_ON = true
export function setAccountSeeds(on: boolean): void { SEEDS_ON = on; if (!ACCOUNTS_STORED) ACCOUNTS_LIST = seedAccounts() }
export let ACCOUNTS_LIST: Account[] = SEED.map(a => ({ ...a }))
/* a stored accounts record of null means the seeded list (accountsLoad) — the candidate a restore to it would leave;
   none at all on a shared store */
export const seedAccounts = (): Account[] => SEEDS_ON ? SEED.map(a => ({ ...a })) : []
export let ACCESS_REQS: AccessRequest[] = []
export let GUESTVIEW = false

export const MAX_SIGNIN = 80
export { MAX_CS, MAX_INITIALS }
export const normName = (s: any): string => String(s ?? '').trim().toLowerCase()
const isAccountRole = (r: any): r is AccountRole => r === 'admin' || r === 'main'
/* a person an account can belong to — never a placeholder, never a man DELETED ([POST-OUT-OUTCOMES], D287, D290 —
   kept underneath, invisible; Fable F13: the lock-out guard and the delete's own "last admin" check read this one body) */
const personOk = (pid: string) => !!(PEOPLE as any)[pid] && !(PEOPLE as any)[pid].special && !(PEOPLE as any)[pid].deleted

/* ---- the rows ([DB-READINESS] group A, phase 4.4) ---- */
export const ACCOUNT_PFX = 'account:'
export const REQ_PFX = 'accessreq:'
export const REQSEEN_PFX = 'reqseen:'
const isPos = (v: any): v is LinePos => !!v && typeof v === 'object' && Number.isFinite(v.at) && typeof v.lineId === 'string'
/* every stored row under a prefix, by its id (the key after the prefix) — read, never written */
function rowsOf(pfx: string): Map<string, any> {
  const m = new Map<string, any>()
  for (const k of store.keys(pfx)) m.set(k.slice(pfx.length), store.get(k, null))
  return m
}
/* whether the accounts are stored as rows yet — none means the seeded list, held in memory (see the header) */
let ACCOUNTS_STORED = false
/* an account as its row stores it */
const accountRow = (a: Account) => ({ id: a.id, name: a.name, role: a.role, pid: a.pid, on: a.on, ...(a.offBy ? { offBy: a.offBy } : {}), ...(a.seenFrom ? { seenFrom: a.seenFrom } : {}), ...(a.createdAt != null ? { createdAt: a.createdAt } : {}), ...masterOf(a) })
/* a request as its row stores it — who has seen it is not on it (reqseen rows) */
const reqRow = (r: AccessRequest) => ({ id: r.id, name: r.name, cs: r.cs, ini: r.ini, seat: r.seat, cat: r.cat, at: r.at })

/* the accounts a list of stored images would load as — the loader's own reading (dedupe, the older of two for one
   person, a deleted man's never), without the lock-out repair. `why` hears each image dropped. Pure. `person` — the
   roster a man's deleted mark is read from (the live one by default): the commit gate reads the list before a command
   over the people as they stood, and after it over the people it leaves — ONE reading for the loader and the gate (the
   second fix read, 18 Nov 26 — Astra 2, security H1: the gate compared raw rows the loader would not keep) */
export function readAccounts(images: any[], why?: (text: string) => void, person: (pid: string) => any = pid => (PEOPLE as any)[pid]): Account[] {
  const ok = images.filter(x => x && typeof x.id === 'string' && x.id && typeof x.pid === 'string' && x.pid && isAccountRole(x.role))
  /* the OLDER wins a clash (two admins adding at once — plan §3 phase 4.4): a seeded account (no createdAt) is oldest */
  ok.sort((a, b) => (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const seenId = new Set<string>(), seenName = new Set<string>(), seenPid = new Set<string>()
  const out: Account[] = []
  for (const x of ok) {
    /* an account whose person is DELETED is never loaded — the delete removes it in the same command
       ([POST-OUT-OUTCOMES], Fable F13: the invariant, stated where it is read) */
    if (person(x.pid) && person(x.pid).deleted) continue
    const name = normName(x.name)
    if (!name || name.length > MAX_SIGNIN || seenId.has(x.id)) continue
    if (seenName.has(name) || seenPid.has(x.pid)) { if (why) why(`accounts: ${x.id} (${name}) is dropped — an older account already has ${seenPid.has(x.pid) ? 'its person' : 'its sign-in name'}`); continue }
    seenId.add(x.id); seenName.add(name); seenPid.add(x.pid)
    out.push({
      id: x.id, name, role: x.role, pid: x.pid, on: x.on !== false,
      ...(x.on === false && x.offBy === 'po' ? { offBy: 'po' as const } : {}),
      ...(isPos(x.seenFrom) ? { seenFrom: { at: +x.seenFrom.at, lineId: x.seenFrom.lineId } } : {}),
      ...(Number.isFinite(x.createdAt) ? { createdAt: +x.createdAt } : {}),
      ...(x.master === true ? masterOf({ master: true, ...(validIso(x.masterFrom) ? { masterFrom: String(x.masterFrom) } : {}) }) : {}),
    })
  }
  return out
}

/* ---- load (a settings loader: runs at boot and inside every settings rollback, so it
   NEVER writes — no rows means the in-memory seeded list) ---- */
export function accountsLoad(): void {
  const stored = rowsOf(ACCOUNT_PFX)
  ACCOUNTS_STORED = stored.size > 0
  if (!ACCOUNTS_STORED) ACCOUNTS_LIST = seedAccounts()
  else {
    const out = readAccounts([...stored.values()], text => console.warn(text))
    /* THE WAY BACK FROM A LOCK-OUT (Fable R2-6, Astra R3-4): a stored list with no admin
       who can sign in gets the seed admin ADDED, keeping every real account — and the
       seed admin WINS any collision (an entry holding its id, its sign-in name `ad` or
       its person), or the fallback could still end with no admin. At the database step
       there are no seeds: the environment's own administrator restores access. */
    let fixed = out
    if (SEEDS_ON && !out.some(a => isAdminAccount(a) && a.on && personOk(a.pid))) {
      const s = SEED[0]
      fixed = out.filter(a => a.id !== s.id && a.name !== s.name && a.pid !== s.pid)
      fixed.push({ ...s })
    }
    ACCOUNTS_LIST = fixed
  }
  /* the requests — one row each, oldest first — and who has had each on screen (each admin's own reqseen row) */
  const seenByReq = new Map<string, string[]>()
  for (const [acct, v] of rowsOf(REQSEEN_PFX)) {
    const ids = v && Array.isArray(v.seenRequestIds) ? v.seenRequestIds : []
    for (const id of ids) if (typeof id === 'string') seenByReq.set(id, [...(seenByReq.get(id) || []), acct])
  }
  const rq = [...rowsOf(REQ_PFX).values()].filter(x => x && typeof x === 'object')
    .sort((a: any, b: any) => (Number(a.at) || 0) - (Number(b.at) || 0) || (String(a.id) < String(b.id) ? -1 : 1))
  const reqs: AccessRequest[] = []
  const seenReq = new Set<string>()
  for (const x of rq) {
    const name = normName(x && x.name)
    /* a request under a name that already has an account is answered, whatever wrote it —
       dropped here in memory (the load never writes) so it is never listed or counted */
    if (!x || typeof x.id !== 'string' || !name || seenReq.has(name) || accountByName(name)) continue
    seenReq.add(name)
    /* read defensively (the load never writes): an unknown seat or a CAT that seat cannot
       hold reads '' (the admin picks at approval); the slicing is only for records written
       by an older build — every writer REFUSES an over-long value instead (D226) */
    const seat = SEATS.some(v => v.v === x.seat) ? String(x.seat) : ''
    // eslint-disable-next-line react-doctor/js-set-map-lookups -- a seat's CATs are a handful (six at most), asked once a request at load: a Set would cost more than the scan it saves
    const cat = seat && seat !== 'GND' && catsFor(seat).includes(x.cat) ? String(x.cat) : ''
    reqs.push({
      id: x.id, name, cs: String(x.cs ?? '').slice(0, MAX_CS), ini: String(x.ini ?? '').toUpperCase().slice(0, MAX_INITIALS),
      seat, cat, at: Number(x.at) || 0,
      seenBy: seenByReq.get(x.id) || [],
    })
  }
  ACCESS_REQS = reqs
  GUESTVIEW = store.get('guestview', null) === true
}

/* ---- reads ---- */
export const accountByName = (name: any): Account | undefined => ACCOUNTS_LIST.find(a => a.name === normName(name))
export const accountById = (id: any): Account | undefined => ACCOUNTS_LIST.find(a => a.id === id)
export const accountOfPid = (pid: any): Account | undefined => ACCOUNTS_LIST.find(a => a.pid === pid)
export const requestByName = (name: any): AccessRequest | undefined => ACCESS_REQS.find(r => r.name === normName(name))
export const waitingCount = (): number => ACCESS_REQS.length
/* what he gave, in one line — "JKB · Pilot · CAT C" / "BC · Personnel" — Admin → Users reads this one body (a blank
   part drops out); the waiting screen shows the same parts as the pass's fields since D1656 (ui/AccessScreen.tsx) */
export function requestSummary(r: AccessRequest): string {
  const seat = r.seat === 'GND' ? 'Personnel' : seatLabel(r.seat)
  return [r.ini, seat, r.cat && `CAT ${r.cat}`].filter(Boolean).join(' · ')
}
/* the callsign an account belongs to, read LIVE (a rename moves nothing) */
export function accountCallsign(a: Account | undefined): string {
  const p = a && (PEOPLE as any)[a.pid]
  return p ? String(p.cs) : ''
}
/* the people an account can be linked to: on the roster, not archived, not the ALL /
   ALL AVAIL placeholders, and without an account (`keep` is the one already linked — kept
   even when he has since been ARCHIVED: posting out keeps his account, and the editor's
   picker must show who it belongs to, not a blank "Pick…" over a hidden value — Astra's
   fix check #2; pidProblem already lets an account keep its archived person) */
export function linkablePeople(keep?: string): string[] {
  return Object.keys(PEOPLE).filter(id => {
    const p = (PEOPLE as any)[id]
    return p && !p.special && (id === keep || (!p.archived && !accountOfPid(id)))
  }).sort((a, b) => String((PEOPLE as any)[a].cs).localeCompare(String((PEOPLE as any)[b].cs)))
}
export const isAdminAccount = (a: Account | undefined) => !!a && a.role === 'admin'
/* THE MASTER MARK (multi-squadron batch 1, step 1 — D2191): a master is an admin of every unit and the only one who
   makes a unit or another master. The mark lives on the account row (the database's User.master) and changes only by
   its own command, setMaster below — the commit gate (perms.ts unitRowViolation) refuses a change of it in any other. */
export const isMasterAccount = (id: any): boolean => !!accountById(id)?.master
/* an account's level in a unit on a date — its own role in its home unit, its grant elsewhere, admin everywhere for a
   master, otherwise null (state/units-model.ts levelFrom — the one answer) */
export const levelIn = (accountId: any, unit: string, iso: string = todayIso()): UnitLevel | null => levelOfAccount(accountById(accountId), unit, iso)
const canSignInAsAdmin = (a: Account) => isAdminAccount(a) && a.on && personOk(a.pid)

/* NEVER A SQUADRON LEFT WITH NO ADMIN OF ITS OWN (D2184 Q10 — "and so is any later step that would cause it, such as
   removing another admin"; the full check's reads, 18 Nov 26: the lock counted every squadron's admins as one, so 142's
   admin could switch 149's only admin off). `list` — the accounts a step would leave; a squadron that has an admin at
   home there who can sign in now must still have one after. An admin of it by a grant or the master mark is not
   counted — he is not ITS admin (the agent's reading, put to him). The whole app's lock first, as before. `ok` — whether
   a man is on the roster, for a restore asking over the roster it would leave. */
function lockProblem(list: readonly any[], ok: (pid: string) => boolean = personOk): string | null {
  const able = (x: any) => isAdminAccount(x) && x.on !== false && ok(x.pid)
  if (!list.some(able)) return ADMIN_LOCK
  for (const u of units()) {
    const has = (l: readonly any[]) => l.some(x => able(x) && homeOn(x.pid) === u.id)
    if (!has(ACCOUNTS_LIST) || has(list)) continue
    const gone = ACCOUNTS_LIST.find(x => able(x) && homeOn(x.pid) === u.id && !list.some(y => y.id === x.id && able(y)))
    const cs = gone ? accountCallsign(gone) : ''
    return cs ? `${cs} is ${u.num}'s last admin. Make another admin of ${u.num} first.` : `At least one admin of ${u.num} must keep access`
  }
  return null
}
/* A MAN OF ANOTHER SQUADRON'S ACCOUNT (D2191 — a man of the other squadron is given View on Admin → Users, "nothing else of
   his row changeable"; the full check's reads, 18 Nov 26): the signed-in admin changes an account only as an admin of
   the man's own squadron — his home's admin role, an admin grant there, or the master mark. The commit gate holds the
   same (perms.ts homeUnitViolation), whatever door wrote the row; this says it in words first. */
function otherSquadronProblem(pid: string): string | null {
  const mine = SESSION ? accountById(SESSION.user) : undefined
  const u = homeOn(pid)
  if (!mine || !u) return null
  if (levelOfAccount({ id: mine.id, pid: mine.pid, role: 'admin', master: !!mine.master }, u) === 'admin') return null
  const num = unitById(u)?.num ?? u
  /* two sentences, as the last-admin lock's words beside it: a dash does not join two thoughts (the guide's §1b) */
  return `He is ${num}'s. Only an admin of ${num} can change his account.`
}
/* the same door for the PERSON — Archive, Restore and a Quals edit on Admin → Users: an admin of one squadron acting on
   another squadron's man is told whose he is, as Suspend and Delete tell him, never the commit gate's own words, "You can
   only edit your own row" or "That did not save" (the fix read of multi-squadron batch 1's full check, 18 Nov 26 — Opus
   4). An admin's question only: a member stays "your own row only", which is his rule. */
export function otherSquadronPersonProblem(pid: string): string | null {
  const mine = SESSION ? accountById(SESSION.user) : undefined
  /* an admin is the role IN FORCE, as the commit gate reads it — the developer bridge's raised role included (the second
     fix read, 18 Nov 26 — Astra 7: a member raised to admin heard "You can only edit your own row"); the account's own
     identity, home and master mark still decide where he is an admin */
  if (!mine || roleOf() !== 'admin') return null
  const u = homeOn(pid)
  if (!u) return null
  if (levelOfAccount({ id: mine.id, pid: mine.pid, role: 'admin', master: !!mine.master }, u) === 'admin') return null
  const num = unitById(u)?.num ?? u
  return `He is ${num}'s. Only an admin of ${num} can change him.`
}

/* ---- SIGNING IN: what the sign-in card turns into (D204) ---- */
export type SignIn =
  | { kind: 'bad' }
  | { kind: 'ok'; account: Account }
  | { kind: 'off'; name: string }
  | { kind: 'new'; name: string }
  | { kind: 'waiting'; name: string }
  | { kind: 'guest'; name: string }
export function signIn(nameIn: any, pass: any): SignIn {
  const name = normName(nameIn)
  if (!name || name.length > MAX_SIGNIN || typeof pass !== 'string' || !pass) return { kind: 'bad' }
  const a = accountByName(name)
  if (a) {
    if (SEED_PASS[a.id] != null && SEED_PASS[a.id] !== pass) return { kind: 'bad' }
    if (!a.on) return { kind: 'off', name }
    return { kind: 'ok', account: a }
  }
  if (requestByName(name)) return GUESTVIEW ? { kind: 'guest', name } : { kind: 'waiting', name }
  return { kind: 'new', name }
}
/* D221 (26 Sep 26): a person on the waiting screen goes straight into the guest view when the
   admin's guest switch is on — the same answer a fresh sign-in would give him (signIn → 'guest'),
   so no sign-out and in. Null when the switch is off or he is not a person waiting. */
export function guestEntry(): SignIn | null {
  if (roleOf() !== 'pending' || !GUESTVIEW) return null
  const name = normName(SESSION && SESSION.name)
  return name && requestByName(name) ? { kind: 'guest', name } : null
}
/* the session a sign-in result starts (state/store.ts resetSession is the one writer) */
export function sessionFor(r: SignIn): any {
  switch (r.kind) {
    /* `acct` — the ACCOUNT's role, kept apart from `role` (the role in force): an admin may switch himself to the
       member view and back (D292, 27 Sep 26), and `acct` is what says the way back exists — never changed by the
       switch, so a member can never climb (state/perms.ts mayViewAsMember) */
    case 'ok': return { user: r.account.id, role: r.account.role, pid: r.account.pid, name: r.account.name, acct: r.account.role }
    case 'off': return { user: `principal:${r.name}`, role: 'off', pid: null, name: r.name }
    case 'guest': return { user: `principal:${r.name}`, role: 'guest', pid: null, name: r.name }
    case 'new': case 'waiting': return { user: `principal:${r.name}`, role: 'pending', pid: null, name: r.name }
    default: return null
  }
}

/* ---- WRITES — each one intent command; a string back is the refusal, said on screen ---- */
function commitIntent(type: typeof ACCOUNT_TYPES[number], meta: any, fn: () => void): string | null {
  /* never the command layer's own words on screen — they name records, not people; a
     refusal raised inside (CmdRefused) keeps its own reason (roster-add.ts saidOf) */
  return saidOf(commitSettingsIntent(type, meta, fn))
}
/* a write stores EXACTLY the rows this command's list edit changed — the list before it against the list after (plan
   §2.2: never inferred from storage, so a stale client never removes what it has not read); the very first write on a
   store still holding the seeded list stores every account it leaves, so no seeded account is lost */
function writeAccounts(next: Account[]) {
  const before = new Map(ACCOUNTS_LIST.map(a => [a.id, JSON.stringify(accountRow(a))]))
  for (const a of next) {
    const row = accountRow(a)
    if (!ACCOUNTS_STORED || before.get(a.id) !== JSON.stringify(row)) store.set(ACCOUNT_PFX + a.id, row)
  }
  /* a dropped account's row is removed — but on the very first write none is stored, and the list stored simply leaves
     it out (the loader reads the stored rows alone once there are any). Writing "nothing" over a row never stored made a
     change with no before, which the commit gate refuses from the posting pass (perms.ts postingPassViolation): a Delete
     posting due on a store that had never written its accounts was refused, and only passed on the pass's own retry
     (the fix read of multi-squadron batch 1's full check, 18 Nov 26 — found when Opus 1's loop break ended that retry) */
  const kept = new Set(next.map(a => a.id))
  if (ACCOUNTS_STORED) for (const id of before.keys()) if (!kept.has(id)) store.set(ACCOUNT_PFX + id, null)
  ACCOUNTS_STORED = true
  ACCOUNTS_LIST = next
}
function writeReqs(next: AccessRequest[]) {
  const before = new Map(ACCESS_REQS.map(r => [r.id, JSON.stringify(reqRow(r))]))
  for (const r of next) { const row = reqRow(r); if (before.get(r.id) !== JSON.stringify(row)) store.set(REQ_PFX + r.id, row) }
  const kept = new Set(next.map(r => r.id))
  for (const id of before.keys()) if (!kept.has(id)) store.set(REQ_PFX + id, null)
  ACCESS_REQS = next
}
function newAccountId(): string { return 'ac' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }
/* a new account's own fields: where the history stands now (seenFrom) and when it was made (createdAt) */
const newAccountStamp = () => ({ seenFrom: elogNow(), createdAt: Date.now() })

/* the problems with linking `pid` / naming `name` for account `selfId` (or a new one) */
function nameProblem(name: string, selfId?: string): string | null {
  if (!name) return 'Type the sign-in name (the defence mail address)'
  if (name.length > MAX_SIGNIN) return `A sign-in name is at most ${MAX_SIGNIN} characters`
  const other = accountByName(name)
  if (other && other.id !== selfId) return `${name} already has an account`
  return null
}
function pidProblem(pid: string, selfId?: string): string | null {
  const p = (PEOPLE as any)[pid]
  if (!p || p.special) return 'Pick the callsign or name this account belongs to'
  const other = accountOfPid(pid)
  if (other && other.id !== selfId) return `${p.cs} already has an account (${other.name})`
  /* [ONE-DOOR] (D310): Restore lives on Admin → Users now (round 1, Fable F6 — the screen's own words follow the door) */
  if (p.archived && !(selfId && accountById(selfId)?.pid === pid)) return `${p.cs} is archived — restore him on Admin → Users first`
  return null
}
const ADMIN_LOCK = 'At least one admin must keep access'
const ownAccount = (a: Account) => (SESSION && SESSION.user === a.id) || (me() != null && a.pid === me())

/* the admin adds an account (D166 (1)); a request waiting under that name is answered */
export function addAccount(nameIn: any, pid: string, role: AccountRole): string | null {
  if (!mayManageAccounts()) return 'Only an admin can add an account'
  const name = normName(nameIn)
  const bad = nameProblem(name) || pidProblem(pid) || otherSquadronProblem(pid) || (isAccountRole(role) ? null : 'Pick member or admin')
  if (bad) return bad
  return commitIntent('account.add', null, () => {
    writeAccounts([...ACCOUNTS_LIST, { id: newAccountId(), name, role, pid, on: true, ...newAccountStamp() }])
    if (requestByName(name)) writeReqs(ACCESS_REQS.filter(r => r.name !== name))
  })
}

/* the admin changes an account: its sign-in name, role, puck, or switches it off / on */
export function updateAccount(id: string, patch: { name?: any; role?: AccountRole; pid?: string; on?: boolean }): string | null {
  if (!mayManageAccounts()) return 'Only an admin can change an account'
  const a = accountById(id)
  if (!a) return 'That account is gone'
  if (ownAccount(a)) return "You can't change your own account — ask another admin"
  /* a master's account is a master's alone (D2205) — said before the other squadron's words, as a master's delete is */
  const masterOnly = masterChangeProblem(a.pid) || (patch.pid !== undefined ? masterChangeProblem(patch.pid) : null)
  if (masterOnly) return masterOnly
  const other = otherSquadronProblem(a.pid) || (patch.pid !== undefined ? otherSquadronProblem(patch.pid) : null)
  if (other) return other
  const next: Account = { ...a }
  if (patch.name !== undefined) { const n = normName(patch.name); const bad = nameProblem(n, a.id); if (bad) return bad; next.name = n }
  if (patch.pid !== undefined) { const bad = pidProblem(patch.pid, a.id); if (bad) return bad; next.pid = patch.pid }
  if (patch.role !== undefined) { if (!isAccountRole(patch.role)) return 'Pick member or admin'; next.role = patch.role }
  /* [ONE-DOOR] (D322 — "no Enable on an archived row"): an archived man is never let sign in while archived — Restore
     brings his sign-in back with him (the write path refuses what the screen no longer offers) */
  if (patch.on === true && !a.on) {
    const p = (PEOPLE as any)[a.pid]
    if (p && p.archived && !p.deleted) return `${p.cs} is archived — restore him on Admin → Users`
  }
  if (patch.on !== undefined) { next.on = !!patch.on; delete next.offBy }   // a hand Suspend / Enable is the admin's own
  const list = ACCOUNTS_LIST.map(x => x.id === a.id ? next : x)
  const locked = lockProblem(list)
  if (locked) return locked
  /* a sign-in name taken by a rename answers a request waiting under it, as adding an
     account does (Fable's scenario read, 26 Sep 26: the request stayed listed, could never
     be approved — "already has an account" — and kept the Admin tab's count up) */
  const answered = next.name !== a.name && !!requestByName(next.name)
  return commitIntent('account.update', null, () => {
    writeAccounts(list)
    if (answered) writeReqs(ACCESS_REQS.filter(r => r.name !== next.name))
  })
}

/* THE MASTER MARK SET OR CLEARED (multi-squadron batch 1, step 1 — D2191, "only a master admin makes another"): by a
   master only, never on his own account, and never leaving no master. The same three are held at the commit gate
   (perms.ts unitRowViolation), so no other door — a forged command, an Undo — can do what this one refuses. */
export function setMaster(id: string, on: boolean): { ok: boolean; message?: string } {
  const a = accountById(id)
  if (!SESSION || !mayManageAccounts() || !isMasterAccount(SESSION.user)) return { ok: false, message: 'Only a master admin can do that' }
  if (!a) return { ok: false, message: 'That account is gone' }
  if (ownAccount(a)) return { ok: false, message: "You can't change your own account — ask another master admin" }
  if (!!a.master === on) return { ok: false, message: on ? 'He is a master admin already' : 'He is not a master admin' }
  const next: Account = { ...a }
  /* (its day with it — fault P: a line his move retired stays retired however the mark comes later) */
  if (on) { next.master = true; next.masterFrom = todayIso() } else { delete next.master; delete next.masterFrom }
  const list = ACCOUNTS_LIST.map(x => (x.id === a.id ? next : x))
  if (!list.some(x => x.master)) return { ok: false, message: 'At least one master admin must be left' }
  const bad = commitIntent('account.master', null, () => writeAccounts(list))
  return bad ? { ok: false, message: bad } : { ok: true }
}

/* the admin approves a request: the account AND the request cleared, one command */
export function approveRequest(reqId: string, pid: string, role: AccountRole): string | null {
  if (!mayManageAccounts()) return 'Only an admin can approve a request'
  const rq = ACCESS_REQS.find(r => r.id === reqId)
  if (!rq) return 'That request is gone'
  const bad = nameProblem(rq.name) || pidProblem(pid) || otherSquadronProblem(pid) || (isAccountRole(role) ? null : 'Pick member or admin')
  if (bad) return bad
  /* linked to a man already on the roster, he keeps the squadron he has — no home is written here: a new home row moved
     the man linked into the approving admin's squadron from today (the full check, 18 Nov 26). A NEW man's home is
     written by approveRequestNew below, where it belongs. */
  return commitIntent('access.approve', null, () => {
    writeAccounts([...ACCOUNTS_LIST, { id: newAccountId(), name: rq.name, role, pid, on: true, ...newAccountStamp() }])
    writeReqs(ACCESS_REQS.filter(r => r.id !== reqId))
  })
}
export function declineRequest(reqId: string): string | null {
  if (!mayManageAccounts()) return 'Only an admin can decline a request'
  if (!ACCESS_REQS.some(r => r.id === reqId)) return 'That request is gone'
  return commitIntent('access.decline', null, () => writeReqs(ACCESS_REQS.filter(r => r.id !== reqId)))
}
export function setGuestView(on: boolean): string | null {
  if (!mayManageAccounts()) return 'Only an admin can change this'
  return commitIntent('guestview.set', null, () => { store.set('guestview', on ? true : null); GUESTVIEW = !!on })
}

/* a person signed in but on no list asks for access (D204) — ONCE, as himself: the
   sign-in name comes from the session, never from a typed box. He gives what the admin's
   New person form asks ([ACCOUNTS-NEW-PERSON], D214): the displayed callsign/name (D222),
   initials (asked, never required — D225), pilot / WSO / personnel (D220), CAT — refused
   with its reason when a pick is missing or the name is over 14 letters (D226). Never
   whether a callsign is taken: a person not yet let in may not read the roster. */
export function requestAccess(npIn: NewPerson): string | null {
  if (!mayRequestAccess()) return 'You cannot ask for access from here'
  const name = normName(SESSION && SESSION.name)
  if (!name) return 'Sign in first'
  if (accountByName(name)) return 'This sign-in already has an account — sign out and in again'
  if (requestByName(name)) return 'You have already asked — an admin will answer it'
  const bad = newPersonProblem(npIn, { roster: false })
  if (bad) return bad
  const np = tidyPerson(npIn)
  return commitIntent('access.request', { owner: name }, () =>
    writeReqs([...ACCESS_REQS, {
      id: 'rq' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name,
      cs: np.cs, ini: np.ini, seat: np.seat, cat: np.cat, at: Date.now(), seenBy: [],
    }]))
}

/* ---- A DELETE TAKES HIS ACCOUNT ([POST-OUT-OUTCOMES], D280, D285, D287) ----
   "Delete account" — for a man who leaves flying for good, his account AND his person go (D287; the person is kept
   underneath as a hidden mark, D290 — state/person-delete.ts). These two are the account half, read and written by that
   one command. `deleteAccountProblem` — the refusals, in the app's words: not his own account (an admin never changes
   his own — the D166 guard), and never the last admin who can sign in (ADMIN_LOCK — the same body the lock-out guard
   reads). `dropAccountOfPid` — the mutation alone, INSIDE the delete's command (it enlists the settings store): his
   account removed, and a request waiting under his sign-in name answered with it. */
export function deleteAccountProblem(pid: string): string | null {
  /* a master's sentence FIRST, whoever asks — another squadron's admin, his own squadron's, the master himself: it is the
     reason that holds whatever else changes (the second fix read, 18 Nov 26 — Astra 6: Kestrel heard "He is 142's…",
     Saber "your own account", before it) */
  const master = masterDeleteProblem(pid)
  if (master) return master
  const a = accountOfPid(pid)
  if (a && ownAccount(a)) return "You can't delete your own account — ask another admin"
  if (me() != null && pid === me()) return "You can't delete yourself — ask another admin"
  const other = otherSquadronProblem(pid)
  if (other) return other
  return lockProblem(ACCOUNTS_LIST.filter(x => x.pid !== pid))
}
/* THE POSTING'S SUSPENSION ([POST-OUT-OUTCOMES], D280): the overseas outcome suspends his account on the date — never
   the last admin who can sign in ('lock': the pass skips it and says so); 'none' when there is no account or it is
   already suspended. Mutations only — INSIDE the posting pass's command (it enlisted the settings store). */
export function suspendForPosting(pid: string): 'done' | 'none' | 'lock' {
  const a = accountOfPid(pid)
  if (!a || !a.on) return 'none'
  const list = ACCOUNTS_LIST.map(x => (x.id === a.id ? { ...x, on: false, offBy: 'po' as const } : x))
  if (postingLock(list)) return 'lock'
  writeAccounts(list)
  return 'done'
}
/* THE POSTING'S LAST-ADMIN LOCK, ON EVERY DATE (fix read 3, Astra's 1 — D2184 Q10, D306): the posting pass is the app
   acting, which the commit gate's own check (perms.ts lastAdminViolation, G3) used to pass over, and its preflight read
   today alone and counted an ARCHIVED admin as one who can sign in — so an Overseas Sqn posting of 149's admin ran the
   day before another 149 admin's saved move to 142, leaving 149 with none from the move on; and an archived admin (who
   cannot sign in) was counted as the one left. The same calculation as the gate's now: `list` — the accounts the step
   would leave; a squadron that has an admin at home on a date who can sign in (an account on, a man on the roster —
   never deleted, a placeholder or ARCHIVED) must still have one after, on today and on every saved home row's date from
   today on. The archived man's account itself stays as it is, loadable for his Restore — only "can sign in" leaves him
   out. 'app' for the whole app's last admin; else the squadron (and its date) left without one; null when none is. */
const canSignIn = (pid: string): boolean => personOk(pid) && !(PEOPLE as any)[pid].archived
function postingLock(list: readonly any[]): 'app' | { unit: string; date: string } | null {
  const able = (x: any) => isAdminAccount(x) && x.on !== false && canSignIn(x.pid)
  if (!list.some(able)) return 'app'
  const today = todayIso()
  const dates = new Set<string>([today])
  for (const h of unitRows().homes) if (typeof h.from === 'string' && h.from > today) dates.add(h.from)
  for (const d of [...dates].sort()) {
    for (const u of units()) {
      const has = (l: readonly any[]) => l.some(x => able(x) && homeOn(x.pid, d) === u.id)
      if (has(ACCOUNTS_LIST) && !has(list)) return { unit: u.id, date: d }
    }
  }
  return null
}
/* he is back (Restore, Undo post out) or the posting no longer suspends him today: enable the account the POSTING
   suspended — never one suspended by hand. True when it was enabled. */
export function enableAfterPosting(pid: string): boolean {
  const a = accountOfPid(pid)
  if (!a || a.on || a.offBy !== 'po') return false
  writeAccounts(ACCOUNTS_LIST.map(x => (x.id === a.id ? { id: x.id, name: x.name, role: x.role, pid: x.pid, on: true, ...(x.seenFrom ? { seenFrom: x.seenFrom } : {}), ...(x.createdAt != null ? { createdAt: x.createdAt } : {}), ...masterOf(x) } : x)))
  return true
}
/* [ONE-DOOR] (owner D310, D322, 27 Sep 26): ARCHIVE suspends his sign-in — as a hand suspension (no mark: Restore
   enables whatever suspended it, D322 — round 1, Fable F10); 'lock' when it would leave no admin able to sign in (the
   Archive is then refused whole, before anything is written — D306's rule). RESTORE enables it, whatever suspended it.
   Mutations only — INSIDE the Archive / Restore command (it enlisted the settings store). */
export function suspendForArchive(pid: string): 'done' | 'none' | 'lock' {
  const a = accountOfPid(pid)
  if (!a || !a.on) return 'none'
  const list = ACCOUNTS_LIST.map(x => (x.id === a.id ? { id: x.id, name: x.name, role: x.role, pid: x.pid, on: false, ...(x.seenFrom ? { seenFrom: x.seenFrom } : {}), ...(x.createdAt != null ? { createdAt: x.createdAt } : {}), ...masterOf(x) } : x))
  if (lockProblem(list)) return 'lock'
  writeAccounts(list)
  return 'done'
}
export function enableForRestore(pid: string): boolean {
  const a = accountOfPid(pid)
  if (!a || a.on) return false
  writeAccounts(ACCOUNTS_LIST.map(x => (x.id === a.id ? { id: x.id, name: x.name, role: x.role, pid: x.pid, on: true, ...(x.seenFrom ? { seenFrom: x.seenFrom } : {}), ...(x.createdAt != null ? { createdAt: x.createdAt } : {}), ...masterOf(x) } : x)))
  return true
}
/* HIS WELCOME NOTE SEEN ([ONE-DOOR], D305): the signed-in man clears his OWN `back` — the `person.backSeen` command,
   own row required (perms.ts; ownershipViolation lets a member change only his own Person). Nothing when there is
   nothing to clear. */
export function markBackSeen(): string | null {
  const id = me()
  const p = id != null ? (PEOPLE as any)[id] : null
  if (!p || !p.back) return null
  return saidOf(commitPeopleIntent('person.backSeen', { owner: id }, () => { delete (PEOPLE as any)[id!].back }))
}
/* A SESSION THAT HAS LAPSED ([ONE-DOOR] round 1 — Fable F8 / Astra 4, the agent's call on the look card): the signed-in
   account is suspended, or its person archived or deleted, since he signed in (a posting's date came, an admin acted in
   another session at the database step). The App then turns the session off (the "Your access is suspended" screen)
   on its next repaint, so no write of his goes through. A session with no account behind it (the localhost probe
   bridge, a headless test) never lapses. */
export function sessionLapsed(): boolean { return sessionNow() !== undefined }
/* WHAT THE SIGNED-IN SESSION SHOULD NOW BE — undefined when it stands. Turned OFF when his account is suspended, his
   person archived or deleted — or, for a session made from an ACCOUNT (it carries `acct`), when that account is gone
   (deleted by another admin, or by a Delete posting on its date — the final code read, Astra 1, 27 Sep 26: this said
   "fine" for a missing account). Made AGAIN from the account as it now stands when another admin changed its role or
   the person it belongs to (Astra 1: a demoted admin kept his admin session) — he stays signed in, with what his account
   now gives. The admin's own member view (D292) is not a change: `acct` is still the account's role. A session with
   no `acct` (the localhost probe bridge, a headless test) has no account to lose and never lapses on that count. */
export function sessionNow(): any {
  const r = SESSION && SESSION.role
  if (r !== 'admin' && r !== 'main' && r !== 'member') return undefined
  const off = () => sessionFor({ kind: 'off', name: String(SESSION.name || '') } as any)
  const a = accountById(SESSION.user)
  if (!a) return SESSION.acct ? off() : undefined
  const p = (PEOPLE as any)[a.pid]
  if (!a.on || !p || p.archived || p.deleted) return off()
  if (SESSION.acct && (a.role !== SESSION.acct || a.pid !== SESSION.pid)) return sessionFor({ kind: 'ok', account: a } as any)
  return undefined
}
export const accountSuspendedByPosting = (pid: string): boolean => { const a = accountOfPid(pid); return !!a && !a.on && a.offBy === 'po' }
/* would removing or suspending this person's account leave no admin who can sign in? (the posting pass's own check —
   it is not a person acting, so "yourself" never applies there) */
export function lastAdminIfGone(pid: string): string | null {
  const lock = postingLock(ACCOUNTS_LIST.filter(x => x.pid !== pid))
  if (!lock) return null
  if (lock === 'app') return ADMIN_LOCK
  const num = String(unitById(lock.unit)?.num ?? lock.unit)
  const gone = accountOfPid(pid)
  const cs = gone ? accountCallsign(gone) : ''
  return cs ? `${cs} is ${num}'s last admin. Make another admin of ${num} first.` : `At least one admin of ${num} must keep access`
}
/* WHICH LOCK HOLDS HIM — for the doors that word the lock their own way (a posting that waits, Archive): the squadron
   whose last admin he is, or 'app' for the whole app's last admin who can sign in, or null. Removing one man's account
   can leave only HIS squadron without an admin of its own, so the squadron named is his (the fix read, 18 Nov 26 —
   Opus 5: those doors still said "the last admin who can sign in" while 142 had three) */
export function lastAdminLock(pid: string): { num: string } | 'app' | null {
  /* (the squadron named is the one the lock found — on a later date it can be the squadron he is at home in then: fix
     read 3, Astra's 1) */
  const lock = postingLock(ACCOUNTS_LIST.filter(x => x.pid !== pid))
  if (!lock) return null
  if (lock === 'app') return 'app'
  return { num: String(unitById(lock.unit)?.num ?? lock.unit) }
}
/* THE LOCK FOR A MOVE OF SQUADRON (the second fix read — Astra 1, security H3: the master moving Kestrel, 149's only
   admin, to 142 from tomorrow left 149 with none): his squadron's last admin who can sign in on the day the move counts
   from is told so in the lock's own words (lockProblem's per-squadron sentence); the commit gate holds every date
   (perms.ts lastAdminViolation, G3). null when the move leaves his squadron an admin. */
export function homeMoveLockWords(pid: string, unit: string, iso: string): string | null {
  const a = accountOfPid(pid)
  if (!a || !isAdminAccount(a) || !a.on || !personOk(pid)) return null
  if (ACCOUNTS_LIST.some(x => x.pid !== pid && isAdminAccount(x) && x.on && personOk(x.pid) && homeOn(x.pid, iso) === unit)) return null
  const num = String(unitById(unit)?.num ?? unit)
  return `${(PEOPLE as any)[pid].cs} is ${num}'s last admin. Make another admin of ${num} first.`
}
/* A MASTER IS NEVER DELETED (the fix read, 18 Nov 26 — Opus 1): the master mark changes only by its own command (D2191;
   perms.ts unitRowViolation), so a delete that takes a master's account away is refused at the commit gate whatever
   door made it. Said first, in words, by every delete door — Admin → Users and a posting's Delete — so a posting's Delete
   for him waits on its date (it used to be refused whole there, holding every other posting of that day back). */
export function masterDeleteProblem(pid: string): string | null {
  const a = accountOfPid(pid)
  return a && a.master ? `${accountCallsign(a)} is a master admin, so he can't be deleted` : null
}
/* ONLY A MASTER ADMIN CHANGES A MASTER ADMIN'S ACCOUNT (his D2205, 18 Nov 26 — the second fix read's security H4: a plain
   admin could suspend, demote, rename or archive Saber). Said first by the doors that change his account or what makes
   it — Suspend / Enable, role and sign-in name, his callsign, Archive, Restore — in the words the master mark's own door
   already says; the commit gate holds the same for every door (perms.ts accountShapeAndMasterViolation, G1). The rest of
   his Quals row stays any admin of his squadron's (D218). No session or a master signed in: nothing to say. */
export function masterChangeProblem(pid: string): string | null {
  const a = accountOfPid(pid)
  if (!a || !a.master) return null
  const mine = SESSION ? accountById(SESSION.user) : undefined
  return mine && mine.master ? null : MASTER_ONLY_WORDS
}
export const MASTER_ONLY_WORDS = 'Only a master admin can do that'
export function dropAccountOfPid(pid: string): void {
  const a = accountOfPid(pid)
  if (!a) return
  writeAccounts(ACCOUNTS_LIST.filter(x => x.id !== a.id))
  if (requestByName(a.name)) writeReqs(ACCESS_REQS.filter(r => r.name !== a.name))
  /* his own bell's row goes with his account (AccessRequestSeen, removed with its User — R3-04) */
  if (store.get(REQSEEN_PFX + a.id, null) != null) store.set(REQSEEN_PFX + a.id, null)
}

/* ---- WHAT THE ACCOUNTS AND REQUESTS WOULD BE AFTER A RESTORE ([DB-READINESS] group A, phase 4.4) ----
   A step that touched accounts holds one change per ROW it wrote (`settings/account:<id>`, `settings/accessreq:<id>`).
   The candidate a restore would leave is what is stored now with those rows put back or removed — read the way the
   loader reads it (readAccounts), and, when it would leave NO account row at all, the seeded list, as the loader does.
   Null when the changes touch none of them. Read by the Undo's rules (roster-restore.ts), its words (undo/describe.ts)
   and the delete's guard (person-delete.ts) — one body, so the three can never read a candidate differently. */
const rowChanges = (changes: readonly any[] | null | undefined, pfx: string) =>
  (changes || []).filter(ch => ch && ch.collection === 'settings' && typeof ch.id === 'string' && ch.id.startsWith(pfx))
export function accountsAfter(changes: readonly any[] | null | undefined): any[] | null {
  const mine = rowChanges(changes, ACCOUNT_PFX)
  if (!mine.length) return null
  const rows = rowsOf(ACCOUNT_PFX)
  for (const ch of mine) { const id = ch.id.slice(ACCOUNT_PFX.length); if (ch.op === 'delete' || ch.after == null) rows.delete(id); else rows.set(id, ch.after) }
  return rows.size ? [...rows.values()] : seedAccounts()
}
export function requestsAfter(changes: readonly any[] | null | undefined): any[] | null {
  const mine = rowChanges(changes, REQ_PFX)
  if (!mine.length) return null
  const rows = rowsOf(REQ_PFX)
  for (const ch of mine) { const id = ch.id.slice(REQ_PFX.length); if (ch.op === 'delete' || ch.after == null) rows.delete(id); else rows.set(id, ch.after) }
  return [...rows.values()]
}
/* the account an account row's image names, before a step — an unsaved seeded account (no row yet) reads as the seed */
export const accountBefore = (id: string, image: any): any => image ?? (SEEDS_ON ? SEED.find(a => a.id === id) : null) ?? null

/* ---- WHAT AN UNDO OR REDO MAY PUT BACK ON THE ACCOUNTS (the change-recording re-test B5, 28 Sep 26) ----
   Once the one Undo takes settings steps ([UNDO-ROSTER-SETTINGS]), an account change taken back or redone must obey the
   SAME guards the write path does — never accountsLoad's forgiving repair, which would quietly drop a duplicate or re-add
   the seed admin and hide a lock-out until the database step (Astra's red team 2, Fable S21). Asked over the WHOLE
   candidate (the stored images the restore would write, over the roster as it would then stand — `people`), before the
   view moves and again inside the restore itself (undo/timeline.ts applyRestore). A sentence, or null.
   `next` — the accounts list the restore would leave (null: unchanged); `reqs` — the access requests it would leave. */
export function accountsRestoreProblem(next: any[] | null, reqs: any[] | null, people: Record<string, any>): string | null {
  const list: any[] = next ?? ACCOUNTS_LIST
  const ok = (pid: string) => !!people[pid] && !people[pid].special && !people[pid].deleted
  if (next) {
    const ids = new Set<string>(), names = new Set<string>(), pids = new Set<string>()
    for (const a of list) {
      if (!a || typeof a.id !== 'string') return 'That would leave an account unreadable — it can’t be undone now.'
      const nm = normName(a.name)
      if (names.has(nm)) return `That would give the sign-in name ${nm} two accounts — it can’t be undone now.`
      if (pids.has(a.pid)) return `That would give ${people[a.pid]?.cs || 'one person'} two accounts — it can’t be undone now.`
      ids.add(a.id); names.add(nm); pids.add(a.pid)
      /* an account for someone no longer on the roster (a deleted man is kept dead elsewhere — person-delete.ts) */
      if (!people[a.pid] || people[a.pid].special) return 'That account’s person is no longer on the roster — it can’t be undone now.'
      /* D322: an archived man's sign-in stays suspended — Restore brings it back with him, never Undo */
      const live = ACCOUNTS_LIST.find(x => x.id === a.id)
      const p = people[a.pid]
      if (a.on !== false && p.archived && !p.deleted && !(live && live.on)) return `${p.cs} is archived — restore him on Admin → Users first`
    }
    /* at least one admin who can sign in (ADMIN_LOCK — the write path's own guard) */
    const locked = lockProblem(list, ok)
    if (locked) return locked
    /* never the signed-in person's own account (the D166 guard — every field he would sign in with: Astra's red team 2) */
    const mine = ACCOUNTS_LIST.find(ownAccount)
    if (mine) {
      const there = list.find(a => a.id === mine.id) || list.find(a => a.pid === mine.pid)
      const same = there && normName(there.name) === mine.name && there.role === mine.role && there.pid === mine.pid && (there.on !== false) === mine.on
        && !!there.master === !!mine.master   // the master mark too (step 1): never his own, by any door
      if (!same) return "You can't change your own account — ask another admin"
    }
  }
  /* a request waiting under a name that has an account is answered — a restore never puts one back (Fable's red team 11:
     the loader would drop it in memory while the stored list kept it, record and screen disagreeing) */
  if (reqs) for (const r of reqs) {
    const nm = normName(r && r.name)
    if (nm && list.some(a => normName(a.name) === nm)) return `${nm} already has an account`
  }
  return null
}

/* ---- THE FIRST ADMIN OF A SHARED STORE ([DB-READINESS] group A, phase 5.4 — P0-BOOTSTRAP) ----
   The account row src/boot.ts writes at a shared store's first boot, beside his person and the "started" stamp, in the
   boot's one saved group: an admin, on, tied to his person, the history's start as its `seenFrom` (nothing before him
   is news to him) and its `createdAt`. The key and the stored image, exactly as every other account row. */
export function firstAdminRow(nameIn: any, pid: string, master = false): [string, any] {
  const a: Account = { id: newAccountId(), name: normName(nameIn), role: 'admin', pid, on: true, ...newAccountStamp(), ...(master ? { master: true as const } : {}) }
  return [ACCOUNT_PFX + a.id, accountRow(a)]
}
/* the stored account rows that hold a sign-in name — read straight from the store (the boot asks before the accounts
   are loaded) */
export function storedAccountNamed(nameIn: any): boolean {
  const name = normName(nameIn)
  for (const v of rowsOf(ACCOUNT_PFX).values()) if (v && normName(v.name) === name) return true
  return false
}

/* ---- A NEW PERSON WITH HIS ACCOUNT, IN ONE STEP ([ACCOUNTS-NEW-PERSON], D214, D217) ----
   Admin → Users' "New person": the person (the one add, roster-add.ts) and his account are
   ONE command over the people and settings stores — both made or neither (a refusal inside
   rolls both back and still says why). A blank sign-in makes a roster-only person (D217 —
   someone who will not use the app): the people command alone. */
/* `postIn` — his post-in date (D308, [ONE-DOOR]): written on the war in the same command (HOOKS.warPostIn) */
export function addPersonAndAccount(nameIn: any, np: NewPerson, role: AccountRole, postIn?: string): string | null {
  const name = normName(nameIn)
  if (!name) return addRosterPerson(np, postIn)
  if (!mayManageAccounts() || !mayManageRoster()) return 'Only an admin can add a person'
  const bad = nameProblem(name) || newPersonProblem(np) || (isAccountRole(role) ? null : 'Pick member or admin')
    || (postIn !== undefined ? postInProblem(postIn) : null)
  if (bad) return bad
  return saidOf(commitPeopleSettingsIntent('account.addNew', null, txn => {
    const pid = putNewPerson(np)
    /* his home unit, in the same command — the adder's own by default (D2094); written BEFORE the war's post-in, which
       finds him in the projection of the war's own squadron (the second fix read, 18 Nov 26 — Astra 4) */
    putNewHome(pid, me())
    if (postIn !== undefined) HOOKS.warPostIn(txn, pid, postIn)
    writeAccounts([...ACCOUNTS_LIST, { id: newAccountId(), name, role, pid, on: true, ...newAccountStamp() }])
    if (requestByName(name)) writeReqs(ACCESS_REQS.filter(r => r.name !== name))
  }))
}
/* approving with New person: the person from what he gave, with the admin's corrections,
   his account, and the request answered — one command */
export function approveRequestNew(reqId: string, np: NewPerson, role: AccountRole, postIn?: string): string | null {
  if (!mayManageAccounts() || !mayManageRoster()) return 'Only an admin can approve a request'
  const rq = ACCESS_REQS.find(r => r.id === reqId)
  if (!rq) return 'That request is gone'
  const bad = nameProblem(rq.name) || newPersonProblem(np) || (isAccountRole(role) ? null : 'Pick member or admin')
    || (postIn !== undefined ? postInProblem(postIn) : null)
  if (bad) return bad
  return saidOf(commitPeopleSettingsIntent('access.approveNew', null, txn => {
    const pid = putNewPerson(np)
    putNewHome(pid, me())   // his home unit, before the war's post-in (Astra 4) — the approving admin's own by default (D2094)
    if (postIn !== undefined) HOOKS.warPostIn(txn, pid, postIn)
    writeAccounts([...ACCOUNTS_LIST, { id: newAccountId(), name: rq.name, role, pid, on: true, ...newAccountStamp() }])
    writeReqs(ACCESS_REQS.filter(r => r.id !== reqId))
  }))
}

/* ---- THE ADMINS' BELL (D216, D227): each admin's own "seen" ----
   The signed-in admin's ACCOUNT — on, an admin, his person on the roster — or null: the
   localhost probe bridge can make a session's role "admin" with no admin account behind
   it, and a headless test has no session; neither is anybody's bell (Astra's plan read 6,
   Fable's F12). */
export function currentAdminAccountId(): string | null {
  if (!SESSION || !isAdmin()) return null
  const a = accountById(SESSION.user)
  return a && a.on && isAdminAccount(a) && personOk(a.pid) ? a.id : null
}
export function unseenRequests(): AccessRequest[] {
  const id = currentAdminAccountId()
  return id ? ACCESS_REQS.filter(r => !r.seenBy.includes(id)) : []
}
/* what lights the bell for access: an admin with a request he has not had on screen */
export const accessAlert = (): boolean => unseenRequests().length > 0
/* the waiting list was on screen for this admin (Admin → Users — on a phone, drilled in):
   ONE command marking every waiting request seen by him; nothing when nothing is new */
export function markRequestsSeen(): string | null {
  const id = currentAdminAccountId()
  if (!id || !unseenRequests().length) return null
  /* his OWN row only — the requests waiting now (one he saw that has since gone is no longer kept) */
  const seen = ACCESS_REQS.map(r => r.id)
  return commitIntent('access.seen', { owner: me() }, () => {
    store.set(REQSEEN_PFX + id, { userId: id, seenRequestIds: seen })
    ACCESS_REQS = ACCESS_REQS.map(r => r.seenBy.includes(id) ? r : { ...r, seenBy: [...r.seenBy, id] })
  })
}
