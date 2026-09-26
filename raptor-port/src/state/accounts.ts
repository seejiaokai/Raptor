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
   - `accessreqs` AccessRequest[] — { id, name, cs, full, at }: the signed-in principal
                  who asked (from the session, never a typed field), the callsign and
                  name he typed (text only), when.
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
import { mayManageAccounts, mayRequestAccess, me, roleOf } from './perms'
import { commitSettingsIntent } from './people-settings-commit'

export type AccountRole = 'admin' | 'main'
export interface Account { id: string; name: string; role: AccountRole; pid: string; on: boolean }
export interface AccessRequest { id: string; name: string; cs: string; full: string; at: number }

/* the intent commands (perms.ts COMMAND_OPS decides who may run each) */
export const ACCOUNT_TYPES = ['access.request', 'access.decline', 'access.approve', 'account.add', 'account.update', 'guestview.set'] as const

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
export const MAX_CS = 14
export const MAX_FULL = 40
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
    reqs.push({ id: x.id, name, cs: String(x.cs ?? '').slice(0, MAX_CS), full: String(x.full ?? '').slice(0, MAX_FULL), at: Number(x.at) || 0 })
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
/* the callsign an account belongs to, read LIVE (a rename moves nothing) */
export function accountCallsign(a: Account | undefined): string {
  const p = a && (PEOPLE as any)[a.pid]
  return p ? String(p.cs) : ''
}
/* the people an account can be linked to: on the roster, not archived, not the ALL /
   ALL AVAIL placeholders, and without an account (`keep` is the one already linked) */
export function linkablePeople(keep?: string): string[] {
  return Object.keys(PEOPLE).filter(id => {
    const p = (PEOPLE as any)[id]
    return p && !p.special && !p.archived && (id === keep || !accountOfPid(id))
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
    case 'ok': return { user: r.account.id, role: r.account.role, pid: r.account.pid, name: r.account.name }
    case 'off': return { user: `principal:${r.name}`, role: 'off', pid: null, name: r.name }
    case 'guest': return { user: `principal:${r.name}`, role: 'guest', pid: null, name: r.name }
    case 'new': case 'waiting': return { user: `principal:${r.name}`, role: 'pending', pid: null, name: r.name }
    default: return null
  }
}

/* ---- WRITES — each one intent command; a string back is the refusal, said on screen ---- */
function commitIntent(type: typeof ACCOUNT_TYPES[number], meta: any, fn: () => void): string | null {
  const r: any = commitSettingsIntent(type, meta, fn)
  /* never the command layer's own message on screen — it names records, not people */
  if (r && r.ok === false) return r.reason === 'unauthorized' ? 'You are not allowed to do that' : 'That did not save'
  return null
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
  if (!p || p.special) return 'Pick the callsign this account belongs to'
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
   sign-in name comes from the session, never from a typed box */
export function requestAccess(csIn: any, fullIn: any): string | null {
  if (!mayRequestAccess()) return 'You cannot ask for access from here'
  const name = normName(SESSION && SESSION.name)
  if (!name) return 'Sign in first'
  if (accountByName(name)) return 'This sign-in already has an account — sign out and in again'
  if (requestByName(name)) return 'You have already asked — an admin will answer it'
  const cs = String(csIn ?? '').trim().slice(0, MAX_CS)
  const full = String(fullIn ?? '').trim().slice(0, MAX_FULL)
  if (!cs) return 'Type your callsign'
  if (!full) return 'Type your name'
  return commitIntent('access.request', { owner: name }, () =>
    writeReqs([...ACCESS_REQS, { id: 'rq' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, cs, full, at: Date.now() }]))
}
