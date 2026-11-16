# The schedule's small fixes — the bug check (17 Nov 26, the night's job 2)

Four backlog items of the schedule area, one branch and one check (D485, D490): `[ALLAVAIL-ESCAPE]` with the changes
window's Escape (`[CHGWIN-ESCAPE]`, ruled by D2112), `[WEEK-AA-CHIP-PHONE]`, the two React Doctor findings left in the
schedule's tap code (`[RD-LEFT-1108]`, `ui/interactions.ts`), and the rules check's unfinished checks
(`[RULES-CHECK-LEFTOVERS]`'s two old walk scripts, its missing end-to-end test, print and export walked). Branch
`claude/sched-small-fixes`, cut from `main` on 17 Nov 26. Written before the code (the checklist's step 4); the walk's
sections are left for the walker and the host to fill.

## 1. The eight answers and the tier

| # | Question | Answer, and why |
|---|---|---|
| 1 | Money | NO — nothing a man earns or is owed changes: Escape only closes two windows; the count's tap opens a window that reads; the React Doctor fix keeps the same list of names in the same order (a set beside it); the walk scripts and the new browser test change no app code. The earn half of the ALL AVAIL window keeps every tap it had. |
| 2 | The published record | NO — nothing is published, signed or amended by any of the four; the new browser test only READS that a published day keeps its OIL (D2044) |
| 3 | Saved data | NO — closing a window and focusing the count save nothing; the changes window's close turns History off exactly as its ✕ does |
| 4 | A shared drawer | YES — the count chip is drawn by one builder (`ui/html.ts`) on every seat that can hold ALL / ALL AVAIL, on the week, the board and View-only Sched; it gains `tabindex="-1"` |
| 5 | A new gesture or mode | YES — Escape on two windows is a new way out; the count becomes a place a finger lands on WebKit |
| 6 | A new surface | NO — nothing new is drawn |
| 7 | Roles | NO — the windows open for whoever opened them before; members keep the changes window read only |
| 8 | The warning list | NO — no warning's words or rule changes |

**Tier: WALK.** Rulings swept: D2112 (Escape closes the changes window), D38, D39, D40, D41, D77, D1106 (the ALL AVAIL
window: opened by the count, floating, never blocking, the phone's bottom panel), D167, D168, D338, D339, D345 (the
changes window: floating, its phone bar, History on while open), D1011 and D544 (Escape in a schedule box puts the old
value back), D1646 and D1771 (the keyboard's ring is the app's cyan ring), D551–D555 (the schedule's Tab route), D65
(a tap on a man in the window), D2005 and D2044 (a published day keeps the OIL it went out with), D1534 (React Doctor),
D1625 (anything new he will see is drawn first), the design guide §2 (Escape closes what opened last; the keys go back
to the opener). No clash between them found. D2112 was recorded on the night's own branch (`ffb4c0db7`), not yet on
`main`; this branch cites it and leaves its records to that branch.

## 2. The roll-call

**A. Escape closes the ALL AVAIL window** — one window, opened by one opener (`ui/availopen.ts`) from every count chip.

| Opened from | Escape closes it (SHOWS) | Opener reachable (USABLE) | What else answers Escape there (PAINTED / listening) | Seen in |
|---|---|---|---|---|
| Edit Schedule's week, desktop — a ground row, a Common Programme row, a duty desk, a sim seat, an input's row | has it | YES | a schedule box the keys are in (D1011: the box's own Escape first); an armed seat (put down first); the bell list | |
| Edit Schedule's week, phone (402 × 874, by touch) | has it | YES — MISSING before this change on WebKit (part C) | the same; the phone's bottom panel (D77) | |
| the Scheduler Board, desktop | has it | YES | the board's own Escape waits for the window (`boardescape.ts overBoard`) — the window closes, the board stays | |
| the Scheduler Board, phone layout and the desktop layout pinched on a phone | has it | YES | the same | |
| View-only Sched, a published day's face and a working day | has it | YES | nothing else | |
| a look at a published version (👁) on the board or the week | has it | YES | the same window, the version's list | |
| OIL Earn on (the earn half) | has it | YES | a tap there switches a man, never Escape | |
| with the changes window open too | has it — the one opened or pressed last answers first | YES | the changes window (part B) | |
| with a question sheet over it (the OIL question, an input's window) | must not — the sheet answers its own Escape first (`topSheet`) | — | the sheet | |

**B. Escape closes the changes window** (D2112).

| Opened from | Escape closes it | Opener reachable | What else answers Escape there | Seen in |
|---|---|---|---|---|
| the admin's clock icon on Edit Schedule's top bar | has it | YES | an armed seat, a schedule box, the bell list (as A) | |
| a day's count — "N pending", "N new", "N changes" — on the week | has it | YES | the same | |
| the same count on View-only Sched (a member, read only) | has it | YES | nothing else | |
| the board's strip count and its History button | has it — the board stays | YES | the board's own Escape waits (`overBoard`) | |
| the phone's slim bar (after Hide or a tap that went to a change) | has it — as its ✕, History off | YES | nothing else | |
| with the ALL AVAIL window open too | has it — the one opened or pressed last | YES | the ALL AVAIL window | |

**C. The count chip as a finger's target** — one builder (`ui/html.ts`, the ALL / ALL AVAIL chip), every place it is drawn.

| Where the chip is drawn | The tap opens the window, arms nothing (USABLE) | What else is on its pixels (PAINTED) | Seen in |
|---|---|---|---|
| Edit Schedule's week, phone — a ground row | MISSING before (WebKit: the row armed — reproduced, §10); has it after | the ALL AVAIL puck 2px above; the OG / ALn corner tag (`20-changes-quals.css`) | |
| the same — a Common Programme row, a duty desk, a sim seat, a passenger / extras line, an input's row | has it after | the same | |
| View-only Sched, phone | has it after | the puck | |
| the Scheduler Board, phone | has it (already before) | the puck | |
| desktop, every surface above | has it (a mouse never snapped) | the puck | |
| the keyboard: Tab never stops on the chip (`tabindex="-1"`) | must not stop — the schedule's Tab route (D551–D555) skips anything below 0 (`schedule-tab.ts`) | — | |
| the keys come back to the chip when the window closes | has it — the app's cyan ring there (`.oilcount:focus-visible`, D1646) | — | |

**D. The React Doctor fix** — one function (`ui/interactions.ts`, accepting an input onto the programme). The names it
says "came off its row" are the same names in the same order; carried by the input-accept tests (§5).

**E. The walk scripts and the browser test** — no app code; nothing drawn.

**Rows by kind of change (the order's §6):** a listener above its own component — the one Escape list on the document
(`sheetfocus.ts escTop`), alive while either window is up: under a question sheet (stands aside), with the keys in a
schedule box (stands aside, D1011), with a seat armed or the bell list opened after the window (stands aside), on
another page (both windows close on a page change, so nothing is alive), over the board (closes the window, the board
waits). A part drawn in several copies — the count chip, part C. A removed or replaced way out — none: ✕, a tap outside
(the changes window only) and a page change stay.

## 3. The five sizing lines

1. **Type of change:** C (a new way out — Escape — on two windows; a tap target), with D for the count chip drawn on
   every surface by one builder.
2. **What only a walk could find:** the real keys reaching each window from each opener, the other things that take
   Escape on the same page (a schedule box, an armed seat, the bell, the board, a question sheet), the order of two
   windows; a real finger on the count on the phone's week in WebKit and Chromium; where the keys land when a window
   closes. The tests carry the order of the Escape list and the chip's markup.
3. **What the ledger says:** type C, 15 walks, 8 found a fault (31 faults, the large finds on wide jobs); five small
   ones found nothing. Type D: every walk found something. The chip fix touches a part drawn in several places, so the
   walk covers every kind of row it sits on.
4. **The walk chosen:** one Sonnet 5.5 walker on the frozen build of this branch, his PC's 1536 × 864 and his iPhone's
   402 × 874 by touch, in WebKit and Chromium for part C. Scenarios:
   - W1 ALL AVAIL from each opener in part A (week, board, View-only, 👁, OIL Earn) → Escape: the keys nowhere, on the
     window's tab, on the count → closed; the keys back on the count; on the board the board stays and a second Escape
     closes it.
   - W2 the changes window from each opener in part B → Escape closes it, History off; the phone's slim bar → Escape.
   - W3 both windows: opened A then B → Escape closes B, then A; open both, press A's bar → Escape closes A first.
   - W4 a schedule time box with the window open: type a time, Escape → the old time back, the window stays; Escape
     again closes it. A seat armed after the window opened → Escape puts the seat down first; the bell list opened over
     it → Escape closes the bell first.
   - W5 a question sheet over the window (an input's window opened from a row behind it) → Escape closes the sheet only;
     an input's own window opened from a Personal Inputs row while ALL AVAIL is up → Escape closes the input window
     first (it is in front), the next Escape ALL AVAIL; ALL AVAIL closed by Escape → the next Escape reaches the input
     window still up.
   - W5b the count after Escape: the keys on it wear the cyan ring (D1646); a mouse click or a finger on it shows no ring.
   - W6 phone, by finger, WebKit and Chromium: the count on a ground row, a Common Programme row, an input's row, a duty
     desk and a sim seat on Edit Schedule's week; View-only Sched; the board → the window opens, nothing armed; the puck
     beside it still arms (placeholder) or selects (a named man) as before.
   - W7 the keyboard: Tab through a day on the week with an ALL AVAIL row → no stop on the count.
   - **Plain-user round (§7.0a):** on Edit Schedule, as a scheduler would: open a day's board, put ALL AVAIL on a ground
     row, open its window from the count, tap a man for his reason, close by ✕, by Escape, tap outside (stays), change
     page (closes); open the changes window from the clock, Hide and Show on the phone, ✕, Escape, tap outside; Undo
     and Redo after; then the week, the board and View-only Sched looked at for the row and its count.
   - **Print and export under D2005 (`[RULES-CHECK-LEFTOVERS]`):** a published day with a flag, a Logic setting changed
     after publishing (crew rest), then View-only Sched's print and the schedule's CSV export: both show the day as
     published — its flags by the settings it went out with; pictures of the print preview in Chromium and WebKit
     (lesson 18).
   Carried by tests, not walked: the Escape list's order and its stand-asides in every state (`ui/escwindows.test.tsx`);
   the chip's markup on every surface (one builder, `ui/escwindows.test.tsx`); a published earning day across a "Full
   day of OIL" change (`e2e/oilworkstart.spec.ts` D2044, through the app's real controls); the React Doctor fix
   (`ui/inputs.test.tsx` and the input-accept tests, through the real Accept).
5. **After the walk:** its row in `docs/walk-ledger.md` — to add.

## 4. The orders walked

(to fill at the walk)

## 5. Cases carried by a test

| Case | Test | What it proves | Through the real controls? |
|---|---|---|---|
| Escape closes the ALL AVAIL window, the keys back on the count | `src/ui/escwindows.test.tsx` | the window closes on a real keydown where the keys are | a real keydown through the mounted App |
| Escape closes the changes window (D2112) | the same | the same | the same |
| the last opened or pressed answers first; a seat armed after, the bell list, a schedule box and a question sheet stand first | the same | the order | the same |
| an input's own window (a FloatWindow) in front of ALL AVAIL answers first | the same — its "in front" set and cleared as the window does (`winorder.ts forward`, `gone`) | the stand-aside; the real window is W5 | no — the walk carries it |
| over the board, the changes window closes on Escape and the board stays (D2112) | `src/ui/boardescape.test.tsx` (changed: it said the window stayed) | the board waits, the next Escape closes it | a real keydown through the mounted App |
| the count is a finger's target on every surface | the same (`tabindex="-1"` on every chip the builder draws) | the markup; the real finger is W6 | no — the walk carries it |
| a published day keeps its OIL across "Full day of OIL" (D2044) | `e2e/oilworkstart.spec.ts` | the Leave War's cell holds, 1 pending, the four fall, the amendment moves it | yes |
| the strays named after an Accept | the input-accept tests (unchanged, green) | the same names | yes (the Accept button) |

## 6. Break tests

Red first, 17 Nov 26: the 13 cases of `src/ui/escwindows.test.tsx` written before the change all failed on the code of
`main` for the right reason — every Escape case "expected true to be false" (the window stayed open), the markup case
"expected null to be '-1'" — and all 13 passed after it. A 14th (an input's window in front) was added after the change;
on `main` its second Escape fails (the window stays). (The walk's break tests: to fill at the walk.)

## 7. Errors seen

(to fill at the walk)

## 8. What was not walked, and why

(to fill at the walk)

## 9. Gate counts

(to fill: GitHub's run on the last pushed commit)

## 10. What the walk and the reads found, and each disposition

**Before the build — the host's reproduction of `[WEEK-AA-CHIP-PHONE]` (17 Nov 26):** on the build served on port
4180 (code of `main` for this part), at 402 × 874 with touch, a finger tap at the centre of the week's count on a
ground row and on a Common Programme row: **WebKit armed the row (12 of 12 taps across three ways of tapping), the
window never opened; Chromium opened the window every time.** The point under the finger was the count in both
(`elementFromPoint`); WebKit sent the tap's mouse events and click to the puck's name instead — the puck is a place the
keys can land (`tabindex="0"`) and the count was not, so WebKit's finger adjustment preferred the puck. Giving the
count `tabindex="-1"` (or a listener of its own) made WebKit open the window and arm nothing; `role="button"` did not.
Real by D38 ("the count opens the window"), so fixed. His iPhone is still the proof (lesson 21): the test browser's
WebKit is not Safari on iOS. Pictures: `docs/img/handpass/2026-11-17-sched-small-fixes/before/`.

**After the build — the same script on this branch's own build (port 4182, 17 Nov 26):** 12 of 12 finger taps opened
the window and armed nothing — WebKit and Chromium, a ground row and a Common Programme row, three ways of tapping each
(WebKit was 0 of 6 before). Pictures: `docs/img/handpass/2026-11-17-sched-small-fixes/after/`. Not yet the walk (W6
covers the other rows and the puck beside the count), and not yet his iPhone.

**The builder's checks, 17 Nov 26 (before the walk):** the full unit suite under the lock — 14,538 passed, 1 failed:
the Leave War's `doubletap-windows.test.tsx` "the event window's Save, and then its Delete", a test of real 650 ms
waits that touches nothing changed here; it passed alone twice after — a load flake of a ten-minute run, noted, not
fixed. Five browser test files on this branch's build (oilworkstart with the new D2044 case, availwin, changeswin,
board-escape-traffic, keys-windows): 63 passed.

## The closing lines

(to fill)
