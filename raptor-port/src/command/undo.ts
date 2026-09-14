// src/command/undo.ts
/* [ARCH-STACK] Step 2 (RC4) — the undo SEAM (designed + tested now; the undo BUTTON
   is step 3, spec §5). `inverseChanges` computes the inverse of a command's CAUSAL
   changes via the explicit inverse table:
     create → delete (of the created value)
     update → put (the previous value)
     delete → put (restore the deleted value)

   CRITICAL (review F1/INC1-001): undo must REFUSE when a later edit has touched any of
   the records, so it can never silently clobber someone else's change (spec §5). The
   precondition is a CONTENT check — each record must still hold exactly what the command
   left it — which also survives LIFO undo chains (a later undo mints a fresh version, so
   a pure version check would wrongly block undoing an earlier command). Only when every
   record still matches do we build the inverses, with baseVersion = the record's current
   version (the honest conflict precondition for the inverse commit). The store then
   assigns a fresh higher version on apply (RC4-306). Derived changes are NOT inverted:
   the undo is committed as a causal command, so the derivation hooks recompute the
   projected side to match the reverted causal state (spec §5/§6). Inverses are returned
   in reverse order so a multi-change command unwinds cleanly. */
import type { Change, RecordState } from './types'
import { sameContent } from './equal'

interface UndoView {
  read(collection: string, id: string): RecordState | null
  currentVersion(collection: string, id: string): number
}

export type InverseResult =
  | { changes: Change[] }
  | { blocked: { collection: string; id: string } }

export function inverseChanges(causal: Change[], view: UndoView): InverseResult {
  // Refuse if any record has changed since the command left it (F1).
  for (const ch of causal) {
    const cur = view.read(ch.collection, ch.id)
    const curDeleted = !cur || cur.deleted
    if (ch.op === 'delete') {
      if (!curDeleted) return { blocked: { collection: ch.collection, id: ch.id } }
    } else {
      if (curDeleted || !sameContent(cur!.value, ch.after)) return { blocked: { collection: ch.collection, id: ch.id } }
    }
  }

  const out: Change[] = []
  for (let i = causal.length - 1; i >= 0; i--) {
    const ch = causal[i]
    const baseVersion = view.currentVersion(ch.collection, ch.id)
    if (ch.op === 'delete') {
      out.push({ collection: ch.collection, id: ch.id, op: 'put', before: null, after: ch.before, baseVersion })
    } else if (ch.before === null) {
      out.push({ collection: ch.collection, id: ch.id, op: 'delete', before: ch.after, after: null, baseVersion })
    } else {
      out.push({ collection: ch.collection, id: ch.id, op: 'put', before: ch.after, after: ch.before, baseVersion })
    }
  }
  return { changes: out }
}
