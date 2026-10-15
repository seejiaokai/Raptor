# Bug check — calendar step two (`[ONE-DATE-CALENDAR]`, D901) and four more edge drags (`[DRAG-EDGE-FOUR-MORE]`, D900)

Branch `claude/calendar-edge-drag-tasks-115921`, from `main` at 6bedaec29 (pull request 515 live), built 15 Oct 26 by Opus
on his word ("on a new branch from main build calendar step two as recommended (D901), then the four extra edge drags
(D900)"). One check for the batch (D485), tier **FULL**.

## 1. The tier — the eight questions (the order's §5)
1. Money (OIL is owed): **YES** — the date of an OIL credit given by hand, and the OIL tracker's report range, are picked
   on the calendars this changes; a wrong date credits the wrong day. 2. The published record: **NO** — no calendar here
   publishes or signs. 3. Saved data: **YES** — leave bids, leave periods, the bidding dates, events, holidays and an
   input's dates are picked through these calendars and saved (the same `yyyy-mm-dd` strings, the same writers). 4. A
   shared drawer: **YES** — one calendar (`ui/DateCal.tsx`) in ten places; `ui/edgescroll.ts` under every edge scroll.
   5. A new gesture: **YES** — four drags follow the edge. 6. A new surface: **NO** (the floating calendar is step one's).
   7. Roles: **NO** — no gate changed (a member's bid sheet is the same sheet). 8. The warning list: **NO**.
   → **FULL**.

## 2. What was built
**Step two (D901 — "as recommended on its page"):** the Leave War's range calendar (`leavewar/ui/RangePicker.tsx`: a leave
bid's range, a new period, the bidding dates, an event's dates, the OIL tracker's range, and the holiday form) and the
input's calendar (`ui/RangeCal.tsx`: an input's own dates, the Inputs list's window of dates) now draw the app's one date
calendar inside their form (D797); "Jump to a date" (`ui/WeekCal.tsx`) draws it in its own window. Their own rules are
kept: the Leave War's run and words ("26 Jan 26 – 3 Feb 26"); an input's range waits for its end and a saved input's
first tap starts its dates anew (`DateCal finished`); "Jump to a date"'s Today picks today at once (`DateCal onToday`,
now the calendar's own icon — one Today icon, not two). **D901 (1)** no Clear but the bidding dates' small "Clear dates"
(`RangePicker clear`); **(2)** today on the Leave War's calendars (the soft disc); **(3)** one finger-sized date
everywhere — the event sheet, the holiday form and the OIL tracker on a phone all still fit (pictures `…/after/`),
so no smaller size is put to him; **(4)** the Inputs list's window moved too. The OIL credit's date — one box among
the form's others — is the app's date box, its calendar over the page (D797's place list), not the range calendar
bent to one day. `leavewar/ui/rangepicker.css` deleted; the dead `.rc-*` rules of these three gone (OilConfirm's own
grid keeps them).
**D900:** the SANS calendar's run turns its month at the side (`SansCal.tsx onTurn` — the Inputs month's machine);
the Tracker's ▣ Select box pans Edit chart layout at its edge (`core.js startMarquee` → `followEdge`, its own cancel);
the ⇅ Reorder list scrolls under a row carried to its top or foot (`Modals.jsx` — the browser's own drag, fed by
`dragover`); the people picker's drag across faces scrolls the input's window (`PeoplePick.tsx`, `edgeAutoScroll`).
**D910 (his answers of 15 Oct 26, built the same evening):** on a phone the Inputs list's "+ Input" and dates button
stand in the tabs' top row, beside the switch, the filter and the gear (`InputsPage.tsx` `listTools`, drawn in ONE of
the two places by the page's `phone`; `.inputs-listtools` hidden on a phone); the row's button height (36); the switch,
filter and gear never shrink for them (`25-inputs-calendar.css`); on the narrowest phones (under 390) the dates button
reads "15–29 Oct" / "28 Sep–12 Oct" (`tight`); the pop-up hangs under the new row (`06-inputs.css`) and its own buttons
keep their size (every `.inputs-top .abtn` rule excludes `.inrange-pop .abtn`). The desktop list is unchanged. D908
(a small phone's pop-up foot reached by a swipe) and D909 (an input's window may cover the day on his phone): left as
built, each pinned by a browser test.

## 3. The rulings swept
D796, D797 (one calendar; over the form or inside it), D800 (the swipe — DateCal's own, now in every place), D824 (no ring
after a tap), D830 (its keys), D889, D901 (this step), D725 / D731 (12) (finger-sized days — now everywhere, D901 (3)),
D671 (the holiday form's calendar — its home updated), D681 (a saved input's first tap — kept, walked C8), D892–D900 (the
edge rules; §5a of the design guide, D895: one landing line — no landing line is drawn by any of these four; the view
follows), D686 (a window never scrolls the page behind it — E4 checks), D672 (undo — untouched). No ruling contradicted.

## 4. The roll-call — every place the old calendars were drawn, and the four drags
| Place | The one calendar shows | Usable (picked, saved) | Painted on the same pixels | Proof |
|---|---|---|---|---|
| Leave War — a leave bid's "Pick a range" | YES | YES — filed over the run, the below-zero ask answered | the sheet's How much / Which leave under it | walk C1 both; bidding.test |
| — a new leave period | YES | YES — created and listed | the name box above | walk C2 both; wars.test |
| — the bidding dates | YES, with "Clear dates" | YES — opened, cleared to the whole year | "Open these dates" under it | walk C3 both; window.test, rangepicker.test |
| — an event's dates ("A range") | YES | YES — one merged bar 12 Jan – 2 Feb | presets, name above; Save under | walk C4 both |
| — the OIL tracker's range | YES | YES — the window line follows | Done, zoom beside | walk C5 both; oiltracker.test |
| — an OIL credit's date (tracker) | YES — the date box, floating | YES — after the fix (§7) | the tracker grid under the veil | walk C6 both; oiltracker.test (red first) |
| — an OIL credit's date (the grid's figures bar) | YES — the same date box | YES — after the fix (§7) | the grid under the veil | e2e leavewar "OIL from the grid…" (extended) |
| Calendar window — a holiday's dates | YES | YES — saved, in the list | the form's buttons under it | walk C7 both; holidayspanel.test |
| An input's own window — a new input | YES | YES — saved over 29 Jun – 2 Jul | the read-out line under it | walk C8 both; inputs.test |
| — a saved input reopened | YES | YES — first tap starts anew (Jul 1), saved 1–3 Jul | — | walk C8 both; groupeditor.test |
| The Inputs list's window of dates | YES, in its pop-up | YES — the list narrows; All dates | the pop-up's two buttons | walk C9 both; audit-e-window-sort |
| Jump to a date | YES, one Today icon | YES — a date loads its week; Today jumps | the hint under it | walk C10 both; odds.test |
| OilConfirm's day grid ("only some days") | NO, because it is not on step two's list (a near-copy with its own marks — the survey's note) | — | — | named, not changed |
| SANS calendar — a run held at the side | turns | YES — "+ Commitment" for the run across the month | the lit run | walk E1 both; break (red when cut) |
| Tracker — ▣ Select box at the canvas edge | pans | YES — the far balls selected | the dashed box | walk E2 both; break |
| Tracker — ⇅ Reorder list | scrolls | YES (desktop) — a phone cannot drag its rows (named to him) | the row's outline | retest.test "D900 — the Reorder list…" (red on the old code); the demo's crew list has 2 rows, nothing to scroll on screen |
| People picker — a drag across faces | scrolls the window | YES — stops at the last face, picks on | the window's Save bar (the band is above it) | walk E4 both (after the fix); edgescroll.test; break |
| The Inputs list's "+ Input" and dates button on a phone (D910) | in the top row, 36 tall; the pop-up under that row | YES — "+ Input" opens the window, the dates picked and the list narrowed, "All dates" (walk C8, C9 again on the new build) | the switch, filter and gear beside them, unmoved (390: 234/306/344, as before); the filter fields' open line under the row | walk C8, C9 both (`…/built/`); `inputslist.test` "D910 — …" (7 of 9 red on the old code); e2e "the dates button opens its calendar on screen" ×3, D731 (12) ×3 |
| — the narrowest phones, 375 and 360 wide | the row fits, nothing sideways; "15–29 Oct" | YES | the right-hand buttons at today's narrow sizes | pictures `…/built/row-375.png`, `row-360.png`; `inputslist.test` (the short label, a year kept) |
| — the desktop list | NO, because D910 keeps the desktop as it was | — | — | picture `…/built/desk-list.png`; `inputslist.test` "a desktop…" |
| **Added after the blind read (its five roll-call gaps):** | | | | |
| — an OIL correction's date, edited (`oil-edit-date`) | YES — the date box, floating | YES — picked, the editor stays open, saved on the 12th | the tracker grid; on a phone the pinned names beside the row | walk G1 both |
| — "Jump to a date" from the Scheduler Board (`#sbCal`) | YES (a phone; the desktop draws no board calendar button — C10 is its door) | YES — Thu 6 Aug's week loads and the board reopens on that day; Today back to 13 Jul, board open | the board under it | walk G2 both |
| — the people picker in the input DIALOG (opened off the Inputs page — the schedule's Personal Inputs line, a shared input) | scrolls the dialog | YES — 2 → 18 picked on a phone, scrolled to the last face and no further | the board under the dialog | walk G4a both |
| — the people picker in SANS "+ Commitment", several men | every face in sight — nothing to scroll (and nothing scrolls) | YES — the faces passed are picked | the SANS month beside | walk G4b both |
| — the event sheet on a phone with the keyboard up | NOT WALKED, because no phone keyboard can be raised in the test browser | — | — | §9; his look card |
| — the Holidays list's door into the new-period sheet | YES — the same sheet as C2 | carried | — | `warask.test` |

## 5. The sizing (§7.0)
1. **Type of change:** a shared drawer replaced in ten places (a date picked and saved through each) + four gestures.
2. **What only a walk can find:** a calendar that does not fit its sheet on a phone; a press in a floating layer taken by
   a surface behind it; a band under a bar that stays; a date picked but not handed to its writer.
3. **The ledger:** step one's calendar walk found two faults by walking (13 Oct 26); gesture changes find theirs in the
   running app (the edge-turn rows).
4. **The walk chosen:** the host alone (D787), one script as assertions, `scripts/handpass/cal2-walk.mjs`, desktop
   1440×900 by a real mouse and phone 390×844 by touch (Playwright taps, CDP touch for drags): every place picked AND
   saved and read back, both sizes; each drag at both sizes; a short desktop window (600) for E4, where the faces run past.
   Repeated calendar arithmetic (months, leap years, the keyboard) is carried by the step-one tests (`datecal.test.tsx`)
   and the re-expressed unit tests (§8).
5. **The ledger row:** added (`docs/walk-ledger.md`).

## 6. The walk — both sizes, every step passing on the final build
`scripts/handpass/cal2-walk.mjs`; pictures `docs/img/handpass/2026-10-15-calendar-step-two/` (the after-pictures of every
place at both sizes `…/after/`, each opened by the host). Desktop: 37/39 in one run, the two left (C4, E4) failing on the
script's own reach and passing once fixed; phone: 36/38, the two left (C8, E4) the same. The steps and what was seen are
§4's rows. Console and page errors: none, at both sizes.
**The blind read's gaps, walked on the same build (15 Oct 26, evening):** steps G1, G2, G4a, G4b — desktop 13/13, phone
15/15 once the script's own three slips were mended (a shared input is what opens the schedule's dialog with the picker —
D748; a drag must start on a face not yet picked, since one that starts on a picked face takes faces off; a phone's row of
OIL entries is swiped into view before Save). Pictures `…/gaps/`, each opened. No errors.
**D910 walked on its build (15 Oct 26, night):** steps C8, C9 and E4 again — desktop 12/12, phone 12/12, no errors;
pictures `…/built/` (the row at 390, 375 and 360; the pop-up open at 844, 667 and 568 — whole at 667, "All dates" on
screen at 568, its foot one swipe away; the desktop list unchanged), each opened.

## 7. What the walk found, and each disposition
1. **C6 — no OIL credit's date could be picked (FIXED, red first).** The floating calendar sits on the page, outside the
   credit bar; the OIL tracker (and the grid's figures bar) close the bar on "a press outside it", so the month's arrow or
   a date closed the form before the date was taken. Both now count a press in `.dcal-layer` as the bar's, and the figures
   bar's Escape yields to an open calendar. `oiltracker.test.tsx` "…floating calendar…" failed on the old code.
2. **E4 — the people picker's band lay under the window's Save bar, and the window scrolled past the last face
   (FIXED, red first).** `edgeAutoScroll` gained `span` (where the dragged things are seen) and `more` (anything left to
   show that way); the picker passes the visible part above the bar and stops at its last face. `edgescroll.test.ts`'s two
   new tests failed on the old helper; the browser break (§8) went red.
3. **Two phone questions, raised by the browser gates (§10) — WAITING FOR HIM** (§12, "Questions waiting for him").
   The finger-sized dates make the calendar about 100 points taller on a phone. (a) On a small phone (568 tall) the
   Inputs list's date pop-up now runs past the screen's foot, its "Next 2 weeks" and "All dates" out of reach (667 tall:
   only "Default window" cut; his 844: fits). (b) On a phone 844 tall an input's window, opened from a day, now reaches the
   top and covers the day's bar — the strip a finger used to bring the day forward. Before and after pictures:
   `docs/img/handpass/2026-10-15-calendar-step-two/question/`, put to him on one page. Nothing changed before he answers.
Not faults (the walk script's own, fixed in it): the below-zero ask on a bid; the event's bar is its own element; the
figures column covering the grid's first days; a 900-tall desktop showing every face; the saved input reopening on June;
the phone's list reopened by its card; "+ Input" under the bar after a scroll.

## 8. The tests and the break tests
- **127 unit tests re-expressed** on the new calendar by one sheet (`docs/superpowers/briefs/2026-10-15-calendar-step-two-test-map.md`),
  none weakened; the four whose behaviour his ruling changed pin the new one (Clear gone; desktop days finger-sized).
  New: `odds.test` (one Today icon, a date jumps), `rangepicker.test` (no Clear; Clear dates), `oiltracker.test` (C6),
  `edgescroll.test` (span, more), `retest.test` (the Reorder list). e2e specs re-expressed by the same sheet; the grid's
  figures bar test extended.
- **Unit breaks** (`scripts/handpass/breaks/2026-10-15-calendar-step-two.json`): **12 of 12 caught** — Clear dates, the
  run handed over, `finished`, RangeCal's start-over, `onToday`, the planning-day today, both OIL guards' tracker half, the
  DayChip hand-over, `span`, `more`, the Reorder list's feed.
- **Browser break** (one build with the SANS `onTurn`, the Select box's `fe.point` and the picker's `span` cut): the walk
  went red at E1, E2, E4 at both sizes; every file put back and the true build made again; `git status` clean.
- **Not break-proved:** the figures bar's `.dcal-layer` guard (`Matrix.tsx`) — carried by the extended e2e test only.
- **D910 and its two fix rounds:** `inputslist.test.tsx` "D910 — …" 15 tests — the row that draws the two buttons, the
  pop-up from it, a desktop unchanged, a screen turned, "+ Input" from it; the short label (one month, two months, a year
  kept, a year printed on any phone, two months of one other year, one day); the filters and the dates closing each
  other; the page order — each new test RED on the version before it (7, then 4, then 2). Browser:
  `e2e/inputs-calendar.spec.ts` "D910 — a phone 390 / 375 wide" (the gear's 17px glyph — 12px measured on the round
  before; a window into next year leaves all five on one line, the switch, filter and gear unmoved; a finger 3px above
  the dates button meets it; a tap on the blank row closes the pop-up); the small-phone pop-up and D731 (12) loops (D908);
  "+ Input" 36 tall with its finger-sized press area; A1 on a 932-tall phone; "D909". Both Inputs browser files whole:
  74 / 74.

## 9. Not walked, and why
- On his iPhone: the fit of the finger-sized calendar in the Leave War's sheets with Apple's wider letters; the SANS turn
  and the picker's drag under a real finger (Safari — the turn's Safari guard is the shared machine's, proved by
  `edgeturn.test.ts`); his look card, §12.
- The ⇅ Reorder list on screen: the demo's lists are too short to scroll — carried by the unit test above.
- A member's own bid sheet: the same component and route as the admin's; not walked apart.
- The event sheet on a phone with the keyboard up (why its compact form existed, 31 Aug 26): no phone keyboard rises in
  the test browser — on his look card.

## 10. Gates
**15 Oct 26, ~18:50, the branch at ea61be768 + documents, under the lock:** build clean · tfin PASS · unit 11446 / 11446
(643 files) · Tracker smoke PASS · rulecheck OK · docsize OK · **browser 808 passed, 9 failed, 59 skipped.** The nine:
- **Old tests still driving the old calendar — FIXED in the tests, re-run green:** the new-period tests ("an admin creates a
  leave war…", "overlapping dates are refused…", desktop and phone — their helper read the old month label and arrows;
  it now reads the calendar's own month), "phone: the top-left calendar icon opens the week picker" (looked for the old
  grid). 5 of 5 pass alone (15 Oct 26, evening).
- **Waiting for his answer (§7, 3):** the Inputs list's date pop-up at 568 and 667 tall (`inputs-calendar` ×2,
  `inputs-batch2` D731 (12) at 568) — question (a); "A1 — a phone: another card tapped over unsaved changes" — its
  route was the day's bar above the input's window, now covered — question (b).
**FINAL — 15 Oct 26 (night), the branch with D910 and both fix rounds, the whole set under the lock in one run:** build clean · tfin 728 / 0 · unit 11461 / 11461 (643 files) · e2e 820 passed, 0 failed, 59 skipped · smoke 446 / 0 · rulecheck OK · docsize OK (records; sizes OVER by 1413, deferred — D29) — **WHOLLY GREEN.** The nine of the first run: five fixed in the tests (old-calendar names), four re-expressed to his answers (D908, D909) — every one green.

## 11. The code reads
Both blind, each given this sheet and the diff (D790 — OIL and saved data): `parts/cal2/read-opus.md` and
`parts/cal2/read-fable.md` — **no findings from either.** The Opus reader named five roll-call gaps, each now a §4 row
(walked G1, G2, G4a, G4b; the phone keyboard on his card; the Holidays door carried by `warask.test`). Fable's three notes
are not faults: old hand-pass scripts keep the old names (records, not gates); the Reorder list's scroll relies on
animation frames running during a native drag (Chrome and Firefox do); `oil-edit-date` names two elements (older).
(Since D903 no Fable read is asked for unless he calls for one; this one was asked before that ruling.)
**D910 (built after those reads) — its own fresh, blind Opus read** (`parts/cal2/read-opus-d910.md`): five findings,
every one taken — the gear's ⚙ shrunk from 17px to 12px on the Inputs tab at every width, the desktop too (measured,
then fixed); a year in the dates label could drop the gear to its own line; the page order against the screen's; the
pop-up under open filter fields; a test's old screen height. **The fixes' own fresh, blind Opus read**
(`parts/cal2/read-opus-d910-fixes.md`, the order's "a fix is new code"): four findings, every one taken — a tap on
the row's blank stretch no longer closed the pop-up; the dates button's press area clipped; a test that would fail
from January 2027; the year printed twice. **A third read was not asked for** (the agent's call within the order's cap
of about three rounds): that round's fixes are the second reader's own exact fixes, two style lines, one label
function and one test's walk, each pinned by a test red on the round before.
**One fault looked for and not there:** in the small-phone test the first tap on a date after the swipe picked nothing.
Reproduced alone: it happens only after a fast flick, while the page is still gliding — the first tap only stops the
glide, as on any phone — and a swipe at a finger's pace, then rest, lets the first tap pick. The test swipes at that
pace now; nothing in the app changed for it.

## 12. His look card
**ANSWERED 15 Oct 26 — "All as recommended":** (a) left as built, a swipe reaches the rest (D908); (b) left as built (D909);
his direction built on phones in this job (D910, answering D907); the design guide's rule drafted and put to him, and the
Medical tab filed, each its own job (D911, D912 — `[GUIDE-ONE-ROW]`, `[MEDICAL-ONE-ROW]`). The questions as put:
**His idea at his look (D913):** in an input's window, the time and the remarks above a calendar whose dates were already picked — drawn on the real app as his order (A) and a folded dates line (B), put to him before anything is built (`scripts/handpass/mock-input-order.mjs`, pictures `…/question/order-*.png`).
**ANSWERED "5B" (D914):** the folded dates line, built after this pull request as its own job (`[INPUT-DATES-FOLD]`).
**Questions put to him** (the page with the pictures: "Calendar step two: two questions about phones"):
- (a) The Inputs list's date pop-up on a small phone — recommended: it scrolls inside itself; the dates stay one size.
  Waits on it: the three small-phone browser tests and any change to the pop-up.
- (b) An input's window covering the day on his phone — recommended: leave it (✕ or Cancel shows the day). Waits on it:
  the "A1" browser test's route.
- **His direction (D907):** on a phone, the Inputs list's "+ Input" and dates buttons move up into the row of the calendar /
  list switch, the filter and the gear, as tall as that row's buttons. A picture on the real app is put to him first; it
  also takes about one row off what runs past a small phone's foot in (a).
1. Leave War → tap a day → Pick a range: the new calendar (today's soft disc, the month and year lists); carry a run over
   a month's end and file it.
2. Leave War → the bidding dates: "Clear dates" under the calendar; cleared, "Open the whole year".
3. OIL tracker → tap a name → the date box: the calendar over the page; pick a date; Save.
4. Inputs → SANS: drag across days to the right side and hold — the month turns.
5. An input's window → Several people → drag across faces down to the window's foot — it scrolls and picks on.
6. Tracker → ✎ Edit chart layout → ▣ Select: draw a box to the screen's edge — the chart slides.
7. On your phone: a Leave War event's dates with the keyboard up (type its name first) — the calendar and Save still reachable.

## The closing lines
`Walk: docs/handpass/2026-10-15-calendar-step-two.md · 101 pictures · 19 surfaces walked (7 more carried by a test, §4) · 35 orders — 18 walk steps at a desktop, 17 at a phone (C1–C10, E1–E4, G1, G2, G4a, G4b; E3 desktop only), plus D910's row at three widths and its pop-up at three heights · MISSING: 0 open — the five read gaps walked or carried (§4), D910's eight faults found by its two reads fixed red-first (§11)`
`Docs: OUTSTANDING 190 items (+2 −1, −1 all in ARCHIVE) · DECISIONS D1–D912 (new: D903–D912) · homes OK`
`docsize: OVER by 1413, deferred (D29)` — the rulings files (how we work 281 bytes, the Inputs pages 1127) and two rule files (4 and 1 lines): a documents-only pass, never inside this branch's code commits.
