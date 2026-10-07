/* WHO PLACED AN INPUT, AND WHO LAST CHANGED IT (owner, D629, 7 Oct 26 — "show who placed that input at what time and
   day"; the build plan's §3.8).

   An Input carries four facts beside the lateness date `mod` (which stays exactly as it was — the late rule reads it):
   `by` and `at`, the signed-in PERSON who filed it and that moment; `modBy` and `modAt`, its last change. Two bodies
   write them, and every door that makes or changes an input calls one — the table of doors is §3.8, and
   `leavewar/whoplaced.test.ts` / `ui/whoplaced.test.tsx` are that table, one case a row:

   · `stampPlaced(row)` — a record that is FILED: the editor's new input, the List's Add form, a leave approved (or
     extended) on the Leave War. All four are written, from ONE reading, so a record nobody has changed says the same
     thing twice and a screen can tell "changed" by comparing them.
   · `stampChanged(row)` — a record that is CHANGED: an edit, an OIL answer alone, a leave moved or cut, a medical
     split or trimmed, a posting's trim. Who placed it is left alone; a PIECE the app cuts from a record is a copy of
     it, so it carries that record's `by` and `at` and only its change is stamped here.

   WHO: the person the running command is acting for — the same one the command's own record names (command/actor.ts),
   never a caller's say-so. So Undo and Redo stamp nothing (a restore writes the recorded images back: its origin is
   not a person's forward command), and neither does a seed or a change arriving from elsewhere. With nobody signed in
   there is no one to name and nothing is written — a record without `by` shows no line (D56).

   THE APP'S OWN ACT (a posting that runs by itself on its date, inside whatever command happened to be running) is
   nobody's hand: the moment is recorded and the name is dropped, so the member whose visit triggered it is never shown
   as having changed another man's input.

   WHEN: ONE moment per command. Every stamp a command writes carries the same time, so a record filed and a piece cut
   in the same save can never read a millisecond apart. A row built just before its command opens (the editor builds
   the record, then writes it) takes its own reading. */
import { activeEnvelope, deriveActor } from '../command'

type Stamp = { who: string | undefined; t: number }
const WHEN = new WeakMap<object, number>()

function stampNow(): Stamp | null {
  const env = activeEnvelope()
  if (!env) {
    const a = deriveActor()
    return a.personId == null ? null : { who: String(a.personId), t: Date.now() }
  }
  if (env.origin !== 'user' && env.origin !== 'projection') return null
  let t = WHEN.get(env)
  if (t == null) { t = Date.now(); WHEN.set(env, t) }
  if (env.origin === 'projection') return { who: undefined, t }
  const pid = env.actor.personId
  return pid == null ? null : { who: String(pid), t }
}

/** A record FILED now: who placed it and when — and its last change says the same. */
export function stampPlaced<T>(row: T): T {
  const s = stampNow(), r: any = row
  if (!s || !r) return row
  if (s.who) { r.by = s.who; r.modBy = s.who } else { delete r.by; delete r.modBy }
  r.at = s.t; r.modAt = s.t
  return row
}

/** A record CHANGED now: who changed it and when. Who placed it is never touched. */
export function stampChanged<T>(row: T): T {
  const s = stampNow(), r: any = row
  if (!s || !r) return row
  if (s.who) r.modBy = s.who; else delete r.modBy
  r.modAt = s.t
  return row
}
