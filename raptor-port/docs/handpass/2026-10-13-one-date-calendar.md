# `[ONE-DATE-CALENDAR]` step one — the bug check (WALK)

**Where it stands (the close, night of 13 Oct 26):** built, tests first; the host's look at six sizes (§6); walked by three
helpers — no failure, two faults, fixed (§7); 69 unit breaks and 14 browser breaks, every one caught (§9); its finished
code read by a fresh, blind Opus reader — eight claims: seven fixed, one filed (§10); the whole gate set green in one run
(§12). **Left: his look on his own iPhone (the card, §13) and his "merge live".**

`Walk: docs/handpass/2026-10-13-one-date-calendar.md · 375 pictures (285 the walkers', 90 the host's look) · 14 surfaces (the roll-call's date boxes, each seen and operated) + the swipe's 3 · 45 scenarios walked · MISSING: none open — 2 faults fixed red-first, 2 older things filed, the rest as built`
Carried by a test, not walked — listed apart in §11.

Branch `claude/one-date-calendar-step-one-55ba13`. Rulings D786, D795, D796, D797, D798
(`grep -h '^| D79[5-8] |' .claude/decisions-full/*.md`). The design of record
`docs/superpowers/specs/2026-10-13-one-date-calendar.md`; the pictures he approved `docs/mock/cal-swipe-fit.html`.

## 1. The eight questions — tier WALK

| # | Question | Answer | Why |
|---|---|---|---|
| 1 | OIL | NO | no calculation is touched: a date box hands its form the same "yyyy-mm-dd" the phone's box did (the diff has no file under `engine/`, and none of the OIL files) |
| 2 | The published record | NO | no box of step one stands on a publish, sign or amend path; the schedule's own "Jump to a date" is step two |
| 3 | Saved data | NO | nothing new is stored and no stored shape moves — every writer (a rule, a posting, a new person, an upchit, a clearing sweep) is as it was and is handed the same string; the walk still follows a picked date through to what was saved and across a reload |
| 4 | A shared drawer | YES | one calendar and one date box, drawn in fourteen places by six files |
| 5 | A new gesture | YES | the swipe; the date box; the month-and-year lists; a run made by two taps |
| 6 | A new surface | YES | the calendar floating over a form — over the windows shell, the Admin page, an input's window, the Leave War's sheets |
| 7 | Roles | NO | nobody is given or refused anything: each form's own gate is as it was (the Calendar window and Admin are admins', a member files his own upchit) |
| 8 | The warning list | NO | no warning's words, no rule |

## 2. The rulings swept

| Ruling | What it asks here | Where it is held |
|---|---|---|
| D786 | the swipe on the month and the Holidays list, phone only; the From box fits at any phone width | `dayswipe.test.tsx`; `e2e/datecal.spec.ts` (the swipe; 320 / 360 / 390 / 440) |
| D795 | From and Until are the app's own field; any date, the weekday standing out; the swipe never presses a date's button; under Until a date before From cannot be picked | `everyweekday.test.tsx`, `datecal.test.tsx`, `e2e/datecal.spec.ts` |
| D796 | one calendar: the title opens two scrolled lists, a Today icon right of the year, no Reset, no tick — a tap picks | `datecal.test.tsx`, `datebox.test.tsx` |
| D797 | over the form for one box among others; inside the form for a run (Admin's range); Monday first; step one's list of boxes | `datebox.test.tsx`, `adminclear.test.tsx`, `nodatebox.test.ts` |
| D798 | the Tracker's three date boxes are NOT in this step; a tick there is his to choose from a picture | `nodatebox.test.ts` names them as the only ones left; filed |
| 4 Sep 26 — a click-open pop-up closes on a click outside | a tap on the veil closes the calendar and changes nothing | `datebox.test.tsx`; `e2e` both sizes |
| D641 — the windows do not block the page | the windows shell's own text excepts "a small menu or picker": the calendar's veil is up only while a date is being picked, and Escape closes it before the window | `datebox.test.tsx` (Escape, twice) |
| 2 Sep 26 — a control tapped repeatedly must not move | the two arrows, the Today icon and the card stand still through twelve months; six rows always | `datecal.test.tsx`; `e2e/datecal.spec.ts` |
| D686 — a finger on a window never scrolls the page behind | the veil and the card take no finger's move; the lists scroll and hand nothing on | the stylesheet; **his iPhone** (§13) |
| D487 — the size of buttons stays | each box keeps its form's own box size (16px heavy in "Every …"; the Leave War's small box) | `e2e/leavewar.spec.ts` (16px), the pictures |
| D308 | Post in is asked on all three doors, opening on today | `onedoor-users.test.tsx` |
| D328 | an earlier stint's posting date is read only | the box is switched off (`disabled`) — the walk (§7) |
| 19 Aug 26 — a posting may be years back or ahead | the years have no end either way | `datecal.test.tsx`; `e2e/datecal.spec.ts` (150 years on) |
| 25 Aug 26 — the clearing form's three periods, the two-tap confirm, a change disarms | as it was, with the box and the run calendar | `adminclear.test.tsx` |
| D726 — not wordy | one new line on screen: "Tap the first day, then the last." | — |

