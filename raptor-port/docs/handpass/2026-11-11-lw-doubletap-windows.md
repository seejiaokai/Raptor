# Evidence sheet — the Leave War's double tap on its other windows (`claude/lw-doubletap-windows`, pull request 759) — 11 Nov 26, chat 64, job 4

`[LW-DOUBLETAP-OTHER-WINDOWS]` — on a phone, after one of the Leave War's windows closes by a tap, a fast second tap in
the same place no longer reaches the grid behind it. The guard built on 6 Nov 26 for the one-day and drag windows now
covers the person window, ⚙ Settings, the event window, the counter form, the Events list, the Manning sheet, the OIL
tracker and the event box. Pictures: `docs/img/handpass/2026-11-11-lw-doubletap-windows/`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money / OIL / who counts as present | NO — a tap is swallowed or let through; no figure is worked out |
| 2 | The published record | NO — nothing of a schedule is read or written |
| 3 | Saved data | NO — the guard keeps nothing; no record is written by it |
| 4 | A shared drawer | NO new one — but ONE guard now serves every window over the grid, so the roll-call is every window and every way it closes |
| 5 | A new gesture or mode | **YES** in effect — what a fast second tap does after a close changes on eight windows |
| 6 | A new surface | NO |
| 7 | Roles | NO — who may open which window is untouched (a member walked) |
| 8 | The warning list | NO |

**Tier: WALK.** The night's plan adds Astra's read and a fresh, blind Opus read of the finished code (D1770, D790).

## 2. The rulings that apply

Run ids: W the first walk (on `245dd9a4e`), R the re-walk (on the last build, `0dc2e0dc8`). Sizes: ph a phone 402×874 by
real touch in Chromium, WK WebKit at the phone's size, pc a desktop 1280×800 by mouse.

