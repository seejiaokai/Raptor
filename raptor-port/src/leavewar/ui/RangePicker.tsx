// One calendar, two taps: the start, then the end, with the days between
// filling in as you go.
//
// The owner asked for this twice in the same message — once for leave ("so I
// don't need to keep clicking a leave input like for 2 weeks continuous") and
// once for creating a leave war ("instead of clicking 2 calendars for start
// and end date"). Both are the same control, so it is written once and used
// wherever the Leave War picks a run of dates: a leave bid, a new war, the
// bidding dates, an event's dates, the OIL tracker's range, and the holiday
// form in the Calendar window.
//
// SINCE STEP TWO OF THE APP'S ONE DATE CALENDAR (owner D901, 15 Oct 26 —
// "Proceed Calendar Step Two page as recommended") it IS that calendar
// (ui/DateCal.tsx — D796), drawn inside its form (D797): its month-and-year
// lists, its Today icon, the swipe, finger-sized dates in six rows, Monday
// first. What stays this file's is what the Leave War's forms want of it —
// the run handed over as `{ from, to }` (null for none), the run said in the
// war's own words beneath, and, for the bidding dates alone, a small "Clear
// dates": there no dates means "Open the whole year" (D901 (1)); every other
// form starts its run over with a tap on a new day, as everywhere else (D796).
// Today is shown, as on every calendar of the app (D901 (2)) — it opens on the
// run, else `anchor`, else `min`, never on a today the war may not cover.
// One size everywhere, a finger's (D901 (3)): the old `compact` grid is gone.

import { DateCal } from '../../ui/DateCal'
import { shortSpan } from './dates'

export interface Range {
  from: string
  to: string
}

export function RangePicker({
  min,
  max,
  anchor,
  value,
  onChange,
  testid = 'range',
  clear = false,
}: {
  /** Earliest selectable date, inclusive. Days before it are shown but dead. */
  min?: string
  /** Latest selectable date, inclusive. */
  max?: string
  /** Which month to open on when nothing is selected yet. Separate from
   *  `min` because the useful opening month is not always the earliest legal
   *  one — a new leave war may legally start in the past, but the month worth
   *  showing is the one after the last war ends. */
  anchor?: string
  value: Range | null
  onChange: (range: Range | null) => void
  testid?: string
  /** A small "Clear dates" under the calendar — the bidding dates only, where
   *  no dates is an answer of its own (D901 (1)). */
  clear?: boolean
}) {
  return (
    <div className="dcal-inline lw-cal" data-testid={`${testid}-picker`}>
      <DateCal
        mode="run"
        tid={testid}
        from={value?.from || ''}
        to={value?.to || ''}
        min={min}
        max={max}
        at={anchor ?? min}
        onRun={(from, to) => onChange({ from, to })}
        foot={
          <>
            {/* The chosen span in words. The grid shows it too, but a person
                about to commit a fortnight of leave should be able to read back
                what they picked without counting squares. */}
            <span data-testid={`${testid}-selection`}>{value ? shortSpan(value.from, value.to) : 'Pick a start date'}</span>
            {clear && value && (
              <button type="button" className="dcal-clear" data-testid={`${testid}-clear`} onClick={() => onChange(null)}>
                Clear dates
              </button>
            )}
          </>
        }
      />
    </div>
  )
}
