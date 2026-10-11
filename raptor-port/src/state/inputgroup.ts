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
import { isUpchit, needsDoc } from '../engine/inputs'

/* WHAT THE RECORDS OF ONE ENTRY SAY ALIKE, and the one comparable string of them — MOVED, unchanged, to the engine on
   11 Oct 26 (engine/inputentry.ts: the schedule's rows need the same test, and the engine may not import state/), and
   re-exported here, where every caller already finds them. */
import { SHARED_FIELDS, sharedKey } from '../engine/inputentry'
export { SHARED_FIELDS, sharedKey }

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
    /* A MEDICAL ENTRY OR AN UPCHIT IS NEVER PART OF A GROUP — each man's needs his own document, his own clash question
       and his own summary (D655 reading 4). That was held on screen and at the group's save only: two men of a shared
       meeting, each retyped separately into the same medical kind, kept their group fields and read as ONE shared
       medical entry again (Astra's read of the calendar job's bug check, 8 Oct 26 — R5). Held HERE, the one place a
       group is worked out, so every reader agrees whatever a record carries. */
    if (r.grp == null || r.grp === '' || needsDoc(r.type) || isUpchit(r.type)) { out.push({ grp: null, rows: [r] }); continue }
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

/** The records of the entry a record belongs to — itself alone for an ordinary input (and for a record that has left
 *  its group by being changed alone). The editor, a dragged bar and a day's line all ask this one function. */
export function entryRowsOf(inputs: readonly any[], r: any): any[] {
  if (!r) return []
  if (r.grp == null || r.grp === '') return [r]
  return entriesOf(inputs).find(e => e.rows.includes(r))?.rows || [r]
}

/** THE LINES A LIST OF REQUESTS IS DRAWN AS UNDER PERSONAL INPUTS ([GROUP-INPUT-ONE-ROW], owner D661; the plan
 *  docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.3). An entry of several is ONE line — SPLIT BY WHERE
 *  EACH MAN'S REQUEST IS FILED (on the programme, taken off, not yet acted on), so a line never claims "accepted" for
 *  a man who is not, and its one Undo / Accept is true of everyone on it. Each line is its records, A to Z (entriesOf's
 *  order), where its first record sits; an ordinary input is a line of one. */
export function entryLines(inputs: readonly any[]): any[][] {
  const out: any[][] = []
  for (const e of entriesOf(inputs)) {
    if (e.rows.length < 2) { out.push(e.rows); continue }
    const by = new Map<string, any[]>()
    for (const r of e.rows) { const k = String(r.acc || ''); if (!by.has(k)) { by.set(k, []); out.push(by.get(k)!) } by.get(k)!.push(r) }
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
