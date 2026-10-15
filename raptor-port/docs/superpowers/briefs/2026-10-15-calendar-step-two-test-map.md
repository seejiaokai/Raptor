# Calendar step two — how a test of an old calendar is re-expressed on the new one (15 Oct 26)

A working note for `[ONE-DATE-CALENDAR]` step two (D901): the three older small calendars now draw the app's one date
calendar (`src/ui/DateCal.tsx`), and every test that drove them is re-expressed here — **never weakened**: each test
keeps checking the same behaviour; only how it finds the controls changes. Where a behaviour itself changed by his
ruling (D901: no Clear but the bidding dates; today shown; one size), the test is changed to pin the NEW behaviour and
says so in a short comment naming D901.

## The new calendar's parts (any calendar, test-id prefix `T`)
| Part | How to find it | Notes |
|---|---|---|
| the calendar | `[data-testid="T"]` | `data-month="yyyy-mm"` = the month shown; `data-today`, `data-min`, `data-max` |
| a date | `[data-testid="T-day-<iso>"]`, or `button[data-iso="<iso>"]` | a `<button>`; `disabled` outside min / max; aria-label "Tue 14 Jul 2026" (+ ", picked" / ", today") |
| the month title | `[data-testid="T-title"]` | text "July 2026" followed by a small arrow (› or ▾) — match with a regex, or read `data-month` |
| previous / next month | `[data-testid="T-prev"]`, `[data-testid="T-next"]` | aria-label "Previous month" / "Next month"; not drawn while the month-and-year lists are open |
| the Today icon | `[data-testid="T-today"]` | aria-label "Go to today"; goes to today's MONTH and picks nothing — except in "Jump to a date", where it picks today |
| weekday row | `[data-testid="T-dow"]` | MON TUE WED THU FRI SAT SUN |
| the words under it | `[data-testid="T-foot"]` | only where the form gives words |
| the places | `.dcal-grid` holds 42: date buttons `.dcal-d` and blanks `span.dcal-d.is-blank` | six rows always |
| marks on a date | classes | `is-sel` = picked (one date; or BOTH ends of a run, a one-day run's single date); `is-in` = in a run of two days or more (with `is-from`, `is-to`, `is-mid`); `is-today`; `is-we` = Sat/Sun; `is-out` = may not be picked |
| aria-pressed | on a date | true ONLY on a picked date / a run's two ends — no longer on the days between (use `is-in` for those) |

Its rules: one date — a tap picks. A run — a tap on a new day starts a finished run over; a run of one day stretches
forward on the next tap; a tap before the start starts over there. Today = the real date unless the place passes its own.

## The Leave War's range calendar (`leavewar/ui/RangePicker.tsx`, testid `T` — span, war, window, event, oilrange, holcal)
| Old | New |
|---|---|
| `T-picker` | `T-picker` (unchanged — the wrapper) |
| `T-day-<iso>` | `T-day-<iso>` (unchanged) — but `aria-pressed` is true only on the two ends; a middle day: class `is-in` |
| `T-prev-month` / `T-next-month` | `T-prev` / `T-next` |
| `T-month` text "OCTOBER 2026" | `T-title` text matches `/October\s+2026/i`, or `T`'s `data-month` = "2026-10" |
| `T-selection` | `T-selection` (unchanged words: "Pick a start date", "9 Nov – 11 Nov") |
| `T-clear` "Clear" | ONLY `window-clear` (the bidding dates), text "Clear dates". Everywhere else there is no Clear (D901): a test that cleared a run re-expresses "start again" as a tap on a new day, and a test that pinned Clear now pins its ABSENCE |
| `.rpick-grid .rday/.rblank`, `.rdow` "M T W …" | `.dcal-grid .dcal-d` (42), `T-dow` "MON…SUN" |
| `compact` | gone — one size |
| opens on `value.from`, else `anchor`, else `min` | the same |

## An input's dates and the Inputs list's dates (`ui/RangeCal.tsx`, idPrefix `P` — inpEd, inRange)
| Old | New |
|---|---|
| `#PCal` | `#PCal` (unchanged — the wrapper's id) |
| `#PCal [data-cal="<iso>"]` / `button[data-cal=…]` | `#PCal [data-iso="<iso>"]` (or `[data-testid="PCal-day-<iso>"]`) |
| `.rc-nav[aria-label="Previous month"]` | `[data-testid="PCal-prev"]` (same aria-label) |
| `.rc-mon` "Jul 2026" | `[data-testid="PCal-title"]` matches `/July\s+2026/`, or `[data-testid="PCal"]`'s `data-month` |
| `.rc-today` | `[data-testid="PCal-today"]` (aria-label "Go to today"; goes to the month, picks nothing) |
| `.rc-d.s` / `.rc-d.e` | `.dcal-d.is-sel` (a range waiting for its end shows its start `is-sel`) |
| `.rc-d.mid` | `.dcal-d.is-mid` (`is-in` on every day of the run) |
| `.rc-d.today` | `.dcal-d.is-today` (the planning day, 13 Jul 2026) |
| `.rc-d.wk` | `.dcal-d.is-we` |
| `.rc-read` | unchanged — it is the form's own line, outside the calendar |
| behaviour | unchanged: (start, '') waits for its end; a finished range — one day too — starts over on the next tap |

## "Jump to a date" (`ui/WeekCal.tsx`, testid `wcal`)
| Old | New |
|---|---|
| `#weekCal`, `.weekcal-hint`, `.airpop-head .x` | unchanged |
| `[data-wcal="<iso>"]` | `[data-testid="wcal-day-<iso>"]` |
| `.rc-d.sel` + `aria-current="date"` (the day looked at) | `.dcal-d.is-sel` + `aria-pressed="true"` |
| `.rc-d.today` | `.dcal-d.is-today` |
| `.rc-nav` (first = previous) | `[data-testid="wcal-prev"]` / `wcal-next` (`.dcal-nav`); focus goes to `.dcal-nav` (previous month) as it opens |
| `.rc-mon` | `[data-testid="wcal-title"]` |
| `.airpop-head .wc-today` (picks today and closes) | `[data-testid="wcal-today"]` in the calendar's head — still picks today and closes; there is no Today icon in the window's head any more |

## The date of an OIL credit (`leavewar/ui/CreditForm.tsx` DayChip — testids `oil-date`, `oil-edit-date`)
| Old | New |
|---|---|
| a chip "📅 15 Oct ▾" that opened the range calendar under it | the app's date box (`ui/DateBox.tsx`): a button reading "15 Oct 2026", `data-value="2026-10-15"` |
| `oildate-day-<iso>` / `oileditdate-day-<iso>` | after a click on the box: `dcal-day-<iso>` (the calendar floats on the page, inside `dcal-card`); a pick closes it; `dcal-scrim` closes without a pick |
