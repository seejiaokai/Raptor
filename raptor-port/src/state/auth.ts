/* Session / role state — who is signed in, and the ONE binding of the permissions table to him.

   SIGNING IN MAKES YOU THAT CALLSIGN (owner, D166, 25 Sep 26). A session is an ACCOUNT (state/accounts.ts —
   the sign-in name stands for the defence mail, the account is tied to one puck), or a person WAITING for one
   (D204 — role 'guest', no account, no puck). `ME` is the signed-in person's puck, set by resetSession
   (state/store.ts) and nothing else in production: the "View as" picker and the admin's member preview are GONE
   (his explicit no), so no screen can change who you are.

   `may(op, table, owner?)` is the one question every gate asks (owner, D200 (3)): it reads the role, and — for an
   account — the LIVE account (its role and its on/off switch, Fable F8: a switched-off or demoted account loses its
   powers at once, not at its next sign-in), then answers from the permissions table (state/permissions.ts, the
   app's copy of docs/data-model.md §11). No session → false; a gate that must stay open to a sessionless test or
   boot context says so itself (`signedIn() && !may(…)`), as the write-path backstops always have.

   THE TEST SHAPE (Fable F12, 26 Sep 26): a bare `{ user, role }` session — no `acct` — is what the unit tests set;
   its role is taken as given and it leaves ME at the boot default. A real sign-in always carries `acct` (or is a
   guest). SESSION is reassigned only through setSession because an ESM binding cannot be reassigned from outside
   its module. */
import { allowed, type Op, type PermRole } from './permissions'
import { accountById, guestView } from './accounts'

export let SESSION: any = null                 // { user, role, acct?, forceRole? } — see the header
export let LGEDIT: any = false                 // Logic-tab edit mode; reset on login/logout
export function setSession(s: any) { SESSION = s; LGEDIT = false }
/* e2e / probe only (probe-bridge.ts raptorRole, localhost): force the role WITHOUT signing in again — the bug-check
   order §7.7's "change only the role a person would reach by signing in, not the world". It wins over the account's
   own role until the next sign-in. */
export function setRoleForTest(role: any) { if (SESSION) SESSION = { ...SESSION, role, forceRole: role } }
export let ME: any = 'bane'                    // the signed-in person's puck — own puck = purple; '' for a guest
export function setMe(id: any) { ME = id }
export function setLgEdit(on: any) { LGEDIT = !!on }
export const signedIn = () => !!SESSION

/* the role the table is read with: admin, member (the account role 'main', and the probe's 'member'), or waiting
   (a guest). null — no session, or an account that is switched off or gone. */
export function roleNow(): PermRole | null {
  if (!SESSION) return null
  let r: any = SESSION.forceRole
  if (!r && SESSION.acct) {
    const a = accountById(SESSION.acct)
    if (!a || !a.enabled) return null
    r = a.role
  }
  if (!r) r = SESSION.role
  return r === 'admin' ? 'admin' : r === 'guest' ? 'waiting' : 'member'
}
/* a session with no access at all: a person waiting for an account, or an account switched off since it signed in */
export const isGuest = () => !!SESSION && SESSION.role === 'guest' && !SESSION.forceRole
export const accountOff = () => !!SESSION && !!SESSION.acct && !SESSION.forceRole && roleNow() === null

/* `owner` — whose row it is: a person id for the person-owned tables (compared with ME), the sign-in name for the two
   tables whose own row is the principal (User, AccessRequest — §11's "Own row is…"). Omit it to ask "may he do this
   to ANY row?" (true for an admin only, where the member's right is own-row). */
const PRINCIPAL_OWNED = new Set(['User', 'AccessRequest'])
export function may(op: Op, table: string, owner?: unknown): boolean {
  const role = roleNow()
  if (!role) return false
  let own = false
  if (owner !== undefined && owner !== null && owner !== '') {
    own = PRINCIPAL_OWNED.has(table) ? owner === SESSION.user : (ME !== '' && owner === ME)
  }
  return allowed(role, op, table, own, guestView())
}

/* the named alias for the true schedule writers — the week, the board, drafts, the planning layer, the day's view
   toggles and its OIL earn decisions: ScheduleWeek U in §11. Every other door names its own table
   (permissions.ts GATES — Fable F4). */
export function canEditSched() { return may('U', 'ScheduleWeek') }
export const lgCanEdit = () => !!LGEDIT && may('U', 'Setting')
