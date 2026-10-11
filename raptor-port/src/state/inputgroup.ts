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

/* WHAT THE RECORDS OF ONE ENTRY SAY ALIKE, and the one comparable string of them — MOVED, unchanged, to the engine on
   11 Oct 26 (engine/inputentry.ts: the schedule's rows need the same test, and the engine may not import state/), and
   re-exported here, where every caller already finds them. */
import { SHARED_FIELDS, sharedKey } from '../engine/inputentry'
export { SHARED_FIELDS, sharedKey }

/* SINCE THE ONE-RULE BUILD (step 2 (g), 12 Oct 26 — owner D756: "an input is stored as ONE record with the list of its
   people") AN ENTRY IS ITS RECORD: a list of inputs IS the list of entries, and who is in one is the record's own list
   (engine/inputs.ts peopleOf). The three readers below answer that — each record its own entry — for the screens that
   still ask them, and go with the rest of the dead code in step 6 of that build. Records stored before it that carry a
   group id (`grp`) read as the one-person inputs they are (D759 reading 10: "old shared demo inputs come back as
   one-person inputs"); nothing is converted (D56). The check at the write that held a group honest is gone with the
   group: what one record may hold is engine/inputs.ts shapeProblem, held at the save boundary (state/store.ts). */
export interface InputEntry {
  /** always null now — kept for the callers that still read it */
  grp: string | null
  /** the entry's one record */
  rows: any[]
}

/** The list of inputs as ENTRIES — one a record, where it sits. */
export function entriesOf(inputs: readonly any[], _nameOf?: (pid: string) => string): InputEntry[] {
  return (inputs || []).filter(Boolean).map(r => ({ grp: null, rows: [r] }))
}
/** The records of the entry a record belongs to — itself. */
export function entryRowsOf(_inputs: readonly any[], r: any): any[] { return r ? [r] : [] }
/** The lines a list of requests is drawn as under Personal Inputs — one a record. */
export function entryLines(inputs: readonly any[]): any[][] { return (inputs || []).filter(Boolean).map(r => [r]) }
