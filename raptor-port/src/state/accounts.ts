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

   THE RECORDS (the Shell's `User` and `AccessRequest`, and one `Setting` — data-model
   §3, §11), three durable settings keys written ONLY here, through intent commands
   (commitSettingsIntent — one command per intent, every key it needs inside it):
   - `accounts`   Account[] — { id, name, role, pid, on }. `name` is the sign-in name,
                  which stands for the defence mail address; `pid` the person it belongs
                  to (one person, one account); `on` false = switched off (never deleted).
   - `accessreqs` AccessRequest[] — { id, name, cs, ini, seat, cat, at, seenBy }: the
                  signed-in principal who asked (from the session, never a typed field);
                  what he typed — the displayed callsign/name, initials, pilot / WSO /
                  personnel, CAT (text only: approving with New person makes the person
                  from it, with the admin's corrections — [ACCOUNTS-NEW-PERSON], D214);
                  when; and which admins have had it on screen (the bell — D216, D227).
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
   whoever it catches); the Admin list marks it. */
import { store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { SESSION } from './auth'
import { isAdmin, mayManageAccounts, mayManageRoster, mayRequestAccess, me, roleOf } from './perms'
import { commitSettingsIntent, commitPeopleSettingsIntent } from './people-settings-commit'
import {
  MAX_CS, MAX_INITIALS, SEATS, catsFor, seatLabel, tidyPerson, newPersonProblem, putNewPerson, addRosterPerson, saidOf,
  type NewPerson,
} from './roster-add'

export type AccountRole = 'admin' | 'main'
export interface Account { id: string; name: string; role: AccountRole; pid: string; on: boolean }
/* `seat` 'FCP' | 'RCP' | 'GND' (never '' on a request made now — the card refuses it; an
   old stored one reads '' and the admin picks at approval); `cat` '' for personnel */
export interface AccessRequest { id: string; name: string; cs: string; ini: string; seat: string; cat: string; at: number; seenBy: string[] }

/* the intent commands (perms.ts COMMAND_OPS decides who may run each) */
export const ACCOUNT_TYPES = ['access.request', 'access.decline', 'access.approve', 'account.add', 'account.update', 'guestview.set',
  /* [ACCOUNTS-NEW-PERSON]: a person alone, a person and his account, approving with a new
     person, and the admins' bell's "seen" */
  'person.add', 'account.addNew', 'access.approveNew', 'access.seen'] as const

/* ---- the seeds (demo data, D56 — wiped with everything else before the database) ----
   `us` stays Ranger (bane), as "View as" left every member test before; `ad` is Saber
   (stiff) because one person holds one account; `outlaw` and `hex` are members NOT
   posted out in the demo world. */
const SEED: Account[] = [
  { id: 'acad', name: 'ad', role: 'admin', pid: 'stiff', on: true },
  { id: 'acus', name: 'us', role: 'main', pid: 'bane', on: true },
  { id: 'acoutlaw', name: 'outlaw', role: 'main', pid: 'casper', on: true },
  { id: 'achex', name: 'hex', role: 'main', pid: 'rocky', on: true },
]
/* code only — never written to a stored record (see the header) */
const SEED_PASS: Record<string, string> = { acad: 'a', acus: 'us' }

export let ACCOUNTS_LIST: Account[] = SEED.map(a => ({ ...a }))
export let ACCESS_REQS: AccessRequest[] = []
export let GUESTVIEW = false

export const MAX_SIGNIN = 80
export { MAX_CS, MAX_INITIALS }
export const normName = (s: any): string => String(s ?? '').trim().toLowerCase()
const isAccountRole = (r: any): r is AccountRole => r === 'admin' || r === 'main'
const personOk = (pid: string) => !!(PEOPLE as any)[pid] && !(PEOPLE as any)[pid].special

/* ---- load (a settings loader: runs at boot and inside every settings rollback, so it
   NEVER writes — a null key means the in-memory default) ---- */
export function accountsLoad(): void {
  const raw = store.get('accounts', null)
  if (raw == null) ACCOUNTS_LIST = SEED.map(a => ({ ...a }))
  else {
    const seenId = new Set<string>(), seenName = new Set<string>(), seenPid = new Set<string>()
    const out: Account[] = []
    for (const x of Array.isArray(raw) ? raw : []) {
      if (!x || typeof x.id !== 'string' || !x.id || typeof x.pid !== 'string' || !x.pid || !isAccountRole(x.role)) continue
      const name = normName(x.name)
      if (!name || name.length > MAX_SIGNIN || seenId.has(x.id) || seenName.has(name) || seenPid.has(x.pid)) continue
      seenId.add(x.id); seenName.add(name); seenPid.add(x.pid)
      out.push({ id: x.id, name, role: x.role, pid: x.pid, on: x.on !== false })
    }
    /* THE WAY BACK FROM A LOCK-OUT (Fable R2-6, Astra R3-4): a stored list with no admin
       who can sign in gets the seed admin ADDED, keeping every real account — and the
       seed admin WINS any collision (an entry holding its id, its sign-in name `ad` or
       its person), or the fallback could still end with no admin. At the database step
       there are no seeds: the environment's own administrator restores access. */
    let fixed = out
    if (!out.some(a => isAdminAccount(a) && a.on && personOk(a.pid))) {
      const s = SEED[0]
      fixed = out.filter(a => a.id !== s.id && a.name !== s.name && a.pid !== s.pid)
      fixed.push({ ...s })
    }
    ACCOUNTS_LIST = fixed
  }
  const rq = store.get('accessreqs', null)
  const reqs: AccessRequest[] = []
  const seenReq = new Set<string>()
  for (const x of Array.isArray(rq) ? rq : []) {
    const name = normName(x && x.name)
    /* a request under a name that already has an account is answered, whatever wrote it —
       dropped here in memory (the load never writes) so it is never listed or counted */
    if (!x || typeof x.id !== 'string' || !name || seenReq.has(name) || accountByName(name)) continue
    seenReq.add(name)
    /* read defensively (the load never writes): an unknown seat or a CAT that seat cannot
       hold reads '' (the admin picks at approval); the slicing is only for records written
       by an older build — every writer REFUSES an over-long value instead (D226) */
    const seat = SEATS.some(v => v.v === x.seat) ? String(x.seat) : ''
    const cat = seat && seat !== 'GND' && catsFor(seat).includes(x.cat) ? String(x.cat) : ''
    reqs.push({
      id: x.id, name, cs: String(x.cs ?? '').slice(0, MAX_CS), ini: String(x.ini ?? '').toUpperCase().slice(0, MAX_INITIALS),
      seat, cat, at: Number(x.at) || 0,
      seenBy: Array.isArray(x.seenBy) ? x.seenBy.filter((v: any) => typeof v === 'string') : [],
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
/* what he gave, in one line — "JKB · Pilot · CAT C" / "BC · Personnel" — the waiting
   screen and Admin → Users read this one body (a blank part drops out) */
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
const canSignInAsAdmin = (a: Account) => isAdminAccount(a) && a.on && personOk(a.pid)

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
function writeAccounts(next: Account[]) { store.set('accounts', next); ACCOUNTS_LIST = next }
function writeReqs(next: AccessRequest[]) { store.set('accessreqs', next); ACCESS_REQS = next }
function newAccountId(): string { return 'ac' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

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
  if (p.archived && !(selfId && accountById(selfId)?.pid === pid)) return `${p.cs} is archived — restore them on the Quals page first`
  return null
}
const ADMIN_LOCK = 'At least one admin must keep access'
const ownAccount = (a: Account) => (SESSION && SESSION.user === a.id) || (me() != null && a.pid === me())

/* the admin adds an account (D166 (1)); a request waiting under that name is answered */
export function addAccount(nameIn: any, pid: string, role: AccountRole): string | null {
  if (!mayManageAccounts()) return 'Only an admin can add an account'
  const name = normName(nameIn)
  const bad = nameProblem(name) || pidProblem(pid) || (isAccountRole(role) ? null : 'Pick member or admin')
  if (bad) return bad
  return commitIntent('account.add', null, () => {
    writeAccounts([...ACCOUNTS_LIST, { id: newAccountId(), name, role, pid, on: true }])
    if (requestByName(name)) writeReqs(ACCESS_REQS.filter(r => r.name !== name))
  })
}

/* the admin changes an account: its sign-in name, role, puck, or switches it off / on */
export function updateAccount(id: string, patch: { name?: any; role?: AccountRole; pid?: string; on?: boolean }): string | null {
  if (!mayManageAccounts()) return 'Only an admin can change an account'
  const a = accountById(id)
  if (!a) return 'That account is gone'
  if (ownAccount(a)) return "You can't change your own account — ask another admin"
  const next: Account = { ...a }
  if (patch.name !== undefined) { const n = normName(patch.name); const bad = nameProblem(n, a.id); if (bad) return bad; next.name = n }
  if (patch.pid !== undefined) { const bad = pidProblem(patch.pid, a.id); if (bad) return bad; next.pid = patch.pid }
  if (patch.role !== undefined) { if (!isAccountRole(patch.role)) return 'Pick member or admin'; next.role = patch.role }
  if (patch.on !== undefined) next.on = !!patch.on
  const list = ACCOUNTS_LIST.map(x => x.id === a.id ? next : x)
  if (!list.some(canSignInAsAdmin)) return ADMIN_LOCK
  /* a sign-in name taken by a rename answers a request waiting under it, as adding an
     account does (Fable's scenario read, 26 Sep 26: the request stayed listed, could never
     be approved — "already has an account" — and kept the Admin tab's count up) */
  const answered = next.name !== a.name && !!requestByName(next.name)
  return commitIntent('account.update', null, () => {
    writeAccounts(list)
    if (answered) writeReqs(ACCESS_REQS.filter(r => r.name !== next.name))
  })
}

/* the admin approves a request: the account AND the request cleared, one command */
export function approveRequest(reqId: string, pid: string, role: AccountRole): string | null {
  if (!mayManageAccounts()) return 'Only an admin can approve a request'
  const rq = ACCESS_REQS.find(r => r.id === reqId)
  if (!rq) return 'That request is gone'
  const bad = nameProblem(rq.name) || pidProblem(pid) || (isAccountRole(role) ? null : 'Pick member or admin')
  if (bad) return bad
  return commitIntent('access.approve', null, () => {
    writeAccounts([...ACCOUNTS_LIST, { id: newAccountId(), name: rq.name, role, pid, on: true }])
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

/* ---- A NEW PERSON WITH HIS ACCOUNT, IN ONE STEP ([ACCOUNTS-NEW-PERSON], D214, D217) ----
   Admin → Users' "New person": the person (the one add, roster-add.ts) and his account are
   ONE command over the people and settings stores — both made or neither (a refusal inside
   rolls both back and still says why). A blank sign-in makes a roster-only person (D217 —
   someone who will not use the app): the people command alone. */
export function addPersonAndAccount(nameIn: any, np: NewPerson, role: AccountRole): string | null {
  const name = normName(nameIn)
  if (!name) return addRosterPerson(np)
  if (!mayManageAccounts() || !mayManageRoster()) return 'Only an admin can add a person'
  const bad = nameProblem(name) || newPersonProblem(np) || (isAccountRole(role) ? null : 'Pick member or admin')
  if (bad) return bad
  return saidOf(commitPeopleSettingsIntent('account.addNew', null, () => {
    const pid = putNewPerson(np)
    writeAccounts([...ACCOUNTS_LIST, { id: newAccountId(), name, role, pid, on: true }])
    if (requestByName(name)) writeReqs(ACCESS_REQS.filter(r => r.name !== name))
  }))
}
/* approving with New person: the person from what he gave, with the admin's corrections,
   his account, and the request answered — one command */
export function approveRequestNew(reqId: string, np: NewPerson, role: AccountRole): string | null {
  if (!mayManageAccounts() || !mayManageRoster()) return 'Only an admin can approve a request'
  const rq = ACCESS_REQS.find(r => r.id === reqId)
  if (!rq) return 'That request is gone'
  const bad = nameProblem(rq.name) || newPersonProblem(np) || (isAccountRole(role) ? null : 'Pick member or admin')
  if (bad) return bad
  return saidOf(commitPeopleSettingsIntent('access.approveNew', null, () => {
    const pid = putNewPerson(np)
    writeAccounts([...ACCOUNTS_LIST, { id: newAccountId(), name: rq.name, role, pid, on: true }])
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
  return commitIntent('access.seen', null, () =>
    writeReqs(ACCESS_REQS.map(r => r.seenBy.includes(id) ? r : { ...r, seenBy: [...r.seenBy, id] })))
}
