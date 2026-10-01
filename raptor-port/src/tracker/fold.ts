// src/tracker/fold.ts
/* THE TRACKER'S ONE-TIME CONVERSION AT BOOT — the fold's eighth and last converter ([DB-READINESS] group A, phase 5b;
   plan §2.6; owner D462, D464). A browser holding the Tracker's old whole-list records — the course list, each course
   and chart's student list, the chart records — has them turned into one row per course, enrolment, chart and ball's
   details, ONCE, inside the fold's one all-or-nothing group, before anything reads the store. The conversion itself is
   `foldTracker` in app/rows.js — the same one the Tracker's storage door uses — so the two cannot drift apart. It carries
   every chart, its layout and every ball's details across (D464: his work, kept — a layout is already one record per
   chart and is not touched at all); a record it cannot split (a list of bare names from before the ids) is left exactly
   as it is, and the Tracker reads it as it always did.

   Registered here, by the app's boot (src/boot.ts imports this file), not by the Tracker's own code: the Tracker's
   screen is a lazy chunk that has not loaded when the fold runs, and this file imports only the small pure module —
   never core.js. With it, the manifest is complete: the store's format becomes 6 (storage/fold.ts). */
import { registerConverter, type Converter } from '../storage/fold'
import type { Entry } from '../storage/backend'
import { foldTracker } from './app/rows.js'

export const trackerConverter: Converter = {
  name: 'tracker',
  collections: ['tracker'],
  convert(snap): Entry[] {
    return foldTracker((snap as any).tracker ?? {}).map((e: { id: string; value: string | null }) => ({ collection: 'tracker', id: e.id, value: e.value }))
  },
}
registerConverter(trackerConverter)
