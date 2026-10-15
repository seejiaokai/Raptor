# Calendar step two + four edge drags — fresh, blind Opus code read (15 Oct 26)

Read: `git diff 6bedaec29..HEAD -- raptor-port/src` (code, then tests), the evidence sheet
`docs/handpass/2026-10-15-calendar-step-two.md` whole, the design of record's "Step two's answers" and the survey's pointers.
Read whole as well, for context: `ui/DateCal.tsx`, `ui/DateBox.tsx`, `ui/edgescroll.ts`, every RangePicker / RangeCal caller
(BidPicker, WarSheet, Chrome WindowSheet, EventSheet, OilTracker, HolidaysPanel, inputedit `datesHere` / `midPick`, InputsPage's
window of dates), `WeekCal.tsx`, CreditForm / BalanceBar, every document- or window-level pointer and key listener in the
Leave War UI (Matrix ×3, OilTracker ×2, Sheet's shield, Escape and Tab trap, FiguresDrawer, select.ts, gridclick.ts), the
input window's two shells (FloatWin, airpop), calpick.ts's turn machine, the Tracker's followEdge / edgePan / marquee, the
Reorder list, PeoplePick.

## Findings

**None at high or medium. None at low that meets D489** (a concrete failure, its cause and its fix). Every state × tap of
the run was traced (below) and comes out as before; no date can be picked and a different one saved; no form opens on a
different month; no surface behind the floating calendar takes its presses or its Escape; no edge loop outlives its drag
on any path I could construct.

### The run, traced state by state (the brief's first ask)
- **Leave War range calendar (RangePicker → DateCal run, not `finished`).** Old rule: no value or a finished run (from≠to)
  → restart; tap before from → restart; else stretch. DateCal `tap` (DateCal.tsx:205): `!from || from !== to || finished ||
  iso < from` → (iso, iso), else (from, iso). Identical for: no start; start only (one day: stretch, equal tap = same day,
  earlier = restart); from<to finished (restart). BidPicker's seed {date,date} still makes the next tap complete the span.
- **Input's calendar (RangeCal → DateCal with `to = end || start`, `finished = start && end`).** Old `pick`
  (`!start || (start && end)` → (d,''); `d < start` → (d,''); else (start,d)) against the new wrapper (RangeCal.tsx:33–36):
  no start → (iso,''); start only, tap ≥ start → (start, iso), equal tap → (start,start); tap < start → (iso,''); start and
  end (one day included) → (iso,'') — the saved input's first tap starts anew. `start ''` with `end` set → (iso,''). All as
  before. inputedit's `datesHere`/`midPick` (end handed as `end||start` until the first tap, `setMidPick(!e2)`) composes
  correctly: first tap → (iso,''), midPick on, end '' → second tap stretches, midPick off; a second tap earlier → new start,
  midPick stays on. "Take theirs" resets midPick (unchanged).
- **Inputs list's window of dates**: the default window is finished → first tap a new start; "All dates" ('','') → first
  tap a start; `→ pick an end date` read-out unchanged.
- **OIL credit date (DayChip → DateBox)**: DateBox hands the tapped ISO directly (`onPick(iso)` only when it differs);
  the old far-end arithmetic (`r.to !== value ? r.to : r.from`) is gone, and with it no way to save the wrong end. Form state
  (`date` seeded `today`, saved by `grantTo`) unchanged; the edit row (`oil-edit-date` → `setEDate`) the same.
- **Jump to a date**: `onPick` and `onToday` both go through the unchanged `pick()`; month seeded from `currentDayIso()`
  as the window mounts (closed it renders a hidden div, so DateCal mounts afresh per open — the old re-seed effect's job).

### Opening month / seed, every caller
BidPicker (seeded run), WarSheet (`nextFreeDay()` full ISO), WindowSheet (`min` = period start; test pins January),
EventSheet (`min`), OIL tracker range (`anchor={today}`), HolidaysPanel (`anchor` full ISO, `key={calKey}` remount
untouched), RangeCal (`start || end || 2026-07-01`), WeekCal (current day). DateCal seeds `from` → `at` → min/max/today; all
anchors are full ISO strings so `validIso` never drops one to "today". Same months as before.

### Clear
Only WindowSheet passes `clear`, and it is the only form whose "no dates" is an answer (`clearBidWindow`, "Open the whole
year"). The others never needed null: BidPicker keeps its own "This day" chip (`setRange(null)`, BidPicker.tsx:391);
EventSheet has "This day" scope; WarSheet/HolidayForm need dates to save; the OIL tracker's other modes reset the range.

## Roll-call gaps (places §4 does not list, or lists without proof)
1. **The OIL tracker's date when EDITING an award or correction** (`OilTracker.tsx` ~511, `DayChip testid="oil-edit-date"`)
   — the same DayChip → DateBox change as the credit form, but not a row in §4, not walked, no test. I traced it: its row
   has no outside-press closer of its own, and the selection guard now exempts `.dcal-layer`, so I expect it works — but it
   is a changed place with no evidence. Add a row; one walk step (open an award's ✎, pick a date on the floating calendar,
   Save, read the ledger) or one unit test mirroring "the credit's date is picked on the floating calendar".
2. **Jump to a date opened from the Scheduler Board** (`#sbCal`, context `'board'`): `pick` there runs `loadWeek` +
   `boardTab`, and the Today icon (now the calendar's own, `onToday`) goes the same way. §4 has one row and odds.test drives
   the schedule's door only. Code unchanged in `pick`, so low risk; still a door of a changed surface with no proof.
3. **The event sheet above a phone keyboard.** `compact` was there "so the whole sheet fits above a phone keyboard" (owner,
   31 Aug 26, quoted in the deleted prop's comment). D901 (3) says smaller only where a sheet would not fit his iPhone; the
   walk's "fits" (390×844, Playwright) has no soft keyboard up. Name it in §9 as not walked (his look card could carry: type
   an event's name, then pick "A range" with the keyboard still up).
4. **The people picker's other doors**: the same picker is drawn in the input window's second shell (`inputedit.tsx` ~3102,
   the `.airpop` dialog used off the Inputs page) and for the SANS calendar's "+ Commitment" for several SANS men. The
   band's `span` reads the window's sticky bars by `position: sticky`; walked only in the Inputs page's FloatWin. Low risk
   (the helper falls back to the box and stops at the last face), but unproven there.
5. Minor wording: §4's "Leave War — a new leave period" covers WarSheet from "+ New"; the Holidays list's door into the same
   sheet with dates already picked (`warask`, `initial`) is carried only by warask.test — fine, but say so in the row.

## Read and found sound
- **DateCal `finished` / `onToday`**: two-line changes, both guarded; `onToday` returns before the month step, `finished`
  only joins the restart condition.
- **RangePicker**: `{from,to}` ↔ `onRun` round-trips; "Clear dates" only with `clear` and a value; foot words unchanged.
- **RangeCal**: wrapper reproduces the old two-click rule exactly (traced above); `today` stays the planning day.
- **WeekCal**: one Today icon; focus to the first month arrow; Escape and outside-click unchanged.
- **DateBox in CreditForm**: OilTracker and Matrix figures-bar outside-press guards exempt `.dcal-layer` (patch included);
  the figures bar's window-capture Escape (registered before the layer's, so it runs first) now yields while a layer is up;
  the Leave War Sheet's shield and Tab trap already let the layer through; the layer's window-capture Escape/Tab stops the
  Sheet's document listeners. No other document/window listener in the Leave War acts on a press in the layer.
- **Styles**: every class of the deleted `rangepicker.css` is gone from code and e2e; `.rc-*` rules OilConfirm still uses
  are kept; `.dcal-inline` reaches inside `#page-leavewar`; no Leave War rule styles bare `b`/`button` in a sheet.
- **Test ids**: DateCal's suffixes (`-title -today -prev -next -grid -dow -foot -lists -months -years`) collide with no
  other id under span / war / window / event / oilrange / holcal / wcal / inpEdCal / inRangeCal. (`war-picker` is used
  twice — Chrome.tsx:117 and WarSheet's calendar wrapper — but that pair predates this change.)
- **Tests**: re-expressed, not weakened — every old assertion has its counterpart (classes `on/start/end/s/e/mid/wk` →
  `is-in/is-from/is-to/is-sel/is-mid/is-we`; month text → `data-month`), the two behaviour changes (no Clear; MON…SUN) are
  pinned as such; the holiday helper's "tap twice" restart is correct from every state; new tests (C6 credit date,
  Clear dates, Today icon, span/more, Reorder list) assert outcomes, including the saved ledger date.
- **SANS calendar turn**: `onTurn` is the Inputs month's own wiring through the shared calpick machine (`live.current.step`
  re-read each render); the run keeps its first date across the turn.
- **Tracker ▣ Select box**: followEdge stopped on release, on cancel (new) and through `fingerStop` on a pinch; moves of
  another finger now ignored; the pan clamps at the chart's own top-left as the ball drag does.
- **⇅ Reorder list**: edge scroll only when the list overflows its own box (so never the page behind the window); fed by
  document `dragover`; stopped on dragend, on a new dragstart and on unmount.
- **People picker**: edge scroll only when the window body scrolls (`isDoc` refused — the window is mounted at the app
  root, so no page container can be found in its place); stopped on release, cancel, a new press and unmount; `span` stops
  the band at the Save bar, `more` stops at the last face; faces sliding under a still pointer are passed once each.
- **edgescroll.ts `span` / `more`**: optional, default behaviour byte-identical for every other caller.
