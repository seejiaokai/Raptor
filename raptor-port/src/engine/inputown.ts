/* THE WRITES TO WHO IS IN AN INPUT ([ALL-AVAIL-AS-MEMBER] step 2 (a), 12 Oct 26 — owner D756: "an input is stored as ONE
   record with the list of its people"; D759 reading 4: "a change to one man's part alone gives him an input of his own";
   the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1, §4.6).

   A WRITER'S FILE (engine/inputs-readers.test.ts): every body here is handed the RECORD — never a per-person line — and
   is called inside a command (the inputs door, state/store.ts runInputWrite), which is what saves it, checks its shape
   (inputs.ts shapeProblem) and makes it one Undo step. Nothing here asks who may: the doors do (ui/inputedit.tsx
   commitInput, ui/reqdoor.ts), through state/perms.ts.

   THE OLD SHAPE IS WRITTEN FORWARD, NEVER BACK (D759, D56): a record stored before this build carries one `person`. It
   reads as a one-person input for ever (inputs.ts peopleOf) and is rewritten with `people` the first time one of these
   bodies changes who is in it — `person`, the group fields and `leftAt` go, and what `leftAt` said about its one
   person rides his entry's `h`.

   `hand` AND `h` — the holding stamps a scheduler's OIL switch is read against (engine/oilev.ts
   pruneHandedOverDecisions; ui/oilmode.ts stamps a switch with the input's `hand` when it is made). `hand` counts every
   time a person is PUT IN after the filing; his entry's `h` is its value when he was put in. So a switch made about a
   man who left and was put back (`pa` < his `h`) reads as nothing, and nobody's switch moves when someone ELSE joins or
   leaves.
   …AND `leftAt` — THE HOLDING AT WHICH THE INPUT LEFT A PERSON (step 3, 12 Oct 26; the stamp the one-person hand-over has
   written since [DB-READINESS] phase 6 (a)). A man taken OUT has no entry left to carry an `h`, and where the input
   also holds ALL AVAIL he may now stand BEHIND it: a switch made about him while he was in it was then read against
   the placeholder's holding and lived on, or came back after the app had voided it — and the same people reached in
   two orders earned differently (found by the re-expressed OIL tests). So leaving is a holding of its own: `hand`
   moves on and `leftAt[him]` says where; a switch about him made before that reads as nothing, one made after it —
   about him as a man of the crowd — stands. Put back in, his entry's `h` says the same and the stamp is dropped. */
import { INPUTS, idsOf, entryOf, holds } from './inputs'
import { newId } from './newid'

/* who put a person in, and when — handed in by the door (state/inputstamp.ts reads the running command) */
export type PutStamp = { by?: string; at?: number; mod?: string }

/** The record, carrying its people. A record already in the new shape is left exactly as it is. */
export function toPeople(r: any): any {
  if (!r || Array.isArray(r.people)) return r
  const e: any = { p: r.person }
  if (r.by != null) e.by = r.by
  if (r.at != null) e.at = r.at
  /* a decision about him made before the request last left him is void (the old shape's `leftAt`) */
  const left = r.leftAt && r.person != null ? r.leftAt[String(r.person)] : null
  if (left != null) e.h = Number(left)
  r.people = r.person != null && r.person !== '' ? [e] : []
  delete r.person; delete r.grp; delete r.grpBy; delete r.leftAt
  return r
}
/* he has left: the holding moves on, and says where (above) */
const left = (r: any, p: any): void => {
  r.hand = Number(r.hand || 0) + 1
  r.leftAt = { ...(r.leftAt || {}), [String(p)]: r.hand }
}
/* he is back in: his entry's `h` carries it now */
const back = (r: any, p: any): void => {
  if (!r.leftAt || !(String(p) in r.leftAt)) return
  const { [String(p)]: _gone, ...rest } = r.leftAt
  if (Object.keys(rest).length) r.leftAt = rest; else delete r.leftAt
}
const entry = (r: any, p: any, st?: PutStamp): any => {
  const e: any = { p }
  if (st && st.by != null) e.by = st.by
  if (st && st.at != null) e.at = st.at
  if (st && st.mod != null) e.mod = st.mod
  e.h = Number(r.hand || 0)
  return e
}
/** Put a person (or a placeholder) IN — appended, the last to join. Someone already in it is not put in twice. */
export function putPerson(r: any, p: any, st?: PutStamp): boolean {
  if (!r || p == null || p === '') return false
  toPeople(r)
  if (holds(r, p)) return false
  r.hand = Number(r.hand || 0) + 1
  r.people.push(entry(r, p, st))
  back(r, p)
  return true
}
/** Take a person OUT. The record keeps everyone else, in their order. (Taking the last one out is refused by the
 *  doors — an input with nobody is refused at the write, inputs.ts shapeProblem.) */
export function takePerson(r: any, p: any): boolean {
  if (!r || !holds(r, p)) return false
  toPeople(r)
  r.people = r.people.filter((e: any) => !(e && String(e.p) === String(p)))
  left(r, p)
  return true
}
/** One person REPLACED by another, in his place in the list: a hand-over of a one-person input, the Unavailable row's
 *  swap. The newcomer is put in under a new holding, so nothing decided about the man replaced — or about the
 *  newcomer in an earlier holding of his — carries over. */
export function swapPerson(r: any, from: any, to: any, st?: PutStamp): boolean {
  if (!r || to == null || to === '' || !holds(r, from) || holds(r, to)) return false
  toPeople(r)
  r.hand = Number(r.hand || 0) + 1
  r.people = r.people.map((e: any) => (e && String(e.p) === String(from) ? entry(r, to, st) : e))
  r.leftAt = { ...(r.leftAt || {}), [String(from)]: r.hand }
  back(r, to)
  return true
}

/** ONE MAN'S OWN INPUT. Where he is the only one in it, the input itself. Where it holds others too: a NEW record —
 *  a new id, every field of the input copied, his own entry its one person, `by` and `at` the input's — put straight
 *  after the input in the list, with him taken out of the original. The caller then changes what it was handed: his
 *  dates, his times, his remark, his absence (the plan §4.6 — a time typed on his own Unavailable row, sick leave
 *  cutting his part of a shared leave, a posting's trim of his dates). Null where he is not in it. */
export function ownInputOf(input: any, person: any): any {
  if (!input || !holds(input, person)) return null
  if (idsOf(input).length === 1) return input
  toPeople(input)
  const his = entryOf(input, person)
  const own: any = JSON.parse(JSON.stringify(input))
  own.iid = newId('i')
  delete own.ord
  own.people = [JSON.parse(JSON.stringify(his))]
  takePerson(input, person)
  const at = (INPUTS as any[]).indexOf(input)
  if (at >= 0) (INPUTS as any[]).splice(at + 1, 0, own); else (INPUTS as any[]).push(own)
  return own
}
