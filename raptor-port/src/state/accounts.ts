/* ACCOUNTS — who can sign in, as whom (owner, D165, D166, 25 Sep 26; D204, 26 Sep 26).

   Each account is a sign-in name (it stands for the person's DEFENCE MAIL — D166 (2)), admin or member, and the
   CALLSIGN it belongs to: signing in makes you that person, so "View as" and the admin's member preview are gone
   (D166 (3), his explicit no). One person, one account; the admin creates them on Admin → Users, or approves a
   request from someone who signed in on no account (D204). Replaces the two fixed logins and the old Manage-users
   list, which drove nothing.

   THE RECORDS. Three durable settings keys, riding the settings seam (engine/hooks.ts `store`, routed through the
   command layer by state/people-settings-commit.ts, persisted as settings/<key>): `accounts`, `accessreq`,
   `guestview`. Settings are outside the one Undo ([UNDO-ROSTER-SETTINGS]) — rightly here: switching an account off
   is not something Ctrl-Z should bring back. Nothing is written until an admin changes something, so the demo
   accounts below are the DEFAULT, never a stored seed. One record each for now: saving them in small pieces is
   `[DB-READINESS]` (1), and at the database step they become the `User` and `AccessRequest` tables
   (docs/data-model.md §3).

   PROTOTYPE TRUTHS, kept here and off the screen (owner, 25 Aug 26 — production words only on screen):
   - the app never checks a password in the real thing — Microsoft sign-in does (data-model §3 User). The two demo
     accounts `ad`/`a` and `us`/`us` keep a demo password so nothing he, the e2e helper, the Tracker smoke or ~300
     walk scripts use changes; every other account (the two other demo accounts and every one an admin creates)
     accepts ANY non-empty password, as the organisation's sign-in would have let that person through. Not
     security — it never was (D166, the agent's reading stated to him).
   - the four demo accounts are demo data: deleted, never imported, at the database step (D54, D56; data-model §7).
   - nothing is written at sign-in (Fable F2, 26 Sep 26): a sign-in stamp would make every member a writer of the
     account table, which §11 does not allow. */
