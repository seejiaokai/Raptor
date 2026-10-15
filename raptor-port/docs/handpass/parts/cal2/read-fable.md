# Code read — calendar step two (D901) and the four edge drags (D900) — Fable 5.1, blind, 15 Oct 26

Read: the evidence sheet (`docs/handpass/2026-10-15-calendar-step-two.md`, whole), the two design notes (§"Step two's
answers"; the survey), then `git diff 6bedaec29..HEAD -- raptor-port/src` — the non-test files first, then the tests — and,
whole, the files each date passes through on its way to a writer: `ui/DateCal.tsx`, `ui/DateBox.tsx`, `ui/edgescroll.ts`,
`ui/RangeCal.tsx`, `leavewar/ui/RangePicker.tsx`, `leavewar/ui/CreditForm.tsx`, and the consuming slices of
`BidPicker.tsx`, `WarSheet.tsx`, `Chrome.tsx` (WindowSheet), `EventSheet.tsx`, `OilTracker.tsx`, `BalanceBar.tsx`,
`Matrix.tsx` (the figures bar's press and Escape guards), `ui/HolidaysPanel.tsx`, `ui/inputedit.tsx` (`datesHere`,
`midPick`, `calKey`, `datesPicked`, the clash door), `ui/InputsPage.tsx`, `ui/WeekCal.tsx`, `ui/SansCal.tsx` with
`ui/calpick.ts`, `ui/sansadd.ts`, `ui/PeoplePick.tsx`, `tracker/app/core.js` (`startMarquee`, `followEdge`, the
two-finger take-back), `tracker/components/Modals.jsx`, `leavewar/ui/Sheet.tsx` (the tap shield), `leavewar/ui/select.ts`
(the figure drag), `ui/outside.ts`, and the four stylesheets the diff touches. Read-only; this file is the only one written.

## Findings

**None that meet D489's bar.** Every route below was traced from the press to the writer, and in each the date that
reaches the writer is the one tapped, a half-made run cannot be saved as a whole one, and no sequence I could construct
leaves a form unable to save. The three places where the new wiring could have gone wrong — the OIL credit's date now
floating outside its bar, the Inputs' calendar's empty-end run shape re-expressed through `DateCal`'s `finished`, and the
people picker's edge band under a window's Save bar — are each handled, and each is pinned by a test that was red on the
old code (the sheet's §8; I read the three tests).

## Not findings, noted for the host (no failure on screen or in saved data)

1. **Past walk scripts still speak the old calendars' names.** `scripts/handpass/aa-A-*.mjs`, `aa-B-probe24.mjs`,
   `aa-C-lib.mjs` (`holcal-next-month`), `ab/ab-lib.mjs`, `ab/rw-*.mjs` and `ab/w2-02-cascade.mjs` look for `[data-cal=…]`,
   `.rc-mon`, `.rc-d`, `-prev-month`. They are the records of checks already run, not gates, so nothing fails today; a
   re-walk from one of them would stop at its first date. Worth one line in the step-two sheet so the next re-walker knows.
2. **The Reorder list's edge scroll rests on the browser running animation frames during a native drag.** Chrome and
   Firefox do; the unit test lends the frames by hand, and the sheet (§9) already says the list was not seen scrolling on
   screen because the demo's lists are too short. If a longer list is ever walked, this is the thing to look at.
3. **`oil-edit-date` is two elements' test id** in `OilTracker.tsx` (the read-only row's date at 442, the editing row's box
   at 511). They are never drawn at once, and the duplication predates this change. Not this job's.

## Roll-call gaps (§4 of the sheet)

None found. I looked for every importer of `RangePicker`, `RangeCal`, `DayChip`, `WeekCal` and `edgeAutoScroll`, and every
`.rc-*` user: the ten calendar places and the four drags in the sheet's table are the whole set. `ui/OilConfirm.tsx`'s own
grid keeps the `.rc-*` rules it uses (`06-inputs.css` 162–196, 206 — `.rc-read` kept for the two read-out lines); the
`WeekCal`-only and phone-only `.rc-*` rules that went had no other user. `RangeCal`'s wrapper class `in-cal` matches no rule
(only `body.in-cal` exists); `lw-cal` matches none. The three doors onto "Jump to a date" (the schedule seg, the phone's
calendar icon, the board's `#sbCal`) open the one component the sheet walked. The Leave War's "PO from" box, the Admin
page's run, the Tracker's three boxes and the "Every weekday" window are step one's and unchanged here.

## Read and found sound — one line a route

- **A leave bid's range** (`BidPicker.tsx` 384–423): "Pick a range" seeds `{date,date}`; `DateCal` run mode stretches a
  one-day run forward, restarts on an earlier tap or a finished run — the old picker's two rules exactly; bounded by the
  war's `min`/`max` (disabled, not walkable by the keyboard); "Just this day" is the way back to no range, so no Clear is
  missed; the sheet's own save reads `range` as before.
- **A new leave period** (`WarSheet.tsx`): `ready = name && start && end`; a one-day tap gives `{d,d}` as the old picker
  did; opens on `nextFreeDay()` (never a fixed date; this month when no war exists).
- **The bidding window** (`Chrome.tsx` WindowSheet): `clear` draws "Clear dates" only while a run is held;
  `onChange(null)` → the button reads "Open the whole year" → `clearBidWindow()`; with a run, `setBidWindow(from,to)`, the
  store still re-checking role and bounds.
- **An event's dates** (`EventSheet.tsx` 136–205): seeded from the band or the day; "Pick the dates first" only when
  `range` is null, which the picker can no longer produce — a finished run restarts rather than clears;
  `saveEvent({scope, from, to})` unchanged.
- **The OIL tracker's report range** (`OilTracker.tsx` 205–245, 658–661): `pick` feeds the window live; a press inside
  `.oil-pickrow` keeps the picker (the calendar is inline, so its lists and arrows are inside it); `anchor=today` is the
  Leave War's `localToday()`, the same real date `DateCal` marks (`isoToday`), so the disc and the "– today" label agree.
- **An OIL credit's date — tracker and figures bar** (`CreditForm.tsx` DayChip → `ui/DateBox.tsx`): `date` starts at
  today; `DateBox` hands on only a real date and only when it differs; `grantTo(ids, 'oil', n, date, …)` /
  `updateLedgerEntry(id, {date: eDate})` take the string unchanged. The floating layer: the tracker's outside-press
  (`OilTracker.tsx` 286) and the figures bar's (`Matrix.tsx` 708) both count `.dcal-layer` — veil, card and the 400 ms
  patch — as the bar's; the bar's Escape (`Matrix.tsx` 716) yields while a calendar (not the patch) is up, which matters
  because its window-capture listener was registered before the calendar's; the Sheet's tap shield lets the layer through
  (`Sheet.tsx` 118); the grid's own figure-drag machine listens on the grid, which the layer is outside of. The new
  `oiltracker.test` covers the arrow press, the pick and the ledger row.
- **A holiday's dates** (`HolidaysPanel.tsx` 154–244): a run or the "Pick its day" refusal; `calKey` remount after "Save
  and add another" moves the month to the day after; opens on `value.from ?? anchor` as before.
- **An input's own dates** (`ui/RangeCal.tsx` with `inputedit.tsx` 2836–2843): `finished={!!(start && end)}` and the
  `onRun` translation (`!start || end || f < start → (f,'')`, else `(f,t)`) reproduce the old `pick` case for case,
  including the saved input's first tap starting anew (`midPick`/`datesPicked` untouched), a tap on the saved day itself,
  a tap on the start of a half-made run closing it as one day, and the clash door's "Take theirs" resetting to a finished
  range; `calKey` remount and the `at` seed keep the month rule; today is the planning day (`keyToIso(TODAY)`) and its icon
  picks nothing.
- **The Inputs list's window** (`InputsPage.tsx` 615–625): the same translation; a half-made run reads "pick an end
  date" and filters from its start as it always did; the presets and "All dates" bypass the calendar.
- **Jump to a date** (`WeekCal.tsx`): drawn only while open (hidden otherwise, so `DateCal` re-seeds its month on every
  open and the day is not measured with the window closed); `value=currentDayIso()` → `onPick=pick` → `loadWeek` +
  `boardTab` / `setWeekJump`; `onToday` → `pick(todayIso)` closes and lands as the old button did; one Today icon.
- **`DateCal` `finished` / `onToday`** (`DateCal.tsx` 149–152, 198, 205): `finished` only widens the restart condition;
  `onToday` returns before the month move, which is right since the window closes.
- **`edgescroll.ts` `span` / `more`** (61–67, 72–89): `span` replaces the scroller's box for the band and the step; `more`
  only ever zeroes a step; both optional, so the Leave War's `select.ts` numbers and every older caller are unchanged.
- **SANS calendar turn** (`SansCal.tsx` 177, `calpick.ts` 84–102): one line onto the shared machine; the run keeps its
  first date across the turn, re-reads the date under the still pointer after `TURN_SETTLE`, orders the pair at release
  (`run()` and `openSansAdd` both), and a cancelled touch drops the run with no range — no selection changed.
- **Tracker ▣ Select box** (`core.js` 3848–3876): `followEdge` pans by the chart-owned transform and redraws the box from
  the last pointer place; the first corner stays on the chart; a `pointercancel` and the two-finger take-back both run
  `stop()` → `off()` → `fe.stop()`, leaving `selBalls` as it was; the pan starts dead in the band the press began in.
- **Tracker ⇅ Reorder list** (`Modals.jsx` 335–380): `#ordList` is `overflow:auto`, so `findScroller` always lands on it
  and never on the page (D686); the loop is made only when the list overflows, fed by the page's `dragover`, ended on
  `dragend`, a new `dragstart`, or unmount.
- **People picker drag** (`PeoplePick.tsx` 201–243): the scroll is made only once the drag is the picker's and only for a
  window's own scroller (`!box.isDoc` — never the page, D686); the band is the window's visible part above its sticky
  Save bar; it runs only while the picker's own box is still past the band; each face that slides under the still pointer
  is passed as a move would pass it; stopped on up, cancel, a new press and unmount; a cancelled touch keeps the picks
  already made, as it did before this change.

## Severity ranking

Nothing to rank. The change is clean on every route I traced; what remains is the walk's own business (his iPhone's
fit, a longer Reorder list), which the sheet already names.
