# The app's one date calendar, and the Calendar window on a phone — the design of record (13 Oct 26)

**Rulings:** D786 (the swipe; the From box must fit), D795 (the swipe's feel; any date, the weekday standing out), D796 (ONE
calendar of the app's own, on the iPhone calendar's pattern in the Raptor look), D797 (where it sits; Monday; two steps).
**Step two may start (D889, 15 Oct 26):** he has looked at step one, live since 13 Oct 26, and is happy with it as built — D800's wait is met;
step two begins with its questions and pictures put to him.
Open each full row before acting on its detail (`grep -h '^| D797 |' .claude/decisions-full/*.md`).
**Backlog:** `OUTSTANDING.md` `[ONE-DATE-CALENDAR]`, `[CAL-PHONE-SWIPE-FIT]`. **Branch:** `claude/cal-phone-swipe-fit-2affa0`.
**The pictures he approved:** `docs/mock/cal-swipe-fit.html` (pictures `docs/mock/2026-10-13-cal-swipe-fit/one-*` and
`p390-6`, `p390-7`). The drawn calendar's exact styles and markup are the `CSS` block and `window.mxCal` of
`scripts/handpass/calone-mock.mjs` — build from them; they are a drawing, not app code.

## Why (what the reading found)

- The "Every <weekday>" From box is the phone's own date box. It was given "fit" rules on 8 Oct 26 and still ran off his
  iPhone on 13 Oct: an iPhone gives that box a width of its own, and no Windows browser reproduces it (Chromium at 390 and
  320 wide: nothing passes the window's edge). So nothing of the phone's own is left in a date box — that is the fit.
- The app picks a date in about fifteen places with FOUR different controls: the phone's own box (ten boxes), the Leave
  War's range calendar (`leavewar/ui/RangePicker.tsx` — seven places and the holiday form), the calendar in an input's own
  window (`ui/RangeCal.tsx`), and the schedule's "Jump to a date" (`ui/WeekCal.tsx`).
- The Inputs calendar and the SANS calendar already swipe between months (`ui/calpick.ts` `SWIPE_MIN` 50px; the new month
  slides in 28px over 240ms — `ui/SansCal.tsx`). The Calendar window copies that feel.

## The calendar (D796)

- **Head:** the month and year as a title ("November 2026", 17px, heavy) with a small accent arrow — a tap swaps the dates
  for the month-and-year lists and the title turns accent; a tap again brings the dates back. Right of the year, the
  **Today icon** — the page with today's number, the one "Jump to a date" already has (`.wc-today`, `.wc-pg`, `.wc-n`).
  At the far right two arrows, 40px, previous and next month (not drawn while the lists are open). The title has a fixed
  room so the Today icon and the arrows never move as month names change length (the standing "a control tapped
  repeatedly must not move" rule).
- **Weekdays:** MON … SUN, Monday first (D797), small heavy capitals in the quiet ink.
- **Dates:** no boxes — the number in a 38px round disc inside a 44px-tall place (a finger's size); SIX rows always, so
  nothing below hops as months change. A Saturday and a Sunday in the quiet ink. **Today** on a soft accent disc, its
  number accent. **The picked date** on the full accent disc, dark number. A date that may not be picked is faint.
- **A weekday that stands out** ("Every Thursday" — D795): its heading accent, its dates heavy and full ink, the other
  dates lighter. Any date may still be picked.
- **A run:** the first and last day full accent discs, the days between on a soft accent band joining them; the run said
  in words beneath, as each form says it today. No "Clear": a tap on a new day starts the run over (D796 — no Reset).
- **The month-and-year lists:** months beside years, each SCROLLED (a finger, a mouse wheel, or a tap on a row), 44px rows,
  the chosen pair in a band across the middle, the rows fading away from it. Years have no end either way (a posting may
  be years back or ahead — owner, 19 Aug 26).
- **No tick:** a tap on a date picks it.

## Where it sits (D797)

- **Over the form — a date that is one box among others.** The box reads the date in words ("Thu 5 Nov 2026"; "Pick a
  date" when empty). A tap opens the calendar as a card over the page with the page dimmed behind it — centred on a phone
  (`min(350px, 100vw − 24px)`), a small panel right under the box on a desktop. A tap on a date picks and closes; a tap
  outside closes and changes nothing (the standing click-outside rule). Places: "Every <weekday>" From and Until's "A
  date"; a new person's Post in (Add a person, Restore, giving access); Admin → Data's "Older than" and "A specific date";
  a medical input's upchit date; the Leave War's "PO from" and "PI from" (four boxes); the date of an OIL credit given by
  hand (it opens over its form today, on the range calendar bent to one day).
- **Inside the form — the dates are what the form is for.** The calendar is the form's own body; two taps make the run.
  Places: a leave bid's "Pick a range", a new leave period, the bidding dates, an event's dates, a holiday's dates, an
  input's own dates, the OIL tracker's range — and Admin → Data's "A date range" (two boxes today → one run calendar,
  shown only in that mode).
- **Its own window, as now:** "Jump to a date".
- **Not this:** the months that are pages of their own (the Inputs calendar, the SANS calendar, the Calendar window's month).

## The swipe (D786, D795)

A sideways finger on the Calendar window's month turns the month; on the Holidays list, the year. Left = the next, right =
the last; 50px and more sideways than up-and-down; the new one slides in from that side (not under reduced motion). It
works anywhere on the part — the empty room under a short month or list included — and a swipe that begins on a date's
button turns the page and presses nothing. The arrows and "Today" stay. Touch only: a mouse is untouched.

## The two steps (D797)

**STEP ONE (to build now):** the swipe; the calendar and its box; every date box that is still the phone's own — "Every
<weekday>" (`ui/EveryWeekday.tsx`), Post in (`ui/UsersPanel.tsx`, three places), Admin's dates with its range
(`ui/AdminPage.tsx`), the upchit date (`ui/inputedit.tsx`), the Leave War's four posting dates
(`leavewar/ui/BidPicker.tsx`). Its own "merge live".
**STEP TWO (after):** the places that draw one of the three small calendars today — `RangePicker`'s users (`BidPicker`,
`WarSheet`, `Chrome`, `EventSheet`, `OilTracker`, `CreditForm`'s date, `ui/HolidaysPanel.tsx`), `ui/RangeCal.tsx` in an
input's window, `ui/WeekCal.tsx`. A bug check of its own: leave bids, periods and OIL credits are picked through them.

## Notes for the build (the agent's own calls — technical)

- ONE calendar component with two modes (one date; a run) used in two placements; the box and its floating layer a second
  small component. Values stay the `yyyy-mm-dd` strings every writer already takes — no stored shape changes.
- The floating layer must sit above every surface it can open over: the windows shell (`ui/FloatWindow.tsx` — the Calendar
  window and "Every <weekday>"), the Admin page, the Leave War's day sheet, the input's window. Bug-check order §6: name each
  and give each a browser test that the element at the calendar's centre is the calendar.
- The Leave War's stylesheet is scoped under `#page-leavewar` (and `.hol-cal`); the new calendar's styles must reach it
  there without editing the scheduler's sheet for a Leave War bleed (the note at the head of `leavewar/ui/rangepicker.css`).
- The swipe: touch events (touchstart / touchend) on the element holding the two parts, `touch-action:pan-y` on it so the
  browser never takes a sideways move; on a screen wide enough for both parts the part under the finger decides month or
  year. The click that could follow a swipe is swallowed once. `ui/FloatWindow.tsx` already leaves sideways moves alone.
  On a phone the parts must reach the window's foot, or the empty room under a short list is not part of them.
- "Today": the date boxes use the real date (`ui/daysfmt.ts isoToday`); "Jump to a date" uses the schedule's fixed
  planning day — step two decides nothing about that; keep each as it is.
- Tests that type into a date box are re-expressed to open the calendar and tap a date (never weakened):
  `src/ui/everyweekday.test.tsx`, `e2e/leavewar.spec.ts` (the "Every …" window's block, and every `po-date` /
  `postout-date` / `pi-date` / `postin-date` fill), and whatever fills `accAddPostIn`, `admWipeDate`, `admLogDate`,
  `inpEditUpDate` — search before building.

## Step two's answers (D901, 15 Oct 26 — "Proceed Calendar Step Two page as recommended")

No Clear but the bidding dates' small "Clear dates"; today shown on the Leave War's calendars too; one finger-sized date everywhere (smaller only if a sheet would not fit his iPhone, shown first); the Inputs list's date filter moves in step two too. The page and its pictures: `raptor-port/docs/mock/2026-10-15-calendar-step-two/`; what each place does today and what DateCal still lacks (Clear, a Today that picks for "Jump to a date", the saved input's first-tap rule, RangeCal's empty-end shape, test ids): `2026-10-15-calendar-step-two-survey.md`.

## Told to him, and still to tell him

Told: a run's "Clear" goes; a tap outside closes; the date field is the same on a desktop. **Still to tell him (the agent's
readings):** the Today icon goes to today's month and does not pick today (in "Jump to a date" it goes to today, as now);
Escape closes an open floating calendar first, and the window behind it only on a second press; the holiday form's dates
move in step two (they are on the Leave War's calendar), not step one.

## The Tracker's date boxes (D801 — a tap picks, no tick), and the calendar's own swipe (D800)

Found reading the code for step one, 13 Oct 26: the Tracker has three date boxes that were still the phone's own — a date on a
course (`tracker/components/DateBox.jsx`), and "Done on" and "Failed on" in the marking pop-up (`tracker/components/Pop.jsx`).
The design had never named the Tracker. That evening he noted that a tick to confirm might suit the Tracker, at the top to
save space (D798); asked what was recommended, he took it — **D801: the app's own date box, a tap picks, no tick; the pop-up
stays open and the box reads the date in words.** His tick at the top right of the calendar's head stays the fallback, for
the Tracker alone, if a tap proves too easy to get wrong. Built that night on step one's branch.

**D800, the same answer:** a sideways finger on the new calendar's dates turns its month, as in the Calendar window — built
into step one; and step two is not started until he has looked at step one.

**And a fifth Leave War date box** the list above missed: "PO from" on the panel for a dragged block of one person's days
(`leavewar/ui/SelectSheet.tsx`). It is the same kind as the four named — built in step one.

## The check (step one)

**Tier WALK** by the order's eight questions: no OIL or pay (the boxes hand on the same date string; the calculations are
not touched), no published record, no saved shape, no roles, no warning; YES to a shared drawer (one calendar in many
places), a new gesture (the swipe, the box) and a new surface (the floating calendar). Then a fresh, blind Opus read of the
finished code (D790 — not Fable's kind of change), the gates under the PC's lock, and **his look on his own iPhone**, which
alone proves the fit, the swipe under a real finger and the scrolled lists (bug-check order §7.9).
