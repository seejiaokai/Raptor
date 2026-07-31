/* Session / role state — the minimum the store needs so armSlot and the Logic
   tab's edit gate keep their reference bodies. The login page itself is
   phase-4 UI. ACCOUNTS and both gate functions are verbatim from the
   reference; SESSION is reassigned only through setSession because an ESM
   binding cannot be reassigned from outside its module. */
export const ACCOUNTS: any = { a: { pass: 'a', role: 'admin', label: 'Admin' }, user: { pass: 'user', role: 'main', label: 'Squadron member' } }
export let SESSION: any = null                 // {user, role}
export let LGEDIT: any = false                 // Logic-tab edit mode; reset on login/logout
export function setSession(s: any) { SESSION = s; LGEDIT = false }
export function setLgEdit(on: any) { LGEDIT = !!on }
export function canEditSched(){return !!SESSION&&SESSION.role==='admin';}
export const lgCanEdit=()=>LGEDIT&&!!SESSION&&SESSION.role==='admin';
