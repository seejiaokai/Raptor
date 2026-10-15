/* The inputs date picker: ONE calendar that takes a range in two clicks
   (owner, Aug 26) instead of two separate <input type=date> boxes — in an
   input's own window, and as the Inputs list's window of dates.

   First click sets the start and clears any end. Second click sets the end —
   unless it lands BEFORE the start, which cannot be a range, so that earlier
   date becomes the new start and the picker waits for an end again. A third
   click always begins a fresh range, so the box never gets stuck needing a
   reset. Values stay in the yyyy-mm-dd strings the page already speaks, so
   the add/edit paths are unchanged; a range waiting for its end is (start, '').

   SINCE STEP TWO OF THE APP'S ONE DATE CALENDAR (owner D901, 15 Oct 26) it IS
   that calendar (ui/DateCal.tsx — D796), drawn inside its form (D797). The
   rules above are kept as they were (D901: "on a saved input your first tap
   still starts new dates, never stretches the old ones"): a range with both
   ends is FINISHED — one day included — so the next tap begins anew, where the
   one calendar would stretch a run of one day. Today is the app's planning day
   (weeknav.TODAY), as it was here; its icon goes to today's month and picks
   nothing, so a range being built or a filter is never wiped by it. */
import { DateCal } from './DateCal'
import { TODAY, keyToIso } from './weeknav'

/* the demo week is Jul 2026, so an untouched picker opens where the data is */
const DEFAULT_AT = '2026-07-01'

export function RangeCal({ start, end, onPick, idPrefix }:
  { start: string, end: string, onPick: (s: string, e: string) => void, idPrefix?: string }) {
  const tid = (idPrefix || 'range') + 'Cal'
  return (
    <div className="dcal-inline in-cal" id={idPrefix ? tid : undefined}>
      <DateCal mode="run" tid={tid} from={start} to={end || start} finished={!!(start && end)}
        at={start || end || DEFAULT_AT} today={keyToIso(TODAY)}
        onRun={(f, t) => {
          /* the one calendar began a new run (a finished range, or a tap before the start): it waits for its end */
          if (!start || end || f < start) onPick(f, '')
          else onPick(f, t)
        }} />
    </div>
  )
}
