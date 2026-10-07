/* AN INPUT FILED FOR A GROUP — what an entry is, and the one check that keeps it honest (owner D654, D655, 7 Oct 26;
   the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13).

   His ruling is "one shared group input, shown and edited as one thing" (D655). HOW it is kept is ours: ONE RECORD PER
   MAN, tied by a group id — because every reader of an input reads one man's record (the warnings, the rows the board
   and the week land, the Leave War, OIL, the late mark, the change history, Undo) and all of them stay as they are.

   `Input.grp` is the group id, the same on every record of one group filing; `Input.grpBy` is the ENTRY'S FILER, the
   same on every record of the group and never changed once set. An ENTRY is worked out on READ: the live records that
   share a `grp` AND the same shared fields. Nothing is written to keep a group in step — a record changed alone (the
   board's time cell, a hand-over, a posting's trim) simply no longer matches and reads as that man's own input, and
   reads as part of the entry again if it later matches. So no writer and no Undo can leave a group "half changed":
   there is no state to repair.

   What IS held, at the write (the inputs door and the Undo / Redo restore — state/store.ts runInputWrite,
   state/sched-commit.ts): one man once an entry, one filer a group. `entriesOf` does no tidying of its own — a screen
   never hides what the write should have refused. */
import { PEOPLE } from '../engine/people'

/* what every record of an entry says alike; everything else on a record is the man's own (his id and place, his OIL
   answers, where his request is filed, his hand-overs, the late date, the Leave War's mark, who placed and changed it) */
export const SHARED_FIELDS = ['type', 'date', 'endDate', 'yr', 'allday', 's', 'e', 'half', 'remarks'] as const

const norm = (f: string, v: any): any => f === 'allday' ? !!v : (v == null || v === '') ? null : v
/** The shared fields of a record as one comparable string — a blank end date, half or remark reads the same as none. */
export const sharedKey = (r: any): string => JSON.stringify(SHARED_FIELDS.map(f => norm(f, r && r[f])))

export interface InputEntry {
  /** the group id, or null for an ordinary input */
  grp: string | null
  /** its records — one for an ordinary input; a group's in A-to-Z order of callsign */
  rows: any[]
}

const callsign = (p: any): string => { const x = (PEOPLE as any)[p]; return x && x.cs ? String(x.cs) : String(p ?? '') }

/** The list of inputs as ENTRIES, each where its first record sits. `nameOf` gives the name a man is sorted by. */
export function entriesOf(inputs: readonly any[], nameOf: (pid: string) => string = callsign): InputEntry[] {
  const out: InputEntry[] = []
  const byKey = new Map<string, InputEntry>()
  for (const r of inputs || []) {
    if (!r) continue
    if (r.grp == null || r.grp === '') { out.push({ grp: null, rows: [r] }); continue }
    const k = `${r.grp}\u0000${sharedKey(r)}`
    let e = byKey.get(k)
    if (!e) { e = { grp: String(r.grp), rows: [] }; byKey.set(k, e); out.push(e) }
    e.rows.push(r)
  }
  for (const e of out) {
    if (e.rows.length < 2) continue
    const at = new Map(e.rows.map((r, i) => [r, i] as const))
    e.rows.sort((a, b) => nameOf(String(a.person)).localeCompare(nameOf(String(b.person)), undefined, { sensitivity: 'base' }) || (at.get(a)! - at.get(b)!))
  }
  return out
}

/* ---- the check at the write --------------------------------------------------------------------------------------
   Asked only of the groups a command TOUCHED: a fault that lives only in records already stored is not this
   command's to refuse (D56), and an untouched group cannot have been broken by it. */

/** Before a write: each grouped record's group, filer, man and shared fields. */
export function groupSnapshot(inputs: readonly any[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const r of inputs || []) if (r && r.iid && (r.grp != null || r.grpBy != null)) m.set(String(r.iid), sig(r))
  return m
}
const sig = (r: any): string => JSON.stringify([r.grp ?? null, r.grpBy ?? null, r.person ?? null, sharedKey(r)])

/** After it: the groups holding a record this write added, changed or gave a group. */
export function groupsTouched(before: ReadonlyMap<string, string>, inputs: readonly any[]): Set<string> {
  const out = new Set<string>()
  for (const r of inputs || []) {
    if (!r || (r.grp == null && r.grpBy == null)) continue
    if (r.iid && before.get(String(r.iid)) === sig(r)) continue
    out.add(String(r.grp ?? ''))
  }
  return out
}

/** The sentence that refuses the write, or null: in each named group no man twice with the same shared fields, and
 *  every record carrying the group's one filer. */
export function groupBreach(inputs: readonly any[], grps: ReadonlySet<string>, nameOf: (pid: string) => string = callsign): string | null {
  if (!grps.size) return null
  const filer = new Map<string, string>()
  const seen = new Set<string>()
  for (const r of inputs || []) {
    if (!r || (r.grp == null && r.grpBy == null)) continue
    const g = String(r.grp ?? '')
    if (!grps.has(g)) continue
    if (!g || r.grpBy == null || r.grpBy === '') return 'A shared input has one person who filed it — nothing was saved'
    const by = String(r.grpBy)
    if (!filer.has(g)) filer.set(g, by)
    else if (filer.get(g) !== by) return 'A shared input has one person who filed it — nothing was saved'
    const k = `${g}\u0000${r.person}\u0000${sharedKey(r)}`
    if (seen.has(k)) return `${nameOf(String(r.person))} is already on this input`
    seen.add(k)
  }
  return null
}
