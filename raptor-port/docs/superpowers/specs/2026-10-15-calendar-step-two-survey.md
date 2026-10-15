# Calendar step two — what the three old small calendars do, place by place (survey, the night of 15 Oct 26)

A read-only survey for `[ONE-DATE-CALENDAR]` step two (D796, D797, D889), made by a helper and checked by the host, so
step two's questions to him ask only what the design of record (`2026-10-13-one-date-calendar.md`) leaves open. Paths
under `raptor-port/src/`.

## The three calendars on their own
- **RangePicker** (`leavewar/ui/RangePicker.tsx`): a finished run starts over; a tap earlier than the start starts over
  there (DateCal's `mode="run"` keeps both). Marks: weekend shading; days outside `min`/`max` disabled and faint; the run
  filled with stronger ends. **No today, on purpose** (84–86). Six rows. Footer: the run in words or "Pick a start date",
  and **Clear** (sets null). Props `min`, `max`, `anchor`, `value`, `onChange`, `testid`, `compact`.
- **RangeCal** (`ui/RangeCal.tsx`, an input's own window; also the Inputs list's date filter): a run in progress has an
  EMPTY end (`(start, '')`), not start = end. Marks: ends filled, middle tinted, weekend greyed; today = the app's fixed
  planning day, a ring. Its Today button moves the month only. No min/max, no Clear, no footer; rows end with the month.
- **WeekCal** (`ui/WeekCal.tsx`, "Jump to a date"): one day — loads its week and lands on the day (schedule or board).
  Marks: the day looked at (`.sel`), today (planning day) a ring, weekend greyed. **No highlighted week** (the CSS: "a
  single day is lit, not a row" — `raptor-port/CLAUDE.md`'s "whole-week highlight" line is out of date). A pop-up with ✕,
  Escape, a click outside, focus to the month arrow on open, the hint "Tap any day to go to it." **Its Today button picks
  today and closes.**

## The places
| Place | For | Marks beyond picked / today | Extra controls, taps | Props |
|---|---|---|---|---|
| `leavewar/ui/BidPicker.tsx:414` | a leave bid's span (run) | the war's dates as min/max; weekend | "Just this day / Pick a range" (386–406); a run seeded `{date,date}`; Clear; words | `min`, `max` |
| `leavewar/ui/WarSheet.tsx:112` | a new war's dates (run) | weekend | Create, a note; Clear; words | `anchor=nextFreeDay()` |
| `leavewar/ui/Chrome.tsx:202` | the bidding dates (run) | the period as min/max; weekend | **Clear matters**: null turns the button to "Open the whole year" (213) | `min`, `max` |
| `leavewar/ui/EventSheet.tsx:467` | an event's dates (run) | the period as min/max; weekend | "This day / A range"; "One merged bar / Repeat each day"; seeded from a band or a drag | `compact`, `min`, `max` |
| `leavewar/ui/OilTracker.tsx:655` | a report's range (run) | weekend | a range chip, Done, Clear, zoom beside it | `compact`, `anchor=today` |
| `leavewar/ui/CreditForm.tsx:35` (DayChip; also `OilTracker.tsx:506`) | an OIL credit's date — ONE date, faked from a run | weekend | a chip opens it as a pop-up; a pick closes it | `compact`, `anchor` |
| `ui/HolidaysPanel.tsx:244` | a holiday's dates (run) | weekend; existing holidays NOT marked | Clear; words; remounted by `key` to move its month | `compact`, `anchor` |
| `ui/inputedit.tsx:2839` | an input's own dates (run) | weekend; planning-day ring | "pick a start date" read-out; **`midPick`** (2226, 2840): on a saved input the first tap starts a new run, not stretch the old; bigger phone days (D725) | `idPrefix="inpEd"` |
| `ui/InputsPage.tsx:615` (not on the design's list) | the Inputs list's date window (run) | as above | "→ pick an end date / showing every date", presets (lookahead, All), admin pencil | `idPrefix="inRange"` |
| `ui/WeekCal.tsx` (from `Shell.tsx:687`) | jump to a day (one) | the day looked at; weekend | Today picks and closes; ✕; Escape; outside; hint; focus | `'board'` / `'view'` |

No caller draws existing leave, holidays, events or a weekday emphasis on these calendars.

## What DateCal (`ui/DateCal.tsx:134–161`) already has, and what it lacks
Has: `mode` one / run; `markWd`; `min`/`max` (faint, disabled, the keyboard skips them); `at` (the month to open on —
read once, so HolidaysPanel still needs its remount); `today` (defaults to the real date — pass the planning day for
RangeCal's and WeekCal's places); `tid`; `foot`; always weekend greyed, six rows, month/year lists, a Today icon that
moves the month, the swipe, the keyboard, a run across months. Already a run in `ui/AdminPage.tsx:106`.
**Lacks:** **Clear** (needed by Chrome; used by five others); a `compact` size; a **Today that picks** (WeekCal's);
**"the first tap starts a new run" on a saved run** (inputedit's `midPick`); RangeCal's empty-end run shape (callers to
translate, with their "pick an end date" read-outs). **A visible change:** RangePicker's places never showed today; DateCal
does.

## Test ids that change
RangePicker's `-prev-month`, `-selection`, `-clear`, `-picker`; RangeCal's `#inRangeCal` / `#inpEdCal [data-cal=…]`; DateCal
uses `${tid}-day-${iso}`, `-prev`, `data-iso`. **A fourth near-copy:** `ui/OilConfirm.tsx` (RangeCal's grid with its own
off and "ask" marks, `14-input-editors.css:240–245`) — outside step two, worth listing.