No clash between rulings was met. D798 is new and narrows nothing yet (a note, not a choice).

## 3. The roll-call

**THE DATE BOX** — every place the app draws a box a date is picked in. *Shows it* = the app's own box, reading the date
in words; *works there* = a tap opens the calendar ON TOP, a date picked reaches the form; *under it* = what the layer
floats over.

| # | Place | Shows it | Works there | Under it | Proved by |
|---|---|---|---|---|---|
| A1 | "Every <weekday>" — From | YES | YES | the windows shell: its own window in front, the Calendar window behind, the Inputs page | `e2e/datecal.spec.ts` both sizes; `everyweekday.test.tsx`; look |
| A2 | "Every <weekday>" — Until, "A date" | YES | YES | as A1 | as A1 |
| A3 | Admin → Users, Add a person — Post in | YES | YES | the Admin page | `e2e/datecal.spec.ts` both sizes; `onedoor-users.test.tsx` |
| A4 | Admin → Users, an archived man — Restore's Post in | YES | YES | the Admin page (the same panel) | `onedoor-users.test.tsx`; `e2e/onedoor.spec.ts` (picked, restored); the walk |
| A5 | Admin → Users, Give access → New person — Post in | YES | YES | the Admin page (the same panel) | `onedoor-users.test.tsx`; the walk |
| A6 | Admin → Data, Old clutter — "Older than" / "Date" | YES | YES | the Admin page | `e2e/datecal.spec.ts`; `adminclear.test.tsx` |
| A7 | Admin → Data, Edit history — "Older than" / "Date" | YES | YES | the Admin page | as A6 |
| A8 | Admin → Data, both forms — "A date range" | YES — one run calendar IN the form | YES | nothing floats | as A6 |
| A9 | Medical → a pending card → Upchit — its date | YES | YES | an input's own window, over the Medical page | `e2e/datecal.spec.ts` both sizes; the walk (a member's own) |
| A10 | Leave War, the one-day sheet — PO from | YES | YES | the sheet, the grid | `e2e/leavewar.spec.ts` both sizes; `po.test.tsx`; `datebox-sheet.test.tsx` |
| A11 | Leave War, the one-day sheet — PI from | YES | YES | as A10 | `e2e/leavewar.spec.ts`; `pi.test.tsx` |
| A12 | Leave War, the Post out sheet — its date | YES | YES — committed at once | as A10 | `e2e/leavewar.spec.ts`; `po.test.tsx` |
| A13 | Leave War, the Post in sheet — its date | YES | YES — committed at once | as A10 | `pi.test.tsx`; the walk |
| A14 | Leave War, the panel for a dragged block of one person's days — PO from | YES (found reading the code; the design's list missed it) | YES | the panel (it does not block the grid), the grid | `selectsheet.test.tsx`; the walk |
| A15 | The Tracker — a date on a course; "Done on"; "Failed on" | MUST NOT, this step: the design never named the Tracker, and whether a tick suits it is his to choose (D798) | — | — | `nodatebox.test.ts` names them as the only phone boxes left; filed |
| A16 | The app's three small calendars — the Leave War's range calendar (a bid's range, a new period, the bidding dates, an event, an OIL credit's date, the OIL tracker's range), the holiday form's, the calendar in an input's own window, "Jump to a date" | MUST NOT, this step: they are step two (D797), with a check of their own | — | — | untouched — the diff has none of their files but `HolidaysPanel.tsx` (one line: the year's note cleared on a swipe) |
| A17 | The months that are pages — the Inputs calendar, the SANS calendar, the Calendar window's month | MUST NOT (D796: "NOT the months that are pages of their own") | — | — | — |

