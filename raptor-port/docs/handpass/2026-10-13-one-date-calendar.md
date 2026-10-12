# `[ONE-DATE-CALENDAR]` step one — the bug check (WALK)

**Where it stands:** built, tests first; the host's own look at six sizes (§6); the browser tests green (§8). **In hand:**
the walk by three helpers (§7), the break tests (§9), the blind read of the finished code (§10), the gates (§12), his look
on his own iPhone (§13).

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

*(filled when the walkers report)*

## 8. What the tests found while it was built

| Found by | What | Disposition |
|---|---|---|
| `e2e/datecal.spec.ts`, first run | the year list scrolled 78 years on read 25 — the list's window of rows was re-centred and moved twice (the browser had already kept the rows in place) | fixed: the chosen row is put in the band outright; the browser's own keeping-in-place is off on the lists. The browser test is its guard |
| `e2e/leavewar.spec.ts` (an older test) | the From box's words had become 13px — the date box's own size won over the form's | fixed: "Every <weekday>" keeps its 16px heavy box |
| `leavewar/ui/datebox-sheet.test.tsx`, written first | on a touch screen a tap on the floating calendar was eaten by the Leave War's tap shield, and CLOSED the sheet whose date was being picked | fixed: the shield lets the calendar's layer through; red before |
| `selectsheet.test.tsx` (an older test) | it "typed" into a box that is now a button and still passed — it never checked the date | re-expressed: the date is picked on the calendar and the posting is asked for THAT date |

**Tests re-expressed, never weakened** (each typed into the phone's date box): `everyweekday.test.tsx`, `pi.test.tsx`,
`po.test.tsx`, `selectsheet.test.tsx`, `onedoor-users.test.tsx`; `e2e/leavewar.spec.ts` (two), `e2e/onedoor.spec.ts`.
**Two states those tests reached can no longer be reached on screen**, and each is now pinned as such: an end typed
BEFORE the start (a date before the start is faint — the form's own refusal is still reached by moving the start past
the end); an EMPTIED box ("Choose the date it starts." and Restore's "Pick the post-in date" have no door now — the
writers still refuse a missing date).

## 9. The break tests

*(filled when run)*

## 10. The read of the finished code

*(filled when the reader reports — a fresh, blind Opus reader, D790; not Fable's kind of change)*

## 11. What was NOT walked, and why

*(filled at the close)*

## 12. The gates

*(filled from the one run)*

## 13. His look, and what is parked for him

*(the card — written at the close)*
