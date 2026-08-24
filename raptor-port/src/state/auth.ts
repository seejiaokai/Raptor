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
export let SESSION: any = null                 // {user, role}
export let LGEDIT: any = false                 // Logic-tab edit mode; reset on login/logout
export function setSession(s: any) { SESSION = s; LGEDIT = false }
export let ME: any = 'bane'                    // "view as" — selected person, own puck = purple
export function setMe(id: any) { ME = id }
export function setLgEdit(on: any) { LGEDIT = !!on }
export function canEditSched(){return !!SESSION&&SESSION.role==='admin';}
export const lgCanEdit=()=>LGEDIT&&!!SESSION&&SESSION.role==='admin';
