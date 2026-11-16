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

**The walk** (one Sonnet 5.5 walker, 17 Nov 26, 03:05–03:45, on the served build of a3164107a; summary
`2026-11-17-sched-small-fixes/walk-report.md`, scripts and 142 pictures beside it in `img/`). Desktop 1536 × 864
Chromium; his iPhone's 402 × 874 by touch in WebKit and Chromium.

| Order | Result |
|---|---|
| W1 ALL AVAIL from each opener (a Common Programme row, a sim seat, a ground row with the keys on ✕, the board, View-only Sched, a 👁 look, OIL Earn) → Escape | PASS — closed, the keys back on the count; on the board the board stayed and a second Escape closed it |
| W2 the changes window from the clock, a day's count, the board's strip count and History; on the phone the clock, Hide's slim bar, Hide / Show / ✕, a day's count | PASS — Escape closed it, History off, the board stayed; a tap outside left it up (D1442) |
| W3 both windows: opened one then the other, both orders; the older one's bar pressed | PASS — newest first; the pressed one answered first |
| W4 a time box typed, then Escape; a seat armed after the window; the bell's list over it | PASS — the old time back, the window stayed, the next Escape closed it; the seat put down first; the bell first |
| W5 an input's window over ALL AVAIL; ALL AVAIL in front of an input's window; a question sheet over it | input's window over ALL AVAIL PASS; the other two not walkable — the input's window is a dimmed modal over the schedule, and no question sheet came up (the lead, §10) |
| W5b the count after Escape | PASS — the 2px cyan ring by the keys, none after a mouse click |
| W6 phone, by finger, WebKit and Chromium: the count on a Common Programme row, a sim seat, a ground row, an input's row (Sat 25 Jul), View-only Sched, the board | PASS — the window opened, nothing armed; the puck beside still arms |
| W7 Tab through a day with an ALL AVAIL row | PASS (weak) — 120 Tabs, never on the count |
| Plain-user round, desktop: board count → window → a man's reason; ✕ and Escape; a tap outside; ✓ Done and a page change; the changes window the same; Undo and Redo | PASS |
| Print and export under D2005, Chromium and WebKit: a published Monday with a flag, crew rest raised 12h → 20h, then print and the CSV | PASS — the Monday kept its 17 issues and 6 warnings; an unpublished Tuesday moved 4 / 2 → 12 / 10; print and CSV byte for byte the same before and after |

**The re-walk after the code reads' fixes** (one Sonnet 5.5 walker, 17 Nov 26, 04:20–04:30, on the served build of
c96154e0d; summary `2026-11-17-sched-small-fixes/rewalk-report.md`, scripts `rw*.mjs` and 65 pictures `img/rw*`):

| Order | Result |
|---|---|
| R1 ☰ over ALL AVAIL and over the changes window (Chromium 820 × 864) → Escape, Escape | PASS — the menu alone, then the window (the host opened `rw1-aa-after-esc1`: the menu gone, the window up) |
| R2 Edit Schedule's ⋯, View-only Sched's ⋯ and the board's ⋯ over a window (402 × 874 by touch, WebKit and Chromium) → Escape, Escape | PASS — the menu alone, then the window; the board stayed |
| R3 ALL AVAIL open, a seat armed, the window's bar pressed (1536) → Escape, Escape | PASS — the window closed, the seat stayed armed; the second Escape put it down |
| R4 count A (22 Jul) then count B (25 Jul), Tab into the window → Escape; again after a real edit that redrew the week | PASS — the keys on B with the cyan ring, both times |
| R5 the holiday OIL list, ALL AVAIL, then History → three Escapes | NOT WALKED — §8 |
| R6 an input's window and ALL AVAIL, ALL AVAIL closed by ✕ → Escape | PASS as two variants only — §8 |
| R7 the first walk's smoke: the week, the clock, the board (stays on the first Escape), the phone tap in WebKit and Chromium | PASS |

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

