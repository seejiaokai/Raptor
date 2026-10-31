// Whether a person's row rides the months on screen — the grid's test (ui/Matrix.tsx), which the Balances page and the
// Settings window's Reset read too. Moved whole out of Matrix.tsx on 31 Oct 26, so that file exports only components
// (React Doctor's only-export-components, D1534).

import type { Person } from '../engine'
import type { RecordSpans } from '../state/merge'

/** Whether a person's row rides the roster for a visible month window
 *  ('yyyy-mm|yyyy-mm', or '' meaning no measurement → everyone).
 *
 *  A posted-out person rides every month up to and including the one holding
 *  their last day and drops off after it (owner, 19 Aug 26 — "once I hit the
 *  next month… the row disappears"); a late joiner mirrors it at the other
 *  end. Month granularity on purpose: scrolling inside a month never
 *  reshuffles the rows, only crossing a boundary does.
 *
 *  …AND the row stretches to reach anything the war shows for them outside
 *  those dates (owner, 20 Sep 26 — records may be dated before someone posts
 *  in and after they post out, "because those dates are official dates. But
 *  they can be for e.g still taking leave after or before they post in or
 *  out"). Without it a man posted out in January with clearing leave in
 *  September was charged for that leave and could not be seen — the money and
 *  the screen disagreed. `spans` is merge.ts's per-merge map, so this stays a
 *  lookup; it is a DISPLAY span only, and his own dates — which is what every
 *  manning count reads — are untouched. This narrows the 19 Aug rule above
 *  rather than reversing it: a row with nothing out there still disappears
 *  exactly as it did. */
export function rowInWindow(p: Person, win: string, spans?: RecordSpans): boolean {
  if (!win) return true
  const [first, last] = win.split('|')
  const span = spans?.get(p.id)
  const endsAt = p.to === null ? null
    : span && span.last > p.to.slice(0, 7) ? span.last : p.to.slice(0, 7)
  const startsAt = p.from === null ? null
    : span && span.first < p.from.slice(0, 7) ? span.first : p.from.slice(0, 7)
  /* D320 ([ONE-DOOR], 27 Sep 26): an earlier stint shows his row too — a leave period that holds one of his stints
     shows him, one he was away for the whole of (and holding no record of his) does not */
  const inPast = !!p.past && p.past.some(s => s.to.slice(0, 7) >= first! && (s.from === null || s.from.slice(0, 7) <= last!))
  if (endsAt !== null && endsAt < first!) return inPast
  if (startsAt !== null && startsAt > last!) return inPast
  return true
}