**THE SWIPE** — every place a finger could turn a page of the Calendar window.

| # | Place | Has it | Proved by |
|---|---|---|---|
| B1 | the month (a phone: the Month tab) — the dates, the head, the hint, the room at the foot | YES | `dayswipe.test.tsx`; `e2e/datecal.spec.ts`; look |
| B2 | the Holidays list (a phone: its tab) — the lines, "+ Add", the room under a short list | YES | as B1 |
| B3 | both parts side by side (a touch screen 1510px and wider) — the part under the finger; the gap is neither | YES | `dayswipe.test.tsx` |
| B4 | "Every <weekday>" and the holiday form (the windows beside it) | MUST NOT — they are forms, outside the two parts | they are not inside the listened element; the walk |
| B5 | the app's new calendar itself | NOT IN THE DESIGN — it turns by its arrows and its lists; **a question for him (§13)** | — |
| B6 | a mouse | MUST NOT (D786: "a desktop keeps the arrows") | `dayswipe.test.tsx`; `e2e/datecal.spec.ts` |
| B7 | the Inputs calendar's and the SANS calendar's own swipe | untouched (`ui/calpick.ts` is not in the diff) | — |

**LISTENERS ABOVE THEIR COMPONENT** (the order's §6): the date box listens for Escape at the window — only while its
calendar is up, and that is when the key is its own (`datebox.test.tsx`: with no calendar open the window behind closes
at once). The swipe's guard listens at the document for one click, for at most 350ms after a swipe, and is taken off
with the window (`dayswipe.test.tsx`).

**WHAT WAS REMOVED** (the order's §6 — from the removed code): the phone's own date box gave, beside picking a date:
(1) TYPING a date on a keyboard — now the arrow keys on the dates, Page Up / Down for a month, and the lists for a far
year; a date can no longer be typed as figures — **told to him (§13)**; (2) EMPTYING the box — gone by his ruling (D796,
no Reset): "Until" has "No end", every other box always held a date; (3) the phone's own Reset and tick — gone by D796;
(4) "no earlier than" on Until — kept: earlier dates are faint. Admin's range was two boxes and is one calendar: the
form under it starts about 330px lower (nothing is placed against the screen there).

## 4. The door check

| Action | Its control, in each state |
|---|---|
| pick a date | a tap on the box → a tap on a date; a box that is switched off (a locked posting) opens nothing |
| look at another month | the two arrows; the title → the lists (scrolled, tapped, or the arrow keys) → the title again |
| go to today's month | the Today icon — with the dates up, and with the lists up |
| leave without picking | a tap outside; Escape; a second tap where the box is |
| pick a run (Admin) | a tap, a tap; a tap on a new day starts over |
| turn the Calendar window's month / year | a sideways finger; the arrows and Today, as before |

## 5. Sizing the walk (the walk ledger's five lines — written before any walker started)

1. **The type of change:** D (one calendar and one box drawn in fourteen places, by six files), B (a new floating
   surface), C (a new gesture and three new controls), E (the fit at a phone's width).
2. **What only a walk could find here:** a box in a form nobody opened in a test (Restore, Give access, the Post in sheet,
   the dragged-block panel — on a phone that panel is reached by a held drag); the calendar under something on a surface
   in a state the tests did not make; a picked date followed to what was SAVED and read back after a reload (a rule on
   the month, a man's row from his post-in date, a posting on the grid, an upchit on the Medical page, a sweep's count);
   the orders of action on the box (open, turn, lists, Today, outside, Escape, again) and with the window resized or the
   phone turned while it is up; the swipe against the window's own gestures; a member's view. **What the tests already
   hold:** the string each box hands on; the layer on top on nine of the fourteen; the fit at four widths; the swipe's
   rules; the calendar's own behaviour.
3. **What the ledger says:** a mark or control drawn in several places (D) — ten walks of ten found a real fault, 57 in
   the change; a new control (C) eight of fifteen; a new surface (B) four of five; layout (E) four of ten. A Sonnet walker
   has cost 330 to 400 thousand tokens.
4. **The walk chosen:** THREE Sonnet 5.5 walkers on one frozen build (`dist-odc1`, served on port 4187), each its own
   browser worlds, about forty scenarios: **W1** the Calendar window on a phone by touch — the swipe, "Every <weekday>"
   through to the saved rule, at 390 × 844, 320 × 568 and a phone on its side; **W2** Admin (Users, Data) and Medical at
   a desktop and a phone, as an admin and a member, through to what is saved and a reload; **W3** the Leave War's five
   posting dates at a desktop and a phone, the far year by the lists, Undo, a reload. Beyond the required two sizes: a
   narrow phone and a sideways one. **Carried by a test, not walked:** the fit at 360 and 440 wide and the controls
   standing still through twelve months (`e2e/datecal.spec.ts` — real layout, real presses); the arrow keys on the dates
   and the endless years (`datecal.test.tsx`, and the browser test's 150 years).
5. **After the walk:** its row in `docs/walk-ledger.md` (§7 here says what it found).

## 6. The host's own look (before the walkers)

`scripts/handpass/odc-look.mjs <size>` on the built bundle — every box reached by the app's own controls, each measured
(the box inside its form and the screen; the calendar wholly on the screen and on top at its centre and four corners;
nothing cut in its card) and pictured: phone 390 × 844, narrow 320 × 568, wide 440 × 956, sideways 844 × 390 (touch),
laptop 1280 × 700, desktop 1440 × 900. Pictures `docs/img/handpass/2026-10-13-one-date-calendar/look-<size>/`, 15 a size.
Opened by the host: the From calendar and its lists (phone, narrow, sideways, desktop), Admin's range (phone), the
Leave War's sheet (phone).

| What it found | Disposition |
|---|---|
| The title's small arrow stood far from the year (the fixed room was on the words, not the button) | fixed: the room is the button's, the arrow follows the year |
| After a scripted swipe that lifts at full speed, the test browser swallows the NEXT tap, seconds later | the script's world, not the change: the Inputs calendar built before this job does the same under that script; the scripts rest the finger before it lifts. **His iPhone is the proof (§13).** Written into `docs/walk-scripts.md` |
| On a sideways phone the script could not reach a Leave War day (the grid shows few rows there) | NOT WALKED at that size — the script's route; the Leave War's sheets are W3's at a phone and a desktop |

## 7. The walk

Three Sonnet 5.5 walkers (D588, D787), each its own browser worlds on ONE frozen build (`dist-odc1`, the build of
`87189e28d`'s code — served on port 4187, never rebuilt while they walked), to the brief
`docs/superpowers/briefs/2026-10-13-one-date-calendar-walk.md`. Their reports, whole: `docs/handpass/parts/odc/w1.md`,
`w2.md`, `w3.md`; their pictures `docs/img/handpass/2026-10-13-one-date-calendar/w1/` (69), `w2/` (117), `w3/` (99).
No error from the browser's console, page or network in any walk.

| Walker | Share | Sizes | PASS | FAIL | RECORD | NOT WALKED | Tokens |
|---|---|---|---|---|---|---|---|
| W1 | the Calendar window on a phone, by touch — 16 scenarios | 390 × 844; scenario 13 also 320 × 568 and 844 × 390 | 13 | 0 | 3 (+1 of its own) | 0 | 233,144 |
| W2 | Admin (Users, Data) and Medical — 15 scenarios | 1440 × 900 and 390 × 844 | 14 | 0 | 8 | 1 part | 311,850 |
| W3 | the Leave War's posting dates — 14 scenarios | 1440 × 900 and 390 × 844 | 10 | 0 | 4 | 0 | 379,614 |

**What the walk found, and each disposition** (the host read every RECORD and the reports' "seen in passing"; the two
faults were reproduced as failing tests before their fixes):

| # | Found | By | Disposition |
|---|---|---|---|
| W-1 | A phone turned on its side and back with the From calendar up: the card was left at −146, −110 — cut by the screen's left and top — until closed and opened again | W1, scenario 14 | **FAULT, fixed red-first.** The layer asked "a phone?" once, at its first draw, and kept the other layout's written place. It asks again on every change of the screen's size and gives the place back. `datebox.test.tsx` ("a phone turned on its side…"); `e2e/datecal.spec.ts` (four turns, wholly on screen and on top at each). The read found it too (F5) |
| W-2 | A desktop: with a calendar open the mouse wheel scrolled the page behind the veil; the panel, kept on the screen, ended up over its own box | W2, scenario 9 | **FAULT, fixed red-first.** A wheel anywhere on the layer moves nothing behind it, and still scrolls a month-and-year list; the panel is also kept on the screen wherever its box goes. `datebox.test.tsx`; `e2e/datecal.spec.ts` ("the mouse wheel does not scroll the page…" — it first proves the page CAN scroll). The read found it too (F4) |
| W-3 | A phone only: a man added with a post-in ten days on, archived, then restored with a post-in three weeks on has NO ROW on the Leave War (49 rows, not 50), across a reload; the desktop draws him, hatched | W2, scenarios 2 and 13 | **Older, not this change — filed `[LW-PHONE-AWAY-ROW-MISSING]`, to reproduce first.** The date box handed the same date at both sizes (the box read "Tue 3 Nov 2026" on each, and the desktop's grid is right); the diff touches nothing of the war's roster, stints or grid. It is the phone grid's own answer to "is he here in the months drawn" |
| W-4 | A slide begun on the Calendar window's TOP BAR does not turn the month (as expected) — and shortens the window from 784 to 588 tall, which it then keeps | W1, scenario 6 | **As built, older:** on a phone a window's bar drags its height (the windows shell — `ui/floatwin.ts`, not in this diff). The bar is not part of what is swiped. Filed with the look card as a thing he may meet |
| W-5 | On a phone on its side (844 wide) the calendar is a panel under its box at the left, not a card in the middle | W1, scenario 13 | **As designed:** a screen wider than 620px has the desktop's layout — for the windows too. Wholly on the screen, on top |
| W-6 | "Old clutter" never armed — the demo world has none | W2, scenario 4 | NOT WALKED for that form; the same arm-then-pick-another-date was walked on Edit history (it armed "Tap again to clear 1 entry", then "Cleared 1 entry") and is held by `adminclear.test.tsx` |
| W-7 | The Leave War's own Post in refuses a post-in after a post-out ("Posted out from 10 Jul 26 — the post-in has to be before that day"), so "a posting that cannot be moved" was made through Admin → Users; no greyed date box was met — the gap days show a LIVE Post in box | W3, scenario 8 | RECORD — the live box is the CURRENT stay's post-in, which is his to move; an EARLIER stay's dates (D328) were not reached on screen. Carried by the break tests (a locked box cannot be opened — two wires, both caught) |
| W-8 | After a posting the app's Undo and Redo stay grey; the sheet's own "Undo post out (PO)" takes it back and closes the sheet | W3, scenario 3 | As ruled (D321 — a posting is no Undo step) |
| W-9 | A member's own day offers no PO or PI; "Pick a range" is still the Leave War's own small calendar, with its Clear | W3, scenarios 13, 14 | As it should be — step two is not started |
| W-10 | Removing a rule in "Every Thursday" and the app's Undo: the rule's dates come back, Redo lights | W1, scenario 15 | As built |

**Read with the reports:** "Every <weekday>" saved through to the month (a start on a Tuesday begins the rule on the
first Thursday after it; an end stops it), across a reload; a new person's post-in through to his hatched days on the
Leave War (desktop); Restore; the upchit's date; a posting out picked six days on, moved earlier (taken at once), a far
year reached by the lists ("Mon 3 Mar 2031"); the dragged-block panel's box by a mouse drag and by a held finger; on a
phone a tap on the dimmed area closes the calendar only, a tap on a date picks and the sheet stays, a tap on the grid
then closes the sheet; a desktop's Escape, twice. All as expected.

**The size, looked at again when the evidence changed (§7.0):** two faults, both in the floating layer's own manners
(a resize; a wheel) — states of the ONE layer, not a surface that was missed, and each now held by a browser test on
that layer. The roll-call's rows all have their mark. The walk was not widened; the re-walk (below) is what the fixes
touched.

**The re-walk of the fixes:** the host's look script on the FIXED build at six sizes (`look-*`, re-taken), and the
browser tests written for each fix — a real double-click on a date drawn over Save and over the Leave War's sheet, the
four turns of the phone, the wheel over the veil, the dates and a list, Tab over a Leave War sheet (unit — a keyboard
has no phone). The walkers' scenarios the fixes touch (W1-14, W2-9) are those tests.

## 8. What the tests found while it was built

| Found by | What | Disposition |
|---|---|---|
| `e2e/datecal.spec.ts`, first run | the year list scrolled 78 years on read 25 — the list's window of rows was re-centred and moved twice (the browser had already kept the rows in place) | fixed: the chosen row is put in the band outright; the browser's own keeping-in-place is off on the lists. The browser test is its guard |
| `e2e/leavewar.spec.ts` (an older test) | the From box's words had become 13px — the date box's own size won over the form's | fixed: "Every <weekday>" keeps its 16px heavy box |
| `leavewar/ui/datebox-sheet.test.tsx`, written first | on a touch screen a tap on the floating calendar was eaten by the Leave War's tap shield, and CLOSED the sheet whose date was being picked | fixed: the shield lets the calendar's layer through; red before |
| starting the Tracker's own job, AFTER the gate run (the host, reading the Tracker's code) | **the Tracker's own date boxes wore the new box's border, padding and pointer** — the Tracker wraps each in an element of the same class name as the app's new date box, and one global stylesheet reached all of them. No check of this step had opened the Tracker: the step does not touch it | **fixed red-first** (`e2e/datecal.spec.ts` — "the Tracker's own date boxes are untouched": border 1px, padding 10px before): the look is the app's own box's only. The roll-call's lesson, kept in that test's note: a new class name on the one global stylesheet is searched for in all three apps before it is used. The browser file (17) and the Leave War's date tests were run again; the whole gate set is owed again on this one stylesheet change — GitHub's own run on the pull request carries it |
| `selectsheet.test.tsx` (an older test) | it "typed" into a box that is now a button and still passed — it never checked the date | re-expressed: the date is picked on the calendar and the posting is asked for THAT date |

**Tests re-expressed, never weakened** (each typed into the phone's date box): `everyweekday.test.tsx`, `pi.test.tsx`,
`po.test.tsx`, `selectsheet.test.tsx`, `onedoor-users.test.tsx`; `e2e/leavewar.spec.ts` (two), `e2e/onedoor.spec.ts`.
**Two states those tests reached can no longer be reached on screen**, and each is now pinned as such: an end typed
BEFORE the start (a date before the start is faint — the form's own refusal is still reached by moving the start past
the end); an EMPTIED box ("Choose the date it starts." and Restore's "Pick the post-in date" have no door now — the
writers still refuse a missing date).

## 9. The break tests

One wire cut at a time, the tests that should notice run, the line put back (`scripts/handpass/breaks.mjs`, run in a
separate copy of the code while the reader read; the guard suites were run unbroken first — 12 files, 211 tests).
The list: `scripts/handpass/breaks/2026-10-13-one-date-calendar.json` — **69 breaks, 69 caught** at the close.

| Run | Breaks | Caught | What the misses were |
|---|---|---|---|
| first | 58 | 55 | **19** Escape taken at the window — a break that changed nothing a test could see; **39** the months go round — only the forward wrap was tested; **58** the Holidays list's note cleared when its year is turned from outside — no test made that note at all |
| after three tests were written | 17 (the date box's, with 39 and 58) | 17 | — |
| after the walk's and the read's fixes | 30 (the date box's and Admin's, with nine new) | 30 | — |

**Break 19 is the one that paid:** asking what test could see that listener — "ahead of every other listener" — led to
the Leave War's sheet, which keeps Escape AND Tab for itself at the document. Written as a test, Tab failed: with the
calendar open over a blocking sheet the sheet pulled the keyboard back behind the veil at every press. **A fault, fixed**
(Tab is taken at the window with Escape) — found by the break test an hour before the reader reported the same (F2).

**What only a browser sees** (`breaks-browser.mjs`, one build a break — `…one-date-calendar.browser.json`, 12): the
layer above every window and sheet; the swiped part reaching the window's foot; `touch-action`; the title's fixed room;
six rows; the patch; the wheel; the turned phone; the panel above its box; the year list placed outright; Post in and
the upchit date handing their date on; and, added: a phone's card giving back the desktop's place, the calendar's own
swipe (D800). **14 breaks, 14 caught** — one at its second writing: the double-click guard's first break only shortened
the patch's life to nothing, which in the test browser is still long enough; with the patch taken out the test fails.

## 10. The read of the finished code

ONE fresh, blind Opus reader (D790 — not Fable's kind of change: no OIL, published day, permission or saved shape),
given the brief `docs/superpowers/briefs/2026-10-13-one-date-calendar-read.md` (the finder wording, the demo-data
exclusion, the state table), reading `729961bd3`, blind to the walkers. Its report, whole:
`docs/handpass/parts/odc/read-opus.md`. 476,451 tokens. **0 high · 2 medium · 5 low · 1 to file; no false alarm.**
Each claim was written as a failing test before it was believed.

| # | The claim | Verdict | Disposition |
|---|---|---|---|
| F1 (medium) | The second click of a double-click on a date falls on the form the calendar has just uncovered — Save or a rule's Remove in "Every <weekday>", a leave chip or the shade that closes the Leave War's sheet | **Real, new** | **Fixed red-first.** For 400ms after a pick or a tap outside made by a POINTER a 24px see-through patch stands where the click landed and takes the click that may follow — by place and time, as the Leave War guards its Move button. `datebox.test.tsx` (five); a real double-click in `e2e/datecal.spec.ts` (a date over Save) and `e2e/leavewar.spec.ts` (over the sheet) |
| F2 (medium) | Over a blocking Leave War sheet, Tab does not go round the calendar | **Real, new** | Fixed — already found by break 19 (§9) |
| F3 (low) | With the keyboard on nothing, Tab walks out of the calendar onto the page behind | **Real, new** | Fixed with F2: Tab from anywhere goes into the card |
| F4 (low) | On a desktop the panel follows its box off the screen when the page behind is scrolled | **Real, new** | Fixed: the walk's W-2 (the wheel) and a clamp |
| F5 (low) | A calendar open while the screen narrows to a phone's width is drawn half off it | **Real, new** | Fixed — the walk's W-1 |
| F6 (low) | Admin → Data: after a range was made, ONE date picked in another mode comes back as a run from that date to the OLD end | **Real, new** | **Fixed red-first:** a date picked in a one-date mode drops the old end. `adminclear.test.tsx` |
| F7 (low, latent) | A box switched off while its calendar is up stays "open" underneath | **Real, no route found** | Fixed: it is closed for good. `datebox.test.tsx` |
| F8 (to file) | The IT flow guide's picture script (`scripts/itflow/j/leaving.mjs`) still types into two of these boxes — it will stop at the next re-shoot | Real, not the app | Filed `[IT-GUIDE-DATEBOX-SCRIPT]` |

**The builder's readings, as the reader ruled them:** supported — Escape first; the veil closes on the click; a run is
always whole; the fifth Leave War box belongs to step one. **His to decide (the card, §13):** the Today icon picks
nothing; a light dim on a desktop; an arrow press does not slide though the Inputs calendar's does; the new calendar
itself does not turn on a swipe.

**Its state table's UNPROVED cells — each a line only his iPhone can prove (§13):** a fling on a month-and-year list; the
focus ring a script puts on the picked date; a click after a swipe; a swipe right begun at the screen's left edge
(Safari's own "back").

**Noticed beside the change, older (its §5):** the Post out sheet commits a moved date at one tap, as the phone's box
did — where the stored outcome is Delete and the date tapped has already come, whether the delete then runs without its
second ask (D287) was not traced. **The host's disposition: filed `[PO-MOVE-DATE-DELETE-ASK]`, to reproduce first** —
older code, and it bears on his open note about a tick (D798). And: a stylesheet rule for the phone month that looks
inert (`23-days.css`), noted in `[ONE-DATE-CALENDAR]`.

**No second round of read was run:** the fixes are small guards on one file each but F1's patch (new logic, about
twenty lines) — which the two real double-clicks in the browser tests and nine break tests hold. A narrow read of the
fix commit is the first thing to add if he wants more before "merge live".

## 11. What was NOT walked, and why

- **The Leave War's sheets on a phone on its side** — the host's script could not reach a man's day there (the grid
  shows few rows); W3 walked them at a phone and a desktop.
- **"Old clutter" armed** — the demo world holds none (W-6); walked on Edit history, held by a unit test.
- **An earlier stay's locked posting date (D328)** — not reached on screen (W-7); the box's switch is held by two
  break tests.
- **Give access → New person's Post in** — W2 made the waiting line and walked it (its scenario 3); nothing left.
- **A real iPhone** — everything in §13's card. No Windows browser draws what an iPhone draws: that was the fault this
  job began with.
- **Carried by a test, not walked (§7.0):** the fit at 360 and 440 wide and the controls standing still through twelve
  months (`e2e/datecal.spec.ts` — real layout, real presses); the arrow keys on the dates (`datecal.test.tsx` — through
  the calendar's own keys); the years with no end (`e2e/datecal.spec.ts`, 150 years by the list's own scroll); Tab over
  a Leave War sheet (`datebox-sheet.test.tsx` — the real sheet, real key events).

## 12. The gates

ONE run of the whole set, under the PC's lock with nothing else running, on the code of the commit named in
`HANDOFF.md` §Gate baseline: unit 11006 / 11006 (630 files) · build clean · tfin 728 / 0 · e2e 792 passed, 1 failed, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK — about 18 minutes. The one failure is the known unsteady Leave War phone test ("several Required cells are picked with a drag…", filed as `[LW-REQ-PICK-MONTH-UNSTEADY]`), which this work does not touch: by itself, three times over, 3 of 3.

After it, on the same bundle: `npm run perf` and `npm run probes:adapted` — the counts beside the gates' in `HANDOFF.md`.

**Added after the walk, on his answers of that night:** D800 — a sideways finger on the new calendar's dates turns its
month (`datecal.test.tsx`, five red first; a real finger in `e2e/datecal.spec.ts`; a browser break). It is one more
listener of the Calendar window's own gesture on one more element; it was not walked by a helper — the browser test
drives it with real touch events at a phone's size, and his iPhone is the proof of the feel (§13). D801 — the Tracker's
date boxes — is NOT in this check: its own branch and its own check.

## 13. His look, and what is parked for him

**The card — five minutes on his own iPhone, on the preview link:**
1. Inputs → the gear → "Calendar…" → tap THU. **The From box sits inside the window** — nothing runs off the right edge.
2. Tap From. **The calendar is in the middle of the screen.** Tap the title: **scroll the months and the years with a
   finger** — they should come to rest on a row, and the title should follow. Tap the title again, tap a date: it
   picks and the calendar goes.
3. Back on the month: **slide a finger left and right** — the month turns. Do it starting ON a date's button: nothing
   on that date should change. Then, straight after a fast slide, **tap a date's button — it should respond at the
   first tap** (the test browser cannot show this one way or the other).
4. Holidays tab: slide for the year.
5. With a calendar open, **drag a finger up and down on the dimmed area** — the page behind should not move.
6. Leave War → tap a day → PO → "PO from": the calendar opens over the sheet; a date picked leaves the sheet up.

**Told to him, not asked** (say so if any should be different): a date can no longer be TYPED as figures on a desktop —
the arrows, Page Up / Down and the lists reach any date; the Today icon goes to today's month and does not pick it;
Escape closes the calendar first and the window behind on a second press; on a desktop the page dims lightly behind
the panel; in Admin's "A date range" one tap is already a whole run of one day; an arrow press in the Calendar window
does not slide the month in (a swipe does) — the Inputs calendar slides on both.

**The four questions put to him that night, and his answers:**

| # | The question, in the app's words | His answer ("All as recommended for questions 1-4") | What it became |
|---|---|---|---|
| 1 | Should a sideways finger turn the month of the new calendar itself — as it does on his iPhone's? | Yes — D800 | built into this step (§12) |
| 2 | The Tracker's three date boxes: a tap picks, or a tick at the top? | A tap picks, no tick — D801 (D798 replaced) | its own branch, cut from this one |
| 3 | Calendar step two tonight? | No — his look at step one first (D800) | not started |
| 4 | The scheduler's list of rulings: one list, or the Inputs pages their own? | Their own — D802 | a documents-only job of its own |

**Nothing is waiting for an answer.** Add to the card: on any date box's calendar, **slide a finger left and right on the
dates** — the month should turn, and a slide begun on a date should pick nothing.