**The code reads' findings, red first (17 Nov 26, after the reads):** ten cases added to `src/ui/escwindows.test.tsx`,
each through a real keydown on the mounted App and the real controls (the count chips, ☰, the ⋯ buttons, History, the
window's ✕), run on commit 8bb07e571's code before any fix — **10 failed, 14 passed** — then **24 of 24 passed** after:

| Finding | Case | Red on 8bb07e571, for the right reason | Green after |
|---|---|---|---|
| A | the ☰ side menu over ALL AVAIL: one Escape closes the menu only; the next the window | "the window under it stays: expected false to be true" | yes |
| A | the ☰ side menu over the changes window | the same | yes |
| A | Edit Schedule's phone ⋯ menu (400 wide) over ALL AVAIL | the same | yes |
| A | the board's ⋯ menu over ALL AVAIL; the board stays | the same | yes |
| B | pressed after a seat was armed: Escape closes the window, the seat stays armed | "expected true to be false" (the window stayed) | yes |
| B | opened again from another count after a seat was armed | the same | yes |
| C | the holiday OIL list, then ALL AVAIL, then the changes window: Escape closes them newest first | "expected 'oilday' to be 'avail'" (the OIL list came in front) | yes |
| D | count A, then count B, a redraw, then Escape: the keys are on B | "expected '1' to be '2'" (the keys went to A) | yes |
| E | ALL AVAIL opened over a window of the input kind, closed by ✕: that window is in front again | "expected 'avail' to be 'inputedit'" | yes |
| E | the changes window closed by ✕: the same | "expected 'chg' to be 'inputedit'" | yes |


## 7. Errors seen

None. No console error, page error or failed request (4xx) in either walk.

## 8. What was not walked, and why

- **R5, the holiday OIL list under ALL AVAIL and History:** the demo data raised no holiday OIL-answer list
  (`img/rw5-bell.png`). Carried by the three-window test in `src/ui/escwindows.test.tsx` (finding C, §6), through the
  real keydown and the real History and count controls.
- **R6 as written:** the input's window is a dimmed modal over ALL AVAIL, so ALL AVAIL's ✕ cannot be pressed under it
  (`img/rw6-both-open.png`). Pressed only as two variants — ALL AVAIL's ✕ first, then the input's window, Escape; and
  a script click on the ✕ — both closed the input's window. Nothing was typed, so its question was not met. Finding E
  is carried by its two red-first tests (§6).
- **A duty desk with ALL AVAIL:** the walk's drag did not land ALL AVAIL on a desk; the count on a desk is drawn by the
  same one builder as on the rows walked (part C of the roll-call).
- **A real iPhone:** the phone walks were synthetic touches in the test browser's WebKit, not Safari on iOS (lesson
  21) — his look owes it, above all for the count's tap (`[WEEK-AA-CHIP-PHONE]`).
- **The phone's on-screen Escape:** a phone has no Escape key of its own; the keyboard was driven by the test
  browser, not an iPad or phone keyboard with an Escape key.

## 9. Gate counts

On his PC, after the code reads' fixes (17 Nov 26), under the checks lock: every unit test file of `src/ui` that
presses Escape or opens ☰, a ⋯ menu, ALL AVAIL, the changes window or the window order — **86 files, 2,407 passed, 0
failed**; `npm run build` passed (its type check with it); `npm run lint:changed` — no new finding; `npm run docsize`
OK; `npm run rulecheck` OK.

GitHub's run on commit 8bb07e571 was **red on one check, the code check**: 18 notes in the walk's own scripts
(`docs/handpass/2026-11-17-sched-small-fixes/*.mjs` — a walk drives one browser step after step, which the check reads
as awaits that could run together); each kept with its reason on the line above, as earlier walks' scripts are. App
code had none. GitHub's run on the commit pushed with these fixes: (to fill when it finishes)

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

**The two final code reads (17 Nov 26) — Astra's (`read-astra.md`) and the fresh, blind Opus reader's (`read-opus.md`),
each blind to the other — and what became of each:**

