/* [ARCH-STACK] Step 2 — actor derivation (design §3.5); [ACCOUNTS] 26 Sep 26.

   The account id and its role from SESSION (`main` / `member` -> `member`); the
   person from ME, which since [ACCOUNTS] is the SIGNED-IN person (resetSession sets
   it from the account; "View as" is retired — D166), so ownership is real.
   A person signed in without access is a session too (`guest`, `pending`, `off` —
   D204), never the system actor: the command gate refuses every forward command
   from them except a pending person's own access request (Astra R1-4).

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
  const r = SESSION.role
  const role: Actor['role'] = r === 'admin' ? 'admin'
    : r === 'guest' || r === 'pending' || r === 'off' ? r
    : 'member'
  return {
    id: SESSION.user,
    role,
    personId: role === 'admin' || role === 'member' ? ME : undefined,
    principal: SESSION.name,
    session: SESSION,
  }
}
