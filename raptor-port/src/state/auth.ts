/* Session / role state — the minimum the store needs so armSlot and the Logic
   tab's edit gate keep their reference bodies. The login page itself is
   phase-4 UI. ACCOUNTS and both gate functions are verbatim from the
   reference; SESSION is reassigned only through setSession because an ESM
   binding cannot be reassigned from outside its module. */
/* the account NAMES diverge from the reference deliberately (owner, 24 Aug
   26 — "Change the admin account ad user, and a for password. User account
   to be us for user and us for password"): admin is ad/a, member is us/us.
   The gate functions below stay verbatim. */
export const ACCOUNTS: any = { ad: { pass: 'a', role: 'admin', label: 'Admin' }, us: { pass: 'us', role: 'main', label: 'Squadron member' } }
export let SESSION: any = null                 // {user, role} — role is the EFFECTIVE role every gate reads
/* the TRUE role of the signed-in account, captured at login and never moved
   by the admin's view toggle (owner, 27 Aug 26 — "allow admin account to
   toggle between admin and member role… normal logged in account cant do
   this"). It is the CEILING: only a real admin login may flip the effective
   role, so a member can never lift themselves by toggling, and an admin
   parked in member view still owns the way back. Cleared with the session. */
export let LOGINROLE: any = null
export let LGEDIT: any = false                 // Logic-tab edit mode; reset on login/logout
export function setSession(s: any) { SESSION = s; LOGINROLE = s ? s.role : null; LGEDIT = false }
/* flip ONLY the effective role — LOGINROLE stays the account's truth. The
   gate functions below keep their verbatim bodies (they read SESSION.role),
   so every edit gate in the app follows the toggle with no second check.
   The page/board/Leave-War coordination lives in store.ts's toggleRole, the
   one production caller — this is just the state write. */
export function setEffectiveRole(role: any) { if (SESSION) SESSION = { ...SESSION, role } }
export const canToggleRole = () => LOGINROLE === 'admin'
export let ME: any = 'bane'                    // "view as" — selected person, own puck = purple
export function setMe(id: any) { ME = id }
export function setLgEdit(on: any) { LGEDIT = !!on }
export function canEditSched(){return !!SESSION&&SESSION.role==='admin';}
export const lgCanEdit=()=>LGEDIT&&!!SESSION&&SESSION.role==='admin';
