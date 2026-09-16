/* [ARCH-STACK] Step 2 — actor derivation (design §3.5).

   Account id + effective role from SESSION (SESSION.role `main`->`member`);
   ownership personId from the ME/viewer binding (auth.ts), NOT SESSION
   (R3-006). Ownership-from-ME is defense-in-depth PARITY ONLY — ME is the
   user-selectable View-as binding; real identity arrives with Step 5 sign-in.

   The system/headless actor (session:null) is used only for seed/projection/
   loadWeek and — under the SESSION=null parity harness — to keep tfin.js 728/0;
   its personId is undefined (Fable R4-6). Never used for a user restore.
*/
import { SESSION, ME } from '../state/auth'
import type { Actor } from './types'

/* the headless / seed / projection actor. personId deliberately undefined. */
export function systemActor(): Actor {
  return { id: 'system', role: 'system', session: null }
}

/* the actor a public commit() runs as. Snapshot at command creation (the
   caller passes the result straight into commit). With SESSION=null (headless,
   or the parity harness) this is the system actor — which keeps 728/0 because
   nothing about a headless render depends on an account. */
export function deriveActor(): Actor {
  if (!SESSION) return systemActor()
  return {
    id: SESSION.user,
    role: SESSION.role === 'admin' ? 'admin' : 'member',
    personId: ME,
    session: SESSION,
  }
}
