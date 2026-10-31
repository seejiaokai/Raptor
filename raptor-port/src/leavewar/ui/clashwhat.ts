// The words of a sync clash, as the grid bar's clash strip and the phone's clash note say them (ui/Chrome.tsx). Kept
// out of Chrome.tsx so that file exports only components (React Doctor's only-export-components, D1534).

import type { SyncClash } from '../sync'

/** What clashes, as a sentence — today's words less the name and the date, which stand beside it (D825: every key word
 *  kept). Where the leave in the way is one the war APPROVED the sentence says so (r7-19): it is why the instruction is
 *  to change the approved leave rather than decide a bid. */
export function clashWhat(c: SyncClash): string {
  /* each code as the grid's box draws it ([LW-HALF-DAY-WORDS-LEFT] — sync.ts clashCodeShown), the stored one only where a
     clash was built without it */
  const held = `${c.wayOut === 'war' ? 'approved ' : ''}${c.bidShown ?? c.bidCode}`
  return c.kind === 'duty'
    ? `Weekend/PH work earns ${c.inputShown ?? c.inputCode}, but the day holds ${held}`
    : `The input is ${c.inputShown ?? c.inputCode}, but the bid is ${held}`
}