| # | Finding | Readers | Disposition |
|---|---|---|---|
| A | Escape over a newer menu — the ☰ side menu, Edit Schedule's and View-only Sched's phone ⋯, the board's ⋯ — also closed the ALL AVAIL or changes window under it: each menu kept its own Escape listener on the document beside the one list's, and a press stopped there still reaches every listener on it | Astra 1 (MUST), Opus 1 (MUST) | **Real, fixed red-first** (§6): the three menus' Escape joins the one list (`sheetfocus.ts escCloses` — `Drawer.tsx`, `ScheduleInsightsMenu.tsx`, `SchedBoard.tsx`), so the newest answers alone; each keeps its own close and gives the keys back as before. The other Escape listeners in `src/ui` checked: the question sheets (DocConfirm, DocViewer, MedClashConfirm, OilConfirm, UpchitConfirm, the input's pop-up) stand over the list by `topSheet`; the date box, its calendar and the type legend listen on the window and stop the key before the list hears it; the bell's list and the windows of FloatWindow.tsx are in `makeEscWaits`; the Inputs, Logic, Medical and SANS pages' menus live where neither window can be up (both close on a page change); the Leave War's question cards likewise |
| B | Opened again from another count, or pressed, the window did not take Escape back from a seat armed earlier | Astra 3 (MUST), Opus 2 (SHOULD) | **Real, fixed red-first**: the stand-aside is made again each time the window comes forward (`escToTop` rebuilds it from the entry's `makeWaits`) |
| C | Closing History could bring the bell's holiday OIL list in front of ALL AVAIL, and the next Escape go to the OIL list — which can throw away its choices | Astra 2 (MUST) | **Real, fixed red-first**: both windows stand in the window order from the moment a door opens them and whenever pressed (`winorder.ts forward`), and leave it however they close (`gone` — ✕, Escape, the toggle, and a page, week or version change through the window's own clean-up) |
| D | ALL AVAIL opened again from count B while up from count A: Escape gave the keys back to A | Astra 4 (MUST) | **Real, fixed red-first**: each explicit opening is counted (`floatwin.ts countOpen`) and the count is the window's open key for the list (`useEscWindow`), so the entry joins afresh with the new opener; a redraw changes nothing |
| E | ✕ on either window left "in front" naming it, so the window under it took no Escape until pressed | Opus 3 (SHOULD, older beside it); Astra's tidiness note | **Real, fixed red-first**: one close per window (`availopen.ts closeAvailWin`, `changesopen.ts closeChanges`) for ✕, Escape and the toggle |
| F | Stale words: `boardescape.ts`'s head said the two windows do not close on Escape; `ui-contracts.md` §[ALL-AVAIL-WINDOW]'s "How it dismisses" lacked Escape; `escWaits` read as a test but made one | Opus tidiness | **Fixed**: both texts corrected (the contract also states A–E); `escWaits` renamed `makeEscWaits`, the hook's and the entry's option `makeWaits`; `feature-impact.md` and `file-map.md` follow |
| — | `seen` mirrors `strays` in `interactions.ts` | Opus tidiness | Filed, not fixed (D489's tidiness note) |

**The walk's lead — the schedule's input pop-up closes on Escape or ✕ without "Close it and lose them?":** reproduced
on this branch's build and on a build of `main`'s code (5632936d5), from Edit Schedule and from the Inputs page — the
same on both: **old behaviour, not this change's.** The Inputs page's window asks; the schedule's pop-up never does
(typing in Remarks counts as unsaved there too). A question for him, to be filed — not changed here.

## The closing lines

Walk: docs/handpass/2026-11-17-sched-small-fixes.md · 211 pictures (142 the walk, 65 the re-walk, 4 the host's
reproduction) · 25 surfaces (the roll-call's 21 rows walked, and the ☰ menu and the three ⋯ menus in the re-walk) ·
16 orders (10 the walk, 6 the re-walk) · MISSING: a question sheet over the window and ALL AVAIL in front of an
input's window — not reachable (the input's window is a dimmed modal); R5 — carried by a test; a duty desk, a real
iPhone and an on-screen Escape — not walked, §8; the lead filed `[INPUT-WIN-SCHED-ASKS]`.

Reads: Astra's and the fresh, blind Opus reader's final code reads, each blind to the other — both read; every
finding fixed red-first and re-walked (A–F, §10); the tidiness note filed `[SCHED-SMALL-TIDY]`.

Docs: OUTSTANDING 176 items (+2 −0) · DECISIONS D1–D2098 · homes OK
docsize: OK
