// src/command/undo.ts
/* [ARCH-STACK] Step 2 (RC4) — the undo SEAM (designed + tested now; the undo
   BUTTON is step 3, spec §5). `inverseChanges` computes the inverse of a command's
   CAUSAL changes via the explicit inverse table:
     create → delete (of the created value)
     update → put (the previous value)
     delete → put (restore the deleted value)
   In every case the precondition (baseVersion) is the record's CURRENT version at
   undo time, never the original — so a stale reversal can never pass the conflict
   gate and silently clobber a later edit (RC4-306/CMD-009). The store then assigns
   a FRESH higher version on apply. Derived changes are NOT inverted here: the undo
   is committed as a causal command, so the derivation hooks recompute the projected
   side to match the reverted causal state (spec §5/§6). Inverses are returned in
   reverse order so a multi-change command unwinds cleanly. */
import type { Change } from './types'

interface VersionLookup { currentVersion(collection: string, id: string): number }

export function inverseChanges(causal: Change[], view: VersionLookup): Change[] {
  const out: Change[] = []
  // reverse order: undo the last causal change first
  for (let i = causal.length - 1; i >= 0; i--) {
    const ch = causal[i]
    const baseVersion = view.currentVersion(ch.collection, ch.id)
    if (ch.op === 'delete') {
      // restore the value that was deleted
      out.push({ collection: ch.collection, id: ch.id, op: 'put', before: null, after: ch.before, baseVersion })
    } else if (ch.before === null) {
      // create -> delete the created value
      out.push({ collection: ch.collection, id: ch.id, op: 'delete', before: ch.after, after: null, baseVersion })
    } else {
      // update -> put the previous value back
      out.push({ collection: ch.collection, id: ch.id, op: 'put', before: ch.after, after: ch.before, baseVersion })
    }
  }
  return out
}