import { store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { newId } from '../engine/newid'

export type AccountRole = 'admin' | 'main'
export type Account = { id: string; signIn: string; pass?: string; role: AccountRole; personId: string; enabled: boolean }
export type AccessRequest = { signIn: string; callsign: string; name: string; at: number; status: 'pending' | 'declined' }

/* the demo accounts — the default while nothing is stored. `ad` is Ranger, the account he uses every day; `us` is
   Torch, because a puck has ONE account and Ranger is the admin's (today `us` also looked as Ranger); `saber` and
   `outlaw` come from the old Manage-users list (Stiff = Saber, Casper = Outlaw), a second admin so "another admin
   changes your own account" can be walked. */
export const DEMO_ACCOUNTS: readonly Account[] = Object.freeze([
  { id: 'acct-ad', signIn: 'ad', pass: 'a', role: 'admin', personId: 'bane', enabled: true },
  { id: 'acct-us', signIn: 'us', pass: 'us', role: 'main', personId: 'ignite', enabled: true },
  { id: 'acct-saber', signIn: 'saber', role: 'admin', personId: 'stiff', enabled: true },
  { id: 'acct-outlaw', signIn: 'outlaw', role: 'main', personId: 'casper', enabled: true },
] as Account[])

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
let ACCTS: Account[] = clone(DEMO_ACCOUNTS) as Account[]
let REQS: AccessRequest[] = []
let GUESTVIEW = false
/* set when the stored list had no switched-on admin and the demo accounts stood in (Fable F9) */
let FELL_BACK = false

export const normSignIn = (s: unknown) => String(s ?? '').trim().toLowerCase()
const MAXLEN = 64
const isRole = (r: unknown): r is AccountRole => r === 'admin' || r === 'main'
const hasWorkingAdmin = (list: readonly Account[]) => list.some(a => a.enabled && a.role === 'admin')

/* ---- reading ----------------------------------------------------------------------------------------------- */
export const accounts = (): readonly Account[] => ACCTS
export const accountById = (id: unknown): Account | undefined => id ? ACCTS.find(a => a.id === id) : undefined
export const accountBySignIn = (s: unknown): Account | undefined => { const n = normSignIn(s); return n ? ACCTS.find(a => a.signIn === n) : undefined }
export const accountOfPerson = (pid: unknown): Account | undefined => pid ? ACCTS.find(a => a.personId === pid) : undefined
export const requests = (): readonly AccessRequest[] => REQS
export const pendingRequests = (): AccessRequest[] => REQS.filter(r => r.status === 'pending')
export const requestOf = (s: unknown): AccessRequest | undefined => { const n = normSignIn(s); return n ? REQS.find(r => r.signIn === n) : undefined }
export const guestView = () => GUESTVIEW
export const accountsFellBack = () => FELL_BACK
/* the roster people an account may be tied to: real people (not the ALL / ALL AVAIL placeholders), not posted out,
   and holding no account yet (`keep` — the row being edited keeps its own) */
export function freePucks(keep?: string): string[] {
  return Object.keys(PEOPLE)
    .filter(id => !PEOPLE[id].special && !PEOPLE[id].archived && (id === keep || !accountOfPerson(id)))
    .sort((a, b) => String(PEOPLE[a].cs).localeCompare(String(PEOPLE[b].cs)))
}

/* ---- loading (boot, and a rollback's re-derive) ------------------------------------------------------------ */
/* untrusted storage never throws out of boot: anything that is not a well-formed account is dropped, a sign-in or a
   person already taken keeps the FIRST; a list left with no switched-on admin falls back to the demo accounts for
   this session (not saved) and says so — a total lock-out has no other way back (Fable F9). */
export function accountsLoad(): void {
  const raw = store.get('accounts', null)
  FELL_BACK = false
  if (!Array.isArray(raw)) ACCTS = clone(DEMO_ACCOUNTS) as Account[]
  else {
    const out: Account[] = [], ids = new Set<string>(), sis = new Set<string>(), pids = new Set<string>()
    for (const a of raw) {
      if (!a || typeof a !== 'object') continue
      const signIn = normSignIn(a.signIn)
      if (typeof a.id !== 'string' || !a.id || !signIn || signIn.length > MAXLEN || !isRole(a.role)) continue
      if (typeof a.personId !== 'string' || !a.personId || typeof a.enabled !== 'boolean') continue
      if (ids.has(a.id) || sis.has(signIn) || pids.has(a.personId)) continue
      ids.add(a.id); sis.add(signIn); pids.add(a.personId)
      const acc: Account = { id: a.id, signIn, role: a.role, personId: a.personId, enabled: a.enabled }
      if (typeof a.pass === 'string') acc.pass = a.pass
      out.push(acc)
    }
    if (hasWorkingAdmin(out)) ACCTS = out
    else { ACCTS = clone(DEMO_ACCOUNTS) as Account[]; FELL_BACK = true; console.warn('accounts: no switched-on admin in the stored list — the standard accounts stand in until an admin saves') }
  }
  const rq = store.get('accessreq', null)
  REQS = []
  if (Array.isArray(rq)) {
    const seen = new Set<string>()
    for (const r of rq) {
      if (!r || typeof r !== 'object') continue
      const signIn = normSignIn(r.signIn)
      if (!signIn || signIn.length > MAXLEN || seen.has(signIn) || accountBySignIn(signIn)) continue
      if (r.status !== 'pending' && r.status !== 'declined') continue
      seen.add(signIn)
      REQS.push({ signIn, callsign: String(r.callsign ?? '').slice(0, 24), name: String(r.name ?? '').slice(0, 60), at: Number(r.at) || 0, status: r.status })
    }
  }
  GUESTVIEW = store.get('guestview', false) === true
}

/* ---- writing: ONE command per admin act (Fable F13) --------------------------------------------------------- */
/* state/people-settings-commit.ts installs a wrapper that runs `fn` inside ONE `settings.accounts` command, so an
   approve (the account AND the request) is one envelope and one rollback. With no command layer (a bare unit test),
   `fn` just runs. */
let WRAP: (fn: () => void) => void = (fn) => fn()
export function setAccountsCommit(w: ((fn: () => void) => void) | null) { WRAP = w || ((fn) => fn()) }
function save(keys: Array<'accounts' | 'accessreq' | 'guestview'>) {
  WRAP(() => {
    if (keys.includes('accounts')) store.set('accounts', ACCTS)
    if (keys.includes('accessreq')) store.set('accessreq', REQS)
    if (keys.includes('guestview')) store.set('guestview', GUESTVIEW)
  })
  FELL_BACK = false
}

/* every admin act answers null (done) or the reason it was refused, in the words the screen shows */
type Answer = string | null
const personOk = (pid: string) => !!PEOPLE[pid] && !PEOPLE[pid].special

export function addAccount(p: { signIn: string; personId: string; role: AccountRole }): Answer {
  const signIn = normSignIn(p.signIn)
  if (!signIn) return 'Type the defence mail'
  if (signIn.length > MAXLEN) return 'That defence mail is too long'
  if (/\s/.test(signIn)) return 'A defence mail has no spaces'
  if (accountBySignIn(signIn)) return `${signIn} already has an account`
  if (!p.personId) return 'Pick the puck this account belongs to'
  if (!personOk(p.personId)) return 'That puck is not on the roster'
  const held = accountOfPerson(p.personId)
  if (held) return `${PEOPLE[p.personId].cs} already has an account (${held.signIn})`
  if (!isRole(p.role)) return 'Pick admin or member'
  ACCTS = [...ACCTS, { id: newId('acct-'), signIn, role: p.role, personId: p.personId, enabled: true }]
  /* an account added over a pending request under the same sign-in answers that request */
  const hadReq = REQS.some(r => r.signIn === signIn)
  REQS = REQS.filter(r => r.signIn !== signIn)
  save(hadReq ? ['accounts', 'accessreq'] : ['accounts'])
  return null
}

/* change one account. `by` is the account id of the admin doing it: nobody changes his OWN account (another admin
   does — no one can lock himself out mid-session), and the LAST switched-on admin can be neither demoted nor switched
   off. */
export function updateAccount(id: string, patch: { signIn?: string; personId?: string; role?: AccountRole; enabled?: boolean }, by: string | null): Answer {
  const cur = accountById(id)
  if (!cur) return 'That account no longer exists'
  if (by && by === id) return 'Another admin changes your own account'
  const next: Account = { ...cur }
  if (patch.signIn !== undefined) {
    const s = normSignIn(patch.signIn)
    if (!s) return 'Type the defence mail'
    if (s.length > MAXLEN) return 'That defence mail is too long'
    if (/\s/.test(s)) return 'A defence mail has no spaces'
    const other = accountBySignIn(s)
    if (other && other.id !== id) return `${s} already has an account`
    next.signIn = s
  }
  if (patch.personId !== undefined) {
    if (!personOk(patch.personId)) return 'That puck is not on the roster'
    const other = accountOfPerson(patch.personId)
    if (other && other.id !== id) return `${PEOPLE[patch.personId].cs} already has an account (${other.signIn})`
    next.personId = patch.personId
  }
  if (patch.role !== undefined) { if (!isRole(patch.role)) return 'Pick admin or member'; next.role = patch.role }
  if (patch.enabled !== undefined) next.enabled = !!patch.enabled
  const list = ACCTS.map(a => a.id === id ? next : a)
  if (!hasWorkingAdmin(list)) return 'The last admin cannot be switched off or made a member'
  ACCTS = list
  const hadReq = next.signIn !== cur.signIn && REQS.some(r => r.signIn === next.signIn)
  if (hadReq) REQS = REQS.filter(r => r.signIn !== next.signIn)
  save(hadReq ? ['accounts', 'accessreq'] : ['accounts'])
  return null
}

/* D204: the admin approves a request — sets the role and links a puck (a typed callsign never claims one by itself:
   the puck is the admin's pick, required here) — and the account is created switched on; the request goes. */
export function approveRequest(signIn: string, role: AccountRole, personId: string): Answer {
  const r = requestOf(signIn)
  if (!r) return 'That request is no longer waiting'
  if (!personId) return 'Pick his puck first'
  if (!personOk(personId)) return 'That puck is not on the roster'
  const held = accountOfPerson(personId)
  if (held) return `${PEOPLE[personId].cs} already has an account (${held.signIn})`
  if (!isRole(role)) return 'Pick admin or member'
  if (accountBySignIn(r.signIn)) return `${r.signIn} already has an account`
  ACCTS = [...ACCTS, { id: newId('acct-'), signIn: r.signIn, role, personId, enabled: true }]
  REQS = REQS.filter(x => x.signIn !== r.signIn)
  save(['accounts', 'accessreq'])
  return null
}
export function declineRequest(signIn: string): Answer {
  const r = requestOf(signIn)
  if (!r) return 'That request is no longer waiting'
  REQS = REQS.map(x => x.signIn === r.signIn ? { ...x, status: 'declined' } : x)
  save(['accessreq'])
  return null
}

/* the person waiting sends his request, changes his details, or asks again after a decline — his own row only
   (§11's Waiting table); the sign-in is his session's, never typed */
export function submitRequest(signIn: string, callsign: string, name: string): Answer {
  const s = normSignIn(signIn)
  if (!s) return 'Sign in again'
  if (accountBySignIn(s)) return 'You already have an account — sign in again'
  const cs = String(callsign ?? '').trim(), nm = String(name ?? '').trim()
  if (!cs) return 'Type your callsign'
  if (!nm) return 'Type your name'
  if (cs.length > 24) return 'That callsign is too long'
  if (nm.length > 60) return 'That name is too long'
  const req: AccessRequest = { signIn: s, callsign: cs, name: nm, at: Date.now(), status: 'pending' }
  REQS = REQS.some(r => r.signIn === s) ? REQS.map(r => r.signIn === s ? req : r) : [...REQS, req]
  save(['accessreq'])
  return null
}

export function setGuestView(on: boolean): void {
  GUESTVIEW = !!on
  save(['guestview'])
}

/* ---- signing in (D166 (2), D204) --------------------------------------------------------------------------- */
export type SignInAnswer =
  | { kind: 'account'; account: Account }
  | { kind: 'waiting'; signIn: string }
  | { kind: 'refused'; reason: string }
/* what the sign-in screen's two boxes lead to. A switched-off account and a sign-in on no account both sign in —
   with no access: the app shows them the screen that says so (ui/Waiting.tsx), deciding from the LIVE records. */
export function checkSignIn(name: string, pass: string): SignInAnswer {
  const n = normSignIn(name)
  const bad = { kind: 'refused', reason: 'Incorrect username or password.' } as const
  if (!n || !pass || n.length > MAXLEN) return bad
  const acc = accountBySignIn(n)
  if (acc) {
    if (acc.pass != null && acc.pass !== pass) return bad
    if (!acc.enabled) return { kind: 'waiting', signIn: n }
    return { kind: 'account', account: acc }
  }
  return { kind: 'waiting', signIn: n }
}
/* the session a sign-in answer opens: an account signs in as itself (resetSession sets ME to its puck); anyone else
   is WAITING — role 'guest', no account, no puck */
export function sessionOf(a: SignInAnswer): { user: string; role: string; acct: string | null } | null {
  if (a.kind === 'account') return { user: a.account.signIn, role: a.account.role, acct: a.account.id }
  if (a.kind === 'waiting') return { user: a.signIn, role: 'guest', acct: null }
  return null
}

/* ---- test-only ------------------------------------------------------------------------------------------------ */
export function _resetAccounts(): void { ACCTS = clone(DEMO_ACCOUNTS) as Account[]; REQS = []; GUESTVIEW = false; FELL_BACK = false }