| Ruling | In the app's words | Result |
|---|---|---|
| The item itself (the code read's F1 of 6 Nov 26) | after a window over the grid closes by a tap, a fast second tap in the same place does not open a day | PASS — W1: every closing control of the eight windows, the second tap 120 ms and 350 ms after the first; WK for four; again after the fix round at 120 ms — seven closing controls in Chromium, two in WebKit, and the ✕ held 1.3 s (R2) |
| D262 (the guard asks a place as well as a time) | a deliberate tap made quickly on another day goes through | PASS — a day 252px away 150 ms after the close opens (W2b); 20px off is swallowed, as the 32px says (W3); again after the fix round (R3) |
| D1645 | the top bar stays pressable | PASS — Undo, the bell and the menu button answer right after a close (W2c). The Events list's ✕ stands over the bell, so a double tap there opens the bell's list — put to him (the block's question 1) |
| The owner's 4 Sep 26 rule (a pop-up closes on a press outside it) | a window closed by a tap beside it | as built: the event window closes on a tap on the grid beside it and the same spot tapped again opens that day — the 6 Nov guard's own reading, put to him (the block's question 2); ⚙ Settings does not close by a tap beside it (W2d) |
| D1567 / D1282 | a pinch zooms the grid | PASS — a pinch begun right after a guarded close zooms the grid (7733 → 4719 wide, W2e); a finger's scroll right after a close: not proven — the walker's scripted finger scroll moved nothing even with no window opened (both walks), so it shows nothing either way; the guard listens only for a click on the grid, never a scroll's touches (both reads); named for his iPhone look |
| D785 | a member opens only his own windows | PASS — the member's own person window and a day's bid window double tapped: nothing opens behind; a day tapped 1 s later opens (W5) |
| D1557 | the plain-user round of the screen | PASS — phone and desktop (R5): a day opened and closed; a person; ⚙ Settings and ＋ Counter, Events… with an event from the list, Calendar…; the Manning sheet and Edit counter…; the OIL tab; the four tabs; a leave placed, Undo, Redo, Undo — each opens, closes and opens again, and a day tapped 1 s after every close opens (on the desktop the day tap after Manning's Edit counter… was not run — the script found no cell) |
| D1281 | on a phone, a picture right after each tap | every phone case pictured about 100 ms after the second tap and again settled |

(The Leave War's rulings and architecture: `.claude/rules/decisions/leave-war.md`, `.claude/rules/seams/leave-war.md`.)

## 3. The roll-call

The thing: a window over the Leave War's grid, and each way a tap closes it. "Guarded" = a fast second tap at that
place is swallowed.

| # | Window | Its ways to close by a tap | Guarded? | Walked |
|---|---|---|---|---|
| 1 | The one-day window and its family (the bid picker, the day's list, remarks, the approved-leave and closed-day windows, the credited-OIL window, the posting sheets) | ✕, a leave placed, Delete, Post out | has it — since 6 Nov 26, unchanged (one bit with the drag window) | ✕ at 120 and 350 ms: nothing opens (W1); again after the fix round (R2) |
| 2 | The drag window | ✕, a leave placed, Delete | has it — since 6 Nov 26, unchanged | opened by a finger's long press and drag across three days; its ✕ double tapped at 120 ms: nothing opens (R4a, `rw-r4b/001`–`003`) |
| 3 | The person window (and My leave) | ✕; a leave line; the OIL line (opens the tracker) | has it — new | ✕ ph, WK, pc, a member (W1, W4, W5); a leave line: tapped twice at 120 ms — the window closes, the second tap opens nothing (R4b) |
| 4 | ⚙ Settings | ✕, Rearrange the grid, and its hand-overs (＋ Counter, Events…, Calendar…) | has it — new | ✕ and Rearrange ph; ✕ WK, pc (W1, W4) |
| 5 | The event window | ✕, Save, Delete, Move… | has it — new | all four ph; ✕ WK, pc (W1, W4) |
| 6 | The counter form | ✕, Cancel, Save, Delete (after its "Really delete?") | has it — new | all four ph; ✕ pc (W1, W4) |
| 7 | The Events list | ✕ | has it — new; on a phone its ✕ stands over the top bar's bell, never the grid, so the second tap opens the bell's list (question 1) | ph (picture `run2-w1-chromium/041…`), pc (W1, W4) |
| 8 | The Manning sheet | ✕, Edit counter… (hands over) | has it — new | ✕ ph, WK, pc (W1, W4) |
| 9 | The OIL tracker (full screen) | ✕ | has it — new; its ✕ too stands over the top bar | ph, pc: nothing opens (W1, W4) |
| 10 | The event box (the small box a tap on an event opens) | Edit (hands over to the event window); a tap anywhere else; a scroll, a resize, Escape, a pinch | Edit: has it — new. A close WITHOUT a tap must not arm the guard — fixed in the fix round and walked (R1) | Edit by one tap opens the event window (`run4-probe`); by a double tap: see §15, older |
| 11 | The Required rows' panel, rename form and number pad; the day-details panel (‹ › ✕); the under-manned days list; the move banners' Confirm and Cancel; New period; Open for bidding on a desktop | their own ✕ / Done / Confirm | **MISSING — older than this change** (their open state lives outside the grid's own file, so the guard does not see them go); filed, `[LW-DOUBLETAP-MORE-WINDOWS]` | not walked — §12 |
| 12 | The Legend; the quals pop-up; Grades, Balances, Approvals; the document viewer | — | must not, because none exposes the grid under its own closing control (the Legend closes only by a tap outside it; the pop-up takes no presses; the pages replace the grid; the viewer stands over a window) | — |

## 4. The door check (the place a second tap lands)

| State | The second tap | Result |
|---|---|---|
| Phone, a guarded close, same spot, 120 ms and 350 ms | swallowed — nothing opens, Undo gains nothing beyond the window's own action | PASS (W1) |
| Phone, 550 ms | swallowed | PASS (W3) |
| Phone, 700 ms and 800 ms | goes through — the day's bid window opens | PASS (W3, W2a) |
| Phone, 20px off | swallowed (inside 32px) | PASS (W3) |
| Phone, a day 60px and more away, within 300 ms | goes through | PASS (W2b: 252px, 150 ms) |
| Phone, a triple tap | nothing opens | PASS (W3) |
| Phone, ✕ held 600 ms, then a tap 100 ms later | swallowed | PASS (W3); held 1.3 s: swallowed too (R2, `rw-r2hold`) |
| Phone, the top bar right after a close | Undo, the bell, the menu answer | PASS (W2c) |
| Phone, a pinch right after a close | zooms | PASS (W2e) |
| Phone, the window opened again at once by its own button | opens | PASS (W2f) |
| Phone, the event box closed by a swipe, a pinch — then a tap on a day | goes through — the day opens | PASS — a swipe begun on the box, at three events: the box closes, and a tap 5–7px from the first touch about 200 ms later opens that day's bid window (R1a, `rw-r1/003`, `006`, `009`); a pinch closes the box and a day 32px away opens at 150 ms (R1b) |
| Touch laptop, the event box closed by Escape — then a touch on a day | goes through | PASS — Escape closes the box and the next touch on a day opens it (R1c); the nearest day stood 68–76px from the touch inside the box, so the guard's 32px was not reached on a desktop — the same-place case is the unit test's |
| Desktop, a mouse's double click on each window's ✕ | the same as a single click — nothing opens behind | PASS (W4, all eight) |
| A member, phone | his person window's ✕ and a day's bid window's ✕ double tapped: nothing behind; a day 1 s later opens | PASS (W5) |

## 5. The five sizing lines (D607)

1. **Type:** C (what a gesture — a second tap — does in a place) on a dense phone screen; no new surface.
2. **What only a walk could find:** where a real finger's second tap lands under each window's closing control at a phone's size (the builder's browser tests showed the Events list's and the OIL tracker's ✕ stand over the top bar, not the grid); the timing of a real touch's click against the guard's 600 ms; WebKit; every "must still get through" by touch. The tests already carry: each window's bit arming the guard (17 unit cases), 11 browser cases by real touch in Chromium.
3. **What the ledger says:** the 6 Nov 26 walk of the first guard found the touch click arriving about 440 ms after the close (the guard's time was set from it) and a month button eaten — faults only a walk by touch showed.
4. **The walk chosen:** one Sonnet walker, scripted, on the served production build: a phone 402×874 by real touch in Chromium (each window × each way it closes, at two gaps), WebKit for four windows, a desktop 1280×800 by mouse, a member; then a re-walk of what the fix round touched, with the plain-user round.
5. **After the walk:** its row in `docs/walk-ledger.md`.

## 6. The lessons of §7.11 — each against this change

| # | The lesson, short | What covers it here — or why it cannot apply |
|---|---|---|
| 1 | every state × every reading | each window × each way it closes × two gaps (W1); the readings: nothing opens, Undo unchanged |
| 2 | a gesture at a person's speed | the second tap at 120, 350, 550, 700 and 800 ms; a triple tap; a held ✕ (W3) |
| 3 | feedback looked for | the change has none of its own — a swallowed tap shows nothing, by design; the window's own close is the feedback (pictured) |
| 4 | the page behind an open window | the whole subject: what the grid behind does at the moment a window goes — pictured 100 ms after and settled |
| 5 | a thing brought into sight against what stands over it | cannot apply — nothing is brought into sight |
| 6 | what only the real phone draws | a real finger's double tap on his iPhone — on his look card (§12) |
| 7 | a mechanism tuned to a model of the phone | the 600 ms and the 32px were set from Chromium's touch click (about 440 ms); WebKit walked for four windows (W1 WK) and named for his iPhone look |
| 8 | an approved drawing | cannot apply — no look changes |
| 9 | a list measured, in every kind | cannot apply — no list or layout changes |
| 10 | a way back to a page | the four tabs left and returned to, and the OIL tab opened and closed: a day tapped after each opens (R5) |
| 11 | a reading that depends on how much fits | where the second tap lands depends on the screen: walked at 402×874 and 1280×800; the Events list's and OIL tracker's ✕ over the top bar is the phone's layout (question 1) |
| 12 | a window opened from one page only | the OIL tracker is reached from the OIL tab and from a person's OIL line; the person window from a name and from My leave — the guard is on the window's going, whatever opened it (unit cases); walked from the grid |
| 13 | a pinch part-way down a list | a pinch right after a close (W2e); a pinch with the event box open closes the box and the next tap on a day opens it (R1b) |
| 14 | every box to type in | cannot apply — no box |
| 15 | a pinned bar by what it lets through | cannot apply — nothing pinned changes |
| 16 | a warning cleared only by a new value | cannot apply |
| 17 | a control that changes a page's width | cannot apply |
| 18 | what only a real print or download shows | cannot apply |
| 19 | a window over a window | the hand-overs (Settings → the counter form, the Manning sheet → the counter form, the event box → the event window): the new window's own buttons are not on the grid, so the guard cannot eat them (both reads, unit cases added in the fix round); the person window staying up while another closes (a unit case added in the fix round) |
| 20 | a gesture the ways a hand does it | W3: a triple tap, the second finger 20px off, the gaps either side of the guard's time, a hold then a tap |
| 21 | a test browser's touch is not his phone's | said in §12 and on his look card: a quick double tap on a ✕ over the grid on his iPhone |
| 22 | "shown" judged by what is drawn | "nothing opened" was judged from the picture and from the list of windows on screen, the host opening the deciding pictures (§9) |
| 23 | what a tap opens, against the rulings | the tap that must still open a day (after the time, elsewhere) opens that day's bid window, as it does on `main` |
| 23 (second) | a fault in the picture, looked past | the host looked at the whole screen in each deciding picture — the event window missing after the double tap on Edit was seen there (§15) |
| 24 | a flick to the page's foot on a phone | cannot apply — no scrolling part changes; a scroll right after a close: not proven — the walker's scripted finger scroll moved nothing even with no window opened (both walks), so it shows nothing either way; the guard listens only for a click on the grid, never a scroll's touches (both reads); named for his iPhone look |
| 25 | only where the demo already had it | the event double tapped was made by the walker ("Range day"), and the counter saved by it, not only seeded ones |
| 26 | a gesture by where the thing went | cannot apply — nothing is carried |
| 27 | a control's place across the change beside it | cannot apply — no control moves |
| 28 | a press by a script that scrolls first | the first run's script scrolled the page before two cases (the event box's Edit, the counter's Save) — re-run without the scroll (`run3-w1-peek-save`), those the citable ones |
| 29 | a page left open while the day turns | cannot apply |
| 30 | a tint left by a press | pictured within about 100 ms of the second tap on every phone case — no press tint left on the grid |

## 7. The orders walked

| # | Order | Result |
|---|---|---|
| 1–20 | W1, phone: open the window → double tap its closing control, the second tap 120 ms later; again at 350 ms — the person window ✕; ⚙ Settings ✕ and Rearrange; the event window ✕, Save, Delete, Move…; the counter form ✕, Cancel, Save, Delete; the Events list ✕; the Manning sheet ✕; the OIL tracker ✕; the event box's Edit; the one-day window ✕ | nothing opens behind in every case; the Events list's ✕: the bell's list opens (question 1); the event box's Edit: §15 |
| 21–24 | W1 WK: the person window, ⚙ Settings, the event window, the Manning sheet — ✕ double tapped at 120 ms | nothing opens |
| 25 | W2a: a guarded close → 800 ms → the same spot | the day's bid window opens |
| 26 | W2b: a guarded close → 150 ms → a day 252px away | opens |
| 27 | W2c: a guarded close → Undo; the bell; the menu button | each answers |
| 28 | W2d: the event window closed by a tap on the grid beside it → the same spot again | that day's bid window opens (as built, question 2); ⚙ Settings stays open under a tap beside it |
| 29 | W2e: a guarded close → a pinch at once | the grid zooms |
| 30 | W2f: close → open again at once by its own button | opens |
| 31–45 | W3, on three windows (person, counter form, event): a triple tap; the second finger 20px off; 550 ms; 700 ms; ✕ held 600 ms then a tap | swallowed, swallowed, swallowed, goes through, swallowed |
| 46–53 | W4, desktop: a mouse's double click on each of the eight windows' ✕ (the event box: Edit) | nothing opens behind; Undo unchanged; the event window opens and stays |
| 54–55 | W5, a member, phone: his person window ✕ double tapped; a day's bid window ✕ double tapped, then a day 1 s later | nothing behind; the day opens |
| 56–63 | R1, after the fix round: the event box open → a swipe begun on it (three events) → a tap beside the first touch; the name tapped inside it → a pinch → a tap on a day; a touch laptop: the name touched → Escape → a touch on a day; the name tapped → 2 s → a tap on the grid; Edit by one tap; Edit by a double tap | the day opens each time (the fixed case); the grid tap that closes the box opens its own day, as before; Edit by one tap opens the event window and it stays; by a double tap no window is left open (§15, 3) |
| 64–73 | R2: the second tap 120 ms after the first on the person window ✕ (and WK), ⚙ Settings ✕, the event window ✕ (and WK) and Save, the counter form's Cancel, the Manning sheet ✕, the one-day window ✕; the person window's ✕ held 1.3 s then a tap | nothing opens |
| 74–78 | R3: the same spot after 800 ms; a day 252px away at 100 ms; Undo; the bell; the menu button | opens; opens; each answers |
| 79–80 | R4: the drag window (a long press and a drag across three days) → its ✕ double tapped; a leave line in the person window tapped twice | nothing opens behind either |
| 81–82 | R5: the plain-user round on the phone, then on the desktop by mouse | every window opens, closes and opens again; a day tapped 1 s after each close opens |

## 8. The cases carried by a test

| Case | Test |
|---|---|
| Each of the eight windows going arms the guard: the second tap at that place is swallowed (one case a window and way of closing) | `src/leavewar/ui/doubletap-windows.test.tsx` (unit) |
| The first guard unchanged — the one-day and drag windows, the month buttons, a mouse's single click, a key, a tap elsewhere, after the time | `src/leavewar/ui/doubletap.test.tsx` (11 cases, unchanged, green) |
| By real touch at a phone's size: the counter form's ✕ and Cancel, the Manning sheet's ✕, the event window's ✕ and Save, the person window's ✕, ⚙ Settings' ✕ (red on `main`, green here); the Events list's ✕, the OIL tracker's ✕ and the event box's Edit (green on `main` too — regression checks) | `e2e/doubletap-leavewar.spec.ts` (11 cases, the phone project) |
| The fix round: the event box closed by Escape, a scroll, a resize, or with a press 650 ms old, then a tap on the day → opens; a swipe begun on the box (a cancelled touch, then a scroll) → opens; a press 1.2 s old and the OIL tracker gone without a press → opens; a cancelled touch alone; the ✕ held 1.2 s then released → the second tap still swallowed | `doubletap-windows.test.tsx` (the fix round's cases — the two unit files 43 cases in all, with the follow-up's) |
| Two windows up and one closes (the person window stays); a hand-over (Settings → ＋ Counter, the event box's Edit → the event window); a save that keeps its window open arms nothing | `doubletap-windows.test.tsx` (six cases, green before and after — no app change) |

Not carried by any test: the pinch's start closing the event box (jsdom cannot pinch) — the re-walk's R1b.

## 9. The pictures

The first walk: `run2-w1-chromium` (64 — W1, every window, both gaps), `run3-w1-peek-save` (8 — the event box's Edit and
the counter's Save, re-run without the script's page scroll), `run4-probe` (2 — the event box, and its Edit by one
tap), `run5-w1-webkit` (8), `run6-w2` (11), `run9-w3` (30), `run12-w4` (16), `run13-w5` (5) — 144 pictures; `run1` is a
partial early run, not cited. The re-walk: `rw-r1` (21), `rw-r1c` (2), `rw-r2-cr` (14), `rw-r2-wk` (4), `rw-r2hold` (2), `rw-r3` (11), `rw-r4b` (6), `rw-r5` (54), `rw-r5b` (21), `rw-r5c` (2) — 137 pictures; `rw-r4` is a failed first attempt, not cited. 281 in all.

Opened by the host: `run4-probe/001` (the event box over the grid, Edit at the right) and `002` (Edit by one tap — the
event window open); `run3-w1-peek-save/005` (after the double tap on Edit — no window, the box gone, the grid
untouched: the second tap closed the event window it had just opened — older, §15); `rw-r1/003` (after a swipe begun on the event box and a tap on a day: Drifter's Tue 6 Jan bid window open, the box gone — the fixed case).

## 10. The break tests

- Each new unit test was shown RED before its fix: the build's 17 on `main`'s code (`f5a0c99f7` before `245dd9a4e`); the fix round's on `245dd9a4e` (`c67c12261` before `be789fdc7`) — four for the event box's Escape, scroll, resize and old press, two for the swipe and the 1.2 s-old press.
- The cancelled-touch test passes on the old code by another route, so its red was shown by switching the new listener off.
- The browser cases: seven red on `main`, green here; three green on `main` too (said so in the file) — they guard against a regression, they do not prove the fix.
- The Opus read checked the red tests against `main` by reading: none hollow.

## 11. Errors seen

No console error, page error or failed request in any run of the walk or the re-walk, but one: at the very last step of the re-walk's first desktop script the browser tab itself crashed ("Target crashed") while a 30-second wait on a missing cell ran with several other browsers open on the PC; the same sequence run twice more (`rw-r5b`, `rw-r5c`) showed nothing — recorded, not reproduced.

## 12. What was not walked, and why

- **His iPhone.** Every phone case ran in a test browser's touch (Chromium, and WebKit for four windows), not Safari on his phone. For his look: a quick double tap on the ✕ of the person window, ⚙ Settings and the event window where a day stands under the ✕ — nothing should open behind; then a tap on a day a second later — it should open.
- **The windows of `[LW-DOUBLETAP-MORE-WINDOWS]`** (the Required rows' panel, rename form and number pad, the day-details panel, the under-manned days list, the move banners, New period, Open for bidding on a desktop) — not built, so not walked; found by the two reads.
- A pen; a tablet's size; the person window opened from My leave and the OIL tracker opened from a person's OIL line (the guard is on the window's going, whatever opened it — unit cases).
- A finger's scroll right after a close in the first walk: the script's scroll moved nothing even with no window opened, so it proves nothing — not proven — the walker's scripted finger scroll moved nothing even with no window opened (both walks), so it shows nothing either way; the guard listens only for a click on the grid, never a scroll's touches (both reads); named for his iPhone look.
- The re-walk's two gaps: a touch laptop's touch within 30px of the press inside the event box (the event rows stand apart from the day rows there); the desktop's day tap after the Manning sheet's Edit counter….

## 13. The gate counts

| Check | Where | Result |
|---|---|---|
| The two unit files | his PC, on `0dc2e0dc8` | 43 pass (11 + 32) |
| The whole unit suite | his PC, under the lock, on `be789fdc7` | 816 files, 14,116 pass, 20 skipped, 0 failed |
| `tsc -b`; `lint:changed` | his PC, on `0dc2e0dc8` | clean; no new finding |
| The build | his PC, on `0dc2e0dc8` (the build the re-walk drove) | passes |
| `e2e/doubletap-leavewar.spec.ts`, the phone project | his PC, on `be789fdc7` | 11 pass |
| GitHub's run of pull request 759 | GitHub | green on `a2b5ce4eb` — build, the original's 728, unit, browser, the Tracker's, the rule and document checks, with the last code commit `0dc2e0dc8` inside it; the run on the records' own push is read before the morning report |

## 14. The reads

| Read | Who | Report | Result |
|---|---|---|---|
| The finished code (`245dd9a4e`), blind | Astra (`codex exec`, high) | `docs/superpowers/briefs/2026-11-11-lw-doubletap-windows-read-astra.md` | one finding (P2, new): the event box closed without a tap arms the guard with an old press; a table of every window over the grid — six not covered, older |
| The same, blind to Astra | a fresh Opus reader | `…-read-opus.md` | F1 the windows not covered (older) — filed; F2 the same new fault, wider (a swipe begun on the box; any old press) — fixed; F3 a bit up while its window is not drawn (low, no harm found) — filed |
| The fix round (`245dd9a4e` → `be789fdc7`), handed only the fix and its findings | a second fresh Opus reader | `…-read2-opus.md` | nothing blocking; two notes — a touch cancelled on ANOTHER finger also forgot the press (one line, fixed red first, `0dc2e0dc8`); three of the fix round's added tests (the two hand-overs and the refused saves) pass whatever the fix does — they guard a future change, and are said so here |

The briefs: `…-builder-brief.md`, `…-walker-brief.md`, `…-read-brief.md`, `…-fix-brief.md`, `…-read2-brief.md`,
`…-rewalk-brief.md`. Reads owed: none.

## 15. What the walk and the reads found, and each disposition

| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | Astra (1), the Opus read (F2) | The event box closed without a tap — Escape, a scroll, a resize, a pinch, a swipe begun on it — or any window gone without a press, armed the guard with an old press: the next real tap on a day near that spot within 600 ms did nothing. New in this change | **FIXED**, red first (`c67c12261`, `be789fdc7`): the remembered press carries a time, a cancelled touch forgets it, the guard is armed only by a press inside a window less than a second old; the box's own closes without a tap forget the press. Walked after it: R1 (a swipe three times, a pinch, Escape on a touch laptop) — the next tap opens the day; R2 — the guard still guards. The narrow read: nothing blocking |
| 2 | Both reads | Six more windows over the grid are not seen by the guard (their open state lives outside the grid's file) | older, not made worse — **FILED**, `[LW-DOUBLETAP-MORE-WINDOWS]`; the comment that said "every other window" corrected to the eight |
| 3 | The walk (W1), the Opus read (in passing) | On a phone a double tap on the event box's Edit opens the event window and the second tap, landing beside it, closes it at once | older (every window closes on a tap beside it; the same on `main` — the host read the closing code, unchanged by this branch) — **FILED** with 2 |
| 4 | Astra (tests) | The browser test's "nothing opened" list named a window id that does not exist (`sel-sheet`) and left out seven of the one-day family | **FIXED** in the test (`be789fdc7`) |
| 5 | Both reads (tests) | No test for: two windows up and one closing; a hand-over; a failed save | **ADDED** — six cases, green before and after |
| 6 | The Opus read (F3) | A window's bit can be up while it is not drawn | no harm found — **FILED** with 2 |
| 7 | The walk (W1) | The Events list's ✕ stands over the bell: the second tap opens the bell's list | known from the build — **put to him** (question 1), recommended: leave it |
| 8 | The walk (W2d) | The event window closed by a tap beside it, the same spot again opens that day; ⚙ Settings does not close by a tap beside it | as built on 6 Nov — **put to him** (question 2), recommended: keep it |
| 9 | The walk (W1) | The counter's Delete leaves Undo's name unchanged ("a Leave War setting"), so "Undo gained nothing extra" could not be told from the name alone | not a fault found — the walker's limit, said here |
| 10 | The narrow read (note 1) | A touch the browser cancels on another finger forgot the remembered press, so a ✕ tapped by a second finger went unguarded (rare) | **FIXED**, red first (`0dc2e0dc8`) |
| 11 | The re-walk (R4b) | The person window's leave line tapped twice: the window closes and nothing opens | as hoped — no fault |
| 12 | The re-walk (R5) | Cancel on the ＋ Counter form leaves ⚙ Settings closed too | as built — Settings hands over to the form; not a fault |
| 13 | The re-walk (R5) | One crash of the browser tab under load at the last step of a desktop script | not reproduced in two re-runs — recorded (§11) |

## 16. `Walk:` line

`Walk: docs/handpass/2026-11-11-lw-doubletap-windows.md · 281 pictures · 10 surfaces · 82 orders · MISSING: 1, older — six more windows the guard does not see go, filed [LW-DOUBLETAP-MORE-WINDOWS]`
