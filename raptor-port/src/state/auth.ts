/* Session / role state. SESSION is reassigned only through setSession (an ESM binding
   cannot be reassigned from outside its module), and every login and logout goes
   through state/store.ts resetSession, the ONE session-change path.

   [ACCOUNTS] (26 Sep 26, D166): signing in makes you THAT callsign. The two hard-coded
   logins are gone — accounts live in state/accounts.ts, managed on the Admin tab, and
   the sign-in resolves one (or a person on no list — D204) into a session:
     { user, role, pid, name }
   `role` is the account's: 'admin' or 'main' (a member); or, for someone signed in
   without access, 'pending' (on no list), 'guest' (asked, and the admin's guest switch
   is on) or 'off' (his account is switched off). `pid` is his person (null for the last
   three). `name` is the sign-in name (the defence mail address it stands for).
   The admin's role toggle ("View as member" / "Back to admin", 27 Aug 26) and the
   "View as" person picker are GONE — "There isint a need for preview as a member"
   (D166 (3)). WHO MAY DO WHAT is decided in ONE place, state/perms.ts. */
import { mayEditSched } from './perms'

export let SESSION: any = null
export let LGEDIT: any = false                 // Logic-tab edit mode; reset on login/logout
export function setSession(s: any) { SESSION = s; LGEDIT = false }
/* the localhost probe bridge's role switch (e2e + the hand-pass walk, bug-check order
   §7.7): it changes the role in place, never the world. No production caller. */
export function setEffectiveRole(role: any) { if (SESSION) SESSION = { ...SESSION, role } }

/* THE SIGNED-IN PERSON. Set ONLY by resetSession, from the account (and by the
   localhost probe's raptorMe). Every own-row rule asks state/perms.ts, which reads it:
   his own inputs, his own Quals row (D149), his own Leave War row (the sync mirrors it
   into the war's viewer — D166 (4)), the purple "this is you" puck, "who" on a change.
   `bane` is only the HEADLESS default — the person a unit test that never signs in
   acts as; with no session the app draws the sign-in, never a person. */
export const DEFAULT_ME = 'bane'
export let ME: any = DEFAULT_ME
export function setMe(id: any) { ME = id }
export function setLgEdit(on: any) { LGEDIT = !!on }
/* kept as the name ~160 call sites use; the rule is perms.ts's */
export function canEditSched() { return mayEditSched() }
export const lgCanEdit = () => LGEDIT && mayEditSched()
